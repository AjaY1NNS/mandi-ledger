import { memo } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import { formatDate, formatCurrency, formatQtl, formatBrokerage, formatVehicleNumbers, formatDateTime } from '../../utils/helpers'
import EmptyState from '../common/EmptyState'

/**
 * DataCard – mobile-first card grid view of entries.
 *
 * Props:
 *   entries   {array}
 *   onEdit    {(entry) => void}
 *   onDelete  {(entry) => void}
 *   onApprove {(entry) => void}
 */
function DataCard({ entries, onEdit, onDelete, onApprove }) {
  const { isAdmin, user }              = useAuth()
  const { currentPage, pageSize }      = useApp()
  const startIndex                     = (currentPage - 1) * pageSize

  if (!entries.length) {
    return <EmptyState subtitle="Try adjusting your search or date filter." />
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {entries.map((entry, idx) => {
        const isApproved = String(entry.isApproved) === 'true'
        const canEdit    = !isApproved && (isAdmin || entry.createdBy === user?.email)
        const canDelete  = !isApproved && isAdmin
        const canApprove = !isApproved

        return (
          <div
            key={entry.id ?? idx}
            className={`rounded-xl border p-4 shadow-sm transition hover:shadow-md ${
              isApproved ? 'border-green-200 bg-green-50/30' : 'border-gray-200 bg-white'
            }`}
          >
            {/* Top row */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                {/* Row index badge */}
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[10px] font-semibold text-gray-400 tabular-nums">
                  {startIndex + idx + 1}
                </span>
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                    {formatDate(entry.date)}
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-gray-900 leading-snug">
                    {formatVehicleNumbers(entry.vehicleNumber)}
                  </p>
                </div>
              </div>
              {/* Commodity badge */}
              <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-100">
                {entry.commodity ?? '—'}
              </span>
            </div>

            {/* Bill Number */}
            <p className="mt-1 text-xs text-gray-500">
              Bill: <span className="font-medium text-gray-700">{entry.billNumber ?? '—'}</span>
            </p>

            {/* Buyer / Seller */}
            <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-gray-50 p-2.5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Buyer</p>
                <p className="mt-0.5 text-sm font-medium text-gray-800 break-words">{entry.buyer ?? '—'}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Seller</p>
                <p className="mt-0.5 text-sm font-medium text-gray-800 break-words">{entry.seller ?? '—'}</p>
              </div>
            </div>

            {/* Vehicle Count */}
            {entry.vehicleCount && (
              <p className="mt-1 text-xs text-gray-500">
                Vehicles: <span className="font-medium text-gray-700">{entry.vehicleCount}</span>
              </p>
            )}

            {/* Rate / Weight / Brokerage */}
            <div className="mt-3 flex items-center gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Rate (Rs/QNLT)</p>
                <p className="text-sm font-bold text-emerald-600">{formatCurrency(entry.rate)}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Weight (QNTL)</p>
                <p className="text-sm font-semibold text-gray-800">{formatQtl(entry.weight)}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Brokerage (Rs/QNLT)</p>
                <p className="text-sm font-semibold text-indigo-700">
                  {formatBrokerage(entry.brokerageType, entry.brokerageValue)}
                </p>
              </div>
            </div>

            {/* Comment */}
            {entry.comment && (
              <p className="mt-2 text-xs italic text-gray-400 line-clamp-2">
                {entry.comment}
              </p>
            )}

            {/* Footer: meta + actions */}
            <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
              <p className="text-[10px] text-gray-400">
                By {entry.createdBy ?? '?'} · {formatDateTime(entry.updatedAt || entry.createdAt)}
              </p>
              {isApproved ? (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700 border border-green-200">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                    Approved
                  </span>
                  {isAdmin && (
                    <button
                      onClick={() => onEdit(entry)}
                      className="rounded-lg bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 transition hover:bg-primary-100"
                    >
                      Edit
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex gap-2">
                  {canApprove && (
                    <button
                      onClick={() => onApprove(entry)}
                      className="rounded-lg bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 transition hover:bg-green-100"
                    >
                      Approve
                    </button>
                  )}
                  {canEdit && (
                    <button
                      onClick={() => onEdit(entry)}
                      className="rounded-lg bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 transition hover:bg-primary-100"
                    >
                      Edit
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => onDelete(entry)}
                      className="rounded-lg bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                    >
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default memo(DataCard)
