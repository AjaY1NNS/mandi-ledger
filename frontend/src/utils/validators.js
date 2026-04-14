/**
 * Validation helpers for the EntryForm.
 * Each function returns an error string or null.
 */

export const required = (value, fieldName = 'This field') => {
  if (!value || String(value).trim() === '') return `${fieldName} is required.`
  return null
}

export const positiveNumber = (value, fieldName = 'Value') => {
  if (value === '' || value === null || value === undefined)
    return `${fieldName} is required.`
  const num = parseFloat(value)
  if (isNaN(num)) return `${fieldName} must be a number.`
  if (num <= 0)   return `${fieldName} must be greater than 0.`
  return null
}

export const optionalPositiveNumber = (value, fieldName = 'Value') => {
  if (value === '' || value === null || value === undefined) return null  // optional
  const num = parseFloat(value)
  if (isNaN(num)) return `${fieldName} must be a number.`
  if (num < 0)    return `${fieldName} cannot be negative.`
  return null
}

export const validDate = (value) => {
  if (!value) return 'Date is required.'
  const d = new Date(value)
  if (isNaN(d.getTime())) return 'Enter a valid date.'
  return null
}

/**
 * Validate the full entry form.
 * @param {object} data  Form field values
 * @returns {{ [field: string]: string }} map of field → error message (empty = valid)
 */
export const validateEntryForm = (data) => {
  const errors = {}

  // ── Required fields ─────────────────────────────────────────────────────
  const dateErr      = validDate(data.date)
  const buyerErr     = required(data.buyer,     'Buyer')
  const sellerErr    = required(data.seller,    'Seller')
  const commodityErr = required(data.commodity, 'Commodity')
  const rateErr      = positiveNumber(data.rate, 'Rate')

  if (dateErr)      errors.date      = dateErr
  if (rateErr)      errors.rate      = rateErr
  if (commodityErr) errors.commodity = commodityErr

  // ── Weight (QNTL) – optional but must be positive if provided ───────────
  const weightErr = optionalPositiveNumber(data.weight, 'Weight (Qtl)')
  if (weightErr) errors.weight = weightErr

  // ── Vehicle count – required positive integer ────────────────────────────
  const vehicleCountVal = parseInt(data.vehicleCount, 10)
  if (!data.vehicleCount && data.vehicleCount !== 0) {
    errors.vehicleCount = 'Vehicle count is required.'
  } else if (isNaN(vehicleCountVal) || vehicleCountVal <= 0) {
    errors.vehicleCount = 'Vehicle count must be at least 1.'
  }

  // ── Vehicle numbers – optional; just skip empty rows ─────────────────────
  // (no error if all rows are blank)

  // ── Brokerage – required, value must be positive ─────────────────────────
  const brokerageErr = positiveNumber(data.brokerageValue, 'Brokerage')
  if (brokerageErr) errors.brokerageValue = brokerageErr

  // ── Buyer "Other" input ───────────────────────────────────────────────────
  if (buyerErr) {
    errors.buyer = buyerErr
  } else if (data.buyer === 'Other' && !data.buyerOther?.trim()) {
    errors.buyerOther = 'Please specify the buyer name.'
  }

  // ── Seller "Other" input ──────────────────────────────────────────────────
  if (sellerErr) {
    errors.seller = sellerErr
  } else if (data.seller === 'Other' && !data.sellerOther?.trim()) {
    errors.sellerOther = 'Please specify the seller name.'
  }

  return errors
}

/** Returns true when no validation errors exist */
export const isFormValid = (errors) => Object.keys(errors).length === 0
