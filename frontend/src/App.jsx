import SafeMessage from './components/SafeMessage';
import InternalFlowPanel from './components/InternalFlowPanel';
import { useState, useRef, useEffect } from 'react';
import { useChatStream } from './hooks/useChatStream';

function App() {
  const [sessionId, setSessionId] = useState(() => {
    const saved = localStorage.getItem('chatSessionId');
    if (saved) return saved;
    const newId = 'sess_' + crypto.randomUUID().slice(0, 8);
    localStorage.setItem('chatSessionId', newId);
    return newId;
  });

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [provider, setProvider] = useState('openai');
  const [showFlow, setShowFlow] = useState(false);
  const [currentFlow, setCurrentFlow] = useState(null);
  const [currentLogs, setCurrentLogs] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('online');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const { sendMessage: sendMessageStream, isLoading: isStreaming } = useChatStream(sessionId, provider);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setMessages([]);
    setInput('');
    setCurrentFlow(null);
    setCurrentLogs([]);
    inputRef.current?.focus();
  }, [provider]);

  const handleSendMessage = async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage = { 
      role: 'user', 
      content: input.trim(), 
      timestamp: Date.now() 
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    setConnectionStatus('connecting');

    try {
      let finalContent = '';
      let finalLogs = [];
      let finalFlow = null;

      await sendMessageStream(
        input.trim(),
        null, 
        (completeData) => {
          finalContent = completeData.content || completeData.response || 'Sin respuesta';
          finalLogs = completeData.logs || [];
          finalFlow = completeData.internal_flow || null;
        }
      );

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: finalContent, 
        logs: finalLogs,
        timestamp: Date.now()
      }]);
      
      setCurrentFlow(finalFlow);
      setCurrentLogs(finalLogs);
      setConnectionStatus('online');

    } catch (err) {
      setMessages(prev => [...prev, { 
        role: 'error', 
        content: `Error: ${err.message || 'No se pudo conectar al servidor'}`,
        timestamp: Date.now()
      }]);
      setConnectionStatus('error');
    }
  };

  const newChat = () => {
    if (window.confirm('¿Iniciar un nuevo chat? Se perderá el historial actual.')) {
      setMessages([]);
      setInput('');
      setCurrentFlow(null);
      setCurrentLogs([]);
      localStorage.removeItem('chatSessionId');
      setSessionId('sess_' + crypto.randomUUID().slice(0, 8));
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
    if (e.key === 'n' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      newChat();
    }
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900">
      {/* Main chat container */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${showFlow ? 'mr-96' : ''}`}>
        
        {/* Header */}
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 px-6 py-4 shadow-sm z-10">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
            
            {/* Logo/title on the left */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                AI
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
                  Low-Level Chat
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">See how LLMs work internally</p>
              </div>
            </div>

            {/* Connection indicator in the center */}
            <div className="order-last sm:order-none sm:absolute sm:left-1/2 sm:transform sm:-translate-x-1/2">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg h-10">
                <div className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'online' ? 'bg-green-500 animate-pulse' :
                  connectionStatus === 'connecting' ? 'bg-amber-500 animate-pulse' :
                  'bg-red-500 animate-pulse'
                }`}></div>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  {connectionStatus === 'online' ? 'Online' :
                  connectionStatus === 'connecting' ? 'Connecting...' :
                  'Connection error'}
                </span>
              </div>
            </div>

            {/* Controls on the right */}
            <div className="flex items-center gap-2">
              {/* Unlabeled supplier */}
              <div className="relative">
                <select
                  value={provider}
                  onChange={e => setProvider(e.target.value)}
                  className="h-10 px-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all pr-8 appearance-none min-w-[140px]"
                  aria-label="AI provider"
                  title="Change AI provider"
                >
                  <option value="openai">OpenAI GPT</option>
                  <option value="hf">Hugging Face</option>
                  <option value="ollama">Ollama</option>
                </select>
              </div>

              <button
                onClick={() => setShowFlow(!showFlow)}
                className="h-10 px-3 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm font-medium hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-all flex items-center gap-2"
              >
                <span className="text-lg">🔍</span>
                <span className="whitespace-nowrap">{showFlow ? 'Hide' : 'View flow'}</span>
              </button>

              <button
                onClick={newChat}
                className="h-10 px-3 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg text-sm font-medium hover:bg-slate-300 dark:hover:bg-slate-700 transition-all flex items-center gap-2"
                title="New chat (Ctrl+N)"
              >
                <span className="whitespace-nowrap">New chat</span>
              </button>
            </div>
          </div>
        </header>

        {/* Message Area */}
        <main className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-5xl mx-auto space-y-6">
            {messages.length === 0 && (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-indigo-100 to-blue-100 dark:from-indigo-900/30 dark:to-blue-900/30 flex items-center justify-center">
                  <span className="text-3xl">🤖</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                  Explore the inner workings of LLMs
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                  <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="text-2xl mb-2">🔧</div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Tools in action</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">See how the LLM decides which tool to use</p>
                  </div>
                  <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="text-2xl mb-2">💭</div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Full context</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">View the entire history stored in the model's memory</p>
                  </div>
                  <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="text-2xl mb-2">⚙️</div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Parameters</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Exact configuration used in each call</p>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl max-w-md mx-auto">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-2">💡 Try these examples:</p>
                  <div className="space-y-2">
                    <button 
                      onClick={() => setInput("What's the weather like in Madrid?")}
                      className="w-full text-left px-3 py-2 text-sm bg-white dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-900 dark:text-slate-100"
                    >
                      🌤️ "What's the weather like in Madrid?"
                    </button>
                    <button 
                      onClick={() => setInput("List the files in my current directory")}
                      className="w-full text-left px-3 py-2 text-sm bg-white dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-900 dark:text-slate-100"
                    >
                      📄 "Create a file named demo.txt with the text ‘Hello from low-level LLM chat’."
                    </button>
                    <button 
                      onClick={() => setInput("Search for information about LLMs")}
                      className="w-full text-left px-3 py-2 text-sm bg-white dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-900 dark:text-slate-100"
                    >
                      🔍 "Search for information about LLMs"
                    </button>
                  </div>
                </div>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={`${msg.role}-${msg.timestamp}-${idx}`}
                className={`flex flex-col ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-lg shadow-sm ${
                    msg.role === 'assistant' 
                      ? 'bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900' 
                      : msg.role === 'error' 
                      ? 'bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900 dark:to-orange-900'
                      : 'bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900'
                  }`}>
                    {msg.role === 'assistant' ? (
                      <span className="text-indigo-700 dark:text-indigo-300">🤖</span>
                    ) : msg.role === 'error' ? (
                      <span className="text-red-600 dark:text-red-400">⚠️</span>
                    ) : (
                      <span className="text-blue-900 dark:text-blue-200 drop-shadow-sm">🧑‍💻</span>
                    )}
                  </div>

                  <SafeMessage
                    content={msg.content}
                    isStreaming={msg.isStreaming}
                    className={`max-w-[75%] px-5 py-3.5 rounded-2xl shadow-md transition-all duration-300 ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white'
                        : msg.role === 'error'
                        ? 'bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/40 dark:to-orange-950/40 text-red-900 dark:text-red-100 border border-red-200 dark:border-red-800/50'
                        : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700'
                    } ${msg.isStreaming ? 'border-2 border-dashed border-indigo-300 dark:border-indigo-700' : ''}`}
                  />
                </div>

                {/* Tool logs */}
                {msg.role === 'assistant' && msg.logs && msg.logs.length > 0 && (
                <div className="mt-2 pl-12 max-w-[75%]">
                  <div className="flex flex-wrap gap-2">
                    {msg.logs.map((log, logIdx) => {
                      let icon = '🔧';
                      let bgColor = 'bg-indigo-50 dark:bg-indigo-900/40';
                      let textColor = 'text-indigo-900 dark:text-indigo-200';
                      let borderColor = 'border-indigo-200 dark:border-indigo-800';
                      
                      if (log.toLowerCase().includes('weather')) {
                        icon = '🌤️';
                        bgColor = 'bg-sky-50 dark:bg-sky-900/40';
                        textColor = 'text-sky-900 dark:text-sky-200';
                        borderColor = 'border-sky-200 dark:border-sky-800';
                      } else if (log.toLowerCase().includes('search')) {
                        icon = '🔍';
                        bgColor = 'bg-emerald-50 dark:bg-emerald-900/40';
                        textColor = 'text-emerald-900 dark:text-emerald-200';
                        borderColor = 'border-emerald-200 dark:border-emerald-800';
                      } else if (log.toLowerCase().includes('file')) {
                        icon = '📁';
                        bgColor = 'bg-amber-50 dark:bg-amber-900/40';
                        textColor = 'text-amber-900 dark:text-amber-200';
                        borderColor = 'border-amber-200 dark:border-amber-800';
                      }

                      return (
                        <div
                          key={logIdx}
                          className={`w-full px-4 py-3 rounded-xl ${bgColor} border ${borderColor} shadow-sm hover:shadow-md transition-all`}
                        >
                          <div className="flex items-start gap-3">
                            {/* Icono */}
                            <span className="text-xl">{icon}</span>
                            
                            {/* Mensaje completo con formato */}
                            <div className="flex-1 min-w-0">
                              <div className={`text-sm font-mono whitespace-pre-wrap break-words ${textColor}`}>
                                {log}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

                {/* Timestamp */}
                <div className={`text-xs text-slate-500 dark:text-slate-400 mt-1 ${
                  msg.role === 'user' ? 'pr-12' : 'pl-12'
                }`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}

            {isStreaming && (
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 flex items-center justify-center">
                  <span className="text-indigo-700 dark:text-indigo-300">🤖</span>
                </div>
                <div className="bg-white dark:bg-slate-800 px-5 py-3.5 rounded-2xl shadow-md flex items-center gap-3 border-2 border-dashed border-indigo-300 dark:border-indigo-700">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Procesando</span>
                  <div className="flex space-x-1.5">
                    <div className="w-2 h-2 bg-indigo-500 dark:bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-indigo-500 dark:bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-indigo-500 dark:bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* Input for messages */}
        <footer className="p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/50 dark:border-slate-800/50 shadow-lg">
          <div className="max-w-5xl mx-auto">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message... (Enter to send)"
                  disabled={isStreaming}
                  className="w-full px-6 py-4 border border-slate-300 dark:border-slate-700 rounded-full bg-white/90 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-inner disabled:opacity-60 transition-all pr-12"
                  aria-label="Type your message"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500">
                  {isStreaming ? (
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div>
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></div>
                    </div>
                  ) : (
                    <span className="text-xs">↵ Enter</span>
                  )}
                </div>
              </div>
              
              <button
                onClick={handleSendMessage}
                disabled={isStreaming || !input.trim()}
                className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-medium rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
                aria-label={isStreaming ? "Sending message..." : "Send message"}
              >
                {isStreaming ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <span>Send</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </>
                )}
              </button>
            </div>
            
            {/* Keyboard shortcuts */}
            <div className="mt-2 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                💡 <strong>Shortcuts:</strong> Enter to send • Use examples above to test tools
              </p>
            </div>
          </div>
        </footer>
      </div>

      {/* Internal flow panel */}
      <InternalFlowPanel 
        currentFlow={currentFlow}
        showFlow={showFlow}
        setShowFlow={setShowFlow}
      />
    </div>
  );
}

export default App;