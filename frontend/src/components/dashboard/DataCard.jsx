import { useAuth } from '../../context/AuthContext'
import { formatDate, formatCurrency, formatWeight, formatDateTime } from '../../utils/helpers'
import EmptyState from '../common/EmptyState'

/**
 * DataCard – mobile-first card grid view of entries.
 *
 * Props:
 *   entries  {array}
 *   onEdit   {(entry) => void}
 *   onDelete {(entry) => void}
 */
export default function DataCard({ entries, onEdit, onDelete }) {
  const { isAdmin, user } = useAuth()

  if (!entries.length) {
    return <EmptyState subtitle="Try adjusting your search or date filter." />
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {entries.map((entry, idx) => {
        const canEdit   = isAdmin || entry.createdBy === user?.email
        const canDelete = isAdmin

        return (
          <div
            key={entry.id ?? idx}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
          >
            {/* Top row */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                  {formatDate(entry.date)}
                </p>
                <p className="mt-0.5 text-base font-bold text-gray-900">
                  {entry.vehicleNumber ?? '—'}
                </p>
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

            {/* Rate / Weight / Vehicle Count */}
            <div className="mt-3 flex items-center gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Rate</p>
                <p className="text-sm font-bold text-emerald-600">{formatCurrency(entry.rate)}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Weight</p>
                <p className="text-sm font-semibold text-gray-800">{formatWeight(entry.weight)}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Vehicles</p>
                <p className="text-sm font-semibold text-gray-800">{entry.vehicleCount ?? '—'}</p>
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
              <div className="flex gap-2">
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
            </div>
          </div>
        )
      })}
    </div>
  )
}
