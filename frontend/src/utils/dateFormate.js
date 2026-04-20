// ✅ Always get local YYYY-MM-DD
export const toLocalDateStr = (d) => {
  const yyyy = d.getFullYear()
  const mm   = String(d.getMonth() + 1).padStart(2, '0')
  const dd   = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

// ✅ Normalize any date value to local YYYY-MM-DD
export const toYMD = (raw) => {
  if (!raw && raw !== 0) return ''
  const s = String(raw).trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s   // already YYYY-MM-DD
  const d = new Date(s)
  return isNaN(d) ? s : toLocalDateStr(d)
}