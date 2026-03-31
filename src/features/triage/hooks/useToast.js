import { useToastStore } from '../../../store/toast.store'

export const useToast = () => {
  const { toast, showHighRiskToast, hideToast } = useToastStore()
  
  return {
    toast,
    showHighRiskToast,
    hideToast
  }
}
