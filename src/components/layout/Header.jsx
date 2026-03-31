import { Bell } from 'lucide-react'

export const LiveDot = ({ count = 0, isLive = true }) => {
  return (
    <div className="flex items-center gap-3 border border-primary px-3 py-1 bg-surface-container">
      <div className="relative flex h-3 w-3">
        {isLive && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
        )}
        <span className={`relative inline-flex rounded-full h-3 w-3 ${isLive ? 'bg-green-600' : 'bg-red-600'}`}></span>
      </div>
      <span className="font-mono-technical text-xs font-bold">
        {isLive ? 'SYSTEM LIVE' : 'OFFLINE'}
      </span>
      {count > 0 && (
        <span className="ml-2 bg-primary text-on-primary px-2 py-0.5 text-[10px] font-mono-technical">
          {count} NEW
        </span>
      )}
    </div>
  )
}

export const Header = ({ title = 'DASHBOARD' }) => {
  return (
    <header className="h-16 fixed top-0 left-64 right-0 bg-surface border-b border-primary flex items-center justify-between px-8 z-30">
      <h1 className="text-2xl font-black uppercase tracking-tighter">
        {title}
      </h1>
      
      <div className="flex items-center gap-6">
        <LiveDot count={3} isLive={true} />
        
        <button className="relative w-10 h-10 border border-primary flex items-center justify-center hover:bg-primary hover:text-on-primary transition-colors">
          <Bell size={20} />
          {/* Notification Badge */}
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
          </span>
        </button>
      </div>
    </header>
  )
}
