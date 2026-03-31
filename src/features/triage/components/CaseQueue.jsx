import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CaseCard } from './CaseCard'
import { RISK_LEVELS } from '../../../config/constants'

// Mock Data
const MOCK_CASES = [
  {
    id: 'TC-2024-001',
    patient_name: 'Rahul Sharma',
    patient_age: 45,
    patient_gender: 'Male',
    risk_level: RISK_LEVELS.HIGH,
    ai_confidence: 92,
    symptoms: ['Chest pain', 'Shortness of breath', 'Nausea', 'Sweating'],
    status: 'pending'
  },
  {
    id: 'TC-2024-002',
    patient_name: 'Ananya Patel',
    patient_age: 32,
    patient_gender: 'Female',
    risk_level: RISK_LEVELS.MEDIUM,
    ai_confidence: 78,
    symptoms: ['High fever', 'Joint pain', 'Headache'],
    status: 'pending'
  },
  {
    id: 'TC-2024-003',
    patient_name: 'Vikram Nair',
    patient_age: 28,
    patient_gender: 'Male',
    risk_level: RISK_LEVELS.LOW,
    ai_confidence: 85,
    symptoms: ['Mild cough', 'Sore throat'],
    status: 'reviewed'
  }
]

export const CaseQueue = () => {
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState('ALL')

  const filters = ['ALL', 'HIGH RISK', 'MODERATE', 'LOW RISK', 'REVIEWED']

  const handleCardClick = (id) => {
    navigate(`/cases/${id}`)
  }

  return (
    <div className="w-full">
      {/* Brutalist Filter Tabs */}
      <div className="flex overflow-x-auto no-scrollbar gap-0 border-b border-primary mb-8 pb-4">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`
              font-mono-technical text-xs px-6 py-2 border border-primary transition-all whitespace-nowrap
              ${activeFilter === filter 
                ? 'bg-primary text-on-primary shadow-brutal translate-x-[2px] translate-y-[2px]' 
                : 'bg-surface hover:bg-surface-container -mr-px'
              }
            `}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex flex-col">
        {MOCK_CASES.map(caseItem => (
          <CaseCard 
            key={caseItem.id} 
            caseData={caseItem} 
            onClick={handleCardClick}
          />
        ))}
      </div>
    </div>
  )
}
