import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle } from 'lucide-react'
import { CaseCard } from './CaseCard'
import { useTriageStore } from '../../../store/triage.store'
import { CaseSkeleton } from './CaseSkeleton'

export const CaseQueue = () => {
  const navigate = useNavigate()
  
  const { 
    activeFilter, 
    setActiveFilter, 
    isLoading, 
    getFilteredCases,
    cases
  } = useTriageStore()

  const filters = ['ALL', 'HIGH RISK', 'MODERATE', 'LOW RISK', 'REVIEWED']

  const handleCardClick = (id) => {
    navigate(`/cases/${id}`)
  }

  const filteredCases = getFilteredCases()
  const [searchParams] = useSearchParams()
  const patientQuery = searchParams.get('patient')

  // Filter if patient is specified
  const displayCases = patientQuery 
    ? filteredCases.filter(c => {
        const name = c.patient_profiles?.full_name || c.patient_name || 'UNKNOWN PATIENT'
        return name.toUpperCase() === patientQuery.toUpperCase()
      })
    : filteredCases

  // Group cases by patient name
  const groupedCases = displayCases.reduce((acc, caseItem) => {
    const name = caseItem.patient_profiles?.full_name || caseItem.patient_name || 'UNKNOWN PATIENT'
    const key = name.toUpperCase()
    if (!acc[key]) acc[key] = []
    acc[key].push(caseItem)
    return acc
  }, {})

  const patientGroups = Object.entries(groupedCases).map(([name, groupCases]) => ({
    name,
    cases: groupCases
  }))

  return (
    <div className="w-full relative min-h-[400px]">
      {/* Brutalist Filter Tabs */}
      <div className="flex overflow-x-auto no-scrollbar gap-0 border-b border-primary mb-8 pb-4">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`
              font-mono-technical text-xs px-6 py-2 border border-primary transition-all whitespace-nowrap -mr-px
              ${activeFilter === filter 
                ? 'bg-primary text-on-primary shadow-[inset_0_-2px_0_var(--color-primary)]' 
                : 'bg-surface hover:bg-surface-container'
              }
            `}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* List / Loading / Empty States */}
      <div className="flex flex-col gap-4">
        {isLoading && cases.length === 0 ? (
          <>
            <CaseSkeleton />
            <CaseSkeleton />
            <CaseSkeleton />
            <CaseSkeleton />
          </>
        ) : filteredCases.length > 0 ? (
          <motion.div 
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.05 } }
            }}
          >
             {patientQuery ? (
                displayCases.map((caseItem) => (
                  <CaseCard 
                    key={caseItem.id} 
                    caseData={caseItem} 
                    onClick={handleCardClick}
                  />
                ))
             ) : (
                patientGroups.map((group) => (
                  <PatientGroup
                    key={group.name}
                    patientName={group.name}
                    cases={group.cases}
                    onCardClick={handleCardClick}
                    onGroupClick={(name) => navigate(`/cases?patient=${encodeURIComponent(name)}`)}
                  />
                ))
             )}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center p-16 text-center border-2 border-dashed border-primary/20 bg-surface mt-4"
          >
             <CheckCircle size={48} className="text-[#16A34A] mb-4 opacity-80" />
             <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">You're all caught up!</h3>
             <p className="font-mono-technical text-xs opacity-60 uppercase">No pending cases match this filter</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

const PatientGroup = ({ patientName, cases, onCardClick, onGroupClick }) => {
  if (cases.length === 1) {
    return <CaseCard caseData={cases[0]} onClick={onCardClick} />
  }

  const hasHigh = cases.some(c => c.risk_level === 'HIGH')
  const hasMedium = cases.some(c => c.risk_level === 'MEDIUM')
  const maxRisk = hasHigh ? 'HIGH' : hasMedium ? 'MEDIUM' : 'LOW'
  
  const borderClass = maxRisk === 'HIGH' ? 'border-[#DC2626]' : 'border-primary'
  const bgClass = maxRisk === 'HIGH' ? 'bg-red-50' : 'bg-surface'
  const textClass = maxRisk === 'HIGH' ? 'text-[#DC2626]' : 'text-primary'

  return (
    <div className={`mb-6 border ${borderClass} shadow-brutal`}>
      <div 
        onClick={() => onGroupClick(patientName)}
        className={`p-6 flex flex-col md:flex-row items-start md:items-center justify-between cursor-pointer ${bgClass} hover:opacity-90 transition-all`}
      >
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <div className={`w-10 h-10 border ${borderClass} ${textClass} flex items-center justify-center font-bold text-lg bg-surface`}>
            {cases.length}
          </div>
          <div>
            <h3 className="text-xl font-bold uppercase tracking-tighter">{patientName}</h3>
            <span className="font-mono-technical text-[10px] opacity-60 uppercase tracking-widest mt-1 block">
              MULTIPLE CASES DETECTED
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-6 w-full md:w-auto mt-2 md:mt-0 pt-4 md:pt-0 border-t border-primary/20 md:border-0 pl-0 md:pl-8 md:border-l">
          <div className="flex flex-col items-start md:items-end flex-1 md:flex-auto">
             <span className="font-mono-technical text-[10px] opacity-60 mb-2 tracking-widest text-[#666]">HIGHEST RISK</span>
             <span className={`font-mono-technical text-sm font-bold border px-3 py-1 ${textClass} ${borderClass}`}>
               {maxRisk}
             </span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="font-mono-technical text-[10px] uppercase opacity-60 flex-shrink-0">
              VIEW CASES
            </span>
            <div className={`w-8 h-8 flex items-center justify-center border ${borderClass} font-mono-technical ${textClass}`}>
              →
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

