/* eslint-disable */
import React, { useState, useEffect, useRef } from 'react'
import { getMemoryLog, LogEntry, Level } from './logger'
import { reportTupik } from './tupik'

interface BlackBoxProps {
  isOpen: boolean
  onToggle: () => void
  height?: number
}

const levelColors: Record<Level, string> = {
  DEBUG: 'text-gray-400',
  INFO: 'text-white',
  WARN: 'text-yellow-500',
  ERROR: 'text-red-500',
  FATAL: 'text-red-600',
}

const levelLabels: Record<Level, string> = {
  DEBUG: 'DEBUG',
  INFO: 'ИНФО',
  WARN: 'ПРЕДУПРЕЖДЕНИЕ',
  ERROR: 'ОШИБКА',
  FATAL: 'КРИТИЧЕСКАЯ',
}

const filterOptions = [
  { value: 'ALL', label: 'ВСЁ' },
  { value: 'ERROR', label: 'ОШИБКА' },
  { value: 'WARN', label: 'ПРЕДУПРЕЖДЕНИЕ' },
  { value: 'INFO', label: 'ИНФО' },
  { value: 'DEBUG', label: 'DEBUG' },
] as const

type FilterType = typeof filterOptions[number]['value']

export function BlackBox({ isOpen, onToggle, height = 200 }: BlackBoxProps) {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [filter, setFilter] = useState<FilterType>('ALL')
  const [tupikMode, setTupikMode] = useState(false)
  const [tupikDescription, setTupikDescription] = useState('')
  const logContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const updateLogs = () => {
      const allLogs = getMemoryLog()
      setLogs(allLogs)
    }

    updateLogs()
    const interval = setInterval(updateLogs, 1000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [logs])

  const filteredLogs = logs.filter(log => {
    if (filter === 'ALL') return true
    return log.level === filter
  }).slice(-50)

  const copyLogs = () => {
    const text = filteredLogs.map(log => 
      `[${log.ts}] ${log.level}: ${log.msg}${log.stack ? '\n' + log.stack : ''}`
    ).join('\n')
    navigator.clipboard.writeText(text)
  }

  const saveToFile = () => {
    const text = filteredLogs.map(log => 
      `[${log.ts}] ${log.level}: ${log.msg}${log.stack ? '\n' + log.stack : ''}`
    ).join('\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `logs-${new Date().toISOString().slice(0, 19)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadBundle = () => {
    const bundle = {
      logs: filteredLogs,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    }
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `debug-bundle-${new Date().toISOString().slice(0, 19)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleTupikSubmit = () => {
    if (!tupikDescription.trim()) return
    
    reportTupik(tupikDescription)
    setTupikDescription('')
    setTupikMode(false)
    alert('Данные отправлены в анализатор!')
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white font-mono text-sm z-50">
      <div className="flex items-center justify-between p-2 border-b border-gray-600">
        <div className="flex items-center space-x-2">
          <button
            onClick={onToggle}
            className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
          >
            {isOpen ? '▼' : '▲'} BlackBox
          </button>
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterType)}
            className="bg-gray-700 text-white px-2 py-1 rounded text-xs"
          >
            {filterOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            onClick={copyLogs}
            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
          >
            Копировать
          </button>
          
          <button
            onClick={saveToFile}
            className="px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs"
          >
            Сохранить в файл
          </button>
          
          <button
            onClick={downloadBundle}
            className="px-2 py-1 bg-purple-600 hover:bg-purple-700 rounded text-xs"
          >
            Скачать бандл
          </button>

          <button
            onClick={() => setTupikMode(!tupikMode)}
            className="px-2 py-1 bg-orange-600 hover:bg-orange-700 rounded text-xs"
          >
            🚧 Тупик?
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="flex flex-col" style={{ height: `${height}px` }}>
          <div
            ref={logContainerRef}
            className="flex-1 overflow-y-auto p-2 space-y-1"
          >
            {filteredLogs.length === 0 ? (
              <div className="text-gray-400 text-center py-4">
                Нет логов для отображения
              </div>
            ) : (
              filteredLogs.map((log, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <span className="text-gray-400 text-xs whitespace-nowrap">
                    {new Date(log.ts).toLocaleTimeString()}
                  </span>
                  <span className={`font-bold ${levelColors[log.level]}`}>
                    {levelLabels[log.level]}
                  </span>
                  <span className="flex-1">{log.msg}</span>
                  {log.stack && (
                    <details className="text-xs text-gray-300">
                      <summary className="cursor-pointer">Stack</summary>
                      <pre className="mt-1 whitespace-pre-wrap">{log.stack}</pre>
                    </details>
                  )}
                </div>
              ))
            )}
          </div>

          {tupikMode && (
            <div className="border-t border-gray-600 p-2 bg-gray-900">
              <div className="space-y-2">
                <label className="block text-xs font-bold">
                  Опишите тупик: какая ошибка?
                </label>
                <textarea
                  value={tupikDescription}
                  onChange={(e) => setTupikDescription(e.target.value)}
                  placeholder="Опишите проблему, с которой столкнулись..."
                  className="w-full h-16 bg-gray-800 text-white p-2 rounded text-xs resize-none"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleTupikSubmit}
                    className="px-3 py-1 bg-orange-600 hover:bg-orange-700 rounded text-xs"
                  >
                    Разблокировать Тупик
                  </button>
                  <button
                    onClick={() => setTupikMode(false)}
                    className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded text-xs"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}