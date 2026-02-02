# Low-level LLM chat

Portfolio project that implements an LLM agent with **manual and low-level tool calling**, without reliance on frameworks such as LangChain or LlamaIndex. The agent maintains persistent conversation memory, executes tool calls with real integration to the file system and external APIs, and exposes an introspection panel that reveals the internal flow (messages, parameters, tool call logs).

Focused on AI Engineering principles: agent design with tool chaining, manual parsing of LLM responses, state management without external dependencies, and frontend security (sanitization against XSS).

## Demo en Vivo

## Video de Demo

## Key Technical Features

- **Low-Level Tool Calling**: Manually implemented with LLM response parsing (OpenAI-style schemas compatible with OpenAI, Hugging Face Inference, and Ollama). Supports sequential and parallel chaining.
- **Integrated Tools**:
  - File system interaction (list, read, edit files) – demonstrates local state mutation.
  - Real weather (free Open-Meteo API) – integration with external APIs without keys.
  - Web search (SerpApi) – structured Google results with error handling.
- **Persistent Memory**: Message history maintained in the agent for multi-turn contexts.
- **Introspection Panel**: Real-time exposure of internal state (messages in memory, inference parameters, detailed logs of tool calls) – facilitates debugging and education.
- **Secure and Responsive Frontend**: React with local state, asynchronous fetch, output sanitization (DOMPurify) to prevent XSS, and UI with Tailwind (responsive, automatic dark mode).
- **Resilience**: Automatic retries on connection failures, status indicator (connecting/online/error).
- **No Heavy Abstractions**: Everything built with core libraries (requests, os, json) to emphasize low-level control.

## Tech Stack
- **Backend**: Python 3.10+, FastAPI, requests, python-dotenv
- **Frontend**: React 18+, Vite, Tailwind CSS 3+, DOMPurify
- **Tools**:
  - File system: OS for native operations.
  - Weather: Open-Meteo (public API without keys).
  - Search: SerpApi (structured JSON from Google).
- **Security**: Sanitización de output con DOMPurify (evita XSS)
- **Suggested deployment**: Vercel (frontend) + Railway/Render (backend)

## Local Installation and Execution

1. Clone the repository: 
```bash
  git clone https://github.com/DanniRodrJ/low-level-llm-chat
  cd low-level-llm-chat
```
2. Backend:
```bash
  cd backend
  python -m venv venv
  source venv/bin/activate  # Windows: venv\Scripts\activate
  pip install -r requirements.txt
  uvicorn app:app --reload --port 8000
```
3. Frontend:
```bash
  cd frontend
  npm install
  npm run dev
```
4. Open: http://localhost:5173
   
## Recommended Test Prompts
These prompts demonstrate tool calling, chaining, and the internal flow panel (open the panel to view logs and memory):

- **Simple file system**: “List the files in the current directory”
- **Reading**: “Read the contents of README.md”
**Editing**: “Create a demo.txt file with ‘Hello from low-level chat’ and then read it”
- **Real weather**: “What is the temperature in Madrid?”
Web search: “Search the internet for ‘Python best practices 2026’”
- **Advanced chaining**: “List the files, search the internet for ‘what is tool calling in LLMs’ and create a tool_calling.txt file with a short summary of the first result”


