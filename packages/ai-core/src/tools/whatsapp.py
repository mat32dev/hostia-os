import httpx
import os


class WhatsAppTool:
    """Tool for sending WhatsApp messages"""

    def __init__(self):
        self.phone_id = os.getenv("WA_PHONE_ID", "")
        self.access_token = os.getenv("WA_ACCESS_TOKEN", "")
        self.api_url = f"https://graph.facebook.com/v18.0/{self.phone_id}"

    def send_message(self, to: str, text: str) -> bool:
        """Send a WhatsApp message"""
        if not self.phone_id or not self.access_token:
            return False

        try:
            with httpx.Client() as client:
                res = client.post(
                    f"{self.api_url}/messages",
                    json={
                        "messaging_product": "whatsapp",
                        "to": to,
                        "type": "text",
                        "text": {"body": text}
                    },
                    headers={
                        "Authorization": f"Bearer {self.access_token}",
                        "Content-Type": "application/json"
                    },
                    timeout=10.0
                )
                return res.status_code == 200
        except Exception:
            return False

    def send_buttons(self, to: str, text: str, buttons: list) -> bool:
        """Send WhatsApp message with interactive buttons"""
        if not self.phone_id or not self.access_token:
            return False

        try:
            with httpx.Client() as client:
                res = client.post(
                    f"{self.api_url}/messages",
                    json={
                        "messaging_product": "whatsapp",
                        "to": to,
                        "type": "interactive",
                        "interactive": {
                            "type": "button",
                            "body": {"text": text},
                            "action": {
                                "buttons": [
                                    {"type": "reply", "reply": {"id": btn["id"], "title": btn["title"]}}
                                    for btn in buttons[:3]
                                ]
                            }
                        }
                    },
                    headers={
                        "Authorization": f"Bearer {self.access_token}",
                        "Content-Type": "application/json"
                    },
                    timeout=10.0
                )
                return res.status_code == 200
        except Exception:
            return False
