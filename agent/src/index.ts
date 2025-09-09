import { getMemoryLog, initLogger, logDebug as _logDebug, logInfo as _logInfo, logWarn as _logWarn, logError as _logError, logFatal as _logFatal } from './logger'

export type { Level, LoggerOptions, LogEntry, HttpInfo, CtxInfo, TraceInfo } from './logger'
export { 
  initLogger,
  _logDebug as logDebug,
  _logInfo as logInfo,
  _logWarn as logWarn,
  _logError as logError,
  _logFatal as logFatal,
  getMemoryLog
} from './logger'

export { 
  installGlobalErrorHandlers,
  wrapFetch,
  autoCollect,
  stopAutoCollect
} from './monitor'

export { 
  initTupikMode,
  generateDataCollector,
  reportTupik
} from './tupik'

export { BlackBox } from './BlackBox'

// New function to initialize the agent with the required parameters
export function initAgent(projectId: string, collectorUrl: string, redact: 'maskSecrets' | 'none' = 'maskSecrets'): void {
  initLogger({
    projectId,
    collectorUrl,
    redact
  });
}

// Utility functions
export function maskSecrets(obj: any): any {
  if (obj === null || obj === undefined) return obj
  if (typeof obj === 'string') {
    return obj.replace(/(api_key|token|authorization|secret|password)=[^\s&]+/gi, '$1=***')
  }
  if (Array.isArray(obj)) {
    return obj.map(maskSecrets)
  }
  if (typeof obj === 'object') {
    const result: any = {}
    for (const [key, value] of Object.entries(obj)) {
      if (/api_key|token|authorization|secret|password/i.test(key)) {
        result[key] = '***'
      } else {
        result[key] = maskSecrets(value)
      }
    }
    return result
  }
  return obj
}

// Функция для сбора информации о проекте в браузерной среде
function collectBrowserProjectInfo(): any {
  try {
    // Сбор информации о зависимостях
    let deps: string[] = [];
    try {
      // Сбор информации о загруженных скриптах
      const scripts = Array.from(document.querySelectorAll('script[src]')).map(s => (s as HTMLScriptElement).src);
      // Сбор информации о загруженных стилях
      const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(l => (l as HTMLLinkElement).href);
      deps = [...scripts, ...styles];
    } catch (e) {
      // Игнорируем ошибки при сборе зависимостей
    }
    
    // Сбор информации о структуре проекта
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
      files: [], // В браузерной среде мы не можем получить список файлов
      deps,
      projectStructure,
      errors
    };
  } catch (error) {
    return {
      files: [],
      deps: [],
      projectStructure: [],
      errors: []
    };
  }
}

export function exportBundle(): any {
  // Получаем последние 2000 логов
  const logs = getMemoryLog().slice(-2000)
  
  // Собираем информацию о проекте
  const projectInfo = collectBrowserProjectInfo();
  
  return {
    logs,
    files: projectInfo.files,
    deps: projectInfo.deps,
    projectStructure: projectInfo.projectStructure,
    errors: projectInfo.errors,
    meta: {
      createdAt: new Date().toISOString(),
      filter: "all"
    }
  }
}