// logger.ts
export type Level = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';

export interface LogEntry {
  ts: string;
  level: Level;
  msg: string;
  code?: string;
  http?: {
    method: string;
    url: string;
    status: number;
    latencyMs: number;
  };
  ctx?: {
    module: string;
    file: string;
    func: string;
    line: number;
    model?: string;
    keyMask?: string;
  };
  trace?: {
    traceId: string;
    spanId: string;
    parentId: string;
  };
  stack?: string;
  payload?: any;
}

export interface LoggerOptions {
  projectId: string;
  level?: Level;
  collectorUrl: string;
  batchSize?: number;
  flushInterval?: number;
  redact?: (entry: LogEntry) => LogEntry;
}

// Global logger instance
let loggerInstance: Logger | null = null;

// Default redaction function to mask secrets
export const maskSecrets = (entry: LogEntry): LogEntry => {
  const redactedEntry = { ...entry };
  
  // Mask API keys and tokens in the message
  if (redactedEntry.msg) {
    redactedEntry.msg = redactedEntry.msg.replace(/(api[_-]?key|token)[^a-zA-Z0-9]*([a-zA-Z0-9_\-])[a-zA-Z0-9_\-]*/gi, '$1***');
  }
  
  // Mask in payload if it exists
  if (redactedEntry.payload) {
    try {
      const payloadStr = JSON.stringify(redactedEntry.payload);
      const redactedPayloadStr = payloadStr.replace(/(api[_-]?key|token)[^a-zA-Z0-9]*([a-zA-Z0-9_\-])[a-zA-Z0-9_\-]*/gi, '$1***');
      redactedEntry.payload = JSON.parse(redactedPayloadStr);
    } catch (e) {
      // If payload is not serializable, leave it as is
    }
  }
  
  return redactedEntry;
};

class Logger {
  private options: LoggerOptions;
  private buffer: LogEntry[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  
  constructor(options: LoggerOptions) {
    this.options = {
      level: 'INFO',
      batchSize: 50,
      flushInterval: 3000,
      redact: maskSecrets,
      ...options
    };
    
    // Start the flush timer
    this.startFlushTimer();
  }
  
  private startFlushTimer() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.options.flushInterval);
  }
  
  private shouldLog(level: Level): boolean {
    const levels: Level[] = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'];
    const currentLevelIndex = levels.indexOf(this.options.level || 'INFO');
    const logLevelIndex = levels.indexOf(level);
    
    return logLevelIndex >= currentLevelIndex;
  }
  
  private addToBuffer(entry: LogEntry) {
    // Apply redaction if provided
    const redactedEntry = this.options.redact ? this.options.redact(entry) : entry;
    
    this.buffer.push(redactedEntry);
    
    // Flush if buffer is full
    if (this.buffer.length >= (this.options.batchSize || 50)) {
      this.flush();
    }
  }
  
  async flush() {
    if (this.buffer.length === 0) return;
    
    const batch = [...this.buffer];
    this.buffer = [];
    
    try {
      const response = await fetch(this.options.collectorUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: this.options.projectId,
          logs: batch
        })
      });
      
      if (response.ok) {
        console.log('Логи отправлены');
      } else {
        console.error('Ошибка отправки логов:', response.status);
      }
    } catch (error) {
      console.error('Ошибка сети при отправке логов:', error);
    }
  }
  
  log(level: Level, msg: string, meta?: Partial<LogEntry>) {
    if (!this.shouldLog(level)) return;
    
    const entry: LogEntry = {
      ts: new Date().toISOString(),
      level,
      msg,
      ...meta
    };
    
    this.addToBuffer(entry);
  }
  
  logDebug(msg: string, meta?: Partial<LogEntry>) {
    this.log('DEBUG', msg, meta);
  }
  
  logInfo(msg: string, meta?: Partial<LogEntry>) {
    this.log('INFO', msg, meta);
  }
  
  logWarn(msg: string, meta?: Partial<LogEntry>) {
    this.log('WARN', msg, meta);
  }
  
  logError(msg: string, meta?: Partial<LogEntry>) {
    this.log('ERROR', msg, meta);
  }
  
  logFatal(msg: string, meta?: Partial<LogEntry>) {
    this.log('FATAL', msg, meta);
  }
  
  getMemoryLog(): LogEntry[] {
    return [...this.buffer];
  }
}

export function initLogger(options: LoggerOptions): Logger {
  loggerInstance = new Logger(options);
  return loggerInstance;
}

export function getLogger(): Logger | null {
  return loggerInstance;
}

// Convenience functions that use the global logger instance
export function logDebug(msg: string, meta?: Partial<LogEntry>) {
  if (loggerInstance) {
    loggerInstance.logDebug(msg, meta);
  }
}

export function logInfo(msg: string, meta?: Partial<LogEntry>) {
  if (loggerInstance) {
    loggerInstance.logInfo(msg, meta);
  }
}

export function logWarn(msg: string, meta?: Partial<LogEntry>) {
  if (loggerInstance) {
    loggerInstance.logWarn(msg, meta);
  }
}

export function logError(msg: string, meta?: Partial<LogEntry>) {
  if (loggerInstance) {
    loggerInstance.logError(msg, meta);
  }
}

export function logFatal(msg: string, meta?: Partial<LogEntry>) {
  if (loggerInstance) {
    loggerInstance.logFatal(msg, meta);
  }
}