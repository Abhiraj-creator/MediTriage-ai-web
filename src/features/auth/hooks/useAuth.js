import { useEffect } from 'react'
import { authService } from '../services/auth.service'
import { useAuthStore } from '../../../store/auth.store'

export const useAuth = () => {
  const { user, doctorProfile, isAuthenticated, isLoading, error } = useAuthStore()

  useEffect(() => {
    const { data: { subscription } } = authService.initAuthStateListener()
    
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return {
    user,
    doctorProfile,
    isAuthenticated,
    isLoading,
    error,
    signIn: authService.signIn.bind(authService),
    signOut: authService.signOut.bind(authService),
  }
}
