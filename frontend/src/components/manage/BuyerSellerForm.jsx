import { useState, useEffect, useCallback } from 'react'
import { InlineSpinner } from '../common/LoadingSpinner'

const EMPTY = {
  firstName:  '',
  lastName:   '',
  firmName:   '',
  address:    '',
  contactNos: [''],  // array of strings
  emails:     [''],  // array of strings
}

/**
 * BuyerSellerForm – shared Add / Edit form for both Buyers and Sellers.
 *
 * Props:
 *   type         {'buyer'|'seller'}
 *   initialData  {object|null}           null = add mode
 *   onSubmit     {(data) => Promise<boolean>}
 *   onCancel     {() => void}
 */
export default function BuyerSellerForm({ type, initialData = null, onSubmit, onCancel }) {
  const [form,       setForm]       = useState(EMPTY)
  const [errors,     setErrors]     = useState({})
  const [submitting, setSubmitting] = useState(false)

  const label = type === 'buyer' ? 'Buyer' : 'Seller'

  useEffect(() => {
    if (initialData) {
      setForm({
        firstName:  initialData.firstName  ?? '',
        lastName:   initialData.lastName   ?? '',
        firmName:   initialData.firmName   ?? '',
        address:    initialData.address    ?? '',
        // backend sends arrays; fallback to [''] so at least one row shows
        contactNos: initialData.contactNos?.length ? initialData.contactNos : [''],
        emails:     initialData.emails?.length     ? initialData.emails     : [''],
      })
    } else {
      setForm(EMPTY)
    }
    setErrors({})
  }, [initialData])

  // ── Field helpers ─────────────────────────────────────────────────────────
  const setField = useCallback((name, value) => {
    setForm(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: undefined }))
  }, [])

  // Multi-value (contactNos / emails)
  const setMultiValue = (key, idx, value) =>
    setForm(prev => {
      const arr = [...prev[key]]
      arr[idx] = value
      return { ...prev, [key]: arr }
    })

  const addMultiRow    = (key) => setForm(prev => ({ ...prev, [key]: [...prev[key], ''] }))
  const removeMultiRow = (key, idx) =>
    setForm(prev => ({ ...prev, [key]: prev[key].filter((_, i) => i !== idx) }))

  // ── Validation ────────────────────────────────────────────────────────────
  /**
   * Accepts:
   *   • 10-digit numbers: 9876543210
   *   • With country code: +91 9876543210, 0091-9876543210
   *   • Spaces/hyphens as separators: 98765-43210, +91 98765 43210
   */
  const PHONE_RE = /^(\+91[-\s]?|0091[-\s]?|0)?[6-9]\d{9}$/

  /** Standard email format */
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  const validatePhone = (val) => {
    const stripped = val.replace(/[\s\-()]/g, '')
    if (!stripped) return 'Contact number is required.'
    if (!PHONE_RE.test(stripped)) return 'Enter a valid 10-digit mobile number (e.g. 98765 43210).'
    return null
  }

  const validateEmail = (val) => {
    if (!val.trim()) return null          // email is optional
    if (!EMAIL_RE.test(val.trim())) return 'Enter a valid email address.'
    return null
  }

  const validate = (f) => {
    const e = {}
    if (!f.firstName.trim()) e.firstName = 'First name is required.'
    if (!f.lastName.trim())  e.lastName  = 'Last name is required.'
    if (!f.address.trim())   e.address   = 'Address is required.'

    // Validate each contact number individually
    const contactErrs = f.contactNos.map(validatePhone)
    if (contactErrs.some(Boolean)) e.contactNos = contactErrs   // array of per-index errors

    // Validate each email individually (only if filled)
    const emailErrs = f.emails.map(validateEmail)
    if (emailErrs.some(Boolean)) e.emails = emailErrs

    return e
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate(form)
    setErrors(errs)
    // hasErrors: check string fields + array fields (contactNos/emails)
    const hasErrors = Object.entries(errs).some(([, v]) =>
      Array.isArray(v) ? v.some(Boolean) : Boolean(v)
    )
    if (hasErrors) return

    setSubmitting(true)
    const payload = {
      ...(initialData ?? {}),
      ...form,
      contactNos: form.contactNos.filter(c => c.trim()),
      emails:     form.emails.filter(em => em.trim()),
    }
    const ok = await onSubmit(payload)
    setSubmitting(false)
    if (ok) setForm(EMPTY)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* ── Name row ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="First Name" required error={errors.firstName}>
          <input
            type="text"
            placeholder="Ramesh"
            value={form.firstName}
            onChange={e => setField('firstName', e.target.value)}
            className={input(errors.firstName)}
          />
        </Field>
        <Field label="Last Name" required error={errors.lastName}>
          <input
            type="text"
            placeholder="Kumar"
            value={form.lastName}
            onChange={e => setField('lastName', e.target.value)}
            className={input(errors.lastName)}
          />
        </Field>
      </div>

      {/* ── Firm Name ───────────────────────────────────────────── */}
      <Field label="Firm Name">
        <input
          type="text"
          placeholder="Kumar Traders (optional)"
          value={form.firmName}
          onChange={e => setField('firmName', e.target.value)}
          className={input()}
        />
      </Field>

      {/* ── Address ─────────────────────────────────────────────── */}
      <Field label="Address" required error={errors.address}>
        <textarea
          rows={2}
          placeholder="Village / City, District, State"
          value={form.address}
          onChange={e => setField('address', e.target.value)}
          className={`resize-none ${input(errors.address)}`}
        />
      </Field>

      {/* ── Contact Numbers ─────────────────────────────────────── */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Contact Numbers <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {form.contactNos.map((num, idx) => {
            const rowErr = Array.isArray(errors.contactNos) ? errors.contactNos[idx] : null
            return (
              <div key={idx}>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={num}
                    onChange={e => {
                      setMultiValue('contactNos', idx, e.target.value)
                      // Clear this row's error on change
                      if (Array.isArray(errors.contactNos)) {
                        const updated = [...errors.contactNos]
                        updated[idx] = null
                        setErrors(prev => ({ ...prev, contactNos: updated.some(Boolean) ? updated : undefined }))
                      }
                    }}
                    onBlur={e => {
                      const err = validatePhone(e.target.value)
                      setErrors(prev => {
                        const arr = Array.isArray(prev.contactNos) ? [...prev.contactNos] : form.contactNos.map(() => null)
                        arr[idx] = err
                        return { ...prev, contactNos: arr.some(Boolean) ? arr : undefined }
                      })
                    }}
                    className={`flex-1 ${input(rowErr)}`}
                  />
                  {form.contactNos.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        removeMultiRow('contactNos', idx)
                        // Drop corresponding error slot
                        if (Array.isArray(errors.contactNos)) {
                          const updated = errors.contactNos.filter((_, i) => i !== idx)
                          setErrors(prev => ({ ...prev, contactNos: updated.some(Boolean) ? updated : undefined }))
                        }
                      }}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-500 transition hover:bg-red-100"
                      aria-label="Remove contact"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                {rowErr && <p className="mt-0.5 text-xs text-red-500">{rowErr}</p>}
              </div>
            )
          })}
          <button
            type="button"
            onClick={() => addMultiRow('contactNos')}
            className="flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add another number
          </button>
        </div>
      </div>

      {/* ── Email Addresses ─────────────────────────────────────── */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Email Addresses
          <span className="ml-1.5 text-xs font-normal text-gray-400">(optional)</span>
        </label>
        <div className="space-y-2">
          {form.emails.map((em, idx) => {
            const rowErr = Array.isArray(errors.emails) ? errors.emails[idx] : null
            return (
              <div key={idx}>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder={`name${idx > 0 ? idx + 1 : ''}@example.com`}
                    value={em}
                    onChange={e => {
                      setMultiValue('emails', idx, e.target.value)
                      if (Array.isArray(errors.emails)) {
                        const updated = [...errors.emails]
                        updated[idx] = null
                        setErrors(prev => ({ ...prev, emails: updated.some(Boolean) ? updated : undefined }))
                      }
                    }}
                    onBlur={e => {
                      const err = validateEmail(e.target.value)
                      setErrors(prev => {
                        const arr = Array.isArray(prev.emails) ? [...prev.emails] : form.emails.map(() => null)
                        arr[idx] = err
                        return { ...prev, emails: arr.some(Boolean) ? arr : undefined }
                      })
                    }}
                    className={`flex-1 ${input(rowErr)}`}
                  />
                  {form.emails.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        removeMultiRow('emails', idx)
                        if (Array.isArray(errors.emails)) {
                          const updated = errors.emails.filter((_, i) => i !== idx)
                          setErrors(prev => ({ ...prev, emails: updated.some(Boolean) ? updated : undefined }))
                        }
                      }}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-500 transition hover:bg-red-100"
                      aria-label="Remove email"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                {rowErr && <p className="mt-0.5 text-xs text-red-500">{rowErr}</p>}
              </div>
            )
          })}
          <button
            type="button"
            onClick={() => addMultiRow('emails')}
            className="flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add another email
          </button>
        </div>
      </div>

      {/* ── Actions ─────────────────────────────────────────────── */}
      <div className="flex justify-end gap-3 pt-2">
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
          {initialData ? `Update ${label}` : `Add ${label}`}
        </button>
      </div>
    </form>
  )
}

// ── Local helpers ─────────────────────────────────────────────────────────────

function Field({ label, required, error, children }) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label}{required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

const input = (err) =>
  `w-full rounded-lg border px-3 py-2 text-sm text-gray-800 shadow-sm placeholder-gray-400
   transition focus:outline-none focus:ring-2
   ${err
     ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100'
     : 'border-gray-200 bg-white focus:border-primary-400 focus:ring-primary-100'}`
