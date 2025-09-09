# AI Debug Companion: Advanced AI Debugging Tool for LLM Applications

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Stars](https://img.shields.io/github/stars/gakuzi/ai-debug-companion)](https://github.com/gakuzi/ai-debug-companion/stargazers)
[![GitHub Issues](https://img.shields.io/github/issues/gakuzi/ai-debug-companion)](https://github.com/gakuzi/ai-debug-companion/issues)

**AI Debug Companion** is a powerful AI debugging tool designed specifically for LLM (Large Language Model) applications. This comprehensive solution combines intelligent logging, deadlock detection, and AI-powered root cause analysis to help developers quickly identify and resolve complex issues in their AI applications.

With its unique **Tupik Buster** feature, AI Debug Companion specializes in unlocking deadlock situations that commonly occur in multi-step AI reasoning processes, making it an essential tool for any team working with generative AI systems.

## Why AI Debug Companion?

Traditional debugging tools fall short when it comes to understanding the complex behavior of AI applications. AI Debug Companion bridges this gap by providing:

- **AI-Powered Insights**: Leverages Gemini integration for intelligent error analysis and root cause identification
- **Deadlock Detection**: Specialized Tupik Buster module identifies and resolves stuck AI reasoning processes
- **Comprehensive Logging**: Multi-level logging with automatic secret redaction for security
- **Real-time Visualization**: Web-based analyzer for instant insight into application behavior
- **Seamless Integration**: Easy integration with React applications and Node.js backends

## Key Features

### 🔍 Intelligent Logging & Secret Protection
- Multi-level logging (DEBUG, INFO, WARN, ERROR, FATAL)
- Automatic secret redaction for API keys, tokens, and passwords
- Batch sending to optimize network usage
- TypeScript support with strict typing

### 🚀 Tupik Buster - Deadlock Resolution
- Specialized detection of AI reasoning deadlocks
- Automated deadlock reporting and analysis
- Context-aware deadlock resolution suggestions
- Integration with popular AI frameworks

### 🧠 AI-Powered Root Cause Analysis
- Gemini API integration for intelligent error analysis
- Automated Root Cause Analysis (RCA) generation
- Actionable fix recommendations
- Prevention strategies for future issues

### 🌐 Real-time Visualization & Collaboration
- Web-based analyzer with Russian and English UI
- Interactive log exploration with filtering and search
- Team collaboration through shared analysis links
- Exportable reports for documentation

## Quick Start

Getting started with AI Debug Companion is simple:

1. **Install the Agent Logger**:
   ```bash
   npm install ai-debug-companion-agent
   ```

2. **Initialize in your application**:
   ```typescript
   import { initLogger, installGlobalErrorHandlers, wrapFetch } from 'ai-debug-companion-agent';
   
   // Initialize the logger
   initLogger({
     projectId: 'your-project-id',
     level: 'DEBUG',
     collectorUrl: 'https://your-collector-endpoint.com',
     batchSize: 50,
     flushInterval: 3000,
     redact: 'maskSecrets'
   });
   
   // Install global error handlers
   installGlobalErrorHandlers();
   
   // Wrap fetch for HTTP logging
   wrapFetch();
   ```

3. **Add the BlackBox Component** (for React applications):
   ```tsx
   import { BlackBox } from 'ai-debug-companion-agent';
   
   function App() {
     return (
       <div>
         {/* Your app content */}
         <BlackBox height={300} />
       </div>
     );
   }
   ```

4. **Access the Analyzer**:
   Visit [https://gakuzi.github.io/ai-debug-companion](https://gakuzi.github.io/ai-debug-companion) to view and analyze your application logs.

## Architecture

AI Debug Companion follows a modular, microservices-inspired architecture designed for scalability and flexibility:

### 1. Agent-Logger
The lightweight agent that instruments your application:
- Captures runtime events, errors, and performance metrics
- Provides multi-level logging with automatic secret redaction
- Includes Tupik Buster for deadlock detection
- Available as npm package for easy integration

### 2. Collector
Centralized log collection and processing service:
- Normalizes and validates incoming log data
- Routes logs to appropriate storage backends
- Optimized for edge deployment (Cloudflare Workers)
- Configurable through Wrangler

### 3. Analyzer
Web-based visualization and analysis platform:
- Interactive dashboard for log exploration
- AI-powered root cause analysis
- Deadlock situation visualization
- Collaborative features for team debugging

### 4. Schemas
Shared type definitions ensuring consistency:
- Standardized log entry formats
- Tupik request/response schemas
- API contracts between components

## Installation

### Prerequisites
- Node.js 16+
- npm or yarn
- TypeScript 4.5+ (for development)

### Agent Installation
```bash
npm install ai-debug-companion-agent
```

### Collector Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/gakuzi/ai-debug-companion.git
   cd ai-debug-companion/collector
   ```

2. Configure environment variables:
   ```bash
   cp wrangler.toml.example wrangler.toml
   # Edit wrangler.toml with your configuration
   ```

3. Deploy to Cloudflare Workers:
   ```bash
   npm install
   npx wrangler deploy
   ```

## Usage Guide

### Integrating with React Applications

1. **Basic Setup**:
   ```typescript
   import { useEffect } from 'react';
   import { 
     initLogger, 
     installGlobalErrorHandlers, 
     wrapFetch,
     logInfo
   } from 'ai-debug-companion-agent';
   
   function App() {
     useEffect(() => {
       initLogger({
         projectId: 'my-react-app',
         level: 'DEBUG',
         collectorUrl: 'https://your-collector.com',
         redact: 'maskSecrets'
       });
       
       installGlobalErrorHandlers();
       wrapFetch();
       
       logInfo('Application initialized', {
         ctx: { module: 'App', func: 'useEffect' }
       });
     }, []);
     
     // Your component logic
   }
   ```

2. **Using the BlackBox Component**:
   ```tsx
   import { useState } from 'react';
   import { BlackBox } from 'ai-debug-companion-agent';
   
   function DebuggableApp() {
     const [isBlackBoxOpen, setIsBlackBoxOpen] = useState(false);
     
     return (
       <div>
         <header>
           <button onClick={() => setIsBlackBoxOpen(!isBlackBoxOpen)}>
             Toggle Debug Console
           </button>
         </header>
         
         {/* Your app content */}
         
         <BlackBox 
           isOpen={isBlackBoxOpen}
           onToggle={() => setIsBlackBoxOpen(!isBlackBoxOpen)}
           height={400}
         />
       </div>
     );
   }
   ```

### Analyzing Deadlock Situations

1. **Enable Tupik Mode**:
   ```typescript
   import { initTupikMode, reportTupik } from 'ai-debug-companion-agent';
   
   // Initialize Tupik mode with your API key
   initTupikMode('your-tupik-api-key');
   
   // Report a deadlock situation
   reportTupik('Application stuck in reasoning loop', {
     context: 'Multi-step AI reasoning process',
     error: 'Timeout after 30 seconds',
     function: 'reasoningChain'
   });
   ```

2. **Using the Analyzer**:
   - Open the Analyzer at [https://gakuzi.github.io/ai-debug-companion](https://gakuzi.github.io/ai-debug-companion)
   - Navigate to the "Tupik Analysis" section
   - Upload your deadlock bundle or select from recent reports
   - Review the AI-generated analysis and recommendations

### Secret Redaction

The agent automatically masks sensitive information in logs:

```typescript
import { logInfo } from 'ai-debug-companion-agent';

logInfo('API request', {
  payload: {
    api_key: 'secret-api-key-12345',     // Will be masked as ***
    token: 'bearer-token-abc123',        // Will be masked as ***
    password: 'super-secret-password',   // Will be masked as ***
    normalData: 'this will not be masked'
  }
});
```

## Deployment

### Collector Deployment

AI Debug Companion's collector is optimized for edge deployment using Cloudflare Workers:

1. **Configure wrangler.toml**:
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

2. **Deploy with Wrangler**:
   ```bash
   cd collector
   npx wrangler deploy
   ```

### Analyzer Deployment

The Analyzer is built with Vite and React, making it easy to deploy:

1. **Build the Analyzer**:
   ```bash
   cd analyzer
   npm run build
   ```

2. **Deploy to GitHub Pages**:
   ```bash
   npm run deploy
   ```

### GitHub Actions Automation

The repository includes GitHub Actions workflows for automated deployment:

- **Analyzer Deployment**: Automatically builds and deploys the Analyzer to GitHub Pages on pushes to main
- **Collector Deployment**: Deploys the Collector to Cloudflare Workers when collector code changes

## Testing

### End-to-End Testing

The system has been tested end-to-end in September 2025. To test the system:

1. Open [https://gakuzi.github.io/ai-debug-companion](https://gakuzi.github.io/ai-debug-companion)
2. Follow the instructions in the UI to integrate the agent, simulate errors, and analyze results

## Contributing

We welcome contributions to AI Debug Companion! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on our code of conduct and development process.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions, please [file an issue](https://github.com/gakuzi/ai-debug-companion/issues) on our GitHub repository.

## Acknowledgments

- Thanks to the Cloudflare Workers team for their excellent platform
- Gemini API integration powered by Google AI
- Inspired by the need for better debugging tools in the AI development community

---

**AI Debug Companion** - Transform your AI application debugging experience with intelligent insights and deadlock resolution.