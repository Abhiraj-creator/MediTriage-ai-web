import { supabase } from '../../../config/supabase'
import { TABLES } from '../../../config/constants'
import { useAuthStore } from '../../../store/auth.store'

export const authService = {
  async signIn(email, password) {
    try {
      useAuthStore.getState().setLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error

      await this.fetchDoctorProfile(data.user.id)
      return { success: true }
    } catch (error) {
      console.error('Sign in error:', error)
      useAuthStore.getState().setError(error.message)
      return { success: false, error }
    } finally {
      useAuthStore.getState().setLoading(false)
    }
  },

  async signUp(email, password, profileData) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      
      if (error) {
        if (error.message.includes('User already registered') || error.code === 'user_already_exists') {
          return { 
            success: false, 
            error: { ...error, isExisting: true, message: 'This email is already registered. Please sign in instead.' } 
          }
        }
        throw error
      }

      if (data?.user?.id) {
        const { error: profileError } = await supabase
          .from(TABLES.PROFILES)
          .upsert([{
            user_id: data.user.id,
            email,
            full_name: profileData?.full_name || profileData?.name || '',
            role: profileData?.role || 'doctor',
            specialization: profileData?.specialization || '',
          }], { onConflict: 'user_id' })
        if (profileError) console.warn('Profile insert error (non-fatal):', profileError)
      }

      return { success: true }
    } catch (error) {
      console.error('Sign up error:', error)
      return { success: false, error }
    }
  },

  async signUpPatient(email, password, profileData) {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) throw error

      if (data?.user?.id) {
        // Insert into patient_profiles table
        const { error: profileError } = await supabase
          .from('patient_profiles')
          .upsert([{
            user_id: data.user.id,
            full_name: profileData.full_name,
            age: profileData.age,
            gender: profileData.gender,
            known_conditions: profileData.known_conditions || [],
            smoking: profileData.smoking,
            alcohol: profileData.alcohol,
            height_feet: profileData.height_feet,
            past_heart_attack: profileData.past_heart_attack,
            past_surgery: profileData.past_surgery,
          }])
        if (profileError) console.warn('Patient profile insert error:', profileError)

        // Also insert into profiles table with role=patient for auth routing
        await supabase
          .from(TABLES.PROFILES)
          .upsert([{
            user_id: data.user.id,
            email,
            full_name: profileData.full_name,
            role: 'patient',
          }], { onConflict: 'user_id' })
      }

      return { success: true }
    } catch (error) {
      console.error('Patient signup error:', error)
      return { success: false, error }
    }
  },

  async signInWithGoogle() {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/dashboard'
        }
      })
      if (error) throw error
    } catch (error) {
      console.error('Google Sign in error:', error)
      useAuthStore.getState().setError(error.message)
    }
  },

  async signOut() {
    await supabase.auth.signOut()
    useAuthStore.getState().setSession(null)
    useAuthStore.getState().setDoctorProfile(null)
    useAuthStore.getState().setRole(null)
  },

  // Fetches from 'profiles' table and sets role for route guards
  async fetchDoctorProfile(userId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.PROFILES)
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile row yet
          console.warn('No profile found for user, using session fallback.')
          const { data: sessionData } = await supabase.auth.getSession()
          const email = sessionData?.session?.user?.email || 'Doctor'
          const metaName = sessionData?.session?.user?.user_metadata?.name || sessionData?.session?.user?.user_metadata?.full_name
          const mockName = metaName || email.split('@')[0]
          useAuthStore.getState().setDoctorProfile({
            full_name: mockName,
            role: 'doctor',
            specialization: sessionData?.session?.user?.user_metadata?.specialization || '',
            needsOnboarding: true,
          })
          useAuthStore.getState().setRole('doctor')
          return
        }
        throw error
      }

      useAuthStore.getState().setDoctorProfile(data)
      // Set role in store for PatientRoute / ProtectedRoute guards
      useAuthStore.getState().setRole(data.role || 'doctor')
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      useAuthStore.getState().setLoading(false)
    }
  },

  initAuthStateListener() {
    supabase.auth.getSession().then(({ data: { session } }) => {
      useAuthStore.getState().setSession(session)
      if (session?.user) {
        this.fetchDoctorProfile(session.user.id)
      } else {
        useAuthStore.getState().setLoading(false)
      }
    })

    return supabase.auth.onAuthStateChange((_event, session) => {
      useAuthStore.getState().setSession(session)
      if (session?.user) {
        this.fetchDoctorProfile(session.user.id)
      }
    })
  },

  async updateProfile(userId, profileData) {
    try {
      const { error } = await supabase
        .from(TABLES.PROFILES)
        .upsert([{
          user_id: userId,
          ...profileData
        }], { onConflict: 'user_id' })
      
      if (error) throw error
      
      await this.fetchDoctorProfile(userId)
      return { success: true }
    } catch (error) {
      console.error('Update profile error:', error)
      return { success: false, error }
    }
  }
}
