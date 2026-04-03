import { formatPlate } from '../../utils'

// Har davlat uchun chap strip rangi va matn
const COUNTRY_CONFIG: Record<string, { strip: string; flag: string; text: string }> = {
  UZ: { strip: 'bg-blue-700',   flag: '🇺🇿', text: 'UZ' },
  KG: { strip: 'bg-red-700',    flag: '🇰🇬', text: 'KG' },
  KZ: { strip: 'bg-sky-600',    flag: '🇰🇿', text: 'KZ' },
  RU: { strip: 'bg-blue-800',   flag: '🇷🇺', text: 'RU' },
  TM: { strip: 'bg-green-700',  flag: '🇹🇲', text: 'TM' },
  TJ: { strip: 'bg-green-800',  flag: '🇹🇯', text: 'TJ' },
}

interface Props {
  plate: string
  country: string
  size?: 'sm' | 'md' | 'lg'
}

export default function PlateBadge({ plate, country, size = 'md' }: Props) {
  const config = COUNTRY_CONFIG[country] ?? { strip: 'bg-slate-600', flag: '🏳️', text: '??' }
  const formatted = formatPlate(plate, country)

  const sizes = {
    sm: { wrap: 'h-7 text-xs',   strip: 'w-5 text-[8px]',  num: 'px-2 text-sm'  },
    md: { wrap: 'h-9 text-sm',   strip: 'w-6 text-[9px]',  num: 'px-3 text-base' },
    lg: { wrap: 'h-11 text-base',strip: 'w-7 text-[10px]', num: 'px-4 text-lg'  },
  }
  const s = sizes[size]

  return (
    <div className={`inline-flex items-stretch rounded border-2 border-slate-700 overflow-hidden shadow-sm ${s.wrap}`}
      style={{ fontFamily: "'Courier New', Courier, monospace" }}>

      {/* Chap strip — davlat kodi */}
      <div className={`${config.strip} ${s.strip} flex flex-col items-center justify-center gap-0 shrink-0`}>
        <span className="leading-none">{config.flag}</span>
        <span className="text-white font-bold leading-none tracking-tight">{config.text}</span>
      </div>

      {/* Raqam */}
      <div className={`bg-white flex items-center justify-center ${s.num}`}>
        <span className="font-black text-slate-900 tracking-widest uppercase leading-none">
          {formatted}
        </span>
      </div>
    </div>
  )
}
