import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../../api'
import { useAuthStore } from '../../store/auth'
import toast from 'react-hot-toast'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await authApi.login(username, password)
      setAuth(res.data.user, res.data.token)
      toast.success(`Xush kelibsiz, ${res.data.user.name}!`)
      navigate('/dashboard')
    } catch {
      toast.error('Username yoki parol noto\'g\'ri')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">P</span>
          </div>
          <span className="font-bold text-slate-800 text-2xl">ParkFlow</span>
        </div>

        <h1 className="text-xl font-semibold text-slate-800 mb-1">Kirish</h1>
        <p className="text-sm text-slate-500 mb-6">Hisobingizga kiring</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Username</label>
            <input
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              autoFocus
              required
            />
          </div>
          <div>
            <label className="label">Parol</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="btn-primary w-full py-2.5 mt-2"
            disabled={loading}
          >
            {loading ? 'Kirish...' : 'Kirish'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          ParkFlow v1.0 — Avto Parking Tizimi
        </p>
      </div>
    </div>
  )
}
