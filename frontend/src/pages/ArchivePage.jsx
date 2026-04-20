import { useState, useEffect, useCallback } from 'react'
import { Navigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/layout/Layout'
import { fetchDeletedEntries, restoreEntry } from '../services/api'
import { formatDate, formatDateTime, formatCurrency, formatWeight, formatBrokerage, formatVehicleNumbers } from '../utils/helpers'

export default function ArchivePage() {
  const { isAdmin, user } = useAuth()

  const [entries,    setEntries]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [restoringId, setRestoringId] = useState(null)

  if (!isAdmin) return <Navigate to="/" replace />

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetchDeletedEntries()
      setEntries(res.data ?? [])
    } catch (err) {
      toast.error('Failed to load archive: ' + err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleRestore = async (entry) => {
    setRestoringId(entry.id)
    try {
      await restoreEntry(entry.id)
      setEntries(prev => prev.filter(e => e.id !== entry.id))
      toast.success('Entry restored successfully.')
    } catch (err) {
      toast.error('Restore failed: ' + err.message)
    } finally {
      setRestoringId(null)
    }
  }

  return (
    <Layout>
      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Archive</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Deleted entries — restore any entry to bring it back to the dashboard.
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
        >
          <svg className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Refresh
        </button>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-gray-400">
          <svg className="mr-2 h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Loading archive…
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white py-24 text-center">
          <svg className="mb-3 h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
          <p className="text-sm font-medium text-gray-500">Archive is empty</p>
          <p className="mt-1 text-xs text-gray-400">No deleted entries found.</p>
        </div>
      ) : (
        <>
          <p className="mb-3 text-xs text-gray-400">{entries.length} deleted {entries.length === 1 ? 'entry' : 'entries'}</p>

          {/* ── Desktop table ──────────────────────────────────────────── */}
          <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 text-center">Veh. Count</th>
                    <th className="px-4 py-3">Vehicle No.</th>
                    <th className="px-4 py-3">Bill #</th>
                    <th className="px-4 py-3">Buyer</th>
                    <th className="px-4 py-3">Seller</th>
                    <th className="px-4 py-3">Commodity</th>
                    <th className="px-4 py-3">Rate</th>
                    <th className="px-4 py-3">Weight</th>
                    <th className="px-4 py-3">Brokerage</th>
                    <th className="px-4 py-3">Deleted By</th>
                    <th className="px-4 py-3">Deleted At</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {entries.map(entry => (
                    <tr key={entry.id} className="bg-red-50/30 hover:bg-red-50/60 transition-colors">
                      <td className="px-4 py-3 text-gray-700">{formatDate(entry.date)}</td>
                      <td className="px-4 py-3 text-center text-gray-700">{entry.vehicleCount ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-700">{formatVehicleNumbers(entry.vehicleNumber) || '—'}</td>
                      <td className="px-4 py-3 font-mono text-gray-600">{entry.billNumber || '—'}</td>
                      <td className="px-4 py-3 text-gray-700">{entry.buyer || '—'}</td>
                      <td className="px-4 py-3 text-gray-700">{entry.seller || '—'}</td>
                      <td className="px-4 py-3 text-gray-700">{entry.commodity || '—'}</td>
                      <td className="px-4 py-3 text-gray-700">{entry.rate ? formatCurrency(entry.rate) : '—'}</td>
                      <td className="px-4 py-3 text-gray-700">{entry.weight ? formatWeight(entry.weight) : '—'}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {entry.brokerageValue ? formatBrokerage(entry.brokerageType, entry.brokerageValue) : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{entry.updatedBy || '—'}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{entry.updatedAt ? formatDateTime(entry.updatedAt) : '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <RestoreButton
                          loading={restoringId === entry.id}
                          onClick={() => handleRestore(entry)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Mobile cards ───────────────────────────────────────────── */}
          <div className="space-y-3 md:hidden">
            {entries.map(entry => (
              <div key={entry.id} className="rounded-xl border border-red-100 bg-red-50/40 p-4 shadow-sm">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-800">{entry.commodity || 'No commodity'}</p>
                    <p className="text-xs text-gray-500">{formatDate(entry.date)}</p>
                  </div>
                  <RestoreButton
                    loading={restoringId === entry.id}
                    onClick={() => handleRestore(entry)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <InfoRow label="Veh. Count"  value={entry.vehicleCount ?? '—'} />
                  <InfoRow label="Vehicle No." value={formatVehicleNumbers(entry.vehicleNumber) || '—'} />
                  <InfoRow label="Bill #"      value={entry.billNumber || '—'} />
                  <InfoRow label="Buyer"       value={entry.buyer   || '—'} />
                  <InfoRow label="Seller"      value={entry.seller  || '—'} />
                  <InfoRow label="Rate"      value={entry.rate     ? formatCurrency(entry.rate)   : '—'} />
                  <InfoRow label="Weight"    value={entry.weight   ? formatWeight(entry.weight)   : '—'} />
                  <InfoRow label="Brokerage" value={entry.brokerageValue ? formatBrokerage(entry.brokerageType, entry.brokerageValue) : '—'} />
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  Deleted by {entry.updatedBy || '—'}{entry.updatedAt ? ` · ${formatDateTime(entry.updatedAt)}` : ''}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </Layout>
  )
}

function RestoreButton({ loading, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="flex items-center gap-1 rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 transition hover:bg-green-100 disabled:opacity-50"
    >
      {loading ? (
        <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      ) : (
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
        </svg>
      )}
      Restore
    </button>
  )
}

function InfoRow({ label, value }) {
  return (
    <div>
      <span className="text-gray-400">{label}: </span>
      <span className="text-gray-700">{value}</span>
    </div>
  )
}
