/** Known buyer / seller names shown in dropdowns */
export const KNOWN_BUYERS = [
  'Ramesh Traders',
  'Suresh Agro',
  'Anil Kumar & Sons',
  'Patel Merchants',
  'Singh Brothers',
  'Gupta Agri Mart',
  'Other',
]

export const KNOWN_SELLERS = [
  'Kisan Supplier Co.',
  'Haryana Farms',
  'Punjab Agro Exports',
  'Delhi Mandi Supplier',
  'Rajasthan Traders',
  'Other',
]

/** Commodity list */
export const COMMODITIES = [
  'Wheat',
  'Rice',
  'Maize',
  'Barley',
  'Soybean',
  'Mustard',
  'Groundnut',
  'Cotton',
  'Sugarcane',
  'Onion',
  'Potato',
  'Tomato',
  'Other',
]

/** Table column definitions (used by DataTable + sorting) */
export const TABLE_COLUMNS = [
  { key: 'date',          label: 'Date',           sortable: true,  numeric: false },
  { key: 'vehicleNumber', label: 'Vehicle No.',     sortable: true,  numeric: false },
  { key: 'billNumber',    label: 'Bill No.',        sortable: true,  numeric: false },
  { key: 'buyer',         label: 'Buyer',           sortable: true,  numeric: false },
  { key: 'seller',        label: 'Seller',          sortable: true,  numeric: false },
  { key: 'commodity',     label: 'Commodity',       sortable: true,  numeric: false },
  { key: 'rate',          label: 'Rate (₹)',        sortable: true,  numeric: true  },
  { key: 'weight',        label: 'Weight (kg)',     sortable: true,  numeric: true  },
  { key: 'vehicleCount',  label: 'Vehicle Count',   sortable: true,  numeric: true  },
  { key: 'comment',       label: 'Comment',         sortable: false, numeric: false },
]

/** Page size options for the pagination selector */
export const PAGE_SIZE_OPTIONS = [10, 15, 25, 50]

/** Role constants */
export const ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
}
