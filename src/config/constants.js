export const RISK_LEVELS = {
  HIGH:   'HIGH',
  MEDIUM: 'MEDIUM',
  LOW:    'LOW',
}

export const CASE_STATUS = {
  PENDING:   'pending',
  REVIEWED:  'reviewed',
  ESCALATED: 'escalated',
  CLOSED:    'closed',
}

export const TABLES = {
  USERS:            'users',
  PROFILES:         'profiles',        // Supabase auth profiles (doctor/patient meta)
  DOCTOR_PROFILES:  'profiles',        // alias kept for backward compat → maps to 'profiles'
  PATIENT_PROFILES: 'patient_profiles',
  TRIAGE_CASES:     'triage_cases',
  TRIAGE_CASES_VIEW: 'v_triage_cases', // view that joins patient_profiles onto triage_cases
  AI_FEEDBACK:      'ai_feedback',     // may not exist, service falls back to mock
}

export const RISK_CONFIG = {
  HIGH: {
    label:   'HIGH RISK',
    color:   '#DC2626',
    bg:      '#FEF2F2',
    border:  '#FECACA',
    glow:    true,
    sound:   true,
    sortOrder: 0,
  },
  MEDIUM: {
    label:   'MODERATE',
    color:   '#D97706',
    bg:      '#FFFBEB',
    border:  '#FDE68A',
    glow:    false,
    sound:   false,
    sortOrder: 1,
  },
  LOW: {
    label:   'LOW RISK',
    color:   '#16A34A',
    bg:      '#F0FDF4',
    border:  '#BBF7D0',
    glow:    false,
    sound:   false,
    sortOrder: 2,
  },
}
