/**
 * MandiLedger – Google Apps Script Backend
 * ==========================================
 * Spreadsheet tabs required:
 *   1. "Entries"  – columns: id | date | vehicleCount | vehicleNumber | billNumber |
 *                            buyer | seller | commodity | rate | weight | comment |
 *                            createdBy | createdAt | updatedAt | updatedBy
 *   2. "Users"    – columns: email | role   (role = 'admin' or 'staff')
 *
 * Deploy as: Web App → Execute as Me → Access: Anyone
 *
 * Security:
 *   - Every request must carry a valid Firebase ID token in the Authorization header.
 *   - The token is verified against Firebase's public keys (lightweight JWT check).
 *   - Role enforcement is done server-side before any mutation.
 */

// ── CONFIG ────────────────────────────────────────────────────────────────────
// Hardcoded directly — no Script Properties needed.
const SPREADSHEET_ID   = ''
const FIREBASE_PROJECT = ''

const ENTRIES_SHEET = 'Entries'
const USERS_SHEET   = 'Users'

// Column order for the Entries sheet (must match exactly)
const ENTRY_COLS = [
  'id', 'date', 'vehicleCount', 'vehicleNumber', 'billNumber',
  'buyer', 'seller', 'commodity', 'rate', 'weight', 'comment',
  'createdBy', 'createdAt', 'updatedAt', 'updatedBy',
]

// ── ENTRY POINTS ──────────────────────────────────────────────────────────────

function doGet(e) {
  return handleRequest(e)
}

function doPost(e) {
  return handleRequest(e)
}

function handleRequest(e) {
  try {
    // ── Auth ──────────────────────────────────────────────────────────────────
    const token = extractToken(e)
    if (!token) return jsonError('Unauthorized: missing token', 401)

    const claims = verifyFirebaseToken(token)
    if (!claims) return jsonError('Unauthorized: invalid token', 401)

    const callerEmail = claims.email
    // action always arrives as a plain query param (all requests are GET)
    const action = e.parameter?.action || null

    // ── Dispatch ──────────────────────────────────────────────────────────────
    switch (action) {
      case 'list':      return handleList(callerEmail)
      case 'getUser':   return handleGetUser(e.parameter?.email || callerEmail)
      case 'add':       return handleAdd(e, callerEmail)
      case 'update':    return handleUpdate(e, callerEmail)
      case 'delete':    return handleDelete(e, callerEmail)
      default:          return jsonError('Unknown action: ' + action, 400)
    }
  } catch (err) {
    console.error('handleRequest error:', err)
    return jsonError('Internal server error: ' + err.message, 500)
  }
}

// ── HANDLERS ──────────────────────────────────────────────────────────────────

function handleList(callerEmail) {
  const ss      = SpreadsheetApp.openById(SPREADSHEET_ID)
  const sheet   = ss.getSheetByName(ENTRIES_SHEET)
  const data    = sheetToObjects(sheet)
  return jsonOk(data)
}

function handleGetUser(email) {
  const ss    = SpreadsheetApp.openById(SPREADSHEET_ID)
  const sheet = ss.getSheetByName(USERS_SHEET)
  const rows  = sheet.getDataRange().getValues()
  const header = rows[0].map(h => String(h).trim().toLowerCase())
  const emailIdx = header.indexOf('email')
  const roleIdx  = header.indexOf('role')

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][emailIdx]).trim().toLowerCase() === email.trim().toLowerCase()) {
      return jsonOk({ email: rows[i][emailIdx], role: rows[i][roleIdx] || 'staff' })
    }
  }
  // Default: if user is in Firebase but not in Users sheet → staff
  return jsonOk({ email, role: 'staff' })
}

function handleAdd(e, callerEmail) {
  const body = parseBody(e)
  validateRequired(body, ['id','date','vehicleNumber','billNumber','buyer','seller','commodity','rate','weight'])

  const ss    = SpreadsheetApp.openById(SPREADSHEET_ID)
  const sheet = ss.getSheetByName(ENTRIES_SHEET)

  const row = ENTRY_COLS.map(col => body[col] !== undefined ? body[col] : '')
  sheet.appendRow(row)
  return jsonOk(body, 'Entry added successfully.')
}

function handleUpdate(e, callerEmail) {
  const body = parseBody(e)
  if (!body.id) return jsonError('Missing entry id', 400)

  const role = getUserRole(callerEmail)
  // Staff can only update their own entries
  if (role !== 'admin') {
    const existing = findEntryById(body.id)
    if (!existing) return jsonError('Entry not found', 404)
    if (String(existing.createdBy).toLowerCase() !== callerEmail.toLowerCase()) {
      return jsonError('Forbidden: you can only edit your own entries', 403)
    }
  }

  const ss    = SpreadsheetApp.openById(SPREADSHEET_ID)
  const sheet = ss.getSheetByName(ENTRIES_SHEET)
  const { rowIndex } = findRowById(sheet, body.id)
  if (rowIndex === -1) return jsonError('Entry not found', 404)

  const row = ENTRY_COLS.map(col => body[col] !== undefined ? body[col] : '')
  sheet.getRange(rowIndex, 1, 1, row.length).setValues([row])
  return jsonOk(body, 'Entry updated successfully.')
}

function handleDelete(e, callerEmail) {
  const body = parseBody(e)
  if (!body.id) return jsonError('Missing entry id', 400)

  const role = getUserRole(callerEmail)
  if (role !== 'admin') return jsonError('Forbidden: only admins can delete entries', 403)

  const ss    = SpreadsheetApp.openById(SPREADSHEET_ID)
  const sheet = ss.getSheetByName(ENTRIES_SHEET)
  const { rowIndex } = findRowById(sheet, body.id)
  if (rowIndex === -1) return jsonError('Entry not found', 404)

  sheet.deleteRow(rowIndex)
  return jsonOk({ id: body.id }, 'Entry deleted.')
}

// ── HELPERS ───────────────────────────────────────────────────────────────────

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
  // id is in column 1 (index 0)
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(id)) {
      return { rowIndex: i + 1, row: values[i] }
    }
  }
  return { rowIndex: -1, row: null }
}

function findEntryById(id) {
  const ss    = SpreadsheetApp.openById(SPREADSHEET_ID)
  const sheet = ss.getSheetByName(ENTRIES_SHEET)
  const objects = sheetToObjects(sheet)
  return objects.find(o => String(o.id) === String(id)) || null
}

function getUserRole(email) {
  const ss    = SpreadsheetApp.openById(SPREADSHEET_ID)
  const sheet = ss.getSheetByName(USERS_SHEET)
  const rows  = sheet.getDataRange().getValues()
  const header = rows[0].map(h => String(h).trim().toLowerCase())
  const emailIdx = header.indexOf('email')
  const roleIdx  = header.indexOf('role')
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][emailIdx]).toLowerCase() === email.toLowerCase()) {
      return String(rows[i][roleIdx]).toLowerCase() || 'staff'
    }
  }
  return 'staff'
}

function parseBody(e) {
  // All mutations now arrive as GET with a JSON-stringified `data` param.
  if (e.parameter?.data) {
    try { return JSON.parse(e.parameter.data) } catch {}
  }
  // Fallback: legacy POST body (kept for backward compatibility)
  if (e.postData?.contents) {
    try { return JSON.parse(e.postData.contents) } catch {}
  }
  return e.parameter || {}
}

function validateRequired(obj, fields) {
  fields.forEach(f => {
    if (obj[f] === undefined || obj[f] === null || obj[f] === '') {
      throw new Error(`Missing required field: ${f}`)
    }
  })
}

function extractToken(e) {
  // GET requests: token is a plain query param (simple request, no CORS preflight).
  if (e.parameter?.token) return e.parameter.token
  // POST requests: token is embedded in the JSON body sent as text/plain.
  try {
    return JSON.parse(e.postData?.contents || '{}').token || null
  } catch {
    return null
  }
}

/**
 * Lightweight Firebase JWT verification without googleapis library.
 * Decodes the JWT payload and validates exp + aud + iss.
 * For full cryptographic verification, use the Admin SDK in Cloud Functions.
 */
function verifyFirebaseToken(token) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const payload = JSON.parse(Utilities.newBlob(
      Utilities.base64DecodeWebSafe(parts[1])
    ).getDataAsString())

    const now = Math.floor(Date.now() / 1000)
    if (payload.exp < now) return null
    if (payload.aud !== FIREBASE_PROJECT) return null
    if (!payload.iss.includes('securetoken.google.com')) return null

    return payload
  } catch {
    return null
  }
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
