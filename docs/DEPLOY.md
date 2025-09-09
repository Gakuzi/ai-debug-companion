# Деплой AI Debug Companion

## Analyzer

Analyzer автоматически деплоится через GitHub Actions при каждом пуше в ветку `main`.

### Настройка GitHub Pages

1. Перейдите в настройки репозитория
2. Выберите "Pages" в левом меню
3. В разделе "Build and deployment" выберите "GitHub Actions" в качестве источника

### Процесс деплоя

GitHub Actions workflow для Analyzer находится в файле `.github/workflows/deploy-analyzer.yml` и выполняет следующие шаги:

1. Установка Node.js окружения
2. Установка зависимостей с помощью `npm ci`
3. Сборка проекта с помощью `npm run build`
4. Деплой на GitHub Pages с помощью `npm run deploy`

### Секреты для деплоя

Для деплоя Analyzer требуется:
- `GITHUB_TOKEN` - автоматически предоставляется GitHub Actions

## Collector

Collector деплоится на Cloudflare Workers через GitHub Actions.

### Требования

- Аккаунт Cloudflare с включенными Workers и R2
- API токен с правами на деплой Workers и R2

### Конфигурация wrangler.toml

Пример конфигурации:

```toml
name = "ai-debug-collector"
main = "src/worker.ts"
compatibility_date = "2023-10-01"

[[r2_buckets]]
binding = "STORAGE"
bucket_name = "ai-debug-storage"

[vars]
PROJECT_TOKENS = '{"test": "secret"}'
GEMINI_API_KEY = "your-gemini-api-key"
```

### Процесс деплоя

GitHub Actions workflow для Collector находится в файле `.github/workflows/deploy-collector.yml` и использует `cloudflare/wrangler-action@v3` для деплоя.

### Секреты для деплоя

Для деплоя Collector необходимо добавить следующие секреты в GitHub Actions:

- `CLOUDFLARE_API_TOKEN` - API токен Cloudflare
- `GEMINI_API_KEY` - API ключ для Gemini (если используется анализ логов)

## Agent

Agent публикуется как npm пакет. Для публикации новой версии:

```bash
cd agent
npm publish --access public
```

## Конфигурация окружения

Для локальной разработки и тестирования создайте файл `.env` на основе `.env.example`:

```env
PROJECT_ID=test
COLLECTOR_URL=https://your-collector.YOUR-ACCOUNT.workers.dev
GEMINI_KEY=your-gemini-api-key
```

## Мониторинг

После деплоя вы можете отслеживать состояние сервисов:

- Analyzer: доступен по адресу https://gakuzi.github.io/ai-debug-companion
- Collector: доступен по адресу, указанному в настройках Cloudflare Worker
- Логи: можно просматривать в веб-интерфейсе Analyzer

## Отладка

Если деплой завершается с ошибкой:

1. Проверьте логи GitHub Actions
2. Убедитесь, что все необходимые секреты добавлены
3. Проверьте конфигурацию wrangler.toml для Collector
4. Убедитесь, что все зависимости установлены корректно

## Локальная разработка

### Запуск Analyzer локально

```bash
cd analyzer
npm run dev
```

Analyzer будет доступен по адресу http://localhost:5173

### Запуск Collector локально

```bash
cd collector
npm run dev
```

Collector будет доступен по адресу http://localhost:8787

### Тестирование end-to-end

1. Запустите оба сервиса локально:
   ```bash
   npm run dev
   ```

2. Откройте Analyzer в браузере: http://localhost:5173

3. Встройте Agent в тестовое приложение:
   ```javascript
   import { initAgent } from 'ai-debug-companion-agent';
   
   initAgent('test-project', 'http://localhost:8787');
   ```

4. Симулируйте ошибки в приложении:
   ```javascript
   import { logError } from 'ai-debug-companion-agent';
   
   logError('Тестовая ошибка', { 
     component: 'TestComponent',
     action: 'testAction'
   });
   ```

5. Используйте функцию экспорта бандла:
   ```javascript
   import { exportBundle } from 'ai-debug-companion-agent';
   
   const bundle = exportBundle();
   console.log(JSON.stringify(bundle, null, 2));
   ```

6. Загрузите бандл в Analyzer для анализа

7. Используйте функцию анализа тупиков в Analyzer

## Публикация новой версии

### Обновление версии

1. Обновите версию в корневом package.json:
   ```json
   {
     "version": "1.1.0"
   }
   ```

2. Обновите версии в подпакетах:
   - `agent/package.json`
   - `collector/package.json`
   - `analyzer/package.json`
   - `schemas/package.json`

### Публикация Agent

```bash
cd agent
npm publish --access public
```

### Деплой всех компонентов

После пуша в ветку `main`, GitHub Actions автоматически задеплоит все компоненты.