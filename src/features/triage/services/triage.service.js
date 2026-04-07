import { supabase } from '../../../config/supabase'
import { TABLES } from '../../../config/constants'

export const triageService = {
  // Fetches all triage cases visible to the current authenticated doctor.
  // RLS policy on triage_cases: doctor_id = auth.uid() AND sent_to_doctor = true.
  // We join patient_profiles so the UI never falls back to mock patient info.
  // Fetches triage cases assigned specifically to the currently logged in doctor.
  // The filtering is handled by the "Doctors view assigned cases only" RLS policy in Supabase.
  // Fetches triage cases assigned specifically to the currently logged in doctor.
  async getCases(doctorProfileId) {
    if (!doctorProfileId) return []

    const { data, error } = await supabase
      .from(TABLES.TRIAGE_CASES)
      .select(`
        id, patient_id, risk_level, ai_confidence, detected_symptoms,
        status, created_at, ai_summary, ai_recommendation, doctor_id, sent_to_doctor,
        patient_profiles!fk_patient (
          full_name, age, gender, blood_group, known_conditions,
          emergency_contact_name, emergency_contact_phone, allergies
        )
      `)
      .eq('doctor_id', doctorProfileId)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      console.error('triageService.getCases error:', error)
      return []
    }

    return data || []
  },

  // Helper: validate UUID to avoid 400 errors on mock IDs like 'TC-2026-001'
  isUUID(uuid) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(uuid)
  },

  // Fetches a single case with patient profile and prior visit history.
  async getCaseById(caseId) {
    if (!this.isUUID(caseId)) {
      console.warn(`getCaseById: '${caseId}' is not a valid UUID — skipping DB fetch.`)
      return null
    }

    const { data, error } = await supabase
      .from(TABLES.TRIAGE_CASES)
      .select(`
        *,
        patient_profiles (
          full_name, age, gender, blood_group, known_conditions,
          emergency_contact_name, emergency_contact_phone, allergies,
          smoking, alcohol, past_heart_attack, past_surgery
        )
      `)
      .eq('id', caseId)
      .single()

    if (error) {
      console.error(`getCaseById error for ${caseId}:`, error)
      return null
    }

    // Fetch prior visits for this patient (excluding the current case)
    const { data: historyData } = await supabase
      .from(TABLES.TRIAGE_CASES)
      .select('created_at, risk_level, detected_symptoms, status, ai_summary')
      .eq('patient_id', data.patient_id)
      .neq('id', caseId)
      .order('created_at', { ascending: false })
      .limit(5)

    data.visit_history = (historyData || []).map(h => ({
      date: new Date(h.created_at).toLocaleDateString('en-IN'),
      risk: h.risk_level,
      complaint: (h.detected_symptoms || [])[0] || 'Unknown complaint',
      outcome: h.status === 'resolved'
        ? 'Resolved — ' + (h.ai_summary?.split('.')[0] || 'No summary')
        : h.status?.toUpperCase() || 'PENDING',
    }))

    return data
  },

  // Updates case status in the database (e.g. reviewed, resolved, admitted)
  async updateCaseStatus(caseId, status) {
    if (!this.isUUID(caseId)) {
      console.warn(`updateCaseStatus: '${caseId}' is not a valid UUID — skipping DB update.`)
      return null
    }

    const { data, error } = await supabase
      .from(TABLES.TRIAGE_CASES)
      .update({ status })
      .eq('id', caseId)
      .select()
      .single()

    if (error) {
      console.warn(`updateCaseStatus error for ${caseId}:`, error)
      return null
    }

    return data
  },
}
