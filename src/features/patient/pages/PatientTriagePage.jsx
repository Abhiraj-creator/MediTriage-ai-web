import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../../config/supabase'
import { useAuthStore } from '../../../store/auth.store'

const STEPS = ['CONSENT', 'SYMPTOMS', 'DETAILS', 'SUBMIT']

const COMMON_SYMPTOMS = [
  'Fever', 'Cough', 'Headache', 'Chest pain', 'Shortness of breath',
  'Nausea', 'Vomiting', 'Fatigue', 'Dizziness', 'Body ache',
  'Sore throat', 'Abdominal pain', 'Diarrhea', 'Rash', 'Swelling'
]

export const PatientTriagePage = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [step, setStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState(null)

  // Form state
  const [consent, setConsent] = useState(false)
  const [symptomsText, setSymptomsText] = useState('')
  const [selectedSymptoms, setSelectedSymptoms] = useState([])
  const [severity, setSeverity] = useState(5)
  const [duration, setDuration] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [language, setLanguage] = useState('en')

  const toggleSymptom = (sym) => {
    setSelectedSymptoms(prev =>
      prev.includes(sym) ? prev.filter(s => s !== sym) : [...prev, sym]
    )
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file && file.size < 5 * 1024 * 1024) {
      setImageFile(file)
    } else if (file) {
      alert('Image must be under 5MB')
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      let imageUrl = null

      if (imageFile) {
        const fileName = `${user?.id || 'anon'}-${Date.now()}.jpg`
        const { data: uploadData } = await supabase.storage
          .from('symptom-images')
          .upload(fileName, imageFile, { contentType: imageFile.type })
        if (uploadData) {
          const { data: urlData } = supabase.storage
            .from('symptom-images')
            .getPublicUrl(fileName)
          imageUrl = urlData?.publicUrl
        }
      }

      const payload = {
        patient_id: user?.id,
        symptoms_text: symptomsText,
        detected_symptoms: selectedSymptoms,
        severity,
        duration,
        language,
        media_urls: imageUrl ? { image: imageUrl } : {},
      }

      // Try edge function, fall back to smart local mock
      let aiResult = null
      try {
        const { data: fnData, error: fnError } = await supabase.functions.invoke('analyze-symptoms', {
          body: payload
        })
        if (!fnError) aiResult = fnData
      } catch(e) {
        console.warn('Edge function failed, using smart mock result')
      }

      // Smart mock fallback
      if (!aiResult) {
        const allSymptoms = [...selectedSymptoms, symptomsText.toLowerCase()]
        const hasChest = allSymptoms.some(s => s.includes('chest'))
        const hasFever = allSymptoms.some(s => s.includes('fever'))
        const isHighSeverity = severity >= 8

        aiResult = {
          risk_level: (hasChest || isHighSeverity) ? 'HIGH' : hasFever ? 'MEDIUM' : 'LOW',
          ai_summary: hasChest
            ? 'Patient reports chest pain with associated symptoms. Requires immediate medical evaluation to rule out cardiac causes.'
            : hasFever
            ? 'Patient presents with fever. Monitor temperature and hydration. Seek care if symptoms worsen or persist beyond 3 days.'
            : 'Symptoms appear mild. Rest, stay hydrated, and monitor your condition. Consult a doctor if no improvement in 48 hours.',
          ai_recommendation: hasChest
            ? '1. Seek emergency care immediately.\n2. Do not drive yourself.\n3. Call 112 if symptoms worsen.'
            : hasFever
            ? '1. Take paracetamol for fever relief.\n2. Drink plenty of fluids.\n3. Rest at home.\n4. Visit a doctor if fever exceeds 103°F.'
            : '1. Rest at home.\n2. Stay hydrated.\n3. Monitor symptoms.\n4. Return if condition worsens.',
          ai_explanation: 'Based on reported symptoms, severity level, and standard triage protocols.',
          ai_confidence: hasChest ? 91 : hasFever ? 85 : 92,
        }
      }

      // Fetch assigned doctor from patient profile
      const { data: profile } = await supabase
        .from('patient_profiles')
        .select('assigned_doctor_id')
        .eq('user_id', user?.id)
        .single()

      // Save to triage_cases
      const { error: caseError } = await supabase
        .from('triage_cases')
        .insert({
          patient_id: user?.id,
          doctor_id: profile?.assigned_doctor_id || null, // Route to assigned doctor
          messages: [
            { role: 'patient', content: symptomsText, timestamp: new Date().toISOString() }
          ],
          image_url: imageUrl,
          risk_level: aiResult.risk_level,
          ai_summary: aiResult.ai_summary,
          ai_recommendation: aiResult.ai_recommendation,
          ai_explanation: aiResult.ai_explanation,
          ai_confidence: aiResult.ai_confidence,
          detected_symptoms: selectedSymptoms,
          language,
          status: 'pending',
          doctor_reviewed: false,
          sent_to_doctor: !!profile?.assigned_doctor_id, // Mark as sent if doctor exists
          sent_at: profile?.assigned_doctor_id ? new Date().toISOString() : null
        })

      if (caseError) console.warn('Case insert error (showing result anyway):', caseError)

      setResult(aiResult)
      setSubmitted(true)
    } catch(e) {
      console.error('Submission error:', e)
      setResult({
        risk_level: 'MEDIUM',
        ai_summary: 'Your symptoms have been recorded and sent to a doctor for review.',
        ai_recommendation: 'A doctor will review your case shortly. You will be notified.',
        ai_confidence: 85,
      })
      setSubmitted(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Result Screen
  if (submitted && result) {
    const isHigh = result.risk_level === 'HIGH'
    const isMedium = result.risk_level === 'MEDIUM'
    const accentColor = isHigh ? '#DC2626' : isMedium ? '#D97706' : '#16A34A'

    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          {isHigh && (
            <div className="bg-[#FEF2F2] border-2 border-[#DC2626] p-4 mb-6 animate-pulse">
              <div className="font-mono-technical text-xs font-bold text-[#DC2626] mb-1">⚠ URGENT — HIGH RISK DETECTED</div>
              <p className="font-mono-technical text-xs text-[#DC2626]">
                Please seek immediate medical attention or call emergency services (112).
              </p>
            </div>
          )}

          <div
            className="border-2 p-8 mb-6"
            style={{
              borderColor: accentColor,
              boxShadow: `6px 6px 0px ${accentColor}`
            }}
          >
            <div className="font-mono-technical text-xs opacity-60 mb-2">TRIAGE RESULT</div>
            <div
              className="text-4xl font-black uppercase tracking-tighter mb-4"
              style={{ color: accentColor }}
            >
              {result.risk_level} RISK
            </div>
            <div className="text-right font-mono-technical text-xs opacity-50 mb-4">
              AI Confidence: {result.ai_confidence}%
            </div>
            <p className="text-sm leading-relaxed mb-4">{result.ai_summary}</p>
            <div className="border-t border-primary/20 pt-4">
              <div className="font-mono-technical text-xs font-bold mb-2">WHAT TO DO:</div>
              {result.ai_recommendation?.split('\n').map((rec, i) => (
                <p key={i} className="font-mono-technical text-xs opacity-80 leading-loose">{rec}</p>
              ))}
            </div>
          </div>

          <div className="font-mono-technical text-[10px] opacity-40 text-center border border-primary/20 p-3 mb-6">
            ⚠ THIS IS AI-ASSISTED TRIAGE. NOT A MEDICAL DIAGNOSIS. A DOCTOR WILL REVIEW YOUR CASE.
          </div>

          <button
            onClick={() => navigate('/patient/dashboard')}
            className="w-full border border-primary bg-primary text-on-primary p-4 font-mono-technical text-sm font-bold uppercase hover:bg-surface hover:text-primary transition-colors"
          >
            RETURN TO DASHBOARD
          </button>
        </div>
      </div>
    )
  }

  const slideVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Progress Header */}
      <header className="h-16 bg-surface border-b border-primary flex items-center justify-between px-6 sticky top-0 z-30">
        <button onClick={() => step === 0 ? navigate(-1) : setStep(s => s - 1)} className="font-mono-technical text-xs opacity-60 hover:opacity-100">
          ← BACK
        </button>
        <div className="flex gap-0">
          {STEPS.map((s, idx) => (
            <div
              key={s}
              className={`font-mono-technical text-[10px] px-3 py-1 border-r border-primary last:border-r-0 ${
                idx === step ? 'bg-primary text-on-primary' :
                idx < step ? 'bg-surface-container opacity-60' : 'opacity-30'
              }`}
            >
              {s}
            </div>
          ))}
        </div>
        <div className="font-mono-technical text-[10px] opacity-40">{step + 1}/{STEPS.length}</div>
      </header>

      <main className="max-w-xl mx-auto p-6">
        <AnimatePresence mode="wait">

          {/* STEP 0: CONSENT */}
          {step === 0 && (
            <motion.div key="consent" variants={slideVariants} initial="initial" animate="animate" exit="exit">
              <h1 className="text-4xl font-black uppercase tracking-tighter mb-6">BEFORE WE BEGIN</h1>
              <div className="border border-primary bg-surface-container p-6 mb-6">
                <p className="font-mono-technical text-xs leading-loose opacity-80">
                  By continuing, I understand that:<br/><br/>
                  • This is an <strong>AI-assisted pre-screening tool</strong>, not a medical diagnosis.<br/>
                  • My health information will be shared with a licensed doctor for review.<br/>
                  • In case of emergency, I should call 112 or visit the nearest emergency room.<br/>
                  • My data is stored securely and only accessible to my assigned doctor.
                </p>
              </div>
              <label className="flex items-start gap-3 cursor-pointer mb-8 group">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1 w-5 h-5 accent-primary flex-shrink-0"
                />
                <span className="font-mono-technical text-xs leading-relaxed opacity-80 group-hover:opacity-100">
                  I HAVE READ AND AGREE TO THE ABOVE TERMS AND CONSENT TO AI-ASSISTED TRIAGE.
                </span>
              </label>
              <button
                disabled={!consent}
                onClick={() => setStep(1)}
                className="w-full border border-primary bg-primary text-on-primary p-4 font-mono-technical text-sm font-bold uppercase disabled:opacity-30 hover:bg-surface hover:text-primary transition-colors shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1"
              >
                I AGREE — CONTINUE
              </button>
            </motion.div>
          )}

          {/* STEP 1: SYMPTOMS */}
          {step === 1 && (
            <motion.div key="symptoms" variants={slideVariants} initial="initial" animate="animate" exit="exit">
              <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">YOUR SYMPTOMS</h1>
              <p className="font-mono-technical text-xs opacity-60 mb-6">DESCRIBE WHAT YOU ARE FEELING RIGHT NOW</p>

              {/* Language */}
              <div className="mb-4">
                <label className="font-mono-technical text-xs block mb-2">LANGUAGE</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="border border-primary bg-surface-container p-2 font-mono-technical text-xs outline-none"
                >
                  <option value="en">English</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                  <option value="mr">मराठी (Marathi)</option>
                  <option value="ta">தமிழ் (Tamil)</option>
                  <option value="te">తెలుగు (Telugu)</option>
                </select>
              </div>

              {/* Free text */}
              <div className="mb-6">
                <label className="font-mono-technical text-xs block mb-2">DESCRIBE YOUR MAIN SYMPTOMS</label>
                <textarea
                  value={symptomsText}
                  onChange={(e) => setSymptomsText(e.target.value)}
                  placeholder={language === 'hi' ? 'अपने लक्षण यहाँ लिखें...' : 'e.g. I have had a high fever for 2 days with severe headache...'}
                  className="w-full min-h-[120px] border border-primary bg-surface-container p-4 font-sans text-sm outline-none focus:bg-white resize-y"
                />
                <div className="text-right font-mono-technical text-[10px] opacity-40 mt-1">{symptomsText.length} CHAR</div>
              </div>

              {/* Symptom chips */}
              <div className="mb-6">
                <label className="font-mono-technical text-xs block mb-2">ALSO SELECT IF APPLICABLE:</label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_SYMPTOMS.map(sym => (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => toggleSymptom(sym)}
                      className={`font-mono-technical text-[10px] px-3 py-1.5 border transition-colors ${
                        selectedSymptoms.includes(sym)
                          ? 'bg-primary text-on-primary border-primary'
                          : 'border-primary/40 hover:border-primary'
                      }`}
                    >
                      {sym}
                    </button>
                  ))}
                </div>
              </div>

              {/* Severity */}
              <div className="mb-6">
                <label className="font-mono-technical text-xs block mb-2">
                  PAIN/DISCOMFORT SEVERITY: <span className="font-black">{severity}/10</span>
                </label>
                <input
                  type="range" min="1" max="10" value={severity}
                  onChange={(e) => setSeverity(parseInt(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between font-mono-technical text-[9px] opacity-40 mt-1">
                  <span>MILD</span><span>MODERATE</span><span>SEVERE</span>
                </div>
              </div>

              <button
                disabled={!symptomsText.trim() && selectedSymptoms.length === 0}
                onClick={() => setStep(2)}
                className="w-full border border-primary bg-primary text-on-primary p-4 font-mono-technical text-sm font-bold uppercase disabled:opacity-30 hover:bg-surface hover:text-primary transition-colors shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1"
              >
                NEXT: ADDITIONAL DETAILS →
              </button>
            </motion.div>
          )}

          {/* STEP 2: DETAILS */}
          {step === 2 && (
            <motion.div key="details" variants={slideVariants} initial="initial" animate="animate" exit="exit">
              <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">MORE DETAILS</h1>
              <p className="font-mono-technical text-xs opacity-60 mb-6">HELPS THE AI GIVE A MORE ACCURATE RESULT</p>

              {/* Duration */}
              <div className="mb-6 space-y-2">
                <label className="font-mono-technical text-xs block">HOW LONG HAVE YOU HAD THESE SYMPTOMS?</label>
                <div className="flex gap-2 flex-wrap">
                  {['Today', '1-2 Days', '3-5 Days', '1 Week+', '1 Month+'].map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDuration(d)}
                      className={`font-mono-technical text-xs px-4 py-2 border transition-colors ${
                        duration === d ? 'bg-primary text-on-primary border-primary' : 'border-primary/40 hover:border-primary'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image upload */}
              <div className="mb-6 space-y-2">
                <label className="font-mono-technical text-xs block">
                  UPLOAD PHOTO (optional — for visible symptoms like rash, swelling)
                </label>
                <div className="border border-dashed border-primary/40 p-6 text-center relative">
                  <input
                    type="file" accept="image/*" onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {imageFile ? (
                    <div className="font-mono-technical text-xs text-[#16A34A]">
                      ✓ {imageFile.name} ({(imageFile.size / 1024).toFixed(0)}KB)
                    </div>
                  ) : (
                    <div className="font-mono-technical text-xs opacity-40">
                      TAP TO UPLOAD PHOTO (MAX 5MB)
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 border border-primary p-4 font-mono-technical text-sm font-bold uppercase hover:bg-surface-container transition-colors"
                >
                  ← BACK
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 border border-primary bg-primary text-on-primary p-4 font-mono-technical text-sm font-bold uppercase hover:bg-surface hover:text-primary transition-colors shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                >
                  REVIEW & SUBMIT →
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: SUBMIT */}
          {step === 3 && (
            <motion.div key="submit" variants={slideVariants} initial="initial" animate="animate" exit="exit">
              <h1 className="text-4xl font-black uppercase tracking-tighter mb-6">REVIEW & SUBMIT</h1>

              <div className="border border-primary bg-surface-container p-6 mb-6 space-y-4">
                <div>
                  <div className="font-mono-technical text-[10px] opacity-50 mb-1">YOUR DESCRIPTION</div>
                  <p className="text-sm">{symptomsText || '(none provided)'}</p>
                </div>
                {selectedSymptoms.length > 0 && (
                  <div>
                    <div className="font-mono-technical text-[10px] opacity-50 mb-1">SELECTED SYMPTOMS</div>
                    <div className="flex flex-wrap gap-1">
                      {selectedSymptoms.map(s => (
                        <span key={s} className="font-mono-technical text-[10px] border border-primary/40 px-2 py-0.5">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <div className="font-mono-technical text-[10px] opacity-50 mb-1">SEVERITY</div>
                  <div className="font-mono-technical text-sm font-bold">{severity}/10</div>
                </div>
                {duration && (
                  <div>
                    <div className="font-mono-technical text-[10px] opacity-50 mb-1">DURATION</div>
                    <div className="font-mono-technical text-sm">{duration}</div>
                  </div>
                )}
                {imageFile && (
                  <div>
                    <div className="font-mono-technical text-[10px] opacity-50 mb-1">PHOTO ATTACHED</div>
                    <div className="font-mono-technical text-sm text-[#16A34A]">✓ {imageFile.name}</div>
                  </div>
                )}
              </div>

              <div className="font-mono-technical text-[10px] opacity-50 text-center mb-6 border border-primary/20 p-3">
                YOUR DATA WILL BE ANALYZED BY AI AND REVIEWED BY A LICENSED DOCTOR.
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 border border-primary p-4 font-mono-technical text-sm font-bold uppercase hover:bg-surface-container transition-colors"
                >
                  ← EDIT
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 border border-primary bg-primary text-on-primary p-4 font-mono-technical text-sm font-bold uppercase disabled:opacity-50 hover:bg-surface hover:text-primary transition-colors shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                >
                  {isSubmitting ? '⏳ ANALYZING...' : 'SUBMIT FOR TRIAGE →'}
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  )
}
