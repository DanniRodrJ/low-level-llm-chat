from .openai import OpenAIProvider
from .huggingface import HuggingFaceProvider
from .ollama import OllamaProvider
from .base import LLMProvider
from typing import Type
from ..config.config import Config

class ProviderFactory:
    @staticmethod
    def get_provider(name: str):
        if name.lower() == 'openai':
            return OpenAIProvider(api_key=Config.OPENROUTER_API_KEY, model=Config.OPENAI_MODEL)
        elif name.lower() == 'hf':
            return HuggingFaceProvider(model=Config.HF_MODEL, api_key=Config.HF_API_KEY)
        elif name.lower() == 'ollama':
            return OllamaProvider(base_url=Config.OLLAMA_BASE_URL, model=Config.OLLAMA_MODEL)
        else:
            raise ValueError(f"Invalid provider: {name}")