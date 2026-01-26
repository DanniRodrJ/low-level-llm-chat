import json
from .providers.base import LLMProvider
from .tools.file_ops import (
    list_files_schema, read_file_schema, edit_file_schema, get_weather_schema, search_web_schema,
    list_files_in_dir, read_file, edit_file, get_weather, search_web
)

ALL_TOOLS_SCHEMAS = [
    list_files_schema,
    read_file_schema,
    edit_file_schema,
    get_weather_schema,
    search_web_schema
]

ALL_TOOLS_FUNCTIONS = {
    'list_files_in_dir': list_files_in_dir,
    'read_file': read_file,
    'edit_file': edit_file,
    'get_weather': get_weather,
    'search_web': search_web
}

class Agent:
    def __init__(self, provider: LLMProvider, system: str = "Eres un asistente útil que habla español y eres muy conciso con tus respuestas.", tools: list = None):
        self.provider = provider
        self.messages = [{"role": "system", "content": system}]
        self.tools = tools or ALL_TOOLS_SCHEMAS
        self.tool_functions = ALL_TOOLS_FUNCTIONS

    def process_input(self, user_input: str, params: dict = None) -> tuple[str, list[str]]:
        tool_logs = []
        self.messages.append({"role": "user", "content": user_input})
        while True:
            try:
                response = self.provider.generate_response(self.messages, self.tools, params)
            except ValueError as e:
                print(f"Error en provider: {e}")
                return "Lo siento, hubo un error al generar la respuesta.", tool_logs

            if response['tool_calls']:
                formatted_tool_calls = [
                    {
                        "id": call["id"],
                        "type": "function",
                        "function": {
                            "name": call["function"]["name"],
                            "arguments": call["function"]["arguments"]
                        }
                    }
                    for call in response['tool_calls']
                ]

                # Agregamos el mensaje del assistant con tool_calls correctamente formateado
                self.messages.append({
                    "role": "assistant",
                    "content": None,  
                    "tool_calls": formatted_tool_calls
                })

                # Ejecutamos cada tool call
                for call in response['tool_calls']:
                    fn_name = call['function']['name']
                    try:
                        args = json.loads(call['function']['arguments'])
                    except json.JSONDecodeError:
                        print("Error parseando argumentos de la tool call")
                        args = {}

                    log_msg = f"Llamando a herramienta: {fn_name} con args: {args}"
                    tool_logs.append(log_msg)
                    print(log_msg)

                    if fn_name in self.tool_functions:
                        try:
                            result = self.tool_functions[fn_name](**args)
                        except Exception as e:
                            result = f"Error ejecutando herramienta: {str(e)}"
                            print(result)

                        self.messages.append({
                            "role": "tool",
                            "tool_call_id": call['id'],
                            "name": fn_name,
                            "content": str(result)
                        })
                    else:
                        self.messages.append({
                            "role": "tool",
                            "tool_call_id": call['id'],
                            "name": fn_name,
                            "content": "Herramienta no encontrada"
                        })
            else:
                final_content = response['content']
                self.messages.append({"role": "assistant", "content": final_content})
                return final_content, tool_logs