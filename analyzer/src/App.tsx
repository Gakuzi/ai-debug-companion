import React, { useState } from 'react';

function App() {
  // State variables
  const [activeSection, setActiveSection] = useState<'home' | 'integration' | 'monitoring' | 'tupik' | 'settings'>('home');
  const [logs, setLogs] = useState<any[]>([]);
  const [snapshot, setSnapshot] = useState<any>(null);
  const [summary, setSummary] = useState<string>('');
  const [tupikDesc, setTupikDesc] = useState<string>('');
  const [devPrompt, setDevPrompt] = useState<string>('');

  // Settings state
  const [collectorUrl, setCollectorUrl] = useState<string>('');
  const [projectId, setProjectId] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [geminiApiKey, setGeminiApiKey] = useState<string>('');

  // Load settings from localStorage on component mount
  React.useEffect(() => {
    const savedCollectorUrl = localStorage.getItem('collectorUrl') || '';
    const savedProjectId = localStorage.getItem('projectId') || '';
    const savedToken = localStorage.getItem('token') || '';
    const savedGeminiApiKey = localStorage.getItem('geminiApiKey') || '';
    
    setCollectorUrl(savedCollectorUrl);
    setProjectId(savedProjectId);
    setToken(savedToken);
    setGeminiApiKey(savedGeminiApiKey);
  }, []);

  // Save settings to localStorage
  const saveSettings = () => {
    localStorage.setItem('collectorUrl', collectorUrl);
    localStorage.setItem('projectId', projectId);
    localStorage.setItem('token', token);
    localStorage.setItem('geminiApiKey', geminiApiKey);
    alert('Настройки сохранены!');
  };

  // Function to handle bundle loading
  const onLoadBundle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsedData = JSON.parse(content);
        setLogs(parsedData.logs || []);
        setSnapshot(parsedData);
        setSummary(''); // Clear previous summary
        alert('Бандл загружен!');
      } catch (error) {
        alert('Ошибка при загрузке бандла: ' + (error as Error).message);
      }
    };
    reader.readAsText(file);
  };

  // Function to analyze project
  const analyzeProject = async () => {
    if (!collectorUrl || !projectId || !token) {
      alert('Пожалуйста, заполните все настройки!');
      return;
    }

    try {
      const response = await fetch(`${collectorUrl}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ logs }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSummary(JSON.stringify(data, null, 2));
      alert('Анализ готов!');
    } catch (error) {
      alert('Ошибка при анализе: ' + (error as Error).message);
    }
  };

  // Function to analyze tupik situations
  const tupikAnalyze = async () => {
    if (!collectorUrl || !projectId || !token) {
      alert('Пожалуйста, заполните все настройки!');
      return;
    }

    if (!tupikDesc.trim()) {
      alert('Пожалуйста, опишите тупик!');
      return;
    }

    try {
      const response = await fetch(`${collectorUrl}/tupik/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ description: tupikDesc }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setDevPrompt(data.instructionPrompt);
      alert('Промт готов!');
    } catch (error) {
      alert('Ошибка при анализе тупика: ' + (error as Error).message);
    }
  };

  // Function to copy text to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Скопировано в буфер обмена!');
    }).catch(err => {
      alert('Ошибка при копировании: ' + err);
    });
  };

  return (
    <div className="bg-gray-100 min-h-screen font-sans p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800">AI Debug Companion</h1>
          <p className="text-gray-600 mt-2">ИИ-ассистент для анализа и исправления ошибок</p>
        </header>

        {/* Navigation */}
        <nav className="mb-8">
          <ul className="flex flex-wrap justify-center gap-4 md:gap-8 border-b border-gray-300 pb-2">
            <li>
              <button 
                onClick={() => setActiveSection('home')}
                className={`px-3 py-2 rounded-lg transition ${activeSection === 'home' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-200'}`}
              >
                Главная
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveSection('integration')}
                className={`px-3 py-2 rounded-lg transition ${activeSection === 'integration' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-200'}`}
              >
                Интеграция
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveSection('monitoring')}
                className={`px-3 py-2 rounded-lg transition ${activeSection === 'monitoring' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-200'}`}
              >
                Мониторинг
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveSection('tupik')}
                className={`px-3 py-2 rounded-lg transition ${activeSection === 'tupik' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-200'}`}
              >
                Анализ Тупиков
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveSection('settings')}
                className={`px-3 py-2 rounded-lg transition ${activeSection === 'settings' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-200'}`}
              >
                Настройки
              </button>
            </li>
          </ul>
        </nav>

        {/* Main Section */}
        {activeSection === 'home' && (
          <section className="mb-12 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Главная</h2>
            <p className="text-gray-700 mb-6">
              Добро пожаловать в AI Debug Companion - интеллектуальный инструмент для анализа и исправления ошибок в ваших приложениях.
            </p>
            <button 
              onClick={() => setActiveSection('integration')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition hover:shadow-lg"
            >
              Начать работу
            </button>
          </section>
        )}

        {/* Integration Section */}
        {activeSection === 'integration' && (
          <section className="mb-12 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Интеграция</h2>
            <p className="text-gray-700 mb-4">
              Чтобы начать использовать AI Debug Companion, установите пакет и инициализируйте агент:
            </p>
            
            <div className="bg-gray-800 text-gray-100 p-4 rounded mb-4 font-mono text-sm">
              <pre>npm i ai-debug-companion-agent</pre>
            </div>
            
            <div className="bg-gray-800 text-gray-100 p-4 rounded mb-4 font-mono text-sm">
              <pre>{`import { initLogger, BlackBox } from 'ai-debug-companion-agent';

initLogger({
  projectId: '${projectId || 'test'}',
  collectorUrl: '${collectorUrl || '[Collector URL]'}'
});`}</pre>
            </div>
            
            <button 
              onClick={() => copyToClipboard(`npm i ai-debug-companion-agent\n\nimport { initLogger, BlackBox } from 'ai-debug-companion-agent';\n\ninitLogger({\n  projectId: '${projectId || 'test'}',\n  collectorUrl: '${collectorUrl || '[Collector URL]'}'\n});`)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition hover:shadow-lg"
            >
              Скопировать код
            </button>
          </section>
        )}

        {/* Monitoring Section */}
        {activeSection === 'monitoring' && (
          <section className="mb-12 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Мониторинг</h2>
            <p className="text-gray-700 mb-4">
              Загрузите JSON-бандл для анализа структуры проекта, ошибок и интеграций:
            </p>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Загрузить JSON-бандл:</label>
              <input 
                type="file" 
                accept=".json"
                onChange={onLoadBundle}
                className="border border-gray-300 rounded-lg px-3 py-2 w-full"
              />
            </div>
            
            {snapshot && (
              <div className="mt-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Информация о проекте</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-600">Количество логов</p>
                    <p className="text-2xl font-bold">{logs.length}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-600">Дата создания</p>
                    <p className="text-2xl font-bold">{snapshot.meta?.createdAt ? new Date(snapshot.meta.createdAt).toLocaleString() : 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-600">Фильтр</p>
                    <p className="text-2xl font-bold">{snapshot.meta?.filter || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Ошибки</h4>
                  <div className="bg-gray-50 p-4 rounded-lg max-h-60 overflow-y-auto">
                    {logs.filter(log => log.level === 'ERROR' || log.level === 'FATAL').length > 0 ? (
                      <ul className="list-disc pl-5">
                        {logs.filter(log => log.level === 'ERROR' || log.level === 'FATAL').map((log, index) => (
                          <li key={index} className="mb-1">
                            <span className="font-mono">[{new Date(log.ts).toLocaleTimeString()}]</span> {log.msg}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500">Ошибок не найдено</p>
                    )}
                  </div>
                </div>
                
                <button 
                  onClick={analyzeProject}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition hover:shadow-lg"
                >
                  Анализировать проект
                </button>
                
                {summary && (
                  <div className="mt-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Результаты анализа</h3>
                    <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                      {summary}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* Tupik Analysis Section */}
        {activeSection === 'tupik' && (
          <section className="mb-12 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Анализ Тупиков</h2>
            <p className="text-gray-700 mb-4">
              Опишите ситуацию, в которой ваше приложение зашло в тупик:
            </p>
            
            <textarea
              value={tupikDesc}
              onChange={(e) => setTupikDesc(e.target.value)}
              placeholder="Опишите тупик"
              className="w-full h-32 border border-gray-300 rounded-lg p-3 mb-4"
            />
            
            <button 
              onClick={tupikAnalyze}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition hover:shadow-lg mb-4"
            >
              Анализировать Тупик
            </button>
            
            {devPrompt && (
              <div className="mt-6">
                <label className="block text-gray-700 mb-2">
                  Пояснение на русском: Промт для Grok исправляет ошибки
                </label>
                <textarea
                  value={devPrompt}
                  readOnly
                  className="w-full h-40 border border-gray-300 rounded-lg p-3 font-mono text-sm mb-2"
                />
                <button 
                  onClick={() => copyToClipboard(devPrompt)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition hover:shadow-lg"
                >
                  Скопировать промт
                </button>
              </div>
            )}
          </section>
        )}

        {/* Settings Section */}
        {activeSection === 'settings' && (
          <section className="mb-12 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Настройки</h2>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">URL Коллектора</label>
              <input
                type="text"
                value={collectorUrl}
                onChange={(e) => setCollectorUrl(e.target.value)}
                placeholder="https://your-collector-url.com"
                className="border border-gray-300 rounded-lg px-3 py-2 w-full"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">ID Проекта</label>
              <input
                type="text"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                placeholder="your-project-id"
                className="border border-gray-300 rounded-lg px-3 py-2 w-full"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Токен</label>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="your-secret-token"
                className="border border-gray-300 rounded-lg px-3 py-2 w-full"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">Gemini API Key</label>
              <input
                type="password"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder="your-gemini-api-key"
                className="border border-gray-300 rounded-lg px-3 py-2 w-full"
              />
            </div>
            
            <button 
              onClick={saveSettings}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition hover:shadow-lg"
            >
              Сохранить настройки
            </button>
          </section>
        )}
      </div>
    </div>
  );
}

export default App;