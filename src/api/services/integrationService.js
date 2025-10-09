import api from '../index.js';

// Integration API services
export const integrationService = {
  // Get all integrations
  getIntegrations: async () => {
    const response = await api.get('/integrations');
    return response.data;
  },

  // Get integration by ID
  getIntegrationById: async (integrationId) => {
    const response = await api.get(`/integrations/${integrationId}`);
    return response.data;
  },

  // Create new integration
  createIntegration: async (integrationData) => {
    const response = await api.post('/integrations', integrationData);
    return response.data;
  },

  // Update integration
  updateIntegration: async ({ integrationId, integrationData }) => {
    const response = await api.put(`/integrations/${integrationId}`, integrationData);
    return response.data;
  },

  // Delete integration
  deleteIntegration: async (integrationId) => {
    const response = await api.delete(`/integrations/${integrationId}`);
    return response.data;
  },

  // Test integration connection
  testIntegration: async (integrationId) => {
    const response = await api.post(`/integrations/${integrationId}/test`);
    return response.data;
  },

  // Enable/disable integration
  toggleIntegration: async ({ integrationId, enabled }) => {
    const response = await api.patch(`/integrations/${integrationId}/toggle`, { enabled });
    return response.data;
  },

  // Get integration logs
  getIntegrationLogs: async ({ integrationId, limit = 50, offset = 0 } = {}) => {
    const response = await api.get(`/integrations/${integrationId}/logs?limit=${limit}&offset=${offset}`);
    return response.data;
  },

  // Get integration statistics
  getIntegrationStats: async (integrationId) => {
    const response = await api.get(`/integrations/${integrationId}/stats`);
    return response.data;
  },

  // Sync integration data
  syncIntegration: async (integrationId) => {
    const response = await api.post(`/integrations/${integrationId}/sync`);
    return response.data;
  },

  // Get available integration types
  getIntegrationTypes: async () => {
    const response = await api.get('/integrations/types');
    return response.data;
  },

  // Get integration configuration schema
  getIntegrationSchema: async (integrationType) => {
    const response = await api.get(`/integrations/schema/${integrationType}`);
    return response.data;
  },

  // Validate integration configuration
  validateIntegrationConfig: async (integrationType, config) => {
    const response = await api.post(`/integrations/validate/${integrationType}`, config);
    return response.data;
  },

  // ServiceNow specific APIs
  servicenow: {
    // Get ServiceNow tickets
    getTickets: async (params = {}) => {
      const response = await api.get('/integrations/servicenow/tickets', { params });
      return response.data;
    },

    // Create ServiceNow ticket
    createTicket: async (ticketData) => {
      const response = await api.post('/integrations/servicenow/tickets', ticketData);
      return response.data;
    },

    // Update ServiceNow ticket
    updateTicket: async ({ ticketId, ticketData }) => {
      const response = await api.put(`/integrations/servicenow/tickets/${ticketId}`, ticketData);
      return response.data;
    }
  },

  // Jira specific APIs
  jira: {
    // Get Jira issues
    getIssues: async (params = {}) => {
      const response = await api.get('/integrations/jira/issues', { params });
      return response.data;
    },

    // Create Jira issue
    createIssue: async (issueData) => {
      const response = await api.post('/integrations/jira/issues', issueData);
      return response.data;
    },

    // Update Jira issue
    updateIssue: async ({ issueId, issueData }) => {
      const response = await api.put(`/integrations/jira/issues/${issueId}`, issueData);
      return response.data;
    }
  },

  // Zendesk specific APIs
  zendesk: {
    // Get Zendesk tickets
    getTickets: async (params = {}) => {
      const response = await api.get('/integrations/zendesk/tickets', { params });
      return response.data;
    },

    // Create Zendesk ticket
    createTicket: async (ticketData) => {
      const response = await api.post('/integrations/zendesk/tickets', ticketData);
      return response.data;
    },

    // Update Zendesk ticket
    updateTicket: async ({ ticketId, ticketData }) => {
      const response = await api.put(`/integrations/zendesk/tickets/${ticketId}`, ticketData);
      return response.data;
    }
  },

  // Remedy specific APIs
  remedy: {
    // Get Remedy tickets
    getTickets: async (params = {}) => {
      const response = await api.get('/integrations/remedy/tickets', { params });
      return response.data;
    },

    // Create Remedy ticket
    createTicket: async (ticketData) => {
      const response = await api.post('/integrations/remedy/tickets', ticketData);
      return response.data;
    },

    // Update Remedy ticket
    updateTicket: async ({ ticketId, ticketData }) => {
      const response = await api.put(`/integrations/remedy/tickets/${ticketId}`, ticketData);
      return response.data;
    }
  }
};
