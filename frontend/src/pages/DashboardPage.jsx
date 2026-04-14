import { useEffect, useState } from 'react'
import Layout from '../components/layout/Layout'
import StatsBar from '../components/dashboard/StatsBar'
import SearchFilter from '../components/dashboard/SearchFilter'
import DataTable from '../components/dashboard/DataTable'
import DataCard from '../components/dashboard/DataCard'
import Pagination from '../components/dashboard/Pagination'
import Modal from '../components/common/Modal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import DownloadModal from '../components/dashboard/DownloadModal'
import EntryForm from '../components/forms/EntryForm'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { useEntries } from '../hooks/useEntries'
import { useFilteredEntries } from '../hooks/useFilteredEntries'
import { useConfirm } from '../hooks/useConfirm'
import { useManage } from '../hooks/useManage'

export default function DashboardPage() {
  const { isLoading, error, showAddModal, showEditModal, editingEntry, openAddModal, closeAddModal, openEditModal, closeEditModal } = useApp()
  const { roleLoading } = useAuth()
  const { loadEntries, addEntry, updateEntry, deleteEntry, approveEntry } = useEntries()
  const { data: entries, totalCount, totalPages } = useFilteredEntries()
  const { confirmState, requestConfirm, handleConfirm, handleCancel } = useConfirm()
  const { loadMasterData } = useManage()

  // View mode: 'table' on desktop, 'cards' on mobile
  const [viewMode,      setViewMode]      = useState(() => window.innerWidth < 768 ? 'cards' : 'table')
  const [showDownload,  setShowDownload]  = useState(false)

  // Load entries + master data on mount (parallel)
  useEffect(() => {
    loadEntries()
    loadMasterData()
  }, [loadEntries, loadMasterData])

  // Responsive: auto-switch view at 768 px
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const handler = (e) => setViewMode(e.matches ? 'table' : 'cards')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const handleEditClick = (entry) => openEditModal(entry)

  const handleDeleteClick = (entry) => {
    requestConfirm({
      title:     'Delete Entry',
      message:   `Delete entry for vehicle ${entry.vehicleNumber} (Bill: ${entry.billNumber})? This cannot be undone.`,
      onConfirm: () => deleteEntry(entry.id),
    })
  }

  const handleApproveClick = (entry) => {
    requestConfirm({
      title:     'Approve Entry',
      message:   `Approve Bill ${entry.billNumber}? Once approved, nobody — including admins — can edit or delete it.`,
      onConfirm: () => approveEntry(entry),
    })
  }

  if (roleLoading) return <LoadingSpinner message="Verifying access…" />

  return (
    <Layout onAddEntry={openAddModal}>
      <div className="space-y-5">
        {/* Page heading */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">MandiLedger Dashboard</h2>
            <p className="mt-0.5 text-sm text-gray-500">
              Manage and track all mandi transactions
            </p>
          </div>
          <div className="flex items-center gap-2">
          {/* Download CSV button */}
          <button
            onClick={() => setShowDownload(true)}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 shadow-sm transition hover:bg-gray-50 hover:text-primary-700"
            title="Download CSV"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* View toggle (desktop only) */}
          <div className="hidden md:flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
            <ViewToggleBtn active={viewMode === 'table'} onClick={() => setViewMode('table')} label="Table">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-1.5 0H3.375" />
              </svg>
            </ViewToggleBtn>
            <ViewToggleBtn active={viewMode === 'cards'} onClick={() => setViewMode('cards')} label="Cards">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
            </ViewToggleBtn>
          </div>
          </div>
        </div>

        {/* Stats */}
        <StatsBar />

        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <span>{error}</span>
            <button
              onClick={loadEntries}
              className="ml-auto text-xs underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Search + Filter bar */}
        <SearchFilter totalCount={totalCount} />

        {/* Data */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-primary-600" />
              <p className="text-sm text-gray-400">Loading entries…</p>
            </div>
          </div>
        ) : viewMode === 'table' ? (
          <DataTable
            entries={entries}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            onApprove={handleApproveClick}
          />
        ) : (
          <DataCard
            entries={entries}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            onApprove={handleApproveClick}
          />
        )}

        {/* Pagination */}
        {!isLoading && (
          <Pagination totalPages={totalPages} totalCount={totalCount} />
        )}
      </div>

      {/* ── Add Entry Modal ─────────────────────────────────────────── */}
      <Modal
        isOpen={showAddModal}
        onClose={closeAddModal}
        title="Add New Entry"
        size="2xl"
      >
        <EntryForm
          onSubmit={addEntry}
          onCancel={closeAddModal}
          isEdit={false}
        />
      </Modal>

      {/* ── Edit Entry Modal ────────────────────────────────────────── */}
      <Modal
        isOpen={showEditModal}
        onClose={closeEditModal}
        title="Edit Entry"
        size="2xl"
      >
        <EntryForm
          initialData={editingEntry}
          onSubmit={updateEntry}
          onCancel={closeEditModal}
          isEdit
        />
      </Modal>

      {/* ── Download CSV Modal ─────────────────────────────────────── */}
      <DownloadModal
        isOpen={showDownload}
        onClose={() => setShowDownload(false)}
      />

      {/* ── Confirm Dialog (Delete / Approve) ──────────────────────── */}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        confirmText={confirmState.title?.startsWith('Approve') ? 'Approve' : 'Delete'}
        danger={!confirmState.title?.startsWith('Approve')}
      />
    </Layout>
  )
}

function ViewToggleBtn({ active, onClick, label, children }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
        active
          ? 'bg-primary-600 text-white shadow-sm'
          : 'text-gray-500 hover:bg-gray-100'
      }`}
    >
      {children}
      <span className="hidden lg:inline">{label}</span>
    </button>
  )
}
