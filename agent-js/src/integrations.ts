/* eslint-disable */
import { logError, logInfo } from './logger'

export function installGlobalErrorHandlers(): void {
  if (typeof window === 'undefined') return
  window.addEventListener('error', (event) => {
    logError('Необработанная ошибка', {
      stack: event?.error?.stack,
      payload: { 
        message: String(event?.error?.message ?? event?.message), 
        source: event?.filename, 
        lineno: event?.lineno, 
        colno: event?.colno 
      },
    })
  })
  window.addEventListener('unhandledrejection', (event) => {
    const reason = (event as PromiseRejectionEvent).reason
    logError('Необработанное отклонение промиса', {
      stack: reason?.stack,
      payload: { reason },
    })
  })
}

export function wrapFetch(): void {
  if (typeof window === 'undefined' && typeof globalThis.fetch === 'undefined') return
  const origFetch: typeof fetch | undefined = globalThis.fetch
  if (!origFetch) return
  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const start = Date.now()
    let method = 'GET'
    let url = ''
    if (typeof input === 'string') { 
      url = input 
    } else if (input instanceof URL) { 
      url = input.toString() 
    } else { 
      url = input.url
      method = input.method || method 
    }
    if (init?.method) method = init.method
    try {
      const res = await origFetch(input as any, init)
      const latencyMs = Date.now() - start
      logInfo('HTTP запрос', { 
        http: { 
          method: method as any, 
          url, 
          status: res.status, 
          latencyMs 
        } 
      })
      return res
    } catch (e) {
      const latencyMs = Date.now() - start
      logError('HTTP ошибка', { 
        http: { 
          method: method as any, 
          url, 
          latencyMs 
        }, 
        payload: { error: String(e) } 
      })
      throw e
    }
  }
}