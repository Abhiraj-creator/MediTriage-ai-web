import { useMemo, useState, useEffect, useCallback } from 'react'
import { CaseQueue } from '../components/CaseQueue'
import { Activity, Clock, ShieldAlert, CheckSquare, RefreshCw } from 'lucide-react'
import { useTriageStore } from '../../../store/triage.store'
import { useAuth } from '../../../features/auth/hooks/useAuth.js'
import { triageService } from '../services/triage.service.js'
import { AnalyticsPanel } from '../../dashboard/components/AnalyticsPanel'
import { supabase } from '../../../config/supabase.js'


// Brutalist Stat Card
const StatCard = ({ title, value, icon, color = 'primary' }) => {
  const isRed = color === 'red'
  const isGreen = color === 'green'
  
  const borderClass = isRed ? 'border-[#DC2626]' : isGreen ? 'border-[#16A34A]' : 'border-primary'
  const textClass = isRed ? 'text-[#DC2626]' : isGreen ? 'text-[#16A34A]' : 'text-primary'
  const shadowHover = isRed ? 'hover:shadow-[8px_8px_0px_#DC2626]' : isGreen ? 'hover:shadow-[8px_8px_0px_#16A34A]' : 'hover:shadow-[8px_8px_0px_var(--color-primary)]'

  return (
    <div className={`
      relative bg-surface border p-6 flex flex-col justify-between overflow-hidden group
      ${borderClass} shadow-brutal hover:-translate-y-2 transition-all duration-300 ${shadowHover}
    `}>
      {/* Background Animated Effect */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none halftone-overlay ${isRed ? 'bg-red-500' : isGreen ? 'bg-green-500' : 'bg-primary'}`}></div>
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <span className="font-mono-technical text-[10px] opacity-60 uppercase group-hover:tracking-wider transition-all duration-300">{title}</span>
        <div className={`${textClass} opacity-80 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-300`}>
          {icon}
        </div>
      </div>
      <div className="relative z-10 flex items-end justify-between">
        <span className={`text-5xl font-black font-mono-technical ${textClass}`}>{value}</span>
        <div className={`w-0 h-1 transition-all duration-500 group-hover:w-12 ${isRed ? 'bg-[#DC2626]' : isGreen ? 'bg-[#16A34A]' : 'bg-primary'}`}></div>
      </div>
    </div>
  )
}

export const DashboardPage = () => {
  const { cases, isLoading } = useTriageStore()
  const { user, doctorProfile } = useAuth()

  const [currentTime, setCurrentTime] = useState(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleRefresh = useCallback(async () => {
    if (!doctorProfile?.id) return
    
    setIsRefreshing(true)
    useTriageStore.getState().setLoading(true)
    try {
      const data = await triageService.getCases(doctorProfile.id)
      if (data) {
        useTriageStore.getState().setCases(data)
      }
    } catch (e) {
      console.warn('Refresh failed, keeping current store state', e)
    } finally {
      setIsRefreshing(false)
      useTriageStore.getState().setLoading(false)
    }
  }, [doctorProfile?.id])

  // Fetch on initial mount — always get latest from Supabase when handleRefresh (and its dependent profile) is ready
  useEffect(() => {
    handleRefresh()
  }, [handleRefresh])

  // Real-time listener for incoming triage cases
  useEffect(() => {
    if (!doctorProfile?.id) return

    const subscription = triageService.subscribeToCases(doctorProfile.id, (payload, type) => {
      const store = useTriageStore.getState()
      if (type === 'INSERT') {
        store.addCase(payload)
      } else if (type === 'UPDATE') {
        store.updateCase(payload)
      } else if (type === 'DELETE') {
        store.removeCase(payload.id)
      }
    })

    return () => {
      if (subscription) supabase.removeChannel(subscription)
    }
  }, [doctorProfile?.id])

  // Compute stats from real store data
  const stats = useMemo(() => {
    // We want to count across all cases regardless of status for "TOTAL"
    const total = cases.length
    const highRisk = cases.filter(c => c.risk_level === 'HIGH' && (c.status === 'pending' || !c.status)).length
    const reviewed = cases.filter(c => c.status && c.status !== 'pending').length
    const pending = cases.filter(c => !c.status || c.status === 'pending').length
    return { total, highRisk, reviewed, pending }
  }, [cases])

  // Build greeting based on IST time
  const rawName = doctorProfile?.full_name || doctorProfile?.name || user?.user_metadata?.name || user?.user_metadata?.full_name || 'Doctor'
  
  // Create an IST date object
  const istTime = new Date(currentTime.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }))
  const hour = istTime.getHours()
  const greeting = hour < 12 ? 'GOOD MORNING' : hour < 17 ? 'GOOD AFTERNOON' : 'GOOD EVENING'
  const displayTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  // Clean the name: Remove "Dr.", strip digits if it fell back to email, and grab the first word.
  let cleanName = rawName.replace(/^Dr\.?\s*/i, '').replace(/[0-9]/g, '').trim()
  let displayDoctorText = (cleanName.split(/(?=[A-Z])|[\s_-]+/)[0] || 'Doctor').toUpperCase()

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* Top Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-primary pb-8 relative">
        <div className="flex-1 min-w-0 pr-4">
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-tight break-words">
            {greeting},<br />{displayDoctorText}.
          </h2>
          <p className="mt-4 font-mono-technical text-sm opacity-80 flex items-center gap-2">
            {stats.highRisk === 0 && stats.pending > 0 ? (
              <>
                <span className="w-2 h-2 bg-[#D97706] inline-block mb-0.5"></span>
                {stats.pending} CASE{stats.pending !== 1 ? 'S' : ''} AWAITING REVIEW
              </>
            ) : stats.highRisk === 0 && stats.pending === 0 ? (
              <>
                <span className="w-2 h-2 bg-[#16A34A] inline-block mb-0.5"></span>
                ALL CASES REVIEWED — SYSTEM CLEAR
              </>
            ) : (
                <span className="opacity-0 hidden"></span>
            )}
          </p>
        </div>
        
        {/* Urgent Case Highlight on the Right Side */}
        {stats.highRisk > 0 && (
          <div className="mt-6 md:mt-0 flex-1 flex ">
            <div className="bg-red-50 border-2 border-[#DC2626] p-4 flex items-center gap-4 shadow-[4px_4px_0px_#DC2626] animate-pulse">
              <ShieldAlert className="text-[#DC2626] w-8 h-8 animate-bounce" />
              <div>
                <p className="font-mono-technical text-xs text-[#DC2626] font-bold uppercase tracking-wider mb-1">Critical Alert</p>
                <p className="font-bold text-[#DC2626] uppercase">
                  {stats.highRisk} URGENT CASE{stats.highRisk !== 1 ? 'S' : ''} REQUIRING REVIEW
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 md:mt-0 flex items-center gap-2 md:gap-4 flex-row md:flex-row w-full md:w-auto justify-start md:justify-end border-t md:border-t-0 border-primary/10 pt-6 md:pt-0">
          <button 
            onClick={handleRefresh}
            className="font-mono-technical text-[10px] md:text-xs border border-primary px-3 py-2 hover:bg-primary hover:text-on-primary transition-colors flex items-center gap-2 bg-surface z-10 shrink-0"
          >
            <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} /> REFRESH
          </button>
          <div className="font-mono-technical text-[10px] md:text-xs border border-primary px-4 py-2 bg-on-primary z-10 whitespace-nowrap overflow-hidden text-ellipsis">
            SESSION: {displayTime}
          </div>
        </div>
      </div>

      {/* Grid Stats — Replaced with Advanced Analytics Panel */}
      <div className="mb-16">
        <AnalyticsPanel cases={cases} />
      </div>

      {/* Case Queue Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-8 border-b border-primary pb-4">
          <h3 className="text-2xl font-black uppercase tracking-tighter">
            LIVE PATIENT QUEUE
          </h3>
          <span className="font-mono-technical text-xs opacity-60">REALTIME: ACTIVE</span>
        </div>
        
        <CaseQueue />
      </div>
    </div>
  )
}
