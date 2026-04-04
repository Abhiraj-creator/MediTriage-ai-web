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
      
      if (error) throw error

      if (data?.user?.id) {
        // Upsert into 'profiles' table (the actual table in Supabase)
        const { error: profileError } = await supabase
          .from(TABLES.PROFILES)
          .upsert([{
            id: data.user.id,
            email,
            full_name: profileData?.full_name || profileData?.name || '',
            role: profileData?.role || 'doctor',
          }])
        if (profileError) console.warn('Profile insert error (non-fatal):', profileError)
      }

      return { success: true }
    } catch (error) {
      console.error('Sign up error:', error)
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
  },

  // Fetches from 'profiles' table — the actual schema in Supabase
  async fetchDoctorProfile(userId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.PROFILES)
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile row yet — use session email as fallback display name
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
          return
        }
        throw error
      }

      useAuthStore.getState().setDoctorProfile(data)
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
          id: userId,
          ...profileData
        }])
      if (error) throw error
      
      await this.fetchDoctorProfile(userId)
      return { success: true }
    } catch (error) {
      console.error('Update profile error:', error)
      return { success: false, error }
    }
  }
}
