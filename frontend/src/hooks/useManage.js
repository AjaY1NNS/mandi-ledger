import { useCallback } from 'react'
import toast from 'react-hot-toast'
import { useApp } from '../context/AppContext'
import {
  fetchBuyers,   addBuyer   as apiAddBuyer,   updateBuyer   as apiUpdateBuyer,   deleteBuyer   as apiDeleteBuyer,
  fetchSellers,  addSeller  as apiAddSeller,  updateSeller  as apiUpdateSeller,  deleteSeller  as apiDeleteSeller,
  fetchCommodities, addCommodity as apiAddCommodity, updateCommodity as apiUpdateCommodity, deleteCommodity as apiDeleteCommodity,
} from '../services/api'
import { generateId, nowIso } from '../utils/helpers'

/**
 * useManage – CRUD for buyers, sellers, and commodities (admin only).
 * All mutations hit the API then update AppContext in-place.
 */
export function useManage() {
  const {
    setMasterLoading,
    setBuyers,  addBuyer:  ctxAddBuyer,  updateBuyer:  ctxUpdateBuyer,  removeBuyer,
    setSellers, addSeller: ctxAddSeller, updateSeller: ctxUpdateSeller, removeSeller,
    setCommodities, addCommodity: ctxAddCommodity, updateCommodity: ctxUpdateCommodity, removeCommodity,
  } = useApp()

  // ── Load all master data ────────────────────────────────────────────────────
  const loadMasterData = useCallback(async () => {
    setMasterLoading(true)
    try {
      const [buyersRes, sellersRes, commoditiesRes] = await Promise.all([
        fetchBuyers(),
        fetchSellers(),
        fetchCommodities(),
      ])
      setBuyers(buyersRes?.data ?? [])
      setSellers(sellersRes?.data ?? [])
      setCommodities(commoditiesRes?.data ?? [])
    } catch (err) {
      toast.error(`Failed to load master data: ${err.message}`)
    } finally {
      setMasterLoading(false)
    }
  }, [setMasterLoading, setBuyers, setSellers, setCommodities])

  // ── Generic party factory (reused for buyer and seller) ────────────────────
  const makePartyHooks = (
    apiAdd, apiUpdate, apiDelete,
    ctxAdd, ctxUpdate, ctxRemove,
    label,
  ) => ({
    add: async (formData, userEmail) => {
      const toastId = toast.loading(`Adding ${label}…`)
      try {
        const payload = { ...formData, id: generateId(), createdBy: userEmail, createdAt: nowIso(), updatedAt: nowIso() }
        const res = await apiAdd(payload)
        ctxAdd(res?.data ?? payload)
        toast.success(`${label} added!`, { id: toastId })
        return true
      } catch (err) {
        toast.error(`Failed: ${err.message}`, { id: toastId })
        return false
      }
    },
    update: async (formData, userEmail) => {
      const toastId = toast.loading(`Updating ${label}…`)
      try {
        const payload = { ...formData, updatedAt: nowIso(), updatedBy: userEmail }
        const res = await apiUpdate(payload)
        ctxUpdate(res?.data ?? payload)
        toast.success(`${label} updated!`, { id: toastId })
        return true
      } catch (err) {
        toast.error(`Failed: ${err.message}`, { id: toastId })
        return false
      }
    },
    softDelete: async (id) => {
      const toastId = toast.loading(`Deleting ${label}…`)
      try {
        await apiDelete(id)
        ctxRemove(id)
        toast.success(`${label} deleted.`, { id: toastId })
        return true
      } catch (err) {
        toast.error(`Failed: ${err.message}`, { id: toastId })
        return false
      }
    },
  })

  const buyerOps     = makePartyHooks(apiAddBuyer,  apiUpdateBuyer,  apiDeleteBuyer,  ctxAddBuyer,  ctxUpdateBuyer,  removeBuyer,  'Buyer')
  const sellerOps    = makePartyHooks(apiAddSeller, apiUpdateSeller, apiDeleteSeller, ctxAddSeller, ctxUpdateSeller, removeSeller, 'Seller')

  // ── Commodity ops ───────────────────────────────────────────────────────────
  const addCommodityOp = useCallback(async (formData, userEmail) => {
    const toastId = toast.loading('Adding commodity…')
    try {
      const payload = { ...formData, id: generateId(), createdBy: userEmail, createdAt: nowIso(), updatedAt: nowIso() }
      const res = await apiAddCommodity(payload)
      ctxAddCommodity(res?.data ?? payload)
      toast.success('Commodity added!', { id: toastId })
      return true
    } catch (err) {
      toast.error(`Failed: ${err.message}`, { id: toastId })
      return false
    }
  }, [ctxAddCommodity])

  const updateCommodityOp = useCallback(async (formData, userEmail) => {
    const toastId = toast.loading('Updating commodity…')
    try {
      const payload = { ...formData, updatedAt: nowIso(), updatedBy: userEmail }
      const res = await apiUpdateCommodity(payload)
      ctxUpdateCommodity(res?.data ?? payload)
      toast.success('Commodity updated!', { id: toastId })
      return true
    } catch (err) {
      toast.error(`Failed: ${err.message}`, { id: toastId })
      return false
    }
  }, [ctxUpdateCommodity])

  const deleteCommodityOp = useCallback(async (id) => {
    const toastId = toast.loading('Deleting commodity…')
    try {
      await apiDeleteCommodity(id)
      removeCommodity(id)
      toast.success('Commodity deleted.', { id: toastId })
      return true
    } catch (err) {
      toast.error(`Failed: ${err.message}`, { id: toastId })
      return false
    }
  }, [removeCommodity])

  return {
    loadMasterData,
    buyer:     buyerOps,
    seller:    sellerOps,
    commodity: {
      add:        addCommodityOp,
      update:     updateCommodityOp,
      softDelete: deleteCommodityOp,
    },
  }
}
