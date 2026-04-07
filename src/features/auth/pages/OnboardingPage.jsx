import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../store/auth.store'
import { authService } from '../services/auth.service'

export const OnboardingPage = () => {
  const { doctorProfile, user } = useAuthStore()
  const [fullName, setFullName] = useState('')
  const [specialization, setSpecialization] = useState('')
  const [experience, setExperience] = useState('')
  const [hospital, setHospital] = useState('')
  const [city, setCity] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (doctorProfile) {
      setFullName(doctorProfile.full_name || '')
      setSpecialization(doctorProfile.specialization || '')
    }
  }, [doctorProfile])

  const displayName = fullName || doctorProfile?.full_name || 'DOCTOR'

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user?.id) return
    
    setLoading(true)
    const result = await authService.updateProfile(user.id, {
      full_name: fullName,
      specialization: specialization,
      role: 'doctor',
      years_experience: parseInt(experience) || 0,
      hospital_name: hospital,
      city: city
    })
    setLoading(false)
    
    if (result.success) {
      navigate('/dashboard')
    } else {
      alert("Failed to save profile: " + (result.error?.message || "Unknown error"))
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-8 border-primary">
      <div className="w-full max-w-2xl border border-primary bg-surface shadow-brutal p-8 md:p-12 relative overflow-hidden">
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 halftone-overlay opacity-50 pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="mb-10 border-b border-primary pb-8">
            <h1 className="text-4xl md:text-5xl font-black leading-[0.85] uppercase tracking-tighter mb-4">
              WELCOME,<br />DR. {displayName.toUpperCase()}
            </h1>
            <p className="font-mono-technical text-xs opacity-80 uppercase bg-primary text-on-primary inline-block px-2 py-1">
              SYSTEM INITIALIZATION: REQUIRED CONTEXT
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="font-mono-technical text-xs block uppercase">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ex: John Doe"
                  className="w-full bg-surface-container border border-primary p-4 outline-none focus:bg-white transition-colors font-mono-technical text-sm placeholder:text-primary/40 focus:shadow-brutal"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="font-mono-technical text-xs block uppercase">Specialization</label>
                <input
                  type="text"
                  list="specializations"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="Ex: Cardiology"
                  className="w-full bg-surface-container border border-primary p-4 outline-none focus:bg-white transition-colors font-mono-technical text-sm placeholder:text-primary/40 focus:shadow-brutal"
                  required
                />
                <datalist id="specializations">
                  <option value="Gynaecologist" />
                  <option value="Cardiologist" />
                  <option value="Neurologist" />
                  <option value="Pediatrician" />
                  <option value="General Physician" />
                </datalist>
              </div>
            </div>



            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="font-mono-technical text-xs block uppercase">Years of Experience</label>
                <input
                  type="number"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="Ex: 5"
                  className="w-full bg-surface-container border border-primary p-4 outline-none focus:bg-white transition-colors font-mono-technical text-sm placeholder:text-primary/40 focus:shadow-brutal"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="font-mono-technical text-xs block uppercase">Primary Hospital / Clinic</label>
                <input
                  type="text"
                  value={hospital}
                  onChange={(e) => setHospital(e.target.value)}
                  placeholder="Central General Hospital"
                  className="w-full bg-surface-container border border-primary p-4 outline-none focus:bg-white transition-colors font-mono-technical text-sm placeholder:text-primary/40 focus:shadow-brutal"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="font-mono-technical text-xs block uppercase">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ex: Mumbai"
                  className="w-full bg-surface-container border border-primary p-4 outline-none focus:bg-white transition-colors font-mono-technical text-sm placeholder:text-primary/40 focus:shadow-brutal"
                  required
                />
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full border border-primary bg-primary text-on-primary p-4 font-mono-technical text-sm hover:bg-surface hover:text-primary shadow-brutal hover:shadow-none transition-all hover:translate-x-1 hover:translate-y-1 flex items-center justify-center gap-2 uppercase font-bold tracking-wider"
              >
                {loading ? 'PROCESSING...' : 'INITIALIZE DASHBOARD ENVIRONMENT '}
                {!loading && <span className="text-lg leading-none">→</span>}
              </button>
            </div>
            
            <p className="font-mono-technical text-[10px] opacity-50 text-center mt-6">
              YOUR DATA WILL BE ENCRYPTED AND STORED SECURELY IN THE MEDTRIAGE QUANTUM LEDGER.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
