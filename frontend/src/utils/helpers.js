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
