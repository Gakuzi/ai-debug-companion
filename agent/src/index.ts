import { getMemoryLog } from './logger'

export type { Level, LoggerOptions, LogEntry, HttpInfo, CtxInfo, TraceInfo } from './logger'
export { 
  initLogger,
  logDebug,
  logInfo,
  logWarn,
  logError,
  logFatal,
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

export function exportBundle(): any {
  // Получаем последние 2000 логов
  const logs = getMemoryLog().slice(-2000)
  
  // Здесь будет логика сбора файлов, зависимостей и структуры проекта
  // Пока что возвращаем заглушку
  return {
    logs,
    files: [], // Список файлов проекта
    deps: [], // Зависимости из package.json
    projectStructure: [] // Структура проекта
  }
}