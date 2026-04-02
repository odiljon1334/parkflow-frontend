import { useState, useEffect } from 'react'
import { authApi, regionsApi, parkingsApi } from '../../api'
import { useAuthStore } from '../../store/auth'
import { Region, Parking } from '../../types'
import Modal from '../../components/ui/Modal'
import toast from 'react-hot-toast'
import { UserPlus } from 'lucide-react'
import { ROLE_LABELS, ROLE_COLORS } from '../../utils'

const ALL_ROLES = ['SUPER_ADMIN', 'REGION_ADMIN', 'OPERATOR']

export default function UsersPage() {
  const { user } = useAuthStore()
  const [showModal, setShowModal] = useState(false)
  const [regions, setRegions] = useState<Region[]>([])
  const [parkings, setParkings] = useState<Parking[]>([])
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    name: '', username: '', password: '',
    role: 'OPERATOR', regionId: '', parkingId: '',
  })

  const availableRoles = user?.role === 'SUPER_ADMIN'
    ? ALL_ROLES
    : ['OPERATOR'] // Region admin faqat operator yarata oladi

  useEffect(() => {
    regionsApi.getAll().then((r) => setRegions(r.data))
  }, [])

  useEffect(() => {
    if (form.regionId) {
      parkingsApi.getAll(form.regionId).then((r) => setParkings(r.data))
    } else {
      setParkings([])
      setForm((f) => ({ ...f, parkingId: '' }))
    }
  }, [form.regionId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authApi.createUser({
        name: form.name,
        username: form.username,
        password: form.password,
        role: form.role,
        regionId: form.regionId || undefined,
        parkingId: form.parkingId || undefined,
      })
      toast.success('Foydalanuvchi yaratildi')
      setShowModal(false)
      setForm({ name: '', username: '', password: '', role: 'OPERATOR', regionId: '', parkingId: '' })
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Xatolik')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Foydalanuvchilar</h1>
          <p className="text-sm text-slate-500 mt-0.5">Tizim foydalanuvchilarini boshqarish</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <UserPlus size={16} />
          Yangi foydalanuvchi
        </button>
      </div>

      {/* Rol tushuntirishi */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { role: 'SUPER_ADMIN', desc: 'Barcha region va parkinglarni boshqaradi. To\'liq huquq.' },
          { role: 'REGION_ADMIN', desc: 'Faqat o\'z regionidagi parkinglarni boshqaradi.' },
          { role: 'OPERATOR', desc: 'Faqat o\'z parkingida kirish/chiqish qiladi.' },
        ].map(({ role, desc }) => (
          <div key={role} className="card">
            <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-2 ${ROLE_COLORS[role]}`}>
              {ROLE_LABELS[role]}
            </span>
            <p className="text-sm text-slate-500">{desc}</p>
          </div>
        ))}
      </div>

      {/* Yangi user modal */}
      {showModal && (
        <Modal title="Yangi foydalanuvchi" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Ism Familiya</label>
              <input className="input" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ali Valiyev" required />
            </div>
            <div>
              <label className="label">Username</label>
              <input className="input" value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="ali_valiyev" required />
            </div>
            <div>
              <label className="label">Parol</label>
              <input className="input" type="password" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Kamida 4 ta belgi" required minLength={4} />
            </div>
            <div>
              <label className="label">Rol</label>
              <select className="input" value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}>
                {availableRoles.map((r) => (
                  <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                ))}
              </select>
            </div>

            {(form.role === 'REGION_ADMIN' || form.role === 'OPERATOR') && (
              <div>
                <label className="label">Region</label>
                <select className="input" value={form.regionId}
                  onChange={(e) => setForm({ ...form, regionId: e.target.value })}>
                  <option value="">— Tanlang —</option>
                  {regions.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
            )}

            {form.role === 'OPERATOR' && form.regionId && (
              <div>
                <label className="label">Parking</label>
                <select className="input" value={form.parkingId}
                  onChange={(e) => setForm({ ...form, parkingId: e.target.value })}>
                  <option value="">— Tanlang —</option>
                  {parkings.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary flex-1" disabled={loading}>
                {loading ? 'Saqlanmoqda...' : 'Yaratish'}
              </button>
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                Bekor qilish
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
