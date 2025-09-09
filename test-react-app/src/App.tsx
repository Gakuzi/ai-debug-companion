import { useState, useEffect } from 'react'
import { 
  initLogger, 
  logDebug, 
  logInfo, 
  logWarn, 
  logError, 
  installGlobalErrorHandlers, 
  wrapFetch,
  BlackBox
} from 'ai-debug-companion-agent'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [isBlackBoxOpen, setIsBlackBoxOpen] = useState(false)

  useEffect(() => {
    // Initialize the logger
    initLogger({
      projectId: 'test-react-app',
      level: 'DEBUG',
      collectorUrl: 'http://localhost:8787',
      redact: 'maskSecrets'
    })

    // Install global error handlers
    installGlobalErrorHandlers()

    // Wrap fetch for HTTP logging
    wrapFetch()

    // Log initial message
    logInfo('Приложение запущено', {
      payload: { 
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      }
    })
  }, [])

  const handleClick = () => {
    setCount(count + 1)
    
    if (count % 5 === 0) {
      logWarn('Кнопка нажата много раз', {
        payload: { count: count + 1 }
      })
    } else if (count % 3 === 0) {
      logError('Тестовая ошибка', {
        payload: { count: count + 1 }
      })
    } else {
      logInfo('Кнопка нажата', {
        payload: { count: count + 1 }
      })
    }
  }

  const triggerError = () => {
    logError('Тестовая ошибка для проверки', {
      payload: { 
        message: 'Это тестовая ошибка',
        timestamp: Date.now()
      }
    })
    
    // Trigger an unhandled error
    setTimeout(() => {
      throw new Error('Необработанная ошибка для тестирования')
    }, 100)
  }

  const testFetch = async () => {
    logInfo('Тестирование HTTP запроса', {
      payload: { message: 'Отправка тестового запроса' }
    })
    
    try {
      // This will be logged by wrapFetch
      const response = await fetch('https://jsonplaceholder.typicode.com/posts/1')
      const data = await response.json()
      
      logInfo('HTTP запрос успешен', {
        payload: { 
          status: response.status, 
          dataKeys: Object.keys(data) 
        }
      })
    } catch (error) {
      logError('HTTP запрос неудачен', {
        payload: { error: String(error) }
      })
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>AI Debug Companion - Тестовое приложение</h1>
        <p>Счетчик: {count}</p>
        
        <div className="button-group">
          <button onClick={handleClick}>
            Увеличить счетчик
          </button>
          
          <button onClick={triggerError} style={{ backgroundColor: '#dc2626' }}>
            Вызвать ошибку
          </button>
          
          <button onClick={testFetch} style={{ backgroundColor: '#2563eb' }}>
            Тест HTTP запроса
          </button>
          
          <button 
            onClick={() => setIsBlackBoxOpen(!isBlackBoxOpen)} 
            style={{ backgroundColor: '#7c3aed' }}
          >
            {isBlackBoxOpen ? 'Скрыть BlackBox' : 'Показать BlackBox'}
          </button>
        </div>

        <div className="info">
          <p>Нажмите кнопки для генерации логов</p>
          <p>Откройте BlackBox для просмотра логов в реальном времени</p>
        </div>
      </header>

      <BlackBox 
        isOpen={isBlackBoxOpen}
        onToggle={() => setIsBlackBoxOpen(!isBlackBoxOpen)}
        height={300}
      />
    </div>
  )
}

export default App