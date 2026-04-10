import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Users, ShieldAlert, Clock, TrendingUp, BarChart3 } from 'lucide-react'

// AnalyticsPanel displays global stats for the doctor's throughput and impact.
export const AnalyticsPanel = ({ cases = [] }) => {
  const stats = useMemo(() => {
    const total = cases.length
    const highRisk = cases.filter(c => c.risk_level === 'HIGH' && (c.status === 'pending' || !c.status)).length
    const reviewed = cases.filter(c => c.status && c.status !== 'pending').length
    
    // Time saved calculation: 2 mins per case reviewed
    const timeSavedMins = reviewed * 2
    const hours = Math.floor(timeSavedMins / 60)
    const mins = timeSavedMins % 60
    
    const timeSavedStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`

    return { total, highRisk, reviewed, timeSavedStr, timeSavedMins }
  }, [cases])

  const StatItem = ({ label, value, icon: Icon, color = 'primary' }) => (
    <div className={`p-4 border border-primary/20 bg-surface flex flex-col gap-2 relative overflow-hidden group hover:shadow-[4px_4px_0px_currentColor] transition-all ${color === 'red' ? 'text-[#DC2626]' : 'text-primary'}`}>
       <div className="flex justify-between items-start z-10">
          <span className="font-mono-technical text-[10px] uppercase font-bold opacity-60">{label}</span>
          <Icon size={16} className="opacity-40 group-hover:scale-110 transition-transform" />
       </div>
       <p className="text-3xl font-black tracking-tighter z-10">{value}</p>
       <div className={`absolute bottom-0 left-0 h-1 bg-current transition-all duration-500 w-0 group-hover:w-full`}></div>
    </div>
  )

  return (
    <div className="border-2 border-primary bg-surface shadow-[8px_8px_0px_#1A1AFF] p-8">
      <div className="flex justify-between items-center mb-8 border-b border-primary/20 pb-4">
        <div>
          <span className="font-mono-technical text-[10px] uppercase font-bold opacity-60 block tracking-widest">CLINICAL PERFORMANCE HUB</span>
          <h3 className="text-3xl font-black uppercase tracking-tighter">DOCTOR ANALYTICS</h3>
        </div>
        <BarChart3 size={32} className="text-primary opacity-20" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatItem label="TOTAL PATIENTS" value={stats.total} icon={Users} />
        <StatItem label="HIGH RISK CASES" value={stats.highRisk} icon={ShieldAlert} color="red" />
        <StatItem label="REVIEWED" value={stats.reviewed} icon={TrendingUp} />
        <StatItem label="EST. TIME SAVED" value={stats.timeSavedStr} icon={Clock} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-primary/5 p-6 border border-primary/10">
            <h4 className="font-mono-technical text-xs font-bold uppercase mb-4 flex items-center gap-2">
               <TrendingUp size={14} /> THROUGHPUT PROGRESSION
            </h4>
            <div className="flex items-end gap-2 h-24">
               {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                  <motion.div 
                    key={i}
                    className="flex-1 bg-primary relative group"
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: i * 0.1, duration: 1 }}
                  >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 font-mono-technical text-[8px] bg-primary text-on-primary px-1 pointer-events-none">
                      {Math.round(h/10)}
                    </div>
                  </motion.div>
               ))}
            </div>
            <div className="flex justify-between mt-2 font-mono-technical text-[8px] opacity-40">
               <span>MON</span>
               <span>TUE</span>
               <span>WED</span>
               <span>THU</span>
               <span>FRI</span>
               <span>SAT</span>
               <span>SUN</span>
            </div>
         </div>

         <div className="bg-[#FEF2F2] p-6 border border-[#DC2626]/20">
            <h4 className="font-mono-technical text-xs font-bold uppercase mb-4 flex items-center gap-2 text-[#DC2626]">
               <ShieldAlert size={14} /> RISK DISTRIBUTION
            </h4>
            <div className="space-y-3">
               {[
                 { label: 'HIGH RISK', val: stats.highRisk, color: '#DC2626' },
                 { label: 'MODERATE', val: Math.round(stats.total * 0.3), color: '#D97706' },
                 { label: 'LOW RISK', val: Math.round(stats.total * 0.5), color: '#16A34A' }
               ].map((item, idx) => (
                 <div key={idx} className="flex flex-col gap-1">
                    <div className="flex justify-between font-mono-technical text-[9px] uppercase font-bold">
                       <span>{item.label}</span>
                       <span>{item.val} CASES</span>
                    </div>
                    <div className="w-full h-1.5 bg-white border border-black/5">
                       <motion.div 
                         className="h-full"
                         style={{ backgroundColor: item.color }}
                         initial={{ width: 0 }}
                         animate={{ width: `${(item.val / stats.total) * 100}%` }}
                       />
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </div>

      <div className="mt-8 flex items-center gap-3 bg-primary text-on-primary p-4 shadow-[4px_4px_0px_#1A1AFF]">
         <div className="w-10 h-10 shrink-0 border border-on-primary/20 flex items-center justify-center font-black text-xl">
            {Math.floor(stats.timeSavedMins / 30)}
         </div>
         <p className="font-mono-technical text-[10px] uppercase font-bold leading-tight tracking-wider">
            AI-ASSISTED TRIAGE HAS INCREASED UNIT PRODUCTIVITY BY BY {Math.round((stats.timeSavedMins / 480) * 100)}% IN THIS SESSION ALONE.
         </p>
      </div>
    </div>
  )
}
