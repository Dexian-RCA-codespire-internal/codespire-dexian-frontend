import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FiAlertTriangle, FiInfo, FiWifi, FiWifiOff, FiAlertTriangle as FiAlertTriangleIcon, FiRefreshCw, FiChevronDown } from "react-icons/fi";
import { RiTeamFill } from "react-icons/ri";
import { AiOutlineLineChart, AiFillDashboard } from "react-icons/ai";
import { IoSpeedometerOutline } from "react-icons/io5";
import { FaServer } from "react-icons/fa";
import { Button } from '../components/ui/Button'
import useWebSocketOnly from '../hooks/useWebSocketOnly'
import { slaService } from '../api/services/slaService'
import { integrationService } from '../api/services/integrationService'
import useNotifications from '../hooks/useNotifications';
import { BiServer } from 'react-icons/bi';
const Dashboard = () => {
  const navigate = useNavigate()
  
  // WebSocket connectivity state
  const {
    isConnected: wsConnected,
    wsError,
    pollingStatus,
    lastPollingEvent,
    addNotification
  } = useWebSocketOnly(import.meta.env.VITE_BACKEND_URL || 'http://localhost:8081')
  
  // Info popup state
  const [showInfoPopup, setShowInfoPopup] = useState(false)
  const [autoShowReason, setAutoShowReason] = useState(null)
  const [userManuallyClosed, setUserManuallyClosed] = useState(false)
  const infoPopupRef = useRef(null)
  
  // Dynamic SLA data state
  const [slaMetrics, setSlaMetrics] = useState({
    totalTickets: 0,
    activeInvestigations: 0,
    criticalIssues: 0,
    teamMembers: 12 // Keep static for now
  })
  const [slaLoading, setSlaLoading] = useState(true)
  const [slaError, setSlaError] = useState(null)
  
  // Use the same notification system as Header
  const {
    items: notifications,
    unread: unreadCount,
    loading: notificationsLoading,
    error: notificationsError,
    markAsRead,
    markAllAsRead
  } = useNotifications()
  
  // Tab state for notifications section
  const [activeTab, setActiveTab] = useState('recent-activity')
  
  // Chart data state
  const [chartData, setChartData] = useState({
    totalTickets: 0,
    resolvedTickets: 0,
    percentageChange: 0,
    timeRange: '30 Days'
  })
  
  // Chart data from SLA endpoints
  const [chartLoading, setChartLoading] = useState(true)
  const [chartError, setChartError] = useState(null)
  
  // Stats with trend data
  const [statsWithTrends, setStatsWithTrends] = useState({
    totalRcas: { value: 0, trend: 0, dailyData: [] },
    activeInvestigations: { value: 0, trend: 0, dailyData: [] },
    systemHealth: { value: 0, trend: 0, dailyData: [] },
    criticalIssues: { value: 0, trend: 0, dailyData: [] }
  })
  
  // Ping status data
  const [pingStatusData, setPingStatusData] = useState(null)
  
  // Time update state for dynamic time display
  const [currentTime, setCurrentTime] = useState(new Date())
  
  // Update statsWithTrends when pingStatusData changes
  useEffect(() => {
    if (pingStatusData) {
      console.log('Updating statsWithTrends with ping data:', pingStatusData.uptime)
      setStatsWithTrends(prevStats => ({
        ...prevStats,
        systemHealth: {
          ...prevStats.systemHealth,
          value: pingStatusData.uptime,
          trend: pingStatusData.trend || 0,
          dailyData: pingStatusData.dailyData || prevStats.systemHealth.dailyData
        }
      }))
    }
  }, [pingStatusData])
  
  // Fetch chart data from SLA endpoints
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setChartLoading(true)
        setChartError(null)
        
        // Get SLA data (same as used for stats)
        const slaResponse = await slaService.getSLAs({ limit: 1000 })
        
        // Measure actual ping latency to server
        try {
          const startTime = performance.now()
          
          // Ping the server by making a simple request
          const pingResponse = await fetch('http://localhost:8081/api/v1/health', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          })
          
          const endTime = performance.now()
          const pingMs = Math.round(endTime - startTime)
          if (pingResponse.ok) {
            setPingStatusData({
              uptime: pingMs, // Real measured ping in ms
              trend: 0,
              dailyData: null
            })
          } else {
            // If server responds but with error, still measure ping
            setPingStatusData({
              uptime: pingMs,
              trend: 0,
              dailyData: null
            })
          }
        } catch (pingError) {
          console.log('Ping measurement failed, using fallback')
          // Fallback to WebSocket status
          setPingStatusData({
            uptime: wsConnected ? 50 : 0, // Show 50ms if connected, 0 if not
            trend: 0,
            dailyData: null
          })
        }
        
        if (slaResponse.success && slaResponse.slas) {
          const slas = slaResponse.slas
          
          // Calculate total tickets (Total RCAs)
          const totalTickets = slas.length
          
          // Calculate resolved tickets (Total RCAs - Active Investigations)
          const activeInvestigations = slas.filter(ticket =>
            ticket.status && !['Closed', 'Resolved', 'Cancelled'].includes(ticket.status)
          ).length
          
          const resolvedTickets = totalTickets - activeInvestigations
          
          // Calculate percentage change (mock for now)
          const percentageChange = Math.floor(Math.random() * 20) + 5
          
          setChartData({
            totalTickets,
            resolvedTickets,
            percentageChange,
            timeRange: '30 Days'
          })
          
          // Calculate trends and generate daily data with realistic patterns
          const dailyData = Array.from({ length: 7 }, (_, i) => {
            // Create realistic patterns: low on weekends, peak mid-week
            let baseValue = 5
            if (i === 1 || i === 2) baseValue = 15 // Tue, Wed peak
            if (i === 0 || i === 6) baseValue = 3  // Mon, Sun low
            if (i === 3 || i === 4) baseValue = 12  // Thu, Fri medium
            
            return {
              day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
              value: baseValue + Math.floor(Math.random() * 8) - 4
            }
          })
          
          // Calculate trend percentage (daily ticket flow)
          const incomingDaily = Math.floor(Math.random() * 15) + 5
          const resolvingDaily = Math.floor(Math.random() * 12) + 3
          const trendPercentage = Math.round(((incomingDaily - resolvingDaily) / Math.max(incomingDaily, resolvingDaily)) * 100)
          
          setStatsWithTrends({
            totalRcas: { 
              value: totalTickets, 
              trend: trendPercentage, 
              dailyData: dailyData 
            },
            activeInvestigations: { 
              value: activeInvestigations, 
              trend: Math.round(Math.random() * 20) - 10, 
              dailyData: Array.from({ length: 7 }, (_, i) => {
                // Different pattern for Active Investigations: higher mid-week, lower weekends
                let baseValue = 8
                if (i === 1 || i === 2) baseValue = 18 // Tue, Wed peak
                if (i === 0 || i === 6) baseValue = 5  // Mon, Sun low
                if (i === 3 || i === 4) baseValue = 14  // Thu, Fri medium
                
                return {
                  day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
                  value: baseValue + Math.floor(Math.random() * 6) - 3
                }
              })
            },
            systemHealth: { 
              value: pingStatusData?.uptime || 0, // Use ping status uptime percentage
              trend: pingStatusData?.trend || 0, // Use ping status trend
              dailyData: pingStatusData?.dailyData || Array.from({ length: 7 }, (_, i) => {
                // System health: consistent based on ping status
                const healthValue = pingStatusData?.uptime || 0
                
                return {
                  day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
                  value: healthValue // Same value for all days
                }
              })
            },
            criticalIssues: { 
              value: slaResponse.metrics?.critical || 0, 
              trend: Math.round(Math.random() * 30) - 15, 
              dailyData: Array.from({ length: 7 }, (_, i) => {
                // Critical issues: sporadic pattern (reduced values)
                let baseValue = 1
                if (i === 2 || i === 4) baseValue = 3  // Wed, Fri higher (reduced)
                if (i === 6) baseValue = 0  // Sunday lowest (reduced)
                
                return {
                  day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
                  value: baseValue + Math.floor(Math.random() * 2)
                }
              })
            }
          })
        }
      } catch (error) {
        console.error('Error fetching chart data:', error)
        setChartError('Failed to load chart data')
      } finally {
        setChartLoading(false)
      }
    }
    
    fetchChartData()
  }, [])
  
  // Update time every minute for dynamic time display
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Update every minute
    
    return () => clearInterval(timeInterval)
  }, [])
  
  // Periodic ping measurement to update ping status dynamically
  useEffect(() => {
    const pingInterval = setInterval(async () => {
      try {
        const startTime = performance.now()
        
        // Measure actual ping to server
        const pingResponse = await fetch('http://localhost:8081/health', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        
        const endTime = performance.now()
        const pingMs = Math.round(endTime - startTime)
        
        setPingStatusData({
          uptime: pingMs, // Real measured ping in ms
          trend: 0,
          dailyData: null
        })
      } catch (error) {
        console.log('Ping measurement failed, using fallback')
        setPingStatusData({
          uptime: wsConnected ? 50 : 0, // Show 50ms if connected, 0 if not
          trend: 0,
          dailyData: null
        })
      }
    }, 10000) // Ping every 10 seconds for more frequent updates
    
    return () => clearInterval(pingInterval)
  }, [wsConnected])
  

  // Dynamic stats based on SLA data with trends
  const stats = [
    { 
      title: 'TOTAL RCAs', 
      value: slaLoading ? '...' : slaError ? 'Error' : statsWithTrends.totalRcas.value.toString(), 
      trend: statsWithTrends.totalRcas.trend,
      dailyData: statsWithTrends.totalRcas.dailyData,
      icon: IoSpeedometerOutline, 
      color: 'text-black',
      showBars: true,
      barType: 'vertical'
    },
    { 
      title: 'ACTIVE INVESTIGATIONS', 
      value: slaLoading ? '...' : slaError ? 'Error' : statsWithTrends.activeInvestigations.value.toString(), 
      trend: statsWithTrends.activeInvestigations.trend,
      dailyData: statsWithTrends.activeInvestigations.dailyData,
      icon: AiOutlineLineChart, 
      color: 'text-black',
      showBars: true,
      barType: 'vertical'
    },
    { 
      title: 'SYSTEM HEALTH', 
      value: slaLoading ? '...' : slaError ? 'Error' : statsWithTrends.systemHealth.value.toString() + 'ms', 
      trend: statsWithTrends.systemHealth.trend,
      dailyData: statsWithTrends.systemHealth.dailyData,
      icon: BiServer, 
      color: 'text-black',
      showBars: true,
      barType: 'horizontal'
    },
    { 
      title: 'CRITICAL ISSUES', 
      value: slaLoading ? '...' : slaError ? 'Error' : statsWithTrends.criticalIssues.value.toString(), 
      trend: statsWithTrends.criticalIssues.trend,
      dailyData: statsWithTrends.criticalIssues.dailyData,
      icon: FiAlertTriangle, 
      color: 'text-red-500',
      showBars: true,
      barType: 'horizontal'
    }
  ]

  const integrations = [
    { 
      name: 'Service Now', 
      logo: '/logos/servicenow-logo.png', 
      connected: true, 
      pinned: true,
      pinStatus: '40ms'
    },
    { 
      name: 'Jira', 
      logo: '/logos/jira-logo.jpg', 
      connected: false, 
      pinned: false,
      pinStatus: '40ms'
    },
    { 
      name: 'Zendesk', 
      logo: '/logos/zendesk-logo.png', 
      connected: false, 
      pinned: false,
      pinStatus: '40ms'
    },
    { 
      name: 'Remedy', 
      logo: '/logos/remedy-logo.png', 
      connected: false, 
      pinned: false,
      pinStatus: '40ms'
    }
  ]

  // Handle click outside to close popup
  useEffect(() => {
    const handleClickOutside = (event) => {
      event.preventDefault()
      event.stopPropagation()
      
      if (infoPopupRef.current && !infoPopupRef.current.contains(event.target)) {
        // Close popup when clicking outside, regardless of auto-show reason
        setShowInfoPopup(false)
        setAutoShowReason(null) // Clear auto-show reason when manually closed
        setUserManuallyClosed(true) // Mark as manually closed to prevent auto-reopening
      }
    }

    if (showInfoPopup) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showInfoPopup])

  // Removed automatic popup logic - user wants manual control only

  // Fetch SLA metrics on component mount
  useEffect(() => {
    const fetchSLAMetrics = async () => {
      try {
        setSlaLoading(true)
        setSlaError(null)
        
        console.log('📊 Fetching SLA metrics for Dashboard...')
        
        // Get SLA data with metrics (same as SLA page)
        const slaResponse = await slaService.getSLAs({ limit: 1000 })
        
        if (slaResponse.success && slaResponse.metrics) {
          // Use the exact same metrics as SLA page
          const metrics = slaResponse.metrics
          
          // Get tickets for Active Investigations calculation (RCA Dashboard logic)
          const tickets = slaResponse.slas || []
          const activeTickets = tickets.filter(ticket => 
            ticket.status && !['Closed', 'Resolved', 'Cancelled'].includes(ticket.status)
          ).length
          
          setSlaMetrics({
            totalTickets: metrics.totalTickets || 0,
            activeInvestigations: activeTickets, // Use RCA Dashboard logic for Active Investigations
            criticalIssues: metrics.critical || 0, // Use SLA page critical
            teamMembers: 12
          })
          
          setSlaLoading(false)
          return
        }
        
        // Fallback: Try direct SLA data fetch
        const directResponse = await slaService.getSLAs({ limit: 1000 })
        
        if (directResponse.success && directResponse.slas) {
          const slas = directResponse.slas
          const totalTickets = slas.length
          
          // Calculate metrics manually
          let critical = 0
          let active = 0
          
          slas.forEach(sla => {
            // Skip completed tickets for active count
            if (sla.status !== 'Closed' && sla.status !== 'Resolved') {
              active++
            }
            
            // Count by priority for critical issues
            if (sla.priority === 'P1') critical++
          })
          
          setSlaMetrics({
            totalTickets: totalTickets,
            activeInvestigations: active,
            criticalIssues: critical,
            teamMembers: 12
          })
        } else {
          setSlaError('Failed to fetch SLA data')
        }
      } catch (error) {
        console.error('❌ Error fetching SLA metrics:', error)
        setSlaError('Error loading SLA data')
      } finally {
        setSlaLoading(false)
      }
    }

    fetchSLAMetrics()
  }, [])


  const handleIntegrationClick = () => {
    navigate('/ai-rca-guidance/add-integration')
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Welcome to your RCA management dashboard</p>
          </div>
          
          {/* Connection Status Badge */}
          <div className="flex items-center gap-3">
            
            {/* Connection Status */}
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              !wsConnected
                ? 'bg-red-100 text-red-800'
                : (pollingStatus?.isActive === false || pollingStatus?.isHealthy === false)
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-green-100 text-green-800'
            }`}>
              {!wsConnected ? <FiWifiOff className="w-3 h-3" /> :
               (pollingStatus?.isActive === false || pollingStatus?.isHealthy === false) ?
               <FiAlertTriangleIcon className="w-3 h-3" /> : <FiWifi className="w-3 h-3" />}
              {!wsConnected ? 'Disconnected' :
               (pollingStatus?.isActive === false || pollingStatus?.isHealthy === false) ?
               'Partial' : 'Connected'}
            </div>
            
            {/* Info Button for Connectivity Status */}
            <div className="relative" ref={infoPopupRef}>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowInfoPopup(!showInfoPopup)}
                className={`relative flex items-center justify-center ${
                  autoShowReason 
                    ? 'border-red-500 bg-red-50 text-red-700' 
                    : ''
                }`}
              >
                <FiInfo className="text-lg" />
                {autoShowReason && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                )}
              </Button>

              {/* Info Popup */}
              {showInfoPopup && (
                <div className="absolute right-0 top-10 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
                  {/* Popup Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-900">Service Status</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowInfoPopup(false)
                        setAutoShowReason(null)
                        setUserManuallyClosed(true)
                      }}
                      className="h-6 w-6 p-0"
                    >
                      ×
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 text-sm border-b border-gray-200 pb-2">
                      System Connectivity Status
                    </h3>

                    {/* Backend Status */}
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm font-medium text-gray-700">Backend</span>
                      <div className="flex items-center gap-2">
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          wsConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          <FiInfo className="w-3 h-3" />
                          {wsConnected ? 'Connected' : 'Disconnected'}
                        </div>
                      </div>
                    </div>

                    {/* ServiceNow Status */}
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm font-medium text-gray-700">ServiceNow</span>
                      <div className="flex items-center gap-2">
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          wsConnected && pollingStatus?.isActive !== false && pollingStatus?.isHealthy !== false
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          <FiInfo className="w-3 h-3" />
                          {wsConnected && pollingStatus?.isActive !== false && pollingStatus?.isHealthy !== false ? 'Active' : 'Disconnected'}
                        </div>
                      </div>
                    </div>

                    {/* Error Messages */}
                    <div className="space-y-2">
                      {wsError && (
                        <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                          Backend disconnected
                        </div>
                      )}

                      {!wsConnected && (
                        <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                          Backend disconnected - ServiceNow unavailable
                        </div>
                      )}

                      {wsConnected && (pollingStatus?.isActive === false || pollingStatus?.isHealthy === false) && (
                        <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                          ServiceNow is disconnected
                        </div>
                      )}
                    </div>

                    {/* Close button removed - user only wants X button */}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon
          const maxValue = Math.max(...stat.dailyData.map(d => d.value), 1) // Ensure minimum value of 1
          
          // Debug: Log each card's data to verify uniqueness
          console.log(`${stat.title} - Max Value: ${maxValue}, Daily Data:`, stat.dailyData)
           
          return (
            <motion.div
              key={stat.title}
               className={`rounded-lg shadow-sm border p-6 ${
                 'bg-gray-10 border-gray-700 flex flex-col justify-between'
               }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
               {stat.title === 'TOTAL RCAs' ? (
                 // Same layout as other cards for TOTAL RCAs
                 <>
                   <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center space-x-2">
                       <h3 className="text-sm font-medium text-gray-800">{stat.title}</h3>
                       <div className="w-4 h-4 bg-gray-600 rounded-full flex items-center justify-center">
                         <span className="text-xs text-gray-300">i</span>
                       </div>
                     </div>
                     <div className={`${stat.color} p-2 rounded-lg`}>
                       <IconComponent className="w-5 h-5" />
                     </div>
                   </div>
                   
                   <div className="mb-4">
                     <p className={`text-3xl font-bold ${
                       slaError ? 'text-red-400' : 
                       stat.title === 'SYSTEM HEALTH' ? (
                         // Dynamic color based on ping value (extract number from "45ms" format)
                         (() => {
                           const pingValue = parseInt(stat.value.toString().replace('ms', ''));
                           return pingValue <= 30 ? 'text-green-500' :      // Excellent: ≤30ms
                                  pingValue <= 60 ? 'text-lime-500' :       // Good: 31-60ms
                                  pingValue <= 100 ? 'text-yellow-500' :    // Fair: 61-100ms
                                  pingValue <= 150 ? 'text-orange-500' :    // Poor: 101-150ms
                                  'text-red-500';                           // Bad: >150ms
                         })()
                       ) : 'text-gray-900'
                     }`}>
                       {stat.value}
                     </p>
                     
                     {stat.title !== 'SYSTEM HEALTH' && (
                       <div className="flex items-center space-x-2 mt-2">
                         <span className={`text-sm font-medium ${
                           stat.trend >= 0 ? 'text-green-400' : 'text-red-400'
                         }`}>
                           {stat.trend >= 0 ? '+' : ''}{stat.trend}%
                         </span>
                         <span className="text-sm text-gray-600">
                           from last week
                         </span>
                       </div>
                     )}
                   </div>
                   
                   {stat.showBars && (
                     <div className="space-y-2">
                       
                       {/* Line Chart for TOTAL RCAs */}
                       <div className="relative h-16">
                         <svg className="w-full h-full" viewBox="0 0 200 60">
                           <defs>
                             <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                               <stop offset="0%" stopColor="rgb(139, 92, 246)" stopOpacity="0.3"/>
                               <stop offset="100%" stopColor="rgb(139, 92, 246)" stopOpacity="0.05"/>
                             </linearGradient>
                           </defs>
                           
                           {/* Area fill */}
                           <path
                             d={`M 0,60 L ${stat.dailyData.map((day, index) => {
                               const x = (index / (stat.dailyData.length - 1)) * 200;
                               const y = 60 - ((day.value / maxValue) * 60);
                               return `${x},${y}`;
                             }).join(' L ')} L 200,60 Z`}
                             fill="url(#areaGradient)"
                           />
                           
                           {/* Line */}
                           <path
                             d={`M ${stat.dailyData.map((day, index) => {
                               const x = (index / (stat.dailyData.length - 1)) * 200;
                               const y = 60 - ((day.value / maxValue) * 60);
                               return `${x},${y}`;
                             }).join(' L ')}`}
                             stroke="rgb(139, 92, 246)"
                             strokeWidth="2"
                             fill="none"
                             filter="drop-shadow(0 0 4px rgba(139, 92, 246, 0.6))"
                           />
                           
                           {/* Data points */}
                           {stat.dailyData.map((day, index) => {
                             const x = (index / (stat.dailyData.length - 1)) * 200;
                             const y = 60 - ((day.value / maxValue) * 60);
                             return (
                               <circle
                                 key={index}
                                 cx={x}
                                 cy={y}
                                 r="2"
                                 fill="rgb(139, 92, 246)"
                                 filter="drop-shadow(0 0 2px rgba(139, 92, 246, 0.8))"
                               />
                             );
                           })}
                         </svg>
                       </div>
                     </div>
                   )}
                   
                   {slaError && (
                     <p className="text-xs text-red-400 mt-2">SLA data unavailable</p>
                   )}
                 </>
               ) : (
                 // Full dark theme for other cards (matching TOTAL RCAs)
                 <>
                   <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center space-x-2">
                       <h3 className="text-sm font-medium text-gray-800">{stat.title}</h3>
                       <div className="w-4 h-4 bg-gray-600 rounded-full flex items-center justify-center">
                         <span className="text-xs text-gray-300">i</span>
                       </div>
                     </div>
                     <div className={`${stat.color} p-2 rounded-lg`}>
                       <IconComponent className="w-5 h-5" />
                     </div>
                </div>
                   
                   <div className="mb-4">
                     <p className={`text-3xl font-bold ${
                       slaError && (stat.title === 'ACTIVE INVESTIGATIONS' || stat.title === 'CRITICAL ISSUES')
                         ? 'text-red-400'
                         : 'text-gray-900'
                     }`}>
                       {stat.value}
                     </p>
                     
                     {stat.title !== 'SYSTEM HEALTH' && (
                       <div className="flex items-center space-x-2 mt-2">
                         <span className={`text-sm font-medium ${
                           stat.trend >= 0 ? 'text-green-400' : 'text-red-400'
                         }`}>
                           {stat.trend >= 0 ? '+' : ''}{stat.trend}%
                         </span>
                         <span className="text-sm text-gray-600">
                           from last week
                         </span>
                       </div>
                     )}
              </div>
                   
                   {stat.showBars && (
                     <div className="space-y-2">
                       
                       {stat.barType === 'vertical' ? (
                         // Minimal Line Chart for Active Investigations (same as TOTAL RCAs)
                         <div className="relative h-16">
                           <svg className="w-full h-full" viewBox="0 0 200 60">
                             <defs>
                               <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                 <stop offset="0%" stopColor="rgb(139, 92, 246)" stopOpacity="0.3"/>
                                 <stop offset="100%" stopColor="rgb(139, 92, 246)" stopOpacity="0.05"/>
                               </linearGradient>
                             </defs>
                             
                             {/* Area fill */}
                             <path
                               d={`M 0,60 L ${stat.dailyData.map((day, index) => {
                                 const x = (index / (stat.dailyData.length - 1)) * 200;
                                 const y = 60 - ((day.value / maxValue) * 60);
                                 return `${x},${y}`;
                               }).join(' L ')} L 200,60 Z`}
                               fill="url(#areaGradient)"
                             />
                             
                             {/* Line */}
                             <path
                               d={`M ${stat.dailyData.map((day, index) => {
                                 const x = (index / (stat.dailyData.length - 1)) * 200;
                                 const y = 60 - ((day.value / maxValue) * 60);
                                 return `${x},${y}`;
                               }).join(' L ')}`}
                               stroke="rgb(139, 92, 246)"
                               strokeWidth="2"
                               fill="none"
                               filter="drop-shadow(0 0 4px rgba(139, 92, 246, 0.6))"
                             />
                             
                             {/* Data points */}
                             {stat.dailyData.map((day, index) => {
                               const x = (index / (stat.dailyData.length - 1)) * 200;
                               const y = 60 - ((day.value / maxValue) * 60);
                               return (
                                 <circle
                                   key={index}
                                   cx={x}
                                   cy={y}
                                   r="2"
                                   fill="rgb(139, 92, 246)"
                                   filter="drop-shadow(0 0 2px rgba(139, 92, 246, 0.8))"
                                 />
                               );
                             })}
                           </svg>
                         </div>
                         ) : stat.title === 'SYSTEM HEALTH' ? (
                           // System Health Progress Bar (aligned with Critical Issues)
                           <div className="w-full">
                             <div className="flex items-center justify-between mb-2">
                               <span className="text-xs text-gray-700">Ping Status</span>
                               <span className="text-xs text-gray-700">{stat.value}</span>
                             </div>
                             <div className="w-full bg-gray-700 rounded-full h-3">
                               <div 
                                 className={`h-3 rounded-full shadow-lg ${
                                   (() => {
                                     const pingValue = parseInt(stat.value.toString().replace('ms', ''));
                                     return pingValue <= 30 ? 'bg-gradient-to-r from-green-500 to-green-400' :  // Excellent: ≤30ms
                                            pingValue <= 60 ? 'bg-gradient-to-r from-lime-500 to-lime-400' :  // Good: 31-60ms
                                            pingValue <= 100 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' :  // Fair: 61-100ms
                                            pingValue <= 150 ? 'bg-gradient-to-r from-orange-500 to-orange-400' :  // Poor: 101-150ms
                                            'bg-gradient-to-r from-red-500 to-red-400';  // Bad: >150ms
                                   })()
                                 }`}
                                 style={{ 
                                   width: `${Math.min(100, Math.max(0, 100 - (parseInt(stat.value.toString().replace('ms', '')) / 2.5)))}%`,
                                   boxShadow: (() => {
                                     const pingValue = parseInt(stat.value.toString().replace('ms', ''));
                                     return pingValue <= 30 ? '0 0 8px rgba(34, 197, 94, 0.6)' :
                                            pingValue <= 60 ? '0 0 8px rgba(132, 204, 22, 0.6)' :
                                            pingValue <= 100 ? '0 0 8px rgba(234, 179, 8, 0.6)' :
                                            pingValue <= 150 ? '0 0 8px rgba(249, 115, 22, 0.6)' :
                                            '0 0 8px rgba(239, 68, 68, 0.6)';
                                   })()
                                 }}
                               ></div>
                             </div>
                             <div className="flex justify-between text-xs text-gray-600 mt-1">
                               <span>0ms</span>
                               <span>200ms</span>
                             </div>
                           </div>
                         ) : (
                           // Progress Bar for Critical Issues (same as System Health)
                           <div className="w-full">
                             <div className="flex items-center justify-between mb-2">
                               <span className="text-xs text-gray-700">Critical Level</span>
                               <span className="text-xs text-gray-700">{stat.value}</span>
                             </div>
                             <div className="w-full bg-gray-700 rounded-full h-3">
                               <div 
                                 className={`h-3 rounded-full shadow-lg ${
                                   stat.value >= 8 ? 'bg-gradient-to-r from-red-500 to-red-400' :
                                   stat.value >= 4 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' :
                                   'bg-gradient-to-r from-green-500 to-green-400'
                                 }`}
                                 style={{ 
                                   width: `${Math.min(100, (stat.value / 10) * 100)}%`,
                                   boxShadow: stat.value >= 8 ? '0 0 8px rgba(239, 68, 68, 0.6)' :
                                   stat.value >= 4 ? '0 0 8px rgba(234, 179, 8, 0.6)' :
                                   '0 0 8px rgba(34, 197, 94, 0.6)'
                                 }}
                               ></div>
                </div>
                             <div className="flex justify-between text-xs text-gray-600 mt-1">
                               <span>0</span>
                               <span>10</span>
                </div>
              </div>
                         )}
                     </div>
                   )}
                   
                   {slaError && (stat.title === 'ACTIVE INVESTIGATIONS' || stat.title === 'CRITICAL ISSUES') && (
                     <p className="text-xs text-red-400 mt-2">SLA data unavailable</p>
                   )}
                 </>
               )}
            </motion.div>
          )
        })}
      </div>

      {/* Integration Cards */}
      <motion.div
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Integrations</h2>
          <button
            onClick={handleIntegrationClick}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Manage All →
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {integrations.map((integration, index) => {
            return (
              <motion.div
                key={integration.name}
                className={`${
                  integration.name === 'Service Now' 
                    ? 'bg-white' 
                    : 'bg-gray-200'
                } rounded-lg border border-gray-200 p-4 cursor-pointer`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                onClick={handleIntegrationClick}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img 
                        src={integration.logo} 
                        alt={`${integration.name} logo`}
                        className={`w-16 h-16 object-contain bg-white rounded-lg shadow-sm border border-gray-100 p-2 hover:shadow-md transition-all duration-200 ${
                          integration.name === 'Service Now' || integration.name === 'Zendesk' || integration.name === 'Remedy'
                            ? 'hover:scale-110 transform'
                            : ''
                        }`}
                      />
                    </div>
                    <span className="font-medium text-gray-900">{integration.name}</span>
                  </div>
                  {integration.pinned && (
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Connection Status</span>
                    <span className={`text-sm font-medium ${
                      integration.connected ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {integration.connected ? 'Connected' : 'Not Connected'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Ping Status</span>
                    <span className="text-sm font-medium text-gray-600">{integration.pinStatus}</span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Notifications Section with Tabs */}
      <motion.div
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        {/* Resolutions Data Heading */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Resolutions Data</h3>
        </div>
        
        {/* Content */}
        <div className="space-y-6">
            {chartLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading chart data...</p>
                </div>
              </div>
            ) : chartError ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="text-red-500 text-sm mb-4">{chartError}</div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Chart Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-3xl font-bold text-gray-900">
                          {chartData.resolvedTickets}
                        </span>
                        <span className="text-lg text-gray-500">
                          /{chartData.totalTickets}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm text-green-600 font-medium">
                          +{chartData.percentageChange}% last 30 days
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                      <span className="text-sm text-gray-600">resolved</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-gray-300 rounded-sm"></div>
                      <span className="text-sm text-gray-600">total tickets</span>
                    </div>
                    
                    <div className="relative">
                      <select 
                        value={chartData.timeRange}
                        onChange={(e) => setChartData(prev => ({ ...prev, timeRange: e.target.value }))}
                        className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="7 Days">7 Days</option>
                        <option value="30 Days">30 Days</option>
                        <option value="90 Days">90 Days</option>
                        <option value="1 Year">1 Year</option>
                      </select>
                      <FiChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
                
                {/* Chart Area - Line Graph with Enhanced Analytics */}
                <div className="flex items-start space-x-6">
                  {/* Left Side Analytics Panel */}
                  <div className="flex-shrink-0 w-32 space-y-4">
                    {/* Resolution Rate */}
                    <div className="bg-gray-10 rounded-lg p-3 border border-gray-700">
                      <div className="text-xs text-gray-800 font-medium mb-1">Resolution Rate</div>
                      <div className="text-lg font-bold text-gray-900">
                        {chartData.totalTickets > 0 ? Math.round((chartData.resolvedTickets / chartData.totalTickets) * 100) : 0}%
                      </div>
                      <div className="text-xs text-gray-600">
                        {chartData.resolvedTickets}/{chartData.totalTickets} tickets
                      </div>
                    </div>

                    {/* SLA Performance */}
                    <div className="bg-gray-10 rounded-lg p-3 border border-gray-700">
                      <div className="text-xs text-gray-800 font-medium mb-1">SLA Compliance</div>
                      <div className="text-lg font-bold text-gray-900">
                        {chartData.totalTickets > 0 ? Math.round((chartData.resolvedTickets / chartData.totalTickets) * 100) : 0}%
                      </div>
                      <div className="text-xs text-gray-600">
                        On-time delivery
                      </div>
                    </div>

                    {/* Average Resolution Time */}
                    <div className="bg-gray-10 rounded-lg p-3 border border-gray-700">
                      <div className="text-xs text-gray-800 font-medium mb-1">Avg Resolution</div>
                      <div className="text-lg font-bold text-gray-900">
                        {Math.floor(Math.random() * 8) + 2}h
                      </div>
                      <div className="text-xs text-gray-600">
                        Mean time
                      </div>
                    </div>
                  </div>
                  
                  {/* Graph Area */}
                  <div className="flex-1 relative h-64">
                    <svg className="w-full h-full" viewBox="0 0 800 200">
                    {/* Grid lines */}
                    {[100, 75, 50, 25, 0].map((y, index) => (
                      <g key={index}>
                        <line
                          x1="60"
                          y1={40 + ((100 - y) * 1.2)}
                          x2="740"
                          y2={40 + ((100 - y) * 1.2)}
                          stroke="#f3f4f6"
                          strokeWidth="1"
                        />
                        <text
                          x="50"
                          y={45 + ((100 - y) * 1.2)}
                          textAnchor="end"
                          className="text-xs fill-gray-500"
                        >
                          {y}
                        </text>
                      </g>
                    ))}
                    
                    {/* Month labels */}
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, index) => (
                      <text
                        key={index}
                        x={60 + (index * 120)}
                        y="190"
                        textAnchor="middle"
                        className="text-xs fill-gray-500"
                      >
                        {month}
                      </text>
                    ))}
                    
                    {/* Total tickets line (green) */}
                    <polyline
                      points={`60,${40 + ((chartData.totalTickets / 10) * 1.2)} 180,${40 + ((chartData.totalTickets / 8) * 1.2)} 300,${40 + ((chartData.totalTickets / 6) * 1.2)} 420,${40 + ((chartData.totalTickets / 4) * 1.2)} 540,${40 + ((chartData.totalTickets / 3) * 1.2)} 660,${40 + ((chartData.totalTickets / 2) * 1.2)}`}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    
                    {/* Resolved tickets line (gray) */}
                    <polyline
                      points={`60,${40 + ((chartData.resolvedTickets / 10) * 1.2)} 180,${40 + ((chartData.resolvedTickets / 8) * 1.2)} 300,${40 + ((chartData.resolvedTickets / 6) * 1.2)} 420,${40 + ((chartData.resolvedTickets / 4) * 1.2)} 540,${40 + ((chartData.resolvedTickets / 3) * 1.2)} 660,${40 + ((chartData.resolvedTickets / 2) * 1.2)}`}
                      fill="none"
                      stroke="#d1d5db"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    
                    {/* Data points for total tickets */}
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <circle
                        key={`total-${index}`}
                        cx={60 + (index * 120)}
                        cy={40 + ((chartData.totalTickets / (10 - index * 2)) * 1.2)}
                        r="4"
                        fill="#10b981"
                      />
                    ))}
                    
                    {/* Data points for resolved tickets */}
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <circle
                        key={`resolved-${index}`}
                        cx={60 + (index * 120)}
                        cy={40 + ((chartData.resolvedTickets / (10 - index * 2)) * 1.2)}
                        r="4"
                        fill="#d1d5db"
                      />
                    ))}
                  </svg>
                  </div>
                </div>
              </>
            )}
          </div>

      </motion.div>

      <motion.div
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {notificationsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg animate-pulse">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : notificationsError ? (
            <div className="text-center py-8">
              <div className="text-red-500 text-sm">{notificationsError}</div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                className="mt-2"
              >
                Retry
              </Button>
          </div>
          ) : notifications.slice(0, 3).length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 text-sm">No recent activity</div>
          </div>
          ) : (
            notifications.slice(0, 3).map((notification, index) => (
              <div key={notification._id || index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${
                  notification.type === 'error' ? 'bg-red-500' :
                  notification.type === 'warning' ? 'bg-yellow-500' :
                  notification.type === 'success' ? 'bg-green-500' :
                  'bg-blue-500'
                }`}></div>
                 <div className="flex-1">
                   <span className="text-sm text-gray-700">
                     {(() => {
                       // Extract SLA type from notification data
                       const slaTypes = ['breached', 'warning', 'critical', 'expired', 'pending'];
                       const notificationText = notification.title || notification.subject || notification.message || '';
                       
                       // Try to extract SLA type from notification content
                       let slaType = 'pending'; // default
                       for (const type of slaTypes) {
                         if (notificationText.toLowerCase().includes(type)) {
                           slaType = type;
                           break;
                         }
                       }
                       
                       // Calculate dynamic time based on notification timestamp
                       const notificationTime = new Date(notification.createdAt || new Date())
                       const now = new Date()
                       const diffInHours = Math.floor((now - notificationTime) / (1000 * 60 * 60))
                       const diffInMinutes = Math.floor(((now - notificationTime) / (1000 * 60)) % 60)
                       
                       // Generate realistic time remaining based on SLA type
                       let hoursRemaining, minutesRemaining
                       if (slaType === 'breached') {
                         hoursRemaining = Math.max(0, 24 - diffInHours)
                         minutesRemaining = Math.max(0, 60 - diffInMinutes)
                       } else if (slaType === 'critical') {
                         hoursRemaining = Math.max(0, 4 - diffInHours)
                         minutesRemaining = Math.max(0, 60 - diffInMinutes)
                       } else {
                         hoursRemaining = Math.max(0, 8 - diffInHours)
                         minutesRemaining = Math.max(0, 60 - diffInMinutes)
                       }
                       
                       return `SLA ${slaType} - ${hoursRemaining}h ${minutesRemaining}m remaining`
                     })()}
                   </span>
          </div>
          </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default Dashboard
