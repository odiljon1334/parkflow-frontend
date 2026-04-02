import { useState, useEffect } from 'react'
import { reportsApi, parkingsApi } from '../../api'
import { useAuthStore } from '../../store/auth'
import { Parking, ReportPeriod } from '../../types'
import { formatMoney, downloadBlob } from '../../utils'
import toast from 'react-hot-toast'
import { Download, BarChart2, Car, TrendingUp } from 'lucide-react'

const PERIODS: { value: ReportPeriod; label: string }[] = [
  { value: 'daily',   label: 'Bugun' },
  { value: 'weekly',  label: 'Bu hafta' },
  { value: 'monthly', label: 'Bu oy' },
]

export default function ReportsPage() {
  const { user } = useAuthStore()
  const [parkings, setParkings] = useState<Parking[]>([])
  const [selectedParking, setSelectedParking] = useState('')
  const [period, setPeriod] = useState<ReportPeriod>('daily')
  const [summary, setSummary] = useState<any>(null)
  const [downloading, setDownloading] = useState(false)

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
    try {
      const res = await reportsApi.getParkingSummary(parkingId, period)
      setSummary(res.data)
    } catch {
      toast.error('Hisobot yuklanmadi')
    }
  }

  const handleExcel = async () => {
    if (!parkingId) return
    setDownloading(true)
    try {
      const res = await reportsApi.downloadExcel(parkingId, period)
      downloadBlob(res.data, `parkflow-${period}-${Date.now()}.xlsx`)
      toast.success('Excel yuklab olindi')
    } catch {
      toast.error('Yuklab olishda xatolik')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
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

      {/* Summary kartalar */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <Car size={22} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-medium tracking-wide">Jami mashinalar</p>
              <p className="text-2xl font-bold text-slate-800">{summary.totalVehicles} ta</p>
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
              <p className="text-2xl font-bold text-slate-800">
                {summary.totalVehicles > 0
                  ? formatMoney(Math.round(summary.totalIncome / summary.totalVehicles))
                  : "0 so'm"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Jadval */}
      {summary?.vehicles?.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-slate-800 mb-4">Harakatlar tarixi</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-100">
                  <th className="pb-2 font-medium">Raqam</th>
                  <th className="pb-2 font-medium">Kirish</th>
                  <th className="pb-2 font-medium">Chiqish</th>
                  <th className="pb-2 font-medium">Vaqt</th>
                  <th className="pb-2 font-medium text-right">To'lov</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {summary.vehicles.map((v: any) => (
                  <tr key={v.id} className="hover:bg-slate-50">
                    <td className="py-2.5 font-mono font-bold">{v.plateNumber}</td>
                    <td className="py-2.5 text-slate-600">
                      {new Date(v.entryTime).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-2.5 text-slate-600">
                      {v.exitTime
                        ? new Date(v.exitTime).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
                        : '—'}
                    </td>
                    <td className="py-2.5 text-slate-500">{v.durationMin ? `${v.durationMin} min` : '—'}</td>
                    <td className="py-2.5 font-semibold text-green-700 text-right">
                      {v.amount ? formatMoney(v.amount) : '—'}
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
