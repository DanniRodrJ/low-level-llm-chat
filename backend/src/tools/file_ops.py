import os
import json
import requests
from serpapi import GoogleSearch

SAFE_DIR = os.path.abspath("demo-files")
os.makedirs(SAFE_DIR, exist_ok=True)

# Only use in local/private environments. In public production, disable or restrict to a secure directory.
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
        "description": "List the files in a directory (the current one by default)",
        "parameters": {
            "type": "object",
            "properties": {
                "directory": {"type": "string", "description": "Directory (optional)"}
            },
            "required": []
        }
    }
}

def is_safe_path(basedir: str, path: str) -> bool:
    base = os.path.abspath(basedir)
    full_path = os.path.abspath(os.path.join(base, path.lstrip('/')))
    return full_path.startswith(base) and not os.path.islink(full_path)

def read_file(path: str):
    if not is_safe_path(SAFE_DIR, path):
        return "Access denied: invalid path or out of permissions"
    full_path = os.path.join(SAFE_DIR, path)
    try:
        with open(full_path, 'r', encoding='utf-8') as f:
            return f.read()[:10000]  # 10KB limit
    except Exception as e:
        return f"Error reading file {path}: {str(e)}"
    
read_file_schema = {
    "type": "function",
    "function": {
        "name": "read_file",
        "description": "Read the contents of a file",
        "parameters": {
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "File path"}
            },
            "required": ["path"]
        }
    }
}


def edit_file(path: str, prev_text: str = '', new_text: str = ''):
    if not is_safe_path(SAFE_DIR, path):
        return "Access denied: invalid path or out of permissions"
    full_path = os.path.join(SAFE_DIR, path)
    try:
        if len(new_text) > 10000:
            return "Content too long (max 10KB)"
        
        existed = os.path.exists(full_path)
        if existed and prev_text:
            with open(full_path, 'r', encoding='utf-8') as f:
                content = f.read()
            if prev_text not in content:
                return f"Text '{prev_text}' not found"
            content = content.replace(prev_text, new_text)
        else:
            content = new_text

        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return f"File {path} {'edited' if existed else 'created'} successfully"
    except Exception as e:
        return f"Error while editing: {str(e)}"

edit_file_schema = {
    "type": "function",
    "function": {
        "name": "edit_file",
        "description": "Edit or create a file by replacing text",
        "parameters": {
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "File path"},
                "prev_text": {"type": "string", "description": "Text to replace (optional)"},
                "new_text": {"type": "string", "description": "New text"}
            },
            "required": ["path", "new_text"]
        }
    }
}


def get_weather(city: str, unit: str = "celsius"):
    try:
        url = f"https://geocoding-api.open-meteo.com/v1/search?name={city}&count=1&language=es&format=json"
        geo = requests.get(url).json()
        if not geo.get("results"):
            return f"I couldn't find the city '{city}'"
        
        lat = geo["results"][0]["latitude"]
        lon = geo["results"][0]["longitude"]

        weather_url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m&timezone=auto"
        data = requests.get(weather_url).json()
        temp = data["current"]["temperature_2m"]
        unit_symbol = "°C" if unit == "celsius" else "°F"
        
        return f"The current temperature in {city} is {temp} degrees."
    except Exception as e:
        return f"Error retrieving weather: {str(e)}"

get_weather_schema = {
    "type": "function",
    "function": {
        "name": "get_weather",
        "description": "Get the current temperature in a city using Open-Meteo (free API)",
        "parameters": {
            "type": "object",
            "properties": {
                "city": {"type": "string", "description": "City name (e.g., Madrid, New York)"},
                "unit": {"type": "string", "enum": ["celsius", "fahrenheit"], "description": "Temperature unit"}
            },
            "required": ["city"]
        }
    }
}


def search_web(query: str, num_results: int = 3) -> str:
    try:
        api_key = os.getenv("SERPAPI_API_KEY")
        if not api_key:
            return "Error: SERPAPI_API_KEY not found in environment variables"

        params = {
            "engine": "google",
            "q": query,
            "num": num_results,
            "api_key": api_key
        }
        search = GoogleSearch(params)
        results = search.get_dict().get("organic_results", [])
        print(results)

        if not results:
            return "I did not find any relevant results"

        output = []
        for res in results:
            title = res.get("title", "Untitled")
            link = res.get("link", "#")
            snippet = res.get("snippet", "")[:300] + "..." if res.get("snippet") else ""
            output.append(f"- {title}\n  Link: {link}\n  {snippet}")

        return "\n\n".join(output)
    except Exception as e:
        return f"Error in SerpApi: {str(e)}"

search_web_schema = {
    "type": "function",
    "function": {
        "name": "search_web",
        "description": "Search for information on Google using SerpApi and return the top results with title, link, and summary.",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Search query"},
                "num_results": {"type": "integer", "description": "Number of results (optional, default 3)"}
            },
            "required": ["query"]
        }
    }
}