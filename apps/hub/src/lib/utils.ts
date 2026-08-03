import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type {
  AlertSeverity,
  AlertStatus,
  OrderStatus,
  TableStatus,
} from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Dates ───────────────────────────────────────────────────────────────────
// FastAPI serializes naive UTC datetimes without a timezone suffix
// (e.g. "2026-08-03T09:12:44"). JavaScript would parse those as *local* time,
// so we explicitly mark them as UTC.
export function parseApiDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  let v = value.trim();
  if (/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2})?(\.\d+)?$/.test(v)) {
    v = v.replace(' ', 'T') + 'Z';
  }
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatDate(value: string | Date | null | undefined): string {
  const d = parseApiDate(value);
  if (!d) return '—';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatTime(value: string | Date | null | undefined): string {
  const d = parseApiDate(value);
  if (!d) return '—';
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export function formatDateTime(value: string | Date | null | undefined): string {
  const d = parseApiDate(value);
  if (!d) return '—';
  return `${formatDate(d)}, ${formatTime(d)}`;
}

export function timeAgo(value: string | Date | null | undefined): string {
  const d = parseApiDate(value);
  if (!d) return '—';
  const seconds = Math.max(0, Math.floor((Date.now() - d.getTime()) / 1000));
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ${minutes % 60}m ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function elapsedMinutes(value: string | Date | null | undefined): number {
  const d = parseApiDate(value);
  if (!d) return 0;
  return Math.max(0, Math.floor((Date.now() - d.getTime()) / 60000));
}

export function isToday(value: string | Date | null | undefined): boolean {
  const d = parseApiDate(value);
  if (!d) return false;
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export function isYesterday(value: string | Date | null | undefined): boolean {
  const d = parseApiDate(value);
  if (!d) return false;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    d.getFullYear() === yesterday.getFullYear() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getDate() === yesterday.getDate()
  );
}

export function toApiDateString(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// ─── Numbers / currency ──────────────────────────────────────────────────────
export function formatCurrency(
  amount: number,
  currency = 'EUR',
  locale = 'es-ES',
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function sum(values: number[]): number {
  return values.reduce((acc, v) => acc + v, 0);
}

/** Percentage change from `previous` to `current`. Null when previous is 0. */
export function pctChange(current: number, previous: number): number | null {
  if (!previous) return null;
  return ((current - previous) / previous) * 100;
}

// ─── Collections ─────────────────────────────────────────────────────────────
export function groupBy<T>(items: T[], key: (item: T) => string): Record<string, T[]> {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    const k = key(item);
    (acc[k] ||= []).push(item);
    return acc;
  }, {});
}

// ─── CSV export ──────────────────────────────────────────────────────────────
export function downloadCsv(
  filename: string,
  headers: string[],
  rows: Array<Array<string | number | null | undefined>>,
): void {
  const escape = (v: string | number | null | undefined) => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.map(escape).join(','), ...rows.map((r) => r.map(escape).join(','))];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Domain metadata (labels + badge styling) ────────────────────────────────
export const ACTIVE_ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'served',
];

export const ORDER_STATUS_META: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400' },
  confirmed: { label: 'Confirmed', className: 'border-sky-500/40 bg-sky-500/10 text-sky-400' },
  preparing: { label: 'Preparing', className: 'border-violet-500/40 bg-violet-500/10 text-violet-400' },
  ready: { label: 'Ready', className: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' },
  served: { label: 'Served', className: 'border-teal-500/40 bg-teal-500/10 text-teal-400' },
  paid: { label: 'Paid', className: 'border-zinc-500/40 bg-zinc-500/10 text-zinc-400' },
  cancelled: { label: 'Cancelled', className: 'border-rose-500/40 bg-rose-500/10 text-rose-400' },
};

export const TABLE_STATUS_META: Record<TableStatus, { label: string; dot: string; tile: string }> = {
  free: {
    label: 'Free',
    dot: 'bg-emerald-400',
    tile: 'border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/60',
  },
  occupied: {
    label: 'Occupied',
    dot: 'bg-amber-400',
    tile: 'border-amber-500/40 bg-amber-500/10 hover:border-amber-500/70',
  },
  reserved: {
    label: 'Reserved',
    dot: 'bg-sky-400',
    tile: 'border-sky-500/30 bg-sky-500/5 hover:border-sky-500/60',
  },
  cleaning: {
    label: 'Cleaning',
    dot: 'bg-zinc-400',
    tile: 'border-zinc-500/30 bg-zinc-500/5 hover:border-zinc-500/60',
  },
};

export const ALERT_SEVERITY_META: Record<
  AlertSeverity,
  { label: string; className: string; border: string }
> = {
  low: {
    label: 'Low',
    className: 'border-zinc-500/40 bg-zinc-500/10 text-zinc-400',
    border: 'border-l-zinc-500',
  },
  medium: {
    label: 'Medium',
    className: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400',
    border: 'border-l-yellow-500',
  },
  high: {
    label: 'High',
    className: 'border-orange-500/40 bg-orange-500/10 text-orange-400',
    border: 'border-l-orange-500',
  },
  critical: {
    label: 'Critical',
    className: 'border-rose-500/40 bg-rose-500/10 text-rose-400',
    border: 'border-l-rose-500',
  },
};

export const ALERT_STATUS_META: Record<AlertStatus, { label: string; className: string }> = {
  open: { label: 'Open', className: 'border-rose-500/40 bg-rose-500/10 text-rose-400' },
  investigating: {
    label: 'Investigating',
    className: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
  },
  resolved: { label: 'Resolved', className: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' },
  false_positive: {
    label: 'False positive',
    className: 'border-zinc-500/40 bg-zinc-500/10 text-zinc-400',
  },
};

export const ALERT_TYPE_LABELS: Record<string, string> = {
  unverified_sale: 'Unverified sale',
  unregistered_transaction: 'Unregistered transaction',
  discrepancy: 'Cash discrepancy',
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: 'Cash',
  card: 'Card',
  qr: 'QR',
  crypto: 'Crypto',
};

export const ZONE_LABELS: Record<string, string> = {
  barra: 'Bar',
  salon: 'Dining room',
  terraza: 'Terrace',
};
