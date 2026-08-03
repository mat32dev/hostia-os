from crewai import Agent, Task, Crew
from langchain_openai import ChatOpenAI
import os


class BaseAgent:
    """Base class for all HosT.ia agents"""

    def __init__(self, name: str, role: str, goal: str, backstory: str):
        self.name = name
        self.role = role
        self.goal = goal
        self.backstory = backstory
        self.llm = ChatOpenAI(
            model=os.getenv("AGENT_MODEL", "gpt-4o-mini"),
            temperature=0.7,
            api_key=os.getenv("OPENAI_API_KEY")
        )
        self.agent = Agent(
            role=role,
            goal=goal,
            backstory=backstory,
            llm=self.llm,
            verbose=False
        )

    def run(self, state: dict) -> dict:
        """Run the agent on the current state"""
        raise NotImplementedError("Subclasses must implement run()")
