const DAY_MS = 24 * 60 * 60 * 1000

const startOfDay = (timestamp: number) => new Date(timestamp).setHours(0, 0, 0, 0)

export function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(timestamp: number) {
  const sameYear = new Date(timestamp).getFullYear() === new Date().getFullYear()
  return new Date(timestamp)
    .toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: sameYear ? undefined : 'numeric' })
    .replace(/\s*г\.$/, '')
}

export function formatListTime(timestamp: number) {
  return startOfDay(timestamp) === startOfDay(Date.now()) ? formatTime(timestamp) : formatDate(timestamp)
}

export function formatDayLabel(timestamp: number) {
  const days = Math.round((startOfDay(Date.now()) - startOfDay(timestamp)) / DAY_MS)
  if (days === 0) return 'Сегодня'
  if (days === 1) return 'Вчера'
  return formatDate(timestamp)
}

export const isSameDay = (a: number, b: number) => startOfDay(a) === startOfDay(b)
