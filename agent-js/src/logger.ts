/* eslint-disable */
export type Level = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL'

export interface LoggerOptions {
  projectId: string
  level?: Level
  collectorUrl?: string
  batchSize?: number
  flushInterval?: number
  redact?: 'maskSecrets' | 'none'
}

export interface HttpInfo {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD'
  url?: string
  status?: number
  latencyMs?: number
}

export interface CtxInfo {
  module?: string
  file?: string
  func?: string
  line?: number
  model?: string
  keyMask?: string
}

export interface TraceInfo {
  traceId?: string
  spanId?: string
  parentId?: string
}

export interface LogEntry {
  ts: string
  level: Level
  msg: string
  code?: string | number
  http?: HttpInfo
  ctx?: CtxInfo
  trace?: TraceInfo
  stack?: string
  payload?: unknown
}

let memoryLog: LogEntry[] = []
let queue: LogEntry[] = []
let configured: Required<Omit<LoggerOptions, 'redact'>> & { redact: LoggerOptions['redact'] } | null = null
let flushTimer: ReturnType<typeof setInterval> | null = null

const levelOrder: Record<Level, number> = {
  DEBUG: 10,
  INFO: 20,
  WARN: 30,
  ERROR: 40,
  FATAL: 50,
}

function maskSecretsDeep(value: unknown): unknown {
  if (value == null) return value
  if (typeof value === 'string') {
    if (/api_key|token|authorization/i.test(value)) return '***'
    return value
  }
  if (Array.isArray(value)) return value.map(maskSecretsDeep)
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (/api_key|token|authorization|secret|password/i.test(k)) {
        out[k] = '***'
      } else {
        out[k] = maskSecretsDeep(v)
      }
    }
    return out
  }
  return value
}

function maybeMask(entry: LogEntry, redact: LoggerOptions['redact']): LogEntry {
  if (redact !== 'maskSecrets') return entry
  const cloned: LogEntry = JSON.parse(JSON.stringify(entry))
  if (cloned.payload) cloned.payload = maskSecretsDeep(cloned.payload)
  if (cloned.ctx) cloned.ctx = maskSecretsDeep(cloned.ctx) as CtxInfo
  if (cloned.http) cloned.http = maskSecretsDeep(cloned.http) as HttpInfo
  cloned.msg = typeof cloned.msg === 'string' ? cloned.msg.replace(/(api_key|token)=[^\s&]+/gi, '$1=***') : cloned.msg
  return cloned
}

async function flush(): Promise<void> {
  if (!configured) return
  if (!configured.collectorUrl) return
  if (queue.length === 0) return
  const batch = queue.splice(0, configured.batchSize)
  try {
    await fetch(configured.collectorUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ projectId: configured.projectId, entries: batch }),
    })
    // Сообщение для разработчика на русском
    console.log('Логи отправлены')
  } catch (e) {
    // не прерываем приложение
  }
}

function schedule(): void {
  if (!configured) return
  if (flushTimer) return
  flushTimer = setInterval(() => void flush(), configured.flushInterval)
}

export function initLogger(opts: LoggerOptions): void {
  configured = {
    projectId: opts.projectId,
    level: opts.level ?? 'INFO',
    collectorUrl: opts.collectorUrl ?? '',
    batchSize: Math.max(1, opts.batchSize ?? 50),
    flushInterval: Math.max(250, opts.flushInterval ?? 3000),
    redact: opts.redact ?? 'maskSecrets',
  }
  if (flushTimer) clearInterval(flushTimer)
  flushTimer = null
  schedule()
}

function shouldLog(level: Level): boolean {
  if (!configured) return false
  return levelOrder[level] >= levelOrder[configured.level]
}

function push(entry: Omit<LogEntry, 'ts'> & { ts?: string }): void {
  const base: LogEntry = { ...entry, ts: entry.ts ?? new Date().toISOString() }
  const finalEntry = configured ? maybeMask(base, configured.redact) : base
  memoryLog.push(finalEntry)
  if (memoryLog.length > 500) memoryLog = memoryLog.slice(-500)
  if (configured) {
    queue.push(finalEntry)
    if (queue.length >= configured.batchSize) void flush()
  }
}

export function logDebug(msg: string, details?: Partial<LogEntry>): void {
  if (!shouldLog('DEBUG')) return
  push({ level: 'DEBUG', msg, ...details })
}
export function logInfo(msg: string, details?: Partial<LogEntry>): void {
  if (!shouldLog('INFO')) return
  push({ level: 'INFO', msg, ...details })
}
export function logWarn(msg: string, details?: Partial<LogEntry>): void {
  if (!shouldLog('WARN')) return
  push({ level: 'WARN', msg, ...details })
}
export function logError(msg: string, details?: Partial<LogEntry>): void {
  if (!shouldLog('ERROR')) return
  push({ level: 'ERROR', msg, ...details })
}
export function logFatal(msg: string, details?: Partial<LogEntry>): void {
  if (!shouldLog('FATAL')) return
  push({ level: 'FATAL', msg, ...details })
}

export function getMemoryLog(): LogEntry[] {
  return memoryLog.slice(-500)
}

export const __internal = { flush, schedule }
