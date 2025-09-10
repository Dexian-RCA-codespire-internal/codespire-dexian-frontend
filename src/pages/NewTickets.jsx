import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { Checkbox } from '../components/ui/checkbox'
import { FiSearch, FiFilter, FiClock, FiAlertTriangle, FiCheckCircle, FiXCircle, FiChevronDown, FiRefreshCw } from 'react-icons/fi'
import { motion } from 'framer-motion'

const NewTickets = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [filters, setFilters] = useState({
    priorities: [],
    systems: [],
    categories: []
  })

  // Sample ticket data based on your provided structure
  const tickets = [
    {
      ticketId: "INC0012345",
      system: "servicenow",
      title: "Server Down - Production Issue",
      description: "Production server is not responding to requests",
      status: "open",
      priority: "P1",
      internalId: "TKT-1",
      category: "Hardware",
      createdDate: "2024-01-17T10:30:00Z"
    },
    {
      ticketId: "INC0012346",
      system: "jira",
      title: "Database Connection Timeout",
      description: "Users experiencing slow database queries and timeouts",
      status: "open",
      priority: "P1",
      internalId: "TKT-2",
      category: "Database",
      createdDate: "2024-01-17T09:15:00Z"
    },
    {
      ticketId: "INC0012347",
      system: "zendesk",
      title: "Login Authentication Failed",
      description: "Multiple users unable to login to the application",
      status: "open",
      priority: "P2",
      internalId: "TKT-3",
      category: "Authentication",
      createdDate: "2024-01-17T08:45:00Z"
    },
    {
      ticketId: "INC0012348",
      system: "remedy",
      title: "API Rate Limiting Issues",
      description: "Third-party API calls are being rate limited",
      status: "open",
      priority: "P3",
      internalId: "TKT-4",
      category: "Integration",
      createdDate: "2024-01-16T16:20:00Z"
    },
    {
      ticketId: "INC0012349",
      system: "servicenow",
      title: "Memory Leak in Application",
      description: "Application consuming excessive memory over time",
      status: "open",
      priority: "P1",
      internalId: "TKT-5",
      category: "Software",
      createdDate: "2024-01-16T14:10:00Z"
    },
    {
      ticketId: "INC0012350",
      system: "jira",
      title: "SSL Certificate Expiration",
      description: "SSL certificate for production domain expires soon",
      status: "open",
      priority: "P1",
      internalId: "TKT-6",
      category: "Security",
      createdDate: "2024-01-16T11:30:00Z"
    }
  ]

  // Filter options
  const priorityOptions = ['P1', 'P2', 'P3']
  const systemOptions = ['servicenow', 'jira', 'zendesk', 'remedy']
  const categoryOptions = ['Hardware', 'Database', 'Authentication', 'Integration', 'Software', 'Security']

  // Filter handlers
  const handleFilter = (filterType, value, checked) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: checked 
        ? [...prev[filterType], value]
        : prev[filterType].filter(item => item !== value)
    }))
  }

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      priorities: [],
      systems: [],
      categories: []
    })
  }

  // Check if any filters are active
  const hasActiveFilters = filters.priorities.length > 0 || 
                          filters.systems.length > 0 || filters.categories.length > 0

  // Filter tickets based on search and filters
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesPriority = filters.priorities.length === 0 || filters.priorities.includes(ticket.priority)
    const matchesSystem = filters.systems.length === 0 || filters.systems.includes(ticket.system)
    const matchesCategory = filters.categories.length === 0 || filters.categories.includes(ticket.category)
    
    return matchesSearch && matchesPriority && matchesSystem && matchesCategory
  })

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'P1': return 'bg-red-100 text-red-800'
      case 'P2': return 'bg-yellow-100 text-yellow-800'
      case 'P3': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Get status color and icon
  const getStatusInfo = (status) => {
    switch (status) {
      case 'open': return { color: 'bg-blue-100 text-blue-800', icon: FiAlertTriangle }
      case 'in_progress': return { color: 'bg-yellow-100 text-yellow-800', icon: FiClock }
      case 'resolved': return { color: 'bg-green-100 text-green-800', icon: FiCheckCircle }
      case 'closed': return { color: 'bg-gray-100 text-gray-800', icon: FiXCircle }
      default: return { color: 'bg-gray-100 text-gray-800', icon: FiAlertTriangle }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">View Tickets</h1>
              <p className="text-lg text-gray-600 mt-2">Monitor and manage incoming tickets from various systems</p>
            </div>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => window.location.reload()}
            >
              <FiRefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Tickets</p>
                  <p className="text-3xl font-bold text-gray-900">{tickets.length}</p>
                </div>
                <FiAlertTriangle className="text-2xl text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Open Tickets</p>
                  <p className="text-3xl font-bold text-gray-900">{tickets.filter(t => t.status === 'open').length}</p>
                </div>
                <FiClock className="text-2xl text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">P1 Priority</p>
                  <p className="text-3xl font-bold text-gray-900">{tickets.filter(t => t.priority === 'P1').length}</p>
                </div>
                <FiAlertTriangle className="text-2xl text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">P2 Priority</p>
                  <p className="text-3xl font-bold text-gray-900">{tickets.filter(t => t.priority === 'P2').length}</p>
                </div>
                <FiAlertTriangle className="text-2xl text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Section */}
        <Card className="bg-white shadow-sm mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="Search tickets by title, ID, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <Button 
                variant="outline" 
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="flex items-center gap-2"
              >
                <FiFilter className="w-4 h-4" />
                Filter
                <FiChevronDown className={`w-4 h-4 transition-transform ${showFilterDropdown ? 'rotate-180' : ''}`} />
              </Button>
            </div>

            {/* Filter Dropdown */}
            {showFilterDropdown && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Priority Filter */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Priority</h3>
                    <div className="space-y-2">
                      {priorityOptions.map((priority) => (
                        <div key={priority} className="flex items-center space-x-2">
                          <Checkbox
                            id={`priority-${priority}`}
                            checked={filters.priorities.includes(priority)}
                            onCheckedChange={(checked) => handleFilter('priorities', priority, checked)}
                          />
                          <label htmlFor={`priority-${priority}`} className="text-sm text-gray-700 capitalize">
                            {priority}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* System Filter */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">System</h3>
                    <div className="space-y-2">
                      {systemOptions.map((system) => (
                        <div key={system} className="flex items-center space-x-2">
                          <Checkbox
                            id={`system-${system}`}
                            checked={filters.systems.includes(system)}
                            onCheckedChange={(checked) => handleFilter('systems', system, checked)}
                          />
                          <label htmlFor={`system-${system}`} className="text-sm text-gray-700 capitalize">
                            {system}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Category Filter */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Category</h3>
                    <div className="space-y-2">
                      {categoryOptions.map((category) => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox
                            id={`category-${category}`}
                            checked={filters.categories.includes(category)}
                            onCheckedChange={(checked) => handleFilter('categories', category, checked)}
                          />
                          <label htmlFor={`category-${category}`} className="text-sm text-gray-700">
                            {category}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {hasActiveFilters && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <Button variant="outline" onClick={clearAllFilters}>
                      Clear All Filters
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tickets Table */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Ticket ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Issue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    System
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTickets.map((ticket, index) => {
                  const statusInfo = getStatusInfo(ticket.status)
                  const StatusIcon = statusInfo.icon
                  
                  return (
                    <motion.tr
                      key={ticket.ticketId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {ticket.ticketId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {ticket.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={`${getPriorityColor(ticket.priority)} border-0 font-medium`}>
                          {ticket.priority}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {ticket.system}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline" className="text-xs px-2 py-1">
                            View
                          </Button>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1">
                            Process
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden">
            {filteredTickets.map((ticket, index) => {
              const statusInfo = getStatusInfo(ticket.status)
              const StatusIcon = statusInfo.icon
              
              return (
                <motion.div
                  key={ticket.ticketId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="border-b border-gray-200 p-4 last:border-b-0"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-xs text-gray-500">Ticket ID:</span>
                          <p className="text-sm font-medium text-gray-900">{ticket.ticketId}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Issue:</span>
                          <p className="text-sm text-gray-500">{ticket.title}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1 ml-2">
                      <Badge className={`${getPriorityColor(ticket.priority)} border-0 font-medium`}>
                        {ticket.priority}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="mb-3 text-sm">
                    <div>
                      <span className="text-gray-500">System:</span>
                      <span className="ml-1 font-medium text-gray-900">{ticket.system}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {new Date(ticket.createdDate).toLocaleDateString()}
                    </span>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline" className="text-xs px-2 py-1">
                        View
                      </Button>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1">
                        Process
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {filteredTickets.length === 0 && (
          <div className="text-center py-12">
            <FiSearch className="text-4xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
            <p className="text-gray-500">
              {hasActiveFilters 
                ? 'Try adjusting your filters or search terms'
                : 'No tickets match your search criteria'
              }
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearAllFilters} className="mt-4">
                Clear All Filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default NewTickets
