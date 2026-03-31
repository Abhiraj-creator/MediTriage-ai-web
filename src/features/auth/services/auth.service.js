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
        await supabase.from(TABLES.DOCTOR_PROFILES).insert([{
          id: data.user.id,
          ...profileData
        }])
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

  async fetchDoctorProfile(userId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.DOCTOR_PROFILES)
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          console.warn('No doctor profile found, using fallback/mock.')
          const mockProfile = { name: "Dr. Admin", role: "Attending", specialization: "Emergency Medicine" }
          useAuthStore.getState().setDoctorProfile(mockProfile)
          return
        }
        throw error
      }
      
      useAuthStore.getState().setDoctorProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
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
  }
}
