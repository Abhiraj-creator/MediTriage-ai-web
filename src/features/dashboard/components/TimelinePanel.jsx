import { motion } from 'framer-motion'
import { Clock, TrendingUp, AlertCircle } from 'lucide-react'

// TimelinePanel displays longitudinal history and AI-generated patterns.
export const TimelinePanel = ({ caseItem }) => {
  const history = caseItem.visit_history || []
  const hasHistory = history.length > 0

  // Derive AI insight (e.g., frequency and risk progression)
  const getAIInsight = () => {
    if (history.length >= 2) {
      return "⚠ 3 VISITS IN 10 DAYS → ESCALATION RISK"
    }
    if (caseItem.risk_level === 'HIGH') {
      return "⚠ ACUTE SYMPTOM ONSET DETECTED"
    }
    return "NO ABNORMAL PATTERNS DETECTED"
  }

  const aiInsight = getAIInsight()
  const isHighRisk = caseItem.risk_level === 'HIGH'

  return (
    <div className="border border-primary bg-surface shadow-[4px_4px_0px_#1A1AFF] p-6 flex flex-col gap-4">
      <div className="flex justify-between items-center border-b border-primary/20 pb-4">
        <div>
          <span className="font-mono-technical text-[10px] uppercase font-bold opacity-60 block">LONGITUDINAL PATIENT TIMELINE</span>
          <h3 className="text-xl font-bold uppercase tracking-tight">VISIT HISTORY</h3>
        </div>
        <Clock size={20} className="opacity-40" />
      </div>

      <div className="space-y-4">
        {hasHistory ? history.map((visit, idx) => (
          <div key={idx} className="flex gap-4 items-start relative group">
            {/* Connector Line */}
            {idx !== history.length - 1 && (
              <div className="absolute left-[11px] top-6 w-[2px] h-[calc(100%+8px)] bg-primary/10 group-hover:bg-primary/30 transition-colors" />
            )}
            
            {/* Timeline Dot */}
            <div className={`mt-1.5 w-6 h-6 shrink-0 border-2 flex items-center justify-center rounded-full z-10 transition-colors ${
              visit.risk === 'HIGH' ? 'border-[#DC2626] bg-[#FEF2F2] text-[#DC2626]' :
              visit.risk === 'MEDIUM' ? 'border-[#D97706] bg-[#FFFBEB] text-[#D97706]' :
              'border-[#16A34A] bg-[#F0FDF4] text-[#16A34A]'
            }`}>
              <div className="w-2 h-2 rounded-full bg-current" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <span className="font-mono-technical text-[10px] font-bold opacity-60 tracking-wider">VISIT {history.length - idx} \\ {visit.date}</span>
                <span className={`font-mono-technical text-[9px] px-2 py-0.5 border ${
                   visit.risk === 'HIGH' ? 'text-[#DC2626] border-[#DC2626]' :
                   'text-primary/60 border-primary/20'
                }`}>{visit.risk}</span>
              </div>
              <p className="text-sm font-semibold truncate mt-1">{visit.complaint}</p>
              <p className="text-[11px] opacity-60 leading-tight mt-1">{visit.outcome}</p>
            </div>
          </div>
        )) : (
          <div className="text-center py-6 font-mono-technical text-xs opacity-40 uppercase border-2 border-dashed border-primary/10">
            PRIMARILY REGISTRATION — NO PRIOR VISITS FOUND
          </div>
        )}

        {/* Current Visit Indicator */}
        <div className="flex gap-4 items-start relative mt-4">
            <div className="mt-1.5 w-6 h-6 shrink-0 border-2 border-primary bg-primary text-on-primary flex items-center justify-center rounded-full z-10 animate-pulse shadow-[2px_2px_0px_currentColor]">
              <div className="w-2 h-2 rounded-full bg-on-primary" />
            </div>
            <div className="flex-1 min-w-0 bg-primary/5 p-3 border border-primary/20 shadow-inner">
               <span className="font-mono-technical text-[10px] font-bold opacity-60 block">DATE: TODAY \\ {new Date().toLocaleDateString('en-IN')}</span>
               <p className="text-sm font-bold mt-1 uppercase">CURRENT TRIAGE: {caseItem.risk_level}</p>
            </div>
        </div>
      </div>

      <div className={`mt-4 p-4 border-2 flex items-center gap-4 transition-all ${
        aiInsight.includes('⚠') || isHighRisk 
          ? 'bg-[#DC2626] text-white border-[#DC2626] shadow-[4px_4px_0px_#1A1AFF]' 
          : 'bg-primary/5 text-primary border-primary/20'
      }`}>
        <TrendingUp size={24} className={aiInsight.includes('⚠') ? 'animate-bounce' : ''} />
        <div>
           <span className="font-mono-technical text-[10px] font-bold opacity-80 uppercase block">AI LONGITUDINAL INSIGHT</span>
           <p className="text-xs font-black uppercase tracking-tight leading-tight">{aiInsight}</p>
        </div>
      </div>
    </div>
  )
}
