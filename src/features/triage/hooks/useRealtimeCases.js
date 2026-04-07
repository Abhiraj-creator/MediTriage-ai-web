import { useCallback, useEffect, useRef } from 'react'
import { supabase } from '../../../config/supabase'
import { TABLES } from '../../../config/constants'
import { useTriageStore } from '../../../store/triage.store'
import { triageService } from '../services/triage.service'
import { useToast } from './useToast'
import { useAuth } from '../../auth/hooks/useAuth'


export const useRealtimeCases = () => {
  const { setCases, addCase, updateCase, setLoading, setError, setConnectionStatus } = useTriageStore()
  const { user, doctorProfile } = useAuth()
  const initialized = useRef(false)
  const { showHighRiskToast } = useToast()

  const fetchInitialCases = useCallback(async () => {
    if (!doctorProfile?.id) return

    setLoading(true)
    setError(null)
    try {
      const data = await triageService.getCases(doctorProfile.id)
      if (data) {
        setCases(data)
      }
    } catch (e) {
      setError('Failed to fetch initial cases.')
    } finally {
      setLoading(false)
    }
  }, [doctorProfile?.id, setCases, setLoading, setError])

  useEffect(() => {
    if (!doctorProfile?.id) return

    // Fetch once when doctor profile is ready
    if (!initialized.current) {
      initialized.current = true
      fetchInitialCases()
    }

    // Supabase Realtime: listen on the raw triage_cases table for changes
    const casesSubscription = supabase
      .channel(`public:triage_cases:doctor:${doctorProfile.id}`)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: TABLES.TRIAGE_CASES,
          // Note: Realtime RLS handles server-side filtering if enabled
          // but we add a client-side check for robustness
        },
        async (payload) => {
          // Client-side filtering: only process if assigned to this doctor
          if (payload.new.doctor_id !== doctorProfile.id) return

          console.log('New case arrived for this doctor:', payload.new)

          // Re-fetch this specific case from the VIEW so we get patient info
          try {
            const { data } = await supabase
              .from('v_triage_cases') // View handles the join
              .select('*')
              .eq('id', payload.new.id)
              .single()

            if (data) {
              addCase(data)
              if (data.risk_level === 'HIGH') {
                showHighRiskToast(data)
              }
            } else {
              addCase(payload.new)
            }
          } catch (e) {
            console.warn('Could not re-fetch new case from view', e)
            addCase(payload.new)
          }
        }
      )
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: TABLES.TRIAGE_CASES 
        },
        (payload) => {
          if (payload.new.doctor_id !== doctorProfile.id) return
          
          if (payload.eventType === 'UPDATE') {
            updateCase(payload.new)
          } else if (payload.eventType === 'DELETE') {
            // Optional: handle deletions if supported by store
          }
        }
      )
      .subscribe((status) => {
        setConnectionStatus(status === 'SUBSCRIBED' ? 'SUBSCRIBED' : 'DISCONNECTED')
      })

    return () => {
      supabase.removeChannel(casesSubscription)
    }
  }, [doctorProfile?.id, fetchInitialCases, addCase, updateCase, setConnectionStatus, showHighRiskToast])

  return { refetch: fetchInitialCases }
}
