import { useState } from 'react'
import { useAuthStore } from '../../store/auth'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { User, Lock, Info } from 'lucide-react'
import { ROLE_LABELS, ROLE_COLORS } from '../../utils'

export default function SettingsPage() {
  const { user } = useAuthStore()
  const [tab, setTab] = useState<'profile' | 'password'>('profile')

  const [passForm, setPassForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passForm.newPassword !== passForm.confirmPassword) {
      toast.error('Yangi parollar mos kelmaydi')
      return
    }
    if (passForm.newPassword.length < 4) {
      toast.error('Parol kamida 4 ta belgi bo\'lishi kerak')
      return
    }
    setLoading(true)
    try {
      await api.put('/auth/change-password', {
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword,
      })
      toast.success('Parol muvaffaqiyatli o\'zgartirildi')
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Xatolik yuz berdi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Sozlamalar</h1>
        <p className="text-sm text-slate-500 mt-0.5">Profil va xavfsizlik</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit mb-6">
        <button
          onClick={() => setTab('profile')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${
            tab === 'profile' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Profil
        </button>
        <button
          onClick={() => setTab('password')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${
            tab === 'password' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Parol o'zgartirish
        </button>
      </div>

      {/* Profil tab */}
      {tab === 'profile' && (
        <div className="card space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
              {user?.fullName?.[0]?.toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">{user?.fullName}</h2>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${ROLE_COLORS[user?.role ?? '']}`}>
                {ROLE_LABELS[user?.role ?? '']}
              </span>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-3">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <User size={16} className="text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Username</p>
                <p className="text-sm font-medium text-slate-800">{user?.username}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <Info size={16} className="text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Rol</p>
                <p className="text-sm font-medium text-slate-800">{ROLE_LABELS[user?.role ?? '']}</p>
              </div>
            </div>

            {user?.region && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <Info size={16} className="text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Region</p>
                  <p className="text-sm font-medium text-slate-800">{user.region.name}</p>
                </div>
              </div>
            )}

            {user?.parking && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <Info size={16} className="text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Parking</p>
                  <p className="text-sm font-medium text-slate-800">{user.parking.name}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Parol tab */}
      {tab === 'password' && (
        <div className="card">
          <div className="flex items-center gap-2 mb-5">
            <Lock size={18} className="text-slate-600" />
            <h2 className="font-semibold text-slate-800">Parolni o'zgartirish</h2>
          </div>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="label">Joriy parol</label>
              <input
                type="password"
                className="input"
                value={passForm.currentPassword}
                onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })}
                placeholder="••••••••"
                required
              />
            </div>
            <div>
              <label className="label">Yangi parol</label>
              <input
                type="password"
                className="input"
                value={passForm.newPassword}
                onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
                placeholder="••••••••"
                required
                minLength={4}
              />
            </div>
            <div>
              <label className="label">Yangi parolni tasdiqlang</label>
              <input
                type="password"
                className="input"
                value={passForm.confirmPassword}
                onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })}
                placeholder="••••••••"
                required
                minLength={4}
              />
            </div>
            <button type="submit" className="btn-primary w-full py-2.5" disabled={loading}>
              {loading ? 'Saqlanmoqda...' : 'Parolni o\'zgartirish'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
