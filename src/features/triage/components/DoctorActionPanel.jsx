import { useState,useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Calendar, MessageSquare, ExternalLink, ChevronDown, XCircle } from 'lucide-react'
import { whatsappService } from '../services/whatsapp.service'
import { triageService } from '../services/triage.service'
import { supabase } from '../../../config/supabase'

export const DoctorActionPanel = ({ caseItem, doctorProfile, initialPanel, onCaseUpdate }) => {
  const patientPhone = 
    caseItem.patient_profiles?.phone ||
    caseItem.patient_profiles?.emergency_contact_phone ||
    null

  const patientName = caseItem.patient_profiles?.full_name || caseItem.patient_name || 'Patient'
  const doctorName = doctorProfile?.full_name || 'Doctor'
  const doctorSpec = doctorProfile?.specialization || 'General Physician'
  const hospitalName = doctorProfile?.hospital_name || ''

  const [activePanel, setActivePanel] = useState(null) // 'approve' | 'appointment' | null
  const [doctorNote, setDoctorNote] = useState(caseItem.ai_recommendation || '')
  const [isSending, setIsSending] = useState(false)
  const [sent, setSent] = useState(null) // 'approved' | 'appointment' | 'rejected'
  const [sentMethod, setSentMethod] = useState(null) // 'app' | 'whatsapp'
  const [notificationMsg, setNotificationMsg] = useState('')

  // Default messages based on action
  useEffect(() => {
    if (activePanel === 'approve') {
      setNotificationMsg(`Dr. ${doctorName} has reviewed your case and provided instructions.`)
    } else if (activePanel === 'appointment') {
      setNotificationMsg(`Dr. ${doctorName} has scheduled an in-person appointment for you.`)
    } else if (activePanel === 'reject') {
      setNotificationMsg(`Dr. ${doctorName} has overridden the AI report with a manual assessment.`)
    }
  }, [activePanel, doctorName])

  // Sync with top bar buttons
  useEffect(() => {
    if (initialPanel) setActivePanel(initialPanel)
  }, [initialPanel])

  // Appointment state
  const [appointmentDate, setAppointmentDate] = useState('')
  const [appointmentTime, setAppointmentTime] = useState('')
  const [appointmentNotes, setAppointmentNotes] = useState('')

  // Save action to Supabase and open WhatsApp
  const handleApprove = async (method) => {
    setIsSending(true)
    try {
      // 1. Update case status to 'closed' (approved by doctor)
      await triageService.updateCaseStatus(caseItem.id, 'closed')

      // 2. Save doctor action log to Supabase
      const { error: actionErr } = await supabase.from('doctor_actions').insert({
        case_id: caseItem.id,
        doctor_id: doctorProfile?.id,
        action_type: 'approved',
        doctor_note: doctorNote,
        sent_via: method,
        created_at: new Date().toISOString(),
      });
      
      if (actionErr) {
        console.error('doctor_actions insert err:', actionErr);
        throw actionErr;
      }
      console.log("✓ doctor_actions (approval) saved");

      // 3. Send to patient mobile app via notifications table
      if (method === 'app') {
        console.log('Sending APP notifications for case:', caseItem.id);
        
        // Doctor notification log (audit trail of notifications sent)
        const { error: dNotifErr } = await supabase.from('doctor_notifications').insert({
          case_id: caseItem.id,
          type: 'REPORT_REVIEWED',
          message: notificationMsg || `Dr. ${doctorName} has reviewed your case and provided instructions.`,
          read: false,
          sent_at: new Date().toISOString()
        });
        
        if (dNotifErr) console.error("doctor_notifications error:", dNotifErr);
        else console.log("✓ doctor_notifications saved");

        // Patient notification (targets specific patient mobile app)
        if (caseItem.patient_id) {
          const { error: pNotifErr } = await supabase.from('patient_notifications').insert({
            patient_id: caseItem.patient_id,
            title: 'Triage Case Reviewed',
            message: notificationMsg || `Dr. ${doctorName} has reviewed your case and provided instructions.`,
            type: 'REPORT_REVIEWED',
            payload: { riskLevel: caseItem.risk_level, doctorNote },
            is_read: false,
            created_at: new Date().toISOString()
          });
          
          if (pNotifErr) console.error("patient_notifications error:", pNotifErr);
          else console.log("✓ patient_notifications saved");
        } else {
          console.warn("Skipping patient_notifications: caseItem.patient_id is missing.");
        }
      }

      // 4. Update parent state
      onCaseUpdate({ ...caseItem, status: 'closed' })
      setSent('approved')
      setSentMethod(method)

      // 5. Open WhatsApp if phone available
      if (method === 'whatsapp') {
        if (patientPhone) {
          const waUrl = whatsappService.sendApprovalReport({
            patientPhone,
            patientName,
            doctorName,
            doctorSpecialization: doctorSpec,
            riskLevel: caseItem.risk_level,
            aiSummary: caseItem.ai_summary,
            aiRecommendation: caseItem.ai_recommendation,
            doctorNote,
            caseId: caseItem.id,
          })
          window.open(waUrl, '_blank')
        } else {
          alert('No phone number on file for WhatsApp.')
        }
      }
    } catch(e) {
      console.error('Approve action failed:', e)
      alert(`Failed to approve triage: ${e.message || 'Unknown error'}`)
    } finally {
      setIsSending(false)
    }
  }

  const handleBookAppointment = async (method) => {
    if (!appointmentDate || !appointmentTime) return
    setIsSending(true)
    try {
      // 1. Update case status to 'escalated'
      await triageService.updateCaseStatus(caseItem.id, 'escalated')

      // 2. Save appointment to Supabase
      const { error: apptErr } = await supabase.from('appointments').insert({
        case_id: caseItem.id,
        doctor_id: doctorProfile?.id,
        patient_id: caseItem.patient_id,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        notes: appointmentNotes,
        status: 'scheduled',
        created_at: new Date().toISOString(),
      });
      
      if (apptErr) {
        console.error('Appointment insert err:', apptErr);
        throw apptErr;
      }

      const { error: actionErr } = await supabase.from('doctor_actions').insert({
        case_id: caseItem.id,
        doctor_id: doctorProfile?.id,
        action_type: 'appointment_booked',
        doctor_note: appointmentNotes,
        sent_via: method,
        created_at: new Date().toISOString(),
      });

      if (actionErr) {
        console.error('doctor_actions insert err:', actionErr);
        throw actionErr;
      }
      console.log("✓ doctor_actions (appointment) saved");

      // 3. Send to patient mobile app via notifications table
      if (method === 'app') {
        console.log('Sending APP appointment notifications for case:', caseItem.id);

        const { error: dNotifErr } = await supabase.from('doctor_notifications').insert({
          case_id: caseItem.id,
          type: 'APPOINTMENT_BOOKED',
          message: notificationMsg || `Dr. ${doctorName} has scheduled an in-person appointment for you.`,
          read: false,
          sent_at: new Date().toISOString()
        });

        if (dNotifErr) console.error("doctor_notifications error:", dNotifErr);
        else console.log("✓ doctor_notifications (appointment) saved");

        if (caseItem.patient_id) {
          const { error: pNotifErr } = await supabase.from('patient_notifications').insert({
            patient_id: caseItem.patient_id,
            title: 'Appointment Scheduled',
            message: notificationMsg || `Dr. ${doctorName} has scheduled an in-person appointment for you.`,
            type: 'APPOINTMENT_BOOKED',
            payload: { appointmentDate, appointmentTime, hospitalName, appointmentNotes },
            is_read: false,
            created_at: new Date().toISOString()
          });

          if (pNotifErr) console.error("patient_notifications error:", pNotifErr);
          else console.log("✓ patient_notifications (appointment) saved");
        } else {
          console.warn("Skipping patient_notifications: caseItem.patient_id is missing.");
        }
      }

      // 4. Update parent
      onCaseUpdate({ ...caseItem, status: 'escalated' })
      setSent('appointment')
      setSentMethod(method)

      // 5. Open WhatsApp
      if (method === 'whatsapp') {
        if (patientPhone) {
          const waUrl = whatsappService.sendAppointmentDetails({
            patientPhone, patientName, doctorName,
            doctorSpecialization: doctorSpec,
            hospitalName,
            appointmentDate,
            appointmentTime,
            appointmentNotes,
            caseId: caseItem.id,
          })
          window.open(waUrl, '_blank')
        } else {
          alert('No phone number on file for WhatsApp.')
        }
      }
    } catch(e) {
      console.error('Appointment booking failed:', e)
      alert(`Failed to book appointment: ${e.message || 'Unknown error'}`)
    } finally {
      setIsSending(false)
    }
  }

  const handleReject = async (method) => {
    // Requires a note to explain why they rejected
    if (!doctorNote) {
      alert("Please provide a note or report explaining why the AI triage is rejected.");
      return;
    }
    setIsSending(true)
    try {
      // 1. Update case status to 'rejected'
      await triageService.updateCaseStatus(caseItem.id, 'rejected')

      // 2. Save doctor action log to Supabase
      const { error: actionErr } = await supabase.from('doctor_actions').insert({
        case_id: caseItem.id,
        doctor_id: doctorProfile?.id,
        action_type: 'rejected',
        doctor_note: doctorNote,
        sent_via: method,
        created_at: new Date().toISOString(),
      });

      if (actionErr) {
        console.error('doctor_actions insert err:', actionErr);
        throw actionErr;
      }
      console.log("✓ doctor_actions (rejection) saved");

      // 3. Send to patient mobile app via notifications table
      if (method === 'app') {
        console.log('Sending APP rejection notifications for case:', caseItem.id);

        const { error: dNotifErr } = await supabase.from('doctor_notifications').insert({
          case_id: caseItem.id,
          type: 'REPORT_REJECTED',
          message: notificationMsg || `Dr. ${doctorName} has overridden the AI report and provided an updated assessment.`,
          read: false,
          sent_at: new Date().toISOString()
        });

        if (dNotifErr) console.error("doctor_notifications error:", dNotifErr);
        else console.log("✓ doctor_notifications (rejection) saved");

        if (caseItem.patient_id) {
          const { error: pNotifErr } = await supabase.from('patient_notifications').insert({
            patient_id: caseItem.patient_id,
            title: 'Triage AI Rejected by Doctor',
            message: notificationMsg || `Dr. ${doctorName} has overridden the AI report and provided an updated assessment.`,
            type: 'REPORT_REJECTED',
            payload: { doctorNote },
            is_read: false,
            created_at: new Date().toISOString()
          });

          if (pNotifErr) console.error("patient_notifications error:", pNotifErr);
          else console.log("✓ patient_notifications (rejection) saved");
        } else {
          console.warn("Skipping patient_notifications: caseItem.patient_id is missing.");
        }
      }

      // 4. Update parent state ONLY if primary actions succeeded
      onCaseUpdate({ ...caseItem, status: 'rejected' })
      setSent('rejected')
      setSentMethod(method)

      // 5. Open WhatsApp
      if (method === 'whatsapp') {
        if (patientPhone) {
          const waUrl = whatsappService.sendRejectionReport({
            patientPhone, patientName, doctorName,
            doctorSpecialization: doctorSpec,
            doctorNote, caseId: caseItem.id,
          })
          window.open(waUrl, '_blank')
        } else {
          alert('No phone number on file for WhatsApp.')
        }
      }
    } catch(e) {
      console.error('Rejection action failed:', e)
      alert(`Failed to save rejection: ${e.message || 'Unknown error'}. Check console for details.`)
    } finally {
      setIsSending(false)
    }
  }

  // SUCCESS STATE
  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`border-2 p-5 ${
          sent === 'approved' 
            ? 'border-[#16A34A] bg-[#F0FDF4]' 
            : sent === 'rejected'
            ? 'border-[#DC2626] bg-[#FEF2F2]'
            : 'border-primary bg-surface-container'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center border-2 ${
            sent === 'approved' ? 'border-[#16A34A] text-[#16A34A]' 
            : sent === 'rejected' ? 'border-[#DC2626] text-[#DC2626]'
            : 'border-primary text-primary'
          }`}>
            {sent === 'approved' ? <CheckCircle size={16} /> : sent === 'rejected' ? <XCircle size={16} /> : <Calendar size={16} />}
          </div>
          <div>
            <div className="font-mono-technical text-xs font-bold mb-1 uppercase">
              {sent === 'approved' ? 'REPORT SENT — CASE CLOSED' : sent === 'rejected' ? 'AI TRIAGE REJECTED — OVERRIDE SENT' : 'APPOINTMENT BOOKED'}
            </div>
            <p className="font-mono-technical text-[10px] opacity-70 mb-1">
              {sentMethod === 'app' ? '✓ Notification sent to patient mobile app.' : '✓ Processed via WhatsApp.'}
            </p>
            <p className="font-mono-technical text-[10px] opacity-70">
              {sentMethod === 'whatsapp' 
                ? (patientPhone ? `WhatsApp opened for ${patientName} (${patientPhone}).` : `No phone number on file for ${patientName}.`)
                : `Mobile app push notification sent successfully.`
              }
            </p>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      
      {/* Header */}
      <div className="font-mono-technical text-[10px] opacity-50 uppercase border-b border-primary/20 pb-2">
        DOCTOR ACTIONS — CHOOSE ONE
      </div>

      {/* No phone warning */}
      {!patientPhone && (
        <div className="font-mono-technical text-[10px] text-[#D97706] border border-[#D97706] bg-[#FFFBEB] px-3 py-2">
          ⚠ NO PHONE NUMBER ON FILE — MESSAGE WILL NOT BE SENT VIA WHATSAPP
        </div>
      )}

      {/* ACTION 1 — APPROVE */}
      <div className={`border transition-all ${
        activePanel === 'approve' ? 'border-[#16A34A] shadow-[4px_4px_0px_#16A34A]' : 'border-primary'
      }`}>
        <button
          onClick={() => setActivePanel(activePanel === 'approve' ? null : 'approve')}
          className={`w-full flex items-center justify-between p-4 transition-colors ${
            activePanel === 'approve' ? 'bg-[#16A34A] text-white' : 'bg-surface hover:bg-[#F0FDF4]'
          }`}
        >
          <div className="flex items-center gap-3">
            <CheckCircle size={16} />
            <div className="text-left">
              <div className="font-mono-technical text-xs font-bold">APPROVE TRIAGE</div>
              <div className="font-mono-technical text-[10px] opacity-70">
                Send AI report + instructions via WhatsApp
              </div>
            </div>
          </div>
          <ChevronDown
            size={14}
            className={`transition-transform ${activePanel === 'approve' ? 'rotate-180' : ''}`}
          />
        </button>

        <AnimatePresence>
          {activePanel === 'approve' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 border-t border-[#16A34A]/30 flex flex-col gap-3 bg-[#F0FDF4]">
                
                {/* Preview of what gets sent */}
                <div className="border border-[#16A34A]/30 bg-white p-3">
                  <div className="font-mono-technical text-[9px] opacity-50 mb-2">
                    WHATSAPP PREVIEW — PATIENT RECEIVES THIS
                  </div>
                  <div className="text-[11px] leading-relaxed opacity-80 font-sans">
                    <strong>Your triage has been reviewed by Dr. {doctorName}</strong><br/>
                    Risk: {caseItem.risk_level} | Confidence: {caseItem.ai_confidence}%<br/>
                    <em>{caseItem.ai_summary?.substring(0, 80)}...</em>
                  </div>
                </div>

                {/* Editable doctor note */}
                <div>
                  <label className="font-mono-technical text-[10px] block mb-1 opacity-60">
                    CUSTOM INSTRUCTIONS FOR PATIENT (EDIT IF NEEDED)
                  </label>
                  <textarea
                    value={doctorNote}
                    onChange={(e) => setDoctorNote(e.target.value)}
                    rows={3}
                    className="w-full border border-[#16A34A]/40 bg-white p-3 text-sm font-sans outline-none resize-y focus:border-[#16A34A]"
                    placeholder="Write specific instructions for this patient..."
                  />
                </div>

                {/* Mobile Notification Message */}
                <div>
                  <label className="font-mono-technical text-[10px] block mb-1 opacity-60 text-[#16A34A] font-bold">
                    MOBILE APP PUSH MESSAGE
                  </label>
                  <input
                    type="text"
                    value={notificationMsg}
                    onChange={(e) => setNotificationMsg(e.target.value)}
                    className="w-full border border-[#16A34A]/40 bg-white p-2 text-xs font-sans outline-none focus:border-[#16A34A]"
                    placeholder="Short summary for push notification..."
                  />
                  <p className="font-mono-technical text-[9px] opacity-40 mt-1">This appears as the notification title/preview on the patient's phone.</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove('app')}
                    disabled={isSending}
                    className="flex-1 flex flex-col items-center justify-center gap-1 bg-surface text-[#16A34A] p-2 sm:p-3 font-mono-technical text-xs font-bold uppercase border border-[#16A34A] hover:bg-[#F0FDF4] transition-colors disabled:opacity-50"
                  >
                    {isSending ? 'SENDING...' : 'SEND TO MOBILE APP'}
                  </button>
                  <button
                    onClick={() => handleApprove('whatsapp')}
                    disabled={isSending}
                    className="flex-1 flex flex-col items-center justify-center gap-1 bg-[#16A34A] text-white p-2 sm:p-3 font-mono-technical text-xs font-bold uppercase border border-[#16A34A] hover:bg-[#15803d] transition-colors disabled:opacity-50"
                  >
                    {isSending ? (
                      'SENDING...'
                    ) : (
                      <>
                        <span className="flex items-center gap-1">SEND TO WHATSAPP <ExternalLink size={12} /></span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ACTION 2 — BOOK APPOINTMENT */}
      <div className={`border transition-all ${
        activePanel === 'appointment' ? 'border-primary shadow-brutal' : 'border-primary'
      }`}>
        <button
          onClick={() => setActivePanel(activePanel === 'appointment' ? null : 'appointment')}
          className={`w-full flex items-center justify-between p-4 transition-colors ${
            activePanel === 'appointment' ? 'bg-primary text-on-primary' : 'bg-surface hover:bg-surface-container'
          }`}
        >
          <div className="flex items-center gap-3">
            <Calendar size={16} />
            <div className="text-left">
              <div className="font-mono-technical text-xs font-bold">BOOK APPOINTMENT</div>
              <div className="font-mono-technical text-[10px] opacity-70">
                AI triage insufficient — schedule in-person visit
              </div>
            </div>
          </div>
          <ChevronDown
            size={14}
            className={`transition-transform ${activePanel === 'appointment' ? 'rotate-180' : ''}`}
          />
        </button>

        <AnimatePresence>
          {activePanel === 'appointment' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 border-t border-primary/20 flex flex-col gap-4 bg-surface-container">

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-mono-technical text-[10px] block mb-1 opacity-60">
                      APPOINTMENT DATE *
                    </label>
                    <input
                      type="date"
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full border border-primary bg-surface p-2 font-mono-technical text-xs outline-none focus:shadow-brutal"
                    />
                  </div>
                  <div>
                    <label className="font-mono-technical text-[10px] block mb-1 opacity-60">
                      APPOINTMENT TIME *
                    </label>
                    <input
                      type="time"
                      value={appointmentTime}
                      onChange={(e) => setAppointmentTime(e.target.value)}
                      className="w-full border border-primary bg-surface p-2 font-mono-technical text-xs outline-none focus:shadow-brutal"
                    />
                  </div>
                </div>

                {hospitalName && (
                  <div className="border border-primary/20 bg-surface px-3 py-2">
                    <span className="font-mono-technical text-[10px] opacity-50">VENUE: </span>
                    <span className="font-mono-technical text-[10px] font-bold">{hospitalName}</span>
                  </div>
                )}

                <div>
                  <label className="font-mono-technical text-[10px] block mb-1 opacity-60">
                    NOTES FOR PATIENT (optional)
                  </label>
                  <textarea
                    value={appointmentNotes}
                    onChange={(e) => setAppointmentNotes(e.target.value)}
                    rows={2}
                    className="w-full border border-primary bg-surface p-3 text-sm font-sans outline-none resize-none focus:shadow-brutal"
                    placeholder="e.g. Please bring all previous reports and fast for 4 hours before..."
                  />
                </div>

                {/* Preview */}
                <div className="border border-primary/20 bg-surface p-3">
                  <div className="font-mono-technical text-[9px] opacity-50 mb-2">
                    WHATSAPP PREVIEW — PATIENT RECEIVES THIS
                  </div>
                  <div className="text-[11px] leading-relaxed opacity-80 font-sans">
                    <strong>Appointment confirmed with Dr. {doctorName}</strong><br/>
                    {appointmentDate && <span>📅 {appointmentDate}</span>}
                    {appointmentTime && <span> at {appointmentTime}</span>}
                    {hospitalName && <><br/>📍 {hospitalName}</>}
                  </div>
                </div>

                {/* Mobile Notification Message */}
                <div>
                  <label className="font-mono-technical text-[10px] block mb-1 opacity-60 text-primary font-bold">
                    MOBILE APP PUSH MESSAGE
                  </label>
                  <input
                    type="text"
                    value={notificationMsg}
                    onChange={(e) => setNotificationMsg(e.target.value)}
                    className="w-full border border-primary/40 bg-white p-2 text-xs font-sans outline-none focus:border-primary"
                    placeholder="Short summary for push notification..."
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleBookAppointment('app')}
                    disabled={isSending || !appointmentDate || !appointmentTime}
                    className="flex-1 flex flex-col items-center justify-center gap-1 bg-surface text-primary p-2 sm:p-3 font-mono-technical text-[10px] sm:text-xs font-bold uppercase border border-primary hover:bg-primary/5 transition-colors disabled:opacity-30"
                  >
                    {isSending ? 'BOOKING...' : 'SEND TO MOBILE APP'}
                  </button>
                  <button
                    onClick={() => handleBookAppointment('whatsapp')}
                    disabled={isSending || !appointmentDate || !appointmentTime}
                    className="flex-1 flex flex-col items-center justify-center gap-1 bg-primary text-on-primary p-2 sm:p-3 font-mono-technical text-[10px] sm:text-xs font-bold uppercase border border-primary hover:bg-surface hover:text-primary transition-colors disabled:opacity-30 shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                  >
                    {isSending ? (
                      'BOOKING...'
                    ) : (
                      <>
                        <span className="flex items-center gap-1">SEND TO WHATSAPP <ExternalLink size={12} /></span>
                      </>
                    )}
                  </button>
                </div>

                {!appointmentDate || !appointmentTime ? (
                  <p className="font-mono-technical text-[10px] opacity-40 text-center">
                    SELECT DATE AND TIME TO ENABLE BOOKING
                  </p>
                ) : null}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ACTION 3 — REJECT & OVERRIDE */}
      <div className={`border transition-all ${
        activePanel === 'reject' ? 'border-[#DC2626] shadow-[4px_4px_0px_#DC2626]' : 'border-primary'
      }`}>
        <button
          onClick={() => setActivePanel(activePanel === 'reject' ? null : 'reject')}
          className={`w-full flex items-center justify-between p-4 transition-colors ${
            activePanel === 'reject' ? 'bg-[#DC2626] text-white' : 'bg-surface hover:bg-[#FEF2F2]'
          }`}
        >
          <div className="flex items-center gap-3">
            <XCircle size={16} />
            <div className="text-left">
              <div className="font-mono-technical text-xs font-bold">REJECT AI TRIAGE</div>
              <div className="font-mono-technical text-[10px] opacity-70">
                Override AI findings & send manual report to patient app
              </div>
            </div>
          </div>
          <ChevronDown
            size={14}
            className={`transition-transform ${activePanel === 'reject' ? 'rotate-180' : ''}`}
          />
        </button>

        <AnimatePresence>
          {activePanel === 'reject' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 border-t border-[#DC2626]/30 flex flex-col gap-3 bg-[#FEF2F2]">
                
                {/* Editable doctor note / Override report */}
                <div>
                  <label className="font-mono-technical text-[10px] block mb-1 opacity-60 text-[#DC2626] font-bold">
                    MANUAL DOCTOR REPORT (REQUIRED TO OVERRIDE)
                  </label>
                  <textarea
                    value={doctorNote}
                    onChange={(e) => setDoctorNote(e.target.value)}
                    rows={4}
                    className="w-full border border-[#DC2626]/40 bg-white p-3 text-sm font-sans outline-none resize-y focus:border-[#DC2626]"
                    placeholder="Enter the correct medical evaluation and updated instructions. This report replaces the AI triage data in the patient app."
                  />
                </div>

                <div className="border border-[#DC2626]/30 bg-white p-3 opacity-80">
                  <div className="font-mono-technical text-[9px] mb-2 text-[#DC2626]">
                    APP & WHATSAPP PREVIEW
                  </div>
                  <div className="text-[11px] leading-relaxed font-sans text-black">
                    <strong>The preliminary AI triage report has been REJECTED / OVERRIDDEN by Dr. {doctorName}.</strong><br/>
                    <em>Please disregard the previous automated recommendations.</em><br/><br/>
                    <strong>Doctor's Report:</strong> {doctorNote || "[Your notes will appear here]"}
                  </div>
                </div>

                {/* Mobile Notification Message */}
                <div>
                  <label className="font-mono-technical text-[10px] block mb-1 opacity-60 text-[#DC2626] font-bold">
                    MOBILE APP PUSH MESSAGE
                  </label>
                  <input
                    type="text"
                    value={notificationMsg}
                    onChange={(e) => setNotificationMsg(e.target.value)}
                    className="w-full border border-[#DC2626]/40 bg-white p-2 text-xs font-sans outline-none focus:border-[#DC2626]"
                    placeholder="Short summary for push notification..."
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleReject('app')}
                    disabled={isSending || !doctorNote}
                    className="flex-1 flex flex-col items-center justify-center gap-1 bg-surface text-[#DC2626] p-2 sm:p-3 font-mono-technical text-[10px] sm:text-xs font-bold uppercase border border-[#DC2626] hover:bg-[#FEF2F2] transition-colors disabled:opacity-50"
                  >
                    {isSending ? 'GENERATING...' : 'SEND TO MOBILE APP'}
                  </button>
                  <button
                    onClick={() => handleReject('whatsapp')}
                    disabled={isSending || !doctorNote}
                    className="flex-1 flex flex-col items-center justify-center gap-1 bg-[#DC2626] text-white p-2 sm:p-3 font-mono-technical text-[10px] sm:text-xs font-bold uppercase border border-[#DC2626] hover:bg-[#b91c1c] transition-colors disabled:opacity-50"
                  >
                    {isSending ? (
                      'GENERATING...'
                    ) : (
                      <>
                        <span className="flex items-center gap-1">SEND TO WHATSAPP <ExternalLink size={12} /></span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  )
}
