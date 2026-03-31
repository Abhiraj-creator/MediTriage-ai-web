import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user: null,
  doctorProfile: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  setSession: (session) => set({
    user: session?.user || null,
    isAuthenticated: !!session,
  }),
  
  setDoctorProfile: (profile) => set({
    doctorProfile: profile,
  }),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}))
