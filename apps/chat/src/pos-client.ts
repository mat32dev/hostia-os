import axios from 'axios';

const POS_API_URL = process.env.POS_API_URL || 'http://pos-api:8000';

export interface Tenant {
  id: number;
  name: string;
  slug: string;
  phone: string;
}

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  description?: string;
  allergens?: string;
  is_available: boolean;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_gluten_free: boolean;
  category?: string;
}

export interface Table {
  id: number;
  number: number;
  capacity: number;
  status: 'free' | 'occupied' | 'reserved' | 'cleaning';
  zone: string;
}

export interface OrderItem {
  menu_item_id: number;
  quantity: number;
  unit_price: number;
  notes?: string;
}

export interface Order {
  id: number;
  order_number: string;
  status: string;
  subtotal: number;
  tax: number;
  total: number;
  table_id?: number;
  items: OrderItem[];
  created_at: string;
}

export class POSClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = POS_API_URL;
    this.apiKey = process.env.POS_API_KEY || '';
  }

  private async request(method: string, path: string, data?: any) {
    const res = await axios({
      method,
      url: `${this.baseUrl}${path}`,
      data,
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {})
      },
      timeout: 10000
    });
    return res.data;
  }

  async getTenantByPhone(phone: string): Promise<Tenant | null> {
    try {
      return await this.request('GET', `/v1/tenants/by-phone/${encodeURIComponent(phone)}`);
    } catch {
      return null;
    }
  }

  async getMenu(tenantId: number): Promise<{ categories: any[]; items: MenuItem[] }> {
    return this.request('GET', '/v1/menu');
  }

  async getTables(tenantId: number): Promise<Table[]> {
    return this.request('GET', '/v1/tables');
  }

  async getAvailableTables(tenantId: number, people: number): Promise<Table[]> {
    const tables = await this.getTables(tenantId);
    return tables.filter(t => t.status === 'free' && t.capacity >= people);
  }

  async createOrder(tenantId: number, orderData: {
    table_id?: number;
    items: OrderItem[];
    notes?: string;
    source?: string;
  }): Promise<Order> {
    return this.request('POST', '/v1/orders', {
      ...orderData,
      source: orderData.source || 'whatsapp'
    });
  }

  async getOrder(orderId: number): Promise<Order> {
    return this.request('GET', `/v1/orders/${orderId}`);
  }

  async closeOrder(orderId: number): Promise<Order> {
    return this.request('POST', `/v1/orders/${orderId}/close`);
  }

  async getOwnerPhone(tenantId: number): Promise<string> {
    try {
      const res = await this.request('GET', `/v1/tenants/${tenantId}`);
      return res.phone;
    } catch {
      return '';
    }
  }
}
