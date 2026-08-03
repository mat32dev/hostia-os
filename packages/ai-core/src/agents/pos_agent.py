from .base import BaseAgent


class POSAgent(BaseAgent):
    """POS Agent — handles point-of-sale operations"""

    def __init__(self):
        super().__init__(
            name="POSAgent",
            role="Point-of-sale system manager",
            goal="Manage orders, payments, inventory, staff, and generate reports",
            backstory="""You are the system of record for the restaurant. You manage orders,
            process payments, track inventory, manage staff shifts, and generate reports.
            You're precise, reliable, and always in sync with the physical reality of the
            restaurant. When a cash payment is made, you notify the Guard Agent to verify
            it visually. When the menu changes, you notify the Chat Agent to update its knowledge."""
        )

    def run(self, state: dict) -> dict:
        """Handle POS-related tasks"""
        from ..tools.pos_query import POSQueryTool

        message = state["messages"][-1].content if state["messages"] else ""
        tenant_id = state.get("tenant_id", "")
        context = state.get("context", {})

        pos_tool = POSQueryTool()

        # Handle different POS operations
        lower = message.lower()

        if "inventario" in lower or "stock" in lower:
            inventory = pos_tool.get_inventory(tenant_id)
            low_stock = pos_tool.get_low_stock(tenant_id)
            result = f"Inventario actual:\n\n{inventory}\n\n⚠️ Stock bajo:\n{low_stock}"

        elif "reporte" in lower or "informe" in lower or "ventas" in lower:
            report = pos_tool.get_daily_report(tenant_id)
            result = f"Reporte del día:\n\n{report}"

        elif "mesa" in lower or "mesas" in lower:
            tables = pos_tool.get_tables(tenant_id)
            result = f"Estado de mesas:\n\n{tables}"

        elif "personal" in lower or "staff" in lower or "empleados" in lower:
            staff = pos_tool.get_staff(tenant_id)
            result = f"Personal:\n\n{staff}"

        else:
            result = "Puedo gestionar pedidos, pagos, inventario, personal y reportes. ¿Qué necesitas?"

        return {
            **state,
            "result": result,
            "next_agent": "end"
        }
