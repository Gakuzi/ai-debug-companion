/* eslint-disable */
import { logError, logInfo, logWarn } from './logger'

// Global error handlers
export function installGlobalErrorHandlers(): void {
  if (typeof window === 'undefined') return
  
  // Обработчик необработанных ошибок
  window.addEventListener('error', (event) => {
    logError('Ошибка в приложении', {
      stack: event?.error?.stack,
      payload: { 
        message: String(event?.error?.message ?? event?.message), 
        source: event?.filename, 
        lineno: event?.lineno, 
        colno: event?.colno 
      },
    })
  })
  
  // Обработчик необработанных отклонений промисов
  window.addEventListener('unhandledrejection', (event) => {
    const reason = (event as PromiseRejectionEvent).reason
    logError('Необработанное отклонение промиса', {
      stack: reason?.stack,
      payload: { reason },
    })
  })
}

// Fetch wrapper for HTTP logging
export function wrapFetch(): void {
  if (typeof window === 'undefined' && typeof globalThis.fetch === 'undefined') return
  const origFetch: typeof fetch | undefined = globalThis.fetch
  if (!origFetch) return
  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const start = Date.now()
    let method = 'GET'
    let url = ''
    if (typeof input === 'string') { url = input } else if (input instanceof URL) { url = input.toString() } else { url = input.url; method = input.method || method }
    if (init?.method) method = init.method
    try {
      const res = await origFetch(input as any, init)
      const latencyMs = Date.now() - start
      logInfo('HTTP запрос', { http: { method: method as any, url, status: res.status, latencyMs } })
      return res
    } catch (e) {
      const latencyMs = Date.now() - start
      logError('HTTP ошибка', { http: { method: method as any, url, latencyMs }, payload: { error: String(e) } })
      throw e
    }
  }
}

// Auto collection functionality
let collectionInterval: ReturnType<typeof setInterval> | null = null

// Функция для сбора информации о проекте
function collectProjectInfo(): any {
  try {
    // Сбор информации о зависимостях (если доступен package.json)
    let deps: string[] = [];
    try {
      // В браузерной среде мы не можем напрямую читать файлы,
      // но можем попытаться получить информацию из глобальных объектов
      if (typeof window !== 'undefined') {
        // Сбор информации о загруженных скриптах
        const scripts = Array.from(document.querySelectorAll('script[src]')).map(s => (s as HTMLScriptElement).src);
        // Сбор информации о загруженных стилях
        const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(l => (l as HTMLLinkElement).href);
        deps = [...scripts, ...styles];
      }
    } catch (e) {
      // Игнорируем ошибки при сборе зависимостей
    }
    
    // Сбор информации о структуре проекта (в браузерной среде ограничены возможности)
    const projectStructure: string[] = [];
    if (typeof window !== 'undefined') {
      projectStructure.push('Browser Environment');
      projectStructure.push(`URL: ${window.location.href}`);
      projectStructure.push(`User Agent: ${navigator.userAgent}`);
      projectStructure.push(`Screen: ${screen.width}x${screen.height}`);
    }
    
    // Сбор информации об ошибках из глобального объекта ошибок
    const errors: any[] = [];
    
    return {
      deps,
      projectStructure,
      errors
    };
  } catch (error) {
    logError('Ошибка при сборе информации о проекте', {
      payload: { error: String(error) }
    });
    return {
      deps: [],
      projectStructure: [],
      errors: []
    };
  }
}

export function autoCollect(): void {
  if (collectionInterval) {
    clearInterval(collectionInterval)
  }
  
  collectionInterval = setInterval(() => {
    try {
      // Собираем информацию о проекте
      const projectInfo = collectProjectInfo();
      
      // Логируем информацию о сборе данных
      logInfo('Автоматический сбор данных', {
        payload: { 
          timestamp: new Date().toISOString(),
          message: 'Сканирование файлов, логов и зависимостей',
          projectInfo
        }
      })
    } catch (error) {
      logError('Ошибка при автоматическом сборе данных', {
        payload: { error: String(error) }
      })
    }
  }, 30000) // Каждые 30 секунд
}

// Функция для остановки автоматического сбора
export function stopAutoCollect(): void {
  if (collectionInterval) {
    clearInterval(collectionInterval)
    collectionInterval = null
    logInfo('Автоматический сбор данных остановлен', {})
  }
}