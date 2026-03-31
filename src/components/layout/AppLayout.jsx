import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { NewCaseToast } from '../../features/triage/components/NewCaseToast'

export const AppLayout = () => {
  return (
    <div className="min-h-screen bg-surface flex">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        {/* The header is fixed, so we add padding top to the main wrapper */}
        <Header />
        <main className="flex-1 mt-16 p-8 relative halftone-overlay">
          {/* Outlet renders the matched child route */}
          <Outlet />
        </main>
        
        {/* Global Toast for the authenticated dashboard */}
        <NewCaseToast />
      </div>
    </div>
  )
}
