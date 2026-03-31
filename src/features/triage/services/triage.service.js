import { supabase } from '../../../config/supabase'
import { TABLES, CASE_STATUS } from '../../../config/constants'

export const triageService = {
  // Fetch initial list of pending & explicitly requested cases
  async getCases() {
    try {
      // Assuming 'status' helps us filter what's shown on dashboard
      const { data, error } = await supabase
        .from(TABLES.TRIAGE_CASES)
        .select(`
          id,
          patient_name,
          patient_age,
          patient_gender,
          risk_level,
          ai_confidence,
          symptoms,
          status,
          created_at,
          ai_summary,
          ai_recommendation
        `)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) {
        // Fallback for mocked mode or DB access errors
        console.warn('DB fetch error, falling back to empty state or mock: ', error.message)
        return []
      }
      return data || []
    } catch (error) {
      console.error('Service: Error getting cases', error)
      return []
    }
  },

  // Get singular case detail, expanding to patient profile if needed
  async getCaseById(caseId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.TRIAGE_CASES)
        .select('*')
        .eq('id', caseId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error(`Service: Error getting case ${caseId}`, error)
      return null
    }
  },

  // Update status (e.g. mark as reviewed or escalated)
  async updateCaseStatus(caseId, status) {
    try {
      const { data, error } = await supabase
        .from(TABLES.TRIAGE_CASES)
        .update({ status })
        .eq('id', caseId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error(`Service: Error updating case status`, error)
      return null
    }
  }
}
