# Деплой AI Debug Companion

## Analyzer

Analyzer автоматически деплоится через GitHub Actions при каждом пуше в ветку `main`.

### Настройка GitHub Pages

1. Перейдите в настройки репозитория
2. Выберите "Pages" в левом меню
3. В разделе "Build and deployment" выберите "GitHub Actions" в качестве источника

### Процесс деплоя

При каждом пуше в ветку `main`:
1. GitHub Actions запускает workflow
2. Устанавливаются зависимости с помощью `npm ci`
3. Собирается проект с помощью `npm run build`
4. Деплоится на GitHub Pages с помощью `npm run deploy`

## Collector

Collector деплоится на Cloudflare Workers через GitHub Actions.

### Требования

- Аккаунт Cloudflare
- API токен с правами на деплой Workers и R2

### Настройка секретов

Для деплоя Collector необходимо добавить следующие секреты в GitHub Actions:

- `CLOUDFLARE_API_TOKEN` - API токен Cloudflare
- `GEMINI_API_KEY` - API ключ для Gemini (если используется анализ логов)

### Процесс деплоя

При каждом пуше в ветку `main` с изменениями в директории `collector`:
1. GitHub Actions запускает workflow
2. Устанавливаются зависимости
3. Деплоится на Cloudflare Workers с помощью wrangler-action

## Agent

Agent публикуется как npm пакет. Для публикации новой версии:

```bash
cd agent-js
npm publish
```

## Конфигурация окружения

Для локальной разработки и тестирования создайте файл `.env` на основе `.env.example`:

```env
PROJECT_ID=test
COLLECTOR_URL=https://your-collector.your-subdomain.workers.dev
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