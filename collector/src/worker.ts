// worker.ts
export interface Env {
  STORAGE: R2Bucket;
  PROJECT_TOKENS: string; // '{ "test": "secret" }'
  GEMINI_API_KEY: string;
}

// Helper function to classify logs
function classify(logs: any[]): string {
  // Simple classification based on error levels
  const errorCount = logs.filter(log => log.level === 'ERROR' || log.level === 'FATAL').length;
  const warnCount = logs.filter(log => log.level === 'WARN').length;
  
  if (errorCount > 0) return 'critical';
  if (warnCount > 0) return 'warning';
  return 'info';
}

// Helper function to classify tupik situations
function classifyTupik(data: any): string {
  // Simple classification based on tupik data
  if (data.errorPattern) return 'error_pattern';
  if (data.deadlock) return 'deadlock';
  return 'general';
}

// Helper function to build prompt for Gemini
function buildPrompt(logs: any[], classification: string): string {
  // Пояснение на русском: Промт для Gemini: анализ логов, план фикса (RCA/FIX/CONFIG).
  return `You are an expert software debugging assistant. Analyze the following application logs and provide a detailed analysis with actionable recommendations.

Classification: ${classification}
Logs:
${JSON.stringify(logs, null, 2)}

Please provide your response in the following structured format:

1. Root Cause Analysis (RCA)
   - Identify the primary issue based on the logs
   - Explain the sequence of events that led to the problem
   - Highlight any patterns or recurring issues

2. Fix Suggestions
   - Provide specific code fixes or changes needed
   - Include examples or code snippets where applicable
   - Prioritize fixes by impact and urgency

3. Configuration Recommendations
   - Suggest configuration changes to prevent similar issues
   - Recommend monitoring or alerting improvements
   - Propose architectural improvements if relevant

4. Prevention Strategies
   - Best practices to avoid similar issues in the future
   - Testing recommendations
   - Code quality improvements

Please be concise but thorough in your analysis.`;
}

// Helper function to build tupik prompt for Gemini
function buildTupikPrompt(tupikData: any, classification: string): string {
  // Пояснение на русском: Промт анализирует тупик, находит ошибку вне фокуса, генерирует инструкции.
  return `You are an expert software debugging assistant specializing in resolving deadlock and complex problem situations. 
Analyze the following deadlock/tupik situation and provide comprehensive assistance to resolve it.

Classification: ${classification}
Tupik Data:
${JSON.stringify(tupikData, null, 2)}

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

Please be thorough and provide actionable guidance that a developer can follow to resolve this complex situation.`;
}

// Helper function to fetch from Gemini API
async function fetchGemini(prompt: string, apiKey: string): Promise<any> {
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API request failed with status ${response.status}`);
  }

  return await response.json();
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method;

    // Handle POST /ingest/logs
    if (method === 'POST' && url.pathname === '/ingest/logs') {
      // Authentication check
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response('Unauthorized', { status: 401 });
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      let projectTokens = {};
      try {
        projectTokens = JSON.parse(env.PROJECT_TOKENS);
      } catch (e) {
        return new Response('Invalid PROJECT_TOKENS configuration', { status: 500 });
      }
      
      // Find project ID that matches the token
      const projectId = Object.keys(projectTokens).find(key => projectTokens[key] === token);
      if (!projectId) {
        return new Response('Invalid token', { status: 401 });
      }

      try {
        const logs = await request.json();
        
        // Save logs to R2 storage
        const key = `logs/${projectId}/${Date.now()}.json`;
        await env.STORAGE.put(key, JSON.stringify(logs));
        
        console.log('Логи сохранены');
        
        return new Response(JSON.stringify({ success: true, key }), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        return new Response('Error processing logs: ' + (error as Error).message, { status: 500 });
      }
    }

    // Handle POST /analyze
    if (method === 'POST' && url.pathname === '/analyze') {
      try {
        const requestData: any = await request.json();
        const logs = requestData.logs || [];
        
        // Classify logs
        const classification = classify(logs);
        
        // Build prompt
        const prompt = buildPrompt(logs, classification);
        
        // Fetch analysis from Gemini
        const geminiResponse = await fetchGemini(prompt, env.GEMINI_API_KEY);
        
        return new Response(JSON.stringify({
          classification,
          analysis: geminiResponse
        }), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        return new Response('Error analyzing logs: ' + (error as Error).message, { status: 500 });
      }
    }

    // Handle POST /tupik/analyze
    if (method === 'POST' && url.pathname === '/tupik/analyze') {
      try {
        const tupikData: any = await request.json();
        
        // Classify tupik situation
        const classification = classifyTupik(tupikData);
        
        // Build tupik prompt
        const prompt = buildTupikPrompt(tupikData, classification);
        
        // Note: We're not actually calling Gemini here as per requirements
        // Instead we're returning the prompt for the AI assistant
        
        return new Response(JSON.stringify({
          explanation: "Пояснение на русском: Этот промт для Grok/ChatGPT исправляет сложные ошибки вне фокуса разработчика",
          instructionPrompt: prompt
        }), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        return new Response('Error analyzing tupik: ' + (error as Error).message, { status: 500 });
      }
    }

    return new Response('Not Found', { status: 404 });
  }
};