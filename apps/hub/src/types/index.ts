// ─── Host.ia Hub — Shared TypeScript types ──────────────────────────────────
// These mirror the backend contracts:
//   POS   (FastAPI, :8001) — apps/pos/src/schemas.py
//   Guard (FastAPI, :8002) — apps/guard/src/schemas.py
//   Chat  (Express, :3001) — apps/chat conversational REST contract

// ─── Auth ───
export interface Token {
  access_token: string;
  token_type: string;
}

export type UserRole = 'admin' | 'manager' | 'staff';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
}

export interface SessionUser {
  email: string;
  exp?: number;
}

// ─── Tenant ───
export interface Tenant {
  id: number;
  name: string;
  slug: string;
  phone: string;
  email: string;
  address?: string | null;
  timezone: string;
  currency: string;
  language: string;
  is_active: boolean;
}

export interface TenantUpdate {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  timezone?: string;
  currency?: string;
  language?: string;
}

// ─── Tables ───
export type TableStatus = 'free' | 'occupied' | 'reserved' | 'cleaning';

export interface RestaurantTable {
  id: number;
  number: number;
  capacity: number;
  status: TableStatus;
  zone: string; // salon, terraza, barra, …
}

export interface TableCreate {
  number: number;
  capacity: number;
  zone: string;
}

export interface TableUpdate {
  number?: number;
  capacity?: number;
  zone?: string;
  status?: TableStatus;
}

// ─── Menu ───
export interface MenuCategory {
  id: number;
  name: string;
  sort_order: number;
  is_active: boolean;
}

export interface CategoryCreate {
  name: string;
  sort_order?: number;
}

export interface CategoryUpdate {
  name?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface MenuItem {
  id: number;
  category_id: number | null;
  name: string;
  description: string | null;
  price: number;
  cost: number;
  allergens: string | null; // comma-separated
  is_available: boolean;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_gluten_free: boolean;
  sort_order?: number;
}

export interface MenuResponse {
  categories: MenuCategory[];
  items: MenuItem[];
}

export interface MenuItemCreate {
  name: string;
  description?: string | null;
  price: number;
  cost?: number;
  allergens?: string | null;
  is_vegetarian?: boolean;
  is_vegan?: boolean;
  is_gluten_free?: boolean;
  category_id?: number | null;
}

export interface MenuItemUpdate extends Partial<MenuItemCreate> {
  is_available?: boolean;
}

// ─── Orders ───
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'served'
  | 'paid'
  | 'cancelled';

export type PaymentMethod = 'cash' | 'card' | 'qr' | 'crypto';

export interface OrderItem {
  id: number;
  menu_item_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes: string | null;
}

export interface Order {
  id: number;
  order_number: string;
  status: OrderStatus;
  subtotal: number;
  tax: number;
  total: number;
  payment_method: PaymentMethod | null;
  payment_status: string; // pending, paid, failed, refunded
  table_id: number | null;
  items: OrderItem[];
  notes?: string | null;
  source?: string; // pos, whatsapp, web, hub
  created_at: string;
  closed_at: string | null;
}

export interface OrderItemCreate {
  menu_item_id: number;
  quantity: number;
  unit_price: number;
  notes?: string | null;
  modifiers?: string | null;
}

export interface OrderCreate {
  table_id?: number | null;
  items: OrderItemCreate[];
  notes?: string | null;
  source?: string;
  payment_method?: PaymentMethod | null;
}

// ─── Guard ───
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AlertStatus = 'open' | 'investigating' | 'resolved' | 'false_positive';
export type AlertType = 'unverified_sale' | 'unregistered_transaction' | 'discrepancy' | string;

export interface GuardAlert {
  id: number;
  tenant_id: number;
  date?: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  camera_id: string;
  timestamp: string;
  frame_path?: string | null;
  video_url?: string | null;
  amount?: number | null;
  table_number?: number | null;
  transaction_id?: number | null;
  status: AlertStatus;
  resolution_notes?: string | null;
  resolved_at?: string | null;
  created_at: string;
}

export interface AlertResolution {
  status: AlertStatus;
  notes?: string;
}

export interface GuardDailyReport {
  date: string;
  total_frames_analyzed: number;
  suspicious_activities: number;
  alerts: GuardAlert[];
  expected_payments_matched: number;
  discrepancies: number;
}

// ─── Chat ───
export type MessageDirection = 'inbound' | 'outbound';

export interface ChatMessage {
  id: number;
  conversation_id: number;
  direction: MessageDirection;
  body: string;
  intent?: string | null; // reservation, order, menu_query, guard_alert, general
  timestamp: string;
}

export interface Conversation {
  id: number;
  phone: string;
  contact_name?: string | null;
  status: string; // active, closed
  last_message?: string | null;
  last_message_at?: string | null;
  unread_count: number;
  messages?: ChatMessage[];
}

// ─── Health ───
export type ServiceName = 'pos' | 'guard' | 'chat';

export interface ServiceHealth {
  service: ServiceName;
  ok: boolean;
  latencyMs: number;
  detail?: Record<string, unknown>;
}

// ─── Reports ───
export interface RevenuePoint {
  label: string;
  revenue: number;
  orders: number;
}

export interface TopItem {
  menu_item_id: number;
  name: string;
  quantity: number;
  revenue: number;
}

export interface PeakHour {
  hour: number;
  label: string;
  orders: number;
  revenue: number;
}

export interface PaymentSlice {
  method: string;
  count: number;
  amount: number;
}
