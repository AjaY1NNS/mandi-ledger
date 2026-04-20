import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'
import { TABLE_COLUMNS } from '../../utils/constants'
import { formatDate, formatCurrency, formatQtl, formatBrokerage, formatVehicleNumbers, truncate } from '../../utils/helpers'
import EmptyState from '../common/EmptyState'

/**
 * DataTable – desktop/tablet view of entries.
 *
 * Props:
 *   entries        {array}
 *   onEdit         {(entry) => void}
 *   onDelete       {(entry) => void}
 *   onApprove      {(entry) => void}
 */
export default function DataTable({ entries, onEdit, onDelete, onApprove }) {
  const { sortColumn, sortDirection, setSort, currentPage, pageSize } = useApp()
  const { isAdmin, user }                                             = useAuth()

  const startIndex = (currentPage - 1) * pageSize

  const handleSort = (col) => {
    if (!col.sortable) return
    const newDir =
      sortColumn === col.key && sortDirection === 'asc' ? 'desc' : 'asc'
    setSort(col.key, newDir)
  }

  const SortIcon = ({ colKey }) => {
    if (sortColumn !== colKey)
      return <svg className="h-3.5 w-3.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4M16 15l-4 4-4-4" /></svg>
    return sortDirection === 'asc'
      ? <svg className="h-3.5 w-3.5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>
      : <svg className="h-3.5 w-3.5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
  }

  if (!entries.length) {
    return <EmptyState subtitle="Try adjusting your search or date filter." />
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-100 text-sm">
        <thead className="bg-gray-50">
          <tr>
            {/* Index column */}
            <th className="w-10 px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-400 select-none">
              #
            </th>
            {TABLE_COLUMNS.map((col) => (
              <th
                key={col.key}
                onClick={() => handleSort(col)}
                className={`whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 select-none ${
                  col.sortable ? 'cursor-pointer hover:bg-gray-100 transition' : ''
                }`}
              >
                <span className="flex items-center gap-1">
                  {col.label}
                  {col.sortable && <SortIcon colKey={col.key} />}
                </span>
              </th>
            ))}
            {/* Actions column */}
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {entries.map((entry, idx) => {
            const isApproved = String(entry.isApproved) === 'true'
            const canEdit    = !isApproved && (isAdmin || entry.createdBy === user?.email)
            const canDelete  = !isApproved && isAdmin
            const canApprove = !isApproved

            return (
              <tr
                key={entry.id ?? idx}
                className={`group transition ${isApproved ? 'bg-green-50/40' : 'hover:bg-blue-50/40'}`}
              >
                {/* Row index */}
                <td className="px-3 py-3 text-center text-xs font-medium text-gray-400 tabular-nums">
                  {startIndex + idx + 1}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                  {formatDate(entry.date)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-center text-gray-700">
                  {entry.vehicleCount ?? '—'}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900 max-w-[160px]">
                  <span title={formatVehicleNumbers(entry.vehicleNumber)}>
                    {formatVehicleNumbers(entry.vehicleNumber)}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                  {entry.billNumber ?? '—'}
                </td>
                <td className="px-4 py-3 text-gray-700 max-w-[140px]">
                  <span title={entry.buyer}>{truncate(entry.buyer, 20)}</span>
                </td>
                <td className="px-4 py-3 text-gray-700 max-w-[140px]">
                  <span title={entry.seller}>{truncate(entry.seller, 20)}</span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                  {entry.commodity ?? '—'}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-emerald-700">
                  {formatCurrency(entry.rate)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-gray-700">
                  {formatQtl(entry.weight)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-indigo-700">
                  {formatBrokerage(entry.brokerageType, entry.brokerageValue)}
                </td>
                <td className="px-4 py-3 text-gray-500 max-w-[160px]">
                  <span title={entry.comment}>{truncate(entry.comment, 25)}</span>
                </td>
                {/* Actions */}
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  {isApproved ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700 border border-green-200">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                      Approved
                    </span>
                  ) : (
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {canApprove && (
                        <button
                          onClick={() => onApprove(entry)}
                          className="rounded-md bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 transition hover:bg-green-100"
                        >
                          Approve
                        </button>
                      )}
                      {canEdit && (
                        <button
                          onClick={() => onEdit(entry)}
                          className="rounded-md bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700 transition hover:bg-primary-100"
                        >
                          Edit
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => onDelete(entry)}
                          className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 transition hover:bg-red-100"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
