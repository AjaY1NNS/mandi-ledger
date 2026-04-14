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

export const nonNegativeInteger = (value, fieldName = 'Value') => {
  if (value === '' || value === null || value === undefined)
    return `${fieldName} is required.`
  const num = parseInt(value, 10)
  if (isNaN(num) || num < 0) return `${fieldName} must be a non-negative integer.`
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

  const dateErr         = validDate(data.date)
  const vehicleNumErr   = required(data.vehicleNumber, 'Vehicle Number')
  const billNumErr      = required(data.billNumber,    'Bill Number')
  const buyerErr        = required(data.buyer,         'Buyer')
  const sellerErr       = required(data.seller,        'Seller')
  const commodityErr    = required(data.commodity,     'Commodity')
  const rateErr         = positiveNumber(data.rate,    'Rate')
  const weightErr       = positiveNumber(data.weight,  'Weight')
  const vehicleCountErr = nonNegativeInteger(data.vehicleCount, 'Vehicle Count')

  if (dateErr)         errors.date          = dateErr
  if (vehicleNumErr)   errors.vehicleNumber = vehicleNumErr
  if (billNumErr)      errors.billNumber    = billNumErr
  if (rateErr)         errors.rate          = rateErr
  if (weightErr)       errors.weight        = weightErr
  if (vehicleCountErr) errors.vehicleCount  = vehicleCountErr
  if (commodityErr)    errors.commodity     = commodityErr

  // Buyer: if 'Other' selected, require custom input
  if (buyerErr) {
    errors.buyer = buyerErr
  } else if (data.buyer === 'Other' && !data.buyerOther?.trim()) {
    errors.buyerOther = 'Please specify the buyer name.'
  }

  // Seller: same as buyer
  if (sellerErr) {
    errors.seller = sellerErr
  } else if (data.seller === 'Other' && !data.sellerOther?.trim()) {
    errors.sellerOther = 'Please specify the seller name.'
  }

  return errors
}

/** Returns true when no validation errors exist */
export const isFormValid = (errors) => Object.keys(errors).length === 0
