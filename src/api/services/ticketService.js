import api from '../index.js';

// Ticket management API services
export const ticketService = {
  // Fetch tickets from backend API with pagination
  getTickets: async (params = {}) => {
    const apiParams = {
      page: params.page || 1,
      limit: params.limit || 10,
      ...(params.status && { status: params.status }),
      ...(params.priority && { priority: params.priority }),
      ...(params.source && { source: params.source }),
      ...(params.search && { search: params.search })
    };
    const response = await api.get('/tickets', { params: apiParams });
    return response.data;
  },

  // Fetch single ticket by ID
  getTicketById: async (ticketId) => {
    const response = await api.get(`/tickets/${ticketId}`);
    return response.data;
  },

  // Create new ticket
  createTicket: async (ticketData) => {
    const response = await api.post('/tickets', ticketData);
    return response.data;
  },

  // Update ticket
  updateTicket: async ({ ticketId, ticketData }) => {
    const response = await api.put(`/tickets/${ticketId}`, ticketData);
    return response.data;
  },

  // Delete ticket
  deleteTicket: async (ticketId) => {
    const response = await api.delete(`/tickets/${ticketId}`);
    return response.data;
  },

  // Update ticket status
  updateTicketStatus: async ({ ticketId, status, notes }) => {
    const response = await api.patch(`/tickets/${ticketId}/status`, { status, notes });
    return response.data;
  },

  // Assign ticket to user
  assignTicket: async ({ ticketId, assignedTo }) => {
    const response = await api.patch(`/tickets/${ticketId}/assign`, { assignedTo });
    return response.data;
  },

  // Get ticket comments
  getTicketComments: async (ticketId) => {
    const response = await api.get(`/tickets/${ticketId}/comments`);
    return response.data;
  },

  // Add comment to ticket
  addTicketComment: async ({ ticketId, comment }) => {
    const response = await api.post(`/tickets/${ticketId}/comments`, { comment });
    return response.data;
  },

  // Get ticket attachments
  getTicketAttachments: async (ticketId) => {
    const response = await api.get(`/tickets/${ticketId}/attachments`);
    return response.data;
  },

  // Upload attachment to ticket
  uploadTicketAttachment: async ({ ticketId, file }) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/tickets/${ticketId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Delete ticket attachment
  deleteTicketAttachment: async ({ ticketId, attachmentId }) => {
    const response = await api.delete(`/tickets/${ticketId}/attachments/${attachmentId}`);
    return response.data;
  },

  // Get ticket statistics
  getTicketStats: async () => {
    const response = await api.get('/tickets/stats');
    return response.data;
  },

  // Search tickets
  searchTickets: async (query) => {
    const response = await api.get(`/tickets/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  // Find which page a ticket belongs to given current filters
  // Backend expected endpoint: GET /tickets/find-by-ticketId?ticketId=INC001&pageLimit=10&...filters
  // Returns { success: true, data: { page, index, pagination } }
  findTicketPage: async ({ ticketId, filters = {}, pageLimit = 10 }) => {
    try {
      const params = {
        ticketId,
        pageLimit,
        ...(filters.search && { search: filters.search }),
        ...(filters.source && { source: filters.source }),
        ...(filters.priority && { priority: filters.priority }),
        ...(filters.status && { status: filters.status }),
        ...(filters.dateRange && filters.dateRange.startDate && { startDate: filters.dateRange.startDate }),
        ...(filters.dateRange && filters.dateRange.endDate && { endDate: filters.dateRange.endDate })
      }

      const response = await api.get('/tickets/find-by-ticketId', { params })
      return response.data
    } catch (err) {
      // If backend doesn't provide the endpoint, return null for caller to fallback
      if (err.response && (err.response.status === 404 || err.response.status === 501)) {
        return null
      }
      throw err
    }
  },

  // Get tickets by source (ServiceNow, Jira, etc.)
  getTicketsBySource: async (source, params = {}) => {
    const apiParams = {
      page: params.page || 1,
      limit: params.limit || 10,
      ...(params.status && { status: params.status }),
      ...(params.priority && { priority: params.priority })
    };
    const response = await api.get(`/tickets/source/${source}`, { params: apiParams });
    return response.data;
  },

  // Sync tickets from external source
  syncTicketsFromSource: async (source) => {
    const response = await api.post(`/tickets/sync/${source}`);
    return response.data;
  },

  // Get ticket timeline
  getTicketTimeline: async (ticketId) => {
    const response = await api.get(`/tickets/${ticketId}/timeline`);
    return response.data;
  },

  // Bulk update tickets
  bulkUpdateTickets: async ({ ticketIds, updateData }) => {
    const response = await api.patch('/tickets/bulk-update', { ticketIds, updateData });
    return response.data;
  },

  // Export tickets
  exportTickets: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/tickets/export?${params}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Get similar tickets
  getSimilarTickets: async (ticketData) => {
    const response = await api.post('/ticket-similarity/similar', ticketData);
    return response.data;
  },

  // Get AI suggestions based on similar tickets
  getAISuggestions: async (similarTickets, currentTicket) => {
    const response = await api.post('/ticket-similarity/suggestions', {
      similarTickets,
      currentTicket
    });
    return response.data;
  },

  // Resolve ticket with root cause analysis
  resolveTicket: async ({ rootCause, ticket }) => {
    const response = await api.post('/tickets/resolve', {
      rootCause,
      ticket
    });
    return response.data;
  },

  // Update ticket with RCA step data
  updateTicketSteps: async ({ ticketId, stepData }) => {
    const response = await api.put(`/tickets/${ticketId}`, stepData);
    return response.data;
  }
};
