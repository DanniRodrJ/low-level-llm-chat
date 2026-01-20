from src.config import Config
from src.providers.huggingface import HuggingFaceProvider
from src.agent import Agent

provider = HuggingFaceProvider(model=Config.HF_MODEL, api_key=Config.HF_API_KEY)
agent = Agent(provider)

# Ejemplo de uso
response = agent.process_input("¿Cuál es la temperatura en San Francisco?")
print(response)