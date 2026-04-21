
/** Table column definitions (used by DataTable + sorting) */
export const TABLE_COLUMNS = [
  { key: 'date',           label: 'Date',          sortable: true,  numeric: false },
  { key: 'vehicleCount',   label: 'Veh. Count',   sortable: true,  numeric: true  },
  { key: 'vehicleNumber',  label: 'Vehicle No.',   sortable: false, numeric: false },
  { key: 'billNumber',     label: 'Bill No.',     sortable: true,  numeric: false },
  { key: 'buyer',          label: 'Buyer',        sortable: true,  numeric: false },
  { key: 'seller',         label: 'Seller',       sortable: true,  numeric: false },
  { key: 'commodity',      label: 'Commodity',    sortable: true,  numeric: false },
  { key: 'rate',           label: 'Rate (₹)',     sortable: true,  numeric: true  },
  { key: 'weight',         label: 'Qty (Qtl)',    sortable: true,  numeric: true  },
  { key: 'brokerageValue', label: 'Brokerage',    sortable: true,  numeric: true  },
  { key: 'comment',        label: 'Comment',      sortable: false, numeric: false },
];

/** Page size options for the pagination selector */
export const PAGE_SIZE_OPTIONS = [10, 15, 25, 50];

/** Role constants */
export const ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
};
