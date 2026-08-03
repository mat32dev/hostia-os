import axios from 'axios';

const GUARD_API_URL = process.env.GUARD_API_URL || 'http://guard-api:8002';

export interface Alert {
  id: number;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  camera_id: string;
  timestamp: string;
  status: string;
  amount?: number;
  table_number?: number;
}

export interface GuardReport {
  date: string;
  total_frames_analyzed: number;
  suspicious_activities: number;
  alerts: Alert[];
  expected_payments_matched: number;
  discrepancies: number;
}

export class GuardClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = GUARD_API_URL;
  }

  async getAlerts(tenantId: number, status: string = 'open'): Promise<Alert[]> {
    try {
      const res = await axios.get(
        `${this.baseUrl}/v1/alerts?tenant_id=${tenantId}&status=${status}`,
        { timeout: 5000 }
      );
      return res.data;
    } catch {
      return [];
    }
  }

  async getReport(tenantId: number, date: string): Promise<GuardReport | null> {
    try {
      const res = await axios.get(
        `${this.baseUrl}/v1/reports/${date}?tenant_id=${tenantId}`,
        { timeout: 5000 }
      );
      return res.data;
    } catch {
      return null;
    }
  }

  async resolveAlert(alertId: number, status: string, notes?: string): Promise<boolean> {
    try {
      await axios.post(
        `${this.baseUrl}/v1/alerts/${alertId}/resolve`,
        { status, notes },
        { timeout: 5000 }
      );
      return true;
    } catch {
      return false;
    }
  }

  async registerExpectedPayment(
    tenantId: number,
    transactionId: number,
    amount: number,
    tableNumber?: number,
    timestamp?: string
  ): Promise<boolean> {
    try {
      await axios.post(
        `${this.baseUrl}/v1/expected-payments`,
        {
          tenant_id: tenantId,
          transaction_id: transactionId,
          amount,
          table_number: tableNumber,
          timestamp: timestamp || new Date().toISOString(),
          payment_method: 'cash'
        },
        { timeout: 5000 }
      );
      return true;
    } catch {
      return false;
    }
  }
}
