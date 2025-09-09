# Agent Logger

Agent Logger with Russian UI for AI Debug Companion. This package provides a comprehensive logging solution with the following features:

## Features

- **Multi-level logging**: DEBUG, INFO, WARN, ERROR, FATAL
- **Batch sending**: Logs are sent in batches to reduce network traffic
- **Secret redaction**: Automatically masks API keys and tokens
- **React component**: BlackBox UI for viewing logs in the browser
- **Integration utilities**: Global error handlers and fetch wrapper
- **Tupik mode**: Special mode for handling deadlock situations

## Installation

```bash
npm install agent-logger
```

## Usage

### Initialize Logger

```typescript
import { initLogger } from 'agent-logger';

const logger = initLogger({
  projectId: 'your-project-id',
  level: 'INFO',
  collectorUrl: 'http://your-collector-url/logs',
  batchSize: 50,
  flushInterval: 3000
});
```

### Logging Functions

```typescript
import { logDebug, logInfo, logWarn, logError, logFatal } from 'agent-logger';

logDebug('Debug message');
logInfo('Info message');
logWarn('Warning message');
logError('Error message');
logFatal('Fatal error message');
```

### React Component

```tsx
import { BlackBox } from 'agent-logger';

function App() {
  return (
    <div>
      <BlackBox projectId="your-project-id" />
      {/* Your app content */}
    </div>
  );
}
```

### Integrations

```typescript
import { installGlobalErrorHandlers, wrapFetch } from 'agent-logger';

// Install global error handlers
installGlobalErrorHandlers();

// Wrap fetch to log HTTP requests
const wrappedFetch = wrapFetch();
```

### Tupik Mode

```typescript
import { initTupikMode, generateDataCollector, reportTupik } from 'agent-logger';

initTupikMode('your-api-key');

const collectorScript = generateDataCollector('Description of the deadlock', '/project/root');
reportTupik('Description of the deadlock', { additionalData: '...' });
```

## API

### LoggerOptions

- `projectId`: string - Your project ID
- `level`: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL' - Minimum log level
- `collectorUrl`: string - URL to send logs to
- `batchSize`: number (default: 50) - Number of logs to batch before sending
- `flushInterval`: number (default: 3000) - Interval in ms to flush logs
- `redact`: (entry: LogEntry) => LogEntry - Function to redact sensitive data

## License

MIT