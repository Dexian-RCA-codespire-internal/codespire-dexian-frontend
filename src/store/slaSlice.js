import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { slaService } from '../api/services/slaService.js'

// Async thunks for SLA operations
export const fetchSLAs = createAsyncThunk(
  'sla/fetchSLAs',
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await slaService.getSLAs(params)

      // Normalize a variety of backend response shapes into { data, pagination }
      // Supported shapes (examples):
      // 1) { success: true, data: { slas: [...], pagination: { ... } } }
      // 2) { slas: [...], pagination: { ... } }
      // 3) { data: [...] }
      // 4) { success: true, data: { docs: [...], page, totalDocs, limit, totalPages } }

      const payload = { data: [], pagination: {} }

      if (!res) return payload

      // Try common locations for the list
      if (Array.isArray(res)) {
        payload.data = res
      } else if (Array.isArray(res.data)) {
        payload.data = res.data
      } else if (res.data && Array.isArray(res.data.slas)) {
        payload.data = res.data.slas
      } else if (Array.isArray(res.slas)) {
        payload.data = res.slas
      } else if (res.data && Array.isArray(res.data.docs)) {
        payload.data = res.data.docs
      } else if (res.docs && Array.isArray(res.docs)) {
        payload.data = res.docs
      } else if (res.data && typeof res.data === 'object' && !Array.isArray(res.data)) {
        // If data is an object but not an array, try to find array fields
        payload.data = res.data.slas || res.data.docs || []
      }

      // Normalize pagination - try multiple possible keys
      const paginationSource = res.pagination || res.data?.pagination || res.data || res
      const pagination = {}
      if (paginationSource) {
        // Common mappings - map backend names to slice expected names
        pagination.currentPage = paginationSource.currentPage || paginationSource.page || paginationSource.pg || paginationSource.p || undefined
        pagination.limit = paginationSource.limit || paginationSource.perPage || paginationSource.pageSize || paginationSource.pp || undefined
        pagination.total = paginationSource.total || paginationSource.totalDocs || paginationSource.count || paginationSource.totalRecords || undefined
        pagination.totalPages = paginationSource.totalPages || paginationSource.pages || undefined
        pagination.hasNextPage = typeof paginationSource.hasNextPage === 'boolean' ? paginationSource.hasNextPage : (pagination.totalPages ? (pagination.currentPage < pagination.totalPages) : false)
        pagination.hasPrevPage = typeof paginationSource.hasPrevPage === 'boolean' ? paginationSource.hasPrevPage : (pagination.currentPage ? (pagination.currentPage > 1) : false)
      }

      payload.pagination = pagination

      return payload
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const fetchSLAStats = createAsyncThunk(
  'sla/fetchSLAStats',
  async (_, { rejectWithValue }) => {
    try {
      return await slaService.getSLAStats()
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const fetchSLAMetrics = createAsyncThunk(
  'sla/fetchSLAMetrics',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await slaService.getSLAMetrics(params)
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const fetchSLADashboardData = createAsyncThunk(
  'sla/fetchSLADashboardData',
  async (filters = {}, { rejectWithValue }) => {
    try {
      return await slaService.getSLADashboardData(filters)
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const fetchSLAByTicketId = createAsyncThunk(
  'sla/fetchSLAByTicketId',
  async ({ ticketId, source = 'ServiceNow' }, { rejectWithValue }) => {
    try {
      return await slaService.getSLAByTicketId(ticketId, source)
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const deleteSLAByTicketId = createAsyncThunk(
  'sla/deleteSLAByTicketId',
  async ({ ticketId, source = 'ServiceNow' }, { rejectWithValue }) => {
    try {
      return await slaService.deleteSLAByTicketId(ticketId, source)
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

// Initial state
const initialState = {
  slaData: [],
  slaMetrics: null,
  stats: {
    totalTickets: 0,
    breached: 0,
    critical: 0,
    warning: 0,
    safe: 0,
    breachRate: 0,
  },
  filters: {
    searchTerm: '',
    priority: 'All',
    status: 'All',
    source: 'All',
    slaStatus: 'All',
    sortField: 'opened_time',
    sortDirection: 'desc',
  },
  pagination: {
    currentPage: 1,
    total: 0,
    limit: 15,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  },
  selectedTicket: null,
  loading: {
    slaData: false,
    stats: false,
    metrics: false,
    ticket: false,
  },
  error: {
    slaData: null,
    stats: null,
    metrics: null,
    ticket: null,
  },
  websocket: {
    isConnected: false,
    lastUpdate: null,
  },
}

// Create the slice
const slaSlice = createSlice({
  name: 'sla',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload }
    },
    setSelectedTicket: (state, action) => {
      state.selectedTicket = action.payload
    },
    updateWebSocketStatus: (state, action) => {
      state.websocket = { ...state.websocket, ...action.payload }
    },
    // Handle real-time updates from WebSocket
    handleSLAUpdate: (state, action) => {
      const { type, data } = action.payload
      switch (type) {
        case 'stats':
          state.stats = { ...state.stats, ...data }
          break
        case 'metrics':
          state.slaMetrics = { ...state.slaMetrics, ...data }
          break
        case 'ticket':
          // Update specific ticket in the list
          const index = state.slaData.findIndex(ticket => ticket.ticketId === data.ticketId)
          if (index !== -1) {
            state.slaData[index] = { ...state.slaData[index], ...data }
          }
          break
      }
    },
  },
  extraReducers: (builder) => {
    // Handle fetchSLAs
    builder
      .addCase(fetchSLAs.pending, (state) => {
        state.loading.slaData = true
        state.error.slaData = null
      })
      .addCase(fetchSLAs.fulfilled, (state, action) => {
        state.loading.slaData = false
        state.slaData = Array.isArray(action.payload?.data) ? action.payload.data : (action.payload?.data || state.slaData)
        // Merge pagination only when present to avoid wiping defaults
        if (action.payload?.pagination && Object.keys(action.payload.pagination).length > 0) {
          state.pagination = {
            ...state.pagination,
            ...action.payload.pagination,
          }
        }
      })
      .addCase(fetchSLAs.rejected, (state, action) => {
        state.loading.slaData = false
        state.error.slaData = action.payload
      })

    // Handle fetchSLAStats
    builder
      .addCase(fetchSLAStats.pending, (state) => {
        state.loading.stats = true
        state.error.stats = null
      })
      .addCase(fetchSLAStats.fulfilled, (state, action) => {
        state.loading.stats = false
        // Support both wrapped { success, data } and raw data
        state.stats = action.payload?.data || action.payload || state.stats
      })
      .addCase(fetchSLAStats.rejected, (state, action) => {
        state.loading.stats = false
        state.error.stats = action.payload
      })

    // Handle fetchSLAMetrics
    builder
      .addCase(fetchSLAMetrics.pending, (state) => {
        state.loading.metrics = true
        state.error.metrics = null
      })
      .addCase(fetchSLAMetrics.fulfilled, (state, action) => {
        state.loading.metrics = false
        // Support both wrapped { success, data } and raw data
        state.slaMetrics = action.payload?.data || action.payload || state.slaMetrics
      })
      .addCase(fetchSLAMetrics.rejected, (state, action) => {
        state.loading.metrics = false
        state.error.metrics = action.payload
      })

    // Handle fetchSLADashboardData
    builder
      .addCase(fetchSLADashboardData.pending, (state) => {
        state.loading.slaData = true
        state.error.slaData = null
      })
      .addCase(fetchSLADashboardData.fulfilled, (state, action) => {
        state.loading.slaData = false
        state.slaData = action.payload.data
        state.slaMetrics = action.payload.metrics
      })
      .addCase(fetchSLADashboardData.rejected, (state, action) => {
        state.loading.slaData = false
        state.error.slaData = action.payload
      })

    // Handle fetchSLAByTicketId
    builder
      .addCase(fetchSLAByTicketId.pending, (state) => {
        state.loading.ticket = true
        state.error.ticket = null
      })
      .addCase(fetchSLAByTicketId.fulfilled, (state, action) => {
        state.loading.ticket = false
        state.selectedTicket = action.payload
      })
      .addCase(fetchSLAByTicketId.rejected, (state, action) => {
        state.loading.ticket = false
        state.error.ticket = action.payload
      })

    // Handle deleteSLAByTicketId
    builder
      .addCase(deleteSLAByTicketId.fulfilled, (state, action) => {
        state.slaData = state.slaData.filter(
          ticket => ticket.ticketId !== action.meta.arg.ticketId
        )
      })
  },
})

// Export actions
export const {
  setFilters,
  setPagination,
  setSelectedTicket,
  updateWebSocketStatus,
  handleSLAUpdate,
} = slaSlice.actions

// Export selectors
export const selectSLAState = (state) => state.sla
export const selectSLAData = (state) => state.sla?.slaData || []
export const selectSLAStats = (state) => state.sla?.stats || {
  totalTickets: 0,
  breached: 0,
  critical: 0,
  warning: 0,
  safe: 0,
  breachRate: 0
}
export const selectSLAMetrics = (state) => state.sla?.slaMetrics || null
export const selectSLAFilters = (state) => state.sla?.filters || {
  searchTerm: '',
  priority: 'All',
  status: 'All',
  source: 'All',
  slaStatus: 'All',
  sortField: 'opened_time',
  sortDirection: 'desc'
}
export const selectSLAPagination = (state) => state.sla?.pagination || {
  currentPage: 1,
  total: 0,
  limit: 15,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: false
}
export const selectSelectedTicket = (state) => state.sla?.selectedTicket || null
export const selectSLALoading = (state) => state.sla?.loading || {
  slaData: false,
  stats: false,
  metrics: false,
  ticket: false
}
export const selectSLAErrors = (state) => state.sla?.error || {
  slaData: null,
  stats: null,
  metrics: null,
  ticket: null
}
export const selectWebSocketStatus = (state) => state.sla?.websocket || {
  isConnected: false,
  lastUpdate: null
}

// Export reducer
export default slaSlice.reducer
