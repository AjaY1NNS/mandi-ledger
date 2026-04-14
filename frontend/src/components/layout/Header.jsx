import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { roleBadgeClass } from '../../utils/helpers'
import toast from 'react-hot-toast'

export default function Header({ onAddEntry }) {
  const { user, role, isAdmin, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Logged out successfully.')
    } catch {
      toast.error('Logout failed. Please try again.')
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          {/* Logo mark */}
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 shadow-md shadow-primary-200">
            <svg
              className="h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"
              />
            </svg>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-gray-900 leading-none">MandiLedger</h1>
            <p className="text-xs text-gray-500 leading-none mt-0.5">Dashboard</p>
          </div>
          <h1 className="text-lg font-bold text-gray-900 sm:hidden">MandiLedger</h1>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Add Entry button */}
          <button
            onClick={onAddEntry}
            className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary-700 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary-400"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span className="hidden sm:inline">Add Entry</span>
            <span className="sm:hidden">Add</span>
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-300"
            >
              {/* Avatar */}
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                {user?.email?.[0]?.toUpperCase() ?? 'U'}
              </span>
              <span className="hidden max-w-[120px] truncate sm:block">{user?.email}</span>
              <svg
                className={`h-4 w-4 text-gray-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown */}
            {menuOpen && (
              <>
                {/* Backdrop */}
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 z-20 mt-2 w-56 origin-top-right rounded-xl border border-gray-100 bg-white shadow-lg animate-fade-in">
                  {/* User info */}
                  <div className="border-b border-gray-100 px-4 py-3">
                    <p className="truncate text-sm font-medium text-gray-800">{user?.email}</p>
                    <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${roleBadgeClass(role)}`}>
                      {role?.toUpperCase()}
                    </span>
                  </div>
                  {/* Actions */}
                  <div className="p-1">
                    <button
                      onClick={() => { setMenuOpen(false); handleLogout() }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 transition hover:bg-red-50"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
