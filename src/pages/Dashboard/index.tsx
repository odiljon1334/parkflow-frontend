import { useState, useEffect } from 'react'
import { vehiclesApi, reportsApi, parkingsApi } from '../../api'
import { useAuthStore } from '../../store/auth'
import { useSocket } from '../../hooks/useSocket'
import { Parking, VehicleSession } from '../../types'
import StatCard from '../../components/ui/StatCard'
import CountryBadge from '../../components/ui/CountryBadge'
import { formatMoney, formatTime } from '../../utils'

export default function Dashboard() {
  const { user } = useAuthStore()
  const [parking, setParking]               = useState<Parking | null>(null)
  const [activeSessions, setActiveSessions] = useState<VehicleSession[]>([])
  const [dailyIncome, setDailyIncome]       = useState(0)
  const [weeklyIncome, setWeeklyIncome]     = useState(0)
  const [monthlyIncome, setMonthlyIncome]   = useState(0)
  const [activeCount, setActiveCount]       = useState(0)

  const parkingId = user?.role === 'OPERATOR'
    ? (user.parkingId ?? '')
    : (parking?.id ?? '')

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      if (user?.role === 'OPERATOR' && user.parkingId) {
        await loadParkingData(user.parkingId)
      } else if (user?.role === 'REGION_ADMIN' && user.regionId) {
        const res = await parkingsApi.getAll(user.regionId)
        if (res.data.length > 0) {
          setParking(res.data[0])
          await loadParkingData(res.data[0].id)
        }
      } else {
        const res = await parkingsApi.getAll()
        if (res.data.length > 0) {
          setParking(res.data[0])
          await loadParkingData(res.data[0].id)
        }
      }
    } catch {}
  }

  const loadParkingData = async (pid: string) => {
    const [active, daily, weekly, monthly] = await Promise.all([
      vehiclesApi.getActive(pid),
      reportsApi.getParkingSummary(pid, 'daily'),
      reportsApi.getParkingSummary(pid, 'weekly'),
      reportsApi.getParkingSummary(pid, 'monthly'),
    ])
    setActiveSessions(active.data)
    setActiveCount(active.data.length)
    setDailyIncome(daily.data.totalIncome)
    setWeeklyIncome(weekly.data.totalIncome)
    setMonthlyIncome(monthly.data.totalIncome)
  }

  // Real-time Socket.io
  useSocket(parkingId || null, {
    onEntry: (s) => {
      setActiveSessions((prev) => [s, ...prev])
      setActiveCount((c) => c + 1)
    },
    onExit: (s) => {
      setActiveSessions((prev) => prev.filter((x) => x.id !== s.id))
      setActiveCount((c) => Math.max(0, c - 1))
      if (s.totalAmount) setDailyIncome((d) => d + s.totalAmount!)
    },
  })

  const greet = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Xayrli tong'
    if (h < 17) return 'Xayrli kun'
    return 'Xayrli kech'
  }

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          {greet()}, {user?.fullName?.split(' ')[0]}! 👋
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {parking?.name ?? 'ParkFlow'} — real vaqt monitoringi
        </p>
      </div>

      {/* Stat kartalar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Hozir ichkarida" value={activeCount}              icon="🚗" color="blue"   live />
        <StatCard title="Bugungi kirim"   value={formatMoney(dailyIncome)}   icon="💰" color="green"  />
        <StatCard title="Haftalik kirim"  value={formatMoney(weeklyIncome)}  icon="📈" color="orange" />
        <StatCard title="Oylik kirim"     value={formatMoney(monthlyIncome)} icon="📅" color="purple" />
      </div>

      {/* Live jadval */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800">Hozir parkingda</h2>
          <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Jonli yangilanish
          </span>
        </div>

        {activeSessions.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <p className="text-4xl mb-2">🅿️</p>
            <p>Parking bo'sh</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-100">
                  <th className="pb-2 font-medium w-8">№</th>
                  <th className="pb-2 font-medium">Raqam</th>
                  <th className="pb-2 font-medium">Davlat</th>
                  <th className="pb-2 font-medium">Kirish vaqti</th>
                  <th className="pb-2 font-medium">Turish vaqti</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {activeSessions.map((s, i) => {
                  const mins = Math.floor((Date.now() - new Date(s.entryTime).getTime()) / 60000)
                  const h    = Math.floor(mins / 60)
                  const m    = mins % 60
                  return (
                    <tr key={s.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 text-slate-400">{i + 1}</td>
                      <td className="py-3 font-mono font-bold text-slate-800">{s.plateNumber}</td>
                      <td className="py-3"><CountryBadge country={s.country} /></td>
                      <td className="py-3 text-slate-600">{formatTime(s.entryTime)}</td>
                      <td className="py-3 text-slate-500">{h > 0 ? `${h}s ` : ''}{m}d</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
