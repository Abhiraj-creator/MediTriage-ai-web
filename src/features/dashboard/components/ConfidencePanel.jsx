import { motion } from 'framer-motion'
import { CheckCircle, Info } from 'lucide-react'

// ConfidencePanel visualizes the AI's confidence and the reasoning for its decision.
export const ConfidencePanel = ({ caseItem }) => {
  const confidence = caseItem.ai_confidence || 72
  const explanation = caseItem.ai_explanation || "Based on symptoms + duration + pattern"

  return (
    <div className="border border-primary bg-surface shadow-[4px_4px_0px_#1A1AFF] p-6 flex flex-col gap-4">
      <div className="flex justify-between items-start border-b border-primary/20 pb-4">
        <div>
           <span className="block font-mono-technical text-[10px] uppercase font-bold text-primary/60 mb-1">AI CONFIDENCE METRIC</span>
           <div className="text-4xl font-mono font-black text-primary leading-none tracking-tighter">
             {confidence}<span className="text-xl">%</span>
           </div>
        </div>
        <CheckCircle size={28} className="text-primary opacity-60" />
      </div>

      <div className="w-full h-2 bg-primary/10 border border-primary/20 relative overflow-hidden">
        <motion.div 
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${confidence}%` }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
        {/* Metric Markers */}
        <div className="absolute left-[25%] top-0 w-px h-full bg-primary/20" />
        <div className="absolute left-[50%] top-0 w-px h-full bg-primary/20" />
        <div className="absolute left-[75%] top-0 w-px h-full bg-primary/20" />
      </div>

      <div className="bg-primary/5 p-4 border-l-[4px] border-primary flex items-start gap-3">
         <Info size={16} className="mt-0.5 text-primary opacity-40 shrink-0" />
         <div>
            <span className="font-mono-technical text-[10px] font-bold uppercase block opacity-60">EXPLAINABILITY LOG</span>
            <p className="text-xs font-sans italic opacity-80 leading-relaxed">{explanation}</p>
         </div>
      </div>

      <div className="font-mono-technical text-[8px] opacity-40 uppercase text-center mt-2 tracking-widest">
        GENERATED VIA GEMINI PROTOCOL \\ REALTIME MODEL CONFIDENCE
      </div>
    </div>
  )
}
