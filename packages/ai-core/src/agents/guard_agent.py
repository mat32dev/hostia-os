from .base import BaseAgent


class GuardAgent(BaseAgent):
    """Guard Agent — handles security and cash monitoring"""

    def __init__(self):
        super().__init__(
            name="GuardAgent",
            role="Security analyst",
            goal="Monitor cash transactions, detect anomalies, and alert owners about discrepancies",
            backstory="""You are the security brain of the operation. You analyze video footage
            from the bar's cameras to detect cash transactions, compare them with POS records,
            and alert the owner when something doesn't add up. You're thorough, discreet, and
            always learning from the owner's feedback to improve your accuracy. You never
            identify faces — you only analyze patterns of behavior around the cash register."""
        )

    def run(self, state: dict) -> dict:
        """Handle guard-related tasks"""
        from ..tools.video_analyzer import VideoAnalyzerTool
        from ..tools.alert_engine import AlertEngineTool

        message = state["messages"][-1].content if state["messages"] else ""
        tenant_id = state.get("tenant_id", "")
        context = state.get("context", {})

        # Use tools
        analyzer = VideoAnalyzerTool()
        alerter = AlertEngineTool()

        # Check if this is an alert query or a new analysis
        if "alert" in message.lower() or "alerta" in message.lower():
            alerts = alerter.get_alerts(tenant_id)
            if not alerts:
                result = "✅ No hay alertas pendientes. Todo en orden."
            else:
                result = f"Tienes {len(alerts)} alerta(s) pendiente(s):\n\n"
                for alert in alerts:
                    result += f"⚠️ {alert.title}: {alert.description}\n"
        else:
            result = "Puedo analizar el vídeo de tu cámara para detectar transacciones en efectivo. Sube un vídeo y te digo lo que encuentro."

        return {
            **state,
            "result": result,
            "next_agent": "end"
        }
