// src/test-agent.ts
import { initLogger, logInfo, logError, logWarn, BlackBox } from 'ai-debug-companion-agent';
// Initialize the logger
initLogger({
    projectId: 'test-project',
    collectorUrl: 'http://localhost:3000/logs',
    level: 'DEBUG'
});
// Log some test messages
logInfo('Тестовое информационное сообщение');
logWarn('Тестовое предупреждение');
logError('Тестовая ошибка');
// Example of using the BlackBox component in a React app
// This would go in your App.tsx file:
/*
import React from 'react';
import { BlackBox } from 'ai-debug-companion-agent';

function App() {
  return (
    <div className="App">
      <h1>Test App</h1>
      <BlackBox projectId="test-project" />
    </div>
  );
}

export default App;
*/ 
//# sourceMappingURL=test-agent.js.map