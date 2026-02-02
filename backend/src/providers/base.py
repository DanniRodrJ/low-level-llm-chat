from abc import ABC, abstractmethod

class LLMProvider(ABC):
    @abstractmethod
    def generate_response(self, messages: list, tools: list = None, params: dict = None) -> dict:
        """
        Generates a response from the LLM.
        Returns: {‘content’: str or None, ‘tool_calls’: list of dicts}
        Each tool_call: {‘id’: str, ‘function’: {‘name’: str, ‘arguments’: str}}
        """
        pass