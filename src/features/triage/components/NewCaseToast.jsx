import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'
import { useToast } from '../hooks/useToast'
import { useNavigate } from 'react-router-dom'

export const NewCaseToast = () => {
  const { toast, hideToast } = useToast()
  const navigate = useNavigate()

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="fixed bottom-8 right-8 z-50 w-96 bg-surface-container border-2 border-[#DC2626] shadow-[8px_8px_0px_#DC2626] cursor-pointer"
          onClick={() => {
            navigate(`/cases/${toast.id}`)
            hideToast()
          }}
        >
          {/* Header */}
          <div className="bg-[#DC2626] text-white px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono-technical font-bold text-sm">
              <AlertTriangle size={16} />
              CRITICAL TRIAGE ALERT
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); hideToast(); }}
              className="text-white hover:opacity-75"
            >
              <X size={16} />
            </button>
          </div>
          
          {/* Body */}
          <div className="p-4 bg-surface text-primary">
            <h4 className="text-xl font-black uppercase mb-1">{toast.patient_name}</h4>
            <div className="font-mono-technical text-xs opacity-75 mb-3">
              {toast.patient_age} YO • CONFIDENCE: {toast.ai_confidence}%
            </div>
            <div className="flex flex-wrap gap-2">
              {toast.symptoms?.slice(0, 2).map((s, i) => (
                <span key={i} className="font-mono-technical text-[10px] border border-[#DC2626] text-[#DC2626] px-1 bg-red-50">
                  {s}
                </span>
              ))}
            </div>
          </div>
          
          {/* Progress bar mock */}
          <motion.div 
            initial={{ width: '100%' }}
            animate={{ width: 0 }}
            transition={{ duration: 5, ease: 'linear' }}
            className="h-1 bg-[#DC2626]"
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
