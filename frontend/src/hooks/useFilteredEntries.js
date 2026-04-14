import { useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'

/**
 * Returns a filtered, sorted, and paginated slice of entries
 * derived purely from AppContext state — no side effects.
 */
export function useFilteredEntries() {
  const {
    entries,
    searchQuery,
    filterDate,
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
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      result = result.filter(
        (e) =>
          e.vehicleNumber?.toLowerCase().includes(q) ||
          e.billNumber?.toLowerCase().includes(q) ||
          e.buyer?.toLowerCase().includes(q) ||
          e.seller?.toLowerCase().includes(q)
      )
    }

    // ── Date filter ─────────────────────────────────────────────────────────
    if (filterDate) {
      result = result.filter((e) => e.date === filterDate)
    }

    // ── Sorting ─────────────────────────────────────────────────────────────
    result.sort((a, b) => {
      let valA = a[sortColumn] ?? ''
      let valB = b[sortColumn] ?? ''

      // Numeric columns
      if (['rate', 'weight', 'vehicleCount'].includes(sortColumn)) {
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
  }, [entries, searchQuery, filterDate, currentPage, pageSize, sortColumn, sortDirection, isAdmin, user])

  return processed
}
