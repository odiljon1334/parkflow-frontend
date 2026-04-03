export const COUNTRY_FLAGS: Record<string, string> = {
  UZ: '🇺🇿', KG: '🇰🇬', KZ: '🇰🇿',
  RU: '🇷🇺', TM: '🇹🇲', TJ: '🇹🇯', UNKNOWN: '🏳️',
}

export const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN:   'Super Admin',
  REGION_ADMIN:  'Region Admin',
  PARKING_ADMIN: 'Parking Admin',
  OPERATOR:      'Operator',
}

export const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN:   'bg-purple-100 text-purple-700',
  REGION_ADMIN:  'bg-blue-100 text-blue-700',
  PARKING_ADMIN: 'bg-indigo-100 text-indigo-700',
  OPERATOR:      'bg-green-100 text-green-700',
}

// Davlat bo'yicha avto raqamni formatlash
export function formatPlate(plate: string, country: string): string {
  const p = plate.toUpperCase().replace(/\s+/g, '')
  if (country === 'UZ') {
    // 60R559SA → 60 R 559 SA
    const m = p.match(/^(\d{2})([A-Z])(\d{3})([A-Z]{2})$/)
    if (m) return `${m[1]} ${m[2]} ${m[3]} ${m[4]}`
  }
  if (country === 'KG') {
    // 04783AOV → 04 783 AOV
    const m = p.match(/^(\d{2})(\d{3})([A-Z]{3})$/)
    if (m) return `${m[1]} ${m[2]} ${m[3]}`
  }
  if (country === 'KZ') {
    // 123ABC02 → 123 ABC 02
    const m = p.match(/^(\d{3})([A-Z]{3})(\d{2})$/)
    if (m) return `${m[1]} ${m[2]} ${m[3]}`
  }
  if (country === 'RU') {
    // A123BC78 → A 123 BC 78
    const m = p.match(/^([A-ZА-Я])(\d{3})([A-ZА-Я]{2})(\d{2,3})$/)
    if (m) return `${m[1]} ${m[2]} ${m[3]} ${m[4]}`
  }
  // Formatsiz: har 2-3 belgidan keyin bo'sh joy
  return plate
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
