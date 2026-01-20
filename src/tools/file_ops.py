import os
import json

def list_files_in_dir(directory: str = '.'):
    print('Herramienta llamada: list_files_in_dir')
    try:
        files = os.listdir(directory)
        return json.dumps({"files": files})
    except Exception as e:
        return json.dumps({"error": str(e)})

def read_file(path: str):
    print("⚙️ Herramienta llamada: read_file")
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        return f"Error al leer el archivo {path}: {str(e)}"

def edit_file(path: str, prev_text: str = '', new_text: str = ''):
    print("⚙️ Herramienta llamada: edit_file")
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

# Schemas OpenAI-style
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



def get_temperature(city: str):
    print("⚙️ Herramienta llamada: get_temperature")
    city_lower = city.lower()
    if city_lower == 'san francisco':
        return '72'
    elif city_lower == 'paris':
        return '75'
    elif city_lower == 'tokio':
        return '73'
    return '70'

# Schema OpenAI-style (usando dict en lugar de Pydantic para simplicidad, pero compatible)
get_temperature_schema = {
    "type": "function",
    "function": {
        "name": "get_temperature",
        "description": "Obtiene la temperatura en una ciudad",
        "parameters": {
            "type": "object",
            "properties": {
                "city": {"type": "string", "description": "Nombre de la ciudad"}
            },
            "required": ["city"]
        }
    }
}