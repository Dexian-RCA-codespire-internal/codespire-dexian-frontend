import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiRefreshCw, 
  FiClock, 
  FiAlertCircle, 
  FiAlertTriangle, 
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiDownload
} from 'react-icons/fi'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { useToast } from '../../contexts/ToastContext'
import { slaService } from '../../api/services/slaService'
import { 
  calculateSLATimeLeft, 
  getSLAStatusColor, 
  getPriorityColor,
  formatSLADeadline,
  calculateSLAMetrics
} from '../../utils/slaUtils'
import SLASearch from '../../components/SLA/SLASearch'
import SLAFilters from '../../components/SLA/SLAFilters'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const SLA = () => {
  const [slaData, setSlaData] = useState([])
  const [slaMetrics, setSlaMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPriority, setSelectedPriority] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [selectedSource, setSelectedSource] = useState('All')
  const [selectedSLAStatus, setSelectedSLAStatus] = useState('All')
  const [sortField, setSortField] = useState('opened_time')
  const [sortDirection, setSortDirection] = useState('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 15,
    page: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  })
  
  const { addToast } = useToast()

  // Fetch SLA data from backend
  const fetchSLAData = async (page = currentPage, showRefreshMessage = false) => {
    try {
      const isRefresh = showRefreshMessage || refreshing
      if (isRefresh) setRefreshing(true)
      else if (page === 1) setLoading(true)

      const params = {
        page,
        limit: 15, // Fixed to 15 items per page
        ...(selectedPriority !== 'All' && { priority: selectedPriority }),
        ...(selectedStatus !== 'All' && { status: selectedStatus }),
        ...(selectedSource !== 'All' && { source: selectedSource }),
        ...(selectedSLAStatus !== 'All' && { slaStatus: selectedSLAStatus }),
        ...(searchTerm && { searchTerm }),
        sortBy: sortField,
        sortOrder: sortDirection
      }

      const response = await slaService.getSLAs(params)
      
      if (response.success) {
        const slasWithSLAInfo = response.slas.map(sla => {
          // If backend has already calculated SLA status (during filtering), use it consistently
          if (sla.calculatedSLAStatus) {
            const frontendSLAInfo = calculateSLATimeLeft(
              sla.opened_time_ist || sla.opened_time, 
              sla.priority, 
              sla.status
            );
            
            // Log any discrepancies between backend and frontend calculations
            if (import.meta.env.NODE_ENV === 'development' && frontendSLAInfo.status !== sla.calculatedSLAStatus) {
              console.warn('🔍 SLA Status mismatch:', {
                ticketId: sla.ticket_id,
                backend: sla.calculatedSLAStatus,
                frontend: frontendSLAInfo.status,
                openedTime: sla.opened_time_ist || sla.opened_time,
                priority: sla.priority,
                status: sla.status
              });
            }
            
            return {
              ...sla,
              slaInfo: {
                ...frontendSLAInfo,
                status: sla.calculatedSLAStatus // Always use backend calculated status when available
              }
            };
          } else {
            // Calculate SLA status on frontend when backend didn't calculate it
            const slaInfo = calculateSLATimeLeft(
              sla.opened_time_ist || sla.opened_time, 
              sla.priority, 
              sla.status
            );
            return {
              ...sla,
              slaInfo
            };
          }
        });

        setSlaData(slasWithSLAInfo)
        setPagination(response.pagination)

        // Use collection-wide metrics from backend
        if (response.metrics) {
          setSlaMetrics(response.metrics)
        } else {
          // Fallback to calculating from current data if metrics not provided
          const metrics = calculateSLAMetrics(slasWithSLAInfo)
          setSlaMetrics(metrics)
        }

        if (isRefresh && showRefreshMessage) {
          addToast('SLA data refreshed successfully', 'success')
        }
      } else {
        console.error('❌ SLA API returned error:', response)
        addToast(`Failed to fetch SLA data: ${response.error}`, 'error')
      }
    } catch (error) {
      console.error('❌ Error fetching SLA data:', error)
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      })
      addToast('Failed to fetch SLA data', 'error')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Initial data load
  useEffect(() => {
    setCurrentPage(1) // Reset to page 1 when filters change
    fetchSLAData(1)
  }, [selectedPriority, selectedStatus, selectedSource, selectedSLAStatus, searchTerm, sortField, sortDirection])

  // Handle page change
  useEffect(() => {
    if (currentPage !== 1) {
      fetchSLAData(currentPage)
    }
  }, [currentPage])

  // Manual refresh handler
  const handleRefresh = () => {
    fetchSLAData(currentPage, true)
  }

  // Get status icon component
  const getStatusIcon = (status) => {
    const iconProps = { className: "w-4 h-4" }
    switch (status) {
      case 'safe':
        return <FiCheckCircle {...iconProps} className="w-4 h-4 text-green-500" />
      case 'warning':
        return <FiClock {...iconProps} className="w-4 h-4 text-yellow-500" />
      case 'critical':
        return <FiAlertTriangle {...iconProps} className="w-4 h-4 text-orange-500" />
      case 'breached':
        return <FiAlertCircle {...iconProps} className="w-4 h-4 text-red-500" />
      case 'completed':
        return <FiCheckCircle {...iconProps} className="w-4 h-4 text-blue-500" />
      default:
        return <FiClock {...iconProps} className="w-4 h-4 text-gray-500" />
    }
  }

  // Pagination handlers
  const handlePrevPage = () => {
    if (pagination.hasPrevPage) {
      setCurrentPage(prev => prev - 1)
    }
  }

  const handleNextPage = () => {
    if (pagination.hasNextPage) {
      setCurrentPage(prev => prev + 1)
    }
  }

  const handlePageClick = (pageNum) => {
    setCurrentPage(pageNum)
  }

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = []
    const totalPages = pagination.totalPages
    const current = pagination.page
    
    // Always show first page
    pages.push(1)
    
    // Add ellipsis if needed
    if (current > 3) {
      pages.push('...')
    }
    
    // Add pages around current page
    for (let i = Math.max(2, current - 1); i <= Math.min(totalPages - 1, current + 1); i++) {
      if (!pages.includes(i)) {
        pages.push(i)
      }
    }
    
    // Add ellipsis if needed
    if (current < totalPages - 2) {
      pages.push('...')
    }
    
    // Always show last page if more than 1 page
    if (totalPages > 1 && !pages.includes(totalPages)) {
      pages.push(totalPages)
    }
    
    return pages
  }

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">SLA Management</h1>
          <p className="text-gray-600 mt-1">
            Monitor and track Service Level Agreement compliance
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            className="flex items-center gap-2"
          >
            <FiRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      {slaMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Tickets</p>
                  <p className="text-2xl font-bold text-gray-900">{slaMetrics.totalTickets}</p>
                </div>
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <FiClock className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Breached</p>
                  <p className="text-2xl font-bold text-red-600">{slaMetrics.breached}</p>
                </div>
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                  <FiAlertCircle className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Critical</p>
                  <p className="text-2xl font-bold text-orange-600">{slaMetrics.critical}</p>
                </div>
                <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                  <FiAlertTriangle className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Warning</p>
                  <p className="text-2xl font-bold text-yellow-600">{slaMetrics.warning}</p>
                </div>
                <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                  <FiClock className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Safe</p>
                  <p className="text-2xl font-bold text-green-600">{slaMetrics.safe}</p>
                </div>
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <FiCheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <div className="space-y-4">
        <SLASearch 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
        
        <SLAFilters
          selectedPriority={selectedPriority}
          selectedStatus={selectedStatus}
          selectedSource={selectedSource}
          selectedSLAStatus={selectedSLAStatus}
          onPriorityChange={setSelectedPriority}
          onStatusChange={setSelectedStatus}
          onSourceChange={setSelectedSource}
          onSLAStatusChange={setSelectedSLAStatus}
          sortField={sortField}
          sortDirection={sortDirection}
          onSortChange={(field, direction) => {
            setSortField(field)
            setSortDirection(direction)
          }}
        />
      </div>

      {/* SLA Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>SLA Records</span>
            <span className="text-sm font-normal text-gray-500">
              Showing {slaData.length} of {pagination.total} records
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticket ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Opened (IST)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SLA Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time Left
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <AnimatePresence>
                  {slaData.map((ticket, index) => (
                    <motion.tr
                      key={ticket._id || ticket.ticket_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {ticket.ticket_id}
                        </div>
                        <div className="text-sm text-gray-500">
                          {ticket.source}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{ticket.status}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{ticket.category || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {ticket.opened_time_ist 
                            ? new Date(ticket.opened_time_ist).toLocaleString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : new Date(ticket.opened_time).toLocaleString('en-IN', {
                                timeZone: 'Asia/Kolkata',
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(ticket.slaInfo?.status)}
                          <span className={`text-sm font-medium ${getSLAStatusColor(ticket.slaInfo?.status)}`}>
                            {ticket.slaInfo?.status || 'Unknown'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${getSLAStatusColor(ticket.slaInfo?.status)}`}>
                          {ticket.slaInfo?.timeLeft || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <FiEye className="w-4 h-4" />
                          View
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing page {pagination.page} of {pagination.totalPages} 
                  ({pagination.total} total records)
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handlePrevPage}
                    disabled={!pagination.hasPrevPage}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <FiChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {getPageNumbers().map((pageNum, idx) => (
                      <React.Fragment key={idx}>
                        {pageNum === '...' ? (
                          <span className="px-2 py-1 text-gray-500">...</span>
                        ) : (
                          <Button
                            onClick={() => handlePageClick(pageNum)}
                            variant={pageNum === pagination.page ? "default" : "outline"}
                            size="sm"
                            className="w-8 h-8 p-0"
                          >
                            {pageNum}
                          </Button>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                  
                  <Button
                    onClick={handleNextPage}
                    disabled={!pagination.hasNextPage}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    Next
                    <FiChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Empty State */}
      {slaData.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <FiClock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No SLA Records Found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || selectedPriority !== 'All' || selectedStatus !== 'All' || selectedSource !== 'All' || selectedSLAStatus !== 'All'
                ? 'Try adjusting your search terms or filters.'
                : 'There are no SLA records to display.'}
            </p>
            {(searchTerm || selectedPriority !== 'All' || selectedStatus !== 'All' || selectedSource !== 'All' || selectedSLAStatus !== 'All') && (
              <Button 
                onClick={() => {
                  setSearchTerm('')
                  setSelectedPriority('All')
                  setSelectedStatus('All')
                  setSelectedSource('All')
                  setSelectedSLAStatus('All')
                }}
                variant="outline"
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default SLA