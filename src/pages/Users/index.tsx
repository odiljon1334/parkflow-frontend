import { useState, useEffect } from 'react'
import { authApi, regionsApi, parkingsApi } from '../../api'
import { useAuthStore } from '../../store/auth'
import { Region, Parking } from '../../types'
import Modal from '../../components/ui/Modal'
import toast from 'react-hot-toast'
import { Plus, UserCheck, UserX, Users } from 'lucide-react'
import { ROLE_LABELS, ROLE_COLORS } from '../../utils'

interface UserItem {
  id: string
  fullName: string
  username: string
  phone?: string
  role: string
  isActive: boolean
  createdAt: string
  region?: { id: string; name: string }
  parking?: { id: string; name: string }
}

export default function UsersPage() {
  const { user: me } = useAuthStore()
  const [users, setUsers]           = useState<UserItem[]>([])
  const [regions, setRegions]       = useState<Region[]>([])
  const [parkings, setParkings]     = useState<Parking[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    name: '', username: '', phone: '', password: '',
    role: 'OPERATOR', regionId: '', parkingId: '',
  })

  useEffect(() => {
    loadUsers()
    if (me?.role === 'SUPER_ADMIN') {
      regionsApi.getAll().then((r) => setRegions(r.data))
    }
  }, [])

  useEffect(() => {
    if (form.regionId) {
      parkingsApi.getAll(form.regionId).then((r) => setParkings(r.data))
    } else {
      setParkings([])
    }
  }, [form.regionId])

  const loadUsers = () =>
    authApi.getUsers().then((r) => setUsers(r.data)).catch(() => {})

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await authApi.createUser({
        name:      form.name,
        username:  form.username,
        phone:     form.phone || undefined,
        password:  form.password,
        role:      form.role,
        regionId:  form.regionId || undefined,
        parkingId: form.parkingId || undefined,
      })
      toast.success('Foydalanuvchi yaratildi')
      setShowCreate(false)
      setForm({ name: '', username: '', phone: '', password: '', role: 'OPERATOR', regionId: '', parkingId: '' })
      loadUsers()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Xatolik yuz berdi')
    } finally {
      setSubmitting(false)
    }
  }

  const activeCount   = users.filter((u) => u.isActive).length
  const inactiveCount = users.filter((u) => !u.isActive).length

  const allowedRoles = me?.role === 'SUPER_ADMIN'
    ? ['SUPER_ADMIN', 'REGION_ADMIN', 'PARKING_ADMIN', 'OPERATOR']
    : ['PARKING_ADMIN', 'OPERATOR']

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Foydalanuvchilar</h1>
          <p className="text-sm text-slate-500 mt-0.5">Tizim foydalanuvchilari boshqaruvi</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Yangi foydalanuvchi
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
            <Users size={18} className="text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Jami</p>
            <p className="text-2xl font-bold text-slate-800">{users.length}</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
            <UserCheck size={18} className="text-green-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Faol</p>
            <p className="text-2xl font-bold text-slate-800">{activeCount}</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
            <UserX size={18} className="text-red-500" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Nofaol</p>
            <p className="text-2xl font-bold text-slate-800">{inactiveCount}</p>
          </div>
        </div>
      </div>

      {/* Jadval */}
      <div className="card">
        {users.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <p className="text-3xl mb-2">👥</p>
            <p className="text-sm">Foydalanuvchilar yo'q</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-100">
                  <th className="pb-3 font-medium">Foydalanuvchi</th>
                  <th className="pb-3 font-medium">Username</th>
                  <th className="pb-3 font-medium">Rol</th>
                  <th className="pb-3 font-medium">Region / Parking</th>
                  <th className="pb-3 font-medium">Holat</th>
                  <th className="pb-3 font-medium">Sana</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition">
                    <td className="py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-sm font-bold shrink-0">
                          {u.fullName?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{u.fullName}</p>
                          {u.phone && <p className="text-xs text-slate-400">{u.phone}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 font-mono text-slate-600 text-xs">{u.username}</td>
                    <td className="py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        ROLE_COLORS[u.role] ?? 'bg-slate-100 text-slate-600'
                      }`}>
                        {ROLE_LABELS[u.role] ?? u.role}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500 text-xs">
                      {u.region?.name ?? u.parking?.name ?? '—'}
                    </td>
                    <td className="py-3">
                      {u.isActive
                        ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Faol</span>
                        : <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Nofaol</span>
                      }
                    </td>
                    <td className="py-3 text-slate-400 text-xs">
                      {new Date(u.createdAt).toLocaleDateString('uz-UZ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Yaratish modali */}
      {showCreate && (
        <Modal title="Yangi foydalanuvchi" onClose={() => setShowCreate(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">To'liq ism</label>
                <input className="input" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Sardor Toshmatov" required />
              </div>
              <div>
                <label className="label">Username</label>
                <input className="input" value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase() })}
                  placeholder="sardor01" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Telefon (ixtiyoriy)</label>
                <input className="input" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+998901234567" />
              </div>
              <div>
                <label className="label">Parol</label>
                <input type="password" className="input" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••" required minLength={4} />
              </div>
            </div>

            <div>
              <label className="label">Rol</label>
              <select className="input" value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}>
                {allowedRoles.map((r) => (
                  <option key={r} value={r}>{ROLE_LABELS[r] ?? r}</option>
                ))}
              </select>
            </div>

            {me?.role === 'SUPER_ADMIN' && (
              <div>
                <label className="label">Region (ixtiyoriy)</label>
                <select className="input" value={form.regionId}
                  onChange={(e) => setForm({ ...form, regionId: e.target.value, parkingId: '' })}>
                  <option value="">— Tanlang —</option>
                  {regions.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
            )}

            {(form.role === 'PARKING_ADMIN' || form.role === 'OPERATOR') && parkings.length > 0 && (
              <div>
                <label className="label">Parking (ixtiyoriy)</label>
                <select className="input" value={form.parkingId}
                  onChange={(e) => setForm({ ...form, parkingId: e.target.value })}>
                  <option value="">— Tanlang —</option>
                  {parkings.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button type="submit" className="btn-primary flex-1" disabled={submitting}>
                {submitting ? 'Saqlanmoqda...' : 'Yaratish'}
              </button>
              <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1">
                Bekor
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
