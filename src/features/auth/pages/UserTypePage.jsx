import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Logo } from '../../../components/common/Logo'

export const UserTypePage = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-8">
      <div className="mb-12 text-center">
        <Logo className="w-12 h-12 mx-auto mb-4" pathClassName="fill-primary" />
        <h1 className="text-5xl font-black uppercase tracking-tighter">INITIALIZE ACCOUNT</h1>
        <p className="font-mono-technical text-xs opacity-60 mt-2">SELECT YOUR SYSTEM ROLE</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        {/* Doctor Card */}
        <motion.button
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/register?type=doctor')}
          className="border-2 border-primary bg-surface shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all p-8 text-left flex flex-col gap-4 group"
        >
          <div className="w-12 h-12 bg-primary text-on-primary flex items-center justify-center font-mono-technical font-black text-xl">
            Rx
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tighter">Doctor</h2>
            <p className="font-mono-technical text-xs opacity-60 mt-2">
              Access the clinical command center. Review AI-triaged cases, monitor patient queue in realtime.
            </p>
          </div>
          <div className="font-mono-technical text-xs border border-primary px-3 py-1 self-start group-hover:bg-primary group-hover:text-on-primary transition-colors">
            DOCTOR PORTAL →
          </div>
        </motion.button>

        {/* Patient Card */}
        <motion.button
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/register?type=patient')}
          className="border-2 border-primary bg-surface shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all p-8 text-left flex flex-col gap-4 group"
        >
          <div className="w-12 h-12 border-2 border-primary text-primary flex items-center justify-center font-mono-technical font-black text-xl">
            Pt
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tighter">Patient</h2>
            <p className="font-mono-technical text-xs opacity-60 mt-2">
              Submit symptoms, get AI triage results, connect with doctors for consultation.
            </p>
          </div>
          <div className="font-mono-technical text-xs border border-primary px-3 py-1 self-start group-hover:bg-primary group-hover:text-on-primary transition-colors">
            PATIENT PORTAL →
          </div>
        </motion.button>
      </div>

      <div className="mt-10 font-mono-technical text-xs opacity-40 text-center">
        ALREADY HAVE AN ACCOUNT?{' '}
        <button onClick={() => navigate('/login')} className="underline font-bold opacity-80 hover:opacity-100">
          SIGN IN
        </button>
      </div>
    </div>
  )
}
