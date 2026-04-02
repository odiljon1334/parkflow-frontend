export const COUNTRY_FLAGS: Record<string, string> = {
  UZ: '🇺🇿', KG: '🇰🇬', KZ: '🇰🇿',
  RU: '🇷🇺', TM: '🇹🇲', TJ: '🇹🇯', UNKNOWN: '🏳️',
}

export const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  REGION_ADMIN: 'Region Admin',
  OPERATOR: 'Operator',
}

export const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: 'bg-purple-100 text-purple-700',
  REGION_ADMIN: 'bg-blue-100 text-blue-700',
  OPERATOR: 'bg-green-100 text-green-700',
}

export function formatMoney(amount: number): string {
  return amount.toLocaleString('uz-UZ') + " so'm"
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} daqiqa`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h} soat ${m} daqiqa` : `${h} soat`
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('uz-UZ', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('uz-UZ', {
    hour: '2-digit', minute: '2-digit',
  })
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
