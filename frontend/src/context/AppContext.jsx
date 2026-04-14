import { createContext, useContext, useReducer, useCallback } from 'react'

// ── State shape ───────────────────────────────────────────────────────────────
const initialState = {
  entries:       [],
  isLoading:     false,
  error:         null,
  // Master data
  buyers:        [],
  sellers:       [],
  commodities:   [],
  masterLoading: false,
  // UI
  searchQuery:   '',
  filterDate:    '',
  currentPage:   1,
  pageSize:      15,
  sortColumn:    'date',
  sortDirection: 'desc',  // 'asc' | 'desc'
  // Modals
  showAddModal:  false,
  showEditModal: false,
  editingEntry:  null,
}

// ── Reducer ───────────────────────────────────────────────────────────────────
function appReducer(state, action) {
  switch (action.type) {
    case 'SET_ENTRIES':
      return { ...state, entries: action.payload, isLoading: false, error: null }
    case 'ADD_ENTRY':
      return { ...state, entries: [action.payload, ...state.entries] }
    case 'UPDATE_ENTRY':
      return {
        ...state,
        entries: state.entries.map((e) =>
          e.id === action.payload.id ? action.payload : e
        ),
      }
    case 'DELETE_ENTRY':
      return { ...state, entries: state.entries.filter((e) => e.id !== action.payload) }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false }

    // ── Master data ──────────────────────────────────────────────────────────
    case 'SET_MASTER_LOADING':
      return { ...state, masterLoading: action.payload }
    case 'SET_BUYERS':
      return { ...state, buyers: action.payload }
    case 'ADD_BUYER':
      return { ...state, buyers: [...state.buyers, action.payload] }
    case 'UPDATE_BUYER':
      return { ...state, buyers: state.buyers.map(b => b.id === action.payload.id ? action.payload : b) }
    case 'REMOVE_BUYER':
      return { ...state, buyers: state.buyers.filter(b => b.id !== action.payload) }
    case 'SET_SELLERS':
      return { ...state, sellers: action.payload }
    case 'ADD_SELLER':
      return { ...state, sellers: [...state.sellers, action.payload] }
    case 'UPDATE_SELLER':
      return { ...state, sellers: state.sellers.map(s => s.id === action.payload.id ? action.payload : s) }
    case 'REMOVE_SELLER':
      return { ...state, sellers: state.sellers.filter(s => s.id !== action.payload) }
    case 'SET_COMMODITIES':
      return { ...state, commodities: action.payload }
    case 'ADD_COMMODITY':
      return { ...state, commodities: [...state.commodities, action.payload] }
    case 'UPDATE_COMMODITY':
      return { ...state, commodities: state.commodities.map(c => c.id === action.payload.id ? action.payload : c) }
    case 'REMOVE_COMMODITY':
      return { ...state, commodities: state.commodities.filter(c => c.id !== action.payload) }
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.payload, currentPage: 1 }
    case 'SET_FILTER_DATE':
      return { ...state, filterDate: action.payload, currentPage: 1 }
    case 'SET_PAGE':
      return { ...state, currentPage: action.payload }
    case 'SET_PAGE_SIZE':
      return { ...state, pageSize: action.payload, currentPage: 1 }
    case 'SET_SORT':
      return {
        ...state,
        sortColumn:    action.payload.column,
        sortDirection: action.payload.direction,
        currentPage:   1,
      }
    case 'OPEN_ADD_MODAL':
      return { ...state, showAddModal: true, showEditModal: false, editingEntry: null }
    case 'CLOSE_ADD_MODAL':
      return { ...state, showAddModal: false }
    case 'OPEN_EDIT_MODAL':
      return { ...state, showEditModal: true, showAddModal: false, editingEntry: action.payload }
    case 'CLOSE_EDIT_MODAL':
      return { ...state, showEditModal: false, editingEntry: null }
    default:
      return state
  }
}

// ── Context ───────────────────────────────────────────────────────────────────
const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // ── Entries ──────────────────────────────────────────────────────────────────
  const setEntries     = useCallback((v)        => dispatch({ type: 'SET_ENTRIES',       payload: v }),                            [])
  const addEntry       = useCallback((v)        => dispatch({ type: 'ADD_ENTRY',         payload: v }),                            [])
  const updateEntry    = useCallback((v)        => dispatch({ type: 'UPDATE_ENTRY',      payload: v }),                            [])
  const deleteEntry    = useCallback((id)       => dispatch({ type: 'DELETE_ENTRY',      payload: id }),                           [])
  const setLoading     = useCallback((v)        => dispatch({ type: 'SET_LOADING',       payload: v }),                            [])
  const setError       = useCallback((v)        => dispatch({ type: 'SET_ERROR',         payload: v }),                            [])
  const setSearch      = useCallback((v)        => dispatch({ type: 'SET_SEARCH',        payload: v }),                            [])
  const setFilterDate  = useCallback((v)        => dispatch({ type: 'SET_FILTER_DATE',   payload: v }),                            [])
  const setPage        = useCallback((v)        => dispatch({ type: 'SET_PAGE',          payload: v }),                            [])
  const setPageSize    = useCallback((v)        => dispatch({ type: 'SET_PAGE_SIZE',     payload: v }),                            [])
  const setSort        = useCallback((col, dir) => dispatch({ type: 'SET_SORT',          payload: { column: col, direction: dir } }),[])
  const openAddModal   = useCallback(()         => dispatch({ type: 'OPEN_ADD_MODAL' }),                                           [])
  const closeAddModal  = useCallback(()         => dispatch({ type: 'CLOSE_ADD_MODAL' }),                                          [])
  const openEditModal  = useCallback((v)        => dispatch({ type: 'OPEN_EDIT_MODAL',   payload: v }),                            [])
  const closeEditModal = useCallback(()         => dispatch({ type: 'CLOSE_EDIT_MODAL' }),                                         [])

  // ── Master data ───────────────────────────────────────────────────────────────
  const setMasterLoading = useCallback((v) => dispatch({ type: 'SET_MASTER_LOADING', payload: v }), [])
  const setBuyers        = useCallback((v) => dispatch({ type: 'SET_BUYERS',         payload: v }), [])
  const addBuyer         = useCallback((v) => dispatch({ type: 'ADD_BUYER',          payload: v }), [])
  const updateBuyer      = useCallback((v) => dispatch({ type: 'UPDATE_BUYER',       payload: v }), [])
  const removeBuyer      = useCallback((id)=> dispatch({ type: 'REMOVE_BUYER',       payload: id }), [])
  const setSellers       = useCallback((v) => dispatch({ type: 'SET_SELLERS',        payload: v }), [])
  const addSeller        = useCallback((v) => dispatch({ type: 'ADD_SELLER',         payload: v }), [])
  const updateSeller     = useCallback((v) => dispatch({ type: 'UPDATE_SELLER',      payload: v }), [])
  const removeSeller     = useCallback((id)=> dispatch({ type: 'REMOVE_SELLER',      payload: id }), [])
  const setCommodities   = useCallback((v) => dispatch({ type: 'SET_COMMODITIES',    payload: v }), [])
  const addCommodity     = useCallback((v) => dispatch({ type: 'ADD_COMMODITY',      payload: v }), [])
  const updateCommodity  = useCallback((v) => dispatch({ type: 'UPDATE_COMMODITY',   payload: v }), [])
  const removeCommodity  = useCallback((id)=> dispatch({ type: 'REMOVE_COMMODITY',   payload: id }), [])

  const value = {
    ...state,
    // Entries
    setEntries, addEntry, updateEntry, deleteEntry,
    setLoading, setError,
    setSearch, setFilterDate, setPage, setPageSize, setSort,
    openAddModal, closeAddModal, openEditModal, closeEditModal,
    // Master data
    setMasterLoading,
    setBuyers, addBuyer, updateBuyer, removeBuyer,
    setSellers, addSeller, updateSeller, removeSeller,
    setCommodities, addCommodity, updateCommodity, removeCommodity,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>')
  return ctx
}

export default AppContext
