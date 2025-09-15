import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Progress } from '../components/ui/progress'
import { Checkbox } from '../components/ui/checkbox'
import { FiSearch, FiMenu, FiCheck, FiAlertTriangle, FiClipboard, FiChevronDown, FiCreditCard, FiChevronLeft, FiChevronRight, FiWifi, FiWifiOff, FiLoader } from 'react-icons/fi'
import { transformTicketToRCACase } from '../api/rcaService'
import useWebSocketOnly from '../hooks/useWebSocketOnly'
import NotificationContainer from '../components/ui/NotificationContainer'

const RCADashboard = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [filters, setFilters] = useState({
    sources: [],
    priorities: [],
    dateRange: { startDate: '', endDate: '' },
    stages: []
  })
  const filterDropdownRef = useRef(null)

  // WebSocket-only hook for all data operations (Real-time only)
  const {
    isConnected: wsConnected,
    connectionError: wsError,
    tickets: wsTickets,
    newTickets,
    pollingStatus,
    notifications,
    removeNotification,
    clearNotifications,
    pagination: wsPagination,
    isLoading: wsLoading,
    isInitialLoad: wsInitialLoad,
    dataStatistics,
    syncState: wsSyncState,
    syncProgress: wsSyncProgress,
    nextPage: wsNextPage,
    prevPage: wsPrevPage,
    goToPage: wsGoToPage,
    changePageSize: wsChangePageSize,
    requestInitialSync,
    setIsInitialLoad,
    setIsLoading
  } = useWebSocketOnly(import.meta.env.VITE_BACKEND_URL || 'http://localhost:8081')

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

  // Initial data sync via WebSocket (Real-time only)
  useEffect(() => {
    if (wsConnected && wsInitialLoad) {
      console.log('🚀 Requesting initial sync via WebSocket (Real-time only)')
      requestInitialSync()
      setLastUpdated(new Date())
      
      // Set a timeout to prevent infinite loading (30 seconds)
      const timeoutId = setTimeout(() => {
        console.warn('⚠️ Initial sync timeout - setting loading to false');
        setIsInitialLoad(false);
        setIsLoading(false);
      }, 30000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [wsConnected, wsInitialLoad, requestInitialSync])


  // Pagination handlers (Local pagination only)
  const handlePageChange = (newPage) => {
    wsGoToPage(newPage)
  }

  const handleLimitChange = (newLimit) => {
    wsChangePageSize(newLimit)
  }

  // Summary data - calculated from WebSocket data and statistics
  const summaryData = [
    {
      title: 'Total Tickets',
      value: (dataStatistics?.total || wsPagination.totalCount || 0).toString(),
      subtitle: `${wsTickets.length} on current page`,
      subtitleColor: 'text-green-600',
      icon: <FiCreditCard className="text-2xl text-green-600" />,
      bgColor: 'bg-white',
      borderColor: 'border-gray-200'
    },
    {
      title: 'Active Tickets',
      value: (dataStatistics?.open || wsTickets.filter(ticket => ticket.status && !['Closed', 'Resolved', 'Cancelled'].includes(ticket.status)).length).toString(),
      subtitle: 'Currently open',
      subtitleColor: 'text-blue-600',
      icon: <FiAlertTriangle className="text-2xl text-blue-600" />,
      bgColor: 'bg-white',
      borderColor: 'border-gray-200'
    },
    {
      title: 'High Priority',
      value: wsTickets.filter(ticket => ticket.priority === 'P1' || ticket.priority === '1 - Critical' || ticket.priority === '2 - High').length.toString(),
      subtitle: 'P1 & P2 tickets',
      subtitleColor: 'text-red-600',
      icon: <FiClipboard className="text-2xl text-red-600" />,
      bgColor: 'bg-white',
      borderColor: 'border-gray-200'
    },
    {
      title: 'Page Info',
      value: `${wsPagination.currentPage}/${wsPagination.totalPages}`,
      subtitle: `${wsPagination.limit} per page`,
      subtitleColor: 'text-gray-600',
      icon: <FiCheck className="text-2xl text-gray-600" />,
      bgColor: 'bg-white',
      borderColor: 'border-gray-200'
    }
  ]

  // RCA Cases data - use WebSocket tickets (NO REST API calls)
  const rcaCases = wsTickets.length > 0 ? wsTickets : [
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
      {/* Notification Container */}
      <NotificationContainer 
        notifications={notifications}
        removeNotification={removeNotification}
        clearNotifications={clearNotifications}
      />
      
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">RCA Dashboard</h1>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span>
                {wsConnected ? 'Real-time connected' : 'Real-time disconnected'}
              </span>
            </div>
            {lastUpdated && (
              <div className="text-sm text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
            {newTickets.length > 0 && (
              <div className="flex items-center gap-1 text-sm text-green-600">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>{newTickets.length} new ticket{newTickets.length > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {/* WebSocket Connection Status */}
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                wsConnected 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {wsConnected ? <FiWifi className="w-3 h-3" /> : <FiWifiOff className="w-3 h-3" />}
                {wsConnected ? 'Connected' : 'Disconnected'}
              </div>
            </div>
            
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
        <div className="mb-6 max-w-full overflow-x-hidden">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Tickets {wsLoading && <span className="text-sm text-gray-500">(Loading...)</span>}
            </h2>
            {hasActiveFilters && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Active filters:</span>
                <Button variant="outline" size="sm" onClick={clearAllFilters}>
                  Clear All
                </Button>
              </div>
            )}
          </div>

          {/* Search Bar with Filter Dropdown */}
          <div className="relative mb-6 max-w-full overflow-x-hidden" ref={filterDropdownRef}>
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

          {/* Active Filter Badges */}
          {hasActiveFilters && (
            <div className="mb-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-600 font-medium">Active filters:</span>
                
                {/* Source Badges */}
                {filters.sources.map((source) => (
                  <Badge 
                    key={`source-${source}`}
                    variant="secondary" 
                    className="bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer"
                    onClick={() => handleSourceFilter(source, false)}
                  >
                    Source: {source}
                    <span className="ml-1 text-blue-600">×</span>
                  </Badge>
                ))}
                
                {/* Priority Badges */}
                {filters.priorities.map((priority) => (
                  <Badge 
                    key={`priority-${priority}`}
                    variant="secondary" 
                    className="bg-orange-100 text-orange-800 hover:bg-orange-200 cursor-pointer"
                    onClick={() => handlePriorityFilter(priority, false)}
                  >
                    Priority: {priority}
                    <span className="ml-1 text-orange-600">×</span>
                  </Badge>
                ))}
                
                {/* Date Range Badge */}
                {(filters.dateRange.startDate || filters.dateRange.endDate) && (
                  <Badge 
                    variant="secondary" 
                    className="bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer"
                    onClick={() => {
                      setFilters(prev => ({
                        ...prev,
                        dateRange: { startDate: '', endDate: '' }
                      }))
                    }}
                  >
                    Date: {filters.dateRange.startDate || 'Any'} to {filters.dateRange.endDate || 'Any'}
                    <span className="ml-1 text-green-600">×</span>
                  </Badge>
                )}
                
                {/* Stage Badges */}
                {filters.stages.map((stage) => (
                  <Badge 
                    key={`stage-${stage}`}
                    variant="secondary" 
                    className="bg-purple-100 text-purple-800 hover:bg-purple-200 cursor-pointer"
                    onClick={() => handleStageFilter(stage, false)}
                  >
                    Stage: {stage}
                    <span className="ml-1 text-purple-600">×</span>
                  </Badge>
                ))}
                
                {/* Clear All Button */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearAllFilters}
                  className="text-xs h-6 px-2"
                >
                  Clear All
                </Button>
              </div>
            </div>
          )}
            
          {wsInitialLoad ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <FiLoader className="text-4xl mx-auto animate-spin" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Loading tickets...</h3>
              <p className="text-gray-500">Fetching data from the server</p>
              
              {/* Sync Progress Indicator */}
              {wsSyncProgress && wsSyncProgress.totalBatches > 0 && (
                <div className="mt-6 max-w-md mx-auto">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Syncing tickets...</span>
                    <span>{wsSyncProgress.percentage}%</span>
                  </div>
                  <Progress 
                    value={wsSyncProgress.percentage} 
                    className="h-2"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Batch {wsSyncProgress.currentBatch} of {wsSyncProgress.totalBatches}
                  </p>
                </div>
              )}
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
                  : wsTickets.length === 0 
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
            <div className="bg-white shadow-sm rounded-lg overflow-hidden relative">
              {/* Subtle loading overlay for background refreshes */}
              {wsLoading && !wsInitialLoad && (
                <div className="absolute inset-0 bg-white bg-opacity-50 z-10 flex items-center justify-center">
                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-white px-3 py-2 rounded-lg shadow-sm">
                    <FiLoader className="w-4 h-4 animate-spin" />
                    <span>Updating...</span>
                  </div>
                </div>
              )}
              {/* Desktop Table View */}
              <div className="hidden lg:block">
                <table className="w-full table-fixed divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr className="h-12">
                      <th className="w-32 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ticket ID
                      </th>
                      <th className="w-auto px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ticket Details
                      </th>
                      <th className="w-28 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="w-32 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Source
                      </th>
                      <th className="w-48 px-8 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCases.map((case_, index) => {
                      const isNewTicket = newTickets.some(ticket => ticket.ticketId === case_.ticketId)
                      return (
                        <tr key={index} className={`hover:bg-gray-50 transition-colors h-16 ${isNewTicket ? 'bg-green-50 border-l-4 border-l-green-500' : ''}`}>
                          <td className="px-6 py-4 whitespace-nowrap align-middle">
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-medium text-gray-900">
                                {highlightText(case_.ticketId, searchTerm)}
                              </div>
                              {isNewTicket && (
                                <Badge className="bg-green-100 text-green-800 text-xs animate-pulse">
                                  New
                                </Badge>
                              )}
                            </div>
                          </td>
                        <td className="px-4 py-4 align-middle">
                          <div className="max-w-md">
                            <div className="text-sm font-medium text-gray-900 truncate" title={case_.title}>
                              {highlightText(case_.title, searchTerm)}
                            </div>
                            <div className="text-sm text-gray-500 truncate" title={`${case_.id} • ${case_.system}`}>
                              {highlightText(case_.id, searchTerm)} • {highlightText(case_.system, searchTerm)}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap align-middle">
                          <Badge className={`${case_.priorityColor} border-0 font-medium`}>
                            {case_.priority}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap align-middle">
                          <span className="text-sm font-medium text-gray-900">
                            {highlightText(case_.source, searchTerm)}
                          </span>
                        </td>
                        <td className="px-8 py-4 whitespace-nowrap text-sm font-medium align-middle">
                          <div className="flex items-center space-x-2 mr-8">
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
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden">
                {filteredCases.map((case_, index) => {
                  const isNewTicket = newTickets.some(ticket => ticket.ticketId === case_.ticketId)
                  return (
                    <div key={index} className={`border-b border-gray-200 p-3 last:border-b-0 ${isNewTicket ? 'bg-green-50 border-l-4 border-l-green-500' : ''}`}>
                      {/* Header with Ticket ID and Priority */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-xs text-gray-500 truncate">
                              Ticket ID: {highlightText(case_.ticketId, searchTerm)}
                            </p>
                            {isNewTicket && (
                              <Badge className="bg-green-100 text-green-800 text-xs animate-pulse flex-shrink-0">
                                New
                              </Badge>
                            )}
                          </div>
                          <h3 className="text-sm font-medium text-gray-900 mb-1 break-words">
                            {highlightText(case_.title, searchTerm)}
                          </h3>
                          <p className="text-xs text-gray-500 mb-2 break-words">
                            {highlightText(case_.id, searchTerm)} • {highlightText(case_.system, searchTerm)}
                          </p>
                          <p className="text-xs text-gray-500 break-words">
                            Source: {highlightText(case_.source, searchTerm)}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <Badge className={`${case_.priorityColor} border-0 font-medium text-xs`}>
                            {case_.priority}
                          </Badge>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-center">
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
                  )
                })}
              </div>
            </div>
          )}

          {/* Pagination Controls */}
          {wsTickets.length > 0 && (
            <div className="mt-6">
              {/* Mobile Pagination */}
              <div className="lg:hidden space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm text-gray-700">Show:</span>
                  <select
                    value={wsPagination.limit}
                    onChange={(e) => handleLimitChange(parseInt(e.target.value))}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                    disabled={wsLoading && !wsInitialLoad}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="text-sm text-gray-700">per page</span>
                </div>
                <div className="text-sm text-gray-700 text-center">
                  Showing {((wsPagination.currentPage - 1) * wsPagination.limit) + 1} to {Math.min(wsPagination.currentPage * wsPagination.limit, wsPagination.totalCount)} of {wsPagination.totalCount} results
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(wsPagination.currentPage - 1)}
                    disabled={!wsPagination.hasPrevPage || (wsLoading && !wsInitialLoad)}
                    className="flex items-center gap-1"
                  >
                    <FiChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(3, wsPagination.totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(wsPagination.totalPages - 2, wsPagination.currentPage - 1)) + i
                      if (pageNum > wsPagination.totalPages) return null
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === wsPagination.currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          disabled={wsLoading && !wsInitialLoad}
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
                    onClick={() => handlePageChange(wsPagination.currentPage + 1)}
                    disabled={!wsPagination.hasNextPage || (wsLoading && !wsInitialLoad)}
                    className="flex items-center gap-1"
                  >
                    Next
                    <FiChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Desktop Pagination */}
              <div className="hidden lg:flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">Show:</span>
                    <select
                      value={wsPagination.limit}
                      onChange={(e) => handleLimitChange(parseInt(e.target.value))}
                      className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                      disabled={wsLoading && !wsInitialLoad}
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                    <span className="text-sm text-gray-700">per page</span>
                  </div>
                  <div className="text-sm text-gray-700">
                    Showing {((wsPagination.currentPage - 1) * wsPagination.limit) + 1} to {Math.min(wsPagination.currentPage * wsPagination.limit, wsPagination.totalCount)} of {wsPagination.totalCount} results
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(wsPagination.currentPage - 1)}
                    disabled={!wsPagination.hasPrevPage || (wsLoading && !wsInitialLoad)}
                    className="flex items-center gap-1"
                  >
                    <FiChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, wsPagination.totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(wsPagination.totalPages - 4, wsPagination.currentPage - 2)) + i
                      if (pageNum > wsPagination.totalPages) return null
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === wsPagination.currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          disabled={wsLoading && !wsInitialLoad}
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
                    onClick={() => handlePageChange(wsPagination.currentPage + 1)}
                    disabled={!wsPagination.hasNextPage || (wsLoading && !wsInitialLoad)}
                    className="flex items-center gap-1"
                  >
                    Next
                    <FiChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RCADashboard
