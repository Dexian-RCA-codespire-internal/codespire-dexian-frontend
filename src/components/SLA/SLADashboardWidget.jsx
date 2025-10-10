import React, { useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { FiClock, FiAlertTriangle, FiCheckCircle, FiAlertCircle, FiTrendingUp, FiActivity, FiWifi } from 'react-icons/fi'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/Badge'
import { slaService } from '../../api/services/slaService'
import { useSLAWebSocket } from '../../hooks/useSLAWebSocket'
import { 
  calculateSLATimeLeft, 
  getSLAStatusColor, 
  getPriorityColor
} from '../../utils/slaUtils'
import {
  fetchSLADashboardData,
  handleSLAUpdate as handleSLAUpdateAction,
  selectSLAMetrics,
  selectSLAData,
  selectSLALoading,
  updateWebSocketStatus
} from '../../store/slaSlice'

const SLADashboardWidget = () => {
  const dispatch = useDispatch()
  const slaMetrics = useSelector(selectSLAMetrics)
  const { metrics: loading } = useSelector(selectSLALoading)
  const criticalTickets = useSelector(state => 
    selectSLAData(state).filter(ticket => 
      ticket.slaStatus === 'critical' || ticket.slaStatus === 'breached'
    )
  )

  // WebSocket handlers for real-time updates
  const handleSLAUpdate = useCallback((updateData) => {
    switch (updateData.type) {
      case 'metrics':
        dispatch(handleSLAUpdateAction({ type: 'metrics', data: updateData.metrics }))
        break
      case 'breach':
      case 'critical':
        // Refresh critical tickets and metrics when there's a breach or critical alert
        dispatch(fetchSLADashboardData())
        break
      case 'refresh':
        dispatch(fetchSLADashboardData())
        break
    }
  }, [dispatch])

  const handleTicketUpdate = useCallback((ticket, action) => {
    // Dispatch ticket update to Redux store
    dispatch(handleSLAUpdateAction({
      type: 'ticket',
      data: ticket,
      action
    }))
    
    // Refresh dashboard data if it's a critical or breached ticket
    if (ticket.slaInfo && (ticket.slaInfo.status === 'breached' || ticket.slaInfo.status === 'critical')) {
      dispatch(fetchSLADashboardData())
    }
  }, [dispatch])

  // Initialize WebSocket connection
  const { isConnected, connect, disconnect } = useSLAWebSocket(
    handleSLAUpdate,
    handleTicketUpdate,
    {
      autoRefreshInterval: 60000, // 1 minute for dashboard
      enableDebugLogging: false
    }
  )

  // Connect WebSocket on mount
  useEffect(() => {
    connect()
    dispatch(updateWebSocketStatus({ isConnected: true }))
    return () => {
      disconnect()
      dispatch(updateWebSocketStatus({ isConnected: false }))
    }
  }, [connect, disconnect, dispatch])

  // Fetch initial data
  useEffect(() => {
    dispatch(fetchSLADashboardData())
  }, [dispatch]);
    

  // Fetch SLA metrics for dashboard
  const fetchSLAMetrics = async () => {
    try {
      const response = await slaService.getSLADashboardData()
      
      if (response.success && response.data) {
        setSlaMetrics(response.data.summary)
        
        // Fetch critical tickets separately
        await fetchCriticalTickets()
      }
    } catch (error) {
      console.error('Error fetching SLA metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSLAMetrics()
    
    // Refresh every 60 seconds
    const interval = setInterval(fetchSLAMetrics, 60000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, idx) => (
          <Card key={idx}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'safe':
        return <FiCheckCircle className="w-5 h-5 text-green-600" />
      case 'warning':
        return <FiClock className="w-5 h-5 text-yellow-600" />
      case 'critical':
        return <FiAlertTriangle className="w-5 h-5 text-orange-600" />
      case 'breached':
        return <FiAlertCircle className="w-5 h-5 text-red-600" />
      default:
        return <FiActivity className="w-5 h-5 text-gray-600" />
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* SLA Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiTrendingUp className="w-5 h-5 text-blue-600" />
              SLA Overview
            </div>
            <div className="flex items-center gap-1">
              <FiWifi className={`w-4 h-4 ${isConnected ? 'text-green-600' : 'text-gray-400'}`} />
              <span className={`text-xs ${isConnected ? 'text-green-600' : 'text-gray-400'}`}>
                {isConnected ? 'Live' : 'Offline'}
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{slaMetrics?.totalTickets || 0}</p>
              <p className="text-sm text-gray-600">Total Tickets</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{slaMetrics?.breachRate || 0}%</p>
              <p className="text-sm text-gray-600">Breach Rate</p>
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiAlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm">Breached</span>
              </div>
              <span className="font-medium text-red-600">{slaMetrics?.breached || 0}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiAlertTriangle className="w-4 h-4 text-orange-600" />
                <span className="text-sm">Critical</span>
              </div>
              <span className="font-medium text-orange-600">{slaMetrics?.critical || 0}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiClock className="w-4 h-4 text-yellow-600" />
                <span className="text-sm">Warning</span>
              </div>
              <span className="font-medium text-yellow-600">{slaMetrics?.warning || 0}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiCheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Safe</span>
              </div>
              <span className="font-medium text-green-600">{slaMetrics?.safe || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical Tickets Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FiAlertTriangle className="w-5 h-5 text-red-600" />
            Critical SLA Tickets
          </CardTitle>
        </CardHeader>
        <CardContent>
          {criticalTickets.length > 0 ? (
            <div className="space-y-3">
              {criticalTickets.map((ticket, index) => (
                <motion.div
                  key={ticket._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-blue-600">{ticket.ticket_id}</span>
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {ticket.short_description || 'No description'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {getStatusIcon(ticket.slaInfo.status)}
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {ticket.slaInfo.timeLeft}
                      </p>
                      <p className="text-xs text-gray-500">
                        {ticket.slaInfo.status}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FiCheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
              <p className="text-gray-600">No critical SLA tickets</p>
              <p className="text-sm text-gray-500">All tickets are within SLA limits</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default SLADashboardWidget