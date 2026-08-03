import useSWR from 'swr';
import { authHeaders, clearToken } from '@/lib/auth';
import type {
  AlertResolution,
  Conversation,
  GuardAlert,
  GuardDailyReport,
  MenuItem,
  MenuItemCreate,
  MenuItemUpdate,
  MenuResponse,
  Order,
  OrderCreate,
  RestaurantTable,
  ServiceHealth,
  ServiceName,
  TableCreate,
  Tenant,
  TenantUpdate,
  User,
  UserRole,
} from '@/types';

export const TENANT_ID = Number(process.env.NEXT_PUBLIC_TENANT_ID || '1');

const POS_BASE = '/api/pos';
const GUARD_BASE = '/api/guard';
const CHAT_BASE = '/api/chat';

// ─── HTTP core ───────────────────────────────────────────────────────────────
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(base: string, path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${base}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    throw new ApiError(0, 'Service unreachable. Check that the backend is running.');
  }

  if (res.status === 401) {
    clearToken();
    throw new ApiError(401, 'Not authenticated. Sign in from Settings → Account.');
  }
  if (!res.ok) {
    let detail = res.statusText || `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.detail) {
        detail = typeof body.detail === 'string' ? body.detail : JSON.stringify(body.detail);
      }
    } catch {
      // keep status text
    }
    throw new ApiError(res.status, detail);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// ─── POS API ─────────────────────────────────────────────────────────────────
export const posApi = {
  // Tables
  getTables: () => request<RestaurantTable[]>(POS_BASE, '/v1/tables'),
  createTable: (data: TableCreate) =>
    request<RestaurantTable>(POS_BASE, '/v1/tables', { method: 'POST', body: JSON.stringify(data) }),

  // Menu
  async getMenu(): Promise<MenuResponse> {
    const raw = await request<unknown>(POS_BASE, '/v1/menu');
    // The POS returns { categories, items }; tolerate a bare array too.
    if (Array.isArray(raw)) return { categories: [], items: raw as MenuItem[] };
    const obj = (raw ?? {}) as Partial<MenuResponse>;
    return { categories: obj.categories ?? [], items: obj.items ?? [] };
  },
  createMenuItem: (data: MenuItemCreate) =>
    request<MenuItem>(POS_BASE, '/v1/menu', { method: 'POST', body: JSON.stringify(data) }),
  updateMenuItem: (id: number, data: MenuItemUpdate) =>
    request<MenuItem>(POS_BASE, `/v1/menu/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  /** The POS has no hard-delete endpoint; fall back to archiving (is_available=false). */
  async deleteMenuItem(id: number): Promise<void> {
    try {
      await request<void>(POS_BASE, `/v1/menu/${id}`, { method: 'DELETE' });
    } catch (err) {
      if (err instanceof ApiError && (err.status === 404 || err.status === 405)) {
        await posApi.updateMenuItem(id, { is_available: false });
        return;
      }
      throw err;
    }
  },

  // Orders
  getOrders: (status?: string) =>
    request<Order[]>(POS_BASE, `/v1/orders${status ? `?status=${encodeURIComponent(status)}` : ''}`),
  getOrder: (id: number) => request<Order>(POS_BASE, `/v1/orders/${id}`),
  createOrder: (data: OrderCreate) =>
    request<Order>(POS_BASE, '/v1/orders', { method: 'POST', body: JSON.stringify(data) }),
  closeOrder: (id: number) => request<Order>(POS_BASE, `/v1/orders/${id}/close`, { method: 'POST' }),

  // Tenant / staff
  getTenant: (id: number = TENANT_ID) => request<Tenant>(POS_BASE, `/v1/tenants/${id}`),
  updateTenant: (id: number, data: TenantUpdate) =>
    request<Tenant>(POS_BASE, `/v1/tenants/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getUsers: () => request<User[]>(POS_BASE, '/v1/users'),
  registerStaff: (tenantSlug: string, data: { email: string; password: string; full_name: string; role: UserRole }) =>
    request<User>(POS_BASE, `/v1/auth/register?tenant_slug=${encodeURIComponent(tenantSlug)}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ─── Guard API ───────────────────────────────────────────────────────────────
const ALERT_STATUSES = ['open', 'investigating', 'resolved', 'false_positive'] as const;

export const guardApi = {
  getAlerts: (status: string = 'open') =>
    request<GuardAlert[]>(
      GUARD_BASE,
      `/v1/alerts?tenant_id=${TENANT_ID}&status=${encodeURIComponent(status)}`,
    ),
  /** The Guard API filters by a single status; fetch and merge all for overview stats. */
  async getAllAlerts(): Promise<GuardAlert[]> {
    const batches = await Promise.all(ALERT_STATUSES.map((s) => guardApi.getAlerts(s)));
    return batches
      .flat()
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },
  resolveAlert: (id: number, resolution: AlertResolution) =>
    request<{ status: string }>(GUARD_BASE, `/v1/alerts/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify(resolution),
    }),
  getDailyReport: (date: string) =>
    request<GuardDailyReport>(
      GUARD_BASE,
      `/v1/reports/${encodeURIComponent(date)}?tenant_id=${TENANT_ID}`,
    ),
};

// ─── Chat API ────────────────────────────────────────────────────────────────
export const chatApi = {
  async getConversations(): Promise<Conversation[]> {
    const raw = await request<unknown>(CHAT_BASE, `/v1/conversations?tenant_id=${TENANT_ID}`);
    if (Array.isArray(raw)) return raw as Conversation[];
    const obj = (raw ?? {}) as { conversations?: Conversation[] };
    return obj.conversations ?? [];
  },
  async getConversation(id: number): Promise<Conversation> {
    const raw = await request<unknown>(CHAT_BASE, `/v1/conversations/${id}`);
    // Accept either a full conversation object or a bare message list.
    if (Array.isArray(raw)) {
      return { id, phone: '', status: 'active', unread_count: 0, messages: raw } as Conversation;
    }
    return raw as Conversation;
  },
};

// ─── Health checks ───────────────────────────────────────────────────────────
async function ping(base: string, service: ServiceName): Promise<ServiceHealth> {
  const start = Date.now();
  try {
    const res = await fetch(`${base}/health`, { cache: 'no-store' });
    const detail = (await res.json().catch(() => undefined)) as Record<string, unknown> | undefined;
    return { service, ok: res.ok, latencyMs: Date.now() - start, detail };
  } catch {
    return { service, ok: false, latencyMs: Date.now() - start };
  }
}

export async function checkHealth(): Promise<ServiceHealth[]> {
  return Promise.all([
    ping(POS_BASE, 'pos'),
    ping(GUARD_BASE, 'guard'),
    ping(CHAT_BASE, 'chat'),
  ]);
}

// ─── SWR hooks ───────────────────────────────────────────────────────────────
export function useOrders(refreshInterval = 10000) {
  return useSWR<Order[]>('pos:orders', () => posApi.getOrders(), { refreshInterval });
}

export function useTables(refreshInterval = 8000) {
  return useSWR<RestaurantTable[]>('pos:tables', () => posApi.getTables(), { refreshInterval });
}

export function useMenu() {
  return useSWR<MenuResponse>('pos:menu', () => posApi.getMenu());
}

export function useTenant() {
  return useSWR<Tenant>('pos:tenant', () => posApi.getTenant());
}

export function useUsers() {
  return useSWR<User[]>('pos:users', () => posApi.getUsers());
}

export function useAlerts(status: string = 'open', refreshInterval = 10000) {
  return useSWR<GuardAlert[]>(
    ['guard:alerts', status],
    () => (status === 'all' ? guardApi.getAllAlerts() : guardApi.getAlerts(status)),
    { refreshInterval },
  );
}

export function useGuardReport(date: string | null) {
  return useSWR<GuardDailyReport>(date ? ['guard:report', date] : null, () =>
    guardApi.getDailyReport(date as string),
  );
}

export function useConversations(refreshInterval = 10000) {
  return useSWR<Conversation[]>('chat:conversations', () => chatApi.getConversations(), {
    refreshInterval,
  });
}

export function useConversation(id: number | null) {
  return useSWR<Conversation>(id !== null ? ['chat:conversation', id] : null, () =>
    chatApi.getConversation(id as number),
  );
}

export function useHealth() {
  return useSWR<ServiceHealth[]>('health', checkHealth, { refreshInterval: 30000 });
}
