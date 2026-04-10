import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Check } from 'lucide-react'

export const FeedbackForm = ({ caseId, status, onSubmit }) => {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [agreeWithAi, setAgreeWithAi] = useState(true)
  const [riskOverride, setRiskOverride] = useState(null)
  const [doctorNote, setDoctorNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const isReviewed = status === 'reviewed' || status === 'escalated' || status === 'discharged'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    await onSubmit({
      rating: rating || 5,
      feedbackText: doctorNote,
      riskOverride: agreeWithAi ? null : riskOverride,
      doctorNote: doctorNote
    })
    setIsSubmitting(false)
  }

  return (
    <div className="border border-primary border-l-[3px] bg-surface p-6 shadow-[4px_4px_0px_#1A1AFF] flex flex-col gap-4 mb-8">
      <AnimatePresence mode="wait">
        {isReviewed ? (
          <motion.div
             key="success"
             initial={{ opacity: 0, height: 0 }}
             animate={{ opacity: 1, height: 'auto' }}
             className="flex flex-col items-center justify-center py-8 text-primary"
          >
             <div className="w-12 h-12 rounded-full border-2 border-[#12B76A] flex items-center justify-center text-[#12B76A] mb-4">
                <Check size={28} />
             </div>
             <h3 className="font-bold text-xl uppercase font-mono tracking-wider">Assessment Saved</h3>
             <p className="text-sm opacity-70 mt-2">This case has been reviewed.</p>
          </motion.div>
        ) : (
          <motion.form 
            key="form"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit} 
            className="flex flex-col gap-6"
          >
            {/* Star Rating */}
            <div>
              <span className="block text-xs font-bold font-mono tracking-wider mb-2">AI QUALITY RATING</span>
              <div className="flex gap-1" onMouseLeave={() => setHoverRating(0)}>
                {[1, 2, 3, 4, 5].map(star => (
                   <motion.button
                     key={star}
                     type="button"
                     whileHover={{ scale: 1.15 }}
                     whileTap={{ scale: 0.95 }}
                     onMouseEnter={() => setHoverRating(star)}www
                     onClick={() => setRating(star)}
                     className="focus:outline-none"
                   >
                     <Star 
                       size={28} 
                       fill={star <= (hoverRating || rating) ? 'currentColor' : 'transparent'} 
                       className={star <= (hoverRating || rating) ? 'text-primary' : 'text-primary/30'}
                     />
                   </motion.button>
                ))}
              </div>
            </div>

            {/* Risk Override */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer text-sm font-bold font-mono uppercase">
                <input 
                  type="checkbox" 
                  checked={agreeWithAi} 
                  onChange={(e) => setAgreeWithAi(e.target.checked)} 
                  className="accent-primary w-4 h-4"
                />
                AGREE WITH AI ASSESSMENT
              </label>

              <AnimatePresence>
                {!agreeWithAi && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mt-4"
                  >
                    <span className="block text-xs font-bold font-mono text-[#D92D20] mb-2 uppercase">OVERRIDE RISK LEVEL:</span>
                    <div className="flex gap-2">
                       {['LOW', 'MEDIUM', 'HIGH'].map(r => (
                         <button
                           key={r}
                           type="button"
                           onClick={() => setRiskOverride(r)}
                           className={`px-4 py-2 text-xs font-bold font-mono uppercase border ${riskOverride === r ? 'bg-primary text-on-primary border-primary' : 'bg-surface border-primary opacity-60 hover:opacity-100 hover:bg-primary/5'}`}
                         >
                           {r}
                         </button>
                       ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Doctor Note */}
            <div className="relative">
              <textarea
                 className="w-full min-h-[120px] border border-primary bg-surface-container p-4 text-sm font-sans outline-none focus:bg-white resize-y"
                 placeholder="Write your clinical assessment or corrections..."
                 value={doctorNote}
                 onChange={e => setDoctorNote(e.target.value)}
              />
              <span className="absolute bottom-3 right-3 text-[10px] opacity-50 font-mono-technical">
                {doctorNote.length} CHAR
              </span>
            </div>

            <button
               type="submit"
               disabled={isSubmitting || rating === 0 || (!agreeWithAi && !riskOverride)}
               className="w-full flex justify-center items-center gap-2 py-4 bg-primary text-on-primary font-bold uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50 border border-primary"
            >
               {isSubmitting ? 'SUBMITTING...' : 'SUBMIT ASSESSMENT'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}
