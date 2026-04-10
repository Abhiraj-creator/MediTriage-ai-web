import { ThemeToggle } from './components/layout/ThemeToggle'
import { AppLayout } from './components/layout/AppLayout'
import { DashboardPage } from './features/triage/pages/DashboardPage'
import { CasesPage } from './features/triage/pages/CasesPage'
import { CaseDetailPage } from './features/triage/pages/CaseDetailPage'
import { AnalyticsPage } from './features/triage/pages/AnalyticsPage'
import { LoginPage } from './features/auth/pages/LoginPage'
import { RegisterPage } from './features/auth/pages/RegisterPage'
import { LandingPage } from './pages/LandingPage'
import { OnboardingPage } from './features/auth/pages/OnboardingPage'
import { ProfilePage } from './features/triage/pages/ProfilePage'
import { UserTypePage } from './features/auth/pages/UserTypePage'
import { PatientDashboardPage } from './features/patient/pages/PatientDashboardPage'
import { PatientTriagePage } from './features/patient/pages/PatientTriagePage'
import { useAuth } from './features/auth/hooks/useAuth.js'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'


const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, doctorProfile } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-surface font-mono-technical">LOADING SESSION...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // If patient role tries to access doctor routes → send to patient dashboard
  if (doctorProfile?.role === 'patient' && !location.pathname.startsWith('/patient')) {
    return <Navigate to="/patient/dashboard" replace />
  }

  if (doctorProfile?.needsOnboarding && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }

  return children
}

const PatientRoute = ({ children }) => {
  const { isAuthenticated, isLoading, doctorProfile } = useAuth()

  if (isLoading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-surface font-mono-technical">LOADING SESSION...</div>
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />

  // If doctor tries to access patient routes → send to dashboard
  if (doctorProfile?.role === 'doctor') return <Navigate to="/dashboard" replace />

  return children
}

const AuthRoute = ({ children }) => {
  const { isAuthenticated, isLoading, doctorProfile } = useAuth()

  if (isLoading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-surface font-mono-technical">LOADING SESSION...</div>
  }

  if (isAuthenticated) {
    // Route to correct home based on role
    if (doctorProfile?.role === 'patient') return <Navigate to="/patient/dashboard" replace />
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />

        {/* Role selection before register */}
        <Route path="/get-started" element={<AuthRoute><UserTypePage /></AuthRoute>} />
        <Route path="/register" element={<AuthRoute><RegisterPage /></AuthRoute>} />

        {/* Doctor onboarding */}
        <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />

        {/* Patient routes */}
        <Route path="/patient/dashboard" element={<PatientRoute><PatientDashboardPage /></PatientRoute>} />
        <Route path="/patient/triage" element={<PatientRoute><PatientTriagePage /></PatientRoute>} />

        {/* Protected Doctor Dashboard Routes using AppLayout */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/cases" element={<CasesPage />} />
          <Route path="/cases/:id" element={<CaseDetailPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
