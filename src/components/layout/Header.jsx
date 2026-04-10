import { Bell, LogOut, Settings, User } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTriageStore } from '../../store/triage.store'
import { useAuth } from '../../features/auth/hooks/useAuth.js'

export const LiveDot = ({ count = 0, isLive = true }) => {
  return (
    <div className="flex items-center gap-2 sm:gap-3 border border-primary px-2 sm:px-3 py-1 bg-surface-container shrink-0">
      <div className="relative flex w-2 h-2 sm:h-3 sm:w-3">
        {isLive && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
        )}
        <span className={`relative inline-flex rounded-full w-2 h-2 sm:h-3 sm:w-3 ${isLive ? 'bg-green-600' : 'bg-red-600'}`}></span>
      </div>
      <span className="font-mono-technical text-[10px] sm:text-xs font-bold hidden sm:inline-block">
        {isLive ? 'SYSTEM LIVE' : 'OFFLINE'}
      </span>
      <span className="font-mono-technical text-[10px] font-bold sm:hidden">
        {isLive ? 'LIVE' : 'OFF'}
      </span>
      {count > 0 && (
        <span className="sm:ml-2 bg-[#DC2626] text-white px-1 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-mono-technical font-bold">
          {count} <span className="hidden sm:inline">PENDING</span>
        </span>
      )}
    </div>
  )
}

import { Menu } from 'lucide-react'

export const Header = ({ onMenuClick }) => {
  const { cases, connectionStatus } = useTriageStore()
  const { user, doctorProfile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const notifRef = useRef(null)
  const profileRef = useRef(null)

  let title = 'DASHBOARD'
  if (location.pathname.startsWith('/cases/')) {
    const caseId = location.pathname.split('/').pop()
    const activeCase = cases.find(c => c.id === caseId)
    title = activeCase?.patient_name ? `CASE REVIEW / ${activeCase.patient_name.toUpperCase()}` : 'CASE REVIEW'
  } else if (location.pathname === '/cases') {
    title = 'ALL CASES'
  } else if (location.pathname === '/profile') {
    title = 'PROFILE SETUP'
  } else if (location.pathname === '/analytics') {
    title = 'SYSTEM ANALYTICS'
  }

  const pendingCount = cases.filter(c => c.status === 'pending').length
  const isLive = connectionStatus === 'SUBSCRIBED' || connectionStatus === 'connected' // Fallbacks for safety
  
  const displayName = doctorProfile?.full_name || doctorProfile?.displayName || user?.user_metadata?.name || user?.user_metadata?.full_name || 'Doctor Unknown'

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <header className="h-16 fixed top-0 left-0 md:left-64 right-0 bg-surface border-b border-primary flex items-center justify-between px-4 sm:px-8 z-30">
      <div className="flex items-center gap-3">
        <button 
          onClick={onMenuClick}
          className="md:hidden border border-primary w-8 h-8 flex items-center justify-center bg-surface hover:bg-surface-container"
        >
          <Menu size={16} />
        </button>
        <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tighter truncate max-w-[150px] sm:max-w-none">
          {title}
        </h1>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-6">
        <LiveDot count={pendingCount} isLive={isLive} />
        
        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
            className={`relative w-10 h-10 border border-primary flex items-center justify-center transition-colors ${showNotifications ? 'bg-primary text-on-primary' : 'hover:bg-primary hover:text-on-primary'}`}
          >
            <Bell size={20} />
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-surface border border-primary shadow-brutal z-50">
              <div className="p-3 border-b border-primary bg-surface-container">
                <h3 className="font-mono-technical font-bold text-sm uppercase">Priority Queue</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {pendingCount > 0 ? (
                   cases.filter(c => c.status === 'pending').slice(0, 5).map(c => (
                     <div 
                       key={c.id} 
                       onClick={() => {
                         navigate(`/cases/${c.id}`);
                         setShowNotifications(false);
                       }}
                       className="p-3 border-b border-primary/20 hover:bg-surface-container cursor-pointer transition-colors"
                     >
                       <div className="flex justify-between items-center mb-1">
                         <span className="font-bold text-sm">{c.patient_name || 'Unknown Patient'}</span>
                         <span className={`text-[10px] px-2 py-0.5 border ${c.risk_level === 'HIGH' ? 'bg-red-100 text-red-700 border-red-300' : 'bg-surface border-primary'}`}>{c.risk_level}</span>
                       </div>
                       <p className="font-mono-technical text-[10px] opacity-60 line-clamp-1">{c.symptoms?.join(', ') || c.detected_symptoms?.join(', ')}</p>
                     </div>
                   ))
                ) : (
                  <div className="p-4 text-center opacity-60 font-mono-technical text-xs">NO PENDING NOTIFICATIONS</div>
                )}
              </div>
              {pendingCount > 5 && (
                <div className="p-2 border-t border-primary text-center">
                  <button onClick={() => navigate('/dashboard')} className="text-xs font-mono-technical uppercase hover:underline">View All</button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Profile Avatar */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
            className={`w-9 h-9 flex items-center justify-center font-mono-technical text-sm font-bold border transition-colors ${showProfile ? 'bg-surface text-primary border-primary' : 'bg-primary text-on-primary border-primary hover:bg-surface hover:text-primary'}`}
          >
            {initials}
          </button>

          {/* Profile Dropdown */}
          {showProfile && (
            <div className="absolute right-0 mt-2 w-64 bg-surface border border-primary shadow-brutal z-50">
               <div className="p-4 border-b border-primary bg-surface-container">
                 <p className="font-bold uppercase tracking-tighter truncate">{displayName}</p>
                 <p className="font-mono-technical text-xs opacity-60">System Administrator</p>
               </div>
               <div className="p-2 flex flex-col">
                 <button 
                   onClick={() => { navigate('/profile'); setShowProfile(false); }}
                   className="flex items-center gap-3 px-3 py-2 hover:bg-primary hover:text-on-primary transition-colors text-sm font-mono-technical uppercase text-left w-full"
                 >
                   <User size={14} /> My Profile
                 </button>
                 <button 
                   onClick={() => { navigate('/profile'); setShowProfile(false); }}
                   className="flex items-center gap-3 px-3 py-2 hover:bg-primary hover:text-on-primary transition-colors text-sm font-mono-technical uppercase text-left w-full"
                 >
                   <Settings size={14} /> Notification Settings
                 </button>
                 <div className="border-t border-primary my-1"></div>
                 <button 
                   onClick={handleLogout}
                   className="flex items-center gap-3 px-3 py-2 hover:bg-red-500 hover:text-white transition-colors text-sm font-mono-technical uppercase text-left text-red-600 w-full"
                 >
                   <LogOut size={14} /> LOGOUT
                 </button>
               </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
