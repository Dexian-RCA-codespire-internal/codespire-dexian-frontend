import api from '../index.js';

// Audit and Compliance API services
export const auditService = {
  // Get audit logs
  getAuditLogs: async ({ page = 1, limit = 20, startDate, endDate, action, userId } = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (action) params.append('action', action);
    if (userId) params.append('userId', userId);
    
    const response = await api.get(`/audit/logs?${params}`);
    return response.data;
  },

  // Get audit log by ID
  getAuditLogById: async (logId) => {
    const response = await api.get(`/audit/logs/${logId}`);
    return response.data;
  },

  // Create audit log entry
  createAuditLog: async (logData) => {
    const response = await api.post('/audit/logs', logData);
    return response.data;
  },

  // Get compliance audit data
  getComplianceAudit: async ({ clientId, dateRange, complianceType } = {}) => {
    const params = new URLSearchParams();
    if (clientId) params.append('clientId', clientId);
    if (dateRange) params.append('dateRange', dateRange);
    if (complianceType) params.append('complianceType', complianceType);
    
    const response = await api.get(`/audit/compliance?${params}`);
    return response.data;
  },

  // Get compliance report
  getComplianceReport: async ({ clientId, reportType, dateRange } = {}) => {
    const params = new URLSearchParams();
    if (clientId) params.append('clientId', clientId);
    if (reportType) params.append('reportType', reportType);
    if (dateRange) params.append('dateRange', dateRange);
    
    const response = await api.get(`/audit/compliance/report?${params}`);
    return response.data;
  },

  // Generate compliance report
  generateComplianceReport: async (reportData) => {
    const response = await api.post('/audit/compliance/generate-report', reportData);
    return response.data;
  },

  // Get compliance standards
  getComplianceStandards: async () => {
    const response = await api.get('/audit/compliance/standards');
    return response.data;
  },

  // Get compliance checklist
  getComplianceChecklist: async (standardId) => {
    const response = await api.get(`/audit/compliance/standards/${standardId}/checklist`);
    return response.data;
  },

  // Update compliance status
  updateComplianceStatus: async ({ itemId, status, notes }) => {
    const response = await api.patch(`/audit/compliance/items/${itemId}/status`, { status, notes });
    return response.data;
  },

  // Get audit statistics
  getAuditStats: async ({ period = '30d' } = {}) => {
    const response = await api.get(`/audit/stats?period=${period}`);
    return response.data;
  },

  // Get user activity logs
  getUserActivityLogs: async ({ userId, page = 1, limit = 20 } = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    const response = await api.get(`/audit/user-activity/${userId}?${params}`);
    return response.data;
  },

  // Get system audit logs
  getSystemAuditLogs: async ({ page = 1, limit = 20, systemId } = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    if (systemId) params.append('systemId', systemId);
    
    const response = await api.get(`/audit/system?${params}`);
    return response.data;
  },

  // Export audit logs
  exportAuditLogs: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/audit/export?${params}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Get audit configuration
  getAuditConfiguration: async () => {
    const response = await api.get('/audit/configuration');
    return response.data;
  },

  // Update audit configuration
  updateAuditConfiguration: async (config) => {
    const response = await api.put('/audit/configuration', config);
    return response.data;
  },

  // Get audit alerts
  getAuditAlerts: async ({ page = 1, limit = 20, severity } = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    if (severity) params.append('severity', severity);
    
    const response = await api.get(`/audit/alerts?${params}`);
    return response.data;
  },

  // Create audit alert
  createAuditAlert: async (alertData) => {
    const response = await api.post('/audit/alerts', alertData);
    return response.data;
  },

  // Update audit alert
  updateAuditAlert: async ({ alertId, alertData }) => {
    const response = await api.put(`/audit/alerts/${alertId}`, alertData);
    return response.data;
  },

  // Delete audit alert
  deleteAuditAlert: async (alertId) => {
    const response = await api.delete(`/audit/alerts/${alertId}`);
    return response.data;
  }
};
