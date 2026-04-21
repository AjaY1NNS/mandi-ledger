import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ManagePage from './pages/ManagePage'
import ArchivePage from './pages/ArchivePage'
import LoadingSpinner from './components/common/LoadingSpinner'

/** Redirects unauthenticated users to /login */
function ProtectedRoute({ children }) {
  const { isLoggedIn, authLoading } = useAuth()
  if (authLoading) return <LoadingSpinner message="Initializing…" />
  if (!isLoggedIn) return <Navigate to="/login" replace />
  return children
}

/**
 * AppRoutes — lives inside AuthProvider + AppProvider so all routes
 * share the same context instance (buyers/sellers/commodities are loaded once).
 */
function AppRoutes() {
  return (
    <AppProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
        />
        <Route
          path="/manage"
          element={<ProtectedRoute><ManagePage /></ProtectedRoute>}
        />
        <Route
          path="/archive"
          element={<ProtectedRoute><ArchivePage /></ProtectedRoute>}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppProvider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
