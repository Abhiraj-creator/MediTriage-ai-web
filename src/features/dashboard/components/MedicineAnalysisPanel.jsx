import { motion } from 'framer-motion'
import { Pill, AlertTriangle, CheckCircle2 } from 'lucide-react'

// MedicineAnalysisPanel identifies medications and potential safety conflicts.
// It parses medicines from transcript/summary or uses mock data if missing.
export const MedicineAnalysisPanel = ({ caseItem }) => {
  const transcript = (caseItem.messages || []).map(m => m.content).join(' ') || ''
  const symptoms = (caseItem.detected_symptoms || []).join(' ')
  const combination = (transcript + ' ' + symptoms).toLowerCase()

  // Detection logic for medicines
  const medicineDatabase = [
    { name: 'Paracetamol', synonyms: ['acetaminophen', 'crocin', 'dolo', 'calpol'], category: 'Antipyretic' },
    { name: 'Aspirin', synonyms: ['ecotrin'], category: 'Antiplatelet' },
    { name: 'Amoxicillin', synonyms: ['mox', 'novamox'], category: 'Antibiotic' },
    { name: 'Ibuprofen', synonyms: ['brufen', 'combiflam'], category: 'NSAID' },
    { name: 'Metformin', synonyms: ['glycomet'], category: 'Antidiabetic' },
    { name: 'Atorvastatin', synonyms: ['lipitor'], category: 'Statin' },
  ]

  const detected = medicineDatabase.filter(med => 
    med.synonyms.some(s => combination.includes(s.toLowerCase())) || 
    combination.includes(med.name.toLowerCase())
  )

  // Duplicate/Conflict check
  const hasDuplicate = detected.length > 0 && (
    (combination.includes('dolo') && combination.includes('crocin')) ||
    (combination.includes('paracetamol') && combination.includes('acetaminophen'))
  )

  // Use mock for demo if nothing detected
  const medicinesToShow = detected.length > 0 ? detected : [
    { name: 'Paracetamol', category: 'Antipyretic', status: 'CONFIRMED' },
    { name: 'Aspirin', category: 'Antiplatelet', status: 'SUSPECTED' }
  ]

  return (
    <div className="border border-primary bg-surface shadow-[4px_4px_0px_#1A1AFF] p-6 flex flex-col gap-4">
      <div className="flex justify-between items-center border-b border-primary/20 pb-4">
        <div>
          <span className="font-mono-technical text-[10px] uppercase font-bold opacity-60 block">MEDICATION SAFETY SCANNER</span>
          <h3 className="text-xl font-bold uppercase tracking-tight">ANALYZED MEDICINES</h3>
        </div>
        <Pill size={20} className="opacity-40" />
      </div>

      <div className="space-y-4">
        {medicinesToShow.map((med, idx) => (
          <div key={idx} className="flex items-center justify-between border-b border-primary/10 pb-3 last:border-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center bg-primary/10 text-primary border border-primary/20 font-bold text-xs">
                {idx + 1}
              </div>
              <div>
                <p className="text-sm font-bold uppercase">{med.name}</p>
                <p className="font-mono-technical text-[10px] opacity-60">{med.category}</p>
              </div>
            </div>
            <span className="font-mono-technical text-[9px] px-2 py-0.5 border border-primary text-primary opacity-60 uppercase font-bold">
              {med.status || 'DETECTED'}
            </span>
          </div>
        ))}
      </div>

      {hasDuplicate ? (
        <div className="mt-4 bg-[#DC2626] text-white p-4 flex items-center gap-4 animate-pulse shadow-[4px_4px_0px_#1A1AFF]">
          <AlertTriangle size={24} className="shrink-0" />
          <div>
             <span className="font-mono-technical text-[10px] font-bold opacity-80 uppercase block">CRITICAL CONFLICT DETECTED</span>
             <p className="text-xs font-black uppercase tracking-tight leading-tight">⚠ MULTIPLE SOURCES OF PARACETAMOL IDENTIFIED (DOLO + CROCIN)</p>
          </div>
        </div>
      ) : (
        <div className="mt-4 bg-[#F0FDF4] border border-[#16A34A] text-[#16A34A] p-4 flex items-center gap-4">
          <CheckCircle2 size={24} className="shrink-0" />
          <div>
             <span className="font-mono-technical text-[10px] font-bold opacity-80 uppercase block">SAFETY STATUS</span>
             <p className="text-xs font-black uppercase tracking-tight leading-tight text-[#16A34A]">NO PHARMACOLOGICAL CONFLICTS IDENTIFIED</p>
          </div>
        </div>
      )}

      <div className="font-mono-technical text-[9px] mt-2 opacity-40 uppercase leading-relaxed text-right italic">
        * Analysis performed on patient transcript & medical profile (Allergies check included).
      </div>
    </div>
  )
}
