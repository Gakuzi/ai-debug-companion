# Как использовать AI Debug Companion

## Установка Agent

Для начала работы с AI Debug Companion необходимо установить агент в ваш проект:

```bash
npm i ai-debug-companion-agent
```

## Встраивание в React

После установки агента, вы можете встроить его в ваше React-приложение:

```javascript
import { initLogger, BlackBox } from 'ai-debug-companion-agent';

// Инициализация логгера
initLogger({
  projectId: 'your-project-id',
  collectorUrl: 'https://your-collector-url.com'
});

// Встраивание компонента BlackBox для визуализации логов
function App() {
  return (
    <div>
      <BlackBox projectId="your-project-id" />
      {/* Ваше приложение */}
    </div>
  );
}
```

## Анализ тупика в Analyzer

Для анализа тупиковых ситуаций используйте веб-интерфейс Analyzer:

1. Откройте Analyzer по ссылке: https://gakuzi.github.io/ai-debug-companion
2. Перейдите в раздел "Анализ Тупиков"
3. Опишите ситуацию, в которой ваше приложение зашло в тупик

### Пример

Опишите: "Застрял в функции X при обработке данных пользователя"

Получите промт с пояснением, который можно использовать в ИИ-ассистенте для получения рекомендаций по разрешению ситуации.

## Работа с логами

Агент автоматически собирает логи вашего приложения и отправляет их в Collector. Вы можете просматривать логи в реальном времени через компонент BlackBox или в веб-интерфейсе Analyzer.

## Настройка параметров

Вы можете настроить следующие параметры при инициализации логгера:

- `projectId` - идентификатор вашего проекта
- `collectorUrl` - URL вашего Collector сервиса
- `level` - уровень логирования (DEBUG, INFO, WARN, ERROR, FATAL)
- `batchSize` - количество логов в одном batch (по умолчанию 50)
- `flushInterval` - интервал отправки логов в миллисекундах (по умолчанию 3000)

## Использование Tupik Buster

Tupik Buster - это функция для автоматического обнаружения и разрешения тупиковых ситуаций:

```javascript
import { initTupikMode, reportTupik } from 'ai-debug-companion-agent';

// Инициализация режима Tupik
initTupikMode('your-api-key');

// Сообщение о тупиковой ситуации
reportTupik('Описание тупика', {
  // Дополнительные данные о ситуации
  function: 'main',
  error: 'Application stuck'
});
```