import { useEffect, useRef } from 'react'
import { supabase } from '../../../config/supabase'
import { TABLES } from '../../../config/constants'
import { useTriageStore } from '../../../store/triage.store'
import { triageService } from '../services/triage.service'
import { useToast } from './useToast' // We will build this next

export const useRealtimeCases = () => {
  const { setCases, addCase, updateCase, setLoading, setError } = useTriageStore()
  const initialized = useRef(false)
  const { showHighRiskToast } = useToast()

  useEffect(() => {
    // Only fetch once
    if (!initialized.current) {
      initialized.current = true
      fetchInitialCases()
    }

    // Set up Supabase Realtime Subscription for INSERT and UPDATE
    const casesSubscription = supabase
      .channel('public:triage_cases')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: TABLES.TRIAGE_CASES },
        (payload) => {
          console.log('New case arrived:', payload.new)
          addCase(payload.new)
          
          // Trigger alert if high risk
          if (payload.new.risk_level === 'HIGH') {
            showHighRiskToast(payload.new)
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: TABLES.TRIAGE_CASES },
        (payload) => {
          console.log('Case updated:', payload.new)
          updateCase(payload.new)
        }
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(casesSubscription)
    }
  }, []) // Empty dep array so it only runs once per mount

  const fetchInitialCases = async () => {
    setLoading(true)
    setError(null)
    
    // Only attempt fetch if Supabase URL is active
    if (!import.meta.env.VITE_SUPABASE_URL) {
      console.log('MOCK MODE: Skipping DB fetch, using loaded MOCK_CASES in component')
      setLoading(false)
      return
    }

    const data = await triageService.getCases()
    if (data) {
      setCases(data)
    } else {
      setError('Failed to fetch initial cases.')
    }
    setLoading(false)
  }

  // Allow manual refetch if needed
  return {
    refetch: fetchInitialCases
  }
}
