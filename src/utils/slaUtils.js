// SLA Utility Functions
import moment from 'moment-timezone'

/**
 * Convert UTC timestamp to Indian Standard Time (IST)
 * @param {string|Date|Object} utcTime - UTC timestamp (can be MongoDB date object, ISO string, or Date)
 * @returns {Date} Date converted to IST
 */
export const convertToIST = (utcTime) => {
  if (!utcTime) return null
  
  let inputDate;
  
  // Handle MongoDB date object format: { "$date": "2025-09-15T15:41:40.000Z" }
  if (typeof utcTime === 'object' && utcTime.$date) {
    inputDate = utcTime.$date
  } 
  // Handle regular Date object or ISO string
  else {
    inputDate = utcTime
  }
  
  // Use moment to properly handle timezone conversion
  const utcMoment = moment.utc(inputDate)
  if (!utcMoment.isValid()) {
    console.error('Invalid date provided to convertToIST:', utcTime)
    return null
  }
  
  // Convert to IST and return as JavaScript Date
  const istMoment = utcMoment.tz('Asia/Kolkata')
  return istMoment.toDate()
}

/**
 * Format IST date for display
 * @param {string|Date|Object} utcTime - UTC timestamp (can be MongoDB date object, ISO string, or Date)
 * @returns {string} Formatted IST date string
 */
export const formatISTDate = (utcTime) => {
  if (!utcTime) return 'N/A'
  
  let inputDate;
  
  // Handle MongoDB date object format
  if (typeof utcTime === 'object' && utcTime.$date) {
    inputDate = utcTime.$date
  } else {
    inputDate = utcTime
  }
  
  // Use moment for proper formatting
  const utcMoment = moment.utc(inputDate)
  if (!utcMoment.isValid()) {
    return 'Invalid Date'
  }
  
  // Convert to IST and format
  return utcMoment.tz('Asia/Kolkata').format('DD MMM YYYY, hh:mm a')
}

// Define SLA timelines based on priority (in hours)
// P1: 4 hours, P2: 12 hours, P3: 24 hours
export const SLA_TIMELINES = {
  'P1': 4,   // 4 hours for P1 (Critical)
  'P2': 12,  // 12 hours for P2 (High/Moderate) 
  'P3': 24   // 24 hours for P3 (Low/Planning)
}

/**
 * Calculate time left until SLA breach
 * @param {string} openedTime - ISO string of when ticket was opened (in IST or UTC)
 * @param {string} priority - Priority level (P1, P2, P3)
 * @param {string} status - Current ticket status
 * @returns {Object} - { timeLeft: string, isBreached: boolean, hoursLeft: number, status: string }
 */
export const calculateSLATimeLeft = (openedTime, priority, status) => {
  // If ticket is closed or resolved, no SLA calculation needed
  if (status === 'Closed' || status === 'Resolved') {
    return {
      timeLeft: 'Completed',
      isBreached: false,
      hoursLeft: 0,
      status: 'completed'
    }
  }

  // SLA targets based on priority (in hours)
  const slaTargets = {
    'P1': 4,
    'P2': 12,
    'P3': 24,
    'P1 - Critical': 4,
    'P2 - High': 12,
    'P3 - Medium': 24,
    'P4 - Low': 24,
    'Critical': 4,
    'High': 12,
    'Medium': 24,
    'Low': 24,
    '1': 4,
    '2': 12,
    '3': 24,
    '4': 24
  }

  const targetHours = slaTargets[priority] || 24 // Default 24 hours (P3)
  
  // Handle MongoDB date object format and convert to proper Date objects
  let openedMoment, currentMoment;
  
  if (typeof openedTime === 'object' && openedTime.$date) {
    openedMoment = moment.utc(openedTime.$date).tz('Asia/Kolkata')
  } else {
    openedMoment = moment.utc(openedTime).tz('Asia/Kolkata')
  }
  
  currentMoment = moment().tz('Asia/Kolkata')
  
  if (!openedMoment.isValid()) {
    console.error('❌ Invalid opened time:', openedTime)
    return {
      timeLeft: 'Invalid Date',
      isBreached: false,
      hoursLeft: 0,
      status: 'unknown'
    }
  }
  
  // Calculate SLA deadline
  const slaDeadline = openedMoment.clone().add(targetHours, 'hours')
  
  // Calculate time elapsed and remaining
  const timeElapsedMs = currentMoment.diff(openedMoment)
  const timeElapsedHours = timeElapsedMs / (1000 * 60 * 60)
  const totalSLATimeMs = targetHours * 60 * 60 * 1000
  
  // Calculate percentage of time that has elapsed
  const timeElapsedPercentage = timeElapsedMs / totalSLATimeMs
  
  // If more than 100% time has elapsed, it's breached
  if (timeElapsedPercentage >= 1.0) {
    const overdueDuration = currentMoment.diff(slaDeadline)
    const hoursOverdue = Math.floor(overdueDuration / (1000 * 60 * 60))
    const minutesOverdue = Math.floor((overdueDuration % (1000 * 60 * 60)) / (1000 * 60))
    
    let overdueString = ''
    if (hoursOverdue > 0) {
      overdueString = `${hoursOverdue}h ${minutesOverdue}m overdue`
    } else {
      overdueString = `${minutesOverdue}m overdue`
    }
    
    return {
      timeLeft: overdueString,
      isBreached: true,
      hoursLeft: -hoursOverdue,
      status: 'breached'
    }
  }

  // Calculate time remaining until deadline
  const timeRemainingMs = slaDeadline.diff(currentMoment)
  const hoursLeft = Math.floor(timeRemainingMs / (1000 * 60 * 60))
  const minutesLeft = Math.floor((timeRemainingMs % (1000 * 60 * 60)) / (1000 * 60))
  
  // Format time left display
  let timeLeftString = ''
  if (hoursLeft > 0) {
    timeLeftString = `${hoursLeft}h ${minutesLeft}m`
  } else {
    timeLeftString = `${minutesLeft}m`
  }

  // Determine status based on elapsed percentage
  // Safe: 0-20%, Warning: 20-60%, Critical: 60-100%, Breached: >100%
  let status_value = ''
  if (timeElapsedPercentage <= 0.2) { // 0-20% time elapsed
    status_value = 'safe'
  } else if (timeElapsedPercentage <= 0.6) { // 20-60% time elapsed
    status_value = 'warning'
  } else { // 60-100% time elapsed
    status_value = 'critical'
  }

  return {
    timeLeft: timeLeftString,
    isBreached: false,
    hoursLeft: hoursLeft,
    status: status_value
  }
}/**
 * Get SLA status color based on time left
 * @param {string} status - SLA status (safe, warning, critical, breached, completed)
 * @returns {string} - CSS class for styling
 */
export const getSLAStatusColor = (status) => {
  switch (status) {
    case 'safe':
      return 'text-green-600'
    case 'warning':
      return 'text-yellow-600'
    case 'critical':
      return 'text-orange-600'
    case 'breached':
      return 'text-red-600'
    case 'completed':
      return 'text-blue-600'
    default:
      return 'text-gray-600'
  }
}

/**
 * Get priority badge color
 * @param {string} priority - Priority level (P1, P2, P3)
 * @returns {string} - CSS class for styling
 */
export const getPriorityColor = (priority) => {
  switch (priority) {
    case 'P1':
      return 'bg-red-100 text-red-800'
    case 'P2':
      return 'bg-orange-100 text-orange-800'
    case 'P3':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

/**
 * Filter tickets that are approaching SLA or have breached SLA
 * @param {Array} tickets - Array of ticket objects
 * @returns {Array} - Filtered tickets with SLA information
 */
export const getTicketsWithSLAInfo = (tickets) => {
  return tickets.map(ticket => ({
    ...ticket,
    slaInfo: calculateSLATimeLeft(ticket.opened_time, ticket.priority, ticket.status)
  })).filter(ticket => ticket.slaInfo.status !== 'completed')
}

/**
 * Calculate comprehensive SLA metrics from tickets array
 * @param {Array} slaTickets - Array of SLA ticket objects
 * @returns {Object} - SLA metrics summary
 */
export const calculateSLAMetrics = (slaTickets) => {
  if (!slaTickets || slaTickets.length === 0) {
    return {
      totalTickets: 0,
      breached: 0,
      critical: 0,
      warning: 0,
      safe: 0,
      completed: 0,
      breachRate: 0,
      avgTimeToResolution: 0,
      p1Tickets: 0,
      p2Tickets: 0,
      p3Tickets: 0
    }
  }

  const metrics = {
    totalTickets: slaTickets.length,
    breached: 0,
    critical: 0,
    warning: 0,
    safe: 0,
    completed: 0,
    p1Tickets: 0,
    p2Tickets: 0,
    p3Tickets: 0
  }

  slaTickets.forEach(ticket => {
    if (ticket.slaInfo) {
      switch (ticket.slaInfo.status) {
        case 'breached':
          metrics.breached++
          break
        case 'critical':
          metrics.critical++
          break
        case 'warning':
          metrics.warning++
          break
        case 'safe':
          metrics.safe++
          break
        case 'completed':
          metrics.completed++
          break
      }
    }

    // Count by priority
    switch (ticket.priority) {
      case 'P1':
        metrics.p1Tickets++
        break
      case 'P2':
        metrics.p2Tickets++
        break
      case 'P3':
        metrics.p3Tickets++
        break
    }
  })

  // Calculate breach rate
  metrics.breachRate = metrics.totalTickets > 0 
    ? Math.round((metrics.breached / metrics.totalTickets) * 100) 
    : 0

  return metrics
}

/**
 * Get SLA status icon component name
 * @param {string} status - SLA status (safe, warning, critical, breached, completed)
 * @returns {string} - Icon name for UI rendering
 */
export const getSLAStatusIcon = (status) => {
  switch (status) {
    case 'safe':
      return 'CheckCircle'
    case 'warning':
      return 'Clock'
    case 'critical':
      return 'AlertTriangle'
    case 'breached':
      return 'AlertCircle'
    case 'completed':
      return 'CheckCircle'
    default:
      return 'Clock'
  }
}

/**
 * Format SLA deadline for display
 * @param {string|Object} openedTime - ISO string or MongoDB date object of when ticket was opened
 * @param {string} priority - Priority level (P1, P2, P3)
 * @returns {string} - Formatted deadline
 */
export const formatSLADeadline = (openedTime, priority) => {
  if (!openedTime || !priority) return 'N/A'

  const slaHours = SLA_TIMELINES[priority] || SLA_TIMELINES['P3']
  
  let openedMoment;
  
  // Handle MongoDB date object format
  if (typeof openedTime === 'object' && openedTime.$date) {
    openedMoment = moment.utc(openedTime.$date).tz('Asia/Kolkata')
  } else {
    openedMoment = moment.utc(openedTime).tz('Asia/Kolkata')
  }
  
  if (!openedMoment.isValid()) return 'N/A'
  
  // Calculate deadline by adding SLA hours
  const deadline = openedMoment.clone().add(slaHours, 'hours')
  
  return deadline.format('DD MMM YYYY, hh:mm a')
}

/**
 * Get SLA performance summary
 * @param {Object} metrics - SLA metrics object
 * @returns {Object} - Performance summary
 */
export const getSLAPerformanceSummary = (metrics) => {
  if (!metrics) return null

  const totalActive = metrics.totalTickets - metrics.completed
  const withinSLA = metrics.safe + metrics.warning + metrics.critical
  const complianceRate = totalActive > 0 ? Math.round((withinSLA / totalActive) * 100) : 100

  return {
    complianceRate,
    breachRate: metrics.breachRate,
    criticalCount: metrics.critical,
    warningCount: metrics.warning,
    totalActive,
    performance: complianceRate >= 95 ? 'excellent' : 
                 complianceRate >= 85 ? 'good' : 
                 complianceRate >= 75 ? 'fair' : 'poor'
  }
}