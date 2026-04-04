import { RISK_LEVELS, CASE_STATUS, RISK_CONFIG } from '../../../config/constants'

export const CaseCard = ({ caseData, onClick }) => {
  const {
    id,
    patient_name,
    patient_age,
    patient_gender,
    risk_level,
    ai_confidence,
    symptoms: rawSymptoms,
    detected_symptoms,
    status,
    patient_profiles,
    created_at
  } = caseData

  const symptoms = rawSymptoms || detected_symptoms || []
  const displayName = patient_profiles?.full_name || patient_name || 'Unknown Patient'
  const displayAge = patient_profiles?.age || patient_age
  const displayGender = patient_profiles?.gender || patient_gender

  const config = RISK_CONFIG[risk_level]
  
  // Brutalist styling based on risk level
  const borderClass = risk_level === RISK_LEVELS.HIGH ? 'border-[#DC2626]' : 'border-primary'
  const shadowClass = risk_level === RISK_LEVELS.HIGH 
    ? 'shadow-[4px_4px_0px_#DC2626] hover:shadow-[0px_0px_0px_#DC2626]' 
    : 'shadow-brutal hover:shadow-none'

  const bgClass = risk_level === RISK_LEVELS.HIGH ? 'bg-red-50' : 'bg-surface'
  const isReviewed = status === CASE_STATUS.REVIEWED

  return (
    <div 
      onClick={() => onClick(id)}
      className={`
        relative p-6 md:pr-24 ${bgClass} ${borderClass} border 
        ${shadowClass} hover:translate-x-1 hover:translate-y-1 transition-all cursor-pointer group mb-6
        flex flex-col md:flex-row gap-6 items-start md:items-center justify-between
      `}
    >
      {/* Priority Indicator Line */}
      <div className={`absolute left-0 top-0 bottom-0 w-2 ${risk_level === RISK_LEVELS.HIGH ? 'bg-[#DC2626]' : risk_level === RISK_LEVELS.MEDIUM ? 'bg-[#D97706]' : 'bg-[#16A34A]'}`}></div>

      <div className="flex-1 ml-4">
        <div className="flex items-center gap-4 mb-2">
          <h3 className="text-xl font-bold uppercase tracking-tighter">{displayName}</h3>
          <span className="font-mono-technical text-xs px-2 py-0.5 border border-primary">
            {displayAge}{displayGender?.substring(0,1)}
          </span>
          {isReviewed && (
            <span className="font-mono-technical text-[10px] bg-green-500 text-white px-2 py-0.5 border border-green-700">
              ✓ REVIEWED
            </span>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 text-sm mt-4">
          {symptoms.slice(0, 3).map((sym, idx) => (
            <span key={idx} className="font-mono-technical text-[10px] border border-primary/40 px-2 py-1 bg-surface-container/50">
              {sym}
            </span>
          ))}
          {symptoms.length > 3 && (
            <span className="font-mono-technical text-[10px] border border-primary/40 px-2 py-1">
              +{symptoms.length - 3} MORE
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-row md:flex-row items-center md:items-center justify-end gap-10 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t border-primary/20 md:border-0 pl-0 md:pl-8 md:border-l">
        <div className="flex flex-col items-start md:items-end">
          <span className="font-mono-technical text-[10px] opacity-60 mb-2 tracking-widest text-[#666]">AI CONFIDENCE</span>
          <span className="font-mono-technical text-3xl font-black tracking-tight">{ai_confidence}%</span>
        </div>
        
        <div className="flex flex-col items-start md:items-end border-l border-primary/10 pl-10">
           <span className="font-mono-technical text-[10px] opacity-60 mb-2 tracking-widest text-[#666]">PRIORITY</span>
           <span 
             className={`font-mono-technical text-sm font-bold px-4 py-2 border`}
             style={{
               color: config.color,
               backgroundColor: config.bg,
               borderColor: config.color
             }}
           >
             {config.label}
           </span>
        </div>
      </div>
      
      {/* Hover Reveal Button */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex">
         <div className="bg-primary text-on-primary w-10 h-10 flex items-center justify-center font-bold font-mono-technical">
           →
         </div>
      </div>
    </div>
  )
}
