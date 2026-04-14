import { format, parseISO, isValid } from 'date-fns'

/**
 * Generate a simple unique ID (timestamp + random suffix).
 * For production with high write throughput, prefer a UUID library.
 */
export const generateId = () =>
  `ML-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`

/** Current datetime as ISO 8601 string */
export const nowIso = () => new Date().toISOString()

/**
 * Format an ISO date string or YYYY-MM-DD to a display-friendly string.
 * @param {string} dateStr
 * @param {string} [fmt='dd MMM yyyy']
 */
export const formatDate = (dateStr, fmt = 'dd MMM yyyy') => {
  if (!dateStr) return '—'
  try {
    const d = dateStr.includes('T') ? parseISO(dateStr) : new Date(dateStr + 'T00:00:00')
    return isValid(d) ? format(d, fmt) : dateStr
  } catch {
    return dateStr
  }
}

/**
 * Format a datetime ISO string to locale-friendly display.
 * @param {string} isoStr
 */
export const formatDateTime = (isoStr) => {
  if (!isoStr) return '—'
  try {
    const d = parseISO(isoStr)
    return isValid(d) ? format(d, 'dd MMM yyyy, hh:mm a') : isoStr
  } catch {
    return isoStr
  }
}

/**
 * Format a number as Indian currency (₹).
 * @param {number|string} value
 */
export const formatCurrency = (value) => {
  const num = parseFloat(value)
  if (isNaN(num)) return '—'
  return new Intl.NumberFormat('en-IN', {
    style:    'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(num)
}

/**
 * Format weight in kg with comma separation.
 * @param {number|string} value
 */
export const formatWeight = (value) => {
  const num = parseFloat(value)
  if (isNaN(num)) return '—'
  return `${new Intl.NumberFormat('en-IN').format(num)} kg`
}

/**
 * Truncate a string to maxLen characters and append ellipsis.
 * @param {string} str
 * @param {number} maxLen
 */
export const truncate = (str, maxLen = 30) => {
  if (!str) return ''
  return str.length > maxLen ? `${str.slice(0, maxLen)}…` : str
}

/**
 * Compute total amount: rate × weight.
 */
export const computeAmount = (rate, weight) => {
  const r = parseFloat(rate)
  const w = parseFloat(weight)
  return isNaN(r) || isNaN(w) ? null : r * w
}

/**
 * Returns 'admin' or 'staff' badge colour classes.
 */
export const roleBadgeClass = (role) =>
  role === 'admin'
    ? 'bg-purple-100 text-purple-800 border border-purple-200'
    : 'bg-blue-100 text-blue-800 border border-blue-200'

/**
 * Auto-generate a sequential bill number for the given date.
 * Format: ML-INV-YYYY-MM-NNNN  (e.g. ML-INV-2026-04-0001)
 *
 * @param {Array}  entries  All entries currently in state
 * @param {string} date     YYYY-MM-DD date string
 */
export const generateBillNumber = (entries, date) => {
  const d = date ? new Date(date + 'T00:00:00') : new Date()
  const year  = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const prefix = `ML-INV-${year}-${month}-`

  let maxSeq = 0
  entries.forEach((e) => {
    if (typeof e.billNumber === 'string' && e.billNumber.startsWith(prefix)) {
      const seq = parseInt(e.billNumber.slice(prefix.length), 10)
      if (!isNaN(seq) && seq > maxSeq) maxSeq = seq
    }
  })

  return `${prefix}${String(maxSeq + 1).padStart(4, '0')}`
}

/**
 * Format brokerage for display.
 * @param {string} type   'percent' | 'amount'
 * @param {number|string} value
 */
export const formatBrokerage = (type, value) => {
  const num = parseFloat(value)
  if (isNaN(num) || value === '' || value === null) return '—'
  return type === 'percent'
    ? `${num}%`
    : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(num)
}

/**
 * Format weight in Quintal (Qtl).
 */
export const formatQtl = (value) => {
  const num = parseFloat(value)
  if (isNaN(num)) return '—'
  return `${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 3 }).format(num)} Qtl`
}

/**
 * Parse a pipe-separated vehicle numbers string into a display string.
 * e.g. "HR55AB1234|HR55CD5678" → "HR55AB1234, HR55CD5678"
 */
export const formatVehicleNumbers = (raw) => {
  if (!raw) return '—'
  return String(raw).split('|').filter(Boolean).join(', ')
}
