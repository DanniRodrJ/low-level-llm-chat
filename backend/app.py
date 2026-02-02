from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, Optional
from src.agent import Agent
from src.providers.factory import ProviderFactory 

app = FastAPI(
    title="Low-Level LLM Chat API",
    description="API for low-level chatbot with provider switching",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

sessions: Dict[str, Agent] = {}
class ChatRequest(BaseModel):
    session_id: str = Field(default_factory=lambda: "sess_" + __import__("uuid").uuid4().hex[:8])
    message: str = Field(..., min_length=1, description="User message (required)")
    provider: str = Field(..., description="Provider: 'openai', 'hf' o 'ollama' (required)")
    temperature: float = Field(0.7, ge=0.0, le=2.0, description="Inference temperature")

@app.get("/health")
async def health_check():
    return {"status": "ok", "sessions_active": len(sessions)}

@app.post("/chat")
async def chat(request: ChatRequest):

    if request.provider not in ["openai", "hf", "ollama"]:
        raise HTTPException(
            status_code=422,
            detail="Invalid supplier. Usa 'openai', 'hf' o 'ollama'."
        )

    session_id = request.session_id

    if session_id not in sessions:
        try:
            provider_instance = ProviderFactory.get_provider(request.provider)
            sessions[session_id] = Agent(provider_instance)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error initializing the provider {request.provider}: {str(e)}"
            )

    agent = sessions[session_id]

    try:
        response, tool_logs = agent.process_input(
            user_input=request.message,
            params={"temperature": request.temperature}
        )
        
        internal_flow = {
            "messages": agent.messages, 
            "params": {"temperature": request.temperature}, 
            "tool_logs": tool_logs 
        }

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
            detail=f"Error during generation: {str(e)}"
        )