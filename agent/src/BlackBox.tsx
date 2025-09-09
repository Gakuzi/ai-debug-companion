/* eslint-disable */
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { getMemoryLog, logInfo, logWarn, logError, type LogEntry } from './logger'

const levelToColor: Record<string, string> = {
  ERROR: 'text-red-500',
  WARN: 'text-yellow-500',
  INFO: 'text-white',
  DEBUG: 'text-gray-300',
  FATAL: 'text-red-400',
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

export function BlackBox(): JSX.Element {
  const [expanded, setExpanded] = useState(false)
  const [tick, setTick] = useState(0)
  const [filter, setFilter] = useState<Filter>('ВСЁ')
  const [tupikOpen, setTupikOpen] = useState(false)
  const tupikRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const entries = useMemo(() => getMemoryLog().slice(-50), [tick])
  const visible = useMemo(() => applyFilter(entries, filter), [entries, filter])

  const copy = async () => {
    await navigator.clipboard.writeText(JSON.stringify(entries, null, 2))
  }
  const saveToFile = () => {
    const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `logs-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }
  const downloadBundle = () => {
    const payload = { logs: entries, meta: { createdAt: new Date().toISOString() } }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `bundle-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const sendTupik = () => {
    const desc = tupikRef.current?.value?.trim()
    if (!desc) return
    logWarn('🚧 Запрос на разблокировку тупика', { payload: { description: desc } })
    alert('Данные отправлены в анализатор!')
    setTupikOpen(false)
  }

  return (
    <div className={`fixed left-0 right-0 ${expanded ? 'bottom-0 h-[200px]' : 'bottom-0 h-[60px]'} bg-gray-800 text-white font-mono shadow-lg z-50`}>
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <button className="px-2 py-1 bg-gray-700 rounded" onClick={() => setExpanded(e => !e)}>
            {expanded ? 'Свернуть' : 'Развернуть'}
          </button>
          <div className="flex gap-1">
            {filters.map(f => (
              <button key={f} className={`px-2 py-1 rounded ${filter === f ? 'bg-blue-600' : 'bg-gray-700'}`} onClick={() => setFilter(f)}>
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-2 py-1 bg-gray-700 rounded" onClick={copy}>Копировать</button>
          <button className="px-2 py-1 bg-gray-700 rounded" onClick={saveToFile}>Сохранить в файл</button>
          <button className="px-2 py-1 bg-gray-700 rounded" onClick={downloadBundle}>Скачать бандл</button>
          <button className="px-2 py-1 bg-yellow-700 rounded" onClick={() => setTupikOpen(v => !v)}>🚧 Тупик?</button>
        </div>
      </div>

      {tupikOpen && (
        <div className="p-3 border-b border-gray-700">
          <label className="block text-sm mb-1">Опишите тупик: какая ошибка?</label>
          <textarea ref={tupikRef} className="w-full h-20 bg-gray-900 text-white p-2 rounded" placeholder="Например: шаги рассуждения зациклились..." />
          <div className="mt-2">
            <button className="px-3 py-1 bg-green-700 rounded" onClick={sendTupik}>Разблокировать Тупик</button>
          </div>
        </div>
      )}

      <div className="overflow-y-auto h-full p-2 text-sm">
        {visible.map((e, idx) => (
          <div key={idx} className={`whitespace-pre-wrap ${levelToColor[e.level] ?? 'text-white'}`}>
            [{new Date(e.ts).toLocaleTimeString()}] {e.level}: {e.msg}
          </div>
        ))}
      </div>
    </div>
  )
}

export default BlackBox
