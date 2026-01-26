from .base import LLMProvider
from openai import OpenAI

class OpenAIProvider(LLMProvider):
    def __init__(self, api_key: str, base_url: str = 'https://openrouter.ai/api/v1', model: str = 'openai/gpt-4o-mini'):
        self.client = OpenAI(base_url=base_url, api_key=api_key)
        self.model = model

    def generate_response(self, messages: list, tools: list = None, params: dict = None) -> dict:
        params = params or {}
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                tools=tools,
                tool_choice="auto",
                temperature=params.get('temperature', 0.7),
                top_p=params.get('top_p', 1.0),
                max_tokens=params.get('max_tokens', 512)
            )
            choice = response.choices[0].message
            tool_calls = [
                {
                    'id': call.id,
                    'function': {
                        'name': call.function.name,
                        'arguments': call.function.arguments
                    }
                } for call in (choice.tool_calls or [])
            ]
            return {
                'content': choice.content if not tool_calls else None,
                'tool_calls': tool_calls
            }
        except Exception as e:
            raise ValueError(f"Error en OpenAI: {str(e)}")