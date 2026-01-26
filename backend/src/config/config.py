import os
import yaml
from dotenv import load_dotenv

load_dotenv()

models_path = os.path.join(os.path.dirname(__file__), 'models.yaml')
with open(models_path, 'r') as f:
    models_data = yaml.safe_load(f)

class Config:
    OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY')
    HF_API_KEY = os.getenv('HF_API_KEY')
    OLLAMA_BASE_URL = os.getenv('OLLAMA_BASE_URL')
    OPENAI_MODEL = models_data['openai']['model']
    HF_MODEL = models_data['huggingface']['model']
    OLLAMA_MODEL = models_data['ollama']['model']