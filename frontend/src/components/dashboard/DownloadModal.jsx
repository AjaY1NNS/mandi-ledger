import { useState, useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import Modal from '../common/Modal'
import { formatVehicleNumbers } from '../../utils/helpers'
import { toLocalDateStr, toYMD } from '../../utils/dateFormate'

// ── Quick preset ranges ───────────────────────────────────────────────────────
const PRESETS = [
  { label: 'Last 24h',    days: 1   },
  { label: 'Last Week',   days: 7   },
  { label: 'Last Month',  days: 30  },
  { label: 'Last 3 Mon',  days: 90  },
  { label: 'Last 6 Mon',  days: 180 },
  { label: 'Last Year',   days: 365 },
]

function presetRange(days) {
  const end   = new Date()
  const start = new Date()
  start.setDate(start.getDate() - (days - 1))
  return { from: toLocalDateStr(start), to: toLocalDateStr(end) }
}

// ── CSV helpers ───────────────────────────────────────────────────────────────
const CSV_HEADERS = [
  'Date', 'Bill Number', 'Vehicle Count', 'Vehicle Numbers',
  'Buyer', 'Seller', 'Commodity', 'Rate (₹)', 'Weight (QNTL)',
  'Brokerage Type', 'Brokerage Value', 'Comment',
  'Status', 'Approved By', 'Approved At (IST)',
  'Created By', 'Created At (IST)',
]

function toIST(isoStr) {
  if (!isoStr) return ''
  try {
    return new Date(isoStr).toLocaleString('en-IN', {
      timeZone:  'Asia/Kolkata',
      day:       '2-digit',
      month:     'short',
      year:      'numeric',
      hour:      '2-digit',
      minute:    '2-digit',
      hour12:    true,
    })
  } catch {
    return isoStr
  }
}

function entryToRow(e) {
  return [
    toYMD(e.date),
    e.billNumber      ?? '',
    e.vehicleCount    ?? '',
    formatVehicleNumbers(e.vehicleNumber),
    e.buyer           ?? '',
    e.seller          ?? '',
    e.commodity       ?? '',
    e.rate            ?? '',
    e.weight          ?? '',
    e.brokerageType   ?? '',
    e.brokerageValue  ?? '',
    e.comment         ?? '',
    String(e.isApproved) === 'true' ? 'Approved' : 'Pending',
    e.approvedBy      ?? '',
    toIST(e.approvedAt),
    e.createdBy       ?? '',
    toIST(e.createdAt),
  ]
}

function buildCSV(rows) {
  return [CSV_HEADERS, ...rows]
    .map(row =>
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    )
    .join('\r\n')
}

function triggerDownload(csvStr, filename) {
  const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function DownloadModal({ isOpen, onClose }) {
  const { entries, commodities } = useApp()

  const [from,     setFrom]     = useState('')
  const [to,       setTo]       = useState('')
  const [commodity, setCommodity] = useState('')
  const [buyer,    setBuyer]    = useState('')
  const [seller,   setSeller]   = useState('')
  const [approved, setApproved] = useState('')   // '' | 'true' | 'false'

  // Unique buyer / seller names derived from actual entry data
  const uniqueBuyers  = useMemo(() =>
    [...new Set(entries.map(e => e.buyer).filter(Boolean))].sort(), [entries])
  const uniqueSellers = useMemo(() =>
    [...new Set(entries.map(e => e.seller).filter(Boolean))].sort(), [entries])

  const handlePreset = (preset) => {
    const { from: f, to: t } = presetRange(preset.days)
    setFrom(f)
    setTo(t)
  }

  const _entries = entries.filter(e => !e.isDeleted) // Exclude deleted entries from download

  const filtered = useMemo(() => {
  return entries.filter(e => {
    if (e.isDeleted)                                     return false
    const dateYMD = toYMD(e.date)
    if (from      && dateYMD < from)                    return false
    if (to        && dateYMD > to)                      return false
    if (commodity && e.commodity !== commodity)         return false
    if (buyer     && e.buyer     !== buyer)             return false
    if (seller    && e.seller    !== seller)            return false
    if (approved  && String(e.isApproved) !== approved) return false
    return true
  })
}, [entries, from, to, commodity, buyer, seller, approved])

  const hasFilters = from || to || commodity || buyer || seller || approved

  const handleDownload = () => {
    const csv      = buildCSV(filtered.map(entryToRow))
    const fromPart = from || 'all'
    const toPart   = to   || 'all'
    triggerDownload(csv, `MandiLedger-${fromPart}-to-${toPart}.csv`)
  }

  const reset = () => {
    setFrom(''); setTo(''); setCommodity(''); setBuyer(''); setSeller(''); setApproved('')
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Download Entries as CSV" size="xl">
      <div className="space-y-5">

        {/* ── Quick presets ──────────────────────────────────────── */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Quick Date Range
          </p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map(p => {
              const { from: pf, to: pt } = presetRange(p.days)
              const active = from === pf && to === pt
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handlePreset(p)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                    active
                      ? 'border-primary-400 bg-primary-50 text-primary-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700'
                  }`}
                >
                  {p.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Custom date range ──────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">From Date</label>
            <input
              type="date"
              value={from}
              onChange={e => setFrom(e.target.value)}
              className={inputCls}
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">To Date</label>
            <input
              type="date"
              value={to}
              max={toLocalDateStr(new Date())}
              onChange={e => setTo(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        {/* ── Entity + status filters ────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Commodity</label>
            <select value={commodity} onChange={e => setCommodity(e.target.value)} className={inputCls}>
              <option value="">All commodities</option>
              {commodities.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select value={approved} onChange={e => setApproved(e.target.value)} className={inputCls}>
              <option value="">All statuses</option>
              <option value="true">Approved</option>
              <option value="false">Pending</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Buyer</label>
            <select value={buyer} onChange={e => setBuyer(e.target.value)} className={inputCls}>
              <option value="">All buyers</option>
              {uniqueBuyers.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Seller</label>
            <select value={seller} onChange={e => setSeller(e.target.value)} className={inputCls}>
              <option value="">All sellers</option>
              {uniqueSellers.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Results summary + actions ──────────────────────────── */}
        <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-gray-800">
              {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'} match
            </p>
            {!hasFilters && (
              <p className="text-xs text-gray-400 mt-0.5">
                No filters applied — all {_entries.length} entries will be included
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasFilters && (
              <button
                type="button"
                onClick={reset}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-100"
              >
                Reset
              </button>
            )}
            <button
              type="button"
              onClick={handleDownload}
              disabled={filtered.length === 0}
              className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Download CSV
            </button>
          </div>
        </div>

      </div>
    </Modal>
  )
}

const inputCls =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm transition focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100'
