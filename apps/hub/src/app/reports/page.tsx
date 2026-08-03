'use client';

import { useMemo, useState } from 'react';
import { Download, Euro, Receipt, ShieldAlert, ShoppingBag, TrendingUp } from 'lucide-react';
import { useGuardReport, useMenu, useOrders } from '@/lib/api';
import {
  filterOrdersByRange,
  paymentBreakdown,
  peakHours,
  RANGE_LABELS,
  rangeDates,
  revenueByDay,
  revenueByHour,
  summarize,
  topItems,
  type RangeKey,
} from '@/lib/reports';
import type { MenuItem } from '@/types';
import { downloadCsv, formatCurrency, PAYMENT_METHOD_LABELS, toApiDateString } from '@/lib/utils';
import { AreaChartWidget, BarChartWidget, PieChartWidget } from '@/components/Chart';
import { KPICard } from '@/components/KPICard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CardSkeletonGrid, EmptyState, ErrorState, LoadingState } from '@/components/ui/state';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ReportsPage() {
  const ordersSwr = useOrders(30000);
  const menuSwr = useMenu();
  const [range, setRange] = useState<RangeKey>('7d');

  const { from, to, days } = rangeDates(range);
  const orders = useMemo(() => ordersSwr.data ?? [], [ordersSwr.data]);

  const menuById = useMemo(() => {
    const map = new Map<number, MenuItem>();
    for (const item of menuSwr.data?.items ?? []) map.set(item.id, item);
    return map;
  }, [menuSwr.data]);

  const inRange = useMemo(() => filterOrdersByRange(orders, from, to), [orders, from, to]);
  const summary = useMemo(() => summarize(inRange), [inRange]);

  const series = useMemo(
    () => (days === 1 ? revenueByHour(inRange) : revenueByDay(inRange, days)),
    [inRange, days],
  );
  const top = useMemo(() => topItems(inRange, menuById, 8), [inRange, menuById]);
  const hours = useMemo(() => peakHours(inRange), [inRange]);
  const payments = useMemo(
    () =>
      paymentBreakdown(inRange).map((p) => ({
        ...p,
        method: PAYMENT_METHOD_LABELS[p.method] ?? p.method,
      })),
    [inRange],
  );

  // Guard daily report is only meaningful for a single date.
  const guardDate = range === 'today' || range === 'yesterday' ? toApiDateString(from) : null;
  const guardSwr = useGuardReport(guardDate);

  const handleExport = () => {
    downloadCsv(
      `hostia-orders-${toApiDateString(from)}_${toApiDateString(to)}.csv`,
      ['Order number', 'Date', 'Table', 'Status', 'Payment', 'Subtotal', 'IVA', 'Total'],
      inRange.map((o) => [
        o.order_number,
        o.created_at,
        o.table_id ?? 'takeaway',
        o.status,
        o.payment_method ?? '',
        o.subtotal.toFixed(2),
        o.tax.toFixed(2),
        o.total.toFixed(2),
      ]),
    );
  };

  if (ordersSwr.error) {
    return <ErrorState message={ordersSwr.error.message} onRetry={() => ordersSwr.mutate()} />;
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={range} onValueChange={(v) => setRange(v as RangeKey)}>
          <TabsList>
            {(Object.keys(RANGE_LABELS) as RangeKey[]).map((key) => (
              <TabsTrigger key={key} value={key}>
                {RANGE_LABELS[key]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Button variant="outline" onClick={handleExport} disabled={inRange.length === 0}>
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      {/* KPIs */}
      {ordersSwr.isLoading ? (
        <CardSkeletonGrid count={4} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KPICard title="Revenue" value={formatCurrency(summary.revenue)} icon={Euro} accent="amber" hint={RANGE_LABELS[range]} />
          <KPICard
            title="Orders"
            value={String(summary.count)}
            icon={ShoppingBag}
            accent="sky"
            hint={summary.cancelled > 0 ? `${summary.cancelled} cancelled` : undefined}
          />
          <KPICard title="Avg. ticket" value={formatCurrency(summary.avgTicket)} icon={TrendingUp} accent="emerald" />
          <KPICard title="IVA collected" value={formatCurrency(summary.tax)} icon={Receipt} accent="violet" />
        </div>
      )}

      {/* Revenue chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue — {RANGE_LABELS[range].toLowerCase()}</CardTitle>
          <CardDescription>{days === 1 ? 'Hourly breakdown' : 'Daily breakdown'} (non-cancelled orders)</CardDescription>
        </CardHeader>
        <CardContent>
          {ordersSwr.isLoading ? (
            <LoadingState label="Crunching numbers…" />
          ) : inRange.length === 0 ? (
            <EmptyState
              icon={TrendingUp}
              title="No data for this period"
              message="Orders recorded in this range will generate the revenue chart."
            />
          ) : (
            <AreaChartWidget
              data={series}
              xKey="label"
              yKey="revenue"
              color="#f59e0b"
              height={280}
              valueFormatter={(v) => formatCurrency(v)}
            />
          )}
        </CardContent>
      </Card>

      {/* Top items + payments */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top selling items</CardTitle>
            <CardDescription>Units sold in the period</CardDescription>
          </CardHeader>
          <CardContent>
            {top.length === 0 ? (
              <EmptyState icon={ShoppingBag} title="No sales" message="No items sold in this range." />
            ) : (
              <BarChartWidget
                data={top.map((t) => ({ name: t.name, quantity: t.quantity }))}
                xKey="name"
                yKey="quantity"
                color="#34d399"
                height={Math.max(200, top.length * 36)}
                horizontal
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment methods</CardTitle>
            <CardDescription>Share of revenue per method</CardDescription>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <EmptyState
                icon={Receipt}
                title="No payments recorded"
                message="Orders closed with a payment method will be charted here."
              />
            ) : (
              <PieChartWidget
                data={payments}
                nameKey="method"
                valueKey="amount"
                valueFormatter={(v) => formatCurrency(v)}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Peak hours + Guard */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Peak hours</CardTitle>
            <CardDescription>Orders per hour — {RANGE_LABELS[range].toLowerCase()}</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChartWidget data={hours} xKey="label" yKey="orders" color="#38bdf8" height={220} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-primary" /> Guard daily report
            </CardTitle>
            <CardDescription>
              {guardDate
                ? `Camera analysis for ${guardDate}`
                : 'Select “Today” or “Yesterday” to load the Guard camera report'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!guardDate ? (
              <EmptyState
                icon={ShieldAlert}
                title="No single date selected"
                message="Guard produces per-day reports. Pick Today or Yesterday above."
              />
            ) : guardSwr.isLoading ? (
              <LoadingState label="Loading Guard report…" />
            ) : guardSwr.error ? (
              <EmptyState
                icon={ShieldAlert}
                title="Guard report unavailable"
                message={guardSwr.error.message}
              />
            ) : guardSwr.data ? (
              <dl className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Frames analyzed', value: guardSwr.data.total_frames_analyzed.toLocaleString() },
                  { label: 'Suspicious activities', value: String(guardSwr.data.suspicious_activities) },
                  { label: 'Payments matched', value: String(guardSwr.data.expected_payments_matched) },
                  { label: 'Discrepancies', value: String(guardSwr.data.discrepancies) },
                ].map((row) => (
                  <div key={row.label} className="rounded-lg border p-3">
                    <dt className="text-xs text-muted-foreground">{row.label}</dt>
                    <dd className="mt-1 text-xl font-bold tabular-nums">{row.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
