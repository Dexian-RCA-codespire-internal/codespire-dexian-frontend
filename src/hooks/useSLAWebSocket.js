import { useEffect, useCallback, useRef, useState } from 'react'
import webSocketService from '../services/websocketService'
import { calculateSLATimeLeft } from '../utils/slaUtils'

/**
 * Custom hook for SLA-specific WebSocket updates
 * Uses the existing WebSocket service infrastructure
 * @param {Function} onSLAUpdate - Callback when SLA data is updated
 * @param {Function} onTicketUpdate - Callback when ticket data changes affecting SLA
 * @param {Object} options - Configuration options
 */
export const useSLAWebSocket = (onSLAUpdate, onTicketUpdate, options = {}) => {
  const { 
    autoRefreshInterval = 30000, // 30 seconds
    enableDebugLogging = false 
  } = options

  const [isConnected, setIsConnected] = useState(false)
  const lastUpdateRef = useRef(null)
  const slaMetricsRef = useRef({
    totalTickets: 0,
    breached: 0,
    critical: 0,
    warning: 0,
    safe: 0
  })

  // Event handler IDs for cleanup
  const eventHandlerIdsRef = useRef([])

  // Process ticket data and calculate SLA information
  const processTicketForSLA = useCallback((ticketData) => {
    try {
      // Calculate SLA info for the ticket
      const slaInfo = calculateSLATimeLeft(
        ticketData.opened_time || ticketData.openedTime, 
        ticketData.priority, 
        ticketData.status
      )

      return {
        ...ticketData,
        slaInfo
      }
    } catch (error) {
      console.error('Error calculating SLA for ticket:', error)
      return ticketData
    }
  }, [])

  // WebSocket event handlers
  const handleTicketUpdate = useCallback((data) => {
    if (enableDebugLogging) {
      console.log('📊 SLA WebSocket - Ticket updated:', data)
    }

    try {
      const enhancedTicket = processTicketForSLA(data.ticket || data)

      // Call the ticket update callback
      if (onTicketUpdate) {
        onTicketUpdate(enhancedTicket)
      }

      // Update SLA metrics
      updateSLAMetrics(enhancedTicket)
      
      lastUpdateRef.current = new Date()
    } catch (error) {
      console.error('Error processing SLA ticket update:', error)
    }
  }, [onTicketUpdate, enableDebugLogging, processTicketForSLA])

  const handleNewTicket = useCallback((data) => {
    if (enableDebugLogging) {
      console.log('📊 SLA WebSocket - New ticket:', data)
    }

    try {
      const enhancedTicket = processTicketForSLA(data.ticket || data)

      // Call the ticket update callback for new tickets too
      if (onTicketUpdate) {
        onTicketUpdate(enhancedTicket, 'new')
      }

      // Update SLA metrics
      updateSLAMetrics(enhancedTicket, 'add')
      
      lastUpdateRef.current = new Date()
    } catch (error) {
      console.error('Error processing new SLA ticket:', error)
    }
  }, [onTicketUpdate, enableDebugLogging, processTicketForSLA])

  const handleSLABreach = useCallback((data) => {
    if (enableDebugLogging) {
      console.log('🚨 SLA WebSocket - SLA breach detected:', data)
    }

    try {
      // Handle SLA breach notifications
      if (onSLAUpdate) {
        onSLAUpdate({
          type: 'breach',
          ticket: data,
          timestamp: new Date()
        })
      }

      lastUpdateRef.current = new Date()
    } catch (error) {
      console.error('Error processing SLA breach:', error)
    }
  }, [onSLAUpdate, enableDebugLogging])

  const handleSLAWarning = useCallback((data) => {
    if (enableDebugLogging) {
      console.log('⚠️ SLA WebSocket - SLA warning:', data)
    }

    try {
      // Handle SLA warning notifications
      if (onSLAUpdate) {
        onSLAUpdate({
          type: 'warning',
          ticket: data,
          timestamp: new Date()
        })
      }

      lastUpdateRef.current = new Date()
    } catch (error) {
      console.error('Error processing SLA warning:', error)
    }
  }, [onSLAUpdate, enableDebugLogging])

  // Update local SLA metrics based on ticket changes
  const updateSLAMetrics = useCallback((ticket, action = 'update') => {
    const currentMetrics = { ...slaMetricsRef.current }

    if (action === 'add') {
      currentMetrics.totalTickets++
    }

    // Update status counts based on SLA info
    if (ticket.slaInfo) {
      switch (ticket.slaInfo.status) {
        case 'breached':
          currentMetrics.breached++
          break
        case 'critical':
          currentMetrics.critical++
          break
        case 'warning':
          currentMetrics.warning++
          break
        case 'safe':
          currentMetrics.safe++
          break
      }
    }

    slaMetricsRef.current = currentMetrics

    // Notify about metrics update
    if (onSLAUpdate) {
      onSLAUpdate({
        type: 'metrics',
        metrics: currentMetrics,
        timestamp: new Date()
      })
    }
  }, [onSLAUpdate])

  // Connect to WebSocket and set up event listeners
  const connect = useCallback(() => {
    try {
      if (enableDebugLogging) {
        console.log('📊 SLA WebSocket - Connecting...')
      }

      // Connect using existing WebSocket service
      webSocketService.connect()

      // Set up connection status listener
      const connectionId = webSocketService.on('connection', (data) => {
        setIsConnected(data.connected)
        if (enableDebugLogging) {
          console.log('📊 SLA WebSocket - Connection status:', data.connected)
        }
      })

      // Set up ticket event listeners
      const ticketUpdateId = webSocketService.on('ticket:updated', handleTicketUpdate)
      const newTicketId = webSocketService.on('ticket:created', handleNewTicket)

      // Set up SLA-specific event listeners
      const slaBreachId = webSocketService.on('sla:breach', handleSLABreach)
      const slaWarningId = webSocketService.on('sla:warning', handleSLAWarning)
      const slaCriticalId = webSocketService.on('sla:critical', (data) => {
        if (enableDebugLogging) {
          console.log('🔥 SLA WebSocket - Critical SLA alert:', data)
        }
        if (onSLAUpdate) {
          onSLAUpdate({
            type: 'critical',
            ticket: data,
            timestamp: new Date()
          })
        }
      })

      // Store event handler IDs for cleanup
      eventHandlerIdsRef.current = [
        connectionId,
        ticketUpdateId,
        newTicketId,
        slaBreachId,
        slaWarningId,
        slaCriticalId
      ]

    } catch (error) {
      console.error('Error connecting SLA WebSocket:', error)
    }
  }, [handleTicketUpdate, handleNewTicket, handleSLABreach, handleSLAWarning, onSLAUpdate, enableDebugLogging])

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    try {
      if (enableDebugLogging) {
        console.log('📊 SLA WebSocket - Disconnecting...')
      }

      // Remove all event listeners
      eventHandlerIdsRef.current.forEach(id => {
        webSocketService.off(id)
      })
      eventHandlerIdsRef.current = []

      // Disconnect the WebSocket service
      webSocketService.disconnect()
      setIsConnected(false)

    } catch (error) {
      console.error('Error disconnecting SLA WebSocket:', error)
    }
  }, [enableDebugLogging])

  // Auto-refresh mechanism
  useEffect(() => {
    if (!autoRefreshInterval) return

    const interval = setInterval(() => {
      if (enableDebugLogging) {
        console.log('📊 SLA WebSocket - Auto refresh triggered')
      }
      
      // Trigger a refresh notification
      if (onSLAUpdate) {
        onSLAUpdate({
          type: 'refresh',
          timestamp: new Date()
        })
      }
    }, autoRefreshInterval)

    return () => clearInterval(interval)
  }, [autoRefreshInterval, onSLAUpdate, enableDebugLogging])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  // Provide utility functions
  const getLastUpdateTime = useCallback(() => lastUpdateRef.current, [])
  const getCurrentMetrics = useCallback(() => slaMetricsRef.current, [])

  return {
    isConnected,
    connect,
    disconnect,
    getLastUpdateTime,
    getCurrentMetrics,
    // Expose refs for advanced usage
    lastUpdate: lastUpdateRef.current,
    currentMetrics: slaMetricsRef.current
  }
}

export default useSLAWebSocket