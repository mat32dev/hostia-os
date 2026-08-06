'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutGrid, Loader2, Pencil, Plus, Trash2, Users } from 'lucide-react';
import { posApi, useMenu, useOrders, useTables } from '@/lib/api';
import type { MenuItem, Order, RestaurantTable } from '@/types';
import {
  ACTIVE_ORDER_STATUSES,
  cn,
  elapsedMinutes,
  formatCurrency,
  ORDER_STATUS_META,
  TABLE_STATUS_META,
  timeAgo,
  ZONE_LABELS,
} from '@/lib/utils';
import { TableFormDialog } from '@/components/TableFormDialog';
import { TableMap } from '@/components/TableMap';
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
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/state';

function TableDetailDialog({
  table,
  orders,
  menuById,
  onClose,
  onOrderClosed,
  onEdit,
  onDeleted,
}: {
  table: RestaurantTable | null;
  orders: Order[];
  menuById: Map<number, MenuItem>;
  onClose: () => void;
  onOrderClosed: () => Promise<void>;
  onEdit: (table: RestaurantTable) => void;
  onDeleted: () => Promise<void>;
}) {
  const router = useRouter();
  const [closingId, setClosingId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!table) return null;
  const meta = TABLE_STATUS_META[table.status] ?? TABLE_STATUS_META.free;
  const activeOrders = orders.filter(
    (o) => o.table_id === table.id && ACTIVE_ORDER_STATUSES.includes(o.status),
  );

  const handleCloseOrder = async (order: Order) => {
    if (closingId !== null) return;
    setClosingId(order.id);
    setError(null);
    try {
      await posApi.closeOrder(order.id);
      await onOrderClosed();
      if (activeOrders.length <= 1) onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to close the order');
    } finally {
      setClosingId(null);
    }
  };

  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    setError(null);
    try {
      await posApi.deleteTable(table.id);
      await onDeleted();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete the table');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <Dialog open={table !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle>Table {table.number}</DialogTitle>
            <Badge variant="outline" className="text-muted-foreground">
              <span className={cn('mr-1.5 h-2 w-2 rounded-full', meta.dot)} />
              {meta.label}
            </Badge>
          </div>
          <DialogDescription>
            {ZONE_LABELS[table.zone] ?? table.zone} · {table.capacity} seats
          </DialogDescription>
        </DialogHeader>

        {activeOrders.length === 0 ? (
          <div className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
            No active order on this table.
          </div>
        ) : (
          <div className="space-y-3">
            {activeOrders.map((order) => {
              const statusMeta = ORDER_STATUS_META[order.status];
              const minutes = elapsedMinutes(order.created_at);
              return (
                <div key={order.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{order.order_number}</p>
                      <Badge variant="outline" className={statusMeta.className}>
                        {statusMeta.label}
                      </Badge>
                    </div>
                    <p className="text-sm font-bold tabular-nums">{formatCurrency(order.total)}</p>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Opened {timeAgo(order.created_at)} · {minutes < 60 ? `${minutes}m` : `${Math.floor(minutes / 60)}h ${minutes % 60}m`} elapsed
                  </p>
                  <ul className="mt-2 space-y-0.5 text-xs text-muted-foreground">
                    {order.items.map((item) => (
                      <li key={item.id} className="flex justify-between">
                        <span className="truncate">
                          {item.quantity}× {menuById.get(item.menu_item_id)?.name ?? `Item #${item.menu_item_id}`}
                        </span>
                        <span className="tabular-nums">{formatCurrency(item.total_price)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCloseOrder(order)}
                      disabled={closingId !== null}
                    >
                      {closingId === order.id && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      Close & mark paid
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {error && (
          <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
            {error}
          </p>
        )}

        <DialogFooter>
          <div className="flex w-full items-center justify-between">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onEdit(table)}>
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(true)}>
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button onClick={() => router.push(`/orders?new=1&table=${table.id}`)}>
                <Plus className="h-4 w-4" /> New order
              </Button>
            </div>
          </div>
        </DialogFooter>

        {/* Delete confirmation */}
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Delete Table #{table.number}?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. The table will be permanently removed.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} disabled={deleting}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}

export default function TablesPage() {
  const tablesSwr = useTables(5000);
  const ordersSwr = useOrders(5000);
  const [selected, setSelected] = useState<RestaurantTable | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<RestaurantTable | null>(null);
  const { data: menuData } = useMenu();

  const tables = useMemo(() => tablesSwr.data ?? [], [tablesSwr.data]);
  const orders = useMemo(() => ordersSwr.data ?? [], [ordersSwr.data]);
  const menuById = useMemo(() => {
    const map = new Map<number, MenuItem>();
    for (const item of menuData?.items ?? []) map.set(item.id, item);
    return map;
  }, [menuData]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { free: 0, occupied: 0, reserved: 0, cleaning: 0 };
    for (const t of tables) counts[t.status] = (counts[t.status] ?? 0) + 1;
    return counts;
  }, [tables]);

  const refresh = async () => {
    await Promise.all([tablesSwr.mutate(), ordersSwr.mutate()]);
  };

  const handleCreateTable = async (values: { number: number; capacity: number; zone: string }) => {
    await posApi.createTable(values);
    await refresh();
  };

  const handleUpdateTable = async (values: { number: number; capacity: number; zone: string }) => {
    if (!editingTable) return;
    await posApi.updateTable(editingTable.id, values);
    await refresh();
    setSelected(null);
  };

  const handleEditTable = (table: RestaurantTable) => {
    setSelected(null);
    setEditingTable(table);
    setFormOpen(true);
  };

  const handleFormOpenChange = (open: boolean) => {
    setFormOpen(open);
    if (!open) setEditingTable(null);
  };

  if (tablesSwr.error) {
    return <ErrorState message={tablesSwr.error.message} onRetry={() => tablesSwr.mutate()} />;
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Status summary + Add button */}
      <div className="flex flex-wrap items-center gap-2">
        {(Object.keys(TABLE_STATUS_META) as Array<keyof typeof TABLE_STATUS_META>).map((status) => (
          <span
            key={status}
            className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm"
          >
            <span className={cn('h-2 w-2 rounded-full', TABLE_STATUS_META[status].dot)} />
            {TABLE_STATUS_META[status].label}
            <span className="font-semibold tabular-nums">{statusCounts[status] ?? 0}</span>
          </span>
        ))}
        <span className="ml-auto inline-flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            {tables.reduce((acc, t) => acc + t.capacity, 0)} total seats
          </span>
          <Button size="sm" onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" /> Add table
          </Button>
        </span>
      </div>

      {tablesSwr.isLoading ? (
        <LoadingState label="Loading floor map…" />
      ) : tables.length === 0 ? (
        <EmptyState
          icon={LayoutGrid}
          title="No tables configured"
          message="Click 'Add table' to create your first table."
        />
      ) : (
        <TableMap tables={tables} orders={orders} onSelect={setSelected} />
      )}

      <TableDetailDialog
        table={selected}
        orders={orders}
        menuById={menuById}
        onClose={() => setSelected(null)}
        onOrderClosed={refresh}
        onEdit={handleEditTable}
        onDeleted={refresh}
      />

      <TableFormDialog
        open={formOpen}
        onOpenChange={handleFormOpenChange}
        table={editingTable}
        onSubmit={editingTable ? handleUpdateTable : handleCreateTable}
      />
    </div>
  );
}
