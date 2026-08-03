'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Euro,
  LayoutGrid,
  MessageCircle,
  ShieldAlert,
  ShoppingBag,
} from 'lucide-react';
import { useAlerts, useConversations, useMenu, useOrders, useTables } from '@/lib/api';
import { peakHours, revenueByDay, revenueOrders, summarize, topItems } from '@/lib/reports';
import {
  cn,
  formatCurrency,
  isToday,
  isYesterday,
  ORDER_STATUS_META,
  pctChange,
  TABLE_STATUS_META,
  timeAgo,
} from '@/lib/utils';
import { AreaChartWidget, BarChartWidget } from '@/components/Chart';
import { KPICard } from '@/components/KPICard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CardSkeletonGrid, EmptyState, ErrorState, LoadingState } from '@/components/ui/state';

export default function OverviewPage() {
  const router = useRouter();
  const ordersSwr = useOrders(10000);
  const alertsSwr = useAlerts('open', 10000);
  const conversationsSwr = useConversations(10000);
  const tablesSwr = useTables(10000);
  const menuSwr = useMenu();

  const orders = useMemo(() => ordersSwr.data ?? [], [ordersSwr.data]);
  const openAlerts = alertsSwr.data ?? [];
  const conversations = conversationsSwr.data ?? [];
  const tables = tablesSwr.data ?? [];

  const menuById = useMemo(() => {
    const map = new Map();
    for (const item of menuSwr.data?.items ?? []) map.set(item.id, item);
    return map;
  }, [menuSwr.data]);

  // ── KPI computations ──
  const todayOrders = orders.filter((o) => isToday(o.created_at));
  const yesterdayOrders = orders.filter((o) => isYesterday(o.created_at));
  const todaySummary = summarize(todayOrders);
  const yesterdaySummary = summarize(yesterdayOrders);
  const revenueDelta = pctChange(todaySummary.revenue, yesterdaySummary.revenue);
  const ordersDelta = pctChange(todaySummary.count, yesterdaySummary.count);

  const criticalAlerts = openAlerts.filter(
    (a) => a.severity === 'critical' || a.severity === 'high',
  ).length;
  const activeConversations = conversations.filter((c) => c.status === 'active').length;
  const unreadMessages = conversations.reduce((acc, c) => acc + (c.unread_count ?? 0), 0);

  const occupiedTables = tables.filter((t) => t.status === 'occupied').length;

  // ── Charts ──
  const weekSeries = revenueByDay(orders, 7);
  const hoursToday = peakHours(todayOrders);
  const weekOrders = revenueOrders(orders).filter((o) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    return new Date(o.created_at) >= cutoff;
  });
  const top = topItems(weekOrders, menuById, 5);
  const maxTopQty = Math.max(1, ...top.map((t) => t.quantity));

  const recentOrders = orders.slice(0, 6);
  const previewAlerts = openAlerts.slice(0, 3);

  if (ordersSwr.error) {
    return (
      <ErrorState
        message={ordersSwr.error.message}
        onRetry={() => ordersSwr.mutate()}
        action={
          <Button variant="outline" size="sm" asChild>
            <Link href="/settings?tab=account">Go to sign in</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── KPI row ── */}
      {ordersSwr.isLoading ? (
        <CardSkeletonGrid count={4} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KPICard
            title="Revenue today"
            value={formatCurrency(todaySummary.revenue)}
            icon={Euro}
            accent="amber"
            delta={revenueDelta}
          />
          <KPICard
            title="Orders today"
            value={String(todaySummary.count)}
            icon={ShoppingBag}
            accent="sky"
            delta={ordersDelta}
            hint={todaySummary.cancelled > 0 ? `${todaySummary.cancelled} cancelled` : undefined}
          />
          <KPICard
            title="Open alerts"
            value={String(openAlerts.length)}
            icon={ShieldAlert}
            accent="rose"
            hint={criticalAlerts > 0 ? `${criticalAlerts} high/critical` : 'All clear'}
          />
          <KPICard
            title="Conversations"
            value={String(conversationsSwr.error ? 0 : activeConversations)}
            icon={MessageCircle}
            accent="emerald"
            hint={unreadMessages > 0 ? `${unreadMessages} unread` : 'WhatsApp'}
          />
        </div>
      )}

      {/* ── Revenue chart + floor snapshot ── */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Revenue — last 7 days</CardTitle>
              <CardDescription>All non-cancelled orders</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/reports">
                Reports <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {ordersSwr.isLoading ? (
              <LoadingState label="Loading revenue…" />
            ) : (
              <AreaChartWidget
                data={weekSeries}
                xKey="label"
                yKey="revenue"
                color="#f59e0b"
                height={240}
                valueFormatter={(v) => formatCurrency(v)}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Floor right now</CardTitle>
              <CardDescription>
                {occupiedTables} of {tables.length} tables occupied
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/tables">
                <LayoutGrid className="h-3.5 w-3.5" /> Map
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {tables.length === 0 && !tablesSwr.isLoading ? (
              <p className="text-sm text-muted-foreground">No tables configured yet.</p>
            ) : (
              (Object.keys(TABLE_STATUS_META) as Array<keyof typeof TABLE_STATUS_META>).map((status) => {
                const count = tables.filter((t) => t.status === status).length;
                const pct = tables.length ? (count / tables.length) * 100 : 0;
                return (
                  <div key={status} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <span className={cn('h-2 w-2 rounded-full', TABLE_STATUS_META[status].dot)} />
                        {TABLE_STATUS_META[status].label}
                      </span>
                      <span className="font-medium tabular-nums">{count}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn('h-full rounded-full', TABLE_STATUS_META[status].dot)}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Peak hours + top items + alerts ── */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Peak hours today</CardTitle>
            <CardDescription>Orders per hour</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChartWidget data={hoursToday} xKey="label" yKey="orders" color="#38bdf8" height={220} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top sellers — 7 days</CardTitle>
            <CardDescription>By units sold</CardDescription>
          </CardHeader>
          <CardContent>
            {top.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No sales recorded in the last 7 days.
              </p>
            ) : (
              <ul className="space-y-3">
                {top.map((item, i) => (
                  <li key={item.menu_item_id}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="truncate">
                        <span className="mr-2 text-xs text-muted-foreground">{i + 1}.</span>
                        {item.name}
                      </span>
                      <span className="ml-2 shrink-0 text-xs tabular-nums text-muted-foreground">
                        {item.quantity} u · {formatCurrency(item.revenue)}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${(item.quantity / maxTopQty) * 100}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Guard alerts</CardTitle>
              <CardDescription>Pending review</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/alerts">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {alertsSwr.error ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Guard service unavailable.
              </p>
            ) : previewAlerts.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <ShieldAlert className="h-6 w-6 text-emerald-400" />
                <p className="text-sm text-muted-foreground">No open alerts. Everything looks clean.</p>
              </div>
            ) : (
              previewAlerts.map((alert) => (
                <Link key={alert.id} href="/alerts" className="block rounded-lg border p-3 transition-colors hover:border-primary/30">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">{alert.title}</p>
                    <Badge variant="outline" className="shrink-0 text-xs">
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{timeAgo(alert.timestamp || alert.created_at)}</p>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Recent orders ── */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Recent orders</CardTitle>
            <CardDescription>Latest activity across all channels</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/orders">
              All orders <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 && !ordersSwr.isLoading ? (
            <EmptyState
              icon={ShoppingBag}
              title="No orders yet"
              message="Orders created from the POS, WhatsApp or this dashboard will appear here."
              action={
                <Button size="sm" onClick={() => router.push('/orders?new=1')}>
                  Create first order
                </Button>
              }
            />
          ) : (
            <div className="divide-y">
              {recentOrders.map((order) => {
                const meta = ORDER_STATUS_META[order.status];
                return (
                  <button
                    key={order.id}
                    onClick={() => router.push('/orders')}
                    className="flex w-full items-center gap-3 py-3 text-left transition-colors hover:bg-accent/40"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{order.order_number}</span>
                      <span className="text-xs text-muted-foreground">
                        {timeAgo(order.created_at)}
                        {order.table_id ? ` · Table #${order.table_id}` : ' · Takeaway'}
                      </span>
                    </span>
                    <Badge variant="outline" className={cn('hidden sm:inline-flex', meta.className)}>
                      {meta.label}
                    </Badge>
                    <span className="text-sm font-semibold tabular-nums">{formatCurrency(order.total)}</span>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
