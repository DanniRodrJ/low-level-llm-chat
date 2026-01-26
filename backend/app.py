from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, Optional

# Importa tu lógica existente (ajusta paths según tu estructura)
from src.agent import Agent
from src.providers.factory import ProviderFactory  # tu factory para crear providers

app = FastAPI(
    title="Low-Level LLM Chat API",
    description="API para el chatbot low-level con switch de providers",
    version="0.1.0"
)

# CORS - permite que el frontend en :5173 (Vite) pueda llamar
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Almacenamiento en memoria de agentes por sesión
sessions: Dict[str, Agent] = {}
print(sessions)

class ChatRequest(BaseModel):
    session_id: str = Field(default_factory=lambda: "sess_" + __import__("uuid").uuid4().hex[:8])
    message: str = Field(..., min_length=1, description="El mensaje del usuario (obligatorio)")
    provider: str = Field(..., description="Proveedor: 'openai', 'hf' o 'ollama' (obligatorio)")
    temperature: float = Field(0.7, ge=0.0, le=2.0, description="Temperatura de inferencia")

@app.get("/health")
async def health_check():
    return {"status": "ok", "sessions_active": len(sessions)}

@app.post("/chat")
async def chat(request: ChatRequest):
    """
    Endpoint principal del chat.
    Recibe mensaje + provider y devuelve la respuesta completa del agente.
    """
    if request.provider not in ["openai", "hf", "ollama"]:
        raise HTTPException(
            status_code=422,
            detail="Proveedor inválido. Usa 'openai', 'hf' o 'ollama'."
        )

    session_id = request.session_id

    # Crear agente si no existe la sesión
    if session_id not in sessions:
        try:
            provider_instance = ProviderFactory.get_provider(request.provider)
            sessions[session_id] = Agent(provider_instance)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error al inicializar el proveedor {request.provider}: {str(e)}"
            )

    agent = sessions[session_id]

    try:
        # Llamada al agente (tu lógica existente)
        response, tool_logs = agent.process_input(
            user_input=request.message,
            params={"temperature": request.temperature}
        )
        
        # Flujo interno: mensajes del agente y params
        internal_flow = {
            "messages": agent.messages,  # Historia completa de mensajes
            "params": {"temperature": request.temperature},  # Parámetros usados
            "tool_logs": tool_logs  # Logs de tool calls
        }
        
        print(internal_flow)

        return {
            "role": "assistant",
            "content": response,
            "provider_used": request.provider,
            "session_id": session_id,     
            "logs": tool_logs,            
            "internal_flow": internal_flow 
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error durante la generación: {str(e)}"
        )