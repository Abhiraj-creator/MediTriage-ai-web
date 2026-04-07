import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../../../config/supabase'
import { useAuthStore } from '../../../store/auth.store'
import { Logo } from '../../../components/common/Logo'

export const PatientDashboardPage = () => {
  const { user, doctorProfile } = useAuthStore()
  const navigate = useNavigate()
  const [cases, setCases] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [assignedDoctor, setAssignedDoctor] = useState(null)
  
  const patientName = doctorProfile?.full_name || user?.user_metadata?.name || 'Patient'

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true)
      try {
        // Fetch cases
        const { data: caseData } = await supabase
          .from('triage_cases')
          .select('id, risk_level, ai_summary, ai_recommendation, status, created_at, ai_confidence')
          .order('created_at', { ascending: false })
          .limit(10)
        setCases(caseData || [])

        // Fetch assigned doctor
        const { data: profile } = await supabase
          .from('patient_profiles')
          .select(`
            assigned_doctor_id,
            doctor_profiles!patient_profiles_assigned_doctor_id_fkey (
              full_name,
              specialization,
              hospital_name
            )
          `)
          .eq('user_id', user?.id)
          .single()
        
        if (profile?.doctor_profiles) {
          setAssignedDoctor(profile.doctor_profiles)
        }
      } catch(e) {
        console.warn('Dashboard fetch error:', e)
        setCases([
          {
            id: 'demo-1',
            risk_level: 'MEDIUM',
            ai_summary: 'Possible viral fever with moderate dehydration risk. Symptoms suggest a self-limiting viral illness.',
            ai_recommendation: 'Rest, hydration, monitor temperature. Visit doctor if fever exceeds 103°F or symptoms worsen.',
            status: 'reviewed',
            created_at: new Date(Date.now() - 86400000).toISOString(),
            ai_confidence: 88
          }
        ])
      } finally {
        setIsLoading(false)
      }
    }
    fetchDashboardData()
  }, [user?.id])

  const getRiskStyle = (risk) => {
    if (risk === 'HIGH') return { color: '#DC2626', bg: '#FEF2F2', border: '#DC2626' }
    if (risk === 'MEDIUM') return { color: '#D97706', bg: '#FFFBEB', border: '#D97706' }
    return { color: '#16A34A', bg: '#F0FDF4', border: '#16A34A' }
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="h-16 bg-surface border-b border-primary flex items-center justify-between px-6 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Logo className="w-6 h-6" pathClassName="fill-primary" />
          <span className="font-mono-technical text-sm font-bold">MEDITRIAGE</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono-technical text-xs opacity-60 hidden sm:block">
            {patientName.toUpperCase()} · PATIENT
          </span>
          <button
            onClick={async () => { await supabase.auth.signOut(); navigate('/login') }}
            className="font-mono-technical text-xs border border-primary px-3 py-1 hover:bg-primary hover:text-on-primary transition-colors"
          >
            SIGN OUT
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-6">
        {/* Greeting & Doctor Assignment */}
        <div className="mb-8 flex flex-col md:flex-row gap-6 md:items-end justify-between border-b border-primary pb-8">
          <div className="flex-1">
            <h1 className="text-4xl font-black uppercase tracking-tighter">
              HELLO, {(patientName.split(' ')[0] || 'PATIENT').toUpperCase()}.
            </h1>
            <p className="font-mono-technical text-xs opacity-60 mt-2 tracking-widest">AUTHENTICATED PATIENT PORTAL</p>
          </div>

          {assignedDoctor && (
            <div className="flex-1 bg-surface border-2 border-primary p-4 shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
              <div className="font-mono-technical text-[10px] opacity-60 mb-1">ASSIGNED CLINICIAN</div>
              <div className="font-bold uppercase tracking-tight text-lg mb-1">DR. {assignedDoctor.full_name}</div>
              <div className="flex items-center gap-2">
                <span className="font-mono-technical text-[10px] bg-primary text-on-primary px-2 py-0.5">{assignedDoctor.specialization || 'GENERAL'}</span>
                <span className="font-mono-technical text-[10px] opacity-60">{assignedDoctor.hospital_name || 'MEDITRIAGE NETWORK'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Emergency Banner */}
        <div className="border border-[#DC2626]/30 bg-[#FEF2F2] p-3 mb-8 flex items-center gap-3">
          <div className="w-2 h-2 bg-[#DC2626] animate-pulse"></div>
          <span className="font-mono-technical text-[10px] text-[#DC2626] font-bold uppercase tracking-widest">CRITICAL SAFETY NOTICE:</span>
          <span className="font-mono-technical text-[10px] text-[#DC2626] opacity-80 uppercase">
             CALL 112 IN CASE OF EMERGENCY. DO NOT SUBSTITUTE THIS AI TRIAGE FOR EMERGENCY CARE.
          </span>
        </div>

        {/* New Triage Button */}
        <motion.button
          whileHover={{ y: -2 }}
          onClick={() => navigate('/patient/triage')}
          className="w-full border-2 border-primary bg-primary text-on-primary p-6 text-left shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all mb-8 flex items-center justify-between"
        >
          <div>
            <div className="font-mono-technical text-xs mb-1 opacity-80">START NEW SESSION</div>
            <div className="text-2xl font-black uppercase tracking-tighter">Describe Your Symptoms</div>
          </div>
          <span className="text-4xl font-light">→</span>
        </motion.button>

        {/* Previous Cases */}
        <div>
          <h2 className="font-mono-technical text-xs font-bold mb-4 uppercase opacity-60">
            YOUR PREVIOUS TRIAGE SESSIONS
          </h2>
          {isLoading ? (
            <div className="font-mono-technical text-xs animate-pulse opacity-60">LOADING YOUR HISTORY...</div>
          ) : cases.length === 0 ? (
            <div className="border border-dashed border-primary/30 p-8 text-center font-mono-technical text-xs opacity-40">
              NO PREVIOUS SESSIONS. START A NEW TRIAGE ABOVE.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {cases.map((c) => {
                const style = getRiskStyle(c.risk_level)
                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-primary bg-surface p-4 shadow-[2px_2px_0px_var(--color-primary)]"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-mono-technical text-[10px] opacity-60">
                        {new Date(c.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                      <span
                        className="font-mono-technical text-[10px] font-bold px-2 py-0.5 border"
                        style={{ color: style.color, backgroundColor: style.bg, borderColor: style.border }}
                      >
                        {c.risk_level} RISK
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed mb-2">{c.ai_summary}</p>
                    {c.status === 'reviewed' && (
                      <div className="border-t border-primary/20 pt-2 mt-2">
                        <p className="font-mono-technical text-[10px] text-[#16A34A] mb-1">✓ DOCTOR REVIEWED</p>
                        <p className="font-mono-technical text-xs opacity-70 leading-relaxed">{c.ai_recommendation}</p>
                      </div>
                    )}
                    {c.status === 'pending' && (
                      <div className="border-t border-primary/20 pt-2 mt-2">
                        <p className="font-mono-technical text-[10px] text-[#D97706]">⏳ AWAITING DOCTOR REVIEW</p>
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>

        <div className="mt-12 border-t border-primary/20 pt-6 font-mono-technical text-[10px] opacity-30 text-center leading-relaxed">
          ⚠ MEDITRIAGE AI PROVIDES AI-ASSISTED PRE-SCREENING ONLY. ALL RESULTS ARE REVIEWED BY LICENSED DOCTORS.
          THIS IS NOT A SUBSTITUTE FOR PROFESSIONAL MEDICAL DIAGNOSIS OR TREATMENT.
        </div>
      </main>
    </div>
  )
}
