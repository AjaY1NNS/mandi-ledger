import { useState, useEffect, useCallback } from 'react'
import { useApp } from '../../context/AppContext'
import { validateEntryForm, isFormValid } from '../../utils/validators'
import { computeAmount, formatCurrency } from '../../utils/helpers'
import { InlineSpinner } from '../common/LoadingSpinner'

const EMPTY_FORM = {
  date:          '',
  vehicleCount:  '',
  vehicleNumber: '',
  billNumber:    '',
  buyer:         '',
  buyerOther:    '',
  seller:        '',
  sellerOther:   '',
  rate:          '',
  weight:        '',
  commodity:     '',
  comment:       '',
}

/** Build display label for a buyer/seller party */
const partyLabel = (p) =>
  p.firmName
    ? `${p.firstName} ${p.lastName} — ${p.firmName}`
    : `${p.firstName} ${p.lastName}`

/**
 * EntryForm – handles both Add and Edit modes.
 *
 * Props:
 *   initialData  {object|null}    – null = add mode, object = edit mode
 *   onSubmit     {(data) => Promise<boolean>}
 *   onCancel     {() => void}
 *   isEdit       {boolean}
 */
export default function EntryForm({ initialData = null, onSubmit, onCancel, isEdit = false }) {
  const { buyers, sellers, commodities } = useApp()
  const [form,       setForm]       = useState(EMPTY_FORM)
  const [errors,     setErrors]     = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [touched,    setTouched]    = useState({})

  // Populate form when editing
  useEffect(() => {
    if (initialData) {
      // Check whether the stored buyer/seller name matches any current party
      const buyerNames  = buyers.map(partyLabel)
      const sellerNames = sellers.map(partyLabel)
      setForm({
        ...EMPTY_FORM,
        ...initialData,
        buyer:       buyerNames.includes(initialData.buyer)   ? initialData.buyer  : 'Other',
        buyerOther:  buyerNames.includes(initialData.buyer)   ? ''                 : (initialData.buyer  ?? ''),
        seller:      sellerNames.includes(initialData.seller) ? initialData.seller : 'Other',
        sellerOther: sellerNames.includes(initialData.seller) ? ''                 : (initialData.seller ?? ''),
      })
    } else {
      setForm({ ...EMPTY_FORM, date: new Date().toISOString().slice(0, 10) })
    }
    setErrors({})
    setTouched({})
  }, [initialData, buyers, sellers])

  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setTouched((prev) => ({ ...prev, [name]: true }))
  }, [])

  const handleBlur = useCallback((e) => {
    const { name } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    // Validate on blur for touched fields
    const allErrors = validateEntryForm({ ...form, [name]: e.target.value })
    setErrors(allErrors)
  }, [form])

  // Derived: estimated amount
  const estimatedAmount = computeAmount(form.rate, form.weight)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const allErrors = validateEntryForm(form)
    setErrors(allErrors)
    // Touch all fields on submit attempt
    const allTouched = Object.keys(form).reduce((acc, k) => ({ ...acc, [k]: true }), {})
    setTouched(allTouched)

    if (!isFormValid(allErrors)) return

    setSubmitting(true)
    // Resolve buyer/seller: if 'Other', use custom text
    const resolvedBuyer  = form.buyer  === 'Other' ? form.buyerOther.trim()  : form.buyer
    const resolvedSeller = form.seller === 'Other' ? form.sellerOther.trim() : form.seller

    const payload = {
      ...(initialData ?? {}),
      date:          form.date,
      vehicleCount:  Number(form.vehicleCount),
      vehicleNumber: form.vehicleNumber.trim(),
      billNumber:    form.billNumber.trim(),
      buyer:         resolvedBuyer,
      seller:        resolvedSeller,
      rate:          parseFloat(form.rate),
      weight:        parseFloat(form.weight),
      commodity:     form.commodity,
      comment:       form.comment.trim(),
    }

    const success = await onSubmit(payload)
    setSubmitting(false)
    if (success) setForm(EMPTY_FORM)
  }

  // Helper: show error only for touched + errored fields
  const fieldError = (name) => (touched[name] ? errors[name] : undefined)

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* ── Row 1: Date + Vehicle Count ─────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Date" required error={fieldError('date')}>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            onBlur={handleBlur}
            className={inputClass(fieldError('date'))}
          />
        </Field>
        <Field label="Vehicle Count" required error={fieldError('vehicleCount')}>
          <input
            type="number"
            name="vehicleCount"
            min="0"
            placeholder="0"
            value={form.vehicleCount}
            onChange={handleChange}
            onBlur={handleBlur}
            className={inputClass(fieldError('vehicleCount'))}
          />
        </Field>
      </div>

      {/* ── Row 2: Vehicle Number + Bill Number ─────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Vehicle Number" required error={fieldError('vehicleNumber')}>
          <input
            type="text"
            name="vehicleNumber"
            placeholder="HR 55 AB 1234"
            value={form.vehicleNumber}
            onChange={handleChange}
            onBlur={handleBlur}
            className={inputClass(fieldError('vehicleNumber'))}
          />
        </Field>
        <Field label="Bill Number" required error={fieldError('billNumber')}>
          <input
            type="text"
            name="billNumber"
            placeholder="BILL-001"
            value={form.billNumber}
            onChange={handleChange}
            onBlur={handleBlur}
            className={inputClass(fieldError('billNumber'))}
          />
        </Field>
      </div>

      {/* ── Buyer ───────────────────────────────────────────────── */}
      <Field label="Buyer" required error={fieldError('buyer') || fieldError('buyerOther')}>
        <select
          name="buyer"
          value={form.buyer}
          onChange={handleChange}
          onBlur={handleBlur}
          className={inputClass(fieldError('buyer'))}
        >
          <option value="">Select buyer…</option>
          {buyers.map((b) => {
            const label = partyLabel(b)
            return <option key={b.id} value={label}>{label}</option>
          })}
          <option value="Other">Other…</option>
        </select>
        {form.buyer === 'Other' && (
          <input
            type="text"
            name="buyerOther"
            placeholder="Enter buyer name"
            value={form.buyerOther}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`mt-2 ${inputClass(fieldError('buyerOther'))}`}
          />
        )}
      </Field>

      {/* ── Seller ──────────────────────────────────────────────── */}
      <Field label="Seller" required error={fieldError('seller') || fieldError('sellerOther')}>
        <select
          name="seller"
          value={form.seller}
          onChange={handleChange}
          onBlur={handleBlur}
          className={inputClass(fieldError('seller'))}
        >
          <option value="">Select seller…</option>
          {sellers.map((s) => {
            const label = partyLabel(s)
            return <option key={s.id} value={label}>{label}</option>
          })}
          <option value="Other">Other…</option>
        </select>
        {form.seller === 'Other' && (
          <input
            type="text"
            name="sellerOther"
            placeholder="Enter seller name"
            value={form.sellerOther}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`mt-2 ${inputClass(fieldError('sellerOther'))}`}
          />
        )}
      </Field>

      {/* ── Commodity ───────────────────────────────────────────── */}
      <Field label="Commodity" required error={fieldError('commodity')}>
        <select
          name="commodity"
          value={form.commodity}
          onChange={handleChange}
          onBlur={handleBlur}
          className={inputClass(fieldError('commodity'))}
        >
          <option value="">Select commodity…</option>
          {commodities.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
      </Field>

      {/* ── Row 4: Rate + Weight ────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Rate (₹ per kg)" required error={fieldError('rate')}>
          <input
            type="number"
            name="rate"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={form.rate}
            onChange={handleChange}
            onBlur={handleBlur}
            className={inputClass(fieldError('rate'))}
          />
        </Field>
        <Field label="Weight (kg)" required error={fieldError('weight')}>
          <input
            type="number"
            name="weight"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={form.weight}
            onChange={handleChange}
            onBlur={handleBlur}
            className={inputClass(fieldError('weight'))}
          />
        </Field>
      </div>

      {/* Estimated amount */}
      {estimatedAmount !== null && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-4 py-2.5 flex items-center justify-between">
          <span className="text-sm font-medium text-emerald-700">Estimated Total</span>
          <span className="text-base font-bold text-emerald-800">{formatCurrency(estimatedAmount)}</span>
        </div>
      )}

      {/* ── Comment ─────────────────────────────────────────────── */}
      <Field label="Comment" error={fieldError('comment')}>
        <textarea
          name="comment"
          rows={2}
          placeholder="Optional notes…"
          value={form.comment}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`resize-none ${inputClass(fieldError('comment'))}`}
        />
      </Field>

      {/* ── Actions ─────────────────────────────────────────────── */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="rounded-lg border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-400 disabled:opacity-60"
        >
          {submitting && <InlineSpinner />}
          {isEdit ? 'Update Entry' : 'Add Entry'}
        </button>
      </div>
    </form>
  )
}

// ── Small helper components ──────────────────────────────────────────────────

function Field({ label, required, error, children }) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

const inputClass = (error) =>
  `w-full rounded-lg border px-3 py-2 text-sm text-gray-800 shadow-sm transition placeholder-gray-400
   focus:outline-none focus:ring-2
   ${
     error
       ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100'
       : 'border-gray-200 bg-white focus:border-primary-400 focus:ring-primary-100'
   }`
