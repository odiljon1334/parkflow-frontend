import { useState, useEffect } from 'react'
import { vehiclesApi, reportsApi, parkingsApi, camerasApi } from '../../api'
import { useAuthStore } from '../../store/auth'
import { useSocket } from '../../hooks/useSocket'
import { Parking, VehicleSession, Camera } from '../../types'
import StatCard from '../../components/ui/StatCard'
import PlateBadge from '../../components/ui/PlateBadge'
import { formatMoney, formatTime, formatDuration } from '../../utils'
import { RefreshCw, AlertTriangle, Wifi, WifiOff } from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuthStore()
  const [parking, setParking]             = useState<Parking | null>(null)
  const [activeSessions, setActiveSessions] = useState<VehicleSession[]>([])
  const [recentSessions, setRecentSessions] = useState<VehicleSession[]>([])
  const [unpaidSessions, setUnpaidSessions] = useState<VehicleSession[]>([])
  const [cameras, setCameras]             = useState<Camera[]>([])
  const [dailyIncome, setDailyIncome]     = useState(0)
  const [weeklyIncome, setWeeklyIncome]   = useState(0)
  const [monthlyIncome, setMonthlyIncome] = useState(0)
  const [entryCount, setEntryCount]       = useState(0)
  const [exitCount, setExitCount]         = useState(0)
  const [activeCount, setActiveCount]     = useState(0)
  const [loading, setLoading]             = useState(true)

  const parkingId = user?.role === 'OPERATOR'
    ? (user.parkingId ?? '')
    : (parking?.id ?? '')

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      let pid = ''
      if (user?.role === 'OPERATOR' && user.parkingId) {
        pid = user.parkingId
      } else {
        const regionId = user?.role === 'REGION_ADMIN' ? user.regionId ?? undefined : undefined
        const res = await parkingsApi.getAll(regionId)
        if (res.data.length > 0) {
          setParking(res.data[0])
          pid = res.data[0].id
        }
      }
      if (pid) await loadParkingData(pid)
    } catch {} finally {
      setLoading(false)
    }
  }

  const loadParkingData = async (pid: string) => {
    const todayFrom = new Date(); todayFrom.setHours(0, 0, 0, 0)
    const todayTo   = new Date(); todayTo.setHours(23, 59, 59, 999)

    const [active, daily, weekly, monthly, stats, unpaid, recent, cams] = await Promise.all([
      vehiclesApi.getActive(pid),
      reportsApi.getParkingSummary(pid, 'daily'),
      reportsApi.getParkingSummary(pid, 'weekly'),
      reportsApi.getParkingSummary(pid, 'monthly'),
      vehiclesApi.getStats(pid),
      vehiclesApi.getUnpaid(pid),
      vehiclesApi.getAll(pid, todayFrom.toISOString(), todayTo.toISOString()),
      camerasApi.getAll(pid),
    ])

    setActiveSessions(active.data)
    setActiveCount(active.data.length)
    setDailyIncome(daily.data.totalIncome)
    setWeeklyIncome(weekly.data.totalIncome)
    setMonthlyIncome(monthly.data.totalIncome)
    setEntryCount(stats.data.entryCount)
    setExitCount(stats.data.exitCount)
    setUnpaidSessions(unpaid.data)
    setRecentSessions(recent.data.slice(0, 10))
    setCameras(cams.data)
  }

  // Real-time Socket.io
  useSocket(parkingId || null, {
    onEntry: (s) => {
      setActiveSessions((prev) => [s, ...prev])
      setActiveCount((c) => c + 1)
      setEntryCount((c) => c + 1)
      setRecentSessions((prev) => [s, ...prev].slice(0, 10))
    },
    onExit: (s) => {
      setActiveSessions((prev) => prev.filter((x) => x.id !== s.id))
      setActiveCount((c) => Math.max(0, c - 1))
      setExitCount((c) => c + 1)
      if (s.totalAmount) setDailyIncome((d) => d + s.totalAmount!)
      setRecentSessions((prev) =>
        prev.map((x) => (x.id === s.id ? s : x)).slice(0, 10),
      )
    },
  })

  const greet = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Xayrli tong'
    if (h < 17) return 'Xayrli kun'
    return 'Xayrli kech'
  }

  const onlineCount  = cameras.filter((c) => c.status === 'ONLINE').length
  const offlineCount = cameras.filter((c) => c.status !== 'ONLINE').length

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <div className="text-slate-400">Yuklanmoqda...</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {greet()}, {user?.fullName?.split(' ')[0]}! 👋
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {parking?.name ?? 'ParkFlow'} — real vaqt monitoringi
          </p>
        </div>
        <button onClick={loadData} className="text-slate-400 hover:text-slate-600 transition p-2 rounded-lg hover:bg-slate-100">
          <RefreshCw size={18} />
        </button>
      </div>

      {/* 6 stat kartalar */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Kirdi (bugun)"   value={entryCount}              icon="🚗" color="blue"   />
        <StatCard title="Chiqdi (bugun)"  value={exitCount}               icon="🏁" color="orange" />
        <StatCard title="Hozir ichkarida" value={activeCount}             icon="🅿️" color="blue"   live />
        <StatCard title="Bugungi kirim"   value={formatMoney(dailyIncome)}   icon="💰" color="green"  />
        <StatCard title="Haftalik kirim"  value={formatMoney(weeklyIncome)}  icon="📈" color="purple" />
        <StatCard title="Oylik kirim"     value={formatMoney(monthlyIncome)} icon="📅" color="orange" />
      </div>

      {/* Asosiy qator: Live jadval + Kamera holati */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Live card grid — 2/3 */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">
              Hozir parkingda
              {activeCount > 0 && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                  {activeCount} ta
                </span>
              )}
            </h2>
            <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Jonli
            </span>
          </div>

          {activeSessions.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <p className="text-3xl mb-2">🅿️</p>
              <p className="text-sm">Parking bo'sh</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
              {activeSessions.map((s) => {
                const mins = Math.floor((Date.now() - new Date(s.entryTime).getTime()) / 60000)
                return (
                  <div key={s.id}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-3 hover:border-blue-300 hover:shadow-sm transition">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Kirdi: {formatTime(s.entryTime)}</span>
                    </div>
                    <div className="flex justify-center">
                      <PlateBadge plate={s.plateNumber} country={s.country} size="sm" />
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-200 pt-2">
                      <span className="text-xs text-slate-400">Turgan:</span>
                      <span className="text-xs font-semibold text-blue-600">{formatDuration(mins)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Kamera holati — 1/3 */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Kamera holati</h2>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 text-green-600">
                <Wifi size={12} /> {onlineCount}
              </span>
              {offlineCount > 0 && (
                <span className="flex items-center gap-1 text-red-500">
                  <WifiOff size={12} /> {offlineCount}
                </span>
              )}
            </div>
          </div>

          {cameras.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">Kamera yo'q</p>
          ) : (
            <div className="space-y-2">
              {cameras.map((c) => {
                const isOnline = c.status === 'ONLINE'
                return (
                  <div key={c.id}
                    className={`flex items-center justify-between p-2.5 rounded-lg ${
                      isOnline ? 'bg-green-50' : 'bg-red-50'
                    }`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-400'}`} />
                      <div>
                        <p className="text-xs font-medium text-slate-700">{c.name}</p>
                        <p className="text-xs text-slate-400">{c.type}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-medium ${isOnline ? 'text-green-600' : 'text-red-500'}`}>
                      {isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bugungi harakatlar tarixi */}
      <div className="card">
        <h2 className="font-semibold text-slate-800 mb-4">Bugungi harakatlar (so'nggi 10)</h2>
        {recentSessions.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">Bugun hali harakat yo'q</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-100">
                  <th className="pb-2 font-medium">Raqam</th>
                  <th className="pb-2 font-medium">Kirish</th>
                  <th className="pb-2 font-medium">Chiqish</th>
                  <th className="pb-2 font-medium">Muddat</th>
                  <th className="pb-2 font-medium text-right">To'lov</th>
                  <th className="pb-2 font-medium text-right">Holat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentSessions.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition">
                    <td className="py-2"><PlateBadge plate={s.plateNumber} country={s.country} size="sm" /></td>
                    <td className="py-2.5 text-slate-600">{formatTime(s.entryTime)}</td>
                    <td className="py-2.5 text-slate-500">
                      {s.exitTime ? formatTime(s.exitTime) : '—'}
                    </td>
                    <td className="py-2.5 text-slate-500">
                      {s.durationMinutes ? formatDuration(s.durationMinutes) : '—'}
                    </td>
                    <td className="py-2.5 text-right font-semibold text-green-700">
                      {s.totalAmount ? formatMoney(s.totalAmount) : '—'}
                    </td>
                    <td className="py-2.5 text-right">
                      {s.status === 'ACTIVE' ? (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Ichkarida</span>
                      ) : (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Chiqdi</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* To'lanmagan sessionlar */}
      {unpaidSessions.length > 0 && (
        <div className="card border border-orange-200 bg-orange-50">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-orange-500" />
            <h2 className="font-semibold text-orange-800">To'lanmagan sessionlar ({unpaidSessions.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-orange-600 border-b border-orange-200">
                  <th className="pb-2 font-medium">Raqam</th>
                  <th className="pb-2 font-medium">Kirish</th>
                  <th className="pb-2 font-medium">Chiqish</th>
                  <th className="pb-2 font-medium text-right">Summa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-100">
                {unpaidSessions.map((s) => (
                  <tr key={s.id}>
                    <td className="py-2"><PlateBadge plate={s.plateNumber} country={s.country} size="sm" /></td>
                    <td className="py-2 text-slate-600">{formatTime(s.entryTime)}</td>
                    <td className="py-2 text-slate-500">{s.exitTime ? formatTime(s.exitTime) : '—'}</td>
                    <td className="py-2 text-right font-semibold text-orange-700">
                      {s.totalAmount ? formatMoney(s.totalAmount) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  )
}
