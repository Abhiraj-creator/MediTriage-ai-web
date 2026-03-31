import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { CustomCursor } from './components/ui/CustomCursor'
import { AppLayout } from './components/layout/AppLayout'
import { DashboardPage } from './features/triage/pages/DashboardPage'
import { CaseDetailPage } from './features/triage/pages/CaseDetailPage'
import { AnalyticsPage } from './features/triage/pages/AnalyticsPage'
import { LoginPage } from './features/auth/pages/LoginPage'
import { RegisterPage } from './features/auth/pages/RegisterPage'
import { LandingPage } from './pages/LandingPage'

// Placeholder for missing pages to quickly verify routing
const Placeholder = ({ title }) => (
  <div className="flex flex-col h-full">
    <h2 className="text-4xl font-black uppercase tracking-tighter mb-8">{title}</h2>
    <div className="flex-1 border border-primary bg-surface flex items-center justify-center">
      <p className="font-mono-technical">AWAITING IMPLEMENTATION</p>
    </div>
  </div>
)

export default function App() {
  return (
    <BrowserRouter>
      <CustomCursor />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Protected Dashboard Routes using AppLayout */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/cases/:id" element={<CaseDetailPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
