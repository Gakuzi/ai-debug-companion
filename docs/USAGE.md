# Как использовать AI Debug Companion

## Установка Agent

Для начала работы с AI Debug Companion необходимо установить агент в ваш проект:

```bash
npm i ai-debug-companion-agent
```

## Встраивание в React

После установки агента, вы можете встроить его в ваше React-приложение:

```javascript
import { initAgent, BlackBox } from 'ai-debug-companion-agent';

// Инициализация агента
initAgent('your-project-id', 'https://your-collector-url.com');

// Встраивание компонента BlackBox для визуализации логов
function App() {
  return (
    <div>
      {/* Ваше приложение */}
      <BlackBox height={300} />
    </div>
  );
}
```

## Интеграция с Node.js

Для Node.js приложений:

```javascript
import { initAgent, logInfo, logError } from 'ai-debug-companion-agent';

// Инициализация агента
initAgent('your-project-id', 'https://your-collector-url.com');

// Использование логгера
logInfo('Сервер запущен', { port: 3000 });
logError('Ошибка базы данных', { error: 'Connection timeout' });
```

## Автоматический сбор данных

Агент может автоматически собирать данные о вашем проекте:

```javascript
import { autoCollect } from 'ai-debug-companion-agent';

// Запустить автоматический сбор каждые 30 секунд
autoCollect();
```

## Экспорт бандла данных

Вы можете экспортировать бандл с логами, файлами и зависимостями:

```javascript
import { exportBundle } from 'ai-debug-companion-agent';

// Экспорт бандла для анализа
const bundle = exportBundle();
console.log(bundle);
```

## Анализ тупика в Analyzer

Для анализа тупиковых ситуаций используйте веб-интерфейс Analyzer:

1. Откройте Analyzer по ссылке: https://gakuzi.github.io/ai-debug-companion
2. Перейдите в раздел "Анализ Тупиков"
3. Опишите ситуацию, в которой ваше приложение зашло в тупик
4. Получите промт с пояснением, который можно использовать в ИИ-ассистенте

### Пример промта с пояснением

После описания тупика вы получите промт следующего вида:

```
// Пояснение на русском: Промт для Grok/ChatGPT исправляет сложные ошибки вне фокуса разработчика
You are an expert software debugging assistant specializing in resolving deadlock and complex problem situations. 
Analyze the following deadlock/tupik situation and provide comprehensive assistance to resolve it.

Classification: deadlock
Tupik Data:
{
  "description": "Application hangs when processing large dataset",
  "projectContext": {
    "files": ["src/index.ts", "src/processor.ts", "src/utils.ts"],
    "deps": ["react@18.2.0", "lodash@4.17.21"],
    "integrations": ["API Gateway", "Database Connection"]
  }
}

Please provide your response in the following structured format:

1. Explanation of the deadlock situation
   - Clearly describe what type of deadlock or problematic situation this is
   - Explain why it's difficult to resolve with conventional approaches
   - Identify the core components involved

2. Root cause analysis
   - Dig deep to identify the fundamental cause of the issue
   - Look beyond the obvious symptoms to find hidden factors
   - Consider systemic or architectural causes

3. Instructions to resolve the deadlock
   - Provide step-by-step instructions to resolve the issue
   - Include specific commands, code changes, or configuration updates
   - Address both immediate fixes and long-term solutions

4. Prevention recommendations
   - Suggest measures to prevent similar situations in the future
   - Recommend process or architectural improvements
   - Propose monitoring or alerting to catch early signs
```

Этот промт можно использовать в ИИ-ассистенте (например, Grok, ChatGPT) для получения рекомендаций по разрешению ситуации.

## Работа с логами

Агент автоматически собирает логи вашего приложения и отправляет их в Collector. Вы можете просматривать логи в реальном времени через компонент BlackBox или в веб-интерфейсе Analyzer.

### Уровни логирования

- `DEBUG` - Подробная отладочная информация
- `INFO` - Общая информация о работе приложения
- `WARN` - Предупреждения, не требующие немедленного вмешательства
- `ERROR` - Ошибки, которые не останавливают работу приложения
- `FATAL` - Критические ошибки, останавливающие работу приложения

### Примеры использования логгера

```javascript
import { logDebug, logInfo, logWarn, logError, logFatal } from 'ai-debug-companion-agent';

logDebug('Детали отладки', { variable: 'value' });
logInfo('Приложение запущено', { version: '1.0.0' });
logWarn('Устаревший API', { endpoint: '/old-api' });
logError('Ошибка обработки запроса', { 
  error: 'Invalid input',
  userId: 123
});
logFatal('Критическая ошибка базы данных', { 
  error: 'Connection failed',
  host: 'db.example.com'
});
```

## Настройка параметров

Вы можете настроить следующие параметры при инициализации агента:

```javascript
initAgent('project-id', 'https://collector-url.com', 'maskSecrets');
```

- `projectId` - идентификатор вашего проекта
- `collectorUrl` - URL вашего Collector сервиса
- `redact` - режим скрытия секретов ('maskSecrets' или 'none')

## Использование Tupik Buster

Tupik Buster - это функция для автоматического обнаружения и разрешения тупиковых ситуаций:

```javascript
import { initTupikMode, reportTupik } from 'ai-debug-companion-agent';

// Инициализация режима Tupik
initTupikMode('your-api-key');

// Сообщение о тупиковой ситуации
reportTupik('Описание тупика', {
  // Дополнительные данные о ситуации
  context: 'Multi-step AI reasoning process',
  error: 'Application stuck'
});
```

## Маскировка секретов

Агент автоматически маскирует конфиденциальную информацию:

```javascript
import { maskSecrets } from 'ai-debug-companion-agent';

const data = {
  apiKey: 'secret-key-123',
  password: 'super-secret-password',
  normalData: 'public information'
};

const maskedData = maskSecrets(data);
// Результат: { apiKey: '***', password: '***', normalData: 'public information' }
```

## Использование BlackBox компонента

Компонент BlackBox предоставляет визуальный интерфейс для просмотра логов:

```jsx
import { BlackBox } from 'ai-debug-companion-agent';

function App() {
  return (
    <div>
      {/* Ваше приложение */}
      <BlackBox 
        height={300} 
        isOpen={false}
        onToggle={(isOpen) => console.log('BlackBox state:', isOpen)}
      />
    </div>
  );
}
```

Функции BlackBox:
- Просмотр логов в реальном времени
- Фильтрация по уровням логирования
- Копирование логов в буфер обмена
- Скачивание бандла данных
- Сообщение о тупиковых ситуациях