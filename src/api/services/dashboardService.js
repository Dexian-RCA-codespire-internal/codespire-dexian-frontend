import api from '../index.js';

// Dashboard API services
export const dashboardService = {
  // Get dashboard overview data
  getDashboardOverview: async () => {
    const response = await api.get('/dashboard/overview');
    return response.data;
  },

  // Get dashboard statistics
  getDashboardStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  // Get recent activities
  getRecentActivities: async ({ limit = 10 } = {}) => {
    const response = await api.get(`/dashboard/activities?limit=${limit}`);
    return response.data;
  },

  // Get performance metrics
  getPerformanceMetrics: async ({ period = '7d' } = {}) => {
    const response = await api.get(`/dashboard/metrics?period=${period}`);
    return response.data;
  },

  // Get alert correlation data
  getAlertCorrelation: async ({ startDate, endDate } = {}) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const response = await api.get(`/dashboard/alert-correlation?${params}`);
    return response.data;
  },

  // Get pattern detection data
  getPatternDetection: async ({ timeRange = '24h' } = {}) => {
    const response = await api.get(`/dashboard/pattern-detection?timeRange=${timeRange}`);
    return response.data;
  },

  // Get compliance audit data
  getComplianceAudit: async ({ clientId, dateRange } = {}) => {
    const params = new URLSearchParams();
    if (clientId) params.append('clientId', clientId);
    if (dateRange) params.append('dateRange', dateRange);
    const response = await api.get(`/dashboard/compliance-audit?${params}`);
    return response.data;
  },

  // Get investigation data
  getInvestigationData: async ({ status = 'active' } = {}) => {
    const response = await api.get(`/dashboard/investigations?status=${status}`);
    return response.data;
  },

  // Get resolution data
  getResolutionData: async ({ period = '30d' } = {}) => {
    const response = await api.get(`/dashboard/resolutions?period=${period}`);
    return response.data;
  },

  // Get AI RCA guidance data
  getAIRCAGuidance: async ({ caseId } = {}) => {
    const params = new URLSearchParams();
    if (caseId) params.append('caseId', caseId);
    const response = await api.get(`/dashboard/ai-rca-guidance?${params}`);
    return response.data;
  },

  // Get playbook recommendations
  getPlaybookRecommendations: async ({ category, priority } = {}) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (priority) params.append('priority', priority);
    const response = await api.get(`/dashboard/playbook-recommendations?${params}`);
    return response.data;
  },

  // Get customer RCA summary
  getCustomerRCASummary: async ({ clientId, dateRange } = {}) => {
    const params = new URLSearchParams();
    if (clientId) params.append('clientId', clientId);
    if (dateRange) params.append('dateRange', dateRange);
    const response = await api.get(`/dashboard/customer-rca-summary?${params}`);
    return response.data;
  },

  // Get dashboard widgets configuration
  getDashboardWidgets: async () => {
    const response = await api.get('/dashboard/widgets');
    return response.data;
  },

  // Update dashboard widgets configuration
  updateDashboardWidgets: async (widgetsConfig) => {
    const response = await api.put('/dashboard/widgets', widgetsConfig);
    return response.data;
  },

  // Get dashboard filters
  getDashboardFilters: async () => {
    const response = await api.get('/dashboard/filters');
    return response.data;
  },

  // Save dashboard filters
  saveDashboardFilters: async (filters) => {
    const response = await api.post('/dashboard/filters', filters);
    return response.data;
  }
};
