import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import LoadingSpinner from './components/common/LoadingSpinner'

/**
 * ProtectedRoute – redirects unauthenticated users to /login.
 */
function ProtectedRoute({ children }) {
  const { isLoggedIn, authLoading } = useAuth()
  if (authLoading) return <LoadingSpinner message="Initializing…" />
  if (!isLoggedIn) return <Navigate to="/login" replace />
  return children
}

/**
 * Inner component that sits inside AuthProvider (so it can use useAuth).
 */
function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppProvider>
              <DashboardPage />
            </AppProvider>
          </ProtectedRoute>
        }
      />
      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
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
