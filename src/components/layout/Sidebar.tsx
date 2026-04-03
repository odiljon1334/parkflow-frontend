import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/auth'
import {
  LayoutDashboard, Car, BarChart2, Users,
  MapPin, ParkingCircle, Settings, LogOut, History,
} from 'lucide-react'

const links = [
  { to: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard',        roles: ['SUPER_ADMIN', 'REGION_ADMIN', 'OPERATOR'] },
  { to: '/vehicles',  icon: <Car size={18} />,             label: 'Kirish/Chiqish',   roles: ['SUPER_ADMIN', 'REGION_ADMIN', 'OPERATOR'] },
  { to: '/reports',   icon: <BarChart2 size={18} />,       label: 'Hisobotlar',       roles: ['SUPER_ADMIN', 'REGION_ADMIN', 'OPERATOR'] },
  { to: '/audit',     icon: <History size={18} />,         label: 'Audit Log',        roles: ['SUPER_ADMIN', 'REGION_ADMIN'] },
  { to: '/users',     icon: <Users size={18} />,           label: 'Foydalanuvchilar', roles: ['SUPER_ADMIN', 'REGION_ADMIN'] },
  { to: '/regions',   icon: <MapPin size={18} />,          label: 'Regionlar',        roles: ['SUPER_ADMIN'] },
  { to: '/parkings',  icon: <ParkingCircle size={18} />,   label: 'Parkinglar',       roles: ['SUPER_ADMIN', 'REGION_ADMIN'] },
  { to: '/settings',  icon: <Settings size={18} />,        label: 'Sozlamalar',       roles: ['SUPER_ADMIN', 'REGION_ADMIN', 'OPERATOR'] },
]

export default function Sidebar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const visibleLinks = links.filter((l) => l.roles.includes(user?.role || ''))

  return (
    <aside className="w-60 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <span className="font-bold text-slate-800 text-lg">ParkFlow</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {visibleLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
              }`
            }
          >
            {link.icon}
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-slate-100">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {user?.fullName?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800 truncate">{user?.fullName}</p>
            <p className="text-xs text-slate-500 truncate">
              {user?.role === 'SUPER_ADMIN' ? 'Super Admin' : user?.role === 'REGION_ADMIN' ? 'Region Admin' : 'Operator'}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition"
        >
          <LogOut size={16} />
          Chiqish
        </button>
      </div>
    </aside>
  )
}
