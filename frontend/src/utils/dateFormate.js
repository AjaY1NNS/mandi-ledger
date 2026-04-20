/**
 * Central date utility — always works in LOCAL time, never UTC.
 *
 * Rule: never call .toISOString().slice(0,10) on a Date — that gives the UTC
 * date which can differ from the user's local date near midnight.
 */

/** Format a local Date object → "YYYY-MM-DD" */
export const toLocalDateStr = (d) => {
  const yyyy = d.getFullYear()
  const mm   = String(d.getMonth() + 1).padStart(2, '0')
  const dd   = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

/**
 * Normalise any date value Google Sheets might return into local "YYYY-MM-DD".
 * Handles:
 *   • Already "YYYY-MM-DD"              → returned as-is
 *   • ISO timestamp "2026-04-14T…"      → converted to local date
 *   • Sheets serial number (numeric)    → converted via Sheets epoch (1899-12-30)
 *   • Any other parseable string        → parsed then converted to local date
 */
export const toYMD = (raw) => {
  if (!raw && raw !== 0) return ''
  const s = String(raw).trim()

  // Already YYYY-MM-DD — pass through directly
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s

  // ISO datetime — parse and convert to LOCAL date
  if (/^\d{4}-\d{2}-\d{2}T/.test(s)) {
    const d = new Date(s)
    if (!isNaN(d)) return toLocalDateStr(d)
  }

  // Google Sheets numeric serial (epoch = 30 Dec 1899)
  if (/^\d+(\.\d+)?$/.test(s)) {
    const serial = parseFloat(s)
    const epoch  = new Date(Date.UTC(1899, 11, 30))
    const d      = new Date(epoch.getTime() + serial * 86400000)
    return toLocalDateStr(d)
  }

  // Fallback: try generic parse
  try {
    const d = new Date(s)
    if (!isNaN(d)) return toLocalDateStr(d)
  } catch {}

  return s
}
