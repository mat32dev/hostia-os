import httpx
import os


class AlertEngineTool:
    """Tool for managing security alerts"""

    def __init__(self):
        self.base_url = os.getenv("GUARD_API_URL", "http://guard-api:8002")

    def get_alerts(self, tenant_id: str, status: str = "open") -> list:
        """Get alerts for a tenant"""
        try:
            with httpx.Client() as client:
                res = client.get(
                    f"{self.base_url}/v1/alerts?tenant_id={tenant_id}&status={status}",
                    timeout=10.0
                )
                return res.json()
        except Exception:
            return []

    def resolve_alert(self, alert_id: int, status: str, notes: str = "") -> bool:
        """Resolve an alert"""
        try:
            with httpx.Client() as client:
                res = client.post(
                    f"{self.base_url}/v1/alerts/{alert_id}/resolve",
                    json={"status": status, "notes": notes},
                    timeout=10.0
                )
                return res.status_code == 200
        except Exception:
            return False

    def forward_to_whatsapp(self, tenant_id: str, alert: dict) -> bool:
        """Forward alert to WhatsApp"""
        try:
            with httpx.Client() as client:
                res = client.post(
                    f"{self.base_url}/v1/forward-alert",
                    json={"tenant_id": tenant_id, "alert": alert},
                    timeout=10.0
                )
                return res.status_code == 200
        except Exception:
            return False
