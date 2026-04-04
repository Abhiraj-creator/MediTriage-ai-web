import { memo } from 'react'
import { motion } from 'framer-motion'

export const CaseSkeleton = memo(() => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="border border-[#E2E8F0] bg-surface p-4 flex flex-col gap-4 shadow-sm"
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#E2E8F0] animate-pulse"></div>
          <div className="flex flex-col gap-2">
            <div className="h-4 w-32 bg-[#E2E8F0] animate-pulse rounded"></div>
            <div className="h-3 w-48 bg-[#E2E8F0] animate-pulse rounded"></div>
          </div>
        </div>
        <div className="h-6 w-20 bg-[#E2E8F0] animate-pulse rounded"></div>
      </div>
      
      <div className="mt-2 h-16 w-full bg-[#F1F5F9] border border-[#E2E8F0] animate-pulse"></div>
      
      <div className="flex justify-between items-center mt-2">
        <div className="flex gap-2">
          <div className="h-4 w-16 bg-[#E2E8F0] animate-pulse rounded"></div>
          <div className="h-4 w-16 bg-[#E2E8F0] animate-pulse rounded"></div>
        </div>
        <div className="h-4 w-24 bg-[#E2E8F0] animate-pulse rounded"></div>
      </div>
    </motion.div>
  )
})

CaseSkeleton.displayName = 'CaseSkeleton'
