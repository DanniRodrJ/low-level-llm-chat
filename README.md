# Titulo

# Return del backend hacia el frontend

```json
{
  "role": "assistant",
  "content": "El archivo prueba.txt fue creado exitosamente",
  "provider_used": "openai",
  "session_id": "sess_abc12345",
  "logs": [
    "Llamando a herramienta: edit_file con args: {'path': 'prueba.txt', 'new_text': 'Hola mundo'}"
  ],
  "internal_flow": {
    "messages": [
      {"role": "system", "content": "Eres un asistente útil..."},
      {"role": "user", "content": "Crea un archivo prueba.txt con Hola mundo"},
      {"role": "assistant", "content": null, "tool_calls": [...]},
      {"role": "tool", "content": "Archivo prueba.txt creado exitosamente", ...}
    ],
    "params": {"temperature": 0.7},
    "tool_logs": ["Llamando a herramienta: edit_file con args: ..."]
  }
}
```

## Terminal

```bash
# backend/
uvicorn app:app --reload --port 8000 
# frontend/
npm run dev 
```


Schema: OpenAI-style (compatible con OpenAI, Hugging Face y Ollama)