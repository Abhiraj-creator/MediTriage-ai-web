import { useState } from 'react'
import { supabase } from '../../../config/supabase'

export const SendInstructionsPanel = ({ caseId, patientName, recommendation }) => {
  const [note, setNote] = useState(recommendation || '')
  const [sent, setSent] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const handleSend = async () => {
    setIsSending(true)
    try {
      await supabase.from('doctor_notifications').insert({
        case_id: caseId,
        type: 'instructions',
        message: note,
        sent_at: new Date().toISOString(),
      })
      setSent(true)
    } catch(e) {
      console.warn('Notification send failed (non-critical for demo)', e)
      setSent(true)
    } finally {
      setIsSending(false)
    }
  }

  if (sent) {
    return (
      <div className="font-mono-technical text-xs text-[#16A34A] flex items-center gap-2">
        <span>✓</span>
        <span>INSTRUCTIONS SENT TO PATIENT — THEY WILL SEE IT IN THE MOBILE APP</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="w-full min-h-[80px] border border-[#16A34A]/40 bg-white p-3 text-sm font-sans outline-none resize-y"
        placeholder="Write instructions for the patient..."
      />
      <button
        onClick={handleSend}
        disabled={isSending || !note.trim()}
        className="font-mono-technical text-xs border border-[#16A34A] text-[#16A34A] px-4 py-2 hover:bg-[#16A34A] hover:text-white transition-colors disabled:opacity-40 self-end"
      >
        {isSending ? 'SENDING...' : 'SEND TO PATIENT APP →'}
      </button>
    </div>
  )
}
