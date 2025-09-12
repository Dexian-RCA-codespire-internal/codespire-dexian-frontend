// new file servicenow
// Utility to get ticket data by ID - matches the data structure from RCADashboard

// This should match the rcaCases data from RCADashboard.jsx
const ticketDatabase = [
  {
    id: 'RCA-001',
    ticketId: 'INC0012345',
    title: 'Server Outage',
    source: 'Jira',
    system: 'E-commerce Platform',
    priority: 'P1',
    priorityColor: 'bg-red-100 text-red-800',
    progress: 20,
    progressColor: 'bg-red-500',
    daysOpen: 3,
    stage: 'Investigation',
    createdDate: '2024-01-15'
  },
  {
    id: 'RCA-002',
    ticketId: 'INC0012346',
    title: 'Payment Failure',
    source: 'Servicenow',
    system: 'Payment Gateway',
    priority: 'P1',
    priorityColor: 'bg-red-100 text-red-800',
    progress: 40,
    progressColor: 'bg-red-500',
    daysOpen: 5,
    stage: 'Analysis',
    createdDate: '2024-01-13'
  },
  {
    id: 'RCA-003',
    ticketId: 'INC0012347',
    title: 'Data Sync Issue',
    source: 'Jira',
    system: 'CRM System',
    priority: 'P2',
    priorityColor: 'bg-yellow-100 text-yellow-800',
    progress: 50,
    progressColor: 'bg-yellow-500',
    daysOpen: 8,
    stage: 'Analysis',
    createdDate: '2024-01-10'
  },
  {
    id: 'RCA-004',
    ticketId: 'INC0012348',
    title: 'Login Errors',
    source: 'Zendesk',
    system: 'User Portal',
    priority: 'P1',
    priorityColor: 'bg-red-100 text-red-800',
    progress: 60,
    progressColor: 'bg-red-500',
    daysOpen: 2,
    stage: 'Resolution',
    createdDate: '2024-01-16'
  },
  {
    id: 'RCA-005',
    ticketId: 'INC0012349',
    title: 'Page Load Slowness',
    source: 'Remedy',
    system: 'Web Application',
    priority: 'P2',
    priorityColor: 'bg-yellow-100 text-yellow-800',
    progress: 70,
    progressColor: 'bg-yellow-500',
    daysOpen: 12,
    stage: 'Resolution',
    createdDate: '2024-01-06'
  },
  {
    id: 'RCA-006',
    ticketId: 'INC0012350',
    title: 'Report Generation Bug',
    source: 'Zendesk',
    system: 'Reporting System',
    priority: 'P3',
    priorityColor: 'bg-green-100 text-green-800',
    progress: 100,
    progressColor: 'bg-green-500',
    daysOpen: 1,
    stage: 'Compliant',
    createdDate: '2024-01-17'
  },
  {
    id: 'RCA-007',
    ticketId: 'INC0012351',
    title: 'Database Connection Pool Exhaustion',
    source: 'Jira',
    system: 'Customer Portal',
    priority: 'P1',
    priorityColor: 'bg-red-100 text-red-800',
    progress: 25,
    progressColor: 'bg-red-500',
    daysOpen: 4,
    stage: 'Investigation',
    createdDate: '2024-01-14'
  },
  {
    id: 'RCA-008',
    ticketId: 'INC0012352',
    title: 'API Rate Limiting Issues',
    source: 'ServiceNow',
    system: 'Integration Platform',
    priority: 'P1',
    priorityColor: 'bg-red-100 text-red-800',
    progress: 60,
    progressColor: 'bg-red-500',
    daysOpen: 6,
    stage: 'Analysis',
    createdDate: '2024-01-12'
  },
  {
    id: 'RCA-009',
    ticketId: 'INC0012353',
    title: 'Memory Leak in Background Jobs',
    source: 'Remedy',
    system: 'Data Processing Engine',
    priority: 'P2',
    priorityColor: 'bg-yellow-100 text-yellow-800',
    progress: 80,
    progressColor: 'bg-yellow-500',
    daysOpen: 9,
    stage: 'Resolution',
    createdDate: '2024-01-09'
  },
  {
    id: 'RCA-010',
    ticketId: 'INC0012354',
    title: 'SSL Certificate Expiration',
    source: 'Zendesk',
    system: 'External API Gateway',
    priority: 'P1',
    priorityColor: 'bg-red-100 text-red-800',
    progress: 90,
    progressColor: 'bg-red-500',
    daysOpen: 2,
    stage: 'Resolution',
    createdDate: '2024-01-16'
  },
  {
    id: 'RCA-011',
    ticketId: 'INC0012355',
    title: 'User Session Timeout Problems',
    source: 'Jira',
    system: 'Authentication Service',
    priority: 'P2',
    priorityColor: 'bg-yellow-100 text-yellow-800',
    progress: 45,
    progressColor: 'bg-yellow-500',
    daysOpen: 7,
    stage: 'Analysis',
    createdDate: '2024-01-11'
  },
  {
    id: 'RCA-012',
    ticketId: 'INC0012356',
    title: 'File Upload Size Limit Exceeded',
    source: 'ServiceNow',
    system: 'Document Management',
    priority: 'P3',
    priorityColor: 'bg-green-100 text-green-800',
    progress: 100,
    progressColor: 'bg-green-500',
    daysOpen: 1,
    stage: 'Compliant',
    createdDate: '2024-01-17'
  }
]

// Function to get ticket data by RCA ID
export const getTicketById = (rcaId) => {
  return ticketDatabase.find(ticket => ticket.id === rcaId) || null
}

// Function to get ticket data by ticket ID
export const getTicketByTicketId = (ticketId) => {
  return ticketDatabase.find(ticket => ticket.ticketId === ticketId) || null
}

// Function to get all tickets
export const getAllTickets = () => {
  return ticketDatabase
}

// Function to get tickets by stage
export const getTicketsByStage = (stage) => {
  return ticketDatabase.filter(ticket => ticket.stage === stage)
}

// Function to get tickets by priority
export const getTicketsByPriority = (priority) => {
  return ticketDatabase.filter(ticket => ticket.priority === priority)
}

// Function to get tickets by source
export const getTicketsBySource = (source) => {
  return ticketDatabase.filter(ticket => ticket.source === source)
}

export default {
  getTicketById,
  getTicketByTicketId,
  getAllTickets,
  getTicketsByStage,
  getTicketsByPriority,
  getTicketsBySource,
  ticketDatabase
}
