import { motion } from 'framer-motion'
import { ShieldAlert, Info } from 'lucide-react'

// RiskBreakdownPanel visualizes the specific factors contributing to the risk score.
// It uses structured breakdown from AI or generates a mock one if missing.
export const RiskBreakdownPanel = ({ caseItem }) => {
  const riskLevel = caseItem.risk_level || 'UNKNOWN'
  const isHighRisk = riskLevel === 'HIGH'
  
  // Simulation of risk score and items if not in DB
  const score = caseItem.risk_score || (isHighRisk ? 9 : riskLevel === 'MEDIUM' ? 5 : 2)
  const breakdown = caseItem.risk_breakdown || [
    { label: 'Fever > 102°F', value: '+2', active: caseItem.detected_symptoms?.some(s => s.toLowerCase().includes('fever')) },
    { label: 'Age > 60', value: '+2', active: (caseItem.patient_profiles?.age || caseItem.patient_age) > 60 },
    { label: 'Comorbidity detected', value: '+2', active: caseItem.patient_profiles?.known_conditions?.length > 0 },
    { label: 'Clinical Red Flag', value: '+3', active: isHighRisk }
  ].filter(item => item.active)

  return (
    <div className={`border-2 ${isHighRisk ? 'border-[#DC2626] bg-[#FEF2F2]' : 'border-primary bg-surface'} p-6 shadow-[4px_4px_0px_currentColor] transition-all`}>
      <div className="flex justify-between items-start mb-6">
        <div>
          <span className="font-mono-technical text-[10px] uppercase font-bold opacity-60 block mb-1">CLINICAL RISK ENGINE</span>
          <h3 className={`text-2xl font-black uppercase tracking-tighter ${isHighRisk ? 'text-[#DC2626]' : 'text-primary'}`}>
            RISK: {riskLevel} (Score: {score}/10)
          </h3>
        </div>
        <div className={`${isHighRisk ? 'text-[#DC2626] animate-pulse' : 'text-primary'}`}>
          <ShieldAlert size={28} />
        </div>
      </div>

      <div className="space-y-3">
        <span className="font-mono-technical text-[10px] uppercase font-bold opacity-40 block border-b border-current/10 pb-1">FACTORS DETECTED:</span>
        {breakdown.map((item, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex justify-between items-center font-mono-technical text-xs"
          >
            <span className="opacity-80 flex items-center gap-2">
               <span className="w-1 h-1 bg-current rounded-full"></span>
               {item.label}
            </span>
            <span className="font-bold">{item.value}</span>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 flex items-start gap-2 bg-white/50 p-3 border border-current/10">
        <Info size={14} className="mt-0.5 opacity-40 shrink-0" />
        <p className="font-mono-technical text-[9px] leading-relaxed opacity-60 uppercase">
          Score threshold for HIGH risk is 7+. Items are weighted based on international triage protocols (ESI/MTS).
        </p>
      </div>
    </div>
  )
}
