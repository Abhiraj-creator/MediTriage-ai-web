import { supabase } from '../../../config/supabase'
import { TABLES } from '../../../config/constants'

export const feedbackService = {
  async submitFeedback({ caseId, doctorId, rating, feedbackText, riskOverride, doctorNote }) {
    // 1. Insert feedback
    const { error: feedbackError } = await supabase
      .from(TABLES.AI_FEEDBACK)
      .insert({
        case_id:       caseId,
        doctor_id:     doctorId,
        rating,
        feedback_text: feedbackText,
        risk_override: riskOverride || null,
        doctor_note:   doctorNote,
      })

    if (feedbackError) throw feedbackError

    // 2. Update case
    const updatePayload = {
      verified_by_doctor: true,
      status:             'reviewed',
      updated_at:         new Date().toISOString(),
    }

    if (riskOverride) {
      updatePayload.risk_level = riskOverride
    }

    const { error: caseError } = await supabase
      .from(TABLES.TRIAGE_CASES)
      .update(updatePayload)
      .eq('id', caseId)

    if (caseError) throw caseError
  },
}
