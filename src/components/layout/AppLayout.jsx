import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { ThemeToggle } from './ThemeToggle'
import { NewCaseToast } from '../../features/triage/components/NewCaseToast'
import { useRealtimeCases } from '../../features/triage/hooks/useRealtimeCases'

export const AppLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  useRealtimeCases()

  return (
    <div className="min-h-screen bg-surface flex w-full overflow-x-hidden relative">
      <ThemeToggle />
      
      {/* Mobile click-away overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      
      <div className="flex-1 flex flex-col min-h-screen w-full md:ml-64 relative">
        {/* The header is fixed, so we add padding top to the main wrapper */}
        <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 mt-16 p-4 md:p-8 relative halftone-overlay w-full">
          {/* Outlet renders the matched child route */}
          <Outlet />
        </main>
        
        {/* Global Toast for the authenticated dashboard */}
        <NewCaseToast />
      </div>
    </div>
  )
}
