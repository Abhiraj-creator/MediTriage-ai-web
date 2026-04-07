import { useState, useEffect, useCallback } from 'react'
import { CaseQueue } from '../components/CaseQueue'
import { useTriageStore } from '../../../store/triage.store'
import { triageService } from '../services/triage.service.js'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { RefreshCw, ArrowLeft } from 'lucide-react'

export const CasesPage = () => {
  const { cases } = useTriageStore()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const patientQuery = searchParams.get('patient')

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    useTriageStore.getState().setLoading(true)
    try {
      const data = await triageService.getCases()
      if (data) {
        useTriageStore.getState().setCases(data)
      }
    } catch (e) {
      console.warn('Refresh failed, keeping current store state', e)
    } finally {
      setIsRefreshing(false)
      useTriageStore.getState().setLoading(false)
    }
  }, [])

  // Always fetch fresh data when the cases page is mounted
  useEffect(() => {
    handleRefresh()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-primary pb-8 relative">
        <div className="flex-1 min-w-0 pr-4">
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-tight break-words">
            {patientQuery ? 'PATIENT RECORD' : 'ALL CASES'}
          </h2>
          <p className="mt-4 font-mono-technical text-sm opacity-80 flex items-center gap-2">
            {patientQuery ? `VIEWING ALL CASES FOR: ${patientQuery.toUpperCase()}` : 'VIEW AND MANAGE PATIENT TRIAGE QUEUE'}
          </p>
          {patientQuery && (
            <button 
              onClick={() => navigate('/cases')}
              className="mt-6 flex items-center gap-2 font-mono-technical text-sm uppercase text-primary hover:opacity-50"
            >
              <ArrowLeft size={16} /> BACK TO FULL DIRECTORY
            </button>
          )}
        </div>
        
        <div className="mt-6 md:mt-0 flex items-center gap-4 flex-col md:flex-row w-full md:w-auto justify-end">
          <button 
            onClick={handleRefresh}
            className="font-mono-technical text-xs border border-primary px-3 py-2 hover:bg-primary hover:text-on-primary transition-colors flex items-center gap-2 bg-surface z-10"
          >
            <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} /> REFRESH
          </button>
        </div>
      </div>

      <div className="mb-8">
        <CaseQueue />
      </div>
    </div>
  )
}
