// WhatsApp messaging via WhatsApp Business API (wa.me deep link as fallback)
// For hackathon: uses wa.me link which opens WhatsApp with pre-filled message
// In production: replace with Twilio / WhatsApp Business API

export const whatsappService = {
  // Build WhatsApp deep link URL
  buildWaLink(phoneNumber, message) {
    // Clean phone number - remove spaces, dashes, +
    const cleaned = phoneNumber.replace(/[\s\-\(\)]/g, '')
    // Ensure it has country code - default to +91 (India) if no +
    const withCountry = cleaned.startsWith('+') 
      ? cleaned.replace('+', '') 
      : cleaned.startsWith('91') 
        ? cleaned 
        : `91${cleaned}`
    const encoded = encodeURIComponent(message)
    return `https://wa.me/${withCountry}?text=${encoded}`
  },

  // Send triage approval report to patient
  sendApprovalReport({ patientPhone, patientName, doctorName, doctorSpecialization, riskLevel, aiSummary, aiRecommendation, doctorNote, caseId }) {
    const message = `🏥 *MediTriage AI — Your Health Report*

Hello ${patientName},

Your triage case has been reviewed by *Dr. ${doctorName}* (${doctorSpecialization}).

📋 *AI Assessment:* ${riskLevel} RISK
📝 *Summary:* ${aiSummary}

✅ *Doctor's Instructions:*
${doctorNote || aiRecommendation}

${riskLevel === 'HIGH' 
  ? '⚠️ *URGENT:* Please seek immediate medical attention.' 
  : riskLevel === 'MEDIUM' 
    ? '⚠️ Please follow these instructions carefully and monitor your symptoms.'
    : '✅ Your symptoms appear manageable. Follow the instructions above.'}

🔒 Case ID: ${caseId}
📱 Track your case on MediTriage AI

_This report is AI-assisted and reviewed by a licensed doctor. In case of emergency, call 112._`

    return this.buildWaLink(patientPhone, message)
  },

  // Send appointment booking details to patient
  sendAppointmentDetails({ patientPhone, patientName, doctorName, doctorSpecialization, hospitalName, appointmentDate, appointmentTime, appointmentNotes, caseId }) {
    const message = `🏥 *MediTriage AI — Appointment Confirmed*

Hello ${patientName},

*Dr. ${doctorName}* (${doctorSpecialization}) has reviewed your triage and would like to see you in person.

📅 *Appointment Details:*
• Doctor: Dr. ${doctorName}
• Specialization: ${doctorSpecialization}
• Hospital/Clinic: ${hospitalName || 'To be confirmed'}
• Date: ${appointmentDate}
• Time: ${appointmentTime}
${appointmentNotes ? `• Notes: ${appointmentNotes}` : ''}

📌 *What to bring:*
• This message as reference
• Any previous medical reports
• List of current medications

🔒 Case ID: ${caseId}
📱 Track your case on MediTriage AI

_For queries, contact the hospital directly. In emergency, call 112._`

    return this.buildWaLink(patientPhone, message)
  }
}
