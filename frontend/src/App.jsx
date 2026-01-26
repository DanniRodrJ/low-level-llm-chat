import SafeMessage from './components/SafeMessage';
import { useState, useRef, useEffect } from 'react'

function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [provider, setProvider] = useState('openai')
  const [isLoading, setIsLoading] = useState(false)
  const [showFlow, setShowFlow] = useState(false)
  const [currentFlow, setCurrentFlow] = useState(null)
  const [currentLogs, setCurrentLogs] = useState([])
  const messagesEndRef = useRef(null)
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // 'online' | 'offline' | 'connecting' | 'error'
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    setMessages([])
    setInput('')
    setCurrentFlow(null)
    setCurrentLogs([])
  }, [provider])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = { role: 'user', content: input.trim() }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setConnectionStatus('connecting')

    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        const res = await fetch('http://localhost:8000/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: input.trim(),
            provider,
          })
        })

        if (!res.ok) throw new Error('Error en el servidor')

        const data = await res.json()
        const assistantMessage = {
          role: 'assistant',
          content: data.content || data.response || 'Respuesta recibida',
          logs: data.logs || []
        }
        setMessages(prev => [...prev, assistantMessage])
        setCurrentFlow(data.internal_flow)
        setCurrentLogs(data.logs || [])
        setConnectionStatus('online')
        setRetryCount(0)
        break
      } catch (err) {
        attempt++
        if (attempt === maxRetries) {
          setMessages(prev => [...prev, { role: 'error', content: `Error tras ${maxRetries} intentos: ${err.message}` }])
          setConnectionStatus('error')
        } else {
          await new Promise(resolve => setTimeout(resolve, 2000 * attempt)) // delay 2s, 4s, 8s
        }
      }
    }

    setIsLoading(false)
  }

  const newChat = () => {
    setMessages([])
    setInput('')
    setCurrentFlow(null)
    setCurrentLogs([])
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Contenedor del chat */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${showFlow ? 'mr-96' : ''}`}>
        {/* Header */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 shadow-sm z-10">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                AI
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Low-Level Chat
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Proveedor:</span>
              <select
                value={provider}
                onChange={e => setProvider(e.target.value)}
                className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
              >
                <option value="openai">OpenAI</option>
                <option value="hf">Hugging Face</option>
                <option value="ollama">Ollama</option>
              </select>

              <button
                onClick={() => setShowFlow(!showFlow)}
                className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm font-medium hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-all"
              >
                {showFlow ? 'Ocultar flujo' : 'Ver flujo interno'}
              </button>

              <button
                onClick={newChat}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-sm font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
              >
                Nuevo chat
              </button>
            </div>
          </div>
          {/* ← AQUÍ VA EL INDICADOR DE CONEXIÓN */}
          <div className="max-w-5xl mx-auto px-6 text-xs mt-1 text-center">
            {connectionStatus === 'connecting' && <span className="text-amber-600 dark:text-amber-400">Conectando al backend...</span>}
            {connectionStatus === 'error' && <span className="text-red-600 dark:text-red-400">Error de conexión. Reintentando...</span>}
            {connectionStatus === 'online' && <span className="text-green-600 dark:text-green-400">Conectado</span>}
          </div>
        </header>

        {/* Mensajes */}
        <main className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-5xl mx-auto space-y-6">
            {messages.length === 0 && (
              <div className="text-center py-20 text-slate-500 dark:text-slate-400">
                <p className="text-xl font-medium">¡Bienvenido!</p>
                <p className="mt-3">Elige un proveedor y prueba con comandos como listar archivos, leer/editar texto o consultar temperaturas.</p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-lg shadow-sm bg-indigo-100 dark:bg-indigo-900">
                    {msg.role === 'assistant' ? (
                      <span className="text-indigo-700 dark:text-indigo-300">🤖</span>
                    ) : msg.role === 'error' ? (
                      <span className="text-red-600">⚠️</span>
                    ) : (
                      <span className="text-blue-700 dark:text-blue-300">👤</span>
                    )}
                  </div>

                  {/* Burbuja segura - SIN div extra */}
                  <SafeMessage
                    content={msg.content}
                    className={`max-w-[75%] px-5 py-3.5 rounded-2xl shadow-md ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white'
                        : msg.role === 'error'
                        ? 'bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-200 border border-red-200 dark:border-red-800/50'
                        : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700'
                    }`}
                  />
                </div>

                {msg.role === 'assistant' && msg.logs && msg.logs.length > 0 && (
                  <div className="mt-2 pl-12 max-w-[75%] space-y-1.5">
                    {msg.logs.map((log, logIdx) => {
                      // Detectamos tipo de tool por palabras clave (puedes mejorar con regex o backend)
                      let icon = '🔧';
                      let bgColor = 'bg-indigo-50 dark:bg-indigo-950/30';
                      let textColor = 'text-indigo-700 dark:text-indigo-300';

                      if (log.includes('get_weather')) {
                        icon = '🌤️';
                        bgColor = 'bg-sky-50 dark:bg-sky-950/30';
                        textColor = 'text-sky-700 dark:text-sky-300';
                      } else if (log.includes('search_web')) {
                        icon = '🔍';
                        bgColor = 'bg-emerald-50 dark:bg-emerald-950/30';
                        textColor = 'text-emerald-700 dark:text-emerald-300';
                      } else if (log.includes('list_files') || log.includes('read_file') || log.includes('edit_file')) {
                        icon = '📁';
                        bgColor = 'bg-amber-50 dark:bg-amber-950/30';
                        textColor = 'text-amber-700 dark:text-amber-300';
                      }

                      return (
                        <div
                          key={logIdx}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${bgColor} border-l-4 border-current ${textColor}`}
                        >
                          <span className="text-lg">{icon}</span>
                          <p className="font-medium text-sm">{log}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                  <span className="text-indigo-700 dark:text-indigo-300">🤖</span>
                </div>
                <div className="bg-white dark:bg-slate-800 px-5 py-3.5 rounded-2xl shadow-md flex items-center gap-3">
                  <div className="flex space-x-2">
                    <div className="w-2.5 h-2.5 bg-slate-500 dark:bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2.5 h-2.5 bg-slate-500 dark:bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2.5 h-2.5 bg-slate-500 dark:bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-300">Pensando...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* Sidebar de flujo interno */}
        <div
          className={`fixed right-0 top-0 h-full w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl overflow-y-auto transition-transform duration-300 ease-in-out transform ${
            showFlow ? 'translate-x-0' : 'translate-x-full'
          } z-50`}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Flujo Interno</h2>
              <button
                onClick={() => setShowFlow(false)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-sm hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
              >
                ×
              </button>
            </div>

            {currentFlow ? (
              <div className="space-y-6 text-sm">
                <div>
                  <h3 className="font-semibold mb-2 text-indigo-600 dark:text-indigo-400">Logs de Tools</h3>
                  <pre className="bg-indigo-50 dark:bg-indigo-950/30 p-4 rounded-lg overflow-x-auto text-indigo-800 dark:text-indigo-200">
                    {JSON.stringify(currentFlow.tool_logs || [], null, 2)}
                  </pre>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-indigo-600 dark:text-indigo-400">Mensajes en Memoria</h3>
                  <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg overflow-x-auto text-slate-800 dark:text-slate-200 max-h-64 overflow-y-auto">
                    {JSON.stringify(currentFlow.messages || [], null, 2)}
                  </pre>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-indigo-600 dark:text-indigo-400">Parámetros Usados</h3>
                  <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg overflow-x-auto text-slate-800 dark:text-slate-200">
                    {JSON.stringify(currentFlow.params || {}, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <p className="text-slate-500 dark:text-slate-400 text-center py-10">
                Envía un mensaje para ver el flujo interno
              </p>
            )}
          </div>
        </div>

        {/* Input */}
        <footer className="p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-lg">
          <div className="max-w-5xl mx-auto flex gap-3">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !isLoading && sendMessage()}
              placeholder="Escribe tu mensaje..."
              disabled={isLoading}
              className="flex-1 px-6 py-4 border border-slate-300 dark:border-slate-700 rounded-full bg-white/90 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-inner disabled:opacity-60 transition-all"
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-medium rounded-full shadow-lg disabled:opacity-50 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <span>Enviar</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default App