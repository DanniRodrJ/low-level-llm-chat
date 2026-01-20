from src.config import Config
from src.providers.openai import OpenAIProvider
from src.agent import Agent

provider = OpenAIProvider(api_key=Config.OPENROUTER_API_KEY)
agent = Agent(provider)

# Ejemplo de uso
response = agent.process_input("Lista los archivos en el directorio actual")
print(response)