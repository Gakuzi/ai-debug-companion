/* eslint-disable */
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { getMemoryLog, logInfo, logWarn, logError, type LogEntry } from './logger'

const levelToColor: Record<string, string> = {
  ERROR: 'text-red-500',
  FATAL: 'text-red-500',
  WARN: 'text-yellow-500',
  INFO: 'text-white',
  DEBUG: 'text-gray-300',
}

const filters = ['ВСЁ', 'ОШИБКА', 'ПРЕДУПРЕЖДЕНИЕ', 'ИНФО', 'DEBUG'] as const

type Filter = typeof filters[number]

function applyFilter(entries: LogEntry[], filter: Filter): LogEntry[] {
  switch (filter) {
    case 'ВСЁ':
      return entries
    case 'ОШИБКА':
      return entries.filter(e => e.level === 'ERROR' || e.level === 'FATAL')
    case 'ПРЕДУПРЕЖДЕНИЕ':
      return entries.filter(e => e.level === 'WARN')
    case 'ИНФО':
      return entries.filter(e => e.level === 'INFO')
    case 'DEBUG':
      return entries.filter(e => e.level === 'DEBUG')
  }
}

export interface BlackBoxProps {
  isOpen?: boolean
  onToggle?: () => void
  height?: number
}

export function BlackBox({ isOpen = false, onToggle, height = 300 }: BlackBoxProps): JSX.Element {
  const [expanded, setExpanded] = useState(isOpen)
  const [tick, setTick] = useState(0)
  const [filter, setFilter] = useState<Filter>('ВСЁ')
  const [tupikOpen, setTupikOpen] = useState(false)
  const [tupikDescription, setTupikDescription] = useState('')
  const tupikRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (isOpen !== expanded) {
      setExpanded(isOpen)
    }
  }, [isOpen, expanded])

  const toggleExpanded = () => {
    const newExpanded = !expanded
    setExpanded(newExpanded)
    if (onToggle) {
      onToggle()
    }
  }

  const entries = useMemo(() => getMemoryLog().slice(-50), [tick])
  const visible = useMemo(() => applyFilter(entries, filter), [entries, filter, filter])

  const copyLogs = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(entries, null, 2))
      logInfo('Логи скопированы в буфер обмена', {})
    } catch (error) {
      logError('Ошибка при копировании логов', { payload: { error: String(error) } })
    }
  }

  const downloadBundle = () => {
    try {
      // Создаем бандл с логами и метаданными
      const payload = { 
        logs: entries, 
        meta: { 
          createdAt: new Date().toISOString(),
          filter: filter,
          count: entries.length
        } 
      }
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `debug-bundle-${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(a.href)
      logInfo('Бандл загружен', { payload: { filename: a.download } })
    } catch (error) {
      logError('Ошибка при загрузке бандла', { payload: { error: String(error) } })
    }
  }

  const analyzeTupik = async () => {
    if (!tupikDescription.trim()) {
      alert('Пожалуйста, опишите тупик')
      return
    }

    try {
      logWarn('🚧 Запрос на разблокировку тупика', { 
        payload: { description: tupikDescription } 
      })

      // Отправляем запрос на анализ тупика
      // В реальной реализации это будет отправка на collector
      alert('Данные отправлены!')
      setTupikDescription('')
      setTupikOpen(false)
    } catch (error) {
      logError('Ошибка при отправке данных тупика', { 
        payload: { error: String(error) } 
      })
      alert('Ошибка при отправке данных')
    }
  }

  return (
    <div className={`fixed left-0 right-0 ${expanded ? 'bottom-0' : 'bottom-0'} bg-gray-800 text-white p-4 rounded-t-lg shadow-lg z-50`} 
         style={{ height: expanded ? `${height}px` : '60px' }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <button 
            className="px-2 py-1 bg-gray-700 rounded text-sm"
            onClick={toggleExpanded}
          >
            {expanded ? 'Свернуть' : 'Развернуть'}
          </button>
          <div className="flex gap-1">
            {filters.map(f => (
              <button 
                key={f} 
                className={`px-2 py-1 rounded text-sm ${filter === f ? 'bg-blue-600' : 'bg-gray-700'}`} 
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            className="px-2 py-1 bg-gray-700 rounded text-sm"
            onClick={copyLogs}
          >
            Копировать логи
          </button>
          <button 
            className="px-2 py-1 bg-gray-700 rounded text-sm"
            onClick={downloadBundle}
          >
            Скачать бандл
          </button>
          <button 
            className="px-2 py-1 bg-yellow-700 rounded text-sm"
            onClick={() => setTupikOpen(v => !v)}
          >
            🚧 Тупик?
          </button>
        </div>
      </div>

      {tupikOpen && (
        <div className="mb-3 p-2 bg-gray-700 rounded">
          <label className="block text-sm mb-1">Опишите тупик: какая ошибка?</label>
          <textarea 
            value={tupikDescription}
            onChange={(e) => setTupikDescription(e.target.value)}
            className="w-full h-20 bg-gray-900 text-white p-2 rounded text-sm" 
            placeholder="Например: шаги рассуждения зациклились..." 
          />
          <div className="mt-2">
            <button 
              className="px-3 py-1 bg-green-700 rounded text-sm"
              onClick={analyzeTupik}
            >
              Анализировать Тупик
            </button>
          </div>
        </div>
      )}

      {expanded && (
        <div className="overflow-y-auto h-full text-xs">
          {visible.length === 0 ? (
            <div className="text-gray-400">Нет логов для отображения</div>
          ) : (
            visible.map((e, idx) => (
              <div key={idx} className={`whitespace-pre-wrap ${levelToColor[e.level] ?? 'text-white'} mb-1`}>
                [{new Date(e.ts).toLocaleTimeString()}] {e.level}: {e.msg}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default BlackBox