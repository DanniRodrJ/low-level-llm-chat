from src.config import Config
from src.providers.ollama import OllamaProvider
from src.agent import Agent

provider = OllamaProvider(base_url=Config.OLLAMA_BASE_URL)
agent = Agent(provider)

# Ejemplo de uso
response = agent.process_input("Edita un archivo nuevo llamado test.txt con 'Hola mundo'")
print(response)