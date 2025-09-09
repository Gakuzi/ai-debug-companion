#!/bin/bash

# Test script for AI Debug Companion Collector
# Usage: ./test-collector.sh <collector-url>

if [ -z "$1" ]; then
  echo "Usage: $0 <collector-url>"
  echo "Example: $0 https://ai-debug-collector.your-account.workers.dev"
  exit 1
fi

COLLECTOR_URL=$1

echo "Testing AI Debug Companion Collector at $COLLECTOR_URL"
echo "====================================================="

# Test /ingest/logs endpoint
echo "1. Testing /ingest/logs endpoint..."
curl -X POST $COLLECTOR_URL/ingest/logs \
  -H "Authorization: Bearer secret" \
  -H "Content-Type: application/json" \
  -d '[{"level": "ERROR", "message": "Test error message", "timestamp": "2023-01-01T00:00:00Z"}, {"level": "INFO", "message": "Test info message", "timestamp": "2023-01-01T00:00:01Z"}]' \
  && echo -e "\nSuccess: Logs ingested"

echo -e "\n-----------------------------------------------------\n"

# Test /analyze endpoint
echo "2. Testing /analyze endpoint..."
curl -X POST $COLLECTOR_URL/analyze \
  -H "Content-Type: application/json" \
  -d '{"logs": [{"level": "ERROR", "message": "Database connection failed"}, {"level": "WARN", "message": "High memory usage detected"}]}' \
  && echo -e "\nSuccess: Logs analyzed"

echo -e "\n-----------------------------------------------------\n"

# Test /tupik/analyze endpoint
echo "3. Testing /tupik/analyze endpoint..."
curl -X POST $COLLECTOR_URL/tupik/analyze \
  -H "Content-Type: application/json" \
  -d '{"errorPattern": "reasoning_loop", "description": "AI agent stuck in reasoning loop", "context": "Multi-step planning process"}' \
  && echo -e "\nSuccess: Tupik situation analyzed"

echo -e "\n====================================================="
echo "All tests completed!"