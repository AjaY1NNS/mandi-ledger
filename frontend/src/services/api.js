import axios from 'axios'
import { getIdToken } from './firebase'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

/**
 * Google Apps Script CORS + Redirect constraints
 * ─────────────────────────────────────────────────────────────────────────────
 * GAS Web Apps redirect every request:
 *   script.google.com  →302→  script.googleusercontent.com
 *
 * GET redirects work fine under CORS — the browser follows them and the final
 * response carries Access-Control-Allow-Origin: *.
 *
 * POST redirects break: browsers change POST→GET on a 302, losing the body,
 * so GAS never receives the payload.
 *
 * Solution: use GET for EVERY operation.
 * Mutation payloads are JSON-stringified into a single `data` query param.
 * GAS reads them via JSON.parse(e.parameter.data).
 */

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
})

// ── Core request helper ───────────────────────────────────────────────────────

async function gasGet(params = {}) {
  const token = await getIdToken()
  const response = await axiosInstance.get('', {
    params: { ...params, token },
  })
  return unwrap(response.data)
}

function unwrap(payload) {
  if (!payload) throw new Error('Empty response from server.')
  if (payload.status === 'error') throw new Error(payload.message || 'Server error')
  return payload
}

// ── Entries ───────────────────────────────────────────────────────────────────

export const fetchEntries  = ()          => gasGet({ action: 'list' })
export const addEntry      = (data)      => gasGet({ action: 'add',     data: JSON.stringify(data) })
export const updateEntry   = (data)      => gasGet({ action: 'update',  data: JSON.stringify(data) })
export const deleteEntry   = (id)        => gasGet({ action: 'delete',  data: JSON.stringify({ id }) })
export const approveEntry  = (id)        => gasGet({ action: 'approve', data: JSON.stringify({ id }) })

// ── Users ─────────────────────────────────────────────────────────────────────

export const fetchUserRole = (email)     => gasGet({ action: 'getUser', email })

// ── Buyers ────────────────────────────────────────────────────────────────────

export const fetchBuyers   = ()          => gasGet({ action: 'listBuyers' })
export const addBuyer      = (data)      => gasGet({ action: 'addBuyer',    data: JSON.stringify(data) })
export const updateBuyer   = (data)      => gasGet({ action: 'updateBuyer', data: JSON.stringify(data) })
export const deleteBuyer   = (id)        => gasGet({ action: 'deleteBuyer', data: JSON.stringify({ id }) })

// ── Sellers ───────────────────────────────────────────────────────────────────

export const fetchSellers  = ()          => gasGet({ action: 'listSellers' })
export const addSeller     = (data)      => gasGet({ action: 'addSeller',    data: JSON.stringify(data) })
export const updateSeller  = (data)      => gasGet({ action: 'updateSeller', data: JSON.stringify(data) })
export const deleteSeller  = (id)        => gasGet({ action: 'deleteSeller', data: JSON.stringify({ id }) })

// ── Commodities ───────────────────────────────────────────────────────────────

export const fetchCommodities  = ()      => gasGet({ action: 'listCommodities' })
export const addCommodity      = (data)  => gasGet({ action: 'addCommodity',    data: JSON.stringify(data) })
export const updateCommodity   = (data)  => gasGet({ action: 'updateCommodity', data: JSON.stringify(data) })
export const deleteCommodity   = (id)    => gasGet({ action: 'deleteCommodity', data: JSON.stringify({ id }) })

export default axiosInstance
