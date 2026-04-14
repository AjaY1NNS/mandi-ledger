import { Toaster } from 'react-hot-toast'
import Header from './Header'

/**
 * Main authenticated layout shell.
 * Renders the sticky header + content area with toast notifications.
 */
export default function Layout({ children, onAddEntry }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header onAddEntry={onAddEntry} />

      <main className="mx-auto max-w-screen-xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Global toast container */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '10px',
            background:   '#1f2937',
            color:        '#f9fafb',
            fontSize:     '14px',
            maxWidth:     '360px',
          },
          success: {
            iconTheme: { primary: '#22c55e', secondary: '#f9fafb' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#f9fafb' },
          },
        }}
      />
    </div>
  )
}
