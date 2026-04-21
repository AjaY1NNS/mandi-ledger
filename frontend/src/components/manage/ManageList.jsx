import EmptyState from '../common/EmptyState'

/**
 * ManageList – generic list card for buyers, sellers, or commodities.
 *
 * Props:
 *   items       {array}
 *   renderItem  {(item) => ReactNode}    – main content of each row
 *   onEdit      {(item) => void}
 *   onDelete    {(item) => void}
 *   isLoading   {boolean}
 *   emptyTitle  {string}
 */
export default function ManageList({ items = [], renderItem, onEdit, onDelete, isLoading, emptyTitle }) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary-600" />
      </div>
    )
  }

  if (!items.length) return <EmptyState title={emptyTitle} subtitle="Click 'Add' to create the first one." />

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="group flex items-start justify-between gap-4 rounded-xl border border-gray-100 bg-white px-4 py-3.5 shadow-sm transition hover:border-primary-100 hover:shadow-md"
        >
          {/* Content slot */}
          <div className="min-w-0 flex-1">{renderItem(item)}</div>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(item)}
              className="rounded-md bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700 transition hover:bg-primary-100"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(item)}
              className="rounded-md bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
