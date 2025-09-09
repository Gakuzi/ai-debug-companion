// test-logger.ts
import { initLogger, logInfo, logError, logWarn, logDebug, installGlobalErrorHandlers, wrapFetch } from '@ai-debug-companion/agent-logger';
import BlackBox from '@ai-debug-companion/agent-logger/dist/BlackBox';

// Initialize the logger
const logger = initLogger({
  projectId: 'test-project',
  level: 'DEBUG',
  collectorUrl: 'http://localhost:3000/logs',
  batchSize: 50,
  flushInterval: 3000
});

// Test logging functions
logInfo('Тестовое информационное сообщение');
logWarn('Тестовое предупреждение');
logError('Тестовая ошибка');
logDebug('Тестовое отладочное сообщение');

// Install global error handlers
installGlobalErrorHandlers();

// Wrap fetch
const wrappedFetch = wrapFetch();

// Test the BlackBox component
// Note: This would be used in a React component

console.log('Logger test completed');