import { useEffect, useRef } from 'react'
import { supabase } from '../../../config/supabase'
import { TABLES } from '../../../config/constants'
import { useTriageStore } from '../../../store/triage.store'
import { triageService } from '../services/triage.service'
import { useToast } from './useToast'

export const useRealtimeCases = () => {
  const { setCases, addCase, updateCase, setLoading, setError, setConnectionStatus } = useTriageStore()
  const initialized = useRef(false)
  const { showHighRiskToast } = useToast()

  const fetchInitialCases = async () => {
    setLoading(true)
    setError(null)
    const data = await triageService.getCases()
    if (data) {
      setCases(data)
    } else {
      setError('Failed to fetch initial cases.')
    }
    setLoading(false)
  }

  useEffect(() => {
    // Fetch once on mount
    if (!initialized.current) {
      initialized.current = true
      fetchInitialCases()
    }

    // Supabase Realtime: listen on the raw triage_cases table for changes
    const casesSubscription = supabase
      .channel('public:triage_cases')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: TABLES.TRIAGE_CASES },
        async (payload) => {
          console.log('New case arrived (raw):', payload.new)

          // Re-fetch this specific case from the VIEW so we get patient_name etc.
          try {
            const { data } = await supabase
              .from('v_triage_cases')
              .select('id, patient_name, patient_age, patient_gender, risk_level, ai_confidence, symptoms, status, created_at, ai_summary, ai_recommendation')
              .eq('id', payload.new.id)
              .single()

            if (data) {
              addCase(data)
              if (data.risk_level === 'HIGH') {
                showHighRiskToast(data)
              }
            } else {
              // Fallback: add the raw payload (no patient name)
              addCase(payload.new)
            }
          } catch (e) {
            console.warn('Could not re-fetch new case from view, using raw payload', e)
            addCase(payload.new)
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
      .subscribe((status) => {
        console.log('Case subscription status:', status)
        setConnectionStatus(status === 'SUBSCRIBED' ? 'SUBSCRIBED' : 'DISCONNECTED')
      })

    return () => {
      supabase.removeChannel(casesSubscription)
    }
  }, []) // Empty dep array — run once per mount

  return { refetch: fetchInitialCases }
}
