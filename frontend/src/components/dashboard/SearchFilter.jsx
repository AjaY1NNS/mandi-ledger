import { useApp } from '../../context/AppContext'

/**
 * SearchFilter – search bar + date filter + page-size selector.
 * All state is managed via AppContext.
 */
export default function SearchFilter({ totalCount = 0 }) {
  const {
    searchQuery,
    filterDate,
    pageSize,
    setSearch,
    setFilterDate,
    setPageSize,
  } = useApp()

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Left controls */}
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1 sm:max-w-xs">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search vehicle / bill / buyer…"
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

        {/* Date filter */}
        <div className="relative">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-3 text-sm text-gray-800 shadow-sm transition focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 sm:w-auto"
            aria-label="Filter by date"
          />
          {filterDate && (
            <button
              onClick={() => setFilterDate('')}
              className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-gray-600"
              aria-label="Clear date filter"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Right: result count + page size */}
      <div className="flex items-center gap-3 text-sm text-gray-500">
        <span className="whitespace-nowrap font-medium text-gray-700">
          {totalCount} {totalCount === 1 ? 'entry' : 'entries'}
        </span>
        <div className="flex items-center gap-1.5">
          <label htmlFor="page-size" className="text-xs text-gray-400 hidden sm:block">
            Per page
          </label>
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
  )
}
