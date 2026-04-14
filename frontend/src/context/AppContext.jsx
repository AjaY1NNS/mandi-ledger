import { createContext, useContext, useReducer, useCallback } from 'react'

// ── State shape ───────────────────────────────────────────────────────────────
const initialState = {
  entries:       [],
  isLoading:     false,
  error:         null,
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
      return {
        ...state,
        entries: state.entries.filter((e) => e.id !== action.payload),
      }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false }
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

  // Stable action creators
  const setEntries     = useCallback((entries) => dispatch({ type: 'SET_ENTRIES',    payload: entries }),    [])
  const addEntry       = useCallback((entry)   => dispatch({ type: 'ADD_ENTRY',      payload: entry }),      [])
  const updateEntry    = useCallback((entry)   => dispatch({ type: 'UPDATE_ENTRY',   payload: entry }),      [])
  const deleteEntry    = useCallback((id)      => dispatch({ type: 'DELETE_ENTRY',   payload: id }),         [])
  const setLoading     = useCallback((val)     => dispatch({ type: 'SET_LOADING',    payload: val }),        [])
  const setError       = useCallback((err)     => dispatch({ type: 'SET_ERROR',      payload: err }),        [])
  const setSearch      = useCallback((q)       => dispatch({ type: 'SET_SEARCH',     payload: q }),          [])
  const setFilterDate  = useCallback((d)       => dispatch({ type: 'SET_FILTER_DATE',payload: d }),          [])
  const setPage        = useCallback((p)       => dispatch({ type: 'SET_PAGE',       payload: p }),          [])
  const setPageSize    = useCallback((s)       => dispatch({ type: 'SET_PAGE_SIZE',  payload: s }),          [])
  const setSort        = useCallback((col, dir)=> dispatch({ type: 'SET_SORT', payload: { column: col, direction: dir } }), [])
  const openAddModal   = useCallback(()        => dispatch({ type: 'OPEN_ADD_MODAL' }),                      [])
  const closeAddModal  = useCallback(()        => dispatch({ type: 'CLOSE_ADD_MODAL' }),                     [])
  const openEditModal  = useCallback((entry)   => dispatch({ type: 'OPEN_EDIT_MODAL', payload: entry }),     [])
  const closeEditModal = useCallback(()        => dispatch({ type: 'CLOSE_EDIT_MODAL' }),                    [])

  const value = {
    ...state,
    setEntries,
    addEntry,
    updateEntry,
    deleteEntry,
    setLoading,
    setError,
    setSearch,
    setFilterDate,
    setPage,
    setPageSize,
    setSort,
    openAddModal,
    closeAddModal,
    openEditModal,
    closeEditModal,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>')
  return ctx
}

export default AppContext
