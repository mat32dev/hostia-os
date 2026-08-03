import express from 'express';
import axios from 'axios';
import { createClient } from 'redis';

const app = express();
app.use(express.json());

// ─── Config ───
const POS_API_URL = process.env.POS_API_URL || 'http://pos-api:8000';
const GUARD_API_URL = process.env.GUARD_API_URL || 'http://guard-api:8002';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const WA_PHONE_ID = process.env.WA_PHONE_ID || '';
const WA_ACCESS_TOKEN = process.env.WA_ACCESS_TOKEN || '';

const redis = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
redis.connect().catch(console.error);

// ─── Types ───
interface Intent {
  type: 'reservation' | 'order' | 'menu_query' | 'guard_alert' | 'general';
  confidence: number;
  entities?: Record<string, string>;
}

interface Tenant {
  id: number;
  name: string;
  phone: string;
}

// ─── WhatsApp Client ───
class WhatsAppClient {
  async sendMessage(to: string, text: string, buttons?: any[]) {
    const payload: any = {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text }
    };

    if (buttons && buttons.length > 0) {
      payload.type = 'interactive';
      payload.interactive = {
        type: 'button',
        body: { text },
        action: {
          buttons: buttons.map((btn, i) => ({
            type: 'reply',
            reply: { id: btn.id, title: btn.title }
          }))
        }
      };
    }

    await axios.post(
      `https://graph.facebook.com/v18.0/${WA_PHONE_ID}/messages`,
      payload,
      { headers: { Authorization: `Bearer ${WA_ACCESS_TOKEN}` } }
    );
  }
}

// ─── POS Client ───
class POSClient {
  async getTenantByPhone(phone: string): Promise<Tenant | null> {
    try {
      const res = await axios.get(`${POS_API_URL}/v1/tenants/by-phone/${phone}`);
      return res.data;
    } catch {
      return null;
    }
  }

  async getMenu(tenantId: number) {
    const res = await axios.get(`${POS_API_URL}/v1/menu`, {
      headers: { Authorization: `Bearer ${process.env.POS_API_KEY}` }
    });
    return res.data;
  }

  async createOrder(tenantId: number, orderData: any) {
    const res = await axios.post(`${POS_API_URL}/v1/orders`, orderData, {
      headers: { Authorization: `Bearer ${process.env.POS_API_KEY}` }
    });
    return res.data;
  }

  async getOwnerPhone(tenantId: number): Promise<string> {
    const res = await axios.get(`${POS_API_URL}/v1/tenants/${tenantId}`);
    return res.data.phone;
  }
}

// ─── Guard Client ───
class GuardClient {
  async getAlerts(tenantId: number) {
    const res = await axios.get(`${GUARD_API_URL}/v1/alerts?tenant_id=${tenantId}`);
    return res.data;
  }

  async forwardAlert(tenantId: number, alert: any) {
    // Forward alert to owner via WhatsApp
    const ownerPhone = await posClient.getOwnerPhone(tenantId);
    const message = formatAlertForWhatsApp(alert);

    await whatsapp.sendMessage(ownerPhone, message, [
      { id: `resolve_${alert.id}`, title: '✅ Mark OK' },
      { id: `investigate_${alert.id}`, title: '🔍 Investigate' }
    ]);
  }
}

// ─── Agent Director ───
class AgentDirector {
  async classifyIntent(message: string, tenantId: number): Promise<Intent> {
    const prompt = `Classify this WhatsApp message for a restaurant AI:
    Message: "${message}"
    Context: Restaurant tenant ${tenantId}

    Return JSON:
    {
      "type": "reservation" | "order" | "menu_query" | "guard_alert" | "general",
      "confidence": 0-100,
      "entities": {"date": "...", "time": "...", "people": "...", "name": "..."}
    }`;

    try {
      const res = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' }
        },
        { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
      );
      return JSON.parse(res.data.choices[0].message.content);
    } catch {
      return { type: 'general', confidence: 50 };
    }
  }

  async handleReservation(message: string, tenantId: number, from: string): Promise<string> {
    // TODO: Check table availability, create reservation
    return `¡Perfecto! Voy a buscar disponibilidad para tu reserva. ¿Para cuántas personas y qué día?`;
  }

  async handleOrder(message: string, tenantId: number, from: string): Promise<string> {
    const menu = await posClient.getMenu(tenantId);
    return `Aquí está nuestro menú:\n\n${menu.items.map((i: any) => `• ${i.name} — ${i.price}€`).join('\n')}\n\n¿Qué te gustaría pedir?`;
  }

  async handleMenuQuery(message: string, tenantId: number): Promise<string> {
    const menu = await posClient.getMenu(tenantId);
    return `Nuestro menú incluye: ${menu.items.map((i: any) => i.name).join(', ')}. ¿Algo en particular te interesa?`;
  }

  async handleGuardQuery(tenantId: number, from: string): Promise<string> {
    const alerts = await guardClient.getAlerts(tenantId);
    if (alerts.length === 0) {
      return 'No hay alertas pendientes. Todo en orden ✅';
    }
    return `Tienes ${alerts.length} alerta(s) pendiente(s):\n\n${alerts.map((a: any) => `⚠️ ${a.title}: ${a.description}`).join('\n\n')}`;
  }

  async handleGeneral(message: string, tenantId: number): Promise<string> {
    return 'Hola 👋 Soy el asistente de HosT.ia. Puedo ayudarte con reservas, pedidos, el menú, o cualquier duda sobre el restaurante. ¿Qué necesitas?';
  }
}

// ─── Helpers ───
function formatAlertForWhatsApp(alert: any): string {
  return `🚨 *Host.ia Guard Alert*\n\n⏰ Hora: ${alert.timestamp}\n📍 Cámara: ${alert.camera_id}\n💰 Importe: €${alert.amount || 'N/A'}\n⚠️ Tipo: ${alert.type}\n\n${alert.description}\n\nVer vídeo: ${alert.video_url || 'N/A'}`;
}

// ─── Instances ───
const whatsapp = new WhatsAppClient();
const posClient = new POSClient();
const guardClient = new GuardClient();
const director = new AgentDirector();

// ─── Routes ───
app.post('/webhook/whatsapp', async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const message = changes?.value?.messages?.[0];

    if (!message) {
      return res.sendStatus(200);
    }

    const from = message.from;
    const body = message.text?.body || '';

    if (!from || !body) {
      return res.sendStatus(200);
    }

    // Get tenant from phone number
    const tenant = await posClient.getTenantByPhone(from);
    const tenantId = tenant?.id || 1;

    // Classify intent
    const intent = await director.classifyIntent(body, tenantId);

    let response: string;
    switch (intent.type) {
      case 'reservation':
        response = await director.handleReservation(body, tenantId, from);
        break;
      case 'order':
        response = await director.handleOrder(body, tenantId, from);
        break;
      case 'menu_query':
        response = await director.handleMenuQuery(body, tenantId);
        break;
      case 'guard_alert':
        response = await director.handleGuardQuery(tenantId, from);
        break;
      default:
        response = await director.handleGeneral(body, tenantId);
    }

    await whatsapp.sendMessage(from, response);
    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook error:', error);
    res.sendStatus(500);
  }
});

app.post('/v1/forward-alert', async (req, res) => {
  const { tenant_id, alert } = req.body;
  await guardClient.forwardAlert(tenant_id, alert);
  res.json({ sent: true });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'chat',
    pos_url: POS_API_URL,
    guard_url: GUARD_API_URL
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Chat service running on :${PORT}`);
});
