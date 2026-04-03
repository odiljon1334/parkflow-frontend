import { useState, useEffect } from 'react'
import { regionsApi } from '../../api'
import { Region } from '../../types'
import Modal from '../../components/ui/Modal'
import toast from 'react-hot-toast'
import { Plus, MapPin, Pencil, Trash2 } from 'lucide-react'

export default function RegionsPage() {
  const [regions, setRegions] = useState<Region[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Region | null>(null)
  const [name, setName] = useState('')

  useEffect(() => { load() }, [])

  const load = () => regionsApi.getAll().then((r) => setRegions(r.data))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editing) {
        await regionsApi.update(editing.id, { name })
        toast.success('Yangilandi')
      } else {
        await regionsApi.create({ name })
        toast.success('Region yaratildi')
      }
      setShowModal(false)
      setEditing(null)
      setName('')
      load()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Xatolik')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Rostdan o\'chirmoqchimisiz?')) return
    try {
      await regionsApi.remove(id)
      toast.success('O\'chirildi')
      load()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'O\'chirib bo\'lmadi')
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Regionlar</h1>
          <p className="text-sm text-slate-500 mt-0.5">Viloyat va shaharlar</p>
        </div>
        <button onClick={() => { setShowModal(true); setEditing(null); setName('') }}
          className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Yangi region
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {regions.map((r) => (
          <div key={r.id} className="card flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                <MapPin size={16} className="text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">{r.name}</p>
                <p className="text-xs text-slate-500">{r._count?.parkings ?? 0} ta parking</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => { setEditing(r); setName(r.name); setShowModal(true) }}
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                <Pencil size={15} />
              </button>
              <button onClick={() => handleDelete(r.id)}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <Modal title={editing ? 'Regionni tahrirlash' : 'Yangi region'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Region nomi</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Toshkent, Samarqand..." autoFocus required />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary flex-1">
                {editing ? 'Saqlash' : 'Yaratish'}
              </button>
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                Bekor
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
