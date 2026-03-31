import { create } from 'zustand'

export const useToastStore = create((set) => ({
  toast: null,
  showHighRiskToast: (caseData) => {
    set({ toast: caseData })
    // Auto clear after 5s
    setTimeout(() => {
      set({ toast: null })
    }, 5000)
  },
  hideToast: () => set({ toast: null })
}))
