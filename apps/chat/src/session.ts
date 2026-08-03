import { createClient, RedisClientType } from 'redis';

export interface Session {
  phone: string;
  tenant_id: number;
  state: string;
  context: Record<string, any>;
  history: Array<{ role: string; content: string; timestamp: string }>;
  created_at: string;
  updated_at: string;
}

export class SessionManager {
  private redis: RedisClientType;
  private prefix = 'hostia:session:';
  private ttl = 86400; // 24 hours

  constructor() {
    this.redis = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    this.redis.connect().catch(console.error);
  }

  async get(phone: string): Promise<Session | null> {
    try {
      const data = await this.redis.get(`${this.prefix}${phone}`);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  async set(phone: string, session: Session): Promise<void> {
    session.updated_at = new Date().toISOString();
    await this.redis.setEx(
      `${this.prefix}${phone}`,
      this.ttl,
      JSON.stringify(session)
    );
  }

  async update(phone: string, updates: Partial<Session>): Promise<void> {
    const session = await this.get(phone);
    if (session) {
      await this.set(phone, { ...session, ...updates });
    }
  }

  async addMessage(phone: string, role: string, content: string): Promise<void> {
    const session = await this.get(phone);
    if (session) {
      session.history.push({
        role,
        content,
        timestamp: new Date().toISOString()
      });
      // Keep only last 20 messages
      if (session.history.length > 20) {
        session.history = session.history.slice(-20);
      }
      await this.set(phone, session);
    }
  }

  async getHistory(phone: string, limit: number = 10): Promise<Array<{ role: string; content: string }>> {
    const session = await this.get(phone);
    if (!session) return [];
    return session.history.slice(-limit);
  }

  async delete(phone: string): Promise<void> {
    await this.redis.del(`${this.prefix}${phone}`);
  }

  async disconnect(): Promise<void> {
    await this.redis.disconnect();
  }
}
