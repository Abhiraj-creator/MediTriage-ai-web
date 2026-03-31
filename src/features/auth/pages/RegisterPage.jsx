import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { authService } from '../services/auth.service'

export const RegisterPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [specialization, setSpecialization] = useState('')
  const [localLoading, setLocalLoading] = useState(false)
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalLoading(true)
    
    if (!import.meta.env.VITE_SUPABASE_URL) {
      console.warn('Mocking registration because Supabase is not configured')
      navigate('/dashboard')
      return
    }

    const { success, error } = await authService.signUp(email, password, {
      name: fullName,
      specialization: specialization,
      role: 'Doctor'
    })

    if (success) {
      // In Supabase with Email Confirmations on, they act somewhat differently. 
      // Assuming auto-login or prompting them to check email.
      alert('REGISTRATION SUCCESSFUL. PLEASE VERIFY EMAIL IF REQUIRED.')
      navigate('/login')
    } else {
      alert(`REGISTRATION ERROR: ${error.message}`)
    }
    setLocalLoading(false)
  }

  const handleGoogleLogin = async () => {
    if (!import.meta.env.VITE_SUPABASE_URL) {
      console.warn('Mocking Google Login')
      navigate('/dashboard')
      return
    }
    await authService.signInWithGoogle()
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row border-primary">
      {/* LEFT: Branding & Image Panel */}
      <div className="w-full md:w-1/2 min-h-[40vh] md:min-h-screen flex flex-col justify-between border-b md:border-b-0 md:border-r border-primary">
        <div className="p-8">
          <h1 className="text-4xl md:text-6xl font-black leading-[0.85] uppercase tracking-tighter">
            MediTriage<br />AI / Core
          </h1>
          <p className="mt-6 font-mono-technical text-sm bg-primary text-on-primary inline-block px-2 py-1">
            NEW CLINICIAN REGISTRATION
          </p>
        </div>
        
        <div className="h-full min-h-[300px] border-t border-primary halftone-overlay bg-surface-container overflow-hidden p-8 flex items-end">
           <div className="w-full">
             <div className="font-mono-technical text-xs mb-4 opacity-60">SYSTEM STATUS: AWAITING INPUT</div>
             <div className="w-full h-px bg-primary mb-2"></div>
             <div className="w-3/4 h-px bg-primary mb-2"></div>
             <div className="w-1/4 h-px bg-primary"></div>
           </div>
        </div>
      </div>

      {/* RIGHT: Register Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-surface">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h2 className="text-5xl font-black uppercase tracking-tighter mb-2">Sign Up</h2>
            <p className="font-mono-technical text-xs opacity-60">PROVIDE CREDENTIALS FOR CLEARANCE</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="font-mono-technical text-xs block">FULL NAME</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Dr. John Doe"
                className="w-full bg-surface-container border border-primary p-4 outline-none focus:bg-white transition-colors font-mono-technical text-sm placeholder:text-primary/40 focus:shadow-brutal"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="font-mono-technical text-xs block">SPECIALIZATION</label>
              <input
                type="text"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                placeholder="Cardiology"
                className="w-full bg-surface-container border border-primary p-4 outline-none focus:bg-white transition-colors font-mono-technical text-sm placeholder:text-primary/40 focus:shadow-brutal"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="font-mono-technical text-xs block">CLINICIAN EMAIL</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@medtriage.ai"
                className="w-full bg-surface-container border border-primary p-4 outline-none focus:bg-white transition-colors font-mono-technical text-sm placeholder:text-primary/40 focus:shadow-brutal"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="font-mono-technical text-xs block">SECURE PASSWORD</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-surface-container border border-primary p-4 outline-none focus:bg-white transition-colors font-mono-technical text-sm placeholder:text-primary/40 focus:shadow-brutal"
                required
              />
            </div>

            <button
              type="submit"
              disabled={localLoading}
              className="w-full border border-primary bg-primary text-on-primary p-4 font-mono-technical text-sm hover:bg-surface hover:text-primary shadow-brutal hover:shadow-none transition-all hover:translate-x-1 hover:translate-y-1 block text-center"
            >
              {localLoading ? 'PROCESSING...' : 'CREATE SECURE ACCOUNT'}
            </button>
          </form>

          <div className="mt-6 flex flex-col gap-4">
             <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-primary"></div>
                <span className="flex-shrink-0 mx-4 font-mono-technical text-[10px] uppercase opacity-60">or</span>
                <div className="flex-grow border-t border-primary"></div>
             </div>
             
             <button
              onClick={handleGoogleLogin}
              type="button"
              className="w-full border border-primary bg-white text-primary p-4 font-mono-technical text-sm hover:bg-surface-container hover:shadow-brutal transition-all text-center flex items-center justify-center gap-2"
             >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              AUTHENTICATE WITH GOOGLE
             </button>
             
             <div className="text-center font-mono-technical text-xs mt-4">
                ALREADY HAVE ACCESS? <Link to="/login" className="underline font-bold hover:text-[#DC2626]">SIGN IN</Link>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
