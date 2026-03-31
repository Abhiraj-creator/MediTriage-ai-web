import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, Activity, Settings, LogOut, HeartPulse } from 'lucide-react'
import { useAuth } from '../../features/auth/hooks/useAuth.js'

export const Sidebar = () => {
  const location = useLocation()
  const { signOut, doctorProfile } = useAuth()
  
  const navItems = [
    { label: 'DASHBOARD', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { label: 'CASES', path: '/cases/active', icon: <Activity size={20} /> },
    { label: 'ANALYTICS', path: '/analytics', icon: <Users size={20} /> },
    { label: 'SETTINGS', path: '/settings', icon: <Settings size={20} /> },
  ]

  return (
    <aside className="w-64 fixed left-0 top-0 h-screen bg-surface border-r border-primary flex flex-col z-40">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-primary">
        <HeartPulse className="text-primary mr-3" size={24} />
        <span className="font-mono-technical text-lg font-bold tracking-tighter">MEDITRIAGE</span>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 py-8 flex flex-col gap-2 px-4">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path.split('/')[1] ? `/${item.path.split('/')[1]}` : item.path)
          
          return (
            <Link
              key={item.label}
              to={item.path}
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
      </nav>

      {/* Doctor Info & Logout */}
      <div className="border-t border-primary p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 border border-primary bg-primary text-on-primary flex items-center justify-center font-mono-technical font-bold">
            {doctorProfile?.name?.substring(0,2).toUpperCase() || 'DR'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="truncate font-bold text-sm tracking-tighter uppercase">{doctorProfile?.name || 'Loading...'}</div>
            <div className="truncate font-mono-technical text-[10px] opacity-60 uppercase">{doctorProfile?.specialization || 'CLINICIAN'}</div>
          </div>
        </div>
        <button
          onClick={signOut}
          className="w-full flex items-center justify-center gap-2 border border-primary px-4 py-2 font-mono-technical text-xs hover:bg-primary hover:text-on-primary transition-colors"
        >
          <LogOut size={16} />
          END SESSION
        </button>
      </div>
    </aside>
  )
}
