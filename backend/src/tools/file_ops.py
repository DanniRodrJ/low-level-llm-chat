import os
import json
import requests
from bs4 import BeautifulSoup

def list_files_in_dir(directory: str = '.'):
    try:
        files = os.listdir(directory)
        return json.dumps({"files": files})
    except Exception as e:
        return json.dumps({"error": str(e)})
    
list_files_schema = {
    "type": "function",
    "function": {
        "name": "list_files_in_dir",
        "description": "Lista los archivos en un directorio (por defecto actual)",
        "parameters": {
            "type": "object",
            "properties": {
                "directory": {"type": "string", "description": "Directorio (opcional)"}
            },
            "required": []
        }
    }
}


def read_file(path: str):
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        return f"Error al leer el archivo {path}: {str(e)}"
    
read_file_schema = {
    "type": "function",
    "function": {
        "name": "read_file",
        "description": "Lee el contenido de un archivo",
        "parameters": {
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "Ruta del archivo"}
            },
            "required": ["path"]
        }
    }
}


def edit_file(path: str, prev_text: str = '', new_text: str = ''):
    try:
        existed = os.path.exists(path)
        if existed and prev_text:
            content = read_file(path)
            if prev_text not in content:
                return f"Texto '{prev_text}' no encontrado en el archivo"
            content = content.replace(prev_text, new_text)
        else:
            dir_name = os.path.dirname(path)
            if dir_name:
                os.makedirs(dir_name, exist_ok=True)
            content = new_text

        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        action = "editado" if existed and prev_text else "creado"
        return f"Archivo {path} {action} exitosamente"
    except Exception as e:
        return f"Error al editar el archivo {path}: {str(e)}"

edit_file_schema = {
    "type": "function",
    "function": {
        "name": "edit_file",
        "description": "Edita o crea un archivo reemplazando texto",
        "parameters": {
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "Ruta del archivo"},
                "prev_text": {"type": "string", "description": "Texto a reemplazar (opcional)"},
                "new_text": {"type": "string", "description": "Nuevo texto"}
            },
            "required": ["path", "new_text"]
        }
    }
}


def get_weather(city: str, unit: str = "celsius"):
    """Obtiene la temperatura actual en una ciudad usando Open-Meteo (API gratuita)"""
    try:
        # Geocoding simple (lat/lon) - Open-Meteo tiene endpoint directo
        url = f"https://geocoding-api.open-meteo.com/v1/search?name={city}&count=1&language=es&format=json"
        geo = requests.get(url).json()
        if not geo.get("results"):
            return f"No encontré la ciudad '{city}'"
        
        lat = geo["results"][0]["latitude"]
        lon = geo["results"][0]["longitude"]

        weather_url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m&timezone=auto"
        data = requests.get(weather_url).json()
        temp = data["current"]["temperature_2m"]
        unit_symbol = "°C" if unit == "celsius" else "°F"
        
        return f"La temperatura actual en {city} es de {temp}{unit_symbol}."
    except Exception as e:
        return f"Error al obtener el clima: {str(e)}"

get_weather_schema = {
    "type": "function",
    "function": {
        "name": "get_weather",
        "description": "Obtiene la temperatura actual en una ciudad usando una API real",
        "parameters": {
            "type": "object",
            "properties": {
                "city": {"type": "string", "description": "Nombre de la ciudad (ej. Madrid, New York)"},
                "unit": {"type": "string", "enum": ["celsius", "fahrenheit"], "description": "Unidad de temperatura"}
            },
            "required": ["city"]
        }
    }
}


def search_web(query: str) -> str:
    """Realiza una búsqueda en internet usando DuckDuckGo y devuelve un resumen del primer resultado"""
    try:
        url = f"https://duckduckgo.com/html/?q={query}"
        headers = {"User-Agent": "Mozilla/5.0"}
        response = requests.get(url, headers=headers)
        soup = BeautifulSoup(response.text, 'html.parser')
        result = soup.find('a', class_='result__a')
        if result:
            title = result.text
            link = result['href']
            return f"Resultado principal: {title}\nEnlace: {link}"
        return "No encontré resultados relevantes."
    except Exception as e:
        return f"Error en búsqueda: {str(e)}"

search_web_schema = {
    "type": "function",
    "function": {
        "name": "search_web",
        "description": "Busca información en internet y devuelve el primer resultado relevante",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Consulta de búsqueda"}
            },
            "required": ["query"]
        }
    }
}