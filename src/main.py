from src.config.config import Config
from .providers.openai import OpenAIProvider
from .providers.huggingface import HuggingFaceProvider
from .providers.ollama import OllamaProvider
from .agent import Agent
from .providers.factory import ProviderFactory

provider_name = input("Elige provider (openai, hf, ollama): ").lower()
provider = ProviderFactory.get_provider(provider_name)
agent = Agent(provider)

print("Chat iniciado. Escribe 'salir' para terminar.")
while True:
    user_input = input("Tú: ").strip()
    if not user_input:
        continue
    if user_input.lower() in ("salir", "exit", "bye"):
        print("Hasta luego")
        break

    # Params de inferencia ejemplo
    params = {'temperature': 0.5, 'max_tokens': 1024}
    response = agent.process_input(user_input, params)
    print(f"Asistente: {response}")