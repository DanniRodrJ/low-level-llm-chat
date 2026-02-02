import { useState } from 'react';

const InternalFlowPanel = ({ currentFlow, showFlow, setShowFlow }) => {
  const [expandedSections, setExpandedSections] = useState({
    tool_logs: true,
    messages: false,
    params: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getToolIcon = (toolName) => {
    const icons = {
      'get_weather': '🌤️',
      'search_web': '🔍',
      'list_files': '📁',
      'read_file': '📄',
      'edit_file': '✏️',
      'default': '🔧'
    };
    
    // Extraer el nombre de la herramienta del log
    for (const [key, icon] of Object.entries(icons)) {
      if (toolName.toLowerCase().includes(key)) {
        return icon;
      }
    }
    return icons.default;
  };

  return (
    <div className={`fixed right-0 top-0 h-full w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl overflow-y-auto transition-transform duration-300 ease-in-out transform ${
      showFlow ? 'translate-x-0' : 'translate-x-full'
    } z-50`}>
      <div className="p-6">
        {/* Panel header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Internal Flow</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Explore how LLM works</p>
          </div>
          <button
            onClick={() => setShowFlow(false)}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-all"
            aria-label="Cerrar panel"
          >
            ×
          </button>
        </div>

        {currentFlow ? (
          <div className="space-y-4">
            {/* Statistical summary */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 p-4 rounded-lg border border-indigo-100 dark:border-indigo-900">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                    {currentFlow.tool_logs?.length || 0}
                  </p>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">Tools</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {currentFlow.messages?.length || 0}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Messages</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                    {Math.round(JSON.stringify(currentFlow).length / 4) || 0}
                  </p>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Tokens ≈</p>
                </div>
              </div>
            </div>

            {/* Tools Logs Section */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection('tool_logs')}
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 flex justify-between items-center hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">🔧</span>
                  <div className="text-left">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">Calls to Tools</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {currentFlow.tool_logs?.length || 0} executions
                    </p>
                  </div>
                </div>
                <span className="text-slate-500 text-lg">
                  {expandedSections.tool_logs ? '−' : '+'}
                </span>
              </button>
              
              {expandedSections.tool_logs && currentFlow.tool_logs && (
                <div className="p-4 bg-white dark:bg-slate-900">
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {currentFlow.tool_logs.map((log, index) => {
                      const toolMatch = log.match(/^(\w+)/);
                      const toolName = toolMatch ? toolMatch[1] : 'unknown';
                      
                      return (
                        <div
                          key={index}
                          className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xl">{getToolIcon(toolName)}</span>
                            <span className="font-medium text-slate-900 dark:text-slate-100">
                              {toolName.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <pre className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap font-mono">
                            {log}
                          </pre>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Memorial Messages Section */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection('messages')}
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 flex justify-between items-center hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">💭</span>
                  <div className="text-left">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">Context of the LLM</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {currentFlow.messages?.length || 0} memorial messages
                    </p>
                  </div>
                </div>
                <span className="text-slate-500 text-lg">{expandedSections.messages ? '−' : '+'}</span>
              </button>
              
              {expandedSections.messages && currentFlow.messages && (
                <div className="p-4 bg-white dark:bg-slate-900">
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {currentFlow.messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg text-sm ${
                          msg.role === 'user'
                            ? 'bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900'
                            : msg.role === 'assistant'
                            ? 'bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900'
                            : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${
                              msg.role === 'user' ? 'bg-blue-500' : 
                              msg.role === 'assistant' ? 'bg-green-500' : 'bg-slate-500'
                            }`}></span>
                            <span className="font-medium text-slate-700 dark:text-slate-300 capitalize">
                              {msg.role}
                            </span>
                          </div>
                          <span className="text-xs text-slate-500">
                            {msg.content?.length || 0} chars
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 line-clamp-2">
                          {msg.content || 'No content'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Parameters Section */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection('params')}
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 flex justify-between items-center hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">⚙️</span>
                  <div className="text-left">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">Configuration</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Model parameters
                    </p>
                  </div>
                </div>
                <span className="text-slate-500 text-lg">{expandedSections.params ? '−' : '+'}</span>
              </button>
              
              {expandedSections.params && currentFlow.params && (
                <div className="p-4 bg-white dark:bg-slate-900">
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(currentFlow.params).map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                          {key.replace(/_/g, ' ')}
                        </label>
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono text-slate-700 dark:text-slate-300">
                          {value?.toString() || 'N/A'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-10">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-indigo-100 to-blue-100 dark:from-indigo-900/30 dark:to-blue-900/30 flex items-center justify-center">
              <span className="text-2xl">🔍</span>
            </div>
            <p className="text-slate-700 dark:text-slate-300 font-medium">
              Waiting for interaction
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Send a message to see the internal flow step by step
            </p>
            <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <p className="text-xs text-slate-600 dark:text-slate-400">Prueba con:</p>
              <p className="text-sm font-mono text-slate-700 dark:text-slate-300 mt-1">
                "What's the weather like in Madrid?"<br/>
                "Create a file named demo.txt with the text ‘Hello from low-level LLM chat’."<br/>
                "Search for information about LLMs"
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InternalFlowPanel;