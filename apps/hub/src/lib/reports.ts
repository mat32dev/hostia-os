import type {
  MenuItem,
  Order,
  PaymentSlice,
  PeakHour,
  RevenuePoint,
  TopItem,
} from '@/types';
import { parseApiDate, sum } from '@/lib/utils';

export type RangeKey = 'today' | 'yesterday' | '7d' | '30d';

export const RANGE_LABELS: Record<RangeKey, string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
};

export function rangeDates(range: RangeKey): { from: Date; to: Date; days: number } {
  const now = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

  if (range === 'today') {
    return { from: startOfDay(now), to: now, days: 1 };
  }
  if (range === 'yesterday') {
    const y = new Date(now);
    y.setDate(y.getDate() - 1);
    return { from: startOfDay(y), to: startOfDay(now), days: 1 };
  }
  const days = range === '7d' ? 7 : 30;
  const from = startOfDay(now);
  from.setDate(from.getDate() - (days - 1));
  return { from, to: now, days };
}

export function filterOrdersByRange(orders: Order[], from: Date, to: Date): Order[] {
  return orders.filter((o) => {
    const d = parseApiDate(o.created_at);
    return d !== null && d >= from && d <= to;
  });
}

/** Orders that count towards revenue (everything except cancelled). */
export function revenueOrders(orders: Order[]): Order[] {
  return orders.filter((o) => o.status !== 'cancelled');
}

// ─── Aggregations ────────────────────────────────────────────────────────────
export function summarize(orders: Order[]) {
  const valid = revenueOrders(orders);
  const revenue = sum(valid.map((o) => o.total));
  const tax = sum(valid.map((o) => o.tax));
  return {
    revenue,
    tax,
    count: valid.length,
    cancelled: orders.length - valid.length,
    avgTicket: valid.length ? revenue / valid.length : 0,
  };
}

export function revenueByDay(orders: Order[], days: number): RevenuePoint[] {
  const valid = revenueOrders(orders);
  const points: RevenuePoint[] = [];
  const today = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(day.getDate() - i);
    const start = startOfDay(day);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const dayOrders = valid.filter((o) => {
      const d = parseApiDate(o.created_at);
      return d !== null && d >= start && d < end;
    });

    points.push({
      label: day.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' }),
      revenue: sum(dayOrders.map((o) => o.total)),
      orders: dayOrders.length,
    });
  }
  return points;
}

export function revenueByHour(orders: Order[]): RevenuePoint[] {
  const valid = revenueOrders(orders);
  const points: RevenuePoint[] = [];
  for (let h = 0; h < 24; h++) {
    const hourOrders = valid.filter((o) => parseApiDate(o.created_at)?.getHours() === h);
    points.push({
      label: `${String(h).padStart(2, '0')}h`,
      revenue: sum(hourOrders.map((o) => o.total)),
      orders: hourOrders.length,
    });
  }
  return points;
}

export function topItems(
  orders: Order[],
  menuById: Map<number, MenuItem>,
  limit = 8,
): TopItem[] {
  const acc = new Map<number, TopItem>();
  for (const order of revenueOrders(orders)) {
    for (const item of order.items) {
      const entry = acc.get(item.menu_item_id) ?? {
        menu_item_id: item.menu_item_id,
        name: menuById.get(item.menu_item_id)?.name ?? `Item #${item.menu_item_id}`,
        quantity: 0,
        revenue: 0,
      };
      entry.quantity += item.quantity;
      entry.revenue += item.total_price;
      acc.set(item.menu_item_id, entry);
    }
  }
  return [...acc.values()].sort((a, b) => b.quantity - a.quantity).slice(0, limit);
}

export function peakHours(orders: Order[]): PeakHour[] {
  const valid = revenueOrders(orders);
  const hours: PeakHour[] = [];
  for (let h = 0; h < 24; h++) {
    const hourOrders = valid.filter((o) => parseApiDate(o.created_at)?.getHours() === h);
    hours.push({
      hour: h,
      label: `${String(h).padStart(2, '0')}h`,
      orders: hourOrders.length,
      revenue: sum(hourOrders.map((o) => o.total)),
    });
  }
  return hours;
}

export function paymentBreakdown(orders: Order[]): PaymentSlice[] {
  const acc = new Map<string, PaymentSlice>();
  for (const order of revenueOrders(orders)) {
    if (!order.payment_method) continue;
    const entry = acc.get(order.payment_method) ?? {
      method: order.payment_method,
      count: 0,
      amount: 0,
    };
    entry.count += 1;
    entry.amount += order.total;
    acc.set(order.payment_method, entry);
  }
  return [...acc.values()].sort((a, b) => b.amount - a.amount);
}
