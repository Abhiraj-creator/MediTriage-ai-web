import { supabase } from '../../../config/supabase'
import { TABLES } from '../../../config/constants'

export const feedbackService = {
  async submitFeedback(caseId, doctorId, feedbackText, correctedRiskLevel = null) {
    try {
      const payload = {
        case_id: caseId,
        doctor_id: doctorId,
        feedback: feedbackText,
        corrected_risk_level: correctedRiskLevel,
        reviewed_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('ai_feedback')
        .insert([payload])

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Failed to submit feedback:', error)
      return { success: false, error }
    }
  }
}
