import { useState, useEffect } from 'react'
import { InlineSpinner } from '../common/LoadingSpinner'

/**
 * CommodityForm – Add / Edit a commodity name.
 *
 * Props:
 *   initialData  {object|null}
 *   onSubmit     {(data) => Promise<boolean>}
 *   onCancel     {() => void}
 */
export default function CommodityForm({ initialData = null, onSubmit, onCancel }) {
  const [name,       setName]       = useState('')
  const [error,      setError]      = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setName(initialData?.name ?? '')
    setError('')
  }, [initialData])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) { setError('Commodity name is required.'); return }

    setSubmitting(true)
    const payload = { ...(initialData ?? {}), name: name.trim() }
    const ok = await onSubmit(payload)
    setSubmitting(false)
    if (ok) setName('')
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Commodity Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="e.g. Wheat, Rice, Mustard…"
          value={name}
          onChange={e => { setName(e.target.value); setError('') }}
          autoFocus
          className={`w-full rounded-lg border px-3 py-2.5 text-sm shadow-sm transition placeholder-gray-400
            focus:outline-none focus:ring-2
            ${error
              ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100'
              : 'border-gray-200 bg-white focus:border-primary-400 focus:ring-primary-100'}`}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>

      <div className="flex justify-end gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="rounded-lg border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:opacity-60"
        >
          {submitting && <InlineSpinner />}
          {initialData ? 'Update Commodity' : 'Add Commodity'}
        </button>
      </div>
    </form>
  )
}
