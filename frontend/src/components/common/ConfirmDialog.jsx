import Modal from './Modal'

/**
 * ConfirmDialog – reusable destructive-action confirmation modal.
 *
 * Props:
 *   isOpen      {boolean}
 *   title       {string}
 *   message     {string}
 *   onConfirm   {() => void}
 *   onCancel    {() => void}
 *   confirmText {string}   – defaults to 'Delete'
 *   danger      {boolean}  – red confirm button; defaults to true
 */
export default function ConfirmDialog({
  isOpen,
  title      = 'Confirm Action',
  message    = 'Are you sure you want to proceed? This action cannot be undone.',
  onConfirm,
  onCancel,
  confirmText = 'Delete',
  danger      = true,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} size="sm">
      <div className="space-y-5">
        {/* Warning icon */}
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-5 w-5 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </span>
          <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition focus:outline-none focus:ring-2 ${
              danger
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-400'
                : 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-400'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  )
}
