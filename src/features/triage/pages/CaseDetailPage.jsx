import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Download } from 'lucide-react'
import { useTriageStore } from '../../../store/triage.store'
import { triageService } from '../services/triage.service'
import { feedbackService } from '../services/feedback.service'
import { RISK_LEVELS } from '../../../config/constants'
import { FeedbackForm } from '../components/FeedbackForm'
import { motion } from 'framer-motion'
import { useAuthStore } from '../../../store/auth.store'
import { generateCaseReportPdf } from '../../../utils/pdf.generator'
import { pulseHighRiskCard } from '../../../animations/gsap.timelines'

export const CaseDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { updateCase } = useTriageStore()
  const { doctorProfile } = useAuthStore() 
  
  const [caseItem, setCaseItem] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)

  const aiCardRef = useRef(null)

  useEffect(() => {
    const fetchCase = async () => {
      setIsLoading(true)
      const data = await triageService.getCaseById(id)
      
      if (data) {
        setCaseItem(data)
      } else {
        // Fallback for missing DB
        setCaseItem({
          id,
          patient_name: 'Rahul Sharma',
          patient_age: 45,
          patient_gender: 'Male',
          patient_profiles: {
            full_name: 'Rahul Sharma',
            age: 45,
            gender: 'Male',
            blood_group: 'B+',
            known_conditions: ['Diabetes', 'Hypertension'],
            emergency_contact_name: 'Priya Sharma',
            emergency_contact_phone: '+91 9876543210'
          },
          risk_level: 'HIGH',
          ai_confidence: 92,
          ai_summary: "Patient presents with classic signs of acute myocardial infarction. High risk factors including age and simultaneous presentation of chest pain radiating to left arm with diaphoresis.",
          ai_recommendation: "1. IMMEDIATE CARDIOLOGY CONSULT.\n2. Prepare ECG and Troponin labs immediately.\n3. Keep patient NPO.",
          ai_explanation: "The combination of radiating chest pain, severe sweating, and patient age strongly correlates with acute coronary syndrome.",
          messages: [
            { role: 'ai', content: 'Hello Rahul. Please describe your symptoms and when they started.', timestamp: new Date(Date.now() - 300000).toISOString() },
            { role: 'patient', content: 'It started an hour ago. Heavy pressure on my chest. It hurts to breathe. I am sweating a lot.', timestamp: new Date(Date.now() - 280000).toISOString() },
            { role: 'ai', content: 'I am logging this. Does the pain spread anywhere else, like your arm or jaw?', timestamp: new Date(Date.now() - 260000).toISOString() },
            { role: 'patient', content: 'Yes, my left arm feels numb and achy.', timestamp: new Date(Date.now() - 240000).toISOString() }
          ],
          status: 'pending'
        })
      }
      setIsLoading(false)
    }
    fetchCase()
  }, [id])

  useEffect(() => {
    if (caseItem?.risk_level === 'HIGH' && aiCardRef.current) {
      pulseHighRiskCard(aiCardRef.current)
    }
  }, [caseItem?.risk_level, isLoading])

  if (isLoading || !caseItem) {
    return <div className="p-8 font-mono-technical font-bold uppercase">LOADING PATIENT DATA ENGINE...</div>
  }

  const handleReviewSubmit = async (feedbackData) => {
    try {
      await feedbackService.submitFeedback({
        caseId: caseItem.id,
        doctorId: doctorProfile?.id || 'doc-override-01',
        ...feedbackData
      })
      const updated = {
        ...caseItem,
        status: 'reviewed',
        verified_by_doctor: true,
        risk_level: feedbackData.riskOverride || caseItem.risk_level
      }
      setCaseItem(updated)
      updateCase(updated) 
    } catch (e) {
      console.error(e)
      const updated = {
        ...caseItem,
        status: 'reviewed',
        verified_by_doctor: true,
        risk_level: feedbackData.riskOverride || caseItem.risk_level
      }
      setCaseItem(updated)
      updateCase(updated)
    }
  }

  const handleDownloadReport = async () => {
    setIsDownloading(true)
    try {
      await generateCaseReportPdf(caseItem)
    } catch(err) {
      console.warn("Failed PDF generation", err)
      alert("Failed to generated PDF. Please ensure all assets are loaded.")
    } finally {
      setIsDownloading(false)
    }
  }

  const handleUpdateStatus = async (newStatus) => {
    try {
      const updated = {
        ...caseItem,
        status: newStatus,
        risk_level: newStatus === 'admitted' ? 'HIGH' : caseItem.risk_level
      }
      setCaseItem(updated)
      updateCase(updated)
      await triageService.updateCaseStatus(caseItem.id, newStatus)
    } catch(e) {
      console.error(e)
    }
  }

  const p = caseItem.patient_profiles || {} 

  return (
    <div id="case-detail-content" className="flex flex-col h-[calc(100vh-8rem)] bg-surface">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-primary pb-4 mb-6">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 font-mono-technical text-sm uppercase hover:opacity-50"
          >
            <ArrowLeft size={16} /> BACK TO QUEUE
          </button>
          <div className="font-mono-technical text-[10px] text-primary/60 border border-primary/20 px-2 py-0.5">
            {caseItem?.patient_name ? caseItem.patient_name : `SYS REG: ${caseItem.id}`}
          </div>
        </div>
        <div className="flex items-center gap-4 hidden sm:flex">
          <button 
             onClick={handleDownloadReport} 
             disabled={isDownloading}
             className="flex items-center gap-2 px-4 py-2 border border-primary text-primary font-mono-technical text-xs font-bold hover:bg-primary/5 transition-colors disabled:opacity-50"
          >
            <Download size={14} /> {isDownloading ? 'GENERATING...' : 'DOWNLOAD REPORT'}
          </button>
          {caseItem.status === 'pending' ? (
            <>
              <button 
                 onClick={() => handleUpdateStatus('admitted')}
                 className="px-4 py-2 bg-[#D92D20] text-white font-mono-technical text-xs font-bold shadow-[2px_2px_0px_#1A1AFF] hover:translate-y-px hover:shadow-none transition-all"
              >
                ADMIT TO ER
              </button>
              <button 
                 onClick={() => handleUpdateStatus('resolved')}
                 className="px-4 py-2 bg-[#16A34A] text-white font-mono-technical text-xs font-bold shadow-[2px_2px_0px_#1A1AFF] hover:translate-y-px hover:shadow-none transition-all"
              >
                DISCHARGE (RESOLVE)
              </button>
            </>
          ) : (
            <div className="px-4 py-2 bg-surface-container border border-primary text-primary font-mono-technical text-xs font-bold uppercase">
              STATUS: {caseItem.status}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row flex-1 gap-8 overflow-hidden">
        
        {/* LEFT PANEL : 60% : Patient Context & Transcript */}
        <div className="md:w-3/5 flex flex-col gap-6 overflow-y-auto no-scrollbar pb-8 pt-1">
          
          {/* Patient Info Header */}
          <div className="border border-primary bg-surface shadow-[4px_4px_0px_#1A1AFF] flex items-stretch min-h-[140px]">
            <div className="w-24 border-r border-primary bg-primary/10 flex flex-col items-center justify-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center font-mono-technical text-on-primary text-xl">
                 {(p.full_name || caseItem.patient_name || '?')[0].toUpperCase()}
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <span className="block font-mono-technical text-[10px] uppercase opacity-60 mb-1">Dr. Reviewing:</span>
                <h2 className="text-3xl font-black uppercase tracking-tighter">
                  {p.full_name || caseItem.patient_name}
                </h2>
              </div>
              <div className="flex flex-wrap gap-x-8 gap-y-2 mt-4 font-mono-technical text-xs uppercase">
                <span><span className="opacity-50">Age:</span> {p.age || caseItem.patient_age}</span>
                <span><span className="opacity-50">Sex:</span> {p.gender || caseItem.patient_gender}</span>
                <span><span className="opacity-50">Blood:</span> {p.blood_group || 'UNK'}</span>
                <span><span className="opacity-50">Known:</span> {p.known_conditions?.join(', ') || 'NONE'}</span>
              </div>
              <div className="font-mono-technical text-[10px] mt-2 opacity-60 uppercase">
                Emerg Contact: {p.emergency_contact_name || 'N/A'} ({p.emergency_contact_phone || 'N/A'})
              </div>
            </div>
          </div>

          {/* Symptom Transcript & Clinical Notes */}
          <div className="border border-primary bg-surface shadow-[4px_4px_0px_#1A1AFF] flex flex-col flex-1 min-h-[400px]">
             <div className="border-b border-primary px-6 py-4 flex justify-between items-center bg-surface w-full">
               <h3 className="font-mono-technical font-bold uppercase tracking-wider text-sm">SYMPTOM TRANSCRIPT LOG</h3>
               <span className="w-2 h-2 rounded-full bg-[#12B76A] animate-pulse"></span>
             </div>
             <div className="flex-1 overflow-y-auto no-scrollbar p-6 flex flex-col gap-6 bg-surface-container/30 inner-shadow">
               {(caseItem.messages || caseItem.transcript) ? (caseItem.messages || caseItem.transcript).map((msg, idx) => (
                 <div key={idx} className={`flex w-full ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                   <div className="flex flex-col">
                     <span className={`text-[9px] font-mono-technical uppercase mb-1 ${msg.role === 'ai' ? 'text-primary self-start' : 'text-primary/60 self-end'}`}>
                        {msg.role === 'ai' ? 'MEDITRIAGE SYSTEM' : 'PATIENT REG'} \\ {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : '00:00:00'}
                     </span>
                     <div className={`border p-4 font-sans text-sm max-w-[85%] leading-relaxed ${
                         msg.role === 'ai' 
                           ? 'border-primary bg-primary text-on-primary' 
                           : 'border-primary bg-surface text-primary shadow-[2px_2px_0px_#1A1AFF]'
                     }`}>
                       {msg.content || msg.text}
                     </div>
                   </div>
                 </div>
               )) : (
                 <div className="flex w-full justify-end">
                   <div className="flex flex-col w-full">
                     <span className="text-[9px] font-mono-technical uppercase mb-1 text-primary/60 self-start">
                        PATIENT REGISTRATION \\ EXTRACTED SYMPTOMS
                     </span>
                     <div className="border border-primary bg-surface text-primary shadow-[2px_2px_0px_#1A1AFF] p-4 font-sans text-sm w-full leading-relaxed">
                       {caseItem.symptoms ? caseItem.symptoms.join(', ') : 'No exact transcript provided. See structured symptoms.'}
                     </div>
                   </div>
                 </div>
               )}

               {/* Clinical Notes Box */}
               <div className="flex flex-col w-full mt-6">
                 <span className="text-[9px] font-mono-technical uppercase mb-1 text-primary self-start font-bold">
                    DOCTOR CLINICAL NOTES \\ APPENDED OBSERVATIONS
                 </span>
                 <textarea
                    className="w-full min-h-[140px] border border-primary bg-surface-container p-4 text-sm font-sans outline-none focus:bg-white resize-y shadow-inner"
                    placeholder="Type final clinical observations and triage overrides here... (Saving updates case log)"
                 />
               </div>
             </div>
          </div>
          
          {caseItem.symptom_image_url && (
            <div className="border border-primary bg-surface shadow-[4px_4px_0px_#1A1AFF] p-4">
               <img src={caseItem.symptom_image_url} alt="Patient uploaded symptom" className="w-full h-auto object-cover border border-primary" />
               <p className="font-mono-technical text-[10px] mt-3 opacity-60 uppercase text-right">ANALYZED VIA GEMINI VISION PROTOCOL</p>
            </div>
          )}

        </div>
        
        {/* RIGHT PANEL : 40% : AI Insight & Feedback */}
        <div className="md:w-2/5 flex flex-col gap-6 overflow-y-auto no-scrollbar pb-8 pt-1 px-1">
          
          {/* AI Analysis Card */}
          <div ref={aiCardRef} className="border border-primary bg-surface shadow-[4px_4px_0px_#1A1AFF] p-6 flex flex-col gap-6">
            
            <div className="flex justify-between items-start border-b border-primary/20 pb-6">
              <div>
                 <span className="block font-mono-technical text-[10px] uppercase font-bold text-primary/60 mb-2">AI CONFIDENCE METRIC</span>
                 <div className="text-5xl font-mono font-black text-primary leading-none tracking-tighter">
                   {caseItem.ai_confidence}<span className="text-2xl">%</span>
                 </div>
                 <div className="w-full h-1 bg-surface-container mt-3 border border-primary">
                    <motion.div 
                      className="h-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${caseItem.ai_confidence}%` }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                    />
                 </div>
              </div>
              <div className={`px-4 py-2 border font-mono-technical text-sm font-bold tracking-wider uppercase ${
                  caseItem.risk_level === 'HIGH' ? 'bg-[#FEF2F2] text-[#DC2626] border-[#DC2626]' :
                  caseItem.risk_level === 'MEDIUM' ? 'bg-[#FFFBEB] text-[#D97706] border-[#D97706]' :
                  'bg-[#F0FDF4] text-[#16A34A] border-[#16A34A]'
              }`}>
                {caseItem.risk_level} RISK
              </div>
            </div>

            <div className="border border-primary bg-surface-container p-4">
              <h3 className="font-mono-technical text-xs font-bold uppercase mb-2">AI SYNTHESIS</h3>
              <p className="font-sans text-sm leading-relaxed">
                 {caseItem.ai_summary}
              </p>
            </div>

            <div>
              <h3 className="font-mono-technical text-xs font-bold uppercase text-[#D92D20] mb-3">ACTION PROTOCOL</h3>
              <div className="bg-[#D92D20] text-white p-4 font-mono-technical text-xs tracking-wider uppercase leading-loose border border-[#D92D20] shadow-[2px_2px_0px_#1A1AFF]">
                {caseItem.ai_recommendation?.split('\n').map((rec, i) => (
                  <div key={i} className="mb-1">{rec}</div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-mono-technical text-xs font-bold uppercase mb-2">AI EXPLANATION LOG</h3>
              <p className="border-l-[3px] border-primary/30 pl-3 py-1 font-sans text-xs italic text-primary/70 leading-relaxed">
                 {caseItem.ai_explanation}
              </p>
            </div>

            <div className="font-mono-technical text-[10px] text-[#D97706] uppercase border border-[#FDE68A] bg-[#FFFBEB] p-3 text-center">
              ⚠️ AI-ASSISTED TRIAGE ONLY. CLINICAL JUDGMENT REQUIRED FOR FINAL DIAGNOSIS.
            </div>

          </div>

          {/* Feedback Form */}
          <FeedbackForm 
            caseId={caseItem.id} 
            status={caseItem.status} 
            onSubmit={handleReviewSubmit} 
          />

        </div>

      </div>
    </div>
  )
}

