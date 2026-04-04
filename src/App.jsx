import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { ThemeToggle } from './components/layout/ThemeToggle'
import { AppLayout } from './components/layout/AppLayout'
import { DashboardPage } from './features/triage/pages/DashboardPage'
import { CaseDetailPage } from './features/triage/pages/CaseDetailPage'
import { AnalyticsPage } from './features/triage/pages/AnalyticsPage'
import { LoginPage } from './features/auth/pages/LoginPage'
import { RegisterPage } from './features/auth/pages/RegisterPage'
import { LandingPage } from './pages/LandingPage'
import { OnboardingPage } from './features/auth/pages/OnboardingPage'
import { ProfilePage } from './features/triage/pages/ProfilePage'
import { useAuth } from './features/auth/hooks/useAuth.js'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, doctorProfile } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-surface font-mono-technical">LOADING SESSION...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (doctorProfile?.needsOnboarding && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }

  return children
}

const AuthRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-surface font-mono-technical">LOADING SESSION...</div>
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeToggle />
      <Routes>
        <Route path="/" element={<AuthRoute><LandingPage /></AuthRoute>} />
        <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
        <Route path="/register" element={<AuthRoute><RegisterPage /></AuthRoute>} />
        <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
        
        {/* Protected Dashboard Routes using AppLayout */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/cases" element={<DashboardPage />} />
          <Route path="/cases/:id" element={<CaseDetailPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
