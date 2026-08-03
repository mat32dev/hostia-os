'use client';

import { Clock, Users } from 'lucide-react';
import type { Order, RestaurantTable } from '@/types';
import {
  ACTIVE_ORDER_STATUSES,
  cn,
  elapsedMinutes,
  formatCurrency,
  groupBy,
  TABLE_STATUS_META,
  ZONE_LABELS,
} from '@/lib/utils';

const ZONE_ORDER = ['barra', 'salon', 'terraza'];

interface TableMapProps {
  tables: RestaurantTable[];
  orders: Order[];
  onSelect: (table: RestaurantTable) => void;
}

function activeOrderFor(tableId: number, orders: Order[]): Order | undefined {
  return orders.find((o) => o.table_id === tableId && ACTIVE_ORDER_STATUSES.includes(o.status));
}

export function TableMap({ tables, orders, onSelect }: TableMapProps) {
  const zones = groupBy(tables, (t) => t.zone || 'salon');
  const zoneKeys = Object.keys(zones).sort((a, b) => {
    const ia = ZONE_ORDER.indexOf(a);
    const ib = ZONE_ORDER.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

  if (tables.length === 0) {
    return (
      <div className="rounded-xl border border-dashed px-6 py-12 text-center text-sm text-muted-foreground">
        No tables configured yet. Add tables from the POS or the Tables API to see the floor map.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {zoneKeys.map((zone) => {
        const zoneTables = [...zones[zone]].sort((a, b) => a.number - b.number);
        return (
          <section key={zone}>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {ZONE_LABELS[zone] ?? zone}
              <span className="ml-2 font-normal normal-case">({zoneTables.length})</span>
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
              {zoneTables.map((table) => {
                const meta = TABLE_STATUS_META[table.status] ?? TABLE_STATUS_META.free;
                const order = activeOrderFor(table.id, orders);
                const minutes = order ? elapsedMinutes(order.created_at) : 0;
                return (
                  <button
                    key={table.id}
                    onClick={() => onSelect(table)}
                    className={cn(
                      'rounded-xl border p-4 text-left transition-all hover:ring-1 hover:ring-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      meta.tile,
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold tabular-nums">{table.number}</span>
                      <span className={cn('h-2.5 w-2.5 rounded-full', meta.dot)} title={meta.label} />
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      {table.capacity} seats
                    </div>
                    {order ? (
                      <div className="mt-2 space-y-0.5 border-t border-white/5 pt-2">
                        <p className="text-sm font-semibold tabular-nums text-amber-300">
                          {formatCurrency(order.total)}
                        </p>
                        <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {minutes < 60 ? `${minutes}m` : `${Math.floor(minutes / 60)}h ${minutes % 60}m`}
                        </p>
                      </div>
                    ) : (
                      <p className="mt-2 border-t border-white/5 pt-2 text-xs text-muted-foreground">{meta.label}</p>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 border-t pt-4 text-xs text-muted-foreground">
        {(Object.keys(TABLE_STATUS_META) as Array<keyof typeof TABLE_STATUS_META>).map((status) => (
          <span key={status} className="inline-flex items-center gap-1.5">
            <span className={cn('h-2 w-2 rounded-full', TABLE_STATUS_META[status].dot)} />
            {TABLE_STATUS_META[status].label}
          </span>
        ))}
        <span className="ml-auto">Updates automatically every few seconds</span>
      </div>
    </div>
  );
}
