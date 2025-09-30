import React, { useState } from 'react'
import { FiFilter, FiX, FiChevronDown, FiArrowUp, FiArrowDown } from 'react-icons/fi'
import { Button } from '../ui/Button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/Badge'

const SLAFilters = ({
  selectedPriority,
  selectedStatus,
  selectedSource,
  selectedSLAStatus,
  onPriorityChange,
  onStatusChange,
  onSourceChange,
  onSLAStatusChange,
  sortField,
  sortDirection,
  onSortChange
}) => {
  const [showFilters, setShowFilters] = useState(false)

  // Filter options
  const priorities = ['All', 'P1', 'P2', 'P3']
  const statuses = ['All', 'New', 'In Progress', 'On Hold', 'Resolved', 'Closed']
  const sources = ['All', 'ServiceNow', 'Jira', 'Remedy', 'Other']
  const slaStatuses = ['All', 'safe', 'warning', 'critical', 'breached', 'completed']

  // Sort options
  const sortOptions = [
    { value: 'opened_time', label: 'Opened Time' },
    { value: 'priority', label: 'Priority' },
    { value: 'status', label: 'Status' },
    { value: 'ticket_id', label: 'Ticket ID' },
    { value: 'category', label: 'Category' }
  ]

  // Count active filters
  const activeFiltersCount = [
    selectedPriority !== 'All',
    selectedStatus !== 'All',
    selectedSource !== 'All',
    selectedSLAStatus !== 'All'
  ].filter(Boolean).length

  // Clear all filters
  const clearAllFilters = () => {
    onPriorityChange('All')
    onStatusChange('All')
    onSourceChange('All')
    onSLAStatusChange('All')
  }

  // Toggle sort direction
  const toggleSortDirection = () => {
    onSortChange(sortField, sortDirection === 'asc' ? 'desc' : 'asc')
  }

  return (
    <div className="space-y-4">
      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <FiFilter className="w-4 h-4" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFiltersCount}
            </Badge>
          )}
          <FiChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </Button>

        {/* Sort Controls */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          <Select value={sortField} onValueChange={(value) => onSortChange(value, sortDirection)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSortDirection}
            className="flex items-center gap-1"
          >
            {sortDirection === 'asc' ? (
              <FiArrowUp className="w-4 h-4" />
            ) : (
              <FiArrowDown className="w-4 h-4" />
            )}
            {sortDirection === 'asc' ? 'Asc' : 'Desc'}
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Priority Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Priority</label>
                <Select value={selectedPriority} onValueChange={onPriorityChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {priority}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <Select value={selectedStatus} onValueChange={onStatusChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Source Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Source</label>
                <Select value={selectedSource} onValueChange={onSourceChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    {sources.map((source) => (
                      <SelectItem key={source} value={source}>
                        {source}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* SLA Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">SLA Status</label>
                <Select value={selectedSLAStatus} onValueChange={onSLAStatusChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select SLA status" />
                  </SelectTrigger>
                  <SelectContent>
                    {slaStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status === 'All' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters and Clear Button */}
            {activeFiltersCount > 0 && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-gray-600">Active filters:</span>
                    {selectedPriority !== 'All' && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        Priority: {selectedPriority}
                        <FiX 
                          className="w-3 h-3 cursor-pointer hover:text-red-500" 
                          onClick={() => onPriorityChange('All')}
                        />
                      </Badge>
                    )}
                    {selectedStatus !== 'All' && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        Status: {selectedStatus}
                        <FiX 
                          className="w-3 h-3 cursor-pointer hover:text-red-500" 
                          onClick={() => onStatusChange('All')}
                        />
                      </Badge>
                    )}
                    {selectedSource !== 'All' && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        Source: {selectedSource}
                        <FiX 
                          className="w-3 h-3 cursor-pointer hover:text-red-500" 
                          onClick={() => onSourceChange('All')}
                        />
                      </Badge>
                    )}
                    {selectedSLAStatus !== 'All' && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        SLA: {selectedSLAStatus.charAt(0).toUpperCase() + selectedSLAStatus.slice(1)}
                        <FiX 
                          className="w-3 h-3 cursor-pointer hover:text-red-500" 
                          onClick={() => onSLAStatusChange('All')}
                        />
                      </Badge>
                    )}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllFilters}
                    className="flex items-center gap-1"
                  >
                    <FiX className="w-4 h-4" />
                    Clear All
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default SLAFilters