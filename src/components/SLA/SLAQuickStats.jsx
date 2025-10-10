import React, { useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { FiClock, FiAlertTriangle, FiCheckCircle, FiAlertCircle, FiWifi } from 'react-icons/fi'
import { Card, CardContent } from '../ui/card'
import { useSLAWebSocket } from '../../hooks/useSLAWebSocket'
import {
  fetchSLAStats,
  handleSLAUpdate as handleSLAUpdateAction,
  selectSLAStats,
  selectSLALoading,
  updateWebSocketStatus
} from '../../store/slaSlice'

const SLAQuickStats = ({ refreshTrigger = 0 }) => {
  const dispatch = useDispatch()
  const stats = useSelector(selectSLAStats)
  const { stats: loading } = useSelector(selectSLALoading)

  // WebSocket handlers for real-time updates
  const handleSLAUpdate = useCallback((updateData) => {
    switch (updateData.type) {
      case 'metrics':
      case 'stats':
        dispatch(handleSLAUpdateAction({
          type: 'stats',
          data: updateData.metrics || updateData.stats
        }))
        break
      case 'refresh':
        dispatch(fetchSLAStats())
        break
    }
  }, [dispatch])

  const handleTicketUpdate = useCallback((ticket) => {
    // Update stats automatically by fetching fresh stats
    dispatch(fetchSLAStats())
  }, [dispatch])

  // Initialize WebSocket connection
  const { isConnected, connect, disconnect } = useSLAWebSocket(
    handleSLAUpdate,
    handleTicketUpdate,
    {
      autoRefreshInterval: 60000, // 1 minute for quick stats
      enableDebugLogging: false
    }
  )

  // Connect WebSocket on mount
  useEffect(() => {
    connect()
    return () => disconnect()
  }, [connect, disconnect])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await slaService.getSLADashboardData()
      
      if (response.success && response.data) {
        setStats(response.data.summary)
      }
    } catch (error) {
      console.error('Error fetching SLA stats:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [refreshTrigger])

  const statCards = [
    {
      title: 'Total Tickets',
      value: stats.totalTickets,
      icon: FiClock,
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Breached',
      value: stats.breached,
      icon: FiAlertCircle,
      color: 'red',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600'
    },
    {
      title: 'Critical',
      value: stats.critical,
      icon: FiAlertTriangle,
      color: 'orange',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    },
    {
      title: 'Warning',
      value: stats.warning,
      icon: FiClock,
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Safe',
      value: stats.safe,
      icon: FiCheckCircle,
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    }
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {statCards.map((stat, index) => {
        const IconComponent = stat.icon
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className={`text-2xl font-bold ${stat.textColor}`}>
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 ${stat.bgColor} rounded-full`}>
                    <IconComponent className={`w-6 h-6 ${stat.textColor}`} />
                  </div>
                </div>
                
                {/* Progress bar for visual representation */}
                {stats.totalTickets > 0 && (
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${stat.bgColor} ${stat.textColor}`}
                        style={{ 
                          width: `${(stat.value / stats.totalTickets) * 100}%`,
                          backgroundColor: `var(--${stat.color}-500)`
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {stats.totalTickets > 0 ? Math.round((stat.value / stats.totalTickets) * 100) : 0}% of total
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}

export default SLAQuickStats