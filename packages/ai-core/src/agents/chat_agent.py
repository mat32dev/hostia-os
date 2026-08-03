from .base import BaseAgent


class ChatAgent(BaseAgent):
    """Chat Agent — handles customer-facing WhatsApp interactions"""

    def __init__(self):
        super().__init__(
            name="ChatAgent",
            role="Front-of-house AI assistant",
            goal="Handle customer reservations, orders, and inquiries via WhatsApp with a friendly, efficient tone",
            backstory="""You are the digital face of the restaurant. You handle all customer interactions
            through WhatsApp: reservations, orders, menu questions, and general inquiries. You're friendly,
            efficient, and always POS-aware — you know what's on the menu, what tables are free, and
            what the current promotions are. You speak the customer's language and keep messages short
            and natural, like a real WhatsApp conversation."""
        )

    def run(self, state: dict) -> dict:
        """Handle chat-related tasks"""
        from ..tools.whatsapp import WhatsAppTool
        from ..tools.pos_query import POSQueryTool

        message = state["messages"][-1].content if state["messages"] else ""
        tenant_id = state.get("tenant_id", "")
        context = state.get("context", {})

        # Use tools to get current data
        pos_tool = POSQueryTool()
        whatsapp_tool = WhatsAppTool()

        # Get menu and tables for context
        menu = pos_tool.get_menu(tenant_id)
        tables = pos_tool.get_tables(tenant_id)

        # Build context-aware prompt
        prompt = f"""Customer message: {message}

Current menu: {menu}
Available tables: {tables}
Tenant ID: {tenant_id}
Context: {context}

Respond as the restaurant's WhatsApp assistant. Be helpful, concise, and natural."""

        task = Task(
            description=prompt,
            agent=self.agent,
            expected_output="A natural, concise WhatsApp response to the customer"
        )

        crew = Crew(agents=[self.agent], tasks=[task], verbose=False)
        result = crew.kickoff()

        return {
            **state,
            "result": result.raw if hasattr(result, 'raw') else str(result),
            "next_agent": "end"
        }
