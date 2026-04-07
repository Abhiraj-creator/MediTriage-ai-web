import { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { authService } from '../services/auth.service'

export const RegisterPage = () => {
  const [searchParams] = useSearchParams()
  const userType = searchParams.get('type') || 'doctor'
  const isPatient = userType === 'patient'

  // Shared fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')

  // Doctor-specific fields
  const [specialization, setSpecialization] = useState('')

  // Patient-specific fields
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [conditions, setConditions] = useState('')
  const [heartAttack, setHeartAttack] = useState('no')
  const [surgery, setSurgery] = useState('no')
  const [smoking, setSmoking] = useState('no')
  const [alcohol, setAlcohol] = useState('no')
  const [height, setHeight] = useState('')
  const [consent, setConsent] = useState(false)

  const [localLoading, setLocalLoading] = useState(false)
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard')
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isPatient && !consent) {
      alert('Please accept the consent agreement to continue.')
      return
    }
    setLocalLoading(true)

    if (!import.meta.env.VITE_SUPABASE_URL) {
      console.warn('Mocking registration because Supabase is not configured')
      navigate(isPatient ? '/patient/dashboard' : '/dashboard')
      return
    }

    if (isPatient) {
      const { success, error } = await authService.signUpPatient(email, password, {
        full_name: fullName,
        age: parseInt(age),
        gender,
        known_conditions: conditions ? conditions.split(',').map(s => s.trim()) : [],
        smoking: smoking === 'yes',
        alcohol: alcohol === 'yes',
        height_feet: parseFloat(height) || null,
        past_heart_attack: heartAttack === 'yes',
        past_surgery: surgery === 'yes',
      })
      if (success) {
        navigate('/patient/dashboard')
      } else {
        alert(`REGISTRATION ERROR: ${error?.message || 'Unknown error'}`)
      }
    } else {
      const { success, error } = await authService.signUp(email, password, {
        name: fullName,
        specialization,
        role: 'doctor',
      })
      if (success) {
        navigate('/onboarding')
      } else {
        alert(`REGISTRATION ERROR: ${error?.message || 'Unknown error'}`)
      }
    }
    setLocalLoading(false)
  }

  const handleGoogleLogin = async () => {
    if (!import.meta.env.VITE_SUPABASE_URL) {
      navigate('/dashboard')
      return
    }
    await authService.signInWithGoogle()
  }

  const YesNoToggle = ({ label, value, onChange }) => (
    <div className="space-y-2">
      <label className="font-mono-technical text-xs block uppercase">{label}</label>
      <div className="flex gap-2">
        {['yes', 'no'].map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`flex-1 py-2 font-mono-technical text-xs border transition-colors ${
              value === opt ? 'bg-primary text-on-primary border-primary' : 'border-primary/40 hover:border-primary'
            }`}
          >
            {opt.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row border-primary">
      {/* LEFT: Branding Panel */}
      <div className="w-full md:w-1/2 min-h-[40vh] md:min-h-screen flex flex-col justify-between border-b md:border-b-0 md:border-r border-primary">
        <div className="p-8">
          <h1 className="text-4xl md:text-6xl font-black leading-[0.85] uppercase tracking-tighter">
            MediTriage<br />AI / Core
          </h1>
          <p className={`mt-6 font-mono-technical text-sm inline-block px-2 py-1 ${isPatient ? 'bg-[#16A34A] text-white' : 'bg-primary text-on-primary'}`}>
            {isPatient ? 'NEW PATIENT REGISTRATION' : 'NEW CLINICIAN REGISTRATION'}
          </p>
          <div className="mt-4 font-mono-technical text-[10px] opacity-50">
            <button onClick={() => navigate('/get-started')} className="underline hover:opacity-100">
              ← CHANGE ROLE
            </button>
          </div>
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

      {/* RIGHT: Form */}
      <div className="w-full md:w-1/2 flex items-start justify-center p-8 bg-surface overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <div className="mb-10">
            <h2 className="text-5xl font-black uppercase tracking-tighter mb-2">
              {isPatient ? 'Patient Sign Up' : 'Sign Up'}
            </h2>
            <p className="font-mono-technical text-xs opacity-60">
              {isPatient ? 'REGISTER YOUR HEALTH PROFILE' : 'PROVIDE CREDENTIALS FOR CLEARANCE'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="font-mono-technical text-xs block">FULL NAME</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={isPatient ? 'Rahul Sharma' : 'Dr. John Doe'}
                className="w-full bg-surface-container border border-primary p-4 outline-none focus:bg-white transition-colors font-mono-technical text-sm placeholder:text-primary/40 focus:shadow-brutal"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="font-mono-technical text-xs block">EMAIL ADDRESS</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isPatient ? 'patient@example.com' : 'doctor@medtriage.ai'}
                className="w-full bg-surface-container border border-primary p-4 outline-none focus:bg-white transition-colors font-mono-technical text-sm placeholder:text-primary/40 focus:shadow-brutal"
                required
              />
            </div>

            {/* Password */}
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

            {/* DOCTOR FIELDS */}
            {!isPatient && (
              <div className="space-y-2">
                <label className="font-mono-technical text-xs block">SPECIALIZATION</label>
                <input
                  type="text"
                  list="specializations"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="Cardiology"
                  className="w-full bg-surface-container border border-primary p-4 outline-none focus:bg-white transition-colors font-mono-technical text-sm placeholder:text-primary/40 focus:shadow-brutal"
                  required
                />
                <datalist id="specializations">
                  <option value="Gynaecologist" />
                  <option value="Cardiologist" />
                  <option value="Neurologist" />
                  <option value="Pediatrician" />
                  <option value="General Physician" />
                  <option value="Orthopedician" />
                  <option value="Dermatologist" />
                  <option value="Psychiatrist" />
                  <option value="Gastroenterologist" />
                  <option value="Endocrinologist" />
                </datalist>
              </div>
            )}

            {/* PATIENT FIELDS */}
            {isPatient && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="font-mono-technical text-xs block">AGE</label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="25"
                      min="1" max="120"
                      className="w-full bg-surface-container border border-primary p-4 outline-none focus:bg-white transition-colors font-mono-technical text-sm"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-mono-technical text-xs block">GENDER</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full bg-surface-container border border-primary p-4 outline-none font-mono-technical text-sm h-[58px]"
                      required
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-mono-technical text-xs block">KNOWN CONDITIONS (comma-separated, optional)</label>
                  <input
                    type="text"
                    value={conditions}
                    onChange={(e) => setConditions(e.target.value)}
                    placeholder="Diabetes, Hypertension..."
                    className="w-full bg-surface-container border border-primary p-4 outline-none focus:bg-white transition-colors font-mono-technical text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-mono-technical text-xs block">HEIGHT IN FEET (optional)</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="5.6"
                    step="0.1"
                    className="w-full bg-surface-container border border-primary p-4 outline-none focus:bg-white transition-colors font-mono-technical text-sm"
                  />
                </div>

                <div className="border border-primary/20 p-4 space-y-4">
                  <p className="font-mono-technical text-[10px] opacity-60 uppercase">MEDICAL HISTORY (optional)</p>
                  <div className="grid grid-cols-2 gap-4">
                    <YesNoToggle label="Past Heart Attack?" value={heartAttack} onChange={setHeartAttack} />
                    <YesNoToggle label="Past Surgery?" value={surgery} onChange={setSurgery} />
                    <YesNoToggle label="Smoking?" value={smoking} onChange={setSmoking} />
                    <YesNoToggle label="Alcohol Use?" value={alcohol} onChange={setAlcohol} />
                  </div>
                </div>

                {/* Consent */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-1 w-5 h-5 accent-primary flex-shrink-0"
                    required
                  />
                  <span className="font-mono-technical text-[10px] leading-relaxed opacity-70 group-hover:opacity-100">
                    I UNDERSTAND THIS IS AI-ASSISTED TRIAGE AND NOT A DIAGNOSIS. I CONSENT TO SHARE MY HEALTH INFORMATION WITH A LICENSED DOCTOR FOR REVIEW.
                  </span>
                </label>
              </>
            )}

            <button
              type="submit"
              disabled={localLoading || (isPatient && !consent)}
              className="w-full border border-primary bg-primary text-on-primary p-4 font-mono-technical text-sm hover:bg-surface hover:text-primary shadow-brutal hover:shadow-none transition-all hover:translate-x-1 hover:translate-y-1 block text-center disabled:opacity-40"
            >
              {localLoading ? 'PROCESSING...' : isPatient ? 'CREATE PATIENT ACCOUNT' : 'CREATE SECURE ACCOUNT'}
            </button>
          </form>

          {!isPatient && (
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
            </div>
          )}

          <div className="text-center font-mono-technical text-xs mt-6">
             ALREADY HAVE ACCESS? <Link to="/login" className="underline font-bold hover:text-[#DC2626]">SIGN IN</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
