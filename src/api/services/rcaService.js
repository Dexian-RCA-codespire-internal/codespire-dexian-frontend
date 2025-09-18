import api from '../index.js';

// RCA (Root Cause Analysis) API services
export const rcaService = {
  // Fetch all RCA cases with pagination
  fetchRCACases: async ({ page = 1, limit = 20, status = '', priority = '', search = '' } = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status }),
      ...(priority && { priority }),
      ...(search && { search })
    });
    const response = await api.get(`/rca/cases?${params}`);
    return response.data;
  },

  // Fetch single RCA case by ID
  fetchRCACaseById: async (caseId) => {
    const response = await api.get(`/rca/cases/${caseId}`);
    return response.data;
  },

  // Create new RCA case
  createRCACase: async (caseData) => {
    const response = await api.post('/rca/cases', caseData);
    return response.data;
  },

  // Update RCA case
  updateRCACase: async ({ caseId, caseData }) => {
    const response = await api.put(`/rca/cases/${caseId}`, caseData);
    return response.data;
  },

  // Delete RCA case
  deleteRCACase: async (caseId) => {
    const response = await api.delete(`/rca/cases/${caseId}`);
    return response.data;
  },

  // Update RCA case status
  updateRCACaseStatus: async ({ caseId, status, notes }) => {
    const response = await api.patch(`/rca/cases/${caseId}/status`, { status, notes });
    return response.data;
  },

  // Assign RCA case to user
  assignRCACase: async ({ caseId, assignedTo }) => {
    const response = await api.patch(`/rca/cases/${caseId}/assign`, { assignedTo });
    return response.data;
  },

  // Get RCA case timeline
  getRCACaseTimeline: async (caseId) => {
    const response = await api.get(`/rca/cases/${caseId}/timeline`);
    return response.data;
  },

  // Add comment to RCA case
  addRCACaseComment: async ({ caseId, comment }) => {
    const response = await api.post(`/rca/cases/${caseId}/comments`, { comment });
    return response.data;
  },

  // Get RCA case comments
  getRCACaseComments: async (caseId) => {
    const response = await api.get(`/rca/cases/${caseId}/comments`);
    return response.data;
  },

  // Get RCA statistics
  getRCAStats: async () => {
    const response = await api.get('/rca/stats');
    return response.data;
  },

  // Get RCA workflow steps
  getRCAWorkflow: async (caseId) => {
    const response = await api.get(`/rca/cases/${caseId}/workflow`);
    return response.data;
  },

  // Update RCA workflow step
  updateRCAWorkflowStep: async ({ caseId, stepId, stepData }) => {
    const response = await api.put(`/rca/cases/${caseId}/workflow/${stepId}`, stepData);
    return response.data;
  },

  // Complete RCA case
  completeRCACase: async ({ caseId, resolution, recommendations }) => {
    const response = await api.post(`/rca/cases/${caseId}/complete`, { resolution, recommendations });
    return response.data;
  },

  // Get RCA case attachments
  getRCACaseAttachments: async (caseId) => {
    const response = await api.get(`/rca/cases/${caseId}/attachments`);
    return response.data;
  },

  // Upload attachment to RCA case
  uploadRCACaseAttachment: async ({ caseId, file }) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/rca/cases/${caseId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Delete RCA case attachment
  deleteRCACaseAttachment: async ({ caseId, attachmentId }) => {
    const response = await api.delete(`/rca/cases/${caseId}/attachments/${attachmentId}`);
    return response.data;
  }
};
