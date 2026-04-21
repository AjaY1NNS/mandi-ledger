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
  const day   = today.getDay()                  // 0=Sun, 1=Mon ... 6=Sat

  // Days to go back to reach Sunday
  const diffToSunday   = day              // Sun(0)→0, Mon(1)→1 ... Sat(6)→6

  // Days to go forward to reach Saturday
  const diffToSaturday = 6 - day          // Sun(0)→6, Mon(1)→5 ... Sat(6)→0

  const from = new Date(today)
  const to   = new Date(today)

  from.setDate(today.getDate() - diffToSunday)
  to.setDate(today.getDate() + diffToSaturday)

  return { from: toLocalDateStr(from), to: toLocalDateStr(today) } // 👈 was missing `to`
}

const PRESETS = [
  { label: 'Today',      getRange: () => { const t = toLocalDateStr(new Date()); return { from: t, to: t } } },
  { label: 'This Week',  getRange: () => thisWeekRange() },
  // { label: 'Last 7d',    getRange: () => presetRange(7)   },
  { label: 'Last Month', getRange: () => presetRange(30)  },
  { label: 'Last 3 Mon', getRange: () => presetRange(90)  },
  { label: 'Last 6 Mon', getRange: () => presetRange(180) },
  { label: 'Last Year',  getRange: () => presetRange(365) },
]

export default function SearchFilter({ totalCount = 0 }) {
  const {
    searchQuery,
    filterFrom,
    filterTo,
    pageSize,
    setSearch,
    setFilterRange,
    setPageSize,
  } = useApp()

  const handlePreset = (preset) => {
    const { from, to } = preset.getRange()
    setFilterRange(from, to)
  }

  const handleClearRange = () => setFilterRange('', '')

  // Determine which preset is currently active
  const activePreset = PRESETS.find((p) => {
    const { from, to } = p.getRange()
    return filterFrom === from && filterTo === to
  })

  const hasRange = filterFrom || filterTo

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

        {/* All / clear */}
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

      {/* ── Search + count + page size ────────────────────────────────── */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 sm:max-w-xs">
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

      {/* Search-active notice */}
      {searchQuery && (
        <p className="text-xs text-amber-600">
          Date filter paused while searching — showing results across all dates.
        </p>
      )}
    </div>
  )
}
