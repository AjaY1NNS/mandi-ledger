import { useState, useEffect, useCallback } from 'react'
import { useApp } from '../../context/AppContext'
import { validateEntryForm, isFormValid } from '../../utils/validators'
import { computeAmount, formatBrokerage, formatCurrency } from '../../utils/helpers'
import { InlineSpinner } from '../common/LoadingSpinner'

const EMPTY_FORM = {
  date:            '',
  vehicleCount:    '',       // required
  vehicleNumbers:  [''],     // optional, multiple
  billNumber:      '',       // optional, free-text
  buyer:           '',
  buyerOther:      '',
  seller:          '',
  sellerOther:     '',
  rate:            '',
  weight:          '',       // QNTL – optional
  commodity:       '',
  brokerageType:   'percent', // 'percent' | 'amount'
  brokerageValue:  '',
  comment:         '',
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
 *   initialData  {object|null}
 *   onSubmit     {(data) => Promise<boolean>}
 *   onCancel     {() => void}
 *   isEdit       {boolean}
 */
export default function EntryForm({ initialData = null, onSubmit, onCancel, isEdit = false }) {
  const { buyers, sellers, commodities, entries } = useApp()

  const [form,       setForm]       = useState(EMPTY_FORM)
  const [errors,     setErrors]     = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [touched,    setTouched]    = useState({})

  // ── Populate form ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (initialData) {
      const buyerNames  = buyers.map(partyLabel)
      const sellerNames = sellers.map(partyLabel)
      // vehicleNumber stored as pipe-separated string in the sheet
      const vehicles = initialData.vehicleNumber
        ? String(initialData.vehicleNumber).split('|').filter(Boolean)
        : ['']

      // Normalise date to YYYY-MM-DD required by <input type="date">
      const rawDate = initialData.date ?? ''
      let normalizedDate = ''
      if (rawDate) {
        const d = new Date(rawDate.includes('T') ? rawDate : rawDate + 'T00:00:00')
        if (!isNaN(d.getTime())) {
          const yyyy = d.getFullYear()
          const mm   = String(d.getMonth() + 1).padStart(2, '0')
          const dd   = String(d.getDate()).padStart(2, '0')
          normalizedDate = `${yyyy}-${mm}-${dd}`
        } else {
          normalizedDate = rawDate
        }
      }

      setForm({
        ...EMPTY_FORM,
        ...initialData,
        date:            normalizedDate,
        vehicleCount:    initialData.vehicleCount ?? '',
        vehicleNumbers:  vehicles,
        brokerageType:   initialData.brokerageType  || 'percent',
        brokerageValue:  initialData.brokerageValue ?? '',
        weight:          initialData.weight ?? '',
        buyer:           buyerNames.includes(initialData.buyer)   ? initialData.buyer  : 'Other',
        buyerOther:      buyerNames.includes(initialData.buyer)   ? ''                 : (initialData.buyer  ?? ''),
        seller:          sellerNames.includes(initialData.seller) ? initialData.seller : 'Other',
        sellerOther:     sellerNames.includes(initialData.seller) ? ''                 : (initialData.seller ?? ''),
      })
    } else {
      const today = new Date().toISOString().slice(0, 10)
      setForm({ ...EMPTY_FORM, date: today })
    }
    setErrors({})
    setTouched({})
  }, [initialData, buyers, sellers, entries])

  // ── Field helpers ──────────────────────────────────────────────────────────
  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setTouched(prev => ({ ...prev, [name]: true }))
    // Clear this field's error as soon as the user starts correcting it
    setErrors(prev => {
      if (!prev[name]) return prev
      const next = { ...prev }
      delete next[name]
      return next
    })
  }, [])

  const handleBlur = useCallback((e) => {
    const { name } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
    const allErrors = validateEntryForm({ ...form, [name]: e.target.value })
    setErrors(allErrors)
  }, [form])

  // ── Vehicle numbers ────────────────────────────────────────────────────────
  const setVehicle = (idx, value) => {
    setForm(prev => {
      const arr = [...prev.vehicleNumbers]
      arr[idx] = value
      return { ...prev, vehicleNumbers: arr }
    })
    setTouched(prev => ({ ...prev, vehicleNumbers: true }))
    // Clear vehicle error as soon as the user types anything
    setErrors(prev => {
      if (!prev.vehicleNumbers) return prev
      const next = { ...prev }
      delete next.vehicleNumbers
      return next
    })
  }

  const addVehicle    = () => setForm(prev => ({ ...prev, vehicleNumbers: [...prev.vehicleNumbers, ''] }))
  const removeVehicle = (idx) => setForm(prev => ({
    ...prev,
    vehicleNumbers: prev.vehicleNumbers.filter((_, i) => i !== idx),
  }))

  // ── Derived ────────────────────────────────────────────────────────────────
  const estimatedAmount = computeAmount(form.rate, form.weight)

  // Brokerage preview
  const brokeragePreview = (() => {
    if (!form.brokerageValue || !estimatedAmount) return null
    const val = parseFloat(form.brokerageValue)
    if (isNaN(val)) return null
    return form.brokerageType === 'percent'
      ? formatCurrency((estimatedAmount * val) / 100)
      : formatCurrency(val)
  })()

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    const allErrors = validateEntryForm(form)
    setErrors(allErrors)
    setTouched(Object.keys(form).reduce((acc, k) => ({ ...acc, [k]: true }), {}))
    if (!isFormValid(allErrors)) return

    setSubmitting(true)
    const resolvedBuyer  = form.buyer  === 'Other' ? form.buyerOther.trim()  : form.buyer
    const resolvedSeller = form.seller === 'Other' ? form.sellerOther.trim() : form.seller
    const filledVehicles = form.vehicleNumbers.map(v => v.trim()).filter(Boolean)

    const payload = {
      ...(initialData ?? {}),
      date:           form.date,
      billNumber:     form.billNumber,
      vehicleCount:   parseInt(form.vehicleCount, 10),
      vehicleNumber:  filledVehicles.join('|'),   // stored pipe-separated, may be empty
      buyer:          resolvedBuyer,
      seller:         resolvedSeller,
      commodity:      form.commodity,
      rate:           form.rate !== '' ? parseFloat(form.rate) : '',
      weight:         form.weight !== '' ? parseFloat(form.weight) : '',
      brokerageType:  form.brokerageType,
      brokerageValue: form.brokerageValue !== '' ? parseFloat(form.brokerageValue) : '',
      comment:        form.comment.trim(),
    }

    const success = await onSubmit(payload)
    setSubmitting(false)
    if (success) setForm(EMPTY_FORM)
  }

  const fieldError = (name) => (touched[name] ? errors[name] : undefined)

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">

      {/* ── Row 1: Date + Bill Number (auto) ────────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Date" required error={fieldError('date')}>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            onBlur={handleBlur}
            className={inputCls(fieldError('date'))}
          />
        </Field>

        <Field label="Bill Number" hint="optional">
          <input
            type="text"
            name="billNumber"
            placeholder="e.g. 1234"
            value={form.billNumber}
            onChange={handleChange}
            className={inputCls()}
          />
        </Field>
      </div>

      {/* ── Vehicle Count + Vehicle Numbers ─────────────────────── */}
      <Field label="Vehicle Count" required error={fieldError('vehicleCount')}>
        <input
          type="number"
          name="vehicleCount"
          min="1"
          step="1"
          placeholder="e.g. 3"
          value={form.vehicleCount}
          onChange={handleChange}
          onBlur={handleBlur}
          className={inputCls(fieldError('vehicleCount'))}
        />
      </Field>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Vehicle Numbers
          <span className="ml-1.5 text-xs font-normal text-gray-400">(optional)</span>
        </label>
        <div className="space-y-2">
          {form.vehicleNumbers.map((veh, idx) => (
            <div key={idx} className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-3 flex items-center text-xs font-semibold text-gray-400 select-none">
                  {idx + 1}.
                </span>
                <input
                  type="text"
                  placeholder="HR 55 AB 1234"
                  value={veh}
                  onChange={e => setVehicle(idx, e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 pl-8 text-sm text-gray-800 shadow-sm placeholder-gray-400 transition focus:outline-none focus:ring-2 focus:border-primary-400 focus:ring-primary-100"
                />
              </div>
              {form.vehicleNumbers.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeVehicle(idx)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-500 transition hover:bg-red-100"
                  aria-label="Remove vehicle"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addVehicle}
            className="flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add another vehicle
          </button>
        </div>
      </div>

      {/* ── Buyer ───────────────────────────────────────────────── */}
      <Field label="Buyer" error={fieldError('buyer') || fieldError('buyerOther')}>
        <select
          name="buyer"
          value={form.buyer}
          onChange={handleChange}
          onBlur={handleBlur}
          className={inputCls(fieldError('buyer'))}
        >
          <option value="">Select buyer…</option>
          {buyers.map(b => { const l = partyLabel(b); return <option key={b.id} value={l}>{l}</option> })}
          <option value="Other">Other…</option>
        </select>
        {form.buyer === 'Other' && (
          <input
            type="text" name="buyerOther" placeholder="Enter buyer name"
            value={form.buyerOther} onChange={handleChange} onBlur={handleBlur}
            className={`mt-2 ${inputCls(fieldError('buyerOther'))}`}
          />
        )}
      </Field>

      {/* ── Seller ──────────────────────────────────────────────── */}
      <Field label="Seller" error={fieldError('seller') || fieldError('sellerOther')}>
        <select
          name="seller"
          value={form.seller}
          onChange={handleChange}
          onBlur={handleBlur}
          className={inputCls(fieldError('seller'))}
        >
          <option value="">Select seller…</option>
          {sellers.map(s => { const l = partyLabel(s); return <option key={s.id} value={l}>{l}</option> })}
          <option value="Other">Other…</option>
        </select>
        {form.seller === 'Other' && (
          <input
            type="text" name="sellerOther" placeholder="Enter seller name"
            value={form.sellerOther} onChange={handleChange} onBlur={handleBlur}
            className={`mt-2 ${inputCls(fieldError('sellerOther'))}`}
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
          className={inputCls(fieldError('commodity'))}
        >
          <option value="">Select commodity…</option>
          {commodities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
      </Field>

      {/* ── Rate + Weight (QNTL) ────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Rate (₹ / QNTL)" hint="optional" error={fieldError('rate')}>
          <input
            type="number" name="rate" min="0" step="0.01" placeholder="0.00"
            value={form.rate} onChange={handleChange} onBlur={handleBlur}
            className={inputCls(fieldError('rate'))}
          />
        </Field>
        <Field label="Weight (QNTL)" error={fieldError('weight')}>
          <input
            type="number" name="weight" min="0" step="0.001" placeholder="0.000"
            value={form.weight} onChange={handleChange} onBlur={handleBlur}
            className={inputCls(fieldError('weight'))}
          />
        </Field>
      </div>

      {/* ── Brokerage ───────────────────────────────────────────── */}
      <Field label="Brokerage Rate (₹ / QNTL)" error={fieldError('brokerageValue')}>
        <div className="flex gap-2">
          {/* Type toggle */}
          <div className="flex shrink-0 rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
            <BrokerageTypeBtn
              active={form.brokerageType === 'percent'}
              onClick={() => setForm(prev => ({ ...prev, brokerageType: 'percent' }))}
              label="%" title="Percentage"
            />
            <BrokerageTypeBtn
              active={form.brokerageType === 'amount'}
              onClick={() => setForm(prev => ({ ...prev, brokerageType: 'amount' }))}
              label="₹" title="Flat Amount"
            />
          </div>
          {/* Value input */}
          <input
            type="number"
            name="brokerageValue"
            min="0"
            step={form.brokerageType === 'percent' ? '0.01' : '1'}
            placeholder={form.brokerageType === 'percent' ? 'e.g. 2.5' : 'e.g. 500'}
            value={form.brokerageValue}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`flex-1 ${inputCls(fieldError('brokerageValue'))}`}
          />
        </div>
        {/* Brokerage amount preview when type=percent and we have a total */}
        {brokeragePreview && form.brokerageType === 'percent' && (
          <p className="mt-1 text-xs text-gray-500">
            = {brokeragePreview} on estimated total
          </p>
        )}
      </Field>

      {/* ── Comment ─────────────────────────────────────────────── */}
      <Field label="Comment" error={fieldError('comment')}>
        <textarea
          name="comment" rows={2} placeholder="Optional notes…"
          value={form.comment} onChange={handleChange} onBlur={handleBlur}
          className={`resize-none ${inputCls(fieldError('comment'))}`}
        />
      </Field>

      {/* ── Actions ─────────────────────────────────────────────── */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button" onClick={onCancel} disabled={submitting}
          className="rounded-lg border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit" disabled={submitting}
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:opacity-60"
        >
          {submitting && <InlineSpinner />}
          {isEdit ? 'Update Entry' : 'Add Entry'}
        </button>
      </div>
    </form>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Field({ label, required, hint, error, children }) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
        {hint && <span className="ml-1.5 text-xs font-normal text-gray-400">({hint})</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

function BrokerageTypeBtn({ active, onClick, label, title }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`px-3.5 py-2 text-sm font-bold transition ${
        active
          ? 'bg-primary-600 text-white'
          : 'bg-white text-gray-500 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  )
}

const inputCls = (err) =>
  `w-full rounded-lg border px-3 py-2 text-sm text-gray-800 shadow-sm placeholder-gray-400
   transition focus:outline-none focus:ring-2
   ${err
     ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100'
     : 'border-gray-200 bg-white focus:border-primary-400 focus:ring-primary-100'}`
