// BlackBox.tsx
import * as React from 'react';
import { useState, useEffect } from 'react';
import { getLogger, LogEntry, Level } from './logger';

interface BlackBoxProps {
  projectId: string;
}

const BlackBox: React.FC<BlackBoxProps> = ({ projectId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<Level | 'ALL'>('ALL');
  const [tupikMode, setTupikMode] = useState(false);
  const [tupikDescription, setTupikDescription] = useState('');

  // Update logs from memory
  useEffect(() => {
    const interval = setInterval(() => {
      const logger = getLogger();
      if (logger) {
        const memoryLogs = logger.getMemoryLog();
        setLogs(memoryLogs);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const filteredLogs = filter === 'ALL' 
    ? logs 
    : logs.filter(log => log.level === filter);

  const displayedLogs = [...filteredLogs].reverse().slice(0, 50);

  const getLevelColor = (level: Level) => {
    switch (level) {
      case 'ERROR': case 'FATAL':
        return 'text-red-500';
      case 'WARN':
        return 'text-yellow-500';
      case 'INFO':
        return 'text-blue-400';
      case 'DEBUG':
        return 'text-gray-400';
      default:
        return 'text-white';
    }
  };

  const copyLogs = () => {
    const logsText = displayedLogs.map(log => 
      `[${log.ts}] ${log.level}: ${log.msg}`
    ).join('\n');
    
    navigator.clipboard.writeText(logsText);
  };

  const saveToFile = () => {
    const logsText = displayedLogs.map(log => 
      `[${log.ts}] ${log.level}: ${log.msg}`
    ).join('\n');
    
    const blob = new Blob([logsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${projectId}-${new Date().toISOString()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadBundle = () => {
    // In a real implementation, this would collect more data
    alert('Бандл будет скачан');
  };

  const handleTupikSubmit = () => {
    if (tupikDescription.trim()) {
      // In a real implementation, this would send the tupik data to the analyzer
      alert('Данные отправлены в анализатор!');
      setTupikMode(false);
      setTupikDescription('');
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white font-mono z-50">
      {/* Collapsed view */}
      {!isOpen && (
        <div 
          className="h-16 flex items-center justify-between px-4 cursor-pointer border-t border-gray-700"
          onClick={() => setIsOpen(true)}
        >
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
            <span>BlackBox AI Debug Companion</span>
          </div>
          <div className="flex space-x-2">
            <span className="bg-red-500 text-xs px-2 py-1 rounded">ERROR: {logs.filter(l => l.level === 'ERROR' || l.level === 'FATAL').length}</span>
            <span className="bg-yellow-500 text-xs px-2 py-1 rounded">WARN: {logs.filter(l => l.level === 'WARN').length}</span>
          </div>
        </div>
      )}

      {/* Expanded view */}
      {isOpen && (
        <div className="h-96 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-2 bg-gray-900 border-b border-gray-700">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
              <span>BlackBox AI Debug Companion</span>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => setIsOpen(false)}
                className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
              >
                ↓ Свернуть
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center p-2 bg-gray-700 text-sm space-x-2">
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value as Level | 'ALL')}
              className="bg-gray-600 text-white px-2 py-1 rounded"
            >
              <option value="ALL">ВСЁ</option>
              <option value="ERROR">ОШИБКА</option>
              <option value="WARN">ПРЕДУПРЕЖДЕНИЕ</option>
              <option value="INFO">ИНФО</option>
              <option value="DEBUG">DEBUG</option>
            </select>

            <button 
              onClick={copyLogs}
              className="px-2 py-1 bg-gray-600 hover:bg-gray-500 rounded"
            >
              Копировать
            </button>
            <button 
              onClick={saveToFile}
              className="px-2 py-1 bg-gray-600 hover:bg-gray-500 rounded"
            >
              Сохранить в файл
            </button>
            <button 
              onClick={downloadBundle}
              className="px-2 py-1 bg-gray-600 hover:bg-gray-500 rounded"
            >
              Скачать бандл
            </button>

            {!tupikMode ? (
              <button 
                onClick={() => setTupikMode(true)}
                className="px-2 py-1 bg-orange-600 hover:bg-orange-500 rounded flex items-center"
              >
                🚧 Тупик?
              </button>
            ) : (
              <button 
                onClick={() => setTupikMode(false)}
                className="px-2 py-1 bg-gray-600 hover:bg-gray-500 rounded"
              >
                Отмена
              </button>
            )}
          </div>

          {/* Tupik Mode */}
          {tupikMode && (
            <div className="p-2 bg-gray-700 border-b border-gray-600">
              <textarea
                value={tupikDescription}
                onChange={(e) => setTupikDescription(e.target.value)}
                placeholder="Опишите тупик: какая ошибка?"
                className="w-full h-20 p-2 bg-gray-600 text-white rounded mb-2"
              />
              <button 
                onClick={handleTupikSubmit}
                disabled={!tupikDescription.trim()}
                className="px-3 py-1 bg-orange-600 hover:bg-orange-500 rounded disabled:opacity-50"
              >
                Разблокировать Тупик
              </button>
            </div>
          )}

          {/* Logs */}
          <div className="flex-1 overflow-y-auto p-2 bg-gray-900">
            {displayedLogs.length === 0 ? (
              <div className="text-gray-500 text-center py-4">
                Нет логов для отображения
              </div>
            ) : (
              <div className="space-y-1">
                {displayedLogs.map((log, index) => (
                  <div 
                    key={index} 
                    className={`text-xs ${getLevelColor(log.level)}`}
                  >
                    <span className="mr-2">[{log.ts}]</span>
                    <span className="font-bold mr-2">{log.level}:</span>
                    <span>{log.msg}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BlackBox;