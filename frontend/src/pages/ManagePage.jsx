import { useState, useEffect } from 'react'
import Layout from '../components/layout/Layout'
import Modal from '../components/common/Modal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import ManageList from '../components/manage/ManageList'
import BuyerSellerForm from '../components/manage/BuyerSellerForm'
import CommodityForm from '../components/manage/CommodityForm'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { useManage } from '../hooks/useManage'
import { useConfirm } from '../hooks/useConfirm'

const TABS = [
  { key: 'buyers',      label: 'Buyers',      icon: '👤' },
  { key: 'sellers',     label: 'Sellers',     icon: '🏭' },
  { key: 'commodities', label: 'Commodities', icon: '🌾' },
]

export default function ManagePage() {
  const { user } = useAuth()
  const { buyers, sellers, commodities, masterLoading, openAddModal } = useApp()
  const { loadMasterData, buyer, seller, commodity } = useManage()
  const { confirmState, requestConfirm, handleConfirm, handleCancel } = useConfirm()

  const [activeTab,  setActiveTab]  = useState('buyers')
  const [modal,      setModal]      = useState({ open: false, type: null, data: null })
  // type: 'addBuyer'|'editBuyer'|'addSeller'|'editSeller'|'addCommodity'|'editCommodity'

  useEffect(() => { loadMasterData() }, [loadMasterData])

  // ── Modal helpers ──────────────────────────────────────────────────────────
  const openModal  = (type, data = null) => setModal({ open: true, type, data })
  const closeModal = () => setModal({ open: false, type: null, data: null })

  // ── Submit handlers ────────────────────────────────────────────────────────
  const handleBuyerSubmit = async (data) => {
    const ok = modal.data
      ? await buyer.update(data, user.email)
      : await buyer.add(data, user.email)
    if (ok) closeModal()
    return ok
  }

  const handleSellerSubmit = async (data) => {
    const ok = modal.data
      ? await seller.update(data, user.email)
      : await seller.add(data, user.email)
    if (ok) closeModal()
    return ok
  }

  const handleCommoditySubmit = async (data) => {
    const ok = modal.data
      ? await commodity.update(data, user.email)
      : await commodity.add(data, user.email)
    if (ok) closeModal()
    return ok
  }

  // ── Delete confirmations ───────────────────────────────────────────────────
  const confirmDelete = (item, kind) => {
    const name = kind === 'commodity'
      ? item.name
      : `${item.firstName} ${item.lastName}${item.firmName ? ` (${item.firmName})` : ''}`

    requestConfirm({
      title:   `Delete ${kind.charAt(0).toUpperCase() + kind.slice(1)}`,
      message: `"${name}" will be soft-deleted and removed from all dropdowns. This can be reversed by the database admin.`,
      onConfirm: () => {
        if (kind === 'buyer')     buyer.softDelete(item.id)
        if (kind === 'seller')    seller.softDelete(item.id)
        if (kind === 'commodity') commodity.softDelete(item.id)
      },
    })
  }

  // ── Render helpers ─────────────────────────────────────────────────────────
  const renderParty = (item) => (
    <div>
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="font-semibold text-gray-900">
          {item.firmName}
        </span>
        {item.firstName && (
          <span className="text-sm text-gray-500">· {item.firstName} {item.lastName}</span>
        )}
      </div>
      <p className="mt-0.5 text-sm text-gray-500 line-clamp-1">{item.address}</p>
      <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-gray-400">
        {item.contactNos?.map((n, i) => (
          <a key={i} href={`tel:${n}`} className="flex items-center gap-1 hover:text-primary-600">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
            {n}
          </a>
        ))}
        {item.emails?.map((em, i) => (
          <a key={i} href={`mailto:${em}`} className="flex items-center gap-1 hover:text-primary-600">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            {em}
          </a>
        ))}
      </div>
    </div>
  )

  const renderCommodity = (item) => (
    <span className="font-medium text-gray-900">{item.name}</span>
  )

  // ── Modal config per type ──────────────────────────────────────────────────
  const modalConfig = {
    addBuyer:       { title: 'Add Buyer',       size: 'xl' },
    editBuyer:      { title: 'Edit Buyer',      size: 'xl' },
    addSeller:      { title: 'Add Seller',      size: 'xl' },
    editSeller:     { title: 'Edit Seller',     size: 'xl' },
    addCommodity:   { title: 'Add Commodity',   size: 'sm' },
    editCommodity:  { title: 'Edit Commodity',  size: 'sm' },
  }

  return (
    <Layout onAddEntry={openAddModal}>
      <div className="space-y-6">
        {/* Page heading */}
        <div>
          <h2 className="text-xl font-bold text-gray-900">Master Data Management</h2>
          <p className="mt-0.5 text-sm text-gray-500">Manage buyers, sellers, and commodities (admin only)</p>
        </div>

        {/* Tab bar + Add button */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition ${
                  activeTab === tab.key
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
                <span className={`ml-1 rounded-full px-1.5 py-0.5 text-xs font-bold ${
                  activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {tab.key === 'buyers' ? buyers.length : tab.key === 'sellers' ? sellers.length : commodities.length}
                </span>
              </button>
            ))}
          </div>

          <button
            onClick={() => openModal(
              activeTab === 'buyers' ? 'addBuyer' :
              activeTab === 'sellers' ? 'addSeller' : 'addCommodity'
            )}
            className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add {activeTab === 'buyers' ? 'Buyer' : activeTab === 'sellers' ? 'Seller' : 'Commodity'}
          </button>
        </div>

        {/* List */}
        {activeTab === 'buyers' && (
          <ManageList
            items={buyers}
            isLoading={masterLoading}
            emptyTitle="No buyers yet"
            renderItem={renderParty}
            onEdit={item => openModal('editBuyer', item)}
            onDelete={item => confirmDelete(item, 'buyer')}
          />
        )}
        {activeTab === 'sellers' && (
          <ManageList
            items={sellers}
            isLoading={masterLoading}
            emptyTitle="No sellers yet"
            renderItem={renderParty}
            onEdit={item => openModal('editSeller', item)}
            onDelete={item => confirmDelete(item, 'seller')}
          />
        )}
        {activeTab === 'commodities' && (
          <ManageList
            items={commodities}
            isLoading={masterLoading}
            emptyTitle="No commodities yet"
            renderItem={renderCommodity}
            onEdit={item => openModal('editCommodity', item)}
            onDelete={item => confirmDelete(item, 'commodity')}
          />
        )}
      </div>

      {/* ── Modals ──────────────────────────────────────────────── */}
      <Modal
        isOpen={modal.open && (modal.type === 'addBuyer' || modal.type === 'editBuyer')}
        onClose={closeModal}
        title={modal.type === 'editBuyer' ? 'Edit Buyer' : 'Add Buyer'}
        size="xl"
      >
        <BuyerSellerForm
          type="buyer"
          initialData={modal.data}
          onSubmit={handleBuyerSubmit}
          onCancel={closeModal}
        />
      </Modal>

      <Modal
        isOpen={modal.open && (modal.type === 'addSeller' || modal.type === 'editSeller')}
        onClose={closeModal}
        title={modal.type === 'editSeller' ? 'Edit Seller' : 'Add Seller'}
        size="xl"
      >
        <BuyerSellerForm
          type="seller"
          initialData={modal.data}
          onSubmit={handleSellerSubmit}
          onCancel={closeModal}
        />
      </Modal>

      <Modal
        isOpen={modal.open && (modal.type === 'addCommodity' || modal.type === 'editCommodity')}
        onClose={closeModal}
        title={modal.type === 'editCommodity' ? 'Edit Commodity' : 'Add Commodity'}
        size="sm"
      >
        <CommodityForm
          initialData={modal.data}
          onSubmit={handleCommoditySubmit}
          onCancel={closeModal}
        />
      </Modal>

      {/* ── Confirm delete ───────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        confirmText="Delete"
        danger
      />
    </Layout>
  )
}
