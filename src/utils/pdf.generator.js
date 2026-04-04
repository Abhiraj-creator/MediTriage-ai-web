export const generateCaseReportPdf = async (caseItem) => {
  const p = caseItem.patient_profiles || {}
  const patientName = p.full_name || caseItem.patient_name || 'Unknown Patient'
  
  // Format dates
  const caseDate = caseItem.created_at ? new Date(caseItem.created_at).toLocaleString() : new Date().toLocaleString()

  // Generate Transcript HTML
  let transcriptHtml = ''
  const msgs = caseItem.messages || caseItem.transcript || []
  msgs.forEach(msg => {
     const role = msg.role === 'ai' ? 'MEDITRIAGE SYSTEM' : 'PATIENT'
     transcriptHtml += `
        <div style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #E5E7EB;">
          <div style="font-size: 10px; color: #6B7280; margin-bottom: 4px; font-family: monospace;"><b>${role}</b> - ${msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''}</div>
          <div style="font-size: 12px; font-family: sans-serif; line-height: 1.5; color: #111827;">${msg.content || msg.text}</div>
        </div>
     `
  })

  // Format recommendation
  const recs = caseItem.ai_recommendation ? caseItem.ai_recommendation.replace(/\n/g, '<br/>') : 'No recommendations provided.'

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Report - ${patientName}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #111827; padding: 40px; margin: 0; background: white; }
          .header { border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
          .title { font-size: 24px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase; margin: 0;}
          .meta { font-size: 10px; font-family: monospace; color: #4B5563; text-align: right; }
          .section-title { font-size: 11px; font-family: monospace; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; color: #6B7280; border-bottom: 1px solid #E5E7EB; padding-bottom: 4px;}
          
          .grid { display: table; width: 100%; margin-bottom: 30px; border-collapse: collapse; }
          .grid-row { display: table-row; }
          .grid-cell { display: table-cell; padding: 10px 0; border-bottom: 1px solid #F3F4F6; font-size: 13px; }
          .grid-label { font-family: monospace; color: #6B7280; width: 30%; }
          .grid-value { font-weight: bold; }

          .risk-high { color: #DC2626; border: 1px solid #DC2626; padding: 4px 8px; border-radius: 4px; display: inline-block; font-size: 10px; font-weight: bold; background: white; }
          .risk-medium { color: #D97706; border: 1px solid #D97706; padding: 4px 8px; border-radius: 4px; display: inline-block; font-size: 10px; font-weight: bold; background: white; }
          .risk-low { color: #16A34A; border: 1px solid #16A34A; padding: 4px 8px; border-radius: 4px; display: inline-block; font-size: 10px; font-weight: bold; background: white; }

          .box { border: 1px solid #E5E7EB; background: #F9FAFB; padding: 15px; margin-bottom: 20px; font-size: 13px; line-height: 1.6; }
          .box-red { border: 1px solid #DC2626; background: #FEF2F2; color: #991B1B; font-weight: bold; }
          
          /* Prevent page breaks inside critical sections */
          .avoid-break { page-break-inside: avoid; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">MEDITRIAGE SYSTEM REPORT</div>
            <div style="font-size: 12px; margin-top: 5px;">AI-Augmented Clinical Triage</div>
          </div>
          <div class="meta">
            <div>DATE: ${caseDate}</div>
            <div>CASE NO: ${caseItem.id}</div>
            <div>STATUS: ${caseItem.status.toUpperCase()}</div>
          </div>
        </div>

        <div class="section-title">PATIENT DEMOGRAPHICS</div>
        <div class="grid">
          <div class="grid-row"><div class="grid-cell grid-label">NAME</div><div class="grid-cell grid-value">${patientName.toUpperCase()}</div></div>
          <div class="grid-row"><div class="grid-cell grid-label">AGE / SEX</div><div class="grid-cell grid-value">${p.age || caseItem.patient_age || 'UNK'} / ${(p.gender || caseItem.patient_gender || 'UNK').toUpperCase()}</div></div>
          <div class="grid-row"><div class="grid-cell grid-label">KNOWN CONDITIONS</div><div class="grid-cell grid-value">${p.known_conditions?.join(', ') || 'None reported'}</div></div>
          <div class="grid-row"><div class="grid-cell grid-label">EMERGENCY CONTACT</div><div class="grid-cell grid-value">${p.emergency_contact_name || 'N/A'} (${p.emergency_contact_phone || 'N/A'})</div></div>
        </div>

        <div class="avoid-break">
          <div class="section-title">AI SYNTHESIS & RISK ASSESSMENT</div>
          <div style="margin-bottom: 15px;">
             <span class="grid-label" style="font-size: 11px;">TRIAGE ACUITY: </span>
             <span class="risk-${(caseItem.risk_level || 'low').toLowerCase()}">${caseItem.risk_level} RISK</span>
             <span style="font-family: monospace; font-size: 11px; margin-left: 20px; color: #6B7280;">AI CONFIDENCE: ${caseItem.ai_confidence}%</span>
          </div>
          
          <div class="box">
            <div style="font-family: monospace; font-size: 10px; color: #6B7280; margin-bottom: 5px;">CLINICAL SUMMARY</div>
            ${caseItem.ai_summary || 'No summary generated.'}
          </div>

          <div class="box box-red">
            <div style="font-family: monospace; font-size: 10px; color: #DC2626; margin-bottom: 5px; border-bottom: 1px solid #DC2626; padding-bottom: 5px;">RECOMMENDED ACTION PROTOCOL</div>
            ${recs}
          </div>
        </div>

        <div class="section-title" style="margin-top: 30px;">ORIGINAL SYMPTOM TRANSCRIPT</div>
        <div class="box" style="background: white;">
           ${transcriptHtml}
        </div>

        <div class="avoid-break" style="margin-top: 50px;">
           <div style="border-top: 1px solid #000; display: inline-block; padding-top: 10px; width: 250px;">
             <div style="font-family: monospace; font-size: 10px; color: #6B7280;">REVIEWING PHYSICIAN SIGNATURE</div>
           </div>
           <div style="font-family: monospace; font-size: 10px; color: #6B7280; margin-top: 10px;">Printed on: ${new Date().toLocaleString()}</div>
        </div>
      </body>
    </html>
  `

  const iframe = document.createElement('iframe')
  // Hide iframe completely
  iframe.style.position = 'fixed'
  iframe.style.right = '0'
  iframe.style.bottom = '0'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = '0'
  document.body.appendChild(iframe)
  
  iframe.contentWindow.document.open()
  iframe.contentWindow.document.write(htmlContent)
  iframe.contentWindow.document.close()

  // Wait for rendering then print natively
  return new Promise((resolve) => {
    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow.focus()
        iframe.contentWindow.print()
        setTimeout(() => {
          document.body.removeChild(iframe)
          resolve()
        }, 1000)
      }, 500) // Render delay
    }
  })
}
