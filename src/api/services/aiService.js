import api from '../index.js';

// AI and Analytics API services
export const aiService = {
  // AI RCA Guidance
  rcaGuidance: {
    // Get AI recommendations for RCA case
    getRecommendations: async (caseId) => {
      const response = await api.get(`/ai/rca-guidance/${caseId}/recommendations`);
      return response.data;
    },

    // Generate AI insights for RCA case
    generateInsights: async (caseData) => {
      const response = await api.post('/ai/rca-guidance/insights', caseData);
      return response.data;
    },

    // Get AI-powered root cause suggestions
    getRootCauseSuggestions: async (caseId) => {
      const response = await api.get(`/ai/rca-guidance/${caseId}/root-cause-suggestions`);
      return response.data;
    },

    // Get AI recommendations for resolution
    getResolutionRecommendations: async (caseId) => {
      const response = await api.get(`/ai/rca-guidance/${caseId}/resolution-recommendations`);
      return response.data;
    },

    // Analyze case patterns
    analyzePatterns: async (caseData) => {
      const response = await api.post('/ai/rca-guidance/analyze-patterns', caseData);
      return response.data;
    }
  },

  // Pattern Detection
  patternDetection: {
    // Detect patterns in tickets/alerts
    detectPatterns: async (data) => {
      const response = await api.post('/ai/pattern-detection/detect', data);
      return response.data;
    },

    // Get pattern analysis results
    getPatternAnalysis: async ({ timeRange = '24h', source = '' } = {}) => {
      const params = new URLSearchParams();
      if (timeRange) params.append('timeRange', timeRange);
      if (source) params.append('source', source);
      const response = await api.get(`/ai/pattern-detection/analysis?${params}`);
      return response.data;
    },

    // Get pattern trends
    getPatternTrends: async ({ period = '7d' } = {}) => {
      const response = await api.get(`/ai/pattern-detection/trends?period=${period}`);
      return response.data;
    },

    // Create pattern alert
    createPatternAlert: async (patternData) => {
      const response = await api.post('/ai/pattern-detection/alerts', patternData);
      return response.data;
    }
  },

  // Alert Correlation
  alertCorrelation: {
    // Correlate alerts
    correlateAlerts: async (alertData) => {
      const response = await api.post('/ai/alert-correlation/correlate', alertData);
      return response.data;
    },

    // Get correlation results
    getCorrelationResults: async ({ startDate, endDate, threshold = 0.7 } = {}) => {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      params.append('threshold', threshold.toString());
      const response = await api.get(`/ai/alert-correlation/results?${params}`);
      return response.data;
    },

    // Get correlation rules
    getCorrelationRules: async () => {
      const response = await api.get('/ai/alert-correlation/rules');
      return response.data;
    },

    // Create correlation rule
    createCorrelationRule: async (ruleData) => {
      const response = await api.post('/ai/alert-correlation/rules', ruleData);
      return response.data;
    },

    // Update correlation rule
    updateCorrelationRule: async ({ ruleId, ruleData }) => {
      const response = await api.put(`/ai/alert-correlation/rules/${ruleId}`, ruleData);
      return response.data;
    },

    // Delete correlation rule
    deleteCorrelationRule: async (ruleId) => {
      const response = await api.delete(`/ai/alert-correlation/rules/${ruleId}`);
      return response.data;
    }
  },

  // Playbook Recommender
  playbookRecommender: {
    // Get playbook recommendations
    getRecommendations: async ({ category, priority, tags = [] } = {}) => {
      const response = await api.post('/ai/playbook-recommender/recommendations', {
        category,
        priority,
        tags
      });
      return response.data;
    },

    // Get all playbooks
    getPlaybooks: async () => {
      const response = await api.get('/ai/playbook-recommender/playbooks');
      return response.data;
    },

    // Get playbook by ID
    getPlaybookById: async (playbookId) => {
      const response = await api.get(`/ai/playbook-recommender/playbooks/${playbookId}`);
      return response.data;
    },

    // Create new playbook
    createPlaybook: async (playbookData) => {
      const response = await api.post('/ai/playbook-recommender/playbooks', playbookData);
      return response.data;
    },

    // Update playbook
    updatePlaybook: async ({ playbookId, playbookData }) => {
      const response = await api.put(`/ai/playbook-recommender/playbooks/${playbookId}`, playbookData);
      return response.data;
    },

    // Delete playbook
    deletePlaybook: async (playbookId) => {
      const response = await api.delete(`/ai/playbook-recommender/playbooks/${playbookId}`);
      return response.data;
    },

    // Rate playbook recommendation
    rateRecommendation: async ({ recommendationId, rating, feedback }) => {
      const response = await api.post('/ai/playbook-recommender/rate', {
        recommendationId,
        rating,
        feedback
      });
      return response.data;
    }
  },

  // Analytics and Insights
  analytics: {
    // Get AI insights dashboard
    getInsightsDashboard: async () => {
      const response = await api.get('/ai/analytics/insights-dashboard');
      return response.data;
    },

    // Get predictive analytics
    getPredictiveAnalytics: async ({ metric, timeRange = '30d' } = {}) => {
      const response = await api.get(`/ai/analytics/predictive?metric=${metric}&timeRange=${timeRange}`);
      return response.data;
    },

    // Get anomaly detection results
    getAnomalyDetection: async ({ startDate, endDate, threshold = 0.8 } = {}) => {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      params.append('threshold', threshold.toString());
      const response = await api.get(`/ai/analytics/anomaly-detection?${params}`);
      return response.data;
    },

    // Get performance predictions
    getPerformancePredictions: async ({ systemId, timeRange = '7d' } = {}) => {
      const response = await api.get(`/ai/analytics/performance-predictions?systemId=${systemId}&timeRange=${timeRange}`);
      return response.data;
    }
  },

  // Problem Statement Generation
  problemStatement: {
    // Generate AI-powered problem statement
    generate: async (ticketData) => {
      const response = await api.post('/v1/problem-statement/generate', ticketData);
      return response.data;
    }
  },

  // Timeline Context Generation
  timelineContext: {
    // Generate AI-powered timeline and context description
    generate: async (data) => {
      const response = await api.post('/v1/timeline-context/generate', data);
      return response.data;
    }
  },

  // Impact Assessment
  impactAssessment: {
    // Analyze impact assessment based on problem statement and timeline context
    analyze: async (data) => {
      const response = await api.post('/v1/impact-assessment/analyze', data);
      return response.data;
    }
  }
};
