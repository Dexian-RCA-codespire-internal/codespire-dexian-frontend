// SLA management API services
import moment from 'moment-timezone'
import api from '../index.js'

export const slaService = {
  // Fetch SLA records from backend API with pagination and filtering
  getSLAs: async (params = {}) => {
    try {
      const apiParams = {
        page: params.page || 1,
        limit: params.limit || 15, // Default to 15 items per page
        ...(params.priority && params.priority !== 'All' && { priority: params.priority }),
        ...(params.status && params.status !== 'All' && { status: params.status }),
        ...(params.source && params.source !== 'All' && { source: params.source }),
        ...(params.slaStatus && params.slaStatus !== 'All' && { slaStatus: params.slaStatus }),
        ...(params.assignedTo && params.assignedTo !== 'All' && { assignedTo: params.assignedTo }),
        ...(params.searchTerm && { searchTerm: params.searchTerm }),
        ...(params.sortBy && { sortBy: params.sortBy }),
        ...(params.sortOrder && { sortOrder: params.sortOrder }),
        ...(params.startDate && { startDate: params.startDate }),
        ...(params.endDate && { endDate: params.endDate })
      };
      
      console.log('📡 SLA API call params:', apiParams); // Debug log
      
      const response = await api.get('/sla', { params: apiParams });
      return response.data;
    } catch (error) {
      console.error('❌ SLA API call failed:', error.message);
      throw error
    }
  },

  // Get SLA statistics from backend
  getSLAStats: async () => {
    const response = await api.get('/sla/stats');
    return response.data;
  },

  // Get SLA record by ticket ID
  getSLAByTicketId: async (ticketId, source = 'ServiceNow') => {
    const response = await api.get(`/sla/ticket/${ticketId}`, {
      params: { source }
    });
    return response.data;
  },

  // Delete SLA record by ticket ID
  deleteSLAByTicketId: async (ticketId, source = 'ServiceNow') => {
    const response = await api.delete(`/sla/ticket/${ticketId}`, {
      params: { source }
    });
    return response.data;
  },

  // Get SLA metrics with enhanced calculations
  getSLAMetrics: async (params = {}) => {
    try {
      // Fetch all SLA records
      const slaResponse = await slaService.getSLAs({
        limit: 1000, // Get all records for accurate calculations
        ...params
      });

      if (!slaResponse.success || !slaResponse.slas) {
        throw new Error('Failed to fetch SLA data');
      }

      const slas = slaResponse.slas;
      
      // Calculate metrics
      const totalTickets = slas.length;
      let breached = 0;
      let critical = 0;
      let warning = 0;
      let safe = 0;

      const currentTime = new Date();

      slas.forEach(sla => {
        // Skip completed tickets
        if (sla.status === 'Closed' || sla.status === 'Resolved') {
          return;
        }

        const slaInfo = calculateSLAStatus(sla.opened_time, sla.priority, sla.status, currentTime);
        
        switch (slaInfo.status) {
          case 'breached':
            breached++;
            break;
          case 'critical':
            critical++;
            break;
          case 'warning':
            warning++;
            break;
          case 'safe':
            safe++;
            break;
        }
      });

      return {
        success: true,
        data: {
          totalTickets,
          breached,
          critical,
          warning,
          safe,
          slas: slas.map(sla => ({
            ...sla,
            slaInfo: calculateSLAStatus(sla.opened_time, sla.priority, sla.status, currentTime)
          }))
        }
      };

    } catch (error) {
      console.error('Error calculating SLA metrics:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  },

  // Get SLA data with enhanced filtering for dashboard
  getSLADashboardData: async (filters = {}) => {
    try {
      const metricsResponse = await slaService.getSLAMetrics(filters);
      const statsResponse = await slaService.getSLAStats();

      return {
        success: true,
        data: {
          metrics: metricsResponse.data,
          statistics: statsResponse.data,
          summary: {
            totalTickets: metricsResponse.data?.totalTickets || 0,
            breached: metricsResponse.data?.breached || 0,
            critical: metricsResponse.data?.critical || 0,
            warning: metricsResponse.data?.warning || 0,
            safe: metricsResponse.data?.safe || 0,
            breachRate: metricsResponse.data?.totalTickets > 0 
              ? ((metricsResponse.data.breached / metricsResponse.data.totalTickets) * 100).toFixed(1)
              : 0
          }
        }
      };
    } catch (error) {
      console.error('Error fetching SLA dashboard data:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }
};

// Helper function to calculate SLA status
const calculateSLAStatus = (openedTime, priority, status, currentTime = new Date()) => {
  // SLA timelines based on priority (in hours)
  const SLA_TIMELINES = {
    'P1': 4,   // 4 hours for P1 (Critical)
    'P2': 12,  // 12 hours for P2 (High/Moderate)
    'P3': 24   // 24 hours for P3 (Low/Planning)
  };

  // If ticket is closed or resolved, no SLA calculation needed
  if (status === 'Closed' || status === 'Resolved') {
    return {
      timeLeft: 'Completed',
      isBreached: false,
      hoursLeft: 0,
      status: 'completed'
    };
  }

  const slaHours = SLA_TIMELINES[priority] || SLA_TIMELINES['P3'];
  
  // Use moment.js for proper date handling
  let openedMoment, currentMoment;
  
  // Handle MongoDB date object format
  if (typeof openedTime === 'object' && openedTime.$date) {
    openedMoment = moment.utc(openedTime.$date).tz('Asia/Kolkata');
  } else {
    openedMoment = moment.utc(openedTime).tz('Asia/Kolkata');
  }
  
  currentMoment = moment(currentTime).tz('Asia/Kolkata');
  
  if (!openedMoment.isValid() || !currentMoment.isValid()) {
    return {
      timeLeft: 'Invalid Date',
      isBreached: false,
      hoursLeft: 0,
      status: 'unknown'
    };
  }
  
  // Calculate SLA deadline
  const slaDeadline = openedMoment.clone().add(slaHours, 'hours');
  
  // Calculate time elapsed and remaining
  const timeElapsedMs = currentMoment.diff(openedMoment);
  const totalSLATimeMs = slaHours * 60 * 60 * 1000;
  
  // Calculate percentage of time that has elapsed
  const timeElapsedPercentage = timeElapsedMs / totalSLATimeMs;
  
  // If more than 100% time has elapsed, it's breached
  if (timeElapsedPercentage >= 1.0) {
    const overdueDuration = currentMoment.diff(slaDeadline);
    const hoursOverdue = Math.floor(overdueDuration / (1000 * 60 * 60));
    return {
      timeLeft: `Overdue by ${hoursOverdue}h`,
      isBreached: true,
      hoursLeft: -(hoursOverdue),
      status: 'breached'
    };
  }

  // Calculate time remaining
  const timeRemaining = totalSLATimeMs - timeElapsed;
  const hoursLeft = Math.floor(timeRemaining / (1000 * 60 * 60));
  const minutesLeft = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
  
  // Format time left
  let timeLeftString = '';
  if (hoursLeft > 0) {
    timeLeftString = `${hoursLeft}h ${minutesLeft}m`;
  } else {
    timeLeftString = `${minutesLeft}m`;
  }

  // Determine status based on elapsed percentage
  // Safe: 0-20%, Warning: 20-60%, Critical: 60-100%, Breached: >100%
  let statusType = 'safe';
  
  if (timeElapsedPercentage <= 0.2) { // 0-20% time elapsed
    statusType = 'safe';
  } else if (timeElapsedPercentage <= 0.6) { // 20-60% time elapsed
    statusType = 'warning';
  } else { // 60-100% time elapsed
    statusType = 'critical';
  }

  return {
    timeLeft: timeLeftString,
    isBreached: false,
    hoursLeft: hoursLeft,
    status: statusType
  };
};

export default slaService;