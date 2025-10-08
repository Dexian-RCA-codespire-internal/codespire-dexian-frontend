import api from '../index.js';

// Knowledge Base API services
export const knowledgeBaseService = {
  // Get RCA resolved ticket details by ticket ID
  getRCAResolvedTicket: async (ticketId) => {
    const response = await api.get(`/rca-resolved/${ticketId}`);
    return response.data;
  },

  // Create knowledge base entry
  createKnowledgeBase: async (kbData) => {
    const response = await api.post('/kb/store', kbData);
    return response.data;
  },

  // Update RCA report in resolved ticket
  updateRCAReport: async (ticketId, rcaReportData) => {
    const response = await api.post(`/rca-resolved/${ticketId}/rca-report`, rcaReportData);
    return response.data;
  },

  // Search knowledge base entries
  searchKnowledgeBase: async (query) => {
    const response = await api.get(`/kb/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  // Get knowledge base entry by ID
  getKnowledgeBaseById: async (kbId) => {
    const response = await api.get(`/kb/${kbId}`);
    return response.data;
  },

  // Update knowledge base entry
  updateKnowledgeBase: async (kbId, updateData) => {
    const response = await api.put(`/kb/${kbId}`, updateData);
    return response.data;
  },

  // Delete knowledge base entry
  deleteKnowledgeBase: async (kbId) => {
    const response = await api.delete(`/kb/${kbId}`);
    return response.data;
  },

  // Get knowledge base by category
  getKnowledgeBaseByCategory: async (category) => {
    const response = await api.get(`/kb/category/${category}`);
    return response.data;
  }
};