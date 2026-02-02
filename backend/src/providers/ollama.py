import json
import requests
from .base import LLMProvider

class OllamaProvider(LLMProvider):
    def __init__(self, base_url: str = 'http://localhost:11434/api', model: str = 'llama3.2'):
        self.base_url = base_url
        self.model = model

    def generate_response(self, messages: list, tools: list = None, params: dict = None) -> dict:
        params = params or {}
        try:

            system_content = messages[0]['content'] if messages and messages[0]['role'] == 'system' else ""
            if tools:
                tool_descriptions = [t['function'] for t in tools]  # Assume OpenAI format
                system_content += "\nIf you need to call a tool, respond ONLY with JSON: {'tool_calls': [{'id': 'call_1', 'function': {'name': 'tool_name', 'arguments': 'json_str'}}]}.\nAvailable tools: " + json.dumps(tool_descriptions)
                if messages and messages[0]['role'] == 'system':
                    messages[0]['content'] = system_content
                else:
                    messages.insert(0, {'role': 'system', 'content': system_content})

            payload = {
                'model': self.model,
                'messages': messages,
                'options': {
                    'temperature': params.get('temperature', 0.7),
                    'top_p': params.get('top_p', 1.0),
                    'num_predict': params.get('max_tokens', 512)
                },
                'stream': False
            }
            response = requests.post(f"{self.base_url}/chat", json=payload)
            response.raise_for_status()
            data = response.json()
            content = data['message']['content']

            # Parsear si es tool call (emulación)
            tool_calls = []
            try:
                parsed = json.loads(content)
                if 'tool_calls' in parsed:
                    tool_calls = parsed['tool_calls']
                    content = None
            except json.JSONDecodeError:
                pass  

            return {'content': content, 'tool_calls': tool_calls}
        except Exception as e:
            raise ValueError(f"Error in Ollama: {str(e)}")