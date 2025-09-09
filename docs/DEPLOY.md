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

- Аккаунт Cloudflare с включёнными Workers и R2
- API токен с правами на деплой Workers и R2

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
npm publish
```

## Конфигурация окружения

Для локальной разработки и тестирования создайте файл `.env` на основе `.env.example`:

```env
PROJECT_ID=test
COLLECTOR_URL=[Collector URL]
GEMINI_KEY=***
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