import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import logEntrySchema from './logEntry.schema.json';
import tupikRequestSchema from './tupikRequest.schema.json';

// Create AJV instance and add formats
const ajv = new Ajv();
addFormats(ajv);

// Add schemas
ajv.addSchema(logEntrySchema, 'logEntry');
ajv.addSchema(tupikRequestSchema, 'tupikRequest');

// Test data for logEntry schema
const testLogEntry = {
  ts: new Date().toISOString(),
  level: 'ERROR',
  msg: 'Test error message',
  code: 'TEST_ERROR',
  http: {
    method: 'GET',
    url: 'https://example.com/api/test',
    status: 500,
    latencyMs: 150
  },
  ctx: {
    module: 'test-module',
    file: 'test-file.ts',
    func: 'testFunction',
    line: 42
  },
  stack: 'Error: Test error\n    at testFunction (test-file.ts:42:15)',
  payload: {
    userId: 123,
    action: 'test-action'
  }
};

// Test data for tupikRequest schema
const testTupikRequest = {
  description: 'Application hangs when processing large dataset',
  projectContext: {
    files: ['src/index.ts', 'src/processor.ts', 'src/utils.ts'],
    deps: ['react@18.2.0', 'lodash@4.17.21'],
    integrations: ['API Gateway', 'Database Connection']
  },
  collectedData: {
    projectStructure: ['src/', 'dist/', 'node_modules/'],
    errors: [
      {
        type: 'TimeoutError',
        message: 'Operation timed out after 30 seconds',
        timestamp: new Date().toISOString()
      }
    ]
  }
};

// Validate test data
const logEntryValid = ajv.validate('logEntry', testLogEntry);
const tupikRequestValid = ajv.validate('tupikRequest', testTupikRequest);

if (logEntryValid && tupikRequestValid) {
  console.log('✅ Схемы валидны');
} else {
  console.log('❌ Ошибки валидации:');
  if (!logEntryValid) {
    console.log('LogEntry schema errors:', ajv.errors);
  }
  if (!tupikRequestValid) {
    console.log('TupikRequest schema errors:', ajv.errors);
  }
}