import { useNavigate } from 'react-router-dom'
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
             {filteredCases.map((caseItem) => (
                <CaseCard 
                  key={caseItem.id} 
                  caseData={caseItem} 
                  onClick={handleCardClick}
                />
             ))}
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
