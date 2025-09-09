import { useState, useEffect } from 'react'
import { 
  initLogger, 
  logDebug, 
  logInfo, 
  logWarn, 
  logError, 
  logFatal,
  installGlobalErrorHandlers,
  wrapFetch,
  initTupikMode,
  BlackBox 
} from 'ai-debug-companion-agent'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    // Initialize the logger
    initLogger({
      projectId: 'test-app',
      level: 'DEBUG',
      collectorUrl: 'http://localhost:8787', // Updated to match collector base URL
      batchSize: 10,
      flushInterval: 2000,
      redact: 'maskSecrets'
    })

    // Initialize Tupik mode
    initTupikMode('test-api-key-12345')

    // Install global error handlers
    installGlobalErrorHandlers()

    // Wrap fetch for HTTP logging
    wrapFetch()

    // Log some initial messages
    logInfo('Приложение запущено', {
      ctx: { module: 'App', func: 'useEffect' },
      payload: { userAgent: navigator.userAgent }
    })

    logDebug('Инициализация завершена', {
      ctx: { module: 'App' }
    })
  }, [])

  const handleClick = () => {
    setCount((count) => count + 1)
    
    if (count % 5 === 0) {
      logWarn('Кнопка нажата много раз', {
        ctx: { module: 'App', func: 'handleClick' },
        payload: { count: count + 1 }
      })
    } else if (count % 3 === 0) {
      logError('Тестовая ошибка', {
        ctx: { module: 'App', func: 'handleClick' },
        stack: new Error().stack,
        payload: { count: count + 1 }
      })
    } else {
      logInfo('Кнопка нажата', {
        ctx: { module: 'App', func: 'handleClick' },
        payload: { count: count + 1 }
      })
    }
  }

  const triggerError = () => {
    logFatal('Критическая ошибка для тестирования', {
      ctx: { module: 'App', func: 'triggerError' },
      stack: new Error('Тестовая критическая ошибка').stack,
      payload: { timestamp: Date.now() }
    })
    
    // Also trigger an unhandled error
    setTimeout(() => {
      throw new Error('Необработанная ошибка для тестирования')
    }, 100)
  }

  const testFetch = async () => {
    try {
      logInfo('Тестируем HTTP запрос', { ctx: { module: 'App', func: 'testFetch' } })
      
      // This will be logged by wrapFetch
      // Simulating a TypeError in fetch
      const response = await fetch('invalid-url://test') // This will cause a TypeError
      const data = await response.json()
      
      logInfo('HTTP запрос успешен', {
        ctx: { module: 'App', func: 'testFetch' },
        payload: { status: response.status, dataKeys: Object.keys(data) }
      })
    } catch (error) {
      logError('HTTP запрос неудачен', {
        ctx: { module: 'App', func: 'testFetch' },
        payload: { error: String(error) }
      })
    }
  }

  const testSecretMasking = () => {
    logInfo('Тестируем маскировку секретов', {
      payload: {
        api_key: 'secret-api-key-12345',
        token: 'bearer-token-abc123',
        password: 'super-secret-password',
        normalData: 'это не секрет'
      }
    })
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
            Тест HTTP запроса (с TypeError)
          </button>
          
          <button onClick={testSecretMasking} style={{ backgroundColor: '#7c3aed' }}>
            Тест маскировки секретов
          </button>
        </div>

        <div className="info">
          <p>Откройте BlackBox внизу экрана для просмотра логов</p>
          <p>Попробуйте разные действия и посмотрите, как логируются события</p>
          <p>Нажмите "Тест HTTP запроса (с TypeError)" для симуляции бага</p>
        </div>
      </header>

      {/* Ваше приложение */}
      <BlackBox height={300} />
    </div>
  )
}

export default App