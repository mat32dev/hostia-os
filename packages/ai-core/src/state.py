from typing import TypedDict, Annotated, Sequence, Optional, Dict, Any
import operator
from langchain_core.messages import BaseMessage


class AgentState(TypedDict):
    """Shared state between all agents in the HosT.ia ecosystem"""
    messages: Annotated[Sequence[BaseMessage], operator.add]
    next_agent: str
    tenant_id: str
    context: Dict[str, Any]
    result: Optional[str]
    error: Optional[str]


class AgentContext(TypedDict):
    """Context passed between agents"""
    tenant_id: str
    user_phone: str
    session_id: str
    conversation_history: list
    current_order: Optional[Dict[str, Any]]
    current_reservation: Optional[Dict[str, Any]]
    active_alerts: list
    menu_cache: Optional[list]
    table_map: Optional[list]
