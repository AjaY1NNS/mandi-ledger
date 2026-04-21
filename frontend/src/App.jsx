import React, { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import LoginPage from './pages/LoginPage'
import LoadingSpinner from './components/common/LoadingSpinner'

const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const ManagePage    = lazy(() => import('./pages/ManagePage'))
const ArchivePage   = lazy(() => import('./pages/ArchivePage'))

// ── Error boundary ────────────────────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center p-8 text-center">
          <div>
            <p className="text-lg font-semibold text-gray-800">Something went wrong</p>
            <p className="mt-1 text-sm text-gray-500">{this.state.error.message}</p>
            <button
              onClick={() => this.setState({ error: null })}
              className="mt-4 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
            >
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// ── Route guards ──────────────────────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const { isLoggedIn, authLoading } = useAuth()
  if (authLoading) return <LoadingSpinner message="Initializing…" />
  if (!isLoggedIn) return <Navigate to="/login" replace />
  return children
}

function AdminRoute({ children }) {
  const { isLoggedIn, isAdmin, authLoading, roleLoading } = useAuth()
  if (authLoading || roleLoading) return <LoadingSpinner message="Verifying access…" />
  if (!isLoggedIn) return <Navigate to="/login" replace />
  if (!isAdmin)    return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  return (
    <AppProvider>
      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner message="Loading…" />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
            />
            <Route
              path="/manage"
              element={<AdminRoute><ManagePage /></AdminRoute>}
            />
            <Route
              path="/archive"
              element={<AdminRoute><ArchivePage /></AdminRoute>}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
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
