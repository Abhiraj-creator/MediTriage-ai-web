import { supabase } from '../../../config/supabase'
import { TABLES, CASE_STATUS } from '../../../config/constants'

export const triageService = {
  async getCases() {
    try {
      const { data, error } = await supabase
        .from('v_triage_cases')
        .select(`id, patient_name, patient_age, patient_gender, risk_level, ai_confidence, symptoms, status, created_at, ai_summary, ai_recommendation`)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) {
        console.error('DB fetch error', error)
      }

      if (error || !data || data.length === 0) {
        console.warn('DB fetch error or empty, falling back to mock queue.')
        return [
          {
            id: 'TC-2026-001',
            patient_name: 'Rahul Sharma',
            patient_age: 45,
            patient_gender: 'Male',
            risk_level: 'HIGH',
            ai_confidence: 94,
            symptoms: ['Chest pain', 'Shortness of breath', 'Sweating'],
            status: 'pending',
            created_at: new Date().toISOString(),
            ai_summary: 'Patient presents with classic signs of acute myocardial infarction.',
          },
          {
            id: 'TC-2026-002',
            patient_name: 'Anjali Desai',
            patient_age: 28,
            patient_gender: 'Female',
            risk_level: 'MEDIUM',
            ai_confidence: 88,
            symptoms: ['Acute abdominal pain', 'Nausea', 'Fever'],
            status: 'pending',
            created_at: new Date(Date.now() - 3600000).toISOString(),
            ai_summary: 'Possible appendicitis or severe gastrointestinal infection.',
          },
          {
            id: 'TC-2026-003',
            patient_name: 'Vikram Singh',
            patient_age: 35,
            patient_gender: 'Male',
            risk_level: 'LOW',
            ai_confidence: 96,
            symptoms: ['Mild cough', 'Sore throat'],
            status: 'reviewed',
            created_at: new Date(Date.now() - 7200000).toISOString(),
            ai_summary: 'Symptoms align with mild upper respiratory tract infection.',
          }
        ]
      }
      return data
    } catch (error) {
      console.error('Service: Error getting cases', error)
      return []
    }
  },

  // Helper to validate UUID
  isUUID(uuid) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  },

  // Get singular case detail — tries view first (with patient_name), falls back to raw table
  async getCaseById(caseId) {
    try {
      if (!this.isUUID(caseId)) {
         throw new Error('Not a valid UUID, skipping DB fetch to avoid 400 error')
      }

      // Try the view first (has patient_name, patient_age, patient_gender joined)
      const { data: viewData, error: viewError } = await supabase
        .from('v_triage_cases')
        .select('*')
        .eq('id', caseId)
        .single()

      if (!viewError && viewData) return viewData

      // Fallback to raw table if view fails
      const { data, error } = await supabase
        .from(TABLES.TRIAGE_CASES)
        .select('*')
        .eq('id', caseId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.warn(`Service: Skipping DB for case ${caseId} (Mock fallback triggered)`)
      return null
    }
  },

  // Update status (e.g. mark as reviewed or escalated)
  async updateCaseStatus(caseId, status) {
    try {
      if (!this.isUUID(caseId)) {
        throw new Error('Not a valid UUID, skipping DB update')
      }

      const { data, error } = await supabase
        .from(TABLES.TRIAGE_CASES)
        .update({ status })
        .eq('id', caseId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.warn(`Service: Skipping DB update for mock case status`)
      return null
    }
  }
}
