import { useState, useEffect } from 'react'
import { vehiclesApi, parkingsApi } from '../../api'
import { useAuthStore } from '../../store/auth'
import { useSocket } from '../../hooks/useSocket'
import { Vehicle, Parking } from '../../types'
import CountryBadge from '../../components/ui/CountryBadge'
import toast from 'react-hot-toast'
import { Car, LogIn, LogOut, Search, RefreshCw } from 'lucide-react'
import { formatMoney, formatTime, formatDuration } from '../../utils'

export default function VehiclesPage() {
  const { user } = useAuthStore()
  const [parkings, setParkings] = useState<Parking[]>([])
  const [selectedParking, setSelectedParking] = useState<string>('')
  const [insideVehicles, setInsideVehicles] = useState<Vehicle[]>([])
  const [entryPlate, setEntryPlate] = useState('')
  const [exitPlate, setExitPlate] = useState('')
  const [preview, setPreview] = useState<{ vehicle: Vehicle; durationMin: number; amount: number } | null>(null)
  const [loading, setLoading] = useState(false)

  // Operator uchun parking avtomatik belgilanadi
  const parkingId = user?.role === 'OPERATOR' ? (user.parkingId ?? '') : selectedParking

  useEffect(() => {
    if (user?.role !== 'OPERATOR') {
      const regionId = user?.role === 'REGION_ADMIN' ? user.regionId ?? undefined : undefined
      parkingsApi.getAll(regionId).then((res) => {
        setParkings(res.data)
        if (res.data.length > 0) setSelectedParking(res.data[0].id)
      })
    }
  }, [])

  useEffect(() => {
    if (parkingId) loadInside()
  }, [parkingId])

  // Real-time socket
  useSocket(parkingId || null, {
    onEntry: (v) => setInsideVehicles((prev) => [v, ...prev]),
    onExit: (v) => setInsideVehicles((prev) => prev.filter((x) => x.id !== v.id)),
    onCount: () => {},
  })

  const loadInside = async () => {
    if (!parkingId) return
    const res = await vehiclesApi.getInside(parkingId)
    setInsideVehicles(res.data)
  }

  const handleEntry = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!entryPlate.trim() || !parkingId) return
    setLoading(true)
    try {
      await vehiclesApi.entry({ plateNumber: entryPlate.trim(), parkingId, method: 'MANUAL' })
      toast.success(`${entryPlate.toUpperCase()} kirdi`)
      setEntryPlate('')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Xatolik')
    } finally {
      setLoading(false)
    }
  }

  const handlePreview = async () => {
    if (!exitPlate.trim() || !parkingId) return
    try {
      const res = await vehiclesApi.previewPrice(parkingId, exitPlate.trim())
      setPreview(res.data)
    } catch {
      toast.error('Mashina topilmadi')
      setPreview(null)
    }
  }

  const handleExit = async () => {
    if (!preview || !parkingId) return
    setLoading(true)
    try {
      await vehiclesApi.exit({ plateNumber: exitPlate.trim(), parkingId, method: 'MANUAL', paymentMethod: 'CASH' })
      toast.success(`To'lov qabul qilindi: ${formatMoney(preview.amount)}`)
      setExitPlate('')
      setPreview(null)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Xatolik')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Kirish / Chiqish</h1>
          <p className="text-sm text-slate-500 mt-0.5">Mashinalar harakati</p>
        </div>

        {user?.role !== 'OPERATOR' && parkings.length > 0 && (
          <select
            className="input w-56"
            value={selectedParking}
            onChange={(e) => setSelectedParking(e.target.value)}
          >
            {parkings.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Kirish va Chiqish bloklari */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* KIRISH */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <LogIn size={16} className="text-green-600" />
            </div>
            <h2 className="font-semibold text-slate-800">Mashina kirdi</h2>
          </div>
          <form onSubmit={handleEntry} className="space-y-3">
            <div>
              <label className="label">Davlat raqami</label>
              <input
                className="input text-lg font-mono uppercase"
                value={entryPlate}
                onChange={(e) => setEntryPlate(e.target.value.toUpperCase())}
                placeholder="01A123BC"
                autoComplete="off"
              />
              <p className="text-xs text-slate-400 mt-1">UZ, KG, KZ, RU, TM, TJ raqamlari qabul qilinadi</p>
            </div>
            <button type="submit" className="btn-primary w-full py-2.5" disabled={loading || !entryPlate.trim()}>
              Kirishni qayd etish
            </button>
          </form>
        </div>

        {/* CHIQISH */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <LogOut size={16} className="text-red-600" />
            </div>
            <h2 className="font-semibold text-slate-800">Mashina chiqdi</h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="label">Davlat raqami</label>
              <div className="flex gap-2">
                <input
                  className="input text-lg font-mono uppercase"
                  value={exitPlate}
                  onChange={(e) => { setExitPlate(e.target.value.toUpperCase()); setPreview(null) }}
                  placeholder="01A123BC"
                  autoComplete="off"
                />
                <button onClick={handlePreview} className="btn-secondary px-3" title="Narxni tekshirish">
                  <Search size={16} />
                </button>
              </div>
            </div>

            {/* Narx preview */}
            {preview && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Mashina:</span>
                  <span className="font-mono font-bold">{preview.vehicle.plateNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Kirish:</span>
                  <span className="text-sm">{formatTime(preview.vehicle.entryTime)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Vaqt:</span>
                  <span className="text-sm">{formatDuration(preview.durationMin)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-blue-200 pt-2">
                  <span className="font-semibold text-slate-800">To'lov:</span>
                  <span className="text-xl font-bold text-blue-700">{formatMoney(preview.amount)}</span>
                </div>
                <button onClick={handleExit} className="btn-primary w-full py-2.5" disabled={loading}>
                  To'lov qabul qilindi (Naqd)
                </button>
              </div>
            )}

            {!preview && (
              <button onClick={handlePreview} className="btn-secondary w-full py-2.5" disabled={!exitPlate.trim()}>
                Narxni hisoblash
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Hozir parkingda */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Car size={18} className="text-slate-600" />
            <h2 className="font-semibold text-slate-800">Hozir parkingda</h2>
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              {insideVehicles.length} ta
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            </span>
          </div>
          <button onClick={loadInside} className="text-slate-400 hover:text-slate-600">
            <RefreshCw size={16} />
          </button>
        </div>

        {insideVehicles.length === 0 ? (
          <p className="text-center text-slate-400 py-8">Parking bo'sh</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-100">
                  <th className="pb-2 font-medium">Raqam</th>
                  <th className="pb-2 font-medium">Davlat</th>
                  <th className="pb-2 font-medium">Kirish</th>
                  <th className="pb-2 font-medium">Vaqt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {insideVehicles.map((v) => {
                  const mins = Math.floor((Date.now() - new Date(v.entryTime).getTime()) / 60000)
                  return (
                    <tr key={v.id} className="hover:bg-slate-50">
                      <td className="py-3 font-mono font-bold text-slate-800">{v.plateNumber}</td>
                      <td className="py-3"><CountryBadge country={v.country} /></td>
                      <td className="py-3 text-slate-600">{formatTime(v.entryTime)}</td>
                      <td className="py-3 text-slate-500">{formatDuration(mins)}</td>
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
