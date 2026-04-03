import { useState, useEffect } from 'react'
import { reportsApi, parkingsApi } from '../../api'
import { useAuthStore } from '../../store/auth'
import { Parking, ReportPeriod } from '../../types'
import { formatMoney, formatTime, formatDuration, downloadBlob } from '../../utils'
import PlateBadge from '../../components/ui/PlateBadge'
import toast from 'react-hot-toast'
import { Download, BarChart2, Car, TrendingUp, DollarSign } from 'lucide-react'

const PERIODS: { value: ReportPeriod; label: string }[] = [
  { value: 'daily',   label: 'Bugun' },
  { value: 'weekly',  label: 'Bu hafta' },
  { value: 'monthly', label: 'Bu oy' },
]

export default function ReportsPage() {
  const { user } = useAuthStore()
  const [parkings, setParkings]         = useState<Parking[]>([])
  const [selectedParking, setSelectedParking] = useState('')
  const [period, setPeriod]             = useState<ReportPeriod>('daily')
  const [summary, setSummary]           = useState<any>(null)
  const [downloading, setDownloading]   = useState(false)
  const [loading, setLoading]           = useState(false)

  const parkingId = user?.role === 'OPERATOR' ? (user.parkingId ?? '') : selectedParking

  useEffect(() => {
    if (user?.role !== 'OPERATOR') {
      const regionId = user?.role === 'REGION_ADMIN' ? user.regionId ?? undefined : undefined
      parkingsApi.getAll(regionId).then((r) => {
        setParkings(r.data)
        if (r.data.length > 0) setSelectedParking(r.data[0].id)
      })
    }
  }, [])

  useEffect(() => {
    if (parkingId) loadSummary()
  }, [parkingId, period])

  const loadSummary = async () => {
    if (!parkingId) return
    setLoading(true)
    try {
      const res = await reportsApi.getParkingSummary(parkingId, period)
      setSummary(res.data)
    } catch {
      toast.error('Hisobot yuklanmadi')
    } finally {
      setLoading(false)
    }
  }

  const handleExcel = async () => {
    if (!parkingId) return
    setDownloading(true)
    try {
      const res = await reportsApi.downloadExcel(parkingId, period)
      downloadBlob(res.data, `parkflow-${period}-${new Date().toISOString().slice(0, 10)}.xlsx`)
      toast.success('Excel yuklab olindi')
    } catch {
      toast.error('Yuklab olishda xatolik')
    } finally {
      setDownloading(false)
    }
  }

  const avgPayment = summary?.totalSessions > 0
    ? Math.round(summary.totalIncome / summary.totalSessions)
    : 0

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Hisobotlar</h1>
          <p className="text-sm text-slate-500 mt-0.5">Daromad va statistika</p>
        </div>
        <button onClick={handleExcel} disabled={downloading || !parkingId}
          className="btn-primary flex items-center gap-2">
          <Download size={16} />
          {downloading ? 'Yuklanmoqda...' : 'Excel yuklab olish'}
        </button>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-3">
        {user?.role !== 'OPERATOR' && parkings.length > 0 && (
          <select className="input w-56" value={selectedParking}
            onChange={(e) => setSelectedParking(e.target.value)}>
            {parkings.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        )}

        <div className="flex bg-white border border-slate-200 rounded-lg overflow-hidden">
          {PERIODS.map((p) => (
            <button key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-4 py-2 text-sm font-medium transition ${
                period === p.value
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="text-center py-8 text-slate-400">Yuklanmoqda...</div>
      )}

      {/* Summary kartalar */}
      {summary && !loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <Car size={22} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-medium tracking-wide">Jami mashinalar</p>
                <p className="text-2xl font-bold text-slate-800">{summary.totalSessions ?? 0} ta</p>
              </div>
            </div>

            <div className="card flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <TrendingUp size={22} className="text-green-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-medium tracking-wide">Jami kirim</p>
                <p className="text-2xl font-bold text-slate-800">{formatMoney(summary.totalIncome)}</p>
              </div>
            </div>

            <div className="card flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                <BarChart2 size={22} className="text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-medium tracking-wide">O'rtacha to'lov</p>
                <p className="text-2xl font-bold text-slate-800">{formatMoney(avgPayment)}</p>
              </div>
            </div>

            <div className="card flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <DollarSign size={22} className="text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-medium tracking-wide">
                  {period === 'daily' ? 'Bugun' : period === 'weekly' ? 'Bu hafta' : 'Bu oy'}
                </p>
                <p className="text-sm font-medium text-slate-500 mt-0.5">
                  {summary.from
                    ? new Date(summary.from).toLocaleDateString('uz-UZ')
                    : '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Jadval */}
          {summary.sessions?.length > 0 ? (
            <div className="card">
              <h2 className="font-semibold text-slate-800 mb-4">Harakatlar tarixi ({summary.sessions.length} ta)</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-500 border-b border-slate-100">
                      <th className="pb-2 font-medium">Raqam</th>
                      <th className="pb-2 font-medium">Kirish</th>
                      <th className="pb-2 font-medium">Chiqish</th>
                      <th className="pb-2 font-medium">Muddat</th>
                      <th className="pb-2 font-medium text-right">To'lov</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {summary.sessions.map((s: any) => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="py-2"><PlateBadge plate={s.plateNumber} country={s.country} size="sm" /></td>
                        <td className="py-2.5 text-slate-600">{formatTime(s.entryTime)}</td>
                        <td className="py-2.5 text-slate-600">
                          {s.exitTime ? formatTime(s.exitTime) : '—'}
                        </td>
                        <td className="py-2.5 text-slate-500">
                          {s.durationMinutes ? formatDuration(s.durationMinutes) : '—'}
                        </td>
                        <td className="py-2.5 text-right font-semibold text-green-700">
                          {s.totalAmount ? formatMoney(s.totalAmount) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="card text-center py-12 text-slate-400">
              <p className="text-3xl mb-2">📊</p>
              <p>Bu davrda ma'lumot yo'q</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
