import { useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'

/**
 * Normalise any date value Google Sheets might return into YYYY-MM-DD.
 * Sheets can return: "2026-04-14", "2026-04-14T00:00:00.000Z",
 * "4/14/2026", or a numeric serial — all need to land on the same string.
 */
function toYMD(raw) {
  if (!raw && raw !== 0) return '';
  const s = String(raw).trim();

  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  // ISO datetime or any parseable date — convert to LOCAL date
  if (/^\d{4}-\d{2}-\d{2}T/.test(s)) {
    const d = new Date(s);
    if (!isNaN(d)) {
      // Use local year/month/day instead of UTC
      const yyyy = d.getFullYear();
      const mm   = String(d.getMonth() + 1).padStart(2, '0');
      const dd   = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }
  }

  // Numeric serial (Sheets epoch = Dec 30 1899)
  if (/^\d+(\.\d+)?$/.test(s)) {
    const serial = parseFloat(s);
    const epoch  = new Date(Date.UTC(1899, 11, 30));
    const d      = new Date(epoch.getTime() + serial * 86400000);
    const yyyy   = d.getFullYear();
    const mm     = String(d.getMonth() + 1).padStart(2, '0');
    const dd     = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  // Fallback
  try {
    const d = new Date(s);
    if (!isNaN(d)) {
      const yyyy = d.getFullYear();
      const mm   = String(d.getMonth() + 1).padStart(2, '0');
      const dd   = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }
  } catch {}

  return s;
}

/**
 * Returns a filtered, sorted, and paginated slice of entries
 * derived purely from AppContext state — no side effects.
 */
export function useFilteredEntries() {
  const {
    entries,
    searchQuery,
    filterFrom,
    filterTo,
    currentPage,
    pageSize,
    sortColumn,
    sortDirection,
  } = useApp()

  const { user, isAdmin } = useAuth()

  const processed = useMemo(() => {
    let result = [...entries]

    // ── Role filter: staff sees only their own entries ──────────────────────
    if (!isAdmin) {
      result = result.filter((e) => e.createdBy === user?.email)
    }

    // ── Search filter ───────────────────────────────────────────────────────
    const q = searchQuery.trim().toLowerCase()
    if (q) {
      result = result.filter((e) => {
        const str = (v) => String(v ?? '').toLowerCase()
        return (
          str(e.vehicleNumber).includes(q) ||
          str(e.billNumber).includes(q)    ||
          str(e.buyer).includes(q)         ||
          str(e.seller).includes(q)        ||
          str(e.commodity).includes(q)
        )
      })
    }

    // ── Date range filter – skipped when a search query is active ──────────
    if (!q) {
      if (filterFrom) result = result.filter((e) => toYMD(e.date) >= filterFrom)
      if (filterTo)   result = result.filter((e) => toYMD(e.date) <= filterTo)
    }

    // ── Sorting ─────────────────────────────────────────────────────────────
    result.sort((a, b) => {
      let valA = a[sortColumn] ?? ''
      let valB = b[sortColumn] ?? ''

      // Numeric columns
      if (['rate', 'weight', 'vehicleCount', 'brokerageValue'].includes(sortColumn)) {
        valA = parseFloat(valA) || 0
        valB = parseFloat(valB) || 0
      } else {
        valA = String(valA).toLowerCase()
        valB = String(valB).toLowerCase()
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    const totalCount = result.length
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
    const safePage   = Math.min(currentPage, totalPages)
    const start      = (safePage - 1) * pageSize
    const paginated  = result.slice(start, start + pageSize)

    return { data: paginated, totalCount, totalPages }
  }, [entries, searchQuery, filterFrom, filterTo, currentPage, pageSize, sortColumn, sortDirection, isAdmin, user])

  return processed
}
