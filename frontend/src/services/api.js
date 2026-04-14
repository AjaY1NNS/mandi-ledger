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

// ── API methods ───────────────────────────────────────────────────────────────

/** Fetch all ledger entries */
export const fetchEntries = () =>
  gasGet({ action: 'list' })

/** Fetch user role from the Users sheet */
export const fetchUserRole = (email) =>
  gasGet({ action: 'getUser', email })

/** Add a new ledger entry — payload goes as JSON string in `data` param */
export const addEntry = (entryData) =>
  gasGet({ action: 'add', data: JSON.stringify(entryData) })

/** Update an existing entry */
export const updateEntry = (entryData) =>
  gasGet({ action: 'update', data: JSON.stringify(entryData) })

/** Delete an entry (admin only) */
export const deleteEntry = (id) =>
  gasGet({ action: 'delete', data: JSON.stringify({ id }) })

export default axiosInstance
