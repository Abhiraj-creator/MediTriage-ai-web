import { useState } from 'react'
import { Save, ShieldAlert, User, Bell, Key } from 'lucide-react'
import { useAuth } from '../../auth/hooks/useAuth.js'
import { authService } from '../../auth/services/auth.service.js'
import { supabase } from '../../../config/supabase'

export const ProfilePage = () => {
  const { user, doctorProfile } = useAuth()
  
  const [activeTab, setActiveTab] = useState('profile')
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Use raw metadata from signup in case doctorProfile isn't available
  const fullName = doctorProfile?.full_name || user?.user_metadata?.name || user?.user_metadata?.full_name || 'Dr. Unknown'
  const specialization = doctorProfile?.specialization || user?.user_metadata?.specialization || 'General'
  const email = user?.email || 'N/A'

  // Form states
  const [formData, setFormData] = useState({
    name: fullName,
    specialization: specialization,
    email: email,
    hospital: doctorProfile?.hospital_name || 'Central General Hospital',
    city: doctorProfile?.city || '',
    notificationsEnabled: true,
    highRiskAlerts: true,
  })

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setFormData({ ...formData, [e.target.name]: value })
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!user?.id) return
    
    setIsSaving(true)
    
    if (activeTab === 'profile') {
      const result = await authService.updateProfile(user.id, {
        full_name: formData.name,
        specialization: formData.specialization,
        hospital_name: formData.hospital,
        city: formData.city
      })

      if (result.success) {
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      } else {
        alert("Failed to save profile: " + (result.error?.message || "Unknown error"))
      }
    } else if (activeTab === 'notifications') {
      // Mock saving notifications preferences
      localStorage.setItem('medtriage_alerts', JSON.stringify({
         notificationsEnabled: formData.notificationsEnabled,
         highRiskAlerts: formData.highRiskAlerts
      }))
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    }

    setIsSaving(false)
  }

  const handlePasswordReset = async () => {
    if (!formData.email || formData.email === 'N/A') return
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email)
      if (error) throw error
      alert("Password reset link sent to your email addressed.")
    } catch (err) {
      alert("Failed to send reset link: " + err.message)
    }
  }

  const initials = fullName.substring(0, 2).toUpperCase()

  return (
    <div className="max-w-4xl mx-auto pb-12 overflow-x-hidden">
      <div className="mb-8 border-b border-primary pb-8 flex items-end justify-between">
        <div>
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-tight break-words">
            SYSTEM PROFILE
          </h2>
          <p className="mt-2 font-mono-technical text-sm opacity-80 break-words">
            MANAGE YOUR CLINICIAN IDS AND PREFERENCES
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start w-full">
        {/* Left Config Menu */}
        <div className="w-full md:w-64 flex flex-col gap-2 shrink-0">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-3 px-4 py-3 font-mono-technical text-sm transition-all text-left w-full border border-primary ${activeTab === 'profile' ? 'bg-primary text-on-primary shadow-[4px_4px_0_var(--color-primary)]' : 'bg-surface hover:bg-surface-container'}`}
          >
            <User size={16} /> PROFILE DETAILS
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-3 px-4 py-3 font-mono-technical text-sm transition-all text-left w-full border border-primary ${activeTab === 'notifications' ? 'bg-primary text-on-primary shadow-[4px_4px_0_var(--color-primary)]' : 'bg-surface hover:bg-surface-container'}`}
          >
            <Bell size={16} /> NOTIFICATIONS
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-3 px-4 py-3 font-mono-technical text-sm transition-all text-left w-full border border-primary ${activeTab === 'security' ? 'bg-primary text-on-primary shadow-[4px_4px_0_var(--color-primary)]' : 'bg-surface hover:bg-surface-container'}`}
          >
            <Key size={16} /> SECURITY & AUTH
          </button>
        </div>

        {/* Right Content Pane */}
        <div className="flex-1 min-w-0 bg-surface border border-primary p-6 md:p-8 shadow-brutal w-full relative overflow-hidden">
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 halftone-overlay opacity-20 pointer-events-none"></div>

          {activeTab === 'profile' && (
            <div className="relative z-10 animate-fade-in">
              <div className="flex items-center gap-6 mb-8 pb-8 border-b border-primary/20">
                <div className="w-24 h-24 border-2 border-primary bg-primary text-on-primary flex items-center justify-center font-mono-technical font-black text-3xl">
                  {initials}
                </div>
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter">{formData.name}</h3>
                  <div className="font-mono-technical text-xs mt-1 bg-surface-container inline-block px-2 py-1 border border-primary">{formData.specialization.toUpperCase()}</div>
                </div>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="font-mono-technical text-[10px] uppercase block opacity-80">Full Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-surface-container border border-primary p-3 font-mono-technical text-sm outline-none focus:bg-white" />
                  </div>
                  <div className="space-y-2">
                    <label className="font-mono-technical text-[10px] uppercase block opacity-80">Clinician Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} disabled className="w-full bg-surface-container/50 border border-primary/50 opacity-60 p-3 font-mono-technical text-sm outline-none cursor-not-allowed" />
                  </div>
                  <div className="space-y-2">
                    <label className="font-mono-technical text-[10px] uppercase block opacity-80">Specialization</label>
                    <input type="text" name="specialization" value={formData.specialization} onChange={handleChange} className="w-full bg-surface-container border border-primary p-3 font-mono-technical text-sm outline-none focus:bg-white" />
                  </div>

                  <div className="space-y-2">
                    <label className="font-mono-technical text-[10px] uppercase block opacity-80">Primary Affiliation</label>
                    <input type="text" name="hospital" value={formData.hospital} onChange={handleChange} className="w-full bg-surface-container border border-primary p-3 font-mono-technical text-sm outline-none focus:bg-white" />
                  </div>
                  <div className="space-y-2">
                    <label className="font-mono-technical text-[10px] uppercase block opacity-80">City</label>
                    <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full bg-surface-container border border-primary p-3 font-mono-technical text-sm outline-none focus:bg-white" />
                  </div>
                </div>
                
                <div className="pt-6 border-t border-primary/20 flex flex-col gap-3">
                  {saveSuccess && (
                    <div className="border border-green-500 bg-green-50 text-green-700 p-3 font-mono-technical text-xs flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
                      PROFILE UPDATED SUCCESSFULLY
                    </div>
                  )}
                  <div className="flex justify-end">
                  <button type="submit" disabled={isSaving} className="border border-primary bg-primary text-on-primary px-8 py-3 font-mono-technical text-sm font-bold uppercase transition-transform hover:-translate-y-1 hover:shadow-brutal flex items-center gap-2">
                    {isSaving ? 'UPDATING...' : <><Save size={16} className="inline mr-2" /> SAVE CHANGES</>}
                  </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="relative z-10 animate-fade-in">
              <h3 className="text-xl font-black uppercase tracking-tighter mb-6">Alert Preferences</h3>
              <form onSubmit={handleSave} className="space-y-6">
                 <div className="flex items-center justify-between p-4 border border-primary bg-surface-container">
                   <div>
                     <p className="font-bold font-mono-technical text-sm">System Notifications</p>
                     <p className="text-[10px] font-mono-technical opacity-60">Receive general push updates for incoming cases.</p>
                   </div>
                   <input type="checkbox" name="notificationsEnabled" checked={formData.notificationsEnabled} onChange={handleChange} className="w-5 h-5 accent-primary" />
                 </div>

                 <div className="flex items-center justify-between p-4 border border-[#DC2626] bg-red-50">
                   <div>
                     <p className="font-bold font-mono-technical text-sm text-[#DC2626] flex items-center gap-2"><ShieldAlert size={14} /> Critical Risk Override</p>
                     <p className="text-[10px] font-mono-technical text-[#DC2626]/80">Bypass do-not-disturb for immediate HIGH RISK triage alerts.</p>
                   </div>
                   <input type="checkbox" name="highRiskAlerts" checked={formData.highRiskAlerts} onChange={handleChange} className="w-5 h-5 accent-[#DC2626]" />
                 </div>

                 <div className="pt-6 border-t border-primary/20 flex flex-col gap-3">
                  {saveSuccess && (
                    <div className="border border-green-500 bg-green-50 text-green-700 p-3 font-mono-technical text-xs flex items-center gap-2">
                       <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
                       PREFERENCES UPDATED SUCCESSFULLY
                    </div>
                  )}
                  <div className="flex justify-end">
                    <button type="submit" disabled={isSaving} className="border border-primary bg-primary text-on-primary px-8 py-3 font-mono-technical text-sm font-bold uppercase transition-transform hover:-translate-y-1 hover:shadow-brutal flex items-center gap-2">
                      {isSaving ? 'UPDATING...' : <><Save size={16} className="inline mr-2" /> SAVE SETTINGS</>}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="relative z-10 animate-fade-in flex flex-col items-center justify-center py-12 text-center">
               <Key size={48} className="mb-4 opacity-40 mx-auto" />
               <h3 className="text-xl font-black uppercase tracking-tighter mb-2">Change Password</h3>
               <p className="font-mono-technical text-xs opacity-60 mb-6 max-w-sm">Secure authorization requires re-authentication to modify credentials.</p>
               <button 
                 onClick={handlePasswordReset}
                 className="border border-primary px-6 py-2 font-mono-technical text-sm font-bold uppercase hover:bg-surface-container"
               >
                 Request Reset Link
               </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
