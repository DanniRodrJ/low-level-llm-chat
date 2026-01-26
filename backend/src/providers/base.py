from abc import ABC, abstractmethod

class LLMProvider(ABC):
    @abstractmethod
    def generate_response(self, messages: list, tools: list = None, params: dict = None) -> dict:
        """
        Genera una respuesta del LLM.
        Retorna: {'content': str or None, 'tool_calls': list of dicts}
        Cada tool_call: {'id': str, 'function': {'name': str, 'arguments': str}}
        """
        pass