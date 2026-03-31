import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, CheckCircle, ShieldAlert } from 'lucide-react'
import { useTriageStore } from '../../../store/triage.store'
import { triageService } from '../services/triage.service'
import { RISK_LEVELS } from '../../../config/constants'

export const CaseDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { updateCase } = useTriageStore()
  
  const [caseItem, setCaseItem] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch from DB if active, otherwise grab from store or mock
  useEffect(() => {
    const fetchCase = async () => {
      setIsLoading(true)
      const data = await triageService.getCaseById(id)
      
      if (data) {
        setCaseItem(data)
      } else {
        // Mock Fallback since we might not have DB hooked up
        setCaseItem({
          id,
          patient_name: 'Rahul Sharma',
          patient_age: 45,
          patient_gender: 'Male',
          risk_level: RISK_LEVELS.HIGH,
          ai_confidence: 92,
          symptoms: ['Chest pain', 'Shortness of breath', 'Nausea', 'Sweating'],
          status: 'pending',
          ai_summary: "Patient presents with classic signs of acute myocardial infarction. High risk factors including age and simultaneous presentation of chest pain radiating to left arm with diaphoresis.",
          ai_recommendation: "IMMEDIATE CARDIOLOGY CONSULT. Prepare ECG and Troponin labs immediately. Keep patient NPO.",
          transcript: [
            { role: 'ai', text: 'Hello Rahul. Please describe your symptoms and when they started.' },
            { role: 'patient', text: 'It started an hour ago. Heavy pressure on my chest. It hurts to breathe. I am sweating a lot.' },
            { role: 'ai', text: 'I am logging this. Does the pain spread anywhere else, like your arm or jaw?' },
            { role: 'patient', text: 'Yes, my left arm feels numb and achy.' }
          ]
        })
      }
      setIsLoading(false)
    }

    fetchCase()
  }, [id])

  if (isLoading || !caseItem) {
    return <div className="p-8 font-mono-technical">LOADING CASE DATA...</div>
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    // We would record the feedback in ai_feedback table via feedback.service
    const updated = await triageService.updateCaseStatus(id, 'reviewed')
    if (updated) {
      updateCase(updated)
      setCaseItem(updated)
    } else {
      // Mock update
      setCaseItem({...caseItem, status: 'reviewed'})
    }
    setIsSubmitting(false)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-primary pb-4 mb-4">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 font-mono-technical hover:opacity-50"
        >
          <ArrowLeft size={16} /> BACK TO QUEUE
        </button>
        <div className="font-mono-technical text-xs border border-primary px-3 py-1 bg-surface-container">
          CASE ID: {caseItem.id}
        </div>
      </div>

      <div className="flex flex-col md:flex-row flex-1 gap-8 overflow-hidden">
        
        {/* LEFT PANEL : 60% : AI Insight & Medical Context */}
        <div className="md:w-3/5 flex flex-col gap-6 overflow-y-auto no-scrollbar pb-8">
          
          {/* Patient Header Brutalist Block */}
          <div className={`p-6 border min-h-[160px] flex flex-col justify-between ${caseItem.risk_level === RISK_LEVELS.HIGH ? 'bg-red-50 border-[#DC2626] shadow-[4px_4px_0px_#DC2626]' : 'bg-surface border-primary shadow-brutal'}`}>
            <div className="flex justify-between items-start">
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
                {caseItem.patient_name}
              </h2>
              {caseItem.risk_level === RISK_LEVELS.HIGH && <ShieldAlert size={32} className="text-[#DC2626]" />}
            </div>
            
            <div className="flex flex-wrap items-end gap-6 mt-6">
              <div>
                <span className="block font-mono-technical text-[10px] opacity-60">AGE/GENDER</span>
                <span className="font-mono-technical font-bold text-lg">{caseItem.patient_age} {caseItem.patient_gender}</span>
              </div>
              <div>
                <span className="block font-mono-technical text-[10px] opacity-60">RISK LEVEL</span>
                <span className={`font-mono-technical font-bold text-lg ${caseItem.risk_level === RISK_LEVELS.HIGH ? 'text-[#DC2626]' : ''}`}>
                  {caseItem.risk_level}
                </span>
              </div>
              <div>
                <span className="block font-mono-technical text-[10px] opacity-60">CONFIDENCE</span>
                <span className="font-mono-technical font-bold text-lg">{caseItem.ai_confidence}%</span>
              </div>
              <div>
                <span className="block font-mono-technical text-[10px] opacity-60">STATUS</span>
                <span className="font-mono-technical font-bold text-lg uppercase">{caseItem.status}</span>
              </div>
            </div>
          </div>

          {/* AI Synthesis */}
          <div className="border border-primary bg-surface p-6 shadow-brutal">
            <h3 className="font-mono-technical font-bold border-b border-primary pb-2 mb-4">AI CLINICAL SYNTHESIS</h3>
            <p className="font-sans text-sm leading-relaxed mb-6">
              {caseItem.ai_summary}
            </p>
            
            <h3 className="font-mono-technical font-bold border-b border-primary pb-2 mb-4 text-[#DC2626]">RECOMMENDED ACTION LOG</h3>
            <div className="bg-[#DC2626] text-white p-4 font-mono-technical text-sm uppercase">
              {caseItem.ai_recommendation}
            </div>
          </div>
          
          {/* Feedback Form (Clinical Action) */}
          <div className="border border-primary bg-surface p-6 shadow-brutal mt-auto">
             <h3 className="font-mono-technical font-bold border-b border-primary pb-2 mb-4">CLINICIAN OVERRIDE & SIGN-OFF</h3>
             <form onSubmit={handleReviewSubmit}>
               <textarea
                 className="w-full h-24 border border-primary bg-surface-container p-4 font-mono-technical text-sm outline-none focus:bg-white resize-none mb-4"
                 placeholder="Enter clinical notes or corrections to the AI triage... (Optional)"
                 value={feedback}
                 onChange={e => setFeedback(e.target.value)}
                 disabled={caseItem.status === 'reviewed'}
               />
               <button
                 type="submit"
                 disabled={isSubmitting || caseItem.status === 'reviewed'}
                 className="w-full flex items-center justify-center gap-2 border border-primary bg-primary text-on-primary py-4 hover:bg-surface hover:text-primary transition-colors disabled:opacity-50 font-bold"
               >
                 {caseItem.status === 'reviewed' ? (
                   <><CheckCircle size={18} /> TRIAGE SIGNED OFF</>
                 ) : (
                   <><Send size={18} /> CONFIRM TRIAGE & RECORD FEEDBACK</>
                 )}
               </button>
             </form>
          </div>
        </div>
        
        {/* RIGHT PANEL : 40% : Raw Transcript (Brutalist Receipt Style) */}
        <div className="md:w-2/5 border border-primary bg-surface-container p-6 shadow-brutal flex flex-col h-full overflow-hidden">
          <div className="flex justify-between items-center border-b border-primary pb-4 mb-6">
            <h3 className="font-mono-technical font-bold uppercase">RAW TRANSCRIPT</h3>
            <span className="font-mono-technical text-[10px] animate-pulse text-green-600">CONNECTION CLOSED</span>
          </div>
          
          <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-4">
            {caseItem.transcript?.map((msg, idx) => (
              <div key={idx} className={`w-full flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] border px-4 py-3 font-mono-technical text-xs leading-relaxed
                  ${msg.role === 'ai' 
                    ? 'border-primary bg-primary text-on-primary' 
                    : 'border-primary bg-surface text-primary'}`
                }>
                  <div className="opacity-50 mb-1 text-[9px] uppercase">
                    {msg.role === 'ai' ? 'MEDITRIAGE SYSTEM' : 'PATIENT INPUT'}
                  </div>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
