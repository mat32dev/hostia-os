'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, Minus, Plus, ShoppingBag, X } from 'lucide-react';
import { posApi, useMenu, useOrders, useTables } from '@/lib/api';
import type { MenuItem, Order, OrderCreate, RestaurantTable } from '@/types';
import {
  ACTIVE_ORDER_STATUSES,
  formatCurrency,
  formatDateTime,
  ORDER_STATUS_META,
  PAYMENT_METHOD_LABELS,
  timeAgo,
} from '@/lib/utils';
import { OrderCard } from '@/components/OrderCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/state';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

// ─── New order dialog ────────────────────────────────────────────────────────
interface OrderLine {
  menu_item_id: number | null;
  quantity: number;
  notes: string;
}

const TAX_RATE = 0.1; // matches POS backend (10% IVA)

interface CreateOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  menuItems: MenuItem[];
  tables: RestaurantTable[];
  presetTableId?: number | null;
  onSubmit: (payload: OrderCreate) => Promise<void>;
}

function CreateOrderDialog({
  open,
  onOpenChange,
  menuItems,
  tables,
  presetTableId,
  onSubmit,
}: CreateOrderDialogProps) {
  const [tableId, setTableId] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<OrderLine[]>([{ menu_item_id: null, quantity: 1, notes: '' }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTableId(presetTableId ?? null);
      setNotes('');
      setLines([{ menu_item_id: null, quantity: 1, notes: '' }]);
      setError(null);
    }
  }, [open, presetTableId]);

  const availableItems = useMemo(
    () => menuItems.filter((i) => i.is_available),
    [menuItems],
  );

  const setLine = (index: number, patch: Partial<OrderLine>) =>
    setLines((ls) => ls.map((l, i) => (i === index ? { ...l, ...patch } : l)));

  const addLine = () => setLines((ls) => [...ls, { menu_item_id: null, quantity: 1, notes: '' }]);
  const removeLine = (index: number) => setLines((ls) => ls.filter((_, i) => i !== index));

  const validLines = lines.filter((l) => l.menu_item_id !== null && l.quantity > 0);
  const subtotal = validLines.reduce((acc, l) => {
    const item = availableItems.find((i) => i.id === l.menu_item_id);
    return acc + (item ? item.price * l.quantity : 0);
  }, 0);
  const tax = subtotal * TAX_RATE;

  const handleSubmit = async () => {
    if (validLines.length === 0 || saving) return;
    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        table_id: tableId,
        notes: notes.trim() || null,
        source: 'hub',
        items: validLines.map((l) => {
          const item = availableItems.find((i) => i.id === l.menu_item_id);
          return {
            menu_item_id: l.menu_item_id as number,
            quantity: l.quantity,
            unit_price: item?.price ?? 0,
            notes: l.notes.trim() || null,
          };
        }),
      });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create the order');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>New order</DialogTitle>
          <DialogDescription>
            Build the order and send it to the kitchen. The table is marked occupied automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Table</Label>
              <Select
                value={tableId !== null ? String(tableId) : 'none'}
                onValueChange={(v) => setTableId(v === 'none' ? null : Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Takeaway / no table" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Takeaway / no table</SelectItem>
                  {[...tables]
                    .sort((a, b) => a.number - b.number)
                    .map((t) => (
                      <SelectItem key={t.id} value={String(t.id)}>
                        Table {t.number} ({t.zone})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="order-notes">Order notes</Label>
              <Input
                id="order-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Allergies, timing…"
              />
            </div>
          </div>

          {/* Lines */}
          <div className="space-y-2">
            <Label>Items</Label>
            {lines.map((line, index) => {
              const item = availableItems.find((i) => i.id === line.menu_item_id);
              return (
                <div key={index} className="flex items-center gap-2">
                  <Select
                    value={line.menu_item_id !== null ? String(line.menu_item_id) : ''}
                    onValueChange={(v) => setLine(index, { menu_item_id: Number(v) })}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select an item…" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableItems.map((i) => (
                        <SelectItem key={i.id} value={String(i.id)}>
                          {i.name} — {formatCurrency(i.price)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setLine(index, { quantity: Math.max(1, line.quantity - 1) })}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-7 text-center text-sm font-semibold tabular-nums">
                      {line.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setLine(index, { quantity: line.quantity + 1 })}
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <span className="w-20 text-right text-sm tabular-nums text-muted-foreground">
                    {item ? formatCurrency(item.price * line.quantity) : '—'}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-rose-400"
                    onClick={() => removeLine(index)}
                    disabled={lines.length === 1}
                    aria-label="Remove line"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
            <Button variant="outline" size="sm" onClick={addLine} className="mt-1">
              <Plus className="h-3.5 w-3.5" /> Add item
            </Button>
          </div>

          {/* Totals */}
          <div className="space-y-1 rounded-lg border bg-muted/30 p-3 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>IVA (10%)</span>
              <span className="tabular-nums">{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between border-t pt-1 text-base font-bold">
              <span>Total</span>
              <span className="tabular-nums">{formatCurrency(subtotal + tax)}</span>
            </div>
          </div>

          {error && (
            <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={validLines.length === 0 || saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Send order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Close-order confirmation ────────────────────────────────────────────────
interface CloseOrderDialogProps {
  order: Order | null;
  onCancel: () => void;
  onConfirm: (order: Order) => Promise<void>;
}

function CloseOrderDialog({ order, onCancel, onConfirm }: CloseOrderDialogProps) {
  const [closing, setClosing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    setClosing(false);
  }, [order]);

  const handleConfirm = async () => {
    if (!order || closing) return;
    setClosing(true);
    setError(null);
    try {
      await onConfirm(order);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to close the order');
      setClosing(false);
    }
  };

  return (
    <Dialog open={order !== null} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Close order {order?.order_number}?</DialogTitle>
          <DialogDescription>
            The order will be marked as paid ({order ? formatCurrency(order.total) : ''}) and the table
            will be freed. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
            {error}
          </p>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={closing}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={closing}>
            {closing && <Loader2 className="h-4 w-4 animate-spin" />}
            Close & mark paid
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Order detail dialog ─────────────────────────────────────────────────────
interface OrderDetailDialogProps {
  order: Order | null;
  menuById: Map<number, MenuItem>;
  tableById: Map<number, RestaurantTable>;
  onOpenChange: (open: boolean) => void;
  onCloseOrder: (order: Order) => void;
}

function OrderDetailDialog({
  order,
  menuById,
  tableById,
  onOpenChange,
  onCloseOrder,
}: OrderDetailDialogProps) {
  if (!order) return null;
  const meta = ORDER_STATUS_META[order.status];
  const isActive = ACTIVE_ORDER_STATUSES.includes(order.status);
  const table = order.table_id !== null ? tableById.get(order.table_id) : undefined;

  return (
    <Dialog open={order !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle>{order.order_number}</DialogTitle>
            <Badge variant="outline" className={meta.className}>
              {meta.label}
            </Badge>
          </div>
          <DialogDescription>
            Created {timeAgo(order.created_at)} ({formatDateTime(order.created_at)})
            {order.closed_at && ` · Closed ${formatDateTime(order.closed_at)}`}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div className="rounded-lg border p-2.5">
            <p className="text-xs text-muted-foreground">Table</p>
            <p className="font-medium">{table ? `Table ${table.number}` : order.table_id ? `#${order.table_id}` : 'Takeaway'}</p>
          </div>
          <div className="rounded-lg border p-2.5">
            <p className="text-xs text-muted-foreground">Source</p>
            <p className="font-medium capitalize">{order.source ?? 'pos'}</p>
          </div>
          <div className="rounded-lg border p-2.5">
            <p className="text-xs text-muted-foreground">Payment</p>
            <p className="font-medium">
              {order.payment_method ? PAYMENT_METHOD_LABELS[order.payment_method] ?? order.payment_method : '—'}
            </p>
          </div>
          <div className="rounded-lg border p-2.5">
            <p className="text-xs text-muted-foreground">Payment status</p>
            <p className="font-medium capitalize">{order.payment_status}</p>
          </div>
        </div>

        {/* Items */}
        <div className="rounded-lg border">
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 border-b px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <span>Item</span>
            <span className="w-12 text-right">Qty</span>
            <span className="w-16 text-right">Unit</span>
            <span className="w-20 text-right">Total</span>
          </div>
          <div className="max-h-56 divide-y overflow-y-auto scrollbar-thin">
            {order.items.map((item) => (
              <div key={item.id} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2 px-3 py-2 text-sm">
                <span className="min-w-0">
                  <span className="block truncate">
                    {menuById.get(item.menu_item_id)?.name ?? `Item #${item.menu_item_id}`}
                  </span>
                  {item.notes && <span className="block truncate text-xs text-muted-foreground">{item.notes}</span>}
                </span>
                <span className="w-12 text-right tabular-nums">{item.quantity}</span>
                <span className="w-16 text-right tabular-nums text-muted-foreground">
                  {formatCurrency(item.unit_price)}
                </span>
                <span className="w-20 text-right tabular-nums">{formatCurrency(item.total_price)}</span>
              </div>
            ))}
          </div>
          <div className="space-y-1 border-t px-3 py-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>IVA</span>
              <span className="tabular-nums">{formatCurrency(order.tax)}</span>
            </div>
            <div className="flex justify-between text-base font-bold">
              <span>Total</span>
              <span className="tabular-nums">{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>

        {order.notes && (
          <p className="rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Notes:</span> {order.notes}
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {isActive && (
            <Button onClick={() => onCloseOrder(order)}>
              Close order & mark paid
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
type OrdersTab = 'all' | 'active' | 'paid' | 'cancelled';

function OrdersPageInner() {
  const searchParams = useSearchParams();
  const ordersSwr = useOrders(8000);
  const menuSwr = useMenu();
  const tablesSwr = useTables();

  const [tab, setTab] = useState<OrdersTab>('all');
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [presetTableId, setPresetTableId] = useState<number | null>(null);
  const [selected, setSelected] = useState<Order | null>(null);
  const [orderToClose, setOrderToClose] = useState<Order | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Deep link: /orders?new=1&table=5 opens the create dialog with a preselected table.
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      const table = searchParams.get('table');
      setPresetTableId(table ? Number(table) : null);
      setCreateOpen(true);
    }
  }, [searchParams]);

  const orders = useMemo(() => ordersSwr.data ?? [], [ordersSwr.data]);
  const menuById = useMemo(() => {
    const map = new Map<number, MenuItem>();
    for (const item of menuSwr.data?.items ?? []) map.set(item.id, item);
    return map;
  }, [menuSwr.data]);
  const tableById = useMemo(() => {
    const map = new Map<number, RestaurantTable>();
    for (const t of tablesSwr.data ?? []) map.set(t.id, t);
    return map;
  }, [tablesSwr.data]);

  const counts = useMemo(
    () => ({
      all: orders.length,
      active: orders.filter((o) => ACTIVE_ORDER_STATUSES.includes(o.status)).length,
      paid: orders.filter((o) => o.status === 'paid').length,
      cancelled: orders.filter((o) => o.status === 'cancelled').length,
    }),
    [orders],
  );

  const filtered = useMemo(() => {
    let list = orders;
    if (tab === 'active') list = list.filter((o) => ACTIVE_ORDER_STATUSES.includes(o.status));
    else if (tab !== 'all') list = list.filter((o) => o.status === tab);

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (o) =>
          o.order_number.toLowerCase().includes(q) ||
          o.items.some((i) => menuById.get(i.menu_item_id)?.name.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [orders, tab, search, menuById]);

  const handleCreate = async (payload: OrderCreate) => {
    await posApi.createOrder(payload);
    await ordersSwr.mutate();
    await tablesSwr.mutate();
    setFeedback(`Order created successfully.`);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleCloseOrder = async (order: Order) => {
    await posApi.closeOrder(order.id);
    await ordersSwr.mutate();
    await tablesSwr.mutate();
    setOrderToClose(null);
    setSelected(null);
    setFeedback(`Order ${order.order_number} closed and marked as paid.`);
    setTimeout(() => setFeedback(null), 4000);
  };

  if (ordersSwr.error) {
    return (
      <ErrorState
        message={ordersSwr.error.message}
        onRetry={() => ordersSwr.mutate()}
      />
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={tab} onValueChange={(v) => setTab(v as OrdersTab)}>
          <TabsList>
            <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
            <TabsTrigger value="active">Active ({counts.active})</TabsTrigger>
            <TabsTrigger value="paid">Paid ({counts.paid})</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled ({counts.cancelled})</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order # or item…"
            className="w-full sm:w-56"
          />
          <Button
            onClick={() => {
              setPresetTableId(null);
              setCreateOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> New order
          </Button>
        </div>
      </div>

      {feedback && (
        <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
          {feedback}
        </p>
      )}

      {/* Orders grid */}
      {ordersSwr.isLoading ? (
        <LoadingState label="Loading orders…" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title={tab === 'all' ? 'No orders yet' : `No ${tab} orders`}
          message={
            tab === 'all'
              ? 'Create your first order to get started.'
              : 'Orders matching this filter will appear here.'
          }
          action={
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" /> New order
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              menuById={menuById}
              tableNumber={order.table_id !== null ? tableById.get(order.table_id)?.number ?? null : null}
              onView={setSelected}
              onClose={setOrderToClose}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <CreateOrderDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        menuItems={menuSwr.data?.items ?? []}
        tables={tablesSwr.data ?? []}
        presetTableId={presetTableId}
        onSubmit={handleCreate}
      />
      <OrderDetailDialog
        order={selected}
        menuById={menuById}
        tableById={tableById}
        onOpenChange={(open) => !open && setSelected(null)}
        onCloseOrder={(order) => {
          setSelected(null);
          setOrderToClose(order);
        }}
      />
      <CloseOrderDialog
        order={orderToClose}
        onCancel={() => setOrderToClose(null)}
        onConfirm={handleCloseOrder}
      />
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<LoadingState label="Loading orders…" />}>
      <OrdersPageInner />
    </Suspense>
  );
}
