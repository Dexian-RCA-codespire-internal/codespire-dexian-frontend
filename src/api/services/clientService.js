import api from '../index.js';

// Client management API services
export const clientService = {
  // Fetch all clients with pagination
  fetchClients: async ({ page = 1, limit = 20, search = '', sortBy = 'createdAt', sortOrder = 'desc' } = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search,
      sortBy,
      sortOrder
    });
    const response = await api.get(`/clients?${params}`);
    return response.data;
  },

  // Fetch single client by ID
  fetchClientById: async (clientId) => {
    const response = await api.get(`/clients/${clientId}`);
    return response.data;
  },

  // Create new client
  createClient: async (clientData) => {
    const response = await api.post('/clients', clientData);
    return response.data;
  },

  // Update existing client
  updateClient: async ({ clientId, clientData }) => {
    const response = await api.put(`/clients/${clientId}`, clientData);
    return response.data;
  },

  // Delete client
  deleteClient: async (clientId) => {
    const response = await api.delete(`/clients/${clientId}`);
    return response.data;
  },

  // Get client statistics
  getClientStats: async () => {
    const response = await api.get('/clients/stats');
    return response.data;
  },

  // Search clients
  searchClients: async (query) => {
    const response = await api.get(`/clients/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  // Get client integrations
  getClientIntegrations: async (clientId) => {
    const response = await api.get(`/clients/${clientId}/integrations`);
    return response.data;
  },

  // Add integration to client
  addClientIntegration: async (clientId, integrationData) => {
    const response = await api.post(`/clients/${clientId}/integrations`, integrationData);
    return response.data;
  },

  // Remove integration from client
  removeClientIntegration: async (clientId, integrationId) => {
    const response = await api.delete(`/clients/${clientId}/integrations/${integrationId}`);
    return response.data;
  }
};
