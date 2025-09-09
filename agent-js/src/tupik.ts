/* eslint-disable */
import { logInfo } from './logger'

let TUPIK_API_KEY: string | null = null

export function initTupikMode(apiKey: string): void {
  TUPIK_API_KEY = apiKey
}

export function generateDataCollector(description: string, projectRoot: string): string {
  // Пояснение на русском: Генерирует скрипт для сбора файлов/логов/deps, маскирует секреты.
  const prompt = `Generate a Node.js script that, when executed in ${projectRoot}, collects:\n- last 200 lines of logs if present;\n- package.json dependencies;\n- list of source files (tsx, ts, js) with paths;\n- redact any api_key/token/secrets to ***;\n\nContext: ${description}\nOutput JSON to stdout.`
  return prompt
}

export async function reportTupik(description: string): Promise<void> {
  logInfo('Тупик отправлен', { payload: { description, hasKey: Boolean(TUPIK_API_KEY) } })
}
