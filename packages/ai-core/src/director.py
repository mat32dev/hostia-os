from typing import TypedDict, Annotated, Sequence, Optional, Dict, Any
import operator
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import BaseMessage, HumanMessage, SystemMessage
import os

from .agents import ChatAgent, GuardAgent, POSAgent


class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], operator.add]
    next_agent: str
    tenant_id: str
    context: Dict[str, Any]
    result: Optional[str]
    error: Optional[str]


class Director:
    """
    LangGraph-based Director that routes between Chat, Guard, and POS agents.
    """

    def __init__(self):
        self.llm = ChatOpenAI(
            model=os.getenv("DIRECTOR_MODEL", "gpt-4o-mini"),
            temperature=0,
            api_key=os.getenv("OPENAI_API_KEY")
        )
        self.chat_agent = ChatAgent()
        self.guard_agent = GuardAgent()
        self.pos_agent = POSAgent()
        self.workflow = self._build_graph()

    def _build_graph(self) -> StateGraph:
        workflow = StateGraph(AgentState)

        # Nodes
        workflow.add_node("classify", self._classify)
        workflow.add_node("chat", self.chat_agent.run)
        workflow.add_node("guard", self.guard_agent.run)
        workflow.add_node("pos", self.pos_agent.run)
        workflow.add_node("synthesize", self._synthesize)

        # Edges
        workflow.set_entry_point("classify")
        workflow.add_conditional_edges(
            "classify",
            self._route,
            {
                "chat": "chat",
                "guard": "guard",
                "pos": "pos",
                "end": END
            }
        )
        workflow.add_edge("chat", "synthesize")
        workflow.add_edge("guard", "synthesize")
        workflow.add_edge("pos", "synthesize")
        workflow.add_edge("synthesize", END)

        return workflow.compile()

    def _classify(self, state: AgentState) -> AgentState:
        """Determine which agent should handle this message"""
        system_msg = """You are the Director of HosT.ia, an AI hospitality system.
Analyze the user's message and determine which specialist agent should handle it:

- "chat": Customer-facing tasks (reservations, orders, menu questions, general hospitality)
- "guard": Security and cash monitoring (alerts, video analysis, theft reports)
- "pos": Point-of-sale operations (inventory, staff, reports, billing)
- "end": If the message is unclear or off-topic

Respond with ONLY the agent name (lowercase)."""

        messages = [SystemMessage(content=system_msg)] + list(state["messages"])
        response = self.llm.invoke(messages)

        agent_name = response.content.strip().lower()
        if agent_name not in ["chat", "guard", "pos", "end"]:
            agent_name = "chat"  # Default to chat

        return {**state, "next_agent": agent_name}

    def _route(self, state: AgentState) -> str:
        return state["next_agent"]

    def _synthesize(self, state: AgentState) -> AgentState:
        """Format final response"""
        return state

    def run(
        self,
        message: str,
        tenant_id: str,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Run the director workflow"""
        initial_state = AgentState(
            messages=[HumanMessage(content=message)],
            next_agent="",
            tenant_id=tenant_id,
            context=context or {},
            result=None,
            error=None
        )
        result = self.workflow.invoke(initial_state)
        return result
