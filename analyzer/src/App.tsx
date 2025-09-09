import React, { useState } from 'react';

function App() {
  // State variables
  const [activeSection, setActiveSection] = useState<'home' | 'integration' | 'monitoring' | 'tupik' | 'settings' | 'help'>('home');
  const [logs, setLogs] = useState<any[]>([]);
  const [snapshot, setSnapshot] = useState<any>(null);
  const [summary, setSummary] = useState<string>('');
  const [tupikDesc, setTupikDesc] = useState<string>('');
  const [devPrompt, setDevPrompt] = useState<string>('');
  const [projects, setProjects] = useState<Array<{id: string, name: string}>>([]);
  const [currentProject, setCurrentProject] = useState<string>('');

  // Settings state
  const [collectorUrl, setCollectorUrl] = useState<string>('');
  const [projectId, setProjectId] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [geminiApiKey, setGeminiApiKey] = useState<string>('');

  // Help section states
  const [helpTopic, setHelpTopic] = useState<'setup' | 'integration' | 'monitoring' | 'tupik' | 'settings' | null>(null);

  // Load settings from localStorage on component mount
  React.useEffect(() => {
    const savedCollectorUrl = localStorage.getItem('collectorUrl') || '';
    const savedProjectId = localStorage.getItem('projectId') || '';
    const savedToken = localStorage.getItem('token') || '';
    const savedGeminiApiKey = localStorage.getItem('geminiApiKey') || '';
    const savedProjects = localStorage.getItem('projects');
    const savedCurrentProject = localStorage.getItem('currentProject') || '';
    
    setCollectorUrl(savedCollectorUrl);
    setProjectId(savedProjectId);
    setToken(savedToken);
    setGeminiApiKey(savedGeminiApiKey);
    
    if (savedProjects) {
      try {
        setProjects(JSON.parse(savedProjects));
      } catch (e) {
        setProjects([]);
      }
    }
    
    setCurrentProject(savedCurrentProject);
  }, []);

  // Save settings to localStorage
  const saveSettings = () => {
    localStorage.setItem('collectorUrl', collectorUrl);
    localStorage.setItem('projectId', projectId);
    localStorage.setItem('token', token);
    localStorage.setItem('geminiApiKey', geminiApiKey);
    localStorage.setItem('projects', JSON.stringify(projects));
    localStorage.setItem('currentProject', currentProject);
    alert('Настройки сохранены!');
  };

  // Add a new project
  const addProject = () => {
    if (!projectId.trim()) {
      alert('Пожалуйста, введите ID проекта!');
      return;
    }
    
    const newProject = { id: projectId, name: projectId };
    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    setCurrentProject(projectId);
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
    localStorage.setItem('currentProject', projectId);
    alert('Проект добавлен!');
  };

  // Remove a project
  const removeProject = (projectIdToRemove: string) => {
    const updatedProjects = projects.filter(p => p.id !== projectIdToRemove);
    setProjects(updatedProjects);
    if (currentProject === projectIdToRemove && updatedProjects.length > 0) {
      setCurrentProject(updatedProjects[0].id);
    }
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
    alert('Проект удален!');
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
    if (!collectorUrl || !currentProject || !token) {
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
    if (!collectorUrl || !currentProject || !token) {
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

  // AI Optimization Prompt for Settings
  const getSettingsOptimizationPrompt = () => {
    return `Помоги мне оптимизировать настройки AI Debug Companion для моего проекта. Вот текущие настройки:

- URL Коллектора: ${collectorUrl || 'не задан'}
- Текущий проект: ${currentProject || 'не выбран'}
- Gemini API Key: ${geminiApiKey ? 'задан' : 'не задан'}
- Токен авторизации: ${token ? 'задан' : 'не задан'}

Пожалуйста, предоставь:
1. Рекомендации по оптимизации этих настроек
2. Объяснение, как каждая настройка влияет на работу системы
3. Рекомендации по безопасности для API ключей и токенов
4. Предложения по автоматизации настройки для разных сред (dev, staging, prod)
5. Рекомендации по мониторингу и логированию настроек

Объясни каждую рекомендацию понятным языком.`;
  };

  // AI System Setup Prompt
  const getSystemSetupPrompt = () => {
    return `Помоги мне настроить систему AI Debug Companion. Пожалуйста, объясни мне:

1. Как настроить Collector на Cloudflare Workers
2. Как получить и настроить все необходимые токены (Cloudflare API Token, Gemini API Key)
3. Как настроить GitHub Actions для автоматического развертывания
4. Как проверить, что система работает корректно

Предоставь пошаговые инструкции с примерами команд и кода. Объясни, почему каждый шаг важен и что может пойти не так.`;
  };

  // AI Integration Prompt
  const getIntegrationPrompt = () => {
    return `Помоги мне интегрировать AI Debug Companion в мой проект. Пожалуйста, объясни мне:

1. Как установить и настроить ai-debug-companion-agent
2. Как правильно инициализировать логгер с нужными параметрами
3. Как добавить компонент BlackBox в мое приложение
4. Как использовать Tupik Buster для анализа тупиковых ситуаций

Предоставь пошаговые инструкции с примерами кода. Объясни, почему каждый шаг важен и как это поможет в отладке приложения.`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-sans">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-indigo-800 mb-2">AI Debug Companion</h1>
          <p className="text-lg text-indigo-600">ИИ-ассистент для анализа и исправления ошибок</p>
        </header>

        {/* Navigation */}
        <nav className="mb-10 bg-white rounded-xl shadow-lg p-2">
          <ul className="flex flex-wrap justify-center gap-2 md:gap-4">
            <li>
              <button 
                onClick={() => setActiveSection('home')}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${activeSection === 'home' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-indigo-100'}`}
              >
                Главная
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveSection('integration')}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${activeSection === 'integration' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-indigo-100'}`}
              >
                Интеграция
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveSection('monitoring')}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${activeSection === 'monitoring' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-indigo-100'}`}
              >
                Мониторинг
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveSection('tupik')}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${activeSection === 'tupik' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-indigo-100'}`}
              >
                Анализ Тупиков
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveSection('settings')}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${activeSection === 'settings' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-indigo-100'}`}
              >
                Настройки
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveSection('help')}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${activeSection === 'help' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-indigo-100'}`}
              >
                Помощь
              </button>
            </li>
          </ul>
        </nav>

        {/* Main Section */}
        {activeSection === 'home' && (
          <section className="mb-12 bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Добро пожаловать в AI Debug Companion</h2>
              <p className="text-gray-600 mb-6 max-w-3xl mx-auto">
                Интеллектуальный инструмент для анализа и исправления ошибок в ваших приложениях. 
                Наш ИИ-ассистент поможет вам быстро находить и устранять проблемы в коде.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                <div className="text-indigo-600 text-2xl mb-3">🔧</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Интеграция</h3>
                <p className="text-gray-600 mb-4">Установите агент в ваш проект и начните собирать логи</p>
                <button 
                  onClick={() => setActiveSection('integration')}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition hover:shadow-lg"
                >
                  Настроить
                </button>
              </div>
              
              <div className="bg-green-50 p-6 rounded-xl border border-green-100">
                <div className="text-green-600 text-2xl mb-3">📊</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Мониторинг</h3>
                <p className="text-gray-600 mb-4">Загрузите бандл и проанализируйте ошибки в проекте</p>
                <button 
                  onClick={() => setActiveSection('monitoring')}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition hover:shadow-lg"
                >
                  Анализировать
                </button>
              </div>
              
              <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
                <div className="text-purple-600 text-2xl mb-3">🌀</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Анализ Тупиков</h3>
                <p className="text-gray-600 mb-4">Опишите тупиковую ситуацию и получите рекомендации</p>
                <button 
                  onClick={() => setActiveSection('tupik')}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition hover:shadow-lg"
                >
                  Решить проблему
                </button>
              </div>
            </div>
            
            <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-100 mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">🤖 Интеграция через ИИ - Один клик до результата</h3>
              <p className="text-gray-700 mb-4">
                Интегрируйте AI Debug Companion в ваш проект с минимальными усилиями:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <button 
                  onClick={() => copyToClipboard(`Я разрабатываю JavaScript/TypeScript приложение и хочу интегрировать в него систему логирования и отладки. Пожалуйста, установи npm пакет "ai-debug-companion-agent" в проект и объясни, что это за пакет и для чего он нужен.`)}
                  className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
                >
                  1. Установка агента
                </button>
                <button 
                  onClick={() => copyToClipboard(`В моем JavaScript/React приложении мне нужно инициализировать агент для сбора логов. Добавь следующий код в основной файл приложения (обычно index.js или main.js):

import { initAgent } from 'ai-debug-companion-agent';

initAgent('my-awesome-project', 'https://ai-debug-collector.YOUR-ACCOUNT.workers.dev');

Объясни, что делает каждая функция и почему это важно для отладки приложения.`)}
                  className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition text-sm"
                >
                  2. Инициализация
                </button>
                <button 
                  onClick={() => copyToClipboard(`В моем React приложении мне нужно добавить компонент BlackBox из ai-debug-companion-agent для визуализации логов в режиме реального времени. Добавь компонент BlackBox в файл App.js с высотой 300px. Объясни, как пользователь будет взаимодействовать с этим компонентом.`)}
                  className="bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition text-sm"
                >
                  3. BlackBox компонент
                </button>
              </div>
              <p className="text-gray-700 text-sm">
                <strong>Как использовать:</strong> Нажмите на любую кнопку выше, чтобы скопировать промт. 
                Затем вставьте его в интерфейс вашей нейросети (ChatGPT, Claude, Groq и т.д.) и отправьте.
              </p>
            </div>
            
            <div className="bg-red-50 p-6 rounded-xl border border-red-100 mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">🚀 Расширенная интеграция через ИИ</h3>
              <p className="text-gray-700 mb-4">
                Полная настройка всей системы AI Debug Companion через один клик:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <button 
                  onClick={() => copyToClipboard(`Я хочу полностью настроить систему AI Debug Companion. Пожалуйста, помоги мне:

1. Создать аккаунт на Cloudflare и получить API токен с нужными правами
2. Развернуть collector на Cloudflare Workers с помощью wrangler
3. Получить Gemini API Key в Google AI Studio
4. Настроить GitHub Actions для автоматического развертывания всех компонентов

Объясни каждый шаг подробно и предоставь все необходимые команды.`)}
                  className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition text-sm"
                >
                  1. Полная настройка системы
                </button>
                <button 
                  onClick={() => copyToClipboard(`Я хочу настроить мониторинг моего приложения с помощью AI Debug Companion. Пожалуйста, объясни мне:

1. Как правильно собирать и отправлять логи через агент
2. Как настроить фильтрацию и уровни логирования
3. Как использовать функцию маскировки секретов
4. Как настроить автоматическую отправку логов при ошибках

Предоставь примеры кода и объясни, почему это важно.`)}
                  className="bg-orange-600 text-white px-3 py-2 rounded-lg hover:bg-orange-700 transition text-sm"
                >
                  2. Настройка мониторинга
                </button>
                <button 
                  onClick={() => copyToClipboard(`Я хочу научиться анализировать тупиковые ситуации с помощью AI Debug Companion. Пожалуйста, объясни мне:

1. Что такое тупиковая ситуация в контексте программирования
2. Как правильно описывать тупики для получения точного анализа
3. Как использовать Tupik Buster для генерации решений
4. Как интегрировать режим Tupik в мое приложение

Предоставь примеры и практические рекомендации.`)}
                  className="bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition text-sm"
                >
                  3. Анализ тупиков
                </button>
                <button 
                  onClick={() => copyToClipboard(`Я хочу оптимизировать настройки AI Debug Companion для моего проекта. Пожалуйста, помоги мне:

1. Настроить правильные параметры projectId и collectorUrl
2. Оптимизировать batchSize и flushInterval для производительности
3. Настроить уровни логирования для разных сред (dev, staging, prod)
4. Настроить автоматическое создание бандлов для анализа

Объясни, как каждая настройка влияет на работу системы.`)}
                  className="bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition text-sm"
                >
                  4. Оптимизация настроек
                </button>
              </div>
              <p className="text-gray-700 text-sm">
                <strong>Продвинутое использование:</strong> Эти промты позволяют полностью настроить и оптимизировать всю систему через ИИ.
              </p>
            </div>
            
            <div className="text-center">
              <button 
                onClick={() => setActiveSection('help')}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition hover:shadow-lg"
              >
                Подробное руководство пользователя
              </button>
            </div>
          </section>
        )}

        {/* Integration Section */}
        {activeSection === 'integration' && (
          <section className="mb-12 bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Интеграция с проектом</h2>
            
            <div className="mb-8 p-6 bg-blue-50 rounded-xl border border-blue-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Шаг 1: Установка агента</h3>
              <p className="text-gray-700 mb-4">
                Установите пакет агента в ваш проект с помощью npm:
              </p>
              
              <div className="bg-gray-800 text-gray-100 p-4 rounded-lg mb-4 font-mono text-sm">
                <pre>npm i ai-debug-companion-agent</pre>
              </div>
              
              <button 
                onClick={() => copyToClipboard('npm i ai-debug-companion-agent')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition hover:shadow-lg"
              >
                Скопировать команду
              </button>
            </div>
            
            <div className="mb-8 p-6 bg-green-50 rounded-xl border border-green-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Шаг 2: Инициализация агента</h3>
              <p className="text-gray-700 mb-4">
                Импортируйте и инициализируйте агент в вашем приложении:
              </p>
              
              <div className="bg-gray-800 text-gray-100 p-4 rounded-lg mb-4 font-mono text-sm">
                <pre>{`import { initAgent } from 'ai-debug-companion-agent';

initAgent('${currentProject || 'your-project-id'}', '${collectorUrl || 'https://your-collector-url.com'}');`}</pre>
              </div>
              
              <button 
                onClick={() => copyToClipboard(`import { initAgent } from 'ai-debug-companion-agent';

initAgent('${currentProject || 'your-project-id'}', '${collectorUrl || 'https://your-collector-url.com'}');`)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition hover:shadow-lg"
              >
                Скопировать код
              </button>
            </div>
            
            <div className="p-6 bg-purple-50 rounded-xl border border-purple-100 mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Шаг 3: Добавление компонента BlackBox</h3>
              <p className="text-gray-700 mb-4">
                Добавьте компонент BlackBox в ваше приложение для визуализации логов:
              </p>
              
              <div className="bg-gray-800 text-gray-100 p-4 rounded-lg mb-4 font-mono text-sm">
                <pre>{`function App() {
  return (
    <div>
      {/* Ваше приложение */}
      <BlackBox height={300} />
    </div>
  );
}`}</pre>
              </div>
              
              <button 
                onClick={() => copyToClipboard(`function App() {
  return (
    <div>
      {/* Ваше приложение */}
      <BlackBox height={300} />
    </div>
  );
}`)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition hover:shadow-lg"
              >
                Скопировать компонент
              </button>
            </div>
            
            <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">🤖 Интеграция через ИИ - Все шаги одним кликом</h3>
              <p className="text-gray-700 mb-4">
                Выполните полную интеграцию с помощью одного промта:
              </p>
              
              <div className="mb-4">
                <button 
                  onClick={() => copyToClipboard(`Я разрабатываю React/TypeScript приложение и хочу полностью интегрировать в него AI Debug Companion. Пожалуйста, помоги мне:

1. Установить пакет ai-debug-companion-agent
2. Инициализировать агент с правильными настройками:
   - projectId: '${currentProject || 'my-awesome-project'}'
   - collectorUrl: '${collectorUrl || 'https://ai-debug-collector.YOUR-ACCOUNT.workers.dev'}'
3. Добавить компонент BlackBox в мое приложение
4. Настроить сбор ошибок и HTTP запросов
5. Объяснить, как пользователь будет взаимодействовать с системой

Предоставь полный код и объясни каждый шаг.`)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition hover:shadow-lg w-full"
                >
                  Скопировать полный промт интеграции
                </button>
              </div>
              
              <p className="text-gray-700 text-sm">
                <strong>Как использовать:</strong> Нажмите кнопку выше, чтобы скопировать промт. 
                Вставьте его в интерфейс вашей нейросети и отправьте для автоматической интеграции.
              </p>
            </div>
          </section>
        )}

        {/* Monitoring Section */}
        {activeSection === 'monitoring' && (
          <section className="mb-12 bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Мониторинг проекта</h2>
            
            <div className="mb-8 p-6 bg-blue-50 rounded-xl border border-blue-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Загрузка данных для анализа</h3>
              <p className="text-gray-700 mb-4">
                Загрузите JSON-бандл, созданный агентом, для анализа структуры проекта, ошибок и интеграций:
              </p>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2 font-medium">Выберите JSON-бандл:</label>
                <input 
                  type="file" 
                  accept=".json"
                  onChange={onLoadBundle}
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="mt-4 text-sm text-gray-500">
                <p>💡 Бандл создается автоматически агентом и содержит все необходимые данные для анализа</p>
              </div>
            </div>
            
            {snapshot && (
              <div className="mt-8">
                <h3 className="text-2xl font-semibold text-gray-800 mb-6">Анализ проекта</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="text-3xl font-bold text-indigo-600 mb-2">{logs.length}</div>
                    <p className="text-gray-600">Всего записей лога</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="text-3xl font-bold text-red-600 mb-2">
                      {logs.filter(log => log.level === 'ERROR' || log.level === 'FATAL').length}
                    </div>
                    <p className="text-gray-600">Ошибок</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="text-3xl font-bold text-yellow-600 mb-2">
                      {logs.filter(log => log.level === 'WARN').length}
                    </div>
                    <p className="text-gray-600">Предупреждений</p>
                  </div>
                </div>
                
                <div className="mb-8">
                  <h4 className="text-xl font-semibold text-gray-800 mb-4">Информация о проекте</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-600">Дата создания бандла</p>
                      <p className="text-lg font-semibold">{snapshot.meta?.createdAt ? new Date(snapshot.meta.createdAt).toLocaleString() : 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-600">Фильтр логов</p>
                      <p className="text-lg font-semibold">{snapshot.meta?.filter || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mb-8">
                  <h4 className="text-xl font-semibold text-gray-800 mb-4">Критические ошибки</h4>
                  <div className="bg-gray-50 p-4 rounded-lg max-h-60 overflow-y-auto">
                    {logs.filter(log => log.level === 'ERROR' || log.level === 'FATAL').length > 0 ? (
                      <ul className="space-y-3">
                        {logs.filter(log => log.level === 'ERROR' || log.level === 'FATAL').map((log, index) => (
                          <li key={index} className="p-3 bg-white rounded border-l-4 border-red-500">
                            <div className="font-medium text-gray-800">
                              [{new Date(log.ts).toLocaleTimeString()}] {log.level}: {log.msg}
                            </div>
                            {log.payload && (
                              <div className="mt-2 text-sm text-gray-600">
                                <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
                                  {JSON.stringify(log.payload, null, 2)}
                                </pre>
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 text-center py-4">Критических ошибок не найдено</p>
                    )}
                  </div>
                </div>
                
                <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-100 mb-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">🤖 AI Анализ через один клик</h3>
                  <p className="text-gray-700 mb-4">
                    Проанализируйте проект с помощью ИИ одним нажатием:
                  </p>
                  
                  <div className="mb-4">
                    <button 
                      onClick={() => copyToClipboard(`Проанализируй следующий лог-бандл от AI Debug Companion и предоставь рекомендации по улучшению приложения:

${JSON.stringify(snapshot, null, 2)}

Пожалуйста, предоставь:
1. Корневую причину основных ошибок (Root Cause Analysis)
2. Рекомендации по исправлению проблем
3. Предложения по оптимизации производительности
4. Рекомендации по улучшению логирования
5. Предложения по настройке системы для предотвращения подобных ошибок в будущем

Объясни каждую рекомендацию понятным языком.`)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition hover:shadow-lg w-full"
                    >
                      Скопировать промт для AI анализа
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-4">
                    <button 
                      onClick={analyzeProject}
                      className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition hover:shadow-lg text-lg font-medium"
                    >
                      Проанализировать проект с помощью ИИ
                    </button>
                    
                    <a 
                      href="https://groq.com/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition hover:shadow-lg text-lg font-medium inline-flex items-center"
                    >
                      Открыть Groq
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                        <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                      </svg>
                    </a>
                  </div>
                </div>
                
                {summary && (
                  <div className="mt-8">
                    <h3 className="text-2xl font-semibold text-gray-800 mb-4">Результаты анализа</h3>
                    <div className="bg-gray-800 text-gray-100 p-6 rounded-lg overflow-x-auto">
                      <pre className="text-sm whitespace-pre-wrap">{summary}</pre>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* Tupik Analysis Section */}
        {activeSection === 'tupik' && (
          <section className="mb-12 bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Анализ Тупиков</h2>
            
            <div className="mb-8 p-6 bg-purple-50 rounded-xl border border-purple-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Описание тупиковой ситуации</h3>
              <p className="text-gray-700 mb-4">
                Опишите ситуацию, в которой ваше приложение зашло в тупик. Чем подробнее вы опишете проблему, тем точнее будет анализ:
              </p>
              
              <textarea
                value={tupikDesc}
                onChange={(e) => setTupikDesc(e.target.value)}
                placeholder="Пример: Мое приложение зависло при обработке данных пользователя. Я вызываю функцию processUserData(), но она не возвращает результат в течение 30 секунд. Подозреваю, что проблема в цикле обработки данных."
                className="w-full h-40 border border-gray-300 rounded-lg p-4 mb-4 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
              
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={tupikAnalyze}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition hover:shadow-lg font-medium"
                >
                  Проанализировать Тупик с помощью ИИ
                </button>
                
                <button 
                  onClick={() => setTupikDesc('')}
                  className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Очистить
                </button>
              </div>
            </div>
            
            {devPrompt && (
              <div className="mt-8 p-6 bg-green-50 rounded-xl border border-green-100">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Рекомендации по решению</h3>
                
                <div className="mb-4 p-4 bg-blue-100 rounded-lg">
                  <p className="font-medium text-gray-800">
                    💡 Пояснение на русском: Промт для Grok исправляет ошибки
                  </p>
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-700 mb-2 font-medium">Сгенерированный промт для ИИ-ассистента:</label>
                  <textarea
                    value={devPrompt}
                    readOnly
                    className="w-full h-60 border border-gray-300 rounded-lg p-4 font-mono text-sm bg-gray-50"
                  />
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <button 
                    onClick={() => copyToClipboard(devPrompt)}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition hover:shadow-lg font-medium"
                  >
                    Скопировать промт
                  </button>
                  
                  <a 
                    href="https://groq.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition hover:shadow-lg font-medium inline-flex items-center"
                  >
                    Открыть Groq
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                      <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                    </svg>
                  </a>
                </div>
              </div>
            )}
            
            <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-100 mt-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">🤖 AI Решение тупиков через один клик</h3>
              <p className="text-gray-700 mb-4">
                Получите решение для тупиковой ситуации одним нажатием:
              </p>
              
              <div className="mb-4">
                <button 
                  onClick={() => copyToClipboard(`Помоги мне решить тупиковую ситуацию в моем JavaScript/TypeScript приложении. Вот описание проблемы:

${tupikDesc || "Опишите вашу тупиковую ситуацию здесь..."}

Пожалуйста, предоставь:
1. Анализ возможных причин проблемы
2. Пошаговое решение с примерами кода
3. Рекомендации по предотвращению подобных ситуаций
4. Альтернативные подходы к решению проблемы
5. Объяснение, почему предложенное решение будет работать

Объясни каждую часть решения понятным языком.`)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition hover:shadow-lg w-full"
                >
                  Скопировать промт для решения тупика
                </button>
              </div>
              
              <p className="text-gray-700 text-sm">
                <strong>Как использовать:</strong> Опишите вашу тупиковую ситуацию выше, затем нажмите кнопку для копирования промта. 
                Вставьте его в интерфейс вашей нейросети для получения решения.
              </p>
            </div>
          </section>
        )}

        {/* Settings Section */}
        {activeSection === 'settings' && (
          <section className="mb-12 bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Настройки</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Конфигурация подключения</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">URL Коллектора</label>
                    <input
                      type="text"
                      value={collectorUrl}
                      onChange={(e) => setCollectorUrl(e.target.value)}
                      placeholder="https://your-collector.your-subdomain.workers.dev"
                      className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      URL вашего экземпляра коллектора. Обычно развернут на Cloudflare Workers.
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">Gemini API Key</label>
                    <input
                      type="password"
                      value={geminiApiKey}
                      onChange={(e) => setGeminiApiKey(e.target.value)}
                      placeholder="your-gemini-api-key"
                      className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      API ключ для доступа к модели Gemini. Получите его на{' '}
                      <a 
                        href="https://aistudio.google.com/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline"
                      >
                        Google AI Studio
                      </a>
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">Токен авторизации</label>
                    <input
                      type="password"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="your-secret-token"
                      className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      Секретный токен для авторизации запросов к коллектору.
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Управление проектами</h3>
                
                <div className="mb-6">
                  <label className="block text-gray-700 mb-2 font-medium">ID Текущего проекта</label>
                  <div className="flex gap-2">
                    <select
                      value={currentProject}
                      onChange={(e) => setCurrentProject(e.target.value)}
                      className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Выберите проект</option>
                      {projects.map(project => (
                        <option key={project.id} value={project.id}>{project.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-700 mb-2 font-medium">Добавить новый проект</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={projectId}
                      onChange={(e) => setProjectId(e.target.value)}
                      placeholder="Новый ID проекта"
                      className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <button 
                      onClick={addProject}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                    >
                      Добавить
                    </button>
                  </div>
                </div>
                
                {projects.length > 0 && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-800 mb-3">Список проектов</h4>
                    <ul className="space-y-2">
                      {projects.map(project => (
                        <li key={project.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                          <span className="font-medium">{project.name}</span>
                          <button 
                            onClick={() => removeProject(project.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button 
                onClick={saveSettings}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition hover:shadow-lg font-medium"
              >
                Сохранить настройки
              </button>
            </div>
            
            <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-100 mt-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">🤖 AI Настройка через один клик</h3>
              <p className="text-gray-700 mb-4">
                Оптимизируйте настройки с помощью ИИ одним нажатием:
              </p>
              
              <div className="mb-4">
                <button 
                  onClick={() => copyToClipboard(getSettingsOptimizationPrompt())}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition hover:shadow-lg w-full"
                >
                  Скопировать промт для оптимизации настроек
                </button>
              </div>
              
              <p className="text-gray-700 text-sm">
                <strong>Как использовать:</strong> Нажмите кнопку выше, чтобы скопировать промт. 
                Вставьте его в интерфейс вашей нейросети для получения рекомендаций по оптимизации.
              </p>
            </div>
          </section>
        )}

        {/* Help Section */}
        {activeSection === 'help' && (
          <section className="mb-12 bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Помощь и Документация</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <button 
                onClick={() => setHelpTopic('setup')}
                className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 hover:bg-indigo-100 transition text-left"
              >
                <div className="text-indigo-600 text-2xl mb-3">⚙️</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Настройка системы</h3>
                <p className="text-gray-600">Как настроить Collector, Analyzer и Agent</p>
              </button>
              
              <button 
                onClick={() => setHelpTopic('integration')}
                className="bg-blue-50 p-6 rounded-xl border border-blue-100 hover:bg-blue-100 transition text-left"
              >
                <div className="text-blue-600 text-2xl mb-3">🔌</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Интеграция</h3>
                <p className="text-gray-600">Как интегрировать Agent в ваш проект</p>
              </button>
              
              <button 
                onClick={() => setHelpTopic('monitoring')}
                className="bg-green-50 p-6 rounded-xl border border-green-100 hover:bg-green-100 transition text-left"
              >
                <div className="text-green-600 text-2xl mb-3">📊</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Мониторинг</h3>
                <p className="text-gray-600">Как анализировать логи и ошибки</p>
              </button>
              
              <button 
                onClick={() => setHelpTopic('tupik')}
                className="bg-purple-50 p-6 rounded-xl border border-purple-100 hover:bg-purple-100 transition text-left"
              >
                <div className="text-purple-600 text-2xl mb-3">🌀</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Анализ Тупиков</h3>
                <p className="text-gray-600">Как решать тупиковые ситуации</p>
              </button>
              
              <button 
                onClick={() => setHelpTopic('settings')}
                className="bg-yellow-50 p-6 rounded-xl border border-yellow-100 hover:bg-yellow-100 transition text-left"
              >
                <div className="text-yellow-600 text-2xl mb-3">🛠️</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Настройки</h3>
                <p className="text-gray-600">Как настроить параметры системы</p>
              </button>
              
              <a 
                href="https://github.com/Gakuzi/ai-debug-companion" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gray-50 p-6 rounded-xl border border-gray-100 hover:bg-gray-100 transition text-left"
              >
                <div className="text-gray-600 text-2xl mb-3">📚</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Полная документация</h3>
                <p className="text-gray-600">Документация на GitHub</p>
              </a>
            </div>
            
            {helpTopic === 'setup' && (
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Настройка системы</h3>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xl font-medium text-gray-800 mb-3">1. Настройка Collector (Cloudflare Workers)</h4>
                    <p className="text-gray-700 mb-3">
                      Collector развертывается на Cloudflare Workers и используется для сбора логов.
                    </p>
                    <div className="bg-gray-800 text-gray-100 p-4 rounded-lg mb-3 font-mono text-sm">
                      <pre># Установите Wrangler (инструмент Cloudflare)
npm install -g wrangler

# Авторизуйтесь в Cloudflare
wrangler login

# Разверните collector
cd collector
wrangler deploy</pre>
                    </div>
                    <p className="text-gray-700">
                      После развертывания вы получите URL вида: <code className="bg-gray-200 px-1 rounded">https://ai-debug-collector.YOUR-ACCOUNT.workers.dev</code>
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-xl font-medium text-gray-800 mb-3">2. Получение токенов</h4>
                    <p className="text-gray-700 mb-3">
                      Для работы системы требуются следующие токены:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
                      <li>
                        <strong>Cloudflare API Token</strong>: Получите в{' '}
                        <a 
                          href="https://dash.cloudflare.com/profile/api-tokens" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:underline"
                        >
                          Cloudflare Dashboard
                        </a>
                        . Нужны права: Workers Scripts: Edit, R2: Read/Write
                      </li>
                      <li>
                        <strong>Gemini API Key</strong>: Получите в{' '}
                        <a 
                          href="https://aistudio.google.com/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:underline"
                        >
                          Google AI Studio
                        </a>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-xl font-medium text-gray-800 mb-3">3. Настройка GitHub Actions</h4>
                    <p className="text-gray-700 mb-3">
                      Система автоматически развертывается через GitHub Actions. Добавьте следующие секреты в настройки репозитория:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
                      <li><code className="bg-gray-200 px-1 rounded">CLOUDFLARE_API_TOKEN</code> - Токен Cloudflare</li>
                      <li><code className="bg-gray-200 px-1 rounded">GEMINI_API_KEY</code> - Ключ Gemini API</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-100 mt-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">🤖 AI Помощь по настройке через один клик</h3>
                  <p className="text-gray-700 mb-4">
                    Получите помощь по настройке системы одним нажатием:
                  </p>
                  
                  <div className="mb-4">
                    <button 
                      onClick={() => copyToClipboard(getSystemSetupPrompt())}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition hover:shadow-lg w-full"
                    >
                      Скопировать промт для помощи по настройке
                    </button>
                  </div>
                  
                  <p className="text-gray-700 text-sm">
                    <strong>Как использовать:</strong> Нажмите кнопку выше, чтобы скопировать промт. 
                    Вставьте его в интерфейс вашей нейросети для получения помощи по настройке.
                  </p>
                </div>
              </div>
            )}
            
            {helpTopic === 'integration' && (
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Интеграция с проектом</h3>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xl font-medium text-gray-800 mb-3">1. Установка агента</h4>
                    <div className="bg-gray-800 text-gray-100 p-4 rounded-lg mb-3 font-mono text-sm">
                      <pre>npm install ai-debug-companion-agent</pre>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-xl font-medium text-gray-800 mb-3">2. Базовая настройка</h4>
                    <div className="bg-gray-800 text-gray-100 p-4 rounded-lg mb-3 font-mono text-sm">
                      <pre>{`import { initAgent } from 'ai-debug-companion-agent';

// Инициализация агента
initAgent('your-project-id', 'https://your-collector-url.com');`}</pre>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-xl font-medium text-gray-800 mb-3">3. Добавление компонента BlackBox</h4>
                    <div className="bg-gray-800 text-gray-100 p-4 rounded-lg mb-3 font-mono text-sm">
                      <pre>{`import { BlackBox } from 'ai-debug-companion-agent';

function App() {
  return (
    <div>
      {/* Ваше приложение */}
      <BlackBox height={300} />
    </div>
  );
}`}</pre>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-xl font-medium text-gray-800 mb-3">4. Использование Tupik Buster</h4>
                    <div className="bg-gray-800 text-gray-100 p-4 rounded-lg mb-3 font-mono text-sm">
                      <pre>{`import { reportTupik } from 'ai-debug-companion-agent';

// Сообщение о тупиковой ситуации
reportTupik('Описание тупика', {
  context: 'Контекст выполнения',
  error: 'Ошибка, если есть'
});`}</pre>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-100 mt-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">🤖 AI Помощь по интеграции через один клик</h3>
                  <p className="text-gray-700 mb-4">
                    Получите помощь по интеграции с проектом одним нажатием:
                  </p>
                  
                  <div className="mb-4">
                    <button 
                      onClick={() => copyToClipboard(getIntegrationPrompt())}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition hover:shadow-lg w-full"
                    >
                      Скопировать промт для помощи по интеграции
                    </button>
                  </div>
                  
                  <p className="text-gray-700 text-sm">
                    <strong>Как использовать:</strong> Нажмите кнопку выше, чтобы скопировать промт. 
                    Вставьте его в интерфейс вашей нейросети для получения помощи по интеграции.
                  </p>
                </div>
              </div>
            )}
            
            {helpTopic === 'monitoring' && (
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Мониторинг и анализ</h3>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xl font-medium text-gray-800 mb-3">1. Создание бандла логов</h4>
                    <p className="text-gray-700 mb-3">
                      Агент автоматически собирает логи в течение работы приложения. 
                      Для создания бандла нажмите "Скачать бандл" в компоненте BlackBox.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-xl font-medium text-gray-800 mb-3">2. Загрузка бандла в Analyzer</h4>
                    <p className="text-gray-700 mb-3">
                      Перейдите в раздел "Мониторинг" и загрузите JSON-файл бандла.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-xl font-medium text-gray-800 mb-3">3. Анализ с помощью ИИ</h4>
                    <p className="text-gray-700 mb-3">
                      После загрузки бандла нажмите "Проанализировать проект с помощью ИИ". 
                      Система проанализирует логи и предоставит:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
                      <li>Корневую причину ошибок (Root Cause Analysis)</li>
                      <li>Рекомендации по исправлению</li>
                      <li>Предложения по настройке системы</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-100 mt-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">🤖 AI Помощь по мониторингу через один клик</h3>
                  <p className="text-gray-700 mb-4">
                    Получите помощь по мониторингу и анализу одним нажатием:
                  </p>
                  
                  <div className="mb-4">
                    <button 
                      onClick={() => copyToClipboard(`Помоги мне с мониторингом и анализом ошибок в моем приложении с помощью AI Debug Companion. Пожалуйста, объясни мне:

1. Как правильно создавать бандлы логов
2. Как загружать и анализировать бандлы в Analyzer
3. Как интерпретировать результаты анализа ИИ
4. Как использовать рекомендации системы для улучшения приложения

Предоставь практические советы и примеры. Объясни, как это поможет быстрее находить и исправлять ошибки.`)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition hover:shadow-lg w-full"
                    >
                      Скопировать промт для помощи по мониторингу
                    </button>
                  </div>
                  
                  <p className="text-gray-700 text-sm">
                    <strong>Как использовать:</strong> Нажмите кнопку выше, чтобы скопировать промт. 
                    Вставьте его в интерфейс вашей нейросети для получения помощи по мониторингу.
                  </p>
                </div>
              </div>
            )}
            
            {helpTopic === 'tupik' && (
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Анализ Тупиков</h3>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xl font-medium text-gray-800 mb-3">Что такое тупиковая ситуация?</h4>
                    <p className="text-gray-700 mb-3">
                      Тупик (deadlock) в контексте AI-приложений - это ситуация, когда приложение 
                      заходит в бесконечный цикл или не может продвинуться дальше в процессе выполнения задачи.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-xl font-medium text-gray-800 mb-3">Как описать тупик?</h4>
                    <p className="text-gray-700 mb-3">
                      Для эффективного анализа опишите:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
                      <li>Что делало приложение перед зависанием</li>
                      <li>Какая функция или процесс выполнялся</li>
                      <li>Как долго длилось зависание</li>
                      <li>Какие ошибки или предупреждения были замечены</li>
                      <li>Контекст выполнения (например, обработка данных пользователя)</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-xl font-medium text-gray-800 mb-3">Что делает система?</h4>
                    <p className="text-gray-700 mb-3">
                      После описания тупика система:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
                      <li>Генерирует специальный промт для ИИ-ассистента</li>
                      <li>Предоставляет пояснение на русском языке</li>
                      <li>Позволяет скопировать промт для использования в Groq или других ИИ-сервисах</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-100 mt-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">🤖 AI Помощь по анализу тупиков через один клик</h3>
                  <p className="text-gray-700 mb-4">
                    Получите помощь по анализу тупиков одним нажатием:
                  </p>
                  
                  <div className="mb-4">
                    <button 
                      onClick={() => copyToClipboard(`Помоги мне анализировать тупиковые ситуации в моем приложении с помощью AI Debug Companion. Пожалуйста, объясни мне:

1. Что такое тупиковая ситуация в контексте программирования
2. Как правильно описывать тупики для точного анализа
3. Как использовать Tupik Buster для генерации решений
4. Как предотвращать тупиковые ситуации в будущем

Предоставь практические примеры и советы. Объясни, как это поможет быстрее решать сложные проблемы в коде.`)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition hover:shadow-lg w-full"
                    >
                      Скопировать промт для помощи по анализу тупиков
                    </button>
                  </div>
                  
                  <p className="text-gray-700 text-sm">
                    <strong>Как использовать:</strong> Нажмите кнопку выше, чтобы скопировать промт. 
                    Вставьте его в интерфейс вашей нейросети для получения помощи по анализу тупиков.
                  </p>
                </div>
              </div>
            )}
            
            {helpTopic === 'settings' && (
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Настройки системы</h3>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xl font-medium text-gray-800 mb-3">URL Коллектора</h4>
                    <p className="text-gray-700 mb-3">
                      URL вашего экземпляра коллектора, развернутого на Cloudflare Workers. 
                      Используется для отправки логов и анализа данных.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-xl font-medium text-gray-800 mb-3">Gemini API Key</h4>
                    <p className="text-gray-700 mb-3">
                      API ключ для доступа к модели Gemini от Google. Используется для анализа логов и тупиков.
                      Получите ключ на{' '}
                      <a 
                        href="https://aistudio.google.com/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline"
                      >
                        Google AI Studio
                      </a>
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-xl font-medium text-gray-800 mb-3">Токен авторизации</h4>
                    <p className="text-gray-700 mb-3">
                      Секретный токен для авторизации запросов к коллектору. 
                      Должен совпадать с токеном, указанным в конфигурации коллектора.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-xl font-medium text-gray-800 mb-3">Управление проектами</h4>
                    <p className="text-gray-700 mb-3">
                      Вы можете добавлять несколько проектов и переключаться между ними. 
                      Это удобно, если вы работаете с несколькими приложениями.
                    </p>
                  </div>
                </div>
                
                <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-100 mt-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">🤖 AI Помощь по настройкам через один клик</h3>
                  <p className="text-gray-700 mb-4">
                    Получите помощь по настройкам системы одним нажатием:
                  </p>
                  
                  <div className="mb-4">
                    <button 
                      onClick={() => copyToClipboard(`Помоги мне настроить систему AI Debug Companion. Вот текущие настройки:

- URL Коллектора: ${collectorUrl || 'не задан'}
- Текущий проект: ${currentProject || 'не выбран'}
- Gemini API Key: ${geminiApiKey ? 'задан' : 'не задан'}
- Токен авторизации: ${token ? 'задан' : 'не задан'}

Пожалуйста, объясни мне:

1. Как правильно настроить каждый параметр
2. Какие значения должны быть у каждого параметра
3. Как проверить, что настройки работают корректно
4. Как оптимизировать настройки для лучшей производительности

Предоставь практические рекомендации и примеры. Объясни, почему каждая настройка важна.`)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition hover:shadow-lg w-full"
                    >
                      Скопировать промт для помощи по настройкам
                    </button>
                  </div>
                  
                  <p className="text-gray-700 text-sm">
                    <strong>Как использовать:</strong> Нажмите кнопку выше, чтобы скопировать промт. 
                    Вставьте его в интерфейс вашей нейросети для получения помощи по настройкам.
                  </p>
                </div>
              </div>
            )}
            
            {!helpTopic && (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-6">Выберите тему помощи, чтобы получить подробную информацию</p>
                <div className="inline-block bg-indigo-100 p-4 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

export default App;