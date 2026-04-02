import { COUNTRY_FLAGS } from '../../utils'

export default function CountryBadge({ country }: { country: string }) {
  const flag = COUNTRY_FLAGS[country] ?? '🏳️'
  const cls = `badge-${country.toLowerCase()}`
  return (
    <span className={cls || 'inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium'}>
      {flag} {country}
    </span>
  )
}
