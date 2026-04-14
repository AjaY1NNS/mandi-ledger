import { useCallback } from 'react'
import toast from 'react-hot-toast'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import {
  fetchEntries as apiFetchEntries,
  addEntry     as apiAddEntry,
  updateEntry  as apiUpdateEntry,
  deleteEntry  as apiDeleteEntry,
} from '../services/api'
import { generateId, nowIso } from '../utils/helpers'

/**
 * Encapsulates all CRUD operations for ledger entries,
 * wiring API calls to AppContext state updates and toast notifications.
 */
export function useEntries() {
  const {
    setEntries,
    addEntry:    ctxAdd,
    updateEntry: ctxUpdate,
    deleteEntry: ctxDelete,
    setLoading,
    setError,
    closeAddModal,
    closeEditModal,
  } = useApp()

  const { user, isAdmin } = useAuth()

  // ── Load all entries ────────────────────────────────────────────────────────
  const loadEntries = useCallback(async () => {
    setLoading(true)
    try {
      const result = await apiFetchEntries()
      setEntries(result?.data ?? [])
    } catch (err) {
      setError(err.message)
      toast.error(`Failed to load entries: ${err.message}`)
    }
  }, [setEntries, setLoading, setError])

  // ── Add entry ───────────────────────────────────────────────────────────────
  const addEntry = useCallback(
    async (formData) => {
      const toastId = toast.loading('Adding entry…')
      try {
        const payload = {
          ...formData,
          id:        generateId(),
          createdBy: user?.email ?? 'unknown',
          createdAt: nowIso(),
          updatedAt: nowIso(),
        }
        const result = await apiAddEntry(payload)
        ctxAdd(result?.data ?? payload)
        toast.success('Entry added successfully!', { id: toastId })
        closeAddModal()
        return true
      } catch (err) {
        toast.error(`Failed to add entry: ${err.message}`, { id: toastId })
        return false
      }
    },
    [user, ctxAdd, closeAddModal]
  )

  // ── Update entry ────────────────────────────────────────────────────────────
  const updateEntry = useCallback(
    async (formData) => {
      const toastId = toast.loading('Updating entry…')
      try {
        const payload = {
          ...formData,
          updatedAt: nowIso(),
          updatedBy: user?.email ?? 'unknown',
        }
        const result = await apiUpdateEntry(payload)
        ctxUpdate(result?.data ?? payload)
        toast.success('Entry updated successfully!', { id: toastId })
        closeEditModal()
        return true
      } catch (err) {
        toast.error(`Failed to update entry: ${err.message}`, { id: toastId })
        return false
      }
    },
    [user, ctxUpdate, closeEditModal]
  )

  // ── Delete entry (admin only) ───────────────────────────────────────────────
  const deleteEntry = useCallback(
    async (id) => {
      if (!isAdmin) {
        toast.error('Only admins can delete entries.')
        return false
      }
      const toastId = toast.loading('Deleting entry…')
      try {
        await apiDeleteEntry(id)
        ctxDelete(id)
        toast.success('Entry deleted.', { id: toastId })
        return true
      } catch (err) {
        toast.error(`Failed to delete: ${err.message}`, { id: toastId })
        return false
      }
    },
    [isAdmin, ctxDelete]
  )

  return { loadEntries, addEntry, updateEntry, deleteEntry }
}
