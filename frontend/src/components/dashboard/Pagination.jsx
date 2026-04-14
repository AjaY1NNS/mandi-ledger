import { useApp } from '../../context/AppContext'

/**
 * Pagination bar.
 * Props:
 *   totalPages {number}
 *   totalCount {number}
 */
export default function Pagination({ totalPages, totalCount }) {
  const { currentPage, pageSize, setPage } = useApp()

  if (totalPages <= 1) return null

  const startItem = (currentPage - 1) * pageSize + 1
  const endItem   = Math.min(currentPage * pageSize, totalCount)

  // Build page number array with ellipsis
  const getPages = () => {
    const pages = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (currentPage > 3) pages.push('…')
      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      ) {
        pages.push(i)
      }
      if (currentPage < totalPages - 2) pages.push('…')
      pages.push(totalPages)
    }
    return pages
  }

  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      {/* Item range */}
      <p className="text-sm text-gray-500">
        Showing <span className="font-medium text-gray-800">{startItem}–{endItem}</span> of{' '}
        <span className="font-medium text-gray-800">{totalCount}</span> entries
      </p>

      {/* Page buttons */}
      <div className="flex items-center gap-1">
        {/* Prev */}
        <button
          onClick={() => setPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Previous page"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        {getPages().map((page, idx) =>
          page === '…' ? (
            <span key={`ellipsis-${idx}`} className="flex h-8 w-8 items-center justify-center text-sm text-gray-400">
              …
            </span>
          ) : (
            <button
              key={page}
              onClick={() => setPage(page)}
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition ${
                currentPage === page
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => setPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Next page"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
    </div>
  )
}
