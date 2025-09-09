// e2e-test.cjs
// Simple end-to-end test to verify the AI Debug Companion flow

const fs = require('fs');

async function testEndToEnd() {
  console.log('Starting AI Debug Companion end-to-end test...');
  
  // Step 1: Simulate sending a log entry to the collector
  console.log('Step 1: Testing log ingestion...');
  
  try {
    const logEntry = {
      projectId: 'test-app',
      entries: [{
        ts: new Date().toISOString(),
        level: 'ERROR',
        msg: 'Тестовая ошибка для проверки',
        ctx: { module: 'E2E Test', func: 'testEndToEnd' },
        payload: { error: 'TypeError: Failed to fetch', url: 'invalid-url://test' }
      }]
    };
    
    const response = await fetch('http://localhost:8787/ingest/logs', {
      method: 'POST',
      headers: { 
        'content-type': 'application/json',
        'Authorization': 'Bearer secret'  // Using the token from PROJECT_TOKENS
      },
      body: JSON.stringify(logEntry)
    });
    
    if (response.ok) {
      console.log('✅ Log ingestion test passed');
    } else {
      console.log('❌ Log ingestion test failed:', response.status, await response.text());
    }
  } catch (error) {
    console.log('❌ Log ingestion test failed with error:', error.message);
  }
  
  // Step 2: Test the tupik analysis endpoint
  console.log('Step 2: Testing tupik analysis...');
  
  try {
    const tupikData = {
      description: 'Застрял в fetch, TypeError',
      error: 'TypeError: Failed to fetch',
      url: 'invalid-url://test'
    };
    
    const response = await fetch('http://localhost:8787/tupik/analyze', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(tupikData)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Tupik analysis test passed');
      console.log('Explanation:', result.explanation);
      console.log('Instruction prompt generated successfully');
    } else {
      console.log('❌ Tupik analysis test failed:', response.status, await response.text());
    }
  } catch (error) {
    console.log('❌ Tupik analysis test failed with error:', error.message);
  }
  
  // Step 3: Generate a sample tupik bundle
  console.log('Step 3: Generating sample tupik bundle...');
  
  const tupikBundle = {
    description: 'Застрял в fetch, TypeError',
    error: 'TypeError: Failed to fetch',
    url: 'invalid-url://test',
    instructionPrompt: `Analyze the following deadlock/tupik situation and provide assistance to resolve it.

Classification: general
Tupik Data:
{
  "description": "Застрял в fetch, TypeError",
  "error": "TypeError: Failed to fetch",
  "url": "invalid-url://test"
}

Please provide:
1. Explanation of the deadlock situation
2. Root cause analysis
3. Instructions to resolve the deadlock
4. Prevention recommendations`,
    timestamp: new Date().toISOString()
  };
  
  // Save the bundle to a file
  fs.writeFileSync('./tupik-bundle.json', JSON.stringify(tupikBundle, null, 2));
  console.log('✅ Tupik bundle generated and saved to tupik-bundle.json');
  
  console.log('\n🎉 End-to-end test completed!');
  console.log('\nNext steps:');
  console.log('1. Open http://localhost:5173 in your browser');
  console.log('2. Click "Тест HTTP запроса (с TypeError)" button');
  console.log('3. Open the BlackBox and report "Застрял в fetch, TypeError"');
  console.log('4. Download the bundle');
  console.log('5. Open the Analyzer and upload the bundle');
  console.log('6. Click "Анализировать Тупик"');
}

testEndToEnd().catch(console.error);