import { useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { toYMD } from '../utils/dateFormate'

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
    filterCommodity,
    filterBuyer,
    filterSeller,
    filterStatus,
    currentPage,
    pageSize,
    sortColumn,
    sortDirection,
  } = useApp()

  const { user, isAdmin } = useAuth()
  const userEmail = user?.email

  const processed = useMemo(() => {
    let result = [...entries]

    // ── Always exclude deleted entries from the main dashboard ──────────────
    result = result.filter((e) => !e.isDeleted)

    // ── Role filter: staff sees unapproved + approved within last 7 days ────
    if (!isAdmin) {
      const sevenDaysAgo = Date.now() - 1 * 24 * 60 * 60 * 1000
      result = result.filter((e) => {
        if (String(e.isApproved) !== 'true') return true
        if (!e.approvedAt) return true
        return new Date(e.approvedAt).getTime() >= sevenDaysAgo
      })
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

    // ── Entity + status filters ─────────────────────────────────────────────
    if (filterCommodity) result = result.filter((e) => e.commodity === filterCommodity)
    if (filterBuyer)     result = result.filter((e) => e.buyer     === filterBuyer)
    if (filterSeller)    result = result.filter((e) => e.seller    === filterSeller)
    if (filterStatus)    result = result.filter((e) => String(e.isApproved) === filterStatus)

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
  }, [entries, searchQuery, filterFrom, filterTo, filterCommodity, filterBuyer, filterSeller, filterStatus, currentPage, pageSize, sortColumn, sortDirection, isAdmin, userEmail])

  return processed
}
