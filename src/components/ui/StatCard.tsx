interface Props {
  title: string
  value: string | number
  icon: string
  color?: string
  live?: boolean
}

export default function StatCard({ title, value, icon, color = 'blue', live }: Props) {
  const colors: Record<string, string> = {
    blue:   'bg-blue-50 text-blue-600',
    green:  'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
  }

  return (
    <div className="card flex items-center gap-4">
      <div className={`text-2xl w-12 h-12 rounded-xl flex items-center justify-center ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide flex items-center gap-1">
          {title}
          {live && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
        </p>
        <p className="text-2xl font-bold text-slate-800 mt-0.5">{value}</p>
      </div>
    </div>
  )
}
