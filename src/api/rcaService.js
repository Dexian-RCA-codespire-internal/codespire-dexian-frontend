// new file servicenow
import api from './index.js'

// Fetch tickets from backend API with pagination
export const getTickets = async (params = {}) => {
  try {
    // Ensure proper parameter mapping for the API
    const apiParams = {
      page: params.page || 1,
      limit: params.limit || 10
    }
    const response = await api.get('/v1/tickets', { params: apiParams })
    return response.data
  } catch (error) {
    console.error('Error fetching tickets:', error)
    throw error
  }
}

// Transform backend ticket data to frontend format
export const transformTicketToRCACase = (ticket) => {
  // Calculate days open
  const daysOpen = ticket.opened_time 
    ? Math.floor((new Date() - new Date(ticket.opened_time)) / (1000 * 60 * 60 * 24))
    : 0
  
  // Determine RCA stage based on ticket status
  const getRCAStage = (status) => {
    switch (status) {
      case 'New':
      case 'Open':
        return 'Investigation'
      case 'In Progress':
      case 'Assigned':
        return 'Analysis'
      case 'Resolved':
        return 'Resolution'
      case 'Closed':
        return 'Compliant'
      default:
        return 'Investigation'
    }
  }
  
  // Determine progress based on stage
  const getProgress = (stage) => {
    switch (stage) {
      case 'Investigation': return 20
      case 'Analysis': return 50
      case 'Resolution': return 80
      case 'Compliant': return 100
      default: return 0
    }
  }
  
  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'P1':
      case '1 - Critical':
        return 'bg-red-100 text-red-800'
      case 'P2':
      case '2 - High':
        return 'bg-orange-100 text-orange-800'
      case 'P3':
      case '3 - Moderate':
        return 'bg-yellow-100 text-yellow-800'
      case 'P4':
      case '4 - Low':
        return 'bg-blue-100 text-blue-800'
      case 'P5':
      case '5 - Planning':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
  
  // Get progress color
  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500'
    if (progress >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }
  
  const stage = getRCAStage(ticket.status)
  const progress = getProgress(stage)
  
  return {
    id: ticket._id, // Use the _id from API response
    ticketId: ticket.ticket_id,
    title: ticket.short_description || 'No Title',
    source: ticket.source || 'ServiceNow',
    system: ticket.category || 'Unknown System',
    priority: ticket.priority || '5 - Planning',
    priorityColor: getPriorityColor(ticket.priority),
    progress: progress,
    progressColor: getProgressColor(progress),
    daysOpen: daysOpen,
    stage: stage,
    createdDate: ticket.opened_time ? new Date(ticket.opened_time).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    // Additional fields from backend
    description: ticket.description,
    status: ticket.status,
    impact: ticket.impact,
    urgency: ticket.urgency,
    category: ticket.category,
    subcategory: ticket.subcategory,
    assigned_to: ticket.assigned_to,
    assignment_group: ticket.assignment_group,
    tags: ticket.tags || [],
    opened_time: ticket.opened_time,
    closed_time: ticket.closed_time,
    resolved_time: ticket.resolved_time,
    // Additional fields from your API
    _id: ticket._id,
    company: ticket.company,
    requester: ticket.requester,
    location: ticket.location,
    raw: ticket.raw,
    // RCA Step Data (NEW)
    problem_step1: ticket.problem_step1,
    timeline_step2: ticket.timeline_step2,
    impact_step3: ticket.impact_step3,
    findings_step4: ticket.findings_step4,
    root_cause_step5: ticket.root_cause_step5,
    // Alternative step data structures
    stepData: ticket.stepData,
    steps: ticket.steps,
    rcaSteps: ticket.rcaSteps
  }
}