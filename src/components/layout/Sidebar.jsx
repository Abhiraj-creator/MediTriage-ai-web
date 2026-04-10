import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, Activity, User, LogOut, Home } from 'lucide-react'
import { useAuth } from '../../features/auth/hooks/useAuth.js'
import { Logo } from '../common/Logo'

export const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { signOut, user, doctorProfile } = useAuth()
  
  const navItems = [
    { label: 'DASHBOARD', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { label: 'CASES', path: '/cases', icon: <Activity size={20} /> },
    { label: 'ANALYTICS', path: '/analytics', icon: <Users size={20} /> },
    { label: 'PROFILE', path: '/profile', icon: <User size={20} /> },
  ]

  const displayName = doctorProfile?.full_name || doctorProfile?.name || user?.user_metadata?.name || user?.user_metadata?.full_name || 'DOCTOR'
  const displaySpecialization = doctorProfile?.specialization || user?.user_metadata?.specialization || doctorProfile?.role || 'CLINICIAN'

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <aside className={`w-64 fixed left-0 top-0 h-screen bg-surface border-r border-primary flex flex-col z-40 overflow-y-auto transform transition-transform duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* Brand */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-primary flex-shrink-0">
        <div className="flex items-center gap-2">
          <Logo className="w-6 h-6 shrink-0" pathClassName="fill-primary" />
          <span className="font-mono-technical text-lg font-bold tracking-tighter truncate">MEDITRIAGE</span>
        </div>
        <button className="md:hidden opacity-60 hover:opacity-100" onClick={onClose}>
           ✕
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 py-8 flex flex-col gap-2 px-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path))
          
          return (
            <Link
              key={item.label}
              to={item.path}
              onClick={onClose}
              className={`
                group flex items-center gap-3 px-4 py-3 font-mono-technical text-sm transition-all
                ${isActive ? 'bg-primary text-on-primary shadow-brutal translate-x-1 translate-y-1' : 'text-primary hover:bg-surface-container hover:border hover:border-primary'}
              `}
            >
              {item.icon}
              {item.label}
            </Link>
          )
        })}

        {/* Divider + Landing Page link */}
        <div className="border-t border-primary/20 my-2" />
        <Link
          to="/"
          onClick={onClose}
          className="group flex items-center gap-3 px-4 py-3 font-mono-technical text-xs text-primary/60 hover:text-primary hover:bg-surface-container hover:border hover:border-primary transition-all"
        >
          <Home size={16} />
          HOME / LANDING
        </Link>
      </nav>

      {/* Doctor Info & Logout */}
      <div className="border-t border-primary p-4 flex-shrink-0">
        <div className="flex items-center gap-3 mb-4 max-w-full overflow-hidden">
          <div className="w-10 h-10 border border-primary flex-shrink-0 bg-primary text-on-primary flex items-center justify-center font-mono-technical font-bold">
            {displayName.substring(0,2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="truncate font-bold text-sm tracking-tighter uppercase">{displayName}</div>
            <div className="truncate font-mono-technical text-[10px] opacity-60 uppercase">{displaySpecialization}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 border border-primary px-4 py-2 font-mono-technical text-xs hover:bg-primary hover:text-on-primary transition-colors"
        >
          <LogOut size={16} />
          END SESSION
        </button>
      </div>
    </aside>
  )
}
