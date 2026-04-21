import { useState, useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import { toLocalDateStr } from '../../utils/dateFormate'

function presetRange(days) {
  const to   = new Date()
  const from = new Date()
  from.setDate(from.getDate() - (days - 1))
  return { from: toLocalDateStr(from), to: toLocalDateStr(to) }
}

function thisWeekRange() {
  const today = new Date()
  const day   = today.getDay()
  const diffToSunday   = day
  const diffToSaturday = 6 - day
  const from = new Date(today)
  const to   = new Date(today)
  from.setDate(today.getDate() - diffToSunday)
  to.setDate(today.getDate() + diffToSaturday)
  return { from: toLocalDateStr(from), to: toLocalDateStr(today) }
}

const PRESETS = [
  { label: 'Today',      getRange: () => { const t = toLocalDateStr(new Date()); return { from: t, to: t } } },
  { label: 'This Week',  getRange: () => thisWeekRange() },
  { label: 'Last Month', getRange: () => presetRange(30)  },
  { label: 'Last 3 Mon', getRange: () => presetRange(90)  },
  { label: 'Last 6 Mon', getRange: () => presetRange(180) },
  { label: 'Last Year',  getRange: () => presetRange(365) },
]

export default function SearchFilter({ totalCount = 0 }) {
  const {
    entries,
    commodities,
    searchQuery,
    filterFrom,
    filterTo,
    filterCommodity,
    filterBuyer,
    filterSeller,
    filterStatus,
    pageSize,
    setSearch,
    setFilterRange,
    setEntityFilters,
    setPageSize,
  } = useApp()

  const [showFilters, setShowFilters] = useState(false)

  // Local pending state — only committed on Apply
  const [pendingCommodity, setPendingCommodity] = useState(filterCommodity)
  const [pendingBuyer,     setPendingBuyer]     = useState(filterBuyer)
  const [pendingSeller,    setPendingSeller]    = useState(filterSeller)
  const [pendingStatus,    setPendingStatus]    = useState(filterStatus)

  const uniqueBuyers  = useMemo(() =>
    [...new Set(entries.map(e => e.buyer).filter(Boolean))].sort(), [entries])
  const uniqueSellers = useMemo(() =>
    [...new Set(entries.map(e => e.seller).filter(Boolean))].sort(), [entries])

  const handlePreset = (preset) => {
    const { from, to } = preset.getRange()
    setFilterRange(from, to)
  }

  const handleClearRange = () => setFilterRange('', '')

  const activePreset = PRESETS.find((p) => {
    const { from, to } = p.getRange()
    return filterFrom === from && filterTo === to
  })

  const hasRange = filterFrom || filterTo

  const hasEntityFilters = filterCommodity || filterBuyer || filterSeller || filterStatus
  const activeFilterCount = [filterCommodity, filterBuyer, filterSeller, filterStatus].filter(Boolean).length

  const handleApply = () => {
    setEntityFilters({
      filterCommodity: pendingCommodity,
      filterBuyer:     pendingBuyer,
      filterSeller:    pendingSeller,
      filterStatus:    pendingStatus,
    })
    setShowFilters(false)
  }

  const handleResetFilters = () => {
    setPendingCommodity('')
    setPendingBuyer('')
    setPendingSeller('')
    setPendingStatus('')
    setEntityFilters({ filterCommodity: '', filterBuyer: '', filterSeller: '', filterStatus: '' })
  }

  const handleToggleFilters = () => {
    if (!showFilters) {
      // Sync pending to current applied values when opening
      setPendingCommodity(filterCommodity)
      setPendingBuyer(filterBuyer)
      setPendingSeller(filterSeller)
      setPendingStatus(filterStatus)
    }
    setShowFilters(v => !v)
  }

  return (
    <div className="space-y-3">
      {/* ── Preset range buttons ──────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => handlePreset(p)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
              activePreset?.label === p.label
                ? 'border-primary-400 bg-primary-600 text-white shadow-sm'
                : 'border-gray-200 bg-white text-gray-600 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700'
            }`}
          >
            {p.label}
          </button>
        ))}

        <button
          type="button"
          onClick={handleClearRange}
          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
            !hasRange
              ? 'border-primary-400 bg-primary-600 text-white shadow-sm'
              : 'border-gray-200 bg-white text-gray-600 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700'
          }`}
        >
          All
        </button>
      </div>

      {/* ── Search + Filter toggle + count + page size ────────────────── */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {/* Search + Filter button row */}
        <div className="flex flex-1 gap-2 sm:max-w-lg">
          {/* Search */}
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search vehicle / bill / buyer / commodity…"
              value={searchQuery}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-800 placeholder-gray-400 shadow-sm transition focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
            />
            {searchQuery && (
              <button
                onClick={() => setSearch('')}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Filter toggle button */}
          <button
            type="button"
            onClick={handleToggleFilters}
            className={`relative flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium shadow-sm transition ${
              showFilters || hasEntityFilters
                ? 'border-primary-400 bg-primary-600 text-white'
                : 'border-gray-200 bg-white text-gray-600 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700'
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
            </svg>
            <span className="hidden sm:inline">Filters</span>
            {activeFilterCount > 0 && (
              <span className={`flex h-4 w-4 items-center justify-center rounded-full text-xs font-bold ${
                showFilters || hasEntityFilters ? 'bg-white text-primary-700' : 'bg-primary-600 text-white'
              }`}>
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Count + page size */}
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span className="whitespace-nowrap font-medium text-gray-700">
            {totalCount} {totalCount === 1 ? 'entry' : 'entries'}
          </span>
          <div className="flex items-center gap-1.5">
            <label htmlFor="page-size" className="hidden text-xs text-gray-400 sm:block">Per page</label>
            <select
              id="page-size"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="rounded-md border border-gray-200 bg-white px-2 py-1.5 text-sm text-gray-700 shadow-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
            >
              {[10, 15, 25, 50].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Expandable filter panel ───────────────────────────────────── */}
      {showFilters && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-sm">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">Commodity</label>
              <select
                value={pendingCommodity}
                onChange={e => setPendingCommodity(e.target.value)}
                className={selectCls}
              >
                <option value="">All commodities</option>
                {commodities.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">Status</label>
              <select
                value={pendingStatus}
                onChange={e => setPendingStatus(e.target.value)}
                className={selectCls}
              >
                <option value="">All statuses</option>
                <option value="true">Approved</option>
                <option value="false">Pending</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">Buyer</label>
              <select
                value={pendingBuyer}
                onChange={e => setPendingBuyer(e.target.value)}
                className={selectCls}
              >
                <option value="">All buyers</option>
                {uniqueBuyers.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">Seller</label>
              <select
                value={pendingSeller}
                onChange={e => setPendingSeller(e.target.value)}
                className={selectCls}
              >
                <option value="">All sellers</option>
                {uniqueSellers.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-4 flex items-center justify-end gap-2">
            {hasEntityFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-100"
              >
                Clear Filters
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowFilters(false)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-primary-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Active filter chips */}
      {hasEntityFilters && !showFilters && (
        <div className="flex flex-wrap items-center gap-2">
          {filterCommodity && (
            <FilterChip label={`Commodity: ${filterCommodity}`} onRemove={() => setEntityFilters({ filterCommodity: '', filterBuyer, filterSeller, filterStatus })} />
          )}
          {filterBuyer && (
            <FilterChip label={`Buyer: ${filterBuyer}`} onRemove={() => setEntityFilters({ filterCommodity, filterBuyer: '', filterSeller, filterStatus })} />
          )}
          {filterSeller && (
            <FilterChip label={`Seller: ${filterSeller}`} onRemove={() => setEntityFilters({ filterCommodity, filterBuyer, filterSeller: '', filterStatus })} />
          )}
          {filterStatus && (
            <FilterChip label={`Status: ${filterStatus === 'true' ? 'Approved' : 'Pending'}`} onRemove={() => setEntityFilters({ filterCommodity, filterBuyer, filterSeller, filterStatus: '' })} />
          )}
        </div>
      )}

      {/* Notices */}
      {searchQuery && (
        <p className="text-xs text-amber-600">
          Date filter paused while searching — showing results across all dates.
        </p>
      )}
    </div>
  )
}

function FilterChip({ label, onRemove }) {
  return (
    <span className="flex items-center gap-1 rounded-full border border-primary-200 bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="ml-0.5 text-primary-400 hover:text-primary-700"
        aria-label="Remove filter"
      >
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </span>
  )
}

const selectCls =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm transition focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100'
