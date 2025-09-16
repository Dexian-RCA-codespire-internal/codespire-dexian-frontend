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
    const response = await api.get('/v1/tickets', { params: apiParams });
    return response.data;
  },

  // Fetch single ticket by ID
  getTicketById: async (ticketId) => {
    const response = await api.get(`/v1/tickets/${ticketId}`);
    return response.data;
  },

  // Create new ticket
  createTicket: async (ticketData) => {
    const response = await api.post('/v1/tickets', ticketData);
    return response.data;
  },

  // Update ticket
  updateTicket: async ({ ticketId, ticketData }) => {
    const response = await api.put(`/v1/tickets/${ticketId}`, ticketData);
    return response.data;
  },

  // Delete ticket
  deleteTicket: async (ticketId) => {
    const response = await api.delete(`/v1/tickets/${ticketId}`);
    return response.data;
  },

  // Update ticket status
  updateTicketStatus: async ({ ticketId, status, notes }) => {
    const response = await api.patch(`/v1/tickets/${ticketId}/status`, { status, notes });
    return response.data;
  },

  // Assign ticket to user
  assignTicket: async ({ ticketId, assignedTo }) => {
    const response = await api.patch(`/v1/tickets/${ticketId}/assign`, { assignedTo });
    return response.data;
  },

  // Get ticket comments
  getTicketComments: async (ticketId) => {
    const response = await api.get(`/v1/tickets/${ticketId}/comments`);
    return response.data;
  },

  // Add comment to ticket
  addTicketComment: async ({ ticketId, comment }) => {
    const response = await api.post(`/v1/tickets/${ticketId}/comments`, { comment });
    return response.data;
  },

  // Get ticket attachments
  getTicketAttachments: async (ticketId) => {
    const response = await api.get(`/v1/tickets/${ticketId}/attachments`);
    return response.data;
  },

  // Upload attachment to ticket
  uploadTicketAttachment: async ({ ticketId, file }) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/v1/tickets/${ticketId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Delete ticket attachment
  deleteTicketAttachment: async ({ ticketId, attachmentId }) => {
    const response = await api.delete(`/v1/tickets/${ticketId}/attachments/${attachmentId}`);
    return response.data;
  },

  // Get ticket statistics
  getTicketStats: async () => {
    const response = await api.get('/v1/tickets/stats');
    return response.data;
  },

  // Search tickets
  searchTickets: async (query) => {
    const response = await api.get(`/v1/tickets/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  // Get tickets by source (ServiceNow, Jira, etc.)
  getTicketsBySource: async (source, params = {}) => {
    const apiParams = {
      page: params.page || 1,
      limit: params.limit || 10,
      ...(params.status && { status: params.status }),
      ...(params.priority && { priority: params.priority })
    };
    const response = await api.get(`/v1/tickets/source/${source}`, { params: apiParams });
    return response.data;
  },

  // Sync tickets from external source
  syncTicketsFromSource: async (source) => {
    const response = await api.post(`/v1/tickets/sync/${source}`);
    return response.data;
  },

  // Get ticket timeline
  getTicketTimeline: async (ticketId) => {
    const response = await api.get(`/v1/tickets/${ticketId}/timeline`);
    return response.data;
  },

  // Bulk update tickets
  bulkUpdateTickets: async ({ ticketIds, updateData }) => {
    const response = await api.patch('/v1/tickets/bulk-update', { ticketIds, updateData });
    return response.data;
  },

  // Export tickets
  exportTickets: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/v1/tickets/export?${params}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Get similar tickets
  getSimilarTickets: async (ticketData) => {
    const response = await api.post('/v1/ticket-similarity/similar', ticketData);
    return response.data;
  },

  // Get AI suggestions based on similar tickets
  getAISuggestions: async (similarTickets, currentTicket) => {
    const response = await api.post('/v1/ticket-similarity/suggestions', {
      similarTickets,
      currentTicket
    });
    return response.data;
  }
};
