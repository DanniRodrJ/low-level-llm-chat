from abc import ABC, abstractmethod
from typing import List, Dict

class MemoryStore(ABC):
    @abstractmethod
    def get_messages(self, session_id: str) -> list:
        """Retrieve the message history from a session"""
        pass
    
    @abstractmethod
    def add_message(self, session_id: str, message: dict):
        """Save a new message in the history"""
        pass