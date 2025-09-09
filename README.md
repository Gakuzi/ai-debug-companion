# AI Debug Companion: Единое веб-приложение для анализа и исправления ошибок в разработке с помощью ИИ

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Stars](https://img.shields.io/github/stars/gakuzi/ai-debug-companion)](https://github.com/gakuzi/ai-debug-companion/stargazers)
[![GitHub Issues](https://img.shields.io/github/issues/gakuzi/ai-debug-companion)](https://github.com/gakuzi/ai-debug-companion/issues)

**AI Debug Companion** - это мощный инструмент для отладки приложений с использованием искусственного интеллекта. Это единое веб-приложение объединяет интеллектуальное логирование, обнаружение тупиковых ситуаций и анализ корневых причин с помощью ИИ, помогая разработчикам быстро выявлять и устранять сложные проблемы в их приложениях.

С уникальной функцией **Tupik Buster** AI Debug Companion специализируется на разблокировке тупиковых ситуаций, которые часто возникают в многошаговых процессах рассуждения ИИ, делая его незаменимым инструментом для любой команды, работающей с генеративными ИИ-системами.

## Почему AI Debug Companion?

Традиционные инструменты отладки не справляются с пониманием сложного поведения ИИ-приложений. AI Debug Companion заполняет этот пробел, предоставляя:

- **Анализ с помощью ИИ**: Интеграция с Gemini для интеллектуального анализа ошибок и выявления корневых причин
- **Обнаружение тупиков**: Специализированный модуль Tupik Buster для обнаружения и устранения зависаний ИИ-процессов
- **Комплексное логирование**: Многоуровневое логирование с автоматическим скрытием секретов для безопасности
- **Визуализация в реальном времени**: Веб-анализатор с мгновенным пониманием поведения приложения
- **Простая интеграция**: Легкая интеграция с React-приложениями и Node.js бэкендами

## Основные функции

### 🔍 Интеллектуальное логирование и защита секретов
- Многоуровневое логирование (DEBUG, INFO, WARN, ERROR, FATAL)
- Автоматическое скрытие секретов для API-ключей, токенов и паролей
- Пакетная отправка для оптимизации использования сети
- Поддержка TypeScript со строгой типизацией

### 🚀 Tupik Buster - Разрешение тупиков
- Специализированное обнаружение тупиков в ИИ-рассуждениях
- Автоматическая отчетность о тупиковых ситуациях
- Предложения по разрешению тупиков с учетом контекста
- Интеграция с популярными ИИ-фреймворками

### 🧠 Анализ корневых причин с помощью ИИ
- Интеграция с API Gemini для интеллектуального анализа ошибок
- Автоматическая генерация анализа корневых причин (RCA)
- Практические рекомендации по исправлению
- Стратегии предотвращения будущих проблем

### 🌐 Визуализация в реальном времени и совместная работа
- Веб-анализатор с русским и английским интерфейсом
- Интерактивное изучение логов с фильтрацией и поиском
- Совместная работа команды через общие ссылки анализа
- Экспортируемые отчеты для документации

## Быстрый старт

Начать работу с AI Debug Companion просто:

1. **Установите Agent Logger**:
   ```bash
   npm install ai-debug-companion-agent
   ```

2. **Инициализируйте в вашем приложении**:
   ```typescript
   import { initAgent } from 'ai-debug-companion-agent';
   
   // Инициализация агента
   initAgent('your-project-id', 'https://your-collector-endpoint.com');
   ```

3. **Добавьте компонент BlackBox** (для React-приложений):
   ```tsx
   import { BlackBox } from 'ai-debug-companion-agent';
   
   function App() {
     return (
       <div>
         {/* Содержимое вашего приложения */}
         <BlackBox height={300} />
       </div>
     );
   }
   ```

4. **Откройте Analyzer**:
   Посетите [https://gakuzi.github.io/ai-debug-companion](https://gakuzi.github.io/ai-debug-companion) для просмотра и анализа логов вашего приложения.

## Архитектура

AI Debug Companion следует модульной архитектуре, вдохновленной микросервисами, разработанной для масштабируемости и гибкости:

### 1. Agent-Logger
Легковесный агент, который инструментирует ваше приложение:
- Захватывает события выполнения, ошибки и метрики производительности
- Обеспечивает многоуровневое логирование с автоматическим скрытием секретов
- Включает Tupik Buster для обнаружения тупиков
- Доступен как npm-пакет для легкой интеграции

### 2. Collector
Централизованный сервис сбора и обработки логов:
- Нормализует и проверяет входящие данные логов
- Направляет логи в соответствующие хранилища
- Оптимизирован для развертывания на краю (Cloudflare Workers)
- Настраивается через Wrangler

### 3. Analyzer
Веб-платформа визуализации и анализа:
- Интерактивная панель для изучения логов
- Анализ корневых причин с помощью ИИ
- Визуализация тупиковых ситуаций
- Совместные функции для отладки командой

### 4. Schemas
Общие определения типов для обеспечения согласованности:
- Стандартизированные форматы записей логов
- Схемы запросов/ответов Tupik
- Контракты API между компонентами

## Установка

### Предварительные требования
- Node.js 16+
- npm или yarn
- TypeScript 4.5+ (для разработки)

### Установка Agent
```bash
npm install ai-debug-companion-agent
```

### Настройка Collector
1. Клонируйте репозиторий:
   ```bash
   git clone https://github.com/gakuzi/ai-debug-companion.git
   cd ai-debug-companion/collector
   ```

2. Настройте переменные окружения:
   ```bash
   cp wrangler.toml.example wrangler.toml
   # Отредактируйте wrangler.toml с вашей конфигурацией
   ```

3. Разверните на Cloudflare Workers:
   ```bash
   npm install
   npx wrangler deploy
   ```

## Руководство по использованию

### Интеграция с React-приложениями

1. **Базовая настройка**:
   ```typescript
   import { useEffect } from 'react';
   import { 
     initAgent,
     installGlobalErrorHandlers, 
     wrapFetch,
     logInfo
   } from 'ai-debug-companion-agent';
   
   function App() {
     useEffect(() => {
       initAgent('my-react-app', 'https://your-collector.com');
       
       installGlobalErrorHandlers();
       wrapFetch();
       
       logInfo('Приложение инициализировано', {
         ctx: { module: 'App', func: 'useEffect' }
       });
     }, []);
     
     // Логика вашего компонента
   }
   ```

2. **Использование компонента BlackBox**:
   ```tsx
   import { useState } from 'react';
   import { BlackBox } from 'ai-debug-companion-agent';
   
   function DebuggableApp() {
     const [isBlackBoxOpen, setIsBlackBoxOpen] = useState(false);
     
     return (
       <div>
         <header>
           <button onClick={() => setIsBlackBoxOpen(!isBlackBoxOpen)}>
             Переключить консоль отладки
           </button>
         </header>
         
         {/* Содержимое вашего приложения */}
         
         <BlackBox 
           isOpen={isBlackBoxOpen}
           onToggle={() => setIsBlackBoxOpen(!isBlackBoxOpen)}
           height={400}
         />
       </div>
     );
   }
   ```

### Анализ тупиковых ситуаций

1. **Включение режима Tupik**:
   ```typescript
   import { initTupikMode, reportTupik } from 'ai-debug-companion-agent';
   
   // Инициализация режима Tupik с вашим API-ключом
   initTupikMode('your-tupik-api-key');
   
   // Сообщение о тупиковой ситуации
   reportTupik('Приложение застряло в цикле рассуждений', {
     context: 'Многошаговый процесс ИИ-рассуждений',
     error: 'Таймаут через 30 секунд',
     function: 'reasoningChain'
   });
   ```

2. **Использование Analyzer**:
   - Откройте Analyzer по адресу [https://gakuzi.github.io/ai-debug-companion](https://gakuzi.github.io/ai-debug-companion)
   - Перейдите в раздел "Анализ Тупиков"
   - Загрузите ваш тупиковый бандл или выберите из последних отчетов
   - Изучите сгенерированный ИИ анализ и рекомендации

### Скрытие секретов

Агент автоматически маскирует конфиденциальную информацию в логах:

```typescript
import { logInfo } from 'ai-debug-companion-agent';

logInfo('Запрос API', {
  payload: {
    api_key: 'secret-api-key-12345',     // Будет замаскирован как ***
    token: 'bearer-token-abc123',        // Будет замаскирован как ***
    password: 'super-secret-password',   // Будет замаскирован как ***
    normalData: 'это не будет замаскировано'
  }
});
```

## Деплой

### Деплой Collector

Collector AI Debug Companion оптимизирован для развертывания на краю с использованием Cloudflare Workers:

1. **Настройка wrangler.toml**:
   ```toml
   name = "ai-debug-collector"
   main = "src/worker.ts"
   compatibility_date = "2023-10-01"
   
   [[r2_buckets]]
   binding = "STORAGE"
   bucket_name = "ai-debug-storage"
   
   [vars]
   PROJECT_TOKENS = '{"your-project-id": "your-secret-token"}'
   GEMINI_API_KEY = "your-gemini-api-key"
   ```

2. **Деплой с Wrangler**:
   ```bash
   cd collector
   npx wrangler deploy
   ```

### Деплой Analyzer

Analyzer построен с использованием Vite и React, что делает его легким для развертывания:

1. **Сборка Analyzer**:
   ```bash
   cd analyzer
   npm run build
   ```

2. **Деплой на GitHub Pages**:
   ```bash
   npm run deploy
   ```

### Автоматизация GitHub Actions

Репозиторий включает рабочие процессы GitHub Actions для автоматического развертывания:

- **Деплой Analyzer**: Автоматически собирает и развертывает Analyzer на GitHub Pages при пуше в main
- **Деплой Collector**: Развертывает Collector на Cloudflare Workers при изменении кода collector

## Тестирование

### End-to-End тестирование

Система была протестирована полностью в сентябре 2025. Чтобы протестировать систему:

1. Откройте [https://gakuzi.github.io/ai-debug-companion](https://gakuzi.github.io/ai-debug-companion)
2. Следуйте инструкциям в UI для интеграции агента, симуляции ошибок и анализа результатов

## Вклад в проект

Мы приветствуем вклад в AI Debug Companion! Вот как вы можете помочь:

1. Сделайте форк репозитория
2. Создайте ветку с функцией (`git checkout -b feature/AmazingFeature`)
3. Зафиксируйте изменения (`git commit -m 'Добавить AmazingFeature'`)
4. Запушьте ветку (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request

Пожалуйста, ознакомьтесь с нашими [Руководящими принципами участия](CONTRIBUTING.md) для получения подробной информации о нашем кодексе поведения и процессе разработки.

## Лицензия

Этот проект лицензирован по лицензии MIT - смотрите файл [LICENSE](LICENSE) для получения подробной информации.

## Поддержка

Если вы столкнулись с какими-либо проблемами или у вас есть вопросы, пожалуйста, [создайте issue](https://github.com/gakuzi/ai-debug-companion/issues) в нашем репозитории GitHub.

## Благодарности

- Спасибо команде Cloudflare Workers за их отличную платформу
- Интеграция с API Gemini обеспечена Google AI
- Вдохновлены необходимостью лучших инструментов отладки в сообществе ИИ-разработчиков

---

**AI Debug Companion** - Преобразуйте опыт отладки вашего ИИ-приложения с помощью интеллектуальных инсайтов и разрешения тупиков.