import { create } from 'zustand'

export const useTriageStore = create((set, get) => ({
  cases: [],
  selectedCaseId: null,
  activeFilter: 'ALL',
  isLoading: false,
  error: null,
  connectionStatus: 'DISCONNECTED', // 'SUBSCRIBED' | 'DISCONNECTED' | 'RECONNECTING'

  setCases: (cases) => set({ cases }),
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  
  addCase: (newCase) => set((state) => {
    // Prevent duplicates
    if (state.cases.some(c => c.id === newCase.id)) return state
    return { cases: [newCase, ...state.cases] }
  }),

  updateCase: (updatedCase) => set((state) => ({
    cases: state.cases.map(c => c.id === updatedCase.id ? updatedCase : c)
  })),

  removeCase: (caseId) => set((state) => ({
    cases: state.cases.filter(c => c.id !== caseId)
  })),

  setSelectedCaseId: (id) => set({ selectedCaseId: id }),
  setActiveFilter: (filter) => set({ activeFilter: filter }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  // Computed state getter for filtered cases
  getFilteredCases: () => {
    const { cases, activeFilter } = get()
    
    // Sort logic: HIGH -> MEDIUM -> LOW, then by newest
    const sorted = [...cases].sort((a, b) => {
      // Risk order map
      const riskOrder = { 'HIGH': 0, 'MEDIUM': 1, 'LOW': 2 }
      
      const aOrder = riskOrder[a.risk_level] ?? 99
      const bOrder = riskOrder[b.risk_level] ?? 99
      
      if (aOrder !== bOrder) return aOrder - bOrder
      return new Date(b.created_at) - new Date(a.created_at)
    })

    if (activeFilter === 'ALL') return sorted
    if (activeFilter === 'REVIEWED') return sorted.filter(c => c.status === 'reviewed')
    if (activeFilter === 'HIGH RISK') return sorted.filter(c => c.risk_level === 'HIGH' && c.status === 'pending')
    if (activeFilter === 'MODERATE') return sorted.filter(c => c.risk_level === 'MEDIUM' && c.status === 'pending')
    if (activeFilter === 'LOW RISK') return sorted.filter(c => c.risk_level === 'LOW' && c.status === 'pending')

    return sorted
  }
}))
