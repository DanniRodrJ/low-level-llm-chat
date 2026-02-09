import json
from .memory.local_memory import MemoryStore
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
    def __init__(self, 
                provider: LLMProvider, 
                memory: MemoryStore,
                session_id: str,
                system: str = '''You are a helpful and accurate assistant.
                - Use the tools available when the question requires it (files, weather, web search).
                - If you don't know something, use a tool instead of making it up.
                - Be concise, clear, and direct.
                - Maintain the context of the conversation''', 
                tools: list = None,
                ):
        self.provider = provider
        self.memory = memory
        self.session_id = session_id
        self.messages = [{"role": "system", "content": system}]
        self.tools = tools or ALL_TOOLS_SCHEMAS
        self.tool_functions = ALL_TOOLS_FUNCTIONS
        
        current_history = self.memory.get_messages(self.session_id)
        if not current_history:
            self.memory.add_message(self.session_id, {"role": "system", "content": system})

    def process_input(self, user_input: str, params: dict = None) -> tuple[str, list[str]]:
        tool_logs = []
        self.memory.add_message(self.session_id, {"role": "user", "content": user_input})
        
        while True:
            history = self.memory.get_messages(self.session_id)
            try:
                response = self.provider.generate_response(history, self.tools, params)
            except ValueError as e:
                print(f"Provider error: {e}")
                return "Sorry, there was an error generating the response", tool_logs

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
                
                self.memory.add_message(self.session_id, {
                    "role": "assistant",
                    "content": None,  
                    "tool_calls": formatted_tool_calls
                })

                for call in response['tool_calls']:
                    fn_name = call['function']['name']
                    try:
                        args = json.loads(call['function']['arguments'])
                    except json.JSONDecodeError:
                        print("Error parsing arguments from the tool call")
                        args = {}

                    log_msg = f"Calling tool: {fn_name} with arguments: {args}"
                    tool_logs.append(log_msg)
                    print(log_msg)

                    if fn_name in self.tool_functions:
                        try:
                            result = self.tool_functions[fn_name](**args)
                        except Exception as e:
                            result = f"Error executing tool: {str(e)}"
                            print(result)

                        self.memory.add_message(self.session_id, {
                            "role": "tool",
                            "tool_call_id": call['id'],
                            "name": fn_name,
                            "content": str(result)
                        })
                    else:
                        self.memory.add_message(self.session_id, {
                            "role": "tool",
                            "tool_call_id": call['id'],
                            "name": fn_name,
                            "content": "Tool not found"
                        })
            else:
                final_content = response['content']
                self.memory.add_message(self.session_id, {"role": "assistant", "content": final_content})
                return final_content, tool_logs