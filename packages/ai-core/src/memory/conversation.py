import json
from typing import List, Optional
from datetime import datetime


class ConversationMemory:
    """Manages conversation history for context-aware responses"""

    def __init__(self, vector_store=None):
        self.vector_store = vector_store
        self.history: List[dict] = []

    def add_message(self, role: str, content: str, tenant_id: str, phone: str):
        """Add a message to history"""
        message = {
            "role": role,
            "content": content,
            "tenant_id": tenant_id,
            "phone": phone,
            "timestamp": datetime.utcnow().isoformat()
        }
        self.history.append(message)

        # Keep only last 50 messages
        if len(self.history) > 50:
            self.history = self.history[-50:]

        return message

    def get_history(self, limit: int = 10) -> List[dict]:
        """Get recent conversation history"""
        return self.history[-limit:]

    def get_context_string(self, limit: int = 10) -> str:
        """Get conversation history as a string for LLM context"""
        recent = self.get_history(limit)
        return "\n".join([f"{m['role']}: {m['content']}" for m in recent])

    def clear(self):
        """Clear conversation history"""
        self.history = []

    def to_json(self) -> str:
        """Export history as JSON"""
        return json.dumps(self.history, indent=2)
