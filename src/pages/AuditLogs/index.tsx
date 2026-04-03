import { useState, useEffect } from 'react'
import { auditApi, parkingsApi } from '../../api'
import { useAuthStore } from '../../store/auth'
import { Parking } from '../../types'
import PlateBadge from '../../components/ui/PlateBadge'
import toast from 'react-hot-toast'
import { History, RefreshCw } from 'lucide-react'

const EVENT_LABELS: Record<string, { label: string; color: string }> = {
  ENTRY_CAPTURED: { label: 'Kirdi (kamera)',  color: 'bg-blue-100 text-blue-700'    },
  MANUAL_ENTRY:   { label: 'Kirdi (qo\'lda)', color: 'bg-indigo-100 text-indigo-700' },
  EXIT_CAPTURED:  { label: 'Chiqdi (kamera)', color: 'bg-green-100 text-green-700'  },
  MANUAL_EXIT:    { label: 'Chiqdi (qo\'lda)',color: 'bg-teal-100 text-teal-700'    },
  SESSION_CLOSED: { label: 'Yopildi',          color: 'bg-orange-100 text-orange-700' },
  PAYMENT_ADDED:  { label: 'To\'lov',          color: 'bg-emerald-100 text-emerald-700'},
  NOTE_ADDED:     { label: 'Izoh',             color: 'bg-slate-100 text-slate-600'  },
}

export default function AuditLogsPage() {
  const { user } = useAuthStore()
  const [events, setEvents]             = useState<any[]>([])
  const [parkings, setParkings]         = useState<Parking[]>([])
  const [selectedParking, setSelectedParking] = useState('')
  const [loading, setLoading]           = useState(false)

  useEffect(() => {
    if (user?.role !== 'OPERATOR') {
      const regionId = user?.role === 'REGION_ADMIN' ? user.regionId ?? undefined : undefined
      parkingsApi.getAll(regionId).then((r) => {
        setParkings(r.data)
        if (r.data.length > 0) {
          setSelectedParking(r.data[0].id)
        } else {
          loadEvents()
        }
      })
    } else {
      loadEvents(user.parkingId ?? undefined)
    }
  }, [])

  useEffect(() => {
    if (selectedParking) loadEvents(selectedParking)
  }, [selectedParking])

  const loadEvents = async (parkingId?: string) => {
    setLoading(true)
    try {
      const res = await auditApi.getEvents(parkingId, 200)
      setEvents(res.data)
    } catch {
      toast.error('Loglar yuklanmadi')
    } finally {
      setLoading(false)
    }
  }

  const refresh = () => {
    const pid = user?.role === 'OPERATOR' ? (user.parkingId ?? undefined) : selectedParking || undefined
    loadEvents(pid)
  }

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <History size={22} />
            Audit Log
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Barcha harakatlar tarixi</p>
        </div>
        <div className="flex items-center gap-3">
          {user?.role !== 'OPERATOR' && parkings.length > 0 && (
            <select className="input w-52" value={selectedParking}
              onChange={(e) => setSelectedParking(e.target.value)}>
              <option value="">Barcha parkinglar</option>
              {parkings.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          )}
          <button onClick={refresh}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition">
            <RefreshCw size={17} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="card">
        {loading ? (
          <div className="text-center py-12 text-slate-400">Yuklanmoqda...</div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <p className="text-3xl mb-2">📋</p>
            <p className="text-sm">Log yozuvlari yo'q</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-100">
                  <th className="pb-3 font-medium">Vaqt</th>
                  <th className="pb-3 font-medium">Hodisa</th>
                  <th className="pb-3 font-medium">Mashina</th>
                  <th className="pb-3 font-medium">Parking</th>
                  <th className="pb-3 font-medium">Kim</th>
                  <th className="pb-3 font-medium">Ma'lumot</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {events.map((e) => {
                  const meta = EVENT_LABELS[e.type] ?? { label: e.type, color: 'bg-slate-100 text-slate-600' }
                  return (
                    <tr key={e.id} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 text-slate-500 text-xs whitespace-nowrap">
                        {new Date(e.createdAt).toLocaleString('uz-UZ', {
                          day: '2-digit', month: '2-digit',
                          hour: '2-digit', minute: '2-digit', second: '2-digit',
                        })}
                      </td>
                      <td className="py-2.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${meta.color}`}>
                          {meta.label}
                        </span>
                      </td>
                      <td className="py-2">
                        {e.session
                          ? <PlateBadge plate={e.session.plateNumber} country={e.session.country} size="sm" />
                          : <span className="text-slate-400">—</span>}
                      </td>
                      <td className="py-2.5 text-slate-500 text-xs">
                        {e.session?.parking?.name ?? '—'}
                      </td>
                      <td className="py-2.5 text-slate-500 text-xs">
                        {e.createdBy === 'SYSTEM' ? (
                          <span className="text-slate-400 italic">Tizim</span>
                        ) : e.createdBy}
                      </td>
                      <td className="py-2.5 text-slate-400 text-xs max-w-48 truncate">
                        {e.payload
                          ? Object.entries(e.payload as Record<string, unknown>)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(', ')
                          : '—'}
                      </td>
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
