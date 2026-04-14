/**
 * MandiLedger – Google Apps Script Backend
 * ==========================================
 * Spreadsheet tabs required:
 *   1. "Entries"     – id | date | vehicleCount | vehicleNumber | billNumber |
 *                      buyer | seller | commodity | rate | weight | comment |
 *                      createdBy | createdAt | updatedAt | updatedBy
 *   2. "Users"       – email | role
 *   3. "Buyers"      – id | firstName | lastName | firmName | address |
 *                      contactNos | emails | isDeleted |
 *                      createdBy | createdAt | updatedAt | updatedBy
 *   4. "Sellers"     – (same columns as Buyers)
 *   5. "Commodities" – id | name | isDeleted | createdBy | createdAt | updatedAt | updatedBy
 *
 * Deploy: Web App → Execute as Me → Access: Anyone
 */

// ── CONFIG ────────────────────────────────────────────────────────────────────
// TODO: fill in your actual values before deploying
const SPREADSHEET_ID   = ''
const FIREBASE_PROJECT = ''

const ENTRIES_SHEET     = 'Entries'
const USERS_SHEET       = 'Users'
const BUYERS_SHEET      = 'Buyers'
const SELLERS_SHEET     = 'Sellers'
const COMMODITIES_SHEET = 'Commodities'

const ENTRY_COLS = [
  'id', 'date', 'vehicleCount', 'vehicleNumber', 'billNumber',
  'buyer', 'seller', 'commodity', 'rate', 'weight', 'comment',
  'createdBy', 'createdAt', 'updatedAt', 'updatedBy',
]

// Shared schema for Buyers and Sellers
const PARTY_COLS = [
  'id', 'firstName', 'lastName', 'firmName', 'address',
  'contactNos', 'emails', 'isDeleted',
  'createdBy', 'createdAt', 'updatedAt', 'updatedBy',
]

const COMMODITY_COLS = [
  'id', 'name', 'isDeleted',
  'createdBy', 'createdAt', 'updatedAt', 'updatedBy',
]

// ── ENTRY POINTS ──────────────────────────────────────────────────────────────

function doGet(e)  { return handleRequest(e) }
function doPost(e) { return handleRequest(e) }

function handleRequest(e) {
  try {
    const token = extractToken(e)
    if (!token) return jsonError('Unauthorized: missing token', 401)

    const claims = verifyFirebaseToken(token)
    if (!claims)  return jsonError('Unauthorized: invalid token', 401)

    const callerEmail = claims.email
    const action      = e.parameter?.action || null

    switch (action) {
      // ── Entries ──────────────────────────────────────────────────────────
      case 'list':            return handleList(callerEmail)
      case 'add':             return handleAdd(e, callerEmail)
      case 'update':          return handleUpdate(e, callerEmail)
      case 'delete':          return handleDelete(e, callerEmail)

      // ── Users ─────────────────────────────────────────────────────────────
      case 'getUser':         return handleGetUser(e.parameter?.email || callerEmail)

      // ── Buyers ────────────────────────────────────────────────────────────
      case 'listBuyers':      return handleListParties(BUYERS_SHEET)
      case 'addBuyer':        return handleAddParty(e, callerEmail, BUYERS_SHEET)
      case 'updateBuyer':     return handleUpdateParty(e, callerEmail, BUYERS_SHEET)
      case 'deleteBuyer':     return handleSoftDeleteParty(e, callerEmail, BUYERS_SHEET)

      // ── Sellers ───────────────────────────────────────────────────────────
      case 'listSellers':     return handleListParties(SELLERS_SHEET)
      case 'addSeller':       return handleAddParty(e, callerEmail, SELLERS_SHEET)
      case 'updateSeller':    return handleUpdateParty(e, callerEmail, SELLERS_SHEET)
      case 'deleteSeller':    return handleSoftDeleteParty(e, callerEmail, SELLERS_SHEET)

      // ── Commodities ───────────────────────────────────────────────────────
      case 'listCommodities': return handleListCommodities()
      case 'addCommodity':    return handleAddCommodity(e, callerEmail)
      case 'updateCommodity': return handleUpdateCommodity(e, callerEmail)
      case 'deleteCommodity': return handleSoftDeleteCommodity(e, callerEmail)

      default: return jsonError('Unknown action: ' + action, 400)
    }
  } catch (err) {
    console.error('handleRequest error:', err)
    return jsonError('Internal server error: ' + err.message, 500)
  }
}

// ── ENTRY HANDLERS ────────────────────────────────────────────────────────────

function handleList() {
  const sheet = getSheet(ENTRIES_SHEET)
  return jsonOk(sheetToObjects(sheet))
}

function handleAdd(e, callerEmail) {
  const body = parseBody(e)
  validateRequired(body, ['id','date','vehicleNumber','billNumber','buyer','seller','commodity','rate','weight'])
  const sheet = getSheet(ENTRIES_SHEET)
  sheet.appendRow(ENTRY_COLS.map(col => body[col] ?? ''))
  return jsonOk(body, 'Entry added successfully.')
}

function handleUpdate(e, callerEmail) {
  const body = parseBody(e)
  if (!body.id) return jsonError('Missing entry id', 400)

  if (getUserRole(callerEmail) !== 'admin') {
    const existing = findObjectById(ENTRIES_SHEET, body.id)
    if (!existing) return jsonError('Entry not found', 404)
    if (String(existing.createdBy).toLowerCase() !== callerEmail.toLowerCase())
      return jsonError('Forbidden: you can only edit your own entries', 403)
  }

  const sheet = getSheet(ENTRIES_SHEET)
  const { rowIndex } = findRowById(sheet, body.id)
  if (rowIndex === -1) return jsonError('Entry not found', 404)

  sheet.getRange(rowIndex, 1, 1, ENTRY_COLS.length)
       .setValues([ENTRY_COLS.map(col => body[col] ?? '')])
  return jsonOk(body, 'Entry updated successfully.')
}

function handleDelete(e, callerEmail) {
  requireAdmin(callerEmail)
  const body = parseBody(e)
  if (!body.id) return jsonError('Missing entry id', 400)

  const sheet = getSheet(ENTRIES_SHEET)
  const { rowIndex } = findRowById(sheet, body.id)
  if (rowIndex === -1) return jsonError('Entry not found', 404)

  sheet.deleteRow(rowIndex)
  return jsonOk({ id: body.id }, 'Entry deleted.')
}

// ── USER HANDLER ──────────────────────────────────────────────────────────────

function handleGetUser(email) {
  const sheet  = getSheet(USERS_SHEET)
  const rows   = sheet.getDataRange().getValues()
  const header = rows[0].map(h => String(h).trim().toLowerCase())
  const eIdx   = header.indexOf('email')
  const rIdx   = header.indexOf('role')

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][eIdx]).trim().toLowerCase() === email.trim().toLowerCase()) {
      return jsonOk({ email: rows[i][eIdx], role: rows[i][rIdx] || 'staff' })
    }
  }
  return jsonOk({ email, role: 'staff' })
}

// ── PARTY (BUYER / SELLER) HANDLERS ──────────────────────────────────────────

function handleListParties(sheetName) {
  const sheet = getSheet(sheetName)
  if (!sheet) return jsonOk([])
  const all = sheetToObjects(sheet)
  // Exclude soft-deleted; deserialise multi-value fields
  return jsonOk(all.filter(r => r.isDeleted !== 'true').map(deserialiseParty))
}

function handleAddParty(e, callerEmail, sheetName) {
  requireAdmin(callerEmail)
  const body = parseBody(e)
  validateRequired(body, ['id', 'firstName', 'lastName', 'address'])

  const sheet = getSheet(sheetName)
  const now   = new Date().toISOString()

  sheet.appendRow(PARTY_COLS.map(col => {
    if (col === 'isDeleted') return 'false'
    if (col === 'createdBy' || col === 'updatedBy') return callerEmail
    if (col === 'createdAt' || col === 'updatedAt') return now
    // contactNos / emails arrive as arrays from frontend; store as pipe-separated
    if ((col === 'contactNos' || col === 'emails') && Array.isArray(body[col]))
      return body[col].filter(Boolean).join('|')
    return body[col] ?? ''
  }))
  return jsonOk(body, 'Added successfully.')
}

function handleUpdateParty(e, callerEmail, sheetName) {
  requireAdmin(callerEmail)
  const body = parseBody(e)
  if (!body.id) return jsonError('Missing id', 400)

  const sheet    = getSheet(sheetName)
  const { rowIndex } = findRowById(sheet, body.id)
  if (rowIndex === -1) return jsonError('Record not found', 404)

  const existing = findObjectById(sheetName, body.id)
  const now      = new Date().toISOString()

  sheet.getRange(rowIndex, 1, 1, PARTY_COLS.length).setValues([
    PARTY_COLS.map(col => {
      if (col === 'updatedAt') return now
      if (col === 'updatedBy') return callerEmail
      if (col === 'createdAt') return existing?.createdAt || now
      if (col === 'createdBy') return existing?.createdBy || callerEmail
      if (col === 'isDeleted') return existing?.isDeleted || 'false'
      if ((col === 'contactNos' || col === 'emails') && Array.isArray(body[col]))
        return body[col].filter(Boolean).join('|')
      return body[col] ?? existing?.[col] ?? ''
    })
  ])
  return jsonOk(body, 'Updated successfully.')
}

function handleSoftDeleteParty(e, callerEmail, sheetName) {
  requireAdmin(callerEmail)
  return softDelete(e, callerEmail, sheetName, PARTY_COLS)
}

// ── COMMODITY HANDLERS ────────────────────────────────────────────────────────

function handleListCommodities() {
  const sheet = getSheet(COMMODITIES_SHEET)
  if (!sheet) return jsonOk([])
  return jsonOk(sheetToObjects(sheet).filter(r => r.isDeleted !== 'true'))
}

function handleAddCommodity(e, callerEmail) {
  requireAdmin(callerEmail)
  const body = parseBody(e)
  validateRequired(body, ['id', 'name'])

  const sheet = getSheet(COMMODITIES_SHEET)
  const now   = new Date().toISOString()

  sheet.appendRow(COMMODITY_COLS.map(col => {
    if (col === 'isDeleted') return 'false'
    if (col === 'createdBy' || col === 'updatedBy') return callerEmail
    if (col === 'createdAt' || col === 'updatedAt') return now
    return body[col] ?? ''
  }))
  return jsonOk(body, 'Commodity added.')
}

function handleUpdateCommodity(e, callerEmail) {
  requireAdmin(callerEmail)
  const body = parseBody(e)
  if (!body.id) return jsonError('Missing id', 400)

  const sheet    = getSheet(COMMODITIES_SHEET)
  const { rowIndex } = findRowById(sheet, body.id)
  if (rowIndex === -1) return jsonError('Commodity not found', 404)

  const existing = findObjectById(COMMODITIES_SHEET, body.id)
  const now      = new Date().toISOString()

  sheet.getRange(rowIndex, 1, 1, COMMODITY_COLS.length).setValues([
    COMMODITY_COLS.map(col => {
      if (col === 'updatedAt') return now
      if (col === 'updatedBy') return callerEmail
      if (col === 'createdAt') return existing?.createdAt || now
      if (col === 'createdBy') return existing?.createdBy || callerEmail
      if (col === 'isDeleted') return existing?.isDeleted || 'false'
      return body[col] ?? existing?.[col] ?? ''
    })
  ])
  return jsonOk(body, 'Commodity updated.')
}

function handleSoftDeleteCommodity(e, callerEmail) {
  requireAdmin(callerEmail)
  return softDelete(e, callerEmail, COMMODITIES_SHEET, COMMODITY_COLS)
}

// ── GENERIC HELPERS ───────────────────────────────────────────────────────────

function softDelete(e, callerEmail, sheetName, cols) {
  const body = parseBody(e)
  if (!body.id) return jsonError('Missing id', 400)

  const sheet = getSheet(sheetName)
  const { rowIndex } = findRowById(sheet, body.id)
  if (rowIndex === -1) return jsonError('Record not found', 404)

  const isDeletedIdx = cols.indexOf('isDeleted') + 1   // 1-based
  const updatedAtIdx = cols.indexOf('updatedAt') + 1
  const updatedByIdx = cols.indexOf('updatedBy') + 1
  const now = new Date().toISOString()

  sheet.getRange(rowIndex, isDeletedIdx).setValue('true')
  if (updatedAtIdx > 0) sheet.getRange(rowIndex, updatedAtIdx).setValue(now)
  if (updatedByIdx > 0) sheet.getRange(rowIndex, updatedByIdx).setValue(callerEmail)

  return jsonOk({ id: body.id }, 'Deleted successfully.')
}

function getSheet(name) {
  return SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(name)
}

function sheetToObjects(sheet) {
  const values = sheet.getDataRange().getValues()
  if (values.length < 2) return []
  const header = values[0].map(h => String(h).trim())
  return values.slice(1).map(row => {
    const obj = {}
    header.forEach((h, i) => { obj[h] = row[i] })
    return obj
  })
}

function findRowById(sheet, id) {
  const values = sheet.getDataRange().getValues()
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(id)) return { rowIndex: i + 1, row: values[i] }
  }
  return { rowIndex: -1, row: null }
}

function findObjectById(sheetName, id) {
  return sheetToObjects(getSheet(sheetName))
         .find(o => String(o.id) === String(id)) || null
}

function getUserRole(email) {
  const sheet  = getSheet(USERS_SHEET)
  const rows   = sheet.getDataRange().getValues()
  const header = rows[0].map(h => String(h).trim().toLowerCase())
  const eIdx   = header.indexOf('email')
  const rIdx   = header.indexOf('role')
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][eIdx]).toLowerCase() === email.toLowerCase())
      return String(rows[i][rIdx]).toLowerCase() || 'staff'
  }
  return 'staff'
}

function requireAdmin(callerEmail) {
  if (getUserRole(callerEmail) !== 'admin')
    throw new Error('Forbidden: admin access required')
}

/** Deserialise pipe-separated fields back to arrays for the frontend */
function deserialiseParty(obj) {
  return {
    ...obj,
    contactNos: obj.contactNos ? String(obj.contactNos).split('|').filter(Boolean) : [],
    emails:     obj.emails     ? String(obj.emails).split('|').filter(Boolean)     : [],
  }
}

function parseBody(e) {
  if (e.parameter?.data) {
    try { return JSON.parse(e.parameter.data) } catch {}
  }
  if (e.postData?.contents) {
    try { return JSON.parse(e.postData.contents) } catch {}
  }
  return e.parameter || {}
}

function validateRequired(obj, fields) {
  fields.forEach(f => {
    if (obj[f] === undefined || obj[f] === null || String(obj[f]).trim() === '')
      throw new Error(`Missing required field: ${f}`)
  })
}

function extractToken(e) {
  if (e.parameter?.token) return e.parameter.token
  try { return JSON.parse(e.postData?.contents || '{}').token || null } catch { return null }
}

function verifyFirebaseToken(token) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const payload = JSON.parse(
      Utilities.newBlob(Utilities.base64DecodeWebSafe(parts[1])).getDataAsString()
    )
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp < now) return null
    if (payload.aud !== FIREBASE_PROJECT) return null
    if (!payload.iss.includes('securetoken.google.com')) return null
    return payload
  } catch { return null }
}

// ── RESPONSE BUILDERS ─────────────────────────────────────────────────────────

function jsonOk(data, message = 'OK') {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message, data }))
    .setMimeType(ContentService.MimeType.JSON)
}

function jsonError(message, code = 400) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'error', message, code }))
    .setMimeType(ContentService.MimeType.JSON)
}
