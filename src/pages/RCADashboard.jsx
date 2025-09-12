import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Progress } from '../components/ui/progress'
import { Checkbox } from '../components/ui/checkbox'
import { FiSearch, FiMenu, FiCheck, FiAlertTriangle, FiClipboard, FiChevronDown, FiCreditCard, FiRefreshCw, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { getTickets, transformTicketToRCACase } from '../api/rcaService'

const RCADashboard = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const [apiTickets, setApiTickets] = useState([])
  const [pollingEnabled, setPollingEnabled] = useState(true)
  const [pollingInterval, setPollingInterval] = useState(30000) // 30 seconds
  const [lastUpdated, setLastUpdated] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })
  const [filters, setFilters] = useState({
    sources: [],
    priorities: [],
    dateRange: { startDate: '', endDate: '' },
    stages: []
  })
  const filterDropdownRef = useRef(null)

  // Handle click outside to close filter dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setShowFilterDropdown(false)
      }
    }

    if (showFilterDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showFilterDropdown])

  // Fetch tickets from API with pagination
  const fetchTickets = async (page = 1, limit = 10) => {
    try {
      setLoading(true)
      const response = await getTickets({ page, limit })
      
      if (response.success) {
        const tickets = response.data || []
        console.log('API Response:', response)
        console.log('Tickets received:', tickets.length)
        const transformedTickets = tickets.map(transformTicketToRCACase)
        setApiTickets(transformedTickets)
        
        setPagination({
          page: response.pagination.currentPage,
          limit: response.pagination.limit,
          total: response.pagination.totalCount,
          totalPages: response.pagination.totalPages,
          hasNext: response.pagination.hasNextPage,
          hasPrev: response.pagination.hasPrevPage
        })
        
        // Update last updated timestamp
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error('Error fetching tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  // Initial data fetch
  useEffect(() => {
    fetchTickets(1, 10)
  }, [])

  // Polling logic
  useEffect(() => {
    let intervalId
    
    if (pollingEnabled) {
      intervalId = setInterval(() => {
        console.log('Auto-refreshing tickets...')
        fetchTickets(pagination.page, pagination.limit)
      }, pollingInterval)
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [pollingEnabled, pollingInterval, pagination.page, pagination.limit])

  // Pagination handlers
  const handlePageChange = (newPage) => {
    fetchTickets(newPage, pagination.limit)
  }

  const handleLimitChange = (newLimit) => {
    fetchTickets(1, newLimit)
  }

  // Summary data - calculated from API tickets
  const summaryData = [
    {
      title: 'Total Tickets',
      value: pagination.total.toString(),
      subtitle: `${apiTickets.length} on current page`,
      subtitleColor: 'text-green-600',
      icon: <FiCreditCard className="text-2xl text-green-600" />,
      bgColor: 'bg-white',
      borderColor: 'border-gray-200'
    },
    {
      title: 'Active Tickets',
      value: apiTickets.filter(ticket => ticket.status && !['Closed', 'Resolved', 'Cancelled'].includes(ticket.status)).length.toString(),
      subtitle: 'Currently open',
      subtitleColor: 'text-blue-600',
      icon: <FiAlertTriangle className="text-2xl text-blue-600" />,
      bgColor: 'bg-white',
      borderColor: 'border-gray-200'
    },
    {
      title: 'High Priority',
      value: apiTickets.filter(ticket => ticket.priority === 'P1' || ticket.priority === '1 - Critical' || ticket.priority === '2 - High').length.toString(),
      subtitle: 'P1 & P2 tickets',
      subtitleColor: 'text-red-600',
      icon: <FiClipboard className="text-2xl text-red-600" />,
      bgColor: 'bg-white',
      borderColor: 'border-gray-200'
    },
    {
      title: 'Page Info',
      value: `${pagination.page}/${pagination.totalPages}`,
      subtitle: `${pagination.limit} per page`,
      subtitleColor: 'text-gray-600',
      icon: <FiCheck className="text-2xl text-gray-600" />,
      bgColor: 'bg-white',
      borderColor: 'border-gray-200'
    }
  ]

  // RCA Cases data - use API tickets or fallback to hardcoded data
  const rcaCases = apiTickets.length > 0 ? apiTickets : [
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

  // Filter options
  const sourceOptions = ['ServiceNow', 'Jira', 'Zendesk', 'Remedy']
  const priorityOptions = ['1 - Critical', '2 - High', '3 - Moderate', '4 - Low', '5 - Planning']
  const stageOptions = ['Investigation', 'Analysis', 'Resolution', 'Compliant']

  // Filter handlers
  const handleSourceFilter = (source, checked) => {
    setFilters(prev => ({
      ...prev,
      sources: checked 
        ? [...prev.sources, source]
        : prev.sources.filter(s => s !== source)
    }))
  }

  const handlePriorityFilter = (priority, checked) => {
    setFilters(prev => ({
      ...prev,
      priorities: checked 
        ? [...prev.priorities, priority]
        : prev.priorities.filter(p => p !== priority)
    }))
  }

  const handleDateRangeFilter = (field, value) => {
    setFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: value
      }
    }))
  }

  const handleStageFilter = (stage, checked) => {
    setFilters(prev => ({
      ...prev,
      stages: checked 
        ? [...prev.stages, stage]
        : prev.stages.filter(s => s !== stage)
    }))
  }

  // Generate search suggestions based on current data
  const generateSuggestions = (searchTerm) => {
    if (!searchTerm.trim()) return []
    
    const term = searchTerm.toLowerCase()
    const suggestions = []
    
    // Get unique values from all tickets
    const allTitles = [...new Set(rcaCases.map(c => c.title))]
    const allSystems = [...new Set(rcaCases.map(c => c.system))]
    const allSources = [...new Set(rcaCases.map(c => c.source))]
    const allStages = [...new Set(rcaCases.map(c => c.stage))]
    const allIds = [...new Set(rcaCases.map(c => c.id))]
    const allTicketIds = [...new Set(rcaCases.map(c => c.ticketId))]
    
    // Search in titles
    allTitles.forEach(title => {
      if (title.toLowerCase().includes(term)) {
        suggestions.push({ text: title, type: 'Title', field: 'title' })
      }
    })
    
    // Search in systems
    allSystems.forEach(system => {
      if (system.toLowerCase().includes(term)) {
        suggestions.push({ text: system, type: 'System', field: 'system' })
      }
    })
    
    // Search in sources
    allSources.forEach(source => {
      if (source.toLowerCase().includes(term)) {
        suggestions.push({ text: source, type: 'Source', field: 'source' })
      }
    })
    
    // Search in stages
    allStages.forEach(stage => {
      if (stage.toLowerCase().includes(term)) {
        suggestions.push({ text: stage, type: 'Stage', field: 'stage' })
      }
    })
    
    // Search in IDs
    allIds.forEach(id => {
      if (id.toLowerCase().includes(term)) {
        suggestions.push({ text: id, type: 'RCA ID', field: 'id' })
      }
    })
    
    // Search in Ticket IDs
    allTicketIds.forEach(ticketId => {
      if (ticketId.toLowerCase().includes(term)) {
        suggestions.push({ text: ticketId, type: 'Ticket ID', field: 'ticketId' })
      }
    })
    
    // Remove duplicates and limit to 8 suggestions
    const uniqueSuggestions = suggestions.filter((suggestion, index, self) => 
      index === self.findIndex(s => s.text === suggestion.text && s.type === suggestion.type)
    )
    
    return uniqueSuggestions.slice(0, 8)
  }

  // Function to highlight search terms in text
  const highlightText = (text, searchTerm) => {
    if (!searchTerm.trim()) return text
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : part
    )
  }

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      sources: [],
      priorities: [],
      dateRange: { startDate: '', endDate: '' },
      stages: []
    })
  }

  // Check if any filters are active
  const hasActiveFilters = filters.sources.length > 0 || filters.priorities.length > 0 || 
                          (filters.dateRange.startDate || filters.dateRange.endDate) || filters.stages.length > 0

  // Function to determine which stage page to navigate to
  const getStageNavigationPath = (stage, ticketId) => {
    switch (stage.toLowerCase()) {
      case 'investigation':
        return `/investigation/${ticketId}`
      case 'analysis':
        return `/analysis/${ticketId}`
      case 'resolution':
        return `/resolution/${ticketId}`
      case 'compliant':
        return `/complete-rca/${ticketId}` // For completed cases, go to Complete RCA page
      default:
        return `/complaint/${ticketId}` // Default to complaint page
    }
  }

  const filteredCases = rcaCases.filter(case_ => {
    const matchesSearch = case_.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         case_.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         case_.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         case_.source.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesSource = filters.sources.length === 0 || filters.sources.includes(case_.source)
    const matchesPriority = filters.priorities.length === 0 || filters.priorities.includes(case_.priority)
    
    // Date range filtering
    const matchesDateRange = () => {
      if (!filters.dateRange.startDate && !filters.dateRange.endDate) return true
      
      const caseDate = new Date(case_.createdDate)
      const startDate = filters.dateRange.startDate ? new Date(filters.dateRange.startDate) : null
      const endDate = filters.dateRange.endDate ? new Date(filters.dateRange.endDate) : null
      
      if (startDate && endDate) {
        return caseDate >= startDate && caseDate <= endDate
      } else if (startDate) {
        return caseDate >= startDate
      } else if (endDate) {
        return caseDate <= endDate
      }
      return true
    }
    
    const matchesStage = filters.stages.length === 0 || filters.stages.includes(case_.stage)
    
    return matchesSearch && matchesSource && matchesPriority && matchesDateRange() && matchesStage
  })

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">RCA Dashboard</h1>
            {pollingEnabled && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Auto-refresh every {pollingInterval / 1000}s</span>
              </div>
            )}
            {lastUpdated && (
              <div className="text-sm text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {/* Polling Controls */}
            <div className="flex items-center gap-2">
              <Button 
                variant={pollingEnabled ? "default" : "outline"}
                size="sm"
                onClick={() => setPollingEnabled(!pollingEnabled)}
                className="flex items-center gap-1"
              >
                <div className={`w-2 h-2 rounded-full ${pollingEnabled ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                {pollingEnabled ? 'Auto' : 'Manual'}
              </Button>
              <select
                value={pollingInterval}
                onChange={(e) => setPollingInterval(parseInt(e.target.value))}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                disabled={!pollingEnabled}
              >
                <option value={10000}>10s</option>
                <option value={30000}>30s</option>
                <option value={60000}>1m</option>
                <option value={300000}>5m</option>
              </select>
            </div>
            
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => fetchTickets(pagination.page, pagination.limit)}
              disabled={loading}
            >
              <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button variant="outline" size="sm">
              <FiMenu className="text-lg" />
            </Button>
          </div>
        </div>

        {/* Summary Cards Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {summaryData.map((item, index) => (
            <Card key={index} className={`${item.bgColor} ${item.borderColor} shadow-sm hover:shadow-md transition-shadow duration-200`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-2">{item.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mb-2">{item.value}</p>
                    <p className={`text-sm font-medium ${item.subtitleColor}`}>{item.subtitle}</p>
                  </div>
                  <div className="opacity-80">{item.icon}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>


        {/* Main Content Area */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Tickets {loading && <span className="text-sm text-gray-500">(Loading...)</span>}
            </h2>
            {hasActiveFilters && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {filters.sources.length > 0 && `${filters.sources.length} source${filters.sources.length > 1 ? 's' : ''} selected`}
                  {filters.sources.length > 0 && (filters.priorities.length > 0 || (filters.dateRange.startDate || filters.dateRange.endDate) || filters.stages.length > 0) && ', '}
                  {filters.priorities.length > 0 && `${filters.priorities.length} priorit${filters.priorities.length > 1 ? 'ies' : 'y'} selected`}
                  {filters.priorities.length > 0 && ((filters.dateRange.startDate || filters.dateRange.endDate) || filters.stages.length > 0) && ', '}
                  {(filters.dateRange.startDate || filters.dateRange.endDate) && 'date range selected'}
                  {(filters.dateRange.startDate || filters.dateRange.endDate) && filters.stages.length > 0 && ', '}
                  {filters.stages.length > 0 && `${filters.stages.length} stage${filters.stages.length > 1 ? 's' : ''} selected`}
                </span>
              </div>
            )}
          </div>

          {/* Search Bar with Filter Dropdown */}
          <div className="relative mb-6" ref={filterDropdownRef}>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="Search RCAs by title, RCA ID, Ticket ID, system, source, or stage..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setShowSuggestions(e.target.value.trim().length > 0)
                  }}
                  onFocus={() => setShowSuggestions(searchTerm.trim().length > 0)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="pl-10"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <FiSearch className="text-lg" />
                </div>
                
                {/* Search Suggestions Dropdown */}
                {showSuggestions && generateSuggestions(searchTerm).length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20 max-h-60 overflow-y-auto">
                    {generateSuggestions(searchTerm).map((suggestion, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        onClick={() => {
                          setSearchTerm(suggestion.text)
                          setShowSuggestions(false)
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">
                              {highlightText(suggestion.text, searchTerm)}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {suggestion.type}
                            </div>
                          </div>
                          <Badge className="bg-blue-100 text-blue-800 text-xs">
                            {suggestion.type}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Button 
                variant="outline" 
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="flex items-center gap-2"
              >
                Filter
                <FiChevronDown className={`text-sm transition-transform ${showFilterDropdown ? 'rotate-180' : ''}`} />
              </Button>
            </div>

            {/* Filter Dropdown */}
            {showFilterDropdown && (
              <Card className="absolute top-full left-0 right-0 mt-2 z-10 bg-white border border-gray-200 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex gap-8">
                    {/* Source Filter */}
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Source</h3>
                      <div className="space-y-2">
                        {sourceOptions.map((source) => (
                          <div key={source} className="flex items-center space-x-2">
                            <Checkbox
                              id={`source-${source}`}
                              checked={filters.sources.includes(source)}
                              onCheckedChange={(checked) => handleSourceFilter(source, checked)}
                            />
                            <label 
                              htmlFor={`source-${source}`} 
                              className="text-sm text-gray-700 cursor-pointer flex-1"
                            >
                              {source}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Priority Filter */}
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Priority</h3>
                      <div className="space-y-2">
                        {priorityOptions.map((priority) => (
                          <div key={priority} className="flex items-center space-x-2">
                            <Checkbox
                              id={`priority-${priority}`}
                              checked={filters.priorities.includes(priority)}
                              onCheckedChange={(checked) => handlePriorityFilter(priority, checked)}
                            />
                            <label 
                              htmlFor={`priority-${priority}`} 
                              className="text-sm text-gray-700 cursor-pointer flex-1"
                            >
                              {priority}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Date Range Filter */}
                    <div className="w-40">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Date Range</h3>
                      <div className="space-y-2">
                        <div>
                          <label htmlFor="start-date" className="block text-xs font-medium text-gray-700 mb-1">
                            From Date
                          </label>
                          <Input
                            id="start-date"
                            type="date"
                            value={filters.dateRange.startDate}
                            onChange={(e) => handleDateRangeFilter('startDate', e.target.value)}
                            className="w-full h-8 text-xs text-gray-700"
                          />
                        </div>
                        <div>
                          <label htmlFor="end-date" className="block text-xs font-medium text-gray-700 mb-1">
                            To Date
                          </label>
                          <Input
                            id="end-date"
                            type="date"
                            value={filters.dateRange.endDate}
                            onChange={(e) => handleDateRangeFilter('endDate', e.target.value)}
                            className="w-full h-8 text-xs text-gray-700"
                          />
                        </div>
                        {(filters.dateRange.startDate || filters.dateRange.endDate) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setFilters(prev => ({
                                ...prev,
                                dateRange: { startDate: '', endDate: '' }
                              }))
                            }}
                            className="w-full text-xs h-7"
                          >
                            Clear Date Range
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Status Filter */}
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Status</h3>
                      <div className="space-y-2">
                        {stageOptions.map((stage) => (
                          <div key={stage} className="flex items-center space-x-2">
                            <Checkbox
                              id={`stage-${stage}`}
                              checked={filters.stages.includes(stage)}
                              onCheckedChange={(checked) => handleStageFilter(stage, checked)}
                            />
                            <label 
                              htmlFor={`stage-${stage}`} 
                              className="text-sm text-gray-700 cursor-pointer flex-1"
                            >
                              {stage}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Clear Filters */}
                    {hasActiveFilters && (
                      <div className="flex items-end">
                        <Button 
                          variant="outline" 
                          onClick={clearAllFilters}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          Clear All
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
            
          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <FiRefreshCw className="text-4xl mx-auto animate-spin" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Loading tickets...</h3>
              <p className="text-gray-500">Fetching data from the server</p>
            </div>
          ) : filteredCases.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <FiSearch className="text-4xl mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No cases found</h3>
              <p className="text-gray-500 mb-4">
                {hasActiveFilters 
                  ? 'Try adjusting your filters or search terms'
                  : apiTickets.length === 0 
                    ? 'No tickets available from the server'
                    : 'No RCA cases match your search criteria'
                }
              </p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearAllFilters}>
                  Clear All Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ticket ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ticket Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Source
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCases.map((case_, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {highlightText(case_.ticketId, searchTerm)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {highlightText(case_.title, searchTerm)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {highlightText(case_.id, searchTerm)} • {highlightText(case_.system, searchTerm)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={`${case_.priorityColor} border-0 font-medium`}>
                            {case_.priority}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">
                            {highlightText(case_.source, searchTerm)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => navigate(getStageNavigationPath(case_.stage, case_.id))}
                            >
                              Resolve
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/complaint/${case_.id}`)}
                            >
                              View
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden">
                {filteredCases.map((case_, index) => (
                  <div key={index} className="border-b border-gray-200 p-4 last:border-b-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-1">
                          Ticket ID: {highlightText(case_.ticketId, searchTerm)}
                        </p>
                        <h3 className="text-sm font-medium text-gray-900 mb-1">
                          {highlightText(case_.title, searchTerm)}
                        </h3>
                        <p className="text-xs text-gray-500 mb-2">
                          {highlightText(case_.id, searchTerm)} • {highlightText(case_.system, searchTerm)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Source: {highlightText(case_.source, searchTerm)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <Badge className={`${case_.priorityColor} border-0 font-medium text-xs`}>
                          {case_.priority}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-700">Source</span>
                        <span className="text-xs font-medium text-gray-900">
                          {highlightText(case_.source, searchTerm)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end">
                      <div className="flex items-center space-x-2">
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1"
                          onClick={() => navigate(getStageNavigationPath(case_.stage, case_.id))}
                        >
                          Resolve
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/complaint/${case_.id}`)}
                          className="text-xs px-3 py-1"
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pagination Controls */}
          {apiTickets.length > 0 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">Show:</span>
                  <select
                    value={pagination.limit}
                    onChange={(e) => handleLimitChange(parseInt(e.target.value))}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                    disabled={loading}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="text-sm text-gray-700">per page</span>
                </div>
                <div className="text-sm text-gray-700">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrev || loading}
                  className="flex items-center gap-1"
                >
                  <FiChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(pagination.totalPages - 4, pagination.page - 2)) + i
                    if (pageNum > pagination.totalPages) return null
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === pagination.page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        disabled={loading}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNext || loading}
                  className="flex items-center gap-1"
                >
                  Next
                  <FiChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RCADashboard
