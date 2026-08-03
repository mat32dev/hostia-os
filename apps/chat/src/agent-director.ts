import { POSClient } from './pos-client';
import { GuardClient } from './guard-client';
import { SessionManager } from './session';

export class AgentDirector {
  private pos: POSClient;
  private guard: GuardClient;
  private sessions: SessionManager;

  constructor() {
    this.pos = new POSClient();
    this.guard = new GuardClient();
    this.sessions = new SessionManager();
  }

  async classifyIntent(message: string, tenantId: number): Promise<{
    type: 'reservation' | 'order' | 'menu_query' | 'guard_alert' | 'general';
    confidence: number;
    entities: Record<string, string>;
  }> {
    const lower = message.toLowerCase();

    // Check for guard-related keywords
    if (lower.includes('alerta') || lower.includes('robo') || lower.includes('seguridad') || lower.includes('caja')) {
      return { type: 'guard_alert', confidence: 90, entities: {} };
    }

    // Check for reservation keywords
    if (lower.includes('reserv') || lower.includes('mesa') || lower.includes('mesa para') || lower.includes('reserva')) {
      return { type: 'reservation', confidence: 85, entities: this.extractReservationEntities(message) };
    }

    // Check for order keywords
    if (lower.includes('pedido') || lower.includes('pedir') || lower.includes('llevar') || lower.includes('domicilio') || lower.includes('recoger')) {
      return { type: 'order', confidence: 85, entities: {} };
    }

    // Check for menu keywords
    if (lower.includes('menú') || lower.includes('carta') || lower.includes('precio') || lower.includes('plato') || lower.includes('vegano') || lower.includes('vegetariano') || lower.includes('alergen')) {
      return { type: 'menu_query', confidence: 80, entities: {} };
    }

    return { type: 'general', confidence: 50, entities: {} };
  }

  private extractReservationEntities(message: string): Record<string, string> {
    const entities: Record<string, string> = {};
    const lower = message.toLowerCase();

    // Extract number of people
    const peopleMatch = lower.match(/(\d+)\s*(personas|persona|pax|comensales)/);
    if (peopleMatch) entities.people = peopleMatch[1];

    // Extract date
    if (lower.includes('hoy')) entities.date = 'hoy';
    else if (lower.includes('mañana')) entities.date = 'mañana';
    else if (lower.includes('sábado')) entities.date = 'sábado';
    else if (lower.includes('domingo')) entities.date = 'domingo';

    // Extract time
    const timeMatch = lower.match(/(\d{1,2}):(\d{2})/);
    if (timeMatch) entities.time = `${timeMatch[1]}:${timeMatch[2]}`;

    return entities;
  }

  async handleReservation(message: string, tenantId: number, from: string): Promise<string> {
    const entities = this.extractReservationEntities(message);
    const people = entities.people ? parseInt(entities.people) : 2;

    const tables = await this.pos.getAvailableTables(tenantId, people);
    if (tables.length === 0) {
      return `Lo siento, no hay mesas disponibles para ${people} personas. ¿Quieres que te avise si se libera alguna?`;
    }

    const table = tables[0];
    return `¡Perfecto! Mesa ${table.number} disponible para ${people} personas. ¿Para qué día y hora la quieres?`;
  }

  async handleOrder(message: string, tenantId: number, from: string): Promise<string> {
    const menu = await this.pos.getMenu(tenantId);
    const items = menu.items.filter(i => i.is_available);

    return `Aquí está nuestro menú:\n\n${items.map(i => `• ${i.name} — ${i.price.toFixed(2)}€`).join('\n')}\n\n¿Qué te gustaría pedir?`;
  }

  async handleMenuQuery(message: string, tenantId: number): Promise<string> {
    const menu = await this.pos.getMenu(tenantId);
    const items = menu.items.filter(i => i.is_available);

    const lower = message.toLowerCase();
    if (lower.includes('vegetariano')) {
      const veg = items.filter(i => i.is_vegetarian);
      return `Platos vegetarianos:\n\n${veg.map(i => `• ${i.name} — ${i.price.toFixed(2)}€`).join('\n')}`;
    }
    if (lower.includes('vegano')) {
      const vegan = items.filter(i => i.is_vegan);
      return `Platos veganos:\n\n${vegan.map(i => `• ${i.name} — ${i.price.toFixed(2)}€`).join('\n')}`;
    }
    if (lower.includes('sin gluten') || lower.includes('gluten')) {
      const gf = items.filter(i => i.is_gluten_free);
      return `Platos sin gluten:\n\n${gf.map(i => `• ${i.name} — ${i.price.toFixed(2)}€`).join('\n')}`;
    }

    return `Nuestro menú:\n\n${items.map(i => `• ${i.name} — ${i.price.toFixed(2)}€`).join('\n')}\n\n¿Algo en particular te interesa?`;
  }

  async handleGuardQuery(tenantId: number, from: string): Promise<string> {
    const alerts = await this.guard.getAlerts(tenantId);
    if (alerts.length === 0) {
      return '✅ No hay alertas pendientes. Todo en orden.';
    }
    return `Tienes ${alerts.length} alerta(s) pendiente(s):\n\n${alerts.map(a => `${a.severity === 'high' ? '🚨' : '⚠️'} ${a.title}\n${a.description}`).join('\n\n')}`;
  }

  async handleGeneral(message: string, tenantId: number): Promise<string> {
    return '¡Hola! 👋 Soy el asistente de HosT.ia. Puedo ayudarte con reservas, pedidos, el menú, o cualquier duda sobre el restaurante. ¿Qué necesitas?';
  }
}
