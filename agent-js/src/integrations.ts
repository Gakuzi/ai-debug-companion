// integrations.ts
import { logError, logInfo } from './logger';

// Install global error handlers
export function installGlobalErrorHandlers() {
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logError('Необработанная ошибка', {
      stack: error.stack,
      payload: {
        message: error.message,
        name: error.name
      }
    });
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    logError('Необработанная ошибка промиса', {
      payload: {
        reason: reason instanceof Error ? reason.message : String(reason),
        promise: promise
      }
    });
  });

  // For browser environments
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      logError('Необработанная ошибка в браузере', {
        msg: event.message,
        stack: event.error?.stack,
        payload: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      logError('Необработанная ошибка промиса в браузере', {
        payload: {
          reason: event.reason instanceof Error ? event.reason.message : String(event.reason),
          promise: event.promise
        }
      });
    });
  }
}

// Wrap fetch to log HTTP requests
export function wrapFetch(originalFetch: typeof fetch = fetch): typeof fetch {
  return async function fetchWrapper(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const startTime = Date.now();
    const url = input instanceof URL ? input.toString() : typeof input === 'string' ? input : input.url;
    const method = init?.method || (input as Request).method || 'GET';

    try {
      const response = await originalFetch(input, init);
      const latencyMs = Date.now() - startTime;

      logInfo(`HTTP запрос завершен: ${method} ${url}`, {
        http: {
          method,
          url,
          status: response.status,
          latencyMs
        }
      });

      return response;
    } catch (error) {
      const latencyMs = Date.now() - startTime;

      logError(`HTTP запрос завершился ошибкой: ${method} ${url}`, {
        http: {
          method,
          url,
          status: 0, // 0 indicates network error
          latencyMs
        },
        stack: error instanceof Error ? error.stack : undefined,
        payload: {
          errorMessage: error instanceof Error ? error.message : String(error)
        }
      });

      throw error;
    }
  };
}