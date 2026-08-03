'use client';

import { Clock, Eye, MessageSquare, Receipt, Smartphone, UtensilsCrossed, Globe } from 'lucide-react';
import type { MenuItem, Order } from '@/types';
import { ACTIVE_ORDER_STATUSES, formatCurrency, ORDER_STATUS_META, timeAgo } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const SOURCE_ICONS: Record<string, typeof Smartphone> = {
  whatsapp: MessageSquare,
  web: Globe,
  pos: UtensilsCrossed,
  hub: UtensilsCrossed,
};

interface OrderCardProps {
  order: Order;
  menuById?: Map<number, MenuItem>;
  tableNumber?: number | null;
  onView?: (order: Order) => void;
  onClose?: (order: Order) => void;
}

export function OrderCard({ order, menuById, tableNumber, onView, onClose }: OrderCardProps) {
  const statusMeta = ORDER_STATUS_META[order.status] ?? ORDER_STATUS_META.pending;
  const isActive = ACTIVE_ORDER_STATUSES.includes(order.status);
  const itemCount = order.items.reduce((acc, i) => acc + i.quantity, 0);
  const SourceIcon = SOURCE_ICONS[order.source ?? 'pos'] ?? UtensilsCrossed;

  const preview = order.items.slice(0, 3).map((item) => {
    const name = menuById?.get(item.menu_item_id)?.name ?? `Item #${item.menu_item_id}`;
    return `${item.quantity}× ${name}`;
  });

  return (
    <Card className="transition-colors hover:border-primary/30">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate font-semibold">{order.order_number}</p>
              <SourceIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-label={order.source ?? 'pos'} />
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {timeAgo(order.created_at)}
              </span>
              {tableNumber !== null && tableNumber !== undefined && <span>· Table {tableNumber}</span>}
              {order.table_id && tableNumber === undefined && <span>· Table #{order.table_id}</span>}
            </div>
          </div>
          <Badge variant="outline" className={statusMeta.className}>
            {statusMeta.label}
          </Badge>
        </div>

        {preview.length > 0 && (
          <ul className="mt-3 space-y-0.5 text-xs text-muted-foreground">
            {preview.map((line, i) => (
              <li key={i} className="truncate">
                {line}
              </li>
            ))}
            {order.items.length > 3 && <li>+ {order.items.length - 3} more…</li>}
          </ul>
        )}

        <div className="mt-3 flex items-center justify-between border-t pt-3">
          <div className="flex items-center gap-1.5">
            <Receipt className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm font-bold tabular-nums">{formatCurrency(order.total)}</span>
            <span className="text-xs text-muted-foreground">({itemCount} items)</span>
          </div>
          <div className="flex items-center gap-1.5">
            {onView && (
              <Button variant="ghost" size="sm" onClick={() => onView(order)}>
                <Eye className="h-3.5 w-3.5" />
                View
              </Button>
            )}
            {onClose && isActive && (
              <Button variant="outline" size="sm" onClick={() => onClose(order)}>
                Close
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
