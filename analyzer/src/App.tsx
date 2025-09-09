import React, { useState } from 'react';

function App() {
  // State variables
  const [logs, setLogs] = useState<any[]>([]);
  const [tupikDesc, setTupikDesc] = useState<string>('');
  const [devPrompt, setDevPrompt] = useState<string>('');

  // Settings state
  const [collectorUrl, setCollectorUrl] = useState<string>('');
  const [projectId, setProjectId] = useState<string>('');
  const [token, setToken] = useState<string>('');

  // Load settings from localStorage on component mount
  React.useEffect(() => {
    const savedCollectorUrl = localStorage.getItem('collectorUrl') || '';
    const savedProjectId = localStorage.getItem('projectId') || '';
    const savedToken = localStorage.getItem('token') || '';
    
    setCollectorUrl(savedCollectorUrl);
    setProjectId(savedProjectId);
    setToken(savedToken);
  }, []);

  // Save settings to localStorage
  const saveSettings = () => {
    localStorage.setItem('collectorUrl', collectorUrl);
    localStorage.setItem('projectId', projectId);
    localStorage.setItem('token', token);
    alert('Настройки сохранены!');
  };

  // Function to handle file loading
  const onLoadFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsedLogs = JSON.parse(content);
        setLogs(parsedLogs);
        alert('Файл загружен!');
      } catch (error) {
        alert('Ошибка при загрузке файла: ' + (error as Error).message);
      }
    };
    reader.readAsText(file);
  };

  // Function to analyze logs online
  const analyzeOnline = async () => {
    if (!collectorUrl || !projectId || !token) {
      alert('Пожалуйста, заполните все настройки!');
      return;
    }

    try {
      const response = await fetch(`${collectorUrl}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logs }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await response.json();
      alert('Промт готов!');
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
        },
        body: JSON.stringify({ description: tupikDesc }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setDevPrompt(data.instructionPrompt);
      alert('Инструкция готова!');
    } catch (error) {
      alert('Ошибка при анализе тупика: ' + (error as Error).message);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen font-sans p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">AI Debug Companion</h1>
          <p className="text-gray-600 mt-2">Инструмент для отладки ИИ-приложений на русском</p>
        </header>

        {/* Navigation */}
        <nav className="mb-8">
          <ul className="flex space-x-4 border-b border-gray-300">
            <li>
              <a href="#home" className="text-blue-600 font-medium py-2 border-b-2 border-blue-600">Главная</a>
            </li>
            <li>
              <a href="#integration" className="text-gray-600 hover:text-blue-600 py-2">Интеграция</a>
            </li>
            <li>
              <a href="#tupik" className="text-gray-600 hover:text-blue-600 py-2">Анализ Тупиков</a>
            </li>
            <li>
              <a href="#settings" className="text-gray-600 hover:text-blue-600 py-2">Настройки</a>
            </li>
          </ul>
        </nav>

        {/* Main Section */}
        <section id="home" className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Главная</h2>
          <p className="text-gray-700 mb-6">
            Добро пожаловать в AI Debug Companion - инструмент для отладки ИИ-приложений на русском языке.
          </p>
          <button 
            onClick={() => document.getElementById('integration')?.scrollIntoView()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Начать работу
          </button>
        </section>

        {/* Integration Section */}
        <section id="integration" className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Интеграция</h2>
          <p className="text-gray-700 mb-4">
            Чтобы начать использовать AI Debug Companion, установите пакет и инициализируйте логгер:
          </p>
          
          <div className="bg-gray-800 text-gray-100 p-4 rounded mb-4 font-mono text-sm">
            <pre>npm i ai-debug-companion-agent</pre>
          </div>
          
          <div className="bg-gray-800 text-gray-100 p-4 rounded mb-4 font-mono text-sm">
            <pre>{`import { initLogger, BlackBox } from 'ai-debug-companion-agent';

initLogger({
  projectId: '${projectId || 'your-project-id'}',
  collectorUrl: '${collectorUrl || '[Collector URL]'}'
});`}</pre>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Загрузить файл логов:</label>
            <input 
              type="file" 
              accept=".json"
              onChange={onLoadFile}
              className="border border-gray-300 rounded px-3 py-2 w-full"
            />
          </div>
          
          <button 
            onClick={analyzeOnline}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            Анализировать логи
          </button>
        </section>

        {/* Tupik Analysis Section */}
        <section id="tupik" className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Анализ Тупиков</h2>
          <p className="text-gray-700 mb-4">
            Опишите ситуацию, в которой ваше приложение зашло в тупик:
          </p>
          
          <textarea
            value={tupikDesc}
            onChange={(e) => setTupikDesc(e.target.value)}
            placeholder="Опишите тупик"
            className="w-full h-32 border border-gray-300 rounded p-3 mb-4"
          />
          
          <button 
            onClick={tupikAnalyze}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition mb-4"
          >
            Анализировать Тупик
          </button>
          
          {devPrompt && (
            <div className="mt-4">
              <label className="block text-gray-700 mb-2">
                Пояснение на русском: Промт для ИИ-ассистента, вставьте в Grok!
              </label>
              <textarea
                value={devPrompt}
                readOnly
                className="w-full h-40 border border-gray-300 rounded p-3 font-mono text-sm"
              />
            </div>
          )}
        </section>

        {/* Settings Section */}
        <section id="settings">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Настройки</h2>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">URL Коллектора</label>
            <input
              type="text"
              value={collectorUrl}
              onChange={(e) => setCollectorUrl(e.target.value)}
              placeholder="https://your-collector-url.com"
              className="border border-gray-300 rounded px-3 py-2 w-full"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">ID Проекта</label>
            <input
              type="text"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              placeholder="your-project-id"
              className="border border-gray-300 rounded px-3 py-2 w-full"
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Токен</label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="your-secret-token"
              className="border border-gray-300 rounded px-3 py-2 w-full"
            />
          </div>
          
          <button 
            onClick={saveSettings}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Сохранить настройки
          </button>
        </section>
      </div>
    </div>
  );
}

export default App;