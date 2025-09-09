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
  return `Analyze the following logs and provide a detailed analysis with root cause analysis (RCA), fix suggestions, and configuration recommendations.
  
Classification: ${classification}
Logs:
${JSON.stringify(logs, null, 2)}

Please provide:
1. Root Cause Analysis (RCA)
2. Fix Suggestions
3. Configuration Recommendations`;
}

// Helper function to build tupik prompt for Gemini
function buildTupikPrompt(tupikData: any, classification: string): string {
  // Пояснение на русском: Промт анализирует тупик, находит ошибку вне фокуса, генерирует инструкции.
  return `Analyze the following deadlock/tupik situation and provide assistance to resolve it.
  
Classification: ${classification}
Tupik Data:
${JSON.stringify(tupikData, null, 2)}

Please provide:
1. Explanation of the deadlock situation
2. Root cause analysis
3. Instructions to resolve the deadlock
4. Prevention recommendations`;
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
          explanation: "Этот промт для ИИ-ассистента: вставьте в Grok!",
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