/* eslint-disable */
import { logInfo } from './logger'

let tupikApiKey: string | null = null

export function initTupikMode(apiKey: string): void {
  tupikApiKey = apiKey
}

export function generateDataCollector(description: string, rootPath: string): string {
  // Пояснение на русском: Генерирует скрипт для сбора файлов/логов/deps, маскирует секреты.
  return `#!/bin/bash
# AI Debug Companion - Data Collector
# Generated for: ${description}
# Root path: ${rootPath}

set -e

OUTPUT_DIR="./debug-data-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$OUTPUT_DIR"

echo "Collecting debug data for: ${description}"

# Collect file structure (excluding node_modules, .git, etc.)
echo "Collecting file structure..."
find "${rootPath}" -type f -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" -o -name "*.json" -o -name "*.md" | \
  grep -v node_modules | grep -v .git | head -100 > "$OUTPUT_DIR/files.txt"

# Collect package.json and lock files
echo "Collecting dependencies..."
find "${rootPath}" -name "package.json" -o -name "package-lock.json" -o -name "yarn.lock" -o -name "pnpm-lock.yaml" | \
  head -10 | xargs -I {} cp {} "$OUTPUT_DIR/" 2>/dev/null || true

# Collect log files (last 100 lines)
echo "Collecting recent logs..."
find "${rootPath}" -name "*.log" -o -name "*.out" -o -name "*.err" | \
  head -5 | xargs -I {} tail -100 {} > "$OUTPUT_DIR/recent-logs.txt" 2>/dev/null || true

# Collect environment info
echo "Collecting environment info..."
{
  echo "=== System Info ==="
  uname -a
  echo "=== Node Version ==="
  node --version 2>/dev/null || echo "Node not found"
  echo "=== NPM Version ==="
  npm --version 2>/dev/null || echo "NPM not found"
  echo "=== Git Status ==="
  git status --porcelain 2>/dev/null || echo "Not a git repo"
  echo "=== Git Log (last 5) ==="
  git log --oneline -5 2>/dev/null || echo "No git history"
} > "$OUTPUT_DIR/environment.txt"

# Mask sensitive data in collected files
echo "Masking sensitive data..."
find "$OUTPUT_DIR" -type f -name "*.json" -exec sed -i.bak 's/"api_key":"[^"]*"/"api_key":"***"/g' {} \\;
find "$OUTPUT_DIR" -type f -name "*.json" -exec sed -i.bak 's/"token":"[^"]*"/"token":"***"/g' {} \\;
find "$OUTPUT_DIR" -type f -name "*.json" -exec sed -i.bak 's/"password":"[^"]*"/"password":"***"/g' {} \\;
find "$OUTPUT_DIR" -type f -name "*.txt" -exec sed -i.bak 's/api_key=[^\\s]*/api_key=***/g' {} \\;
find "$OUTPUT_DIR" -type f -name "*.txt" -exec sed -i.bak 's/token=[^\\s]*/token=***/g' {} \\;

# Clean up backup files
find "$OUTPUT_DIR" -name "*.bak" -delete

# Create summary
echo "Creating summary..."
{
  echo "=== Collection Summary ==="
  echo "Description: ${description}"
  echo "Root Path: ${rootPath}"
  echo "Collection Time: $(date)"
  echo "Files Found: $(wc -l < "$OUTPUT_DIR/files.txt" 2>/dev/null || echo 0)"
  echo "Log Files: $(find "$OUTPUT_DIR" -name "*.log" | wc -l)"
  echo "Package Files: $(find "$OUTPUT_DIR" -name "package*.json" | wc -l)"
} > "$OUTPUT_DIR/SUMMARY.txt"

echo "Data collection complete. Output directory: $OUTPUT_DIR"
echo "Files collected:"
ls -la "$OUTPUT_DIR"

echo ""
echo "To send to analyzer, run:"
echo "curl -X POST https://analyzer.example.com/api/upload \\\\"
echo "  -H 'Authorization: Bearer YOUR_API_KEY' \\\\"
echo "  -F 'description=${description}' \\\\"
echo "  -F 'data=@$OUTPUT_DIR.tar.gz'"
`
}

export function reportTupik(description: string): void {
  if (!tupikApiKey) {
    console.warn('Tupik mode not initialized. Call initTupikMode() first.')
    return
  }

  const data = {
    description,
    projectContext: {
      files: [], // Will be populated by the data collector
      deps: [], // Will be populated by the data collector
    },
    collectedData: {
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Node.js',
      logs: [], // Will be populated with recent logs
    }
  }

  // In a real implementation, this would send to the analyzer API
  console.log('Tupik report data:', data)
  
  // Generate the data collector script
  const script = generateDataCollector(description, process.cwd())
  console.log('Generated data collector script:')
  console.log(script)
  
  logInfo('Тупик отправлен', {
    payload: {
      description,
      hasApiKey: !!tupikApiKey,
      scriptGenerated: true,
    }
  })
}