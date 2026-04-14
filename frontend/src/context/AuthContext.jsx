import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { onAuthChange, loginWithEmail, logout as firebaseLogout } from '../services/firebase'
import { fetchUserRole } from '../services/api'

const AuthContext = createContext(null)

/**
 * AuthProvider wraps the app and exposes auth state + actions to all children.
 */
export function AuthProvider({ children }) {
  const [user,        setUser]        = useState(null)   // Firebase user object
  const [role,        setRole]        = useState(null)   // 'admin' | 'staff'
  const [authLoading, setAuthLoading] = useState(true)   // waiting for Firebase init
  const [roleLoading, setRoleLoading] = useState(false)  // waiting for role fetch

  // ── Resolve user role from backend ────────────────────────────────────────
  const resolveRole = useCallback(async (firebaseUser) => {
    if (!firebaseUser) {
      setRole(null)
      return
    }
    setRoleLoading(true)
    try {
      const result = await fetchUserRole(firebaseUser.email)
      setRole(result?.data?.role ?? 'staff')
    } catch {
      // Default to 'staff' if backend is unreachable during development
      setRole('staff')
    } finally {
      setRoleLoading(false)
    }
  }, [])

  // ── Listen to Firebase auth state ─────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser)
      await resolveRole(firebaseUser)
      setAuthLoading(false)
    })
    return unsubscribe
  }, [resolveRole])

  // ── Actions ───────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    const credential = await loginWithEmail(email, password)
    // Role will be resolved via the onAuthChange listener above
    return credential
  }

  const logout = async () => {
    await firebaseLogout()
    setUser(null)
    setRole(null)
  }

  // ── Derived helpers ───────────────────────────────────────────────────────
  const isAdmin    = role === 'admin'
  const isLoggedIn = !!user

  const value = {
    user,
    role,
    isAdmin,
    isLoggedIn,
    authLoading,
    roleLoading,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/** Consume auth context; throws if used outside <AuthProvider> */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

export default AuthContext
