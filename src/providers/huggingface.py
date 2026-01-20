from .base import LLMProvider
from huggingface_hub import InferenceClient

class HuggingFaceProvider(LLMProvider):
    def __init__(self, model: str, api_key: str):
        self.client = InferenceClient(model=model, token=api_key)

    def generate_response(self, messages: list, tools: list = None, params: dict = None) -> dict:
        params = params or {}
        try:
            completion = self.client.chat.completions.create(
                messages=messages,
                tools=tools,
                tool_choice="auto",
                temperature=params.get('temperature', 0.7),
                top_p=params.get('top_p', 1.0),
                max_tokens=params.get('max_tokens', 512)
            )
            choice = completion.choices[0].message
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
            raise ValueError(f"Error en HuggingFace: {str(e)}")