import { useState, useEffect } from 'react'
import { parkingsApi, regionsApi, camerasApi, pricingApi } from '../../api'
import { useAuthStore } from '../../store/auth'
import { Parking, Region, Camera } from '../../types'
import Modal from '../../components/ui/Modal'
import toast from 'react-hot-toast'
import { Plus, ParkingCircle, Camera as CameraIcon, DollarSign, Trash2 } from 'lucide-react'

export default function ParkingsPage() {
  const { user } = useAuthStore()
  const [parkings, setParkings] = useState<Parking[]>([])
  const [regions, setRegions] = useState<Region[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [showCameras, setShowCameras] = useState<Parking | null>(null)
  const [showPricing, setShowPricing] = useState<Parking | null>(null)
  const [cameras, setCameras] = useState<Camera[]>([])

  const [form, setForm] = useState({ name: '', address: '', regionId: '' })
  const [cameraForm, setCameraForm] = useState({ name: '', type: 'ENTRY', ipAddress: '' })
  const [tierForm, setTierForm] = useState([
    { fromMinutes: 0, toMinutes: 60, price: 5000 },
    { fromMinutes: 60, toMinutes: 180, price: 10000 },
  ])

  useEffect(() => {
    const regionId = user?.role === 'REGION_ADMIN' ? user.regionId ?? undefined : undefined
    parkingsApi.getAll(regionId).then((r) => setParkings(r.data))
    if (user?.role === 'SUPER_ADMIN') regionsApi.getAll().then((r) => setRegions(r.data))
  }, [])

  const handleCreateParking = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const regionId = user?.role === 'REGION_ADMIN' ? user.regionId! : form.regionId
      await parkingsApi.create({ ...form, regionId })
      toast.success('Parking yaratildi')
      setShowCreate(false)
      const regionIdF = user?.role === 'REGION_ADMIN' ? user.regionId ?? undefined : undefined
      parkingsApi.getAll(regionIdF).then((r) => setParkings(r.data))
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Xatolik')
    }
  }

  const openCameras = async (p: Parking) => {
    setShowCameras(p)
    const res = await camerasApi.getAll(p.id)
    setCameras(res.data)
  }

  const openPricing = async (p: Parking) => {
    setShowPricing(p)
    const res = await pricingApi.getRules(p.id)
    if (res.data.length > 0) {
      setTierForm(res.data.map((t: { fromMinutes: number; toMinutes: number | null; price: number }) => ({
        fromMinutes: t.fromMinutes,
        toMinutes: t.toMinutes ?? 999999,
        price: t.price,
      })))
    }
  }

  const handleAddCamera = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!showCameras) return
    try {
      await camerasApi.create({ ...cameraForm, parkingId: showCameras.id })
      toast.success('Kamera qo\'shildi')
      setCameraForm({ name: '', type: 'ENTRY', ipAddress: '' })
      const res = await camerasApi.getAll(showCameras.id)
      setCameras(res.data)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Xatolik')
    }
  }

  const handleSavePricing = async () => {
    if (!showPricing) return
    try {
      await pricingApi.setPlan(showPricing.id, {
        tiers: tierForm.map((t) => ({
          fromMinutes: t.fromMinutes,
          toMinutes: t.toMinutes >= 999999 ? undefined : t.toMinutes,
          price: t.price,
        })),
      })
      toast.success('Narx jadvali saqlandi')
      setShowPricing(null)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Xatolik')
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Parkinglar</h1>
          <p className="text-sm text-slate-500 mt-0.5">Barcha parking obyektlari</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Yangi parking
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {parkings.map((p) => (
          <div key={p.id} className="card space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                  <ParkingCircle size={16} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{p.name}</p>
                  <p className="text-xs text-slate-500">{p.region?.name}</p>
                </div>
              </div>
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                {p.activeCount ?? 0} ichkarida
              </span>
            </div>
            {p.address && <p className="text-xs text-slate-400">{p.address}</p>}
            <div className="flex gap-2 pt-1">
              <button onClick={() => openCameras(p)}
                className="btn-secondary flex-1 flex items-center justify-center gap-1.5 text-xs">
                <CameraIcon size={13} /> Kameralar
              </button>
              <button onClick={() => openPricing(p)}
                className="btn-secondary flex-1 flex items-center justify-center gap-1.5 text-xs">
                <DollarSign size={13} /> Narxlar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Parking yaratish modal */}
      {showCreate && (
        <Modal title="Yangi parking" onClose={() => setShowCreate(false)}>
          <form onSubmit={handleCreateParking} className="space-y-4">
            <div>
              <label className="label">Nomi</label>
              <input className="input" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="label">Manzil (ixtiyoriy)</label>
              <input className="input" value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Ko'cha, shahar" />
            </div>
            {user?.role === 'SUPER_ADMIN' && (
              <div>
                <label className="label">Region</label>
                <select className="input" value={form.regionId}
                  onChange={(e) => setForm({ ...form, regionId: e.target.value })} required>
                  <option value="">— Tanlang —</option>
                  {regions.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
            )}
            <div className="flex gap-3">
              <button type="submit" className="btn-primary flex-1">Yaratish</button>
              <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Bekor</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Kameralar modal */}
      {showCameras && (
        <Modal title={`${showCameras.name} — Kameralar`} onClose={() => setShowCameras(null)}>
          <div className="space-y-4">
            {cameras.length === 0
              ? <p className="text-sm text-slate-400 text-center py-4">Kamera yo'q</p>
              : cameras.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{c.name}</p>
                    <p className="text-xs text-slate-500">{c.type} · {c.ipAddress || 'IP yo\'q'}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                    c.type === 'ENTRY' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>{c.type}</span>
                </div>
              ))
            }
            <form onSubmit={handleAddCamera} className="border-t pt-4 space-y-3">
              <p className="text-sm font-medium text-slate-700">Kamera qo'shish</p>
              <input className="input" placeholder="Kamera nomi" value={cameraForm.name}
                onChange={(e) => setCameraForm({ ...cameraForm, name: e.target.value })} required />
              <select className="input" value={cameraForm.type}
                onChange={(e) => setCameraForm({ ...cameraForm, type: e.target.value })}>
                <option value="ENTRY">ENTRY (Kirish)</option>
                <option value="EXIT">EXIT (Chiqish)</option>
              </select>
              <input className="input" placeholder="IP manzil (ixtiyoriy)" value={cameraForm.ipAddress}
                onChange={(e) => setCameraForm({ ...cameraForm, ipAddress: e.target.value })} />
              <button type="submit" className="btn-primary w-full">Qo'shish</button>
            </form>
          </div>
        </Modal>
      )}

      {/* Narx jadvali modal */}
      {showPricing && (
        <Modal title={`${showPricing.name} — Narx jadvali`} onClose={() => setShowPricing(null)}>
          <div className="space-y-3">
            <p className="text-xs text-slate-500">Vaqt daqiqalarda, narx so'mda</p>
            {tierForm.map((tier, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input type="number" className="input text-sm" value={tier.fromMinutes}
                  onChange={(e) => { const t = [...tierForm]; t[i].fromMinutes = +e.target.value; setTierForm(t) }}
                  placeholder="Dan (min)" />
                <span className="text-slate-400 text-sm">—</span>
                <input type="number" className="input text-sm" value={tier.toMinutes >= 999999 ? '' : tier.toMinutes}
                  onChange={(e) => { const t = [...tierForm]; t[i].toMinutes = e.target.value ? +e.target.value : 999999; setTierForm(t) }}
                  placeholder="Gacha (∞)" />
                <input type="number" className="input text-sm" value={tier.price}
                  onChange={(e) => { const t = [...tierForm]; t[i].price = +e.target.value; setTierForm(t) }}
                  placeholder="Narx" />
                <button onClick={() => setTierForm(tierForm.filter((_, j) => j !== i))}
                  className="text-red-400 hover:text-red-600 flex-shrink-0"><Trash2 size={15} /></button>
              </div>
            ))}
            <button onClick={() => setTierForm([...tierForm, { fromMinutes: 0, toMinutes: 999999, price: 0 }])}
              className="btn-secondary w-full text-sm">+ Qator qo'shish</button>
            <button onClick={handleSavePricing} className="btn-primary w-full">Saqlash</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
