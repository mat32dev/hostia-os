import httpx
import os
from typing import Optional

from ..config import settings


class ChatBridge:
    """Bridge to communicate with the Chat Agent (WhatsApp service)"""

    def __init__(self):
        self.base_url = settings.CHAT_API_URL

    async def notify_inventory_change(self, tenant_id: int, item_id: int):
        """Notify Chat Agent that inventory has changed"""
        try:
            async with httpx.AsyncClient() as client:
                await client.post(
                    f"{self.base_url}/v1/sync-inventory",
                    json={
                        "tenant_id": tenant_id,
                        "item_id": item_id,
                        "action": "inventory_updated"
                    },
                    timeout=5.0
                )
        except Exception as e:
            print(f"Chat bridge error: {e}")

    async def notify_menu_change(self, tenant_id: int):
        """Notify Chat Agent to refresh menu embeddings"""
        try:
            async with httpx.AsyncClient() as client:
                await client.post(
                    f"{self.base_url}/v1/sync-menu",
                    json={
                        "tenant_id": tenant_id,
                        "action": "menu_updated"
                    },
                    timeout=5.0
                )
        except Exception as e:
            print(f"Chat bridge error: {e}")

    def sync_menu_embeddings(self, tenant_id: int):
        """Sync menu to vector DB for RAG"""
        try:
            with httpx.Client() as client:
                client.post(
                    f"{self.base_url}/v1/sync-menu",
                    json={
                        "tenant_id": tenant_id,
                        "action": "menu_sync"
                    },
                    timeout=10.0
                )
        except Exception as e:
            print(f"Chat bridge error: {e}")


class GuardBridge:
    """Bridge to communicate with the Guard Agent (video analytics)"""

    def __init__(self):
        self.base_url = settings.GUARD_API_URL

    async def register_expected_payment(
        self,
        tenant_id: int,
        transaction_id: int,
        amount: float,
        table: Optional[int] = None,
        timestamp: str = "",
        window_minutes: int = 10
    ):
        """Register expected cash payment so Guard can verify"""
        try:
            async with httpx.AsyncClient() as client:
                await client.post(
                    f"{self.base_url}/v1/expected-payments",
                    json={
                        "tenant_id": tenant_id,
                        "transaction_id": transaction_id,
                        "amount": amount,
                        "table": table,
                        "timestamp": timestamp,
                        "payment_method": "cash",
                        "window_minutes": window_minutes
                    },
                    timeout=5.0
                )
        except Exception as e:
            print(f"Guard bridge error: {e}")

    async def notify_order_closed(self, tenant_id: int, order_id: int):
        """Notify Guard that an order was closed"""
        try:
            async with httpx.AsyncClient() as client:
                await client.post(
                    f"{self.base_url}/v1/order-closed",
                    json={
                        "tenant_id": tenant_id,
                        "order_id": order_id
                    },
                    timeout=5.0
                )
        except Exception as e:
            print(f"Guard bridge error: {e}")
