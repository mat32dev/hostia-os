from crewai import Crew, Process
from .chat_agent import ChatAgent
from .guard_agent import GuardAgent
from .pos_agent import POSAgent


def create_crew(agent_type: str) -> Crew:
    """Create a CrewAI crew for the specified agent type"""

    agents_map = {
        "chat": ChatAgent,
        "guard": GuardAgent,
        "pos": POSAgent,
    }

    if agent_type not in agents_map:
        raise ValueError(f"Unknown agent type: {agent_type}")

    agent = agents_map[agent_type]()

    return Crew(
        agents=[agent.agent],
        tasks=[],
        process=Process.sequential,
        verbose=False
    )
