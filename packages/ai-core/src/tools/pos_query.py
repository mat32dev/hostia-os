import httpx
import os


class POSQueryTool:
    """Tool for querying the POS API"""

    def __init__(self):
        self.base_url = os.getenv("POS_API_URL", "http://pos-api:8000")

    def get_menu(self, tenant_id: str) -> dict:
        """Get current menu"""
        try:
            with httpx.Client() as client:
                res = client.get(f"{self.base_url}/v1/menu", timeout=10.0)
                return res.json()
        except Exception as e:
            return {"error": str(e)}

    def get_tables(self, tenant_id: str) -> dict:
        """Get table status"""
        try:
            with httpx.Client() as client:
                res = client.get(f"{self.base_url}/v1/tables", timeout=10.0)
                return res.json()
        except Exception as e:
            return {"error": str(e)}

    def get_inventory(self, tenant_id: str) -> dict:
        """Get inventory status"""
        try:
            with httpx.Client() as client:
                res = client.get(f"{self.base_url}/v1/inventory", timeout=10.0)
                return res.json()
        except Exception as e:
            return {"error": str(e)}

    def get_low_stock(self, tenant_id: str) -> dict:
        """Get low stock items"""
        try:
            with httpx.Client() as client:
                res = client.get(f"{self.base_url}/v1/inventory/low-stock", timeout=10.0)
                return res.json()
        except Exception as e:
            return {"error": str(e)}

    def get_daily_report(self, tenant_id: str, date: str = None) -> dict:
        """Get daily report"""
        try:
            with httpx.Client() as client:
                url = f"{self.base_url}/v1/reports/daily"
                if date:
                    url += f"?date={date}"
                res = client.get(url, timeout=10.0)
                return res.json()
        except Exception as e:
            return {"error": str(e)}

    def get_staff(self, tenant_id: str) -> dict:
        """Get staff information"""
        try:
            with httpx.Client() as client:
                res = client.get(f"{self.base_url}/v1/staff", timeout=10.0)
                return res.json()
        except Exception as e:
            return {"error": str(e)}
