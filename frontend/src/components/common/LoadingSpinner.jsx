/**
 * LoadingSpinner – full-page overlay spinner used during auth init and data loads.
 */
export default function LoadingSpinner({ message = 'Loading…' }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        {/* Ring spinner */}
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-4 border-primary-100" />
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary-600" />
        </div>
        <p className="text-sm font-medium text-gray-500">{message}</p>
      </div>
    </div>
  )
}

/**
 * Inline small spinner — use inside buttons or table cells.
 */
export function InlineSpinner({ className = '' }) {
  return (
    <svg
      className={`animate-spin h-4 w-4 text-current ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12" cy="12" r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  )
}
