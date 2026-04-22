import { useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'
import { formatWeight } from '../../utils/helpers'
import { toLocalDateStr, toYMD } from '../../utils/dateFormate'

/**
 * StatsBar – aggregate statistics shown above the data table.
 */
export default function StatsBar() {
  const { entries } = useApp()
  const { isAdmin }  = useAuth()

  const todayStr = toLocalDateStr(new Date())

  const stats = useMemo(() => {
    const _entries = entries.filter(e => !e.isDeleted) // Exclude deleted entries from stats
    const totalEntries  = _entries.length
    const totalWeight   = _entries.reduce((sum, e) => sum + (Number(e.weight)           || 0), 0)
    const totalVehicles = _entries.reduce((sum, e) => sum + (Number(e.vehicleCount, 10)   || 0), 0)

    const todayEntries  = _entries.filter(e => toYMD(e.date) === todayStr)
    const todayCount    = todayEntries.length
    const todayWeight   = todayEntries.reduce((sum, e) => sum + (Number(e.weight) || 0), 0)
    const todayVehicles = todayEntries.reduce((sum, e) => sum + (Number(e.vehicleCount, 10) || 0), 0)

    return { totalEntries, totalWeight, totalVehicles, todayCount, todayVehicles, todayWeight }
  }, [entries, todayStr])

  const cards = [
    {
      label: 'Total Entries',
      value: stats.totalEntries.toLocaleString('en-IN'),
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
        </svg>
      ),
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Total Vehicles',
      value: stats.totalVehicles.toLocaleString('en-IN'),
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
        </svg>
      ),
      color: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Total Weight (QNTL)',
      value: formatWeight(stats.totalWeight),
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" />
        </svg>
      ),
      color: 'bg-green-50 text-green-600',
    },
  ]

  return (
    <div className="space-y-3">
      {/* ── All-time stats (admin only) ─────────────────────────── */}
      {isAdmin && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {cards.map((card) => (
            <div
              key={card.label}
              className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
            >
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.color}`}>
                {card.icon}
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">{card.label}</p>
                <p className="mt-0.5 truncate text-base font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Today's 24h overview ────────────────────────────────── */}
      <div className="rounded-xl border border-primary-100 bg-primary-50/60 px-4 py-3">
        <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wide text-primary-500">
          Today's Overview
        </p>
        <div className="grid grid-cols-3 gap-3">
          {/* Today Entries */}
          <div className="flex items-center gap-3 rounded-lg bg-white border border-primary-100 px-3 py-2.5 shadow-sm">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
              </svg>
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">Total Entries</p>
              <p className="mt-0.5 text-lg font-bold text-gray-900">{stats.todayCount.toLocaleString('en-IN')}</p>
            </div>
          </div>

          {/* Today Vehicles */}
          <div className="flex items-center gap-3 rounded-lg bg-white border border-primary-100 px-3 py-2.5 shadow-sm">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
              </svg>
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">Total Vehicles</p>
              <p className="mt-0.5 text-lg font-bold text-gray-900">{stats.todayVehicles.toLocaleString('en-IN')}</p>
            </div>
          </div>

          {/* Today Weight */}
          <div className="flex items-center gap-3 rounded-lg bg-white border border-primary-100 px-3 py-2.5 shadow-sm">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" />
              </svg>
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">Total Weight (QNTL)</p>
              <p className="mt-0.5 text-lg font-bold text-gray-900">{formatWeight(stats.todayWeight)}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
