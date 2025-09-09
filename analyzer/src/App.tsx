import React, { useState } from 'react';

// Updated to fix GitHub Pages deployment issues
// Accordion component for collapsible sections
const Accordion = ({ title, children, isOpen, onToggle }: { title: string; children: React.ReactNode; isOpen: boolean; onToggle: () => void }) => (
  <div className="mb-4 border border-gray-200 rounded-lg">
    <button
      className="w-full p-4 text-left font-medium bg-gray-50 hover:bg-gray-100 rounded-lg transition"
      onClick={onToggle}
    >
      <div className="flex justify-between items-center">
        <span>{title}</span>
        <svg 
          className={`w-5 h-5 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </button>
    {isOpen && (
      <div className="p-4 bg-white border-t border-gray-200 rounded-b-lg">
        {children}
      </div>
    )}
  </div>
);

function App() {
  // State variables
  const [activeSection, setActiveSection] = useState<'home' | 'setup' | 'integration' | 'monitoring' | 'tupik' | 'settings'>('home');
  const [logs, setLogs] = useState<any[]>([]);
  const [snapshot, setSnapshot] = useState<any>(null);
  const [summary, setSummary] = useState<string>('');
  const [tupikDesc, setTupikDesc] = useState<string>('');
  const [devPrompt, setDevPrompt] = useState<string>('');
  const [projects, setProjects] = useState<Array<{id: string, name: string}>>([]);
  const [currentProject, setCurrentProject] = useState<string>('');

  // Accordion states for setup section
  const [setupSteps, setSetupSteps] = useState({
    step1: false,
    step2: false,
    step3: false,
    step4: false
  });

  // Accordion states for integration section
  const [integrationSteps, setIntegrationSteps] = useState({
    step1: false,
    step2: false
  });

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

  // Toggle setup step
  const toggleSetupStep = (step: keyof typeof setupSteps) => {
    setSetupSteps(prev => ({
      ...prev,
      [step]: !prev[step]
    }));
  };

  // Toggle integration step
  const toggleIntegrationStep = (step: keyof typeof integrationSteps) => {
    setIntegrationSteps(prev => ({
      ...prev,
      [step]: !prev[step]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-indigo-800 mb-2">AI Debug Companion</h1>
          <p className="text-lg text-indigo-600">ИИ-ассистент для анализа и исправления ошибок в разработке</p>
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
                onClick={() => setActiveSection('setup')}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${activeSection === 'setup' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-indigo-100'}`}
              >
                Начальная настройка
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
          </ul>
        </nav>

```

```
