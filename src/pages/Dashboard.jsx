 
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
import useSLAWebSocket from '../hooks/useSLAWebSocket'
import { calculateSLATimeLeft } from '../utils/slaUtils'
import { slaService } from '../api/services/slaService'
import { integrationService, authService } from '../api'
import useNotifications from '../hooks/useNotifications';
import { BiServer } from 'react-icons/bi';
import { useSelector, useDispatch } from 'react-redux'
import { selectSLAMetrics, fetchSLAMetrics as fetchSLAMetricsThunk, selectSLAData, fetchSLAs } from '../store/slaSlice'
// ...existing imports
const Dashboard = () => {
  const navigate = useNavigate()
  // Prefer breached count from global store when available
  const globalSlaMetrics = useSelector(selectSLAMetrics)
  const dispatch = useDispatch()

  // If store doesn't have SLA metrics yet (e.g. right after login), fetch them
  useEffect(() => {
    if (!globalSlaMetrics) {
      dispatch(fetchSLAMetricsThunk())
    }
    // run on mount only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  // WebSocket connectivity state
  const {
    isConnected: wsConnected,
    wsError,
    pollingStatus,
    lastPollingEvent,
    addNotification,
    tickets: wsTickets,
    dataStatistics: wsDataStatistics
  } = useWebSocketOnly(import.meta.env.VITE_BACKEND_URL || 'http://localhost:8081')

  // Debounce ref for websocket-driven refreshes
  const wsRefreshTimerRef = useRef(null)

  // When websocket tickets or stats change, refresh SLA list in Redux so chart updates from store
  useEffect(() => {
    if (!wsTickets && !wsDataStatistics) return
    // debounce to avoid multiple rapid refreshes
    if (wsRefreshTimerRef.current) clearTimeout(wsRefreshTimerRef.current)
    wsRefreshTimerRef.current = setTimeout(() => {
      dispatch(fetchSLAs({ limit: 1000 }))
    }, 1000)

    return () => {
      if (wsRefreshTimerRef.current) clearTimeout(wsRefreshTimerRef.current)
    }
  }, [wsTickets, wsDataStatistics, dispatch])
  
  // Info popup state
  const [showInfoPopup, setShowInfoPopup] = useState(false)
  const [autoShowReason, setAutoShowReason] = useState(null)
  const [userManuallyClosed, setUserManuallyClosed] = useState(false)
  const infoPopupRef = useRef(null)

  // Small reusable hover-info icon used in each card header
  const InfoIcon = ({ content }) => {
    const [show, setShow] = useState(false)

    return (
      <div
        className="relative inline-block"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
      >
        <div
          tabIndex={0}
          className="w-5 h-5 bg-gray-600 rounded-full flex items-center justify-center cursor-pointer"
          aria-label="More info"
          role="button"
        >
          <span className="text-xs text-gray-300">i</span>
        </div>

        {show && (
          // positioned to overlap / come out of the card header area so it's visually inside the card
          <div className="absolute left-0 top-full -translate-y-2 w-56 bg-white border border-gray-200 rounded shadow p-3 text-sm text-gray-900 font-sans pointer-events-auto z-50">
            {content}
          </div>
        )}
      </div>
    )
  }

  // Provide descriptive tooltip text per card
  const getCardInfoText = (title) => {
    switch (title) {
      case 'TOTAL RCAs':
        return 'Total number of root cause analysis records.'
      case 'ACTIVE INVESTIGATIONS':
        return 'Total number of tickets which are in investigation stage.'
      case 'SYSTEM HEALTH':
        return 'System service health details.'
      case 'SLA BREACHED':
        return 'Total no tickets breached sla.'
      case 'CRITICAL ISSUES':
        return 'Tickets which are priortirised as p1 and p2.'
      
    }
  }
  
  // Dynamic SLA data state
  const [slaMetrics, setSlaMetrics] = useState({
    totalTickets: 0,
    activeInvestigations: 0,
    criticalIssues: 0,
    breached: 0,
    teamMembers: 12 // Keep static for now
  })
  // Derived counts computed from Redux slaData
  const [derivedSlaCounts, setDerivedSlaCounts] = useState({ breached: 0 })
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
    compliancePercent: 0,
    avgResolutionHours: 0,
    timeRange: '30 Days'
  })

  // Series for the big resolutions chart (daily buckets based on timeRange)
  const [seriesDaily, setSeriesDaily] = useState([])

  const RANGE_TO_DAYS = {
    '7 Days': 7,
    '30 Days': 30,
    '90 Days': 90,
    '1 Year': 365,
  }

  
  
  // Chart data from SLA endpoints
  const [chartLoading, setChartLoading] = useState(true)
  const [chartError, setChartError] = useState(null)
  
  // Stats with trend data
  const [statsWithTrends, setStatsWithTrends] = useState({
    totalRcas: { value: 0, trend: 0, dailyData: [] },
    activeInvestigations: { value: 0, trend: 0, dailyData: [] },
    systemHealth: { value: 0, trend: 0, dailyData: [] },
    criticalIssues: { value: 0, trend: 0, dailyData: [] },
    // Added dedicated SLA breached slot so we can compute proper breached trends
    slaBreached: { value: 0, trend: 0, dailyData: [] }
  })

  // (debug state removed)
  
  // Ping status data
  const [pingStatusData, setPingStatusData] = useState(null)
  
  // Time update state for dynamic time display
  const [currentTime, setCurrentTime] = useState(new Date())
  
  // Update statsWithTrends when pingStatusData changes
  // Use Redux SLA data for charting. If store is empty, request a full fetch.
  const slaData = useSelector(selectSLAData)
  // Prefer authoritative metrics from Redux slice (may be updated by server/websocket)
  const globalSlaMetricsForCard = useSelector(selectSLAMetrics)

  useEffect(() => {
    // If we don't have SLA records in the store, fetch them once (large limit for dashboard)
    if ((!slaData || slaData.length === 0) && !chartLoading) {
      dispatch(fetchSLAs({ limit: 1000 }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Build seriesDaily and chartData from `slaData` whenever data or timeRange changes
  useEffect(() => {
    try {
      setChartLoading(true)
      setChartError(null)

      const slas = Array.isArray(slaData) ? slaData : []
      const days = RANGE_TO_DAYS[chartData.timeRange] || 30
      const end = new Date()
      const start = new Date()
      start.setDate(end.getDate() - (days - 1))

      // Initialize daily map (also track breached per day)
      const dailyMap = {}
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dailyMap[d.toDateString()] = { totalCreated: 0, totalResolved: 0, breached: 0 }
      }

  // Aggregate (only count tickets within the selected range)
  let totalCreated = 0
  let totalResolved = 0
  const resolvedDates = []
  const breachedDates = []
  let resolvedWithSlaCount = 0
  let totalResolutionMs = 0
  let resolvedCountForAvg = 0

      const parseDate = (val) => {
        if (!val) return null
        try { return new Date(val) } catch (err) { return null }
      }

      slas.forEach(ticket => {
        const created = parseDate(ticket.createdAt || ticket.created_at || ticket.created)
        const updated = parseDate(ticket.updatedAt || ticket.updated_at || ticket.updated)
        const resolved = parseDate(ticket.resolvedAt || ticket.resolved_at || ticket.closedAt || ticket.closed_at) || updated || created
        const status = (ticket.status || '').toLowerCase()

        // Only count created tickets if they fall within the chart window
        if (created && created >= start && created <= end) {
          const key = created.toDateString()
          totalCreated++
          if (dailyMap[key]) dailyMap[key].totalCreated++
        }

        // Only count resolved tickets if status is 'closed' or 'resolved' and resolved date is in the window
        if (
          resolved &&
          resolved >= start &&
          resolved <= end &&
          (status === 'closed' || status === 'resolved')
        ) {
          totalResolved++
          const key = resolved.toDateString()
          if (dailyMap[key]) dailyMap[key].totalResolved++
          resolvedDates.push(resolved)

          // Count for SLA compliance (consider non-'breached' statuses as compliant)
          if (ticket.slaInfo && ticket.slaInfo.status && ticket.slaInfo.status !== 'breached') {
            resolvedWithSlaCount++
          }

          // Accumulate resolution time for average calculation
          if (created) {
            const delta = resolved.getTime() - created.getTime()
            if (!isNaN(delta) && delta >= 0) {
              totalResolutionMs += delta
              resolvedCountForAvg++
            }
          }
        }

        // Detect breached tickets and bucket them by resolved date (or created date if resolved is missing)
        try {
          let slaInfo = ticket.slaInfo
          if (!slaInfo) {
            const createdForCalc = new Date(ticket.createdAt || ticket.created_at || ticket.created || ticket.openedTime || ticket.opened_time)
            slaInfo = calculateSLATimeLeft(createdForCalc, ticket.priority, ticket.status)
          }
          if (slaInfo && slaInfo.status === 'breached') {
            // Use resolved (if available) to bucket the breach, otherwise created
            const breachDate = resolved || created
            if (breachDate && breachDate >= start && breachDate <= end) {
              breachedDates.push(breachDate)
              const key = breachDate.toDateString()
              if (dailyMap[key]) dailyMap[key].breached++
            }
          }
        } catch (e) {
          // ignore per-ticket slaInfo errors
        }
      })

      // Build daily array
      const dailyArray = Object.keys(dailyMap).map(dateStr => {
        const d = new Date(dateStr)
        return { day: d.toLocaleDateString(undefined, { weekday: 'short' }), totalCreated: dailyMap[dateStr].totalCreated, totalResolved: dailyMap[dateStr].totalResolved }
      })

    // Compute WoW: previous window (same length) resolved counts
      const prevStart = new Date(start)
      prevStart.setDate(start.getDate() - days)
      const prevEnd = new Date(start)
      prevEnd.setDate(start.getDate() - 1)
      let resolvedPrev = 0
      resolvedDates.forEach(d => { if (d >= prevStart && d <= prevEnd) resolvedPrev++ })
      const resolvedCurrent = resolvedDates.filter(d => d >= start && d <= end).length
  const percentageChange = resolvedPrev === 0 ? (resolvedCurrent === 0 ? 0 : 100) : Math.round(((resolvedCurrent - resolvedPrev) / Math.abs(resolvedPrev)) * 100)

  // Compute SLA compliance and average resolution time (hours)
  const compliancePercent = resolvedCurrent === 0 ? 0 : Math.round((resolvedWithSlaCount / resolvedCurrent) * 100)
  const avgResolutionHours = resolvedCountForAvg === 0 ? 0 : Math.round(((totalResolutionMs / resolvedCountForAvg) / 3600000) * 10) / 10

      // Build breached daily array as part of seriesDaily (so the large chart can optionally use it)
      const dailyArrayWithBreached = Object.keys(dailyMap).map(dateStr => {
        const d = new Date(dateStr)
        return {
          dateISO: dateStr,
          day: d.toLocaleDateString(undefined, { weekday: 'short' }),
          totalCreated: dailyMap[dateStr].totalCreated,
          totalResolved: dailyMap[dateStr].totalResolved,
          breached: dailyMap[dateStr].breached || 0
        }
      })

      // Update states
      setSeriesDaily(dailyArrayWithBreached)
      setChartData(prev => ({ ...prev, totalTickets: totalCreated, resolvedTickets: totalResolved, percentageChange, compliancePercent, avgResolutionHours }))

      // Compute derived counts: breached, active investigations, critical issues
      const breachedCount = slas.reduce((acc, ticket) => {
        let slaInfo = ticket.slaInfo
        if (!slaInfo) {
          // Best-effort compute slaInfo when missing
          try {
            const created = new Date(ticket.createdAt || ticket.created_at || ticket.created || ticket.openedTime || ticket.opened_time)
            slaInfo = calculateSLATimeLeft(created, ticket.priority, ticket.status)
          } catch (e) {
            slaInfo = null
          }
        }
        const status = (ticket.status || '').toLowerCase()
        if (
          slaInfo &&
          slaInfo.status === 'breached' &&
          (status === 'closed' || status === 'resolved')
        ) {
          return acc + 1
        }
        return acc
      }, 0)

      // Compute active count. Prefer the slice-level metric when available (server-side computed)
      // Otherwise, fall back to counting tickets whose status indicates 'in progress' (case-insensitive)
      let activeCount = 0
      if (globalSlaMetricsForCard && typeof globalSlaMetricsForCard.activeInvestigations === 'number') {
        activeCount = globalSlaMetricsForCard.activeInvestigations
      } else {
        activeCount = slas.reduce((acc, ticket) => {
          const status = (ticket.status || '').toLowerCase()
          // Treat any status containing 'in progress' as active. This keeps the definition narrow and dynamic.
          if (status.includes('in progress') || status.includes('in-progress') || status === 'inprogress') return acc + 1
          return acc
        }, 0)
      }

      const criticalCount = slas.reduce((acc, ticket) => {
        if (ticket.priority === 'P1' || ticket.priority === 'Critical') return acc + 1
        return acc
      }, 0)

  setDerivedSlaCounts({ breached: breachedCount })

      // Also sync these into statsWithTrends so small cards show derived values
      setStatsWithTrends(prev => ({
        ...prev,
        activeInvestigations: {
          ...prev.activeInvestigations,
          value: activeCount,
          dailyData: prev.activeInvestigations?.dailyData || []
        },
        criticalIssues: {
          ...prev.criticalIssues,
          value: criticalCount,
          dailyData: prev.criticalIssues?.dailyData || []
        }
      }))

      // Compute last-7-days mini-graphs and week-over-week percent change per user request
      const WEEK_DAYS = 7
      const orderedDaily = dailyArrayWithBreached // already ordered from start..end
      // Take the last 7 days (or fewer if not available)
      const lastNDays = orderedDaily.slice(Math.max(0, orderedDaily.length - WEEK_DAYS))
      const prevNDays = orderedDaily.slice(Math.max(0, orderedDaily.length - WEEK_DAYS - WEEK_DAYS), Math.max(0, orderedDaily.length - WEEK_DAYS))

      const buildPoints = (arr, valueKey) => arr.map(d => ({ day: d.day, value: d[valueKey] || 0 }))

      const miniGraphPoints = buildPoints(lastNDays, 'totalCreated')
      const activeGraphPoints = buildPoints(lastNDays, null).map((d, i) => ({ day: d.day, value: Math.max(0, (lastNDays[i].totalCreated || 0) - (lastNDays[i].totalResolved || 0)) }))
      const breachedGraphPoints = buildPoints(lastNDays, 'breached')

      const sumValues = (arr) => arr.reduce((s, v) => s + (v.value || 0), 0)

      const currentWeekSum = sumValues(miniGraphPoints)
      const prevWeekSum = sumValues(buildPoints(prevNDays, 'totalCreated'))
  // Use previous week's sum directly when computing percent (no dummy fallback)
  const weeklyPercent = prevWeekSum === 0 ? (currentWeekSum === 0 ? 0 : 100) : Math.round(((currentWeekSum - prevWeekSum) / Math.abs(prevWeekSum)) * 100)

      // Active weekly sums
      const currentActiveWeekSum = sumValues(activeGraphPoints)
      const prevActiveWeekSum = sumValues(prevNDays.map(d => ({ value: Math.max(0, (d.totalCreated || 0) - (d.totalResolved || 0)) })))
  const activeWeeklyPercent = prevActiveWeekSum === 0 ? (currentActiveWeekSum === 0 ? 0 : 100) : Math.round(((currentActiveWeekSum - prevActiveWeekSum) / Math.abs(prevActiveWeekSum)) * 100)

      // Breached weekly sums
      const currentBreachedWeekSum = sumValues(breachedGraphPoints)
      const prevBreachedWeekSum = sumValues(prevNDays.map(d => ({ value: d.breached || 0 })))
  const breachedWeeklyPercent = prevBreachedWeekSum === 0 ? (currentBreachedWeekSum === 0 ? 0 : 100) : Math.round(((currentBreachedWeekSum - prevBreachedWeekSum) / Math.abs(prevBreachedWeekSum)) * 100)

      // debug state removed

      setStatsWithTrends(prev => ({
        ...prev,
        totalRcas: { value: totalCreated, trend: weeklyPercent, dailyData: miniGraphPoints },
        activeInvestigations: { value: activeCount, trend: activeWeeklyPercent, dailyData: activeGraphPoints },
        criticalIssues: { value: criticalCount, trend: prev.criticalIssues?.trend || 0, dailyData: prev.criticalIssues?.dailyData || [] },
        slaBreached: { value: breachedCount, trend: breachedWeeklyPercent, dailyData: breachedGraphPoints }
      }))
    } catch (error) {
      console.error('Error building chart from Redux SLA data:', error)
      setChartError('Failed to build chart from data')
    } finally {
      setChartLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slaData, chartData.timeRange])
  
  
  // Update time every minute for dynamic time display
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Update every minute
    
    return () => clearInterval(timeInterval)
  }, [])
  
  // Periodic ping measurement to update ping status dynamically (using /api/v1/health)
  useEffect(() => {
    const pingInterval = setInterval(async () => {
      try {
        const startTime = performance.now()
        
        // Measure actual ping to server
        const pingResponse = await authService.ping(); 
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
  }, 1000) // Ping every 1 second for more frequent updates
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
      value: pingStatusData && typeof pingStatusData.uptime === 'number' ? `${pingStatusData.uptime}ms` : (slaLoading ? '...' : slaError ? 'Error' : '0ms'),
      trend: statsWithTrends.systemHealth.trend,
      dailyData: statsWithTrends.systemHealth.dailyData,
      icon: BiServer, 
      color: 'text-black',
      showBars: true,
      barType: 'horizontal'
    },
    { 
      title: 'SLA BREACHED', 
      // Prefer breached count from Redux metrics when available, then derived counts, then local websocket metrics
      value: (globalSlaMetrics?.breached ?? derivedSlaCounts?.breached ?? slaMetrics?.breached ?? statsWithTrends.slaBreached.value) ?? 0,
      trend: statsWithTrends.slaBreached.trend,
      dailyData: statsWithTrends.slaBreached.dailyData,
      icon: FiAlertTriangle, 
      color: 'text-red-500',
      showBars: true,
      barType: 'vertical'
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
        
        console.log(' Fetching SLA metrics for Dashboard...')
        
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

          // Keep the small-card trends in sync with fetched SLA metrics
          setStatsWithTrends(prev => ({
            ...prev,
            activeInvestigations: {
              ...prev.activeInvestigations,
              value: activeTickets,
              dailyData: prev.activeInvestigations?.dailyData || []
            }
          }))
          
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
        
          // Also sync into statsWithTrends so the card updates
          setStatsWithTrends(prev => ({
            ...prev,
            activeInvestigations: {
              ...prev.activeInvestigations,
              value: active,
              dailyData: prev.activeInvestigations?.dailyData || []
            }
          }))
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

  // --- SLA WebSocket: receive live metrics (including breached) ---
  const handleSLAUpdate = (event) => {
    try {
      if (!event) return
      if (event.type === 'metrics' && event.metrics) {
        // merge metrics into state
        setSlaMetrics(prev => ({ ...prev, ...event.metrics }))
        console.log('SLA WebSocket metrics update:', event.metrics)
        // also update statsWithTrends.criticalIssues value so card shows updated breached/critical
        setStatsWithTrends(prev => ({
          ...prev,
          criticalIssues: {
            ...prev.criticalIssues,
            value: event.metrics.critical ?? prev.criticalIssues.value,
            dailyData: prev.criticalIssues.dailyData
          }
        }))
        // sync active investigations if the metrics payload includes it
        if (typeof event.metrics.activeInvestigations !== 'undefined') {
          setStatsWithTrends(prev => ({
            ...prev,
            activeInvestigations: {
              ...prev.activeInvestigations,
              value: event.metrics.activeInvestigations
            }
          }))
        }
      }
      if (event.type === 'breach') {
        // increment breached count locally if a breach event arrives
        setSlaMetrics(prev => ({ ...prev, breached: (prev.breached || 0) + 1 }))
        console.log('SLA breach event received:', event.ticket)
      }
    } catch (err) {
      console.error('Error handling SLA WebSocket event:', err)
    }
  }

  const { connect: connectSLA, disconnect: disconnectSLA, getCurrentMetrics } = useSLAWebSocket(handleSLAUpdate, null, { enableDebugLogging: false })

  useEffect(() => {
    // connect WebSocket for SLA updates
    try {
      connectSLA()
      // log current metrics snapshot after connect
      const snapshot = getCurrentMetrics()
      console.log('Initial SLA WebSocket metrics snapshot:', snapshot)
    } catch (err) {
      console.error('Error connecting SLA WebSocket:', err)
    }

    return () => {
      try {
        disconnectSLA()
      } catch (err) {
        console.error('Error disconnecting SLA WebSocket:', err)
      }
    }
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
          
          
           
          return (
            <motion.div
              key={stat.title}
               className={`rounded-lg shadow-sm border p-6 ${
                 'bg-gray-10 border-gray-700 flex flex-col justify-between overflow-visible'
               }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          {stat.title === 'TOTAL RCAs' || stat.title === 'SLA BREACHED' ? (
                 <>
                   <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center space-x-2">
                       <h3 className="text-sm font-medium text-gray-800">{stat.title}</h3>
                      <InfoIcon content={getCardInfoText(stat.title)} />
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
                  {/* debug UI removed */}
                 </>
               ) : (
                 // Full dark theme for other cards (matching TOTAL RCAs)
                 <>
                   <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center space-x-2">
                       <h3 className="text-sm font-medium text-gray-800">{stat.title}</h3>
                       <InfoIcon content={getCardInfoText(stat.title)} />
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
                           // Simpler System Health display: text + single-color small bar
                           <div className="w-full">
                             <div className="flex items-center justify-between mb-2">
                               <span className="text-xs text-gray-700">Ping Status</span>
                               <span className="text-xs text-gray-700">{stat.value}</span>
                             </div>
                             <div className="w-full bg-gray-200 rounded h-2">
                               <div
                                 className={`h-2 rounded ${(() => {
                                   const pingValue = parseInt(stat.value.toString().replace('ms', '')) || 0
                                   return pingValue <= 60 ? 'bg-green-500' : pingValue <= 120 ? 'bg-yellow-500' : 'bg-red-500'
                                 })()}`}
                                 style={{ width: `${Math.min(100, Math.max(0, 100 - (parseInt(stat.value.toString().replace('ms', '')) / 2.5)))}%` }}
                               />
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
                   
                   {slaError && (stat.title === 'ACTIVE INVESTIGATIONS' || stat.title === 'SLA BREACHED') && (
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
                      <div className="w-3 h-3 bg-gray-300 rounded-sm"></div>
                      <span className="text-sm text-gray-600">resolved</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
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
                        {typeof chartData.compliancePercent === 'number' ? chartData.compliancePercent : 0}%
                      </div>
                      <div className="text-xs text-gray-600">
                        On-time delivery
                      </div>
                    </div>

                    {/* Average Resolution Time */}
                    <div className="bg-gray-10 rounded-lg p-3 border border-gray-700">
                      <div className="text-xs text-gray-800 font-medium mb-1">Avg Resolution</div>
                      <div className="text-lg font-bold text-gray-900">
                        {chartData.avgResolutionHours ? `${chartData.avgResolutionHours}h` : '—'}
                      </div>
                      <div className="text-xs text-gray-600">
                        Mean time
                      </div>
                    </div>
                  </div>
                  
                  {/* Graph Area */}
                  <div className="flex-1 relative h-64">
                    <svg className="w-full h-full" viewBox="0 0 800 200">
                    {/* Dynamic y-axis ticks and x-axis labels based on seriesDaily */}
                    {(() => {
                      const daily = seriesDaily && seriesDaily.length ? seriesDaily : []
                      const plotWidth = 680
                      const plotHeight = 120
                      const xStart = 60
                      const yBase = 40

                      const totals = daily.map(d => d.totalCreated || 0)
                      const resolved = daily.map(d => d.totalResolved || 0)
                      const maxVal = Math.max(...totals, ...resolved, 1)

                      // y ticks: choose 5 ticks from max down to 0
                      const numYTicks = 5
                      const yStep = Math.ceil(maxVal / (numYTicks - 1))
                      const yTicks = Array.from({ length: numYTicks }, (_, i) => maxVal - (i * yStep)).map(v => Math.max(0, v))

                      return (
                        <>
                          {yTicks.map((val, i) => {
                            const y = yBase + Math.round((1 - (val / Math.max(1, maxVal))) * plotHeight)
                            return (
                              <g key={`yt-${i}`}>
                                <line x1={xStart} y1={y} x2={xStart + plotWidth} y2={y} stroke="#f3f4f6" strokeWidth="1" />
                                <text x={xStart - 8} y={y + 4} textAnchor="end" className="text-xs fill-gray-500">{val}</text>
                              </g>
                            )
                          })}

                          {/* x labels: show up to 7 labels evenly spaced */}
                          {daily.length > 0 && (() => {
                            // For longer ranges (90 Days, 1 Year) show month names (deduped).
                            if (chartData.timeRange === '90 Days' || chartData.timeRange === '1 Year') {
                              const monthMap = {}
                              daily.forEach((d, idx) => {
                                const dt = new Date(d.dateISO)
                                const key = `${dt.getFullYear()}-${dt.getMonth()}`
                                if (!monthMap[key]) {
                                  monthMap[key] = { label: dt.toLocaleDateString(undefined, { month: 'short' }), idx }
                                }
                              })
                              const months = Object.values(monthMap)
                              return months.map((m, i) => {
                                const x = xStart + Math.round((m.idx / Math.max(1, daily.length - 1)) * plotWidth)
                                return <text key={`xl-month-${i}`} x={x} y="190" textAnchor="middle" className="text-xs fill-gray-500">{m.label}</text>
                              })
                            }

                            // Shorter ranges: show up to 7 date labels (month + day)
                            const maxLabels = 7
                            const step = Math.max(1, Math.floor((daily.length - 1) / (maxLabels - 1)))
                            return daily.map((d, idx) => {
                              if (idx % step !== 0 && idx !== daily.length - 1) return null
                              const x = xStart + Math.round((idx / Math.max(1, daily.length - 1)) * plotWidth)
                              const label = new Date(d.dateISO).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                              return (
                                <text key={`xl-${idx}`} x={x} y="190" textAnchor="middle" className="text-xs fill-gray-500">{label}</text>
                              )
                            })
                          })()}
                        </>
                      )
                    })()}
                    
                    {/* Render dynamic series if computed (seriesDaily) */}
                    {
                      seriesDaily && seriesDaily.length > 0 ? (
                        (() => {
                          const daily = seriesDaily
                          const plotWidth = 680 // x range from 60 to 740
                          const plotHeight = 120
                          const xStart = 60
                          const yBase = 40

                          const totals = daily.map(d => d.totalCreated || 0)
                          const resolved = daily.map(d => d.totalResolved || 0)
                          const maxVal = Math.max(...totals, ...resolved, 1)

                          const buildPoints = (arr) => arr.map((v, idx) => {
                            const x = xStart + Math.round((idx / Math.max(1, arr.length - 1)) * plotWidth)
                            const y = yBase + Math.round((1 - (v / maxVal)) * plotHeight)
                            return `${x},${y}`
                          }).join(' ')

                          const totalPoints = buildPoints(totals)
                          const resolvedPoints = buildPoints(resolved)

                          return (
                            <>
                              <polyline fill="none" stroke="#10b981" strokeWidth="3" points={totalPoints} />
                              <polyline fill="none" stroke="#d1d5db" strokeWidth="3" points={resolvedPoints} />
                              {totals.map((v, idx) => (
                                <circle key={`total-${idx}`} cx={xStart + Math.round((idx / Math.max(1, totals.length - 1)) * plotWidth)} cy={yBase + Math.round((1 - (v / maxVal)) * plotHeight)} r="4" fill="#10b981" />
                              ))}
                              {resolved.map((v, idx) => (
                                <circle key={`resolved-${idx}`} cx={xStart + Math.round((idx / Math.max(1, resolved.length - 1)) * plotWidth)} cy={yBase + Math.round((1 - (v / maxVal)) * plotHeight)} r="4" fill="#d1d5db" />
                              ))}
                            </>
                          )
                        })()
                      ) : (
                        // Fallback placeholders
                        <>
                          <polyline
                            points={`60,${40 + ((chartData.totalTickets / 10) * 1.2)} 180,${40 + ((chartData.totalTickets / 8) * 1.2)} 300,${40 + ((chartData.totalTickets / 6) * 1.2)} 420,${40 + ((chartData.totalTickets / 4) * 1.2)} 540,${40 + ((chartData.totalTickets / 3) * 1.2)} 660,${40 + ((chartData.totalTickets / 2) * 1.2)}`}
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <polyline
                            points={`60,${40 + ((chartData.resolvedTickets / 10) * 1.2)} 180,${40 + ((chartData.resolvedTickets / 8) * 1.2)} 300,${40 + ((chartData.resolvedTickets / 6) * 1.2)} 420,${40 + ((chartData.resolvedTickets / 4) * 1.2)} 540,${40 + ((chartData.resolvedTickets / 3) * 1.2)} 660,${40 + ((chartData.resolvedTickets / 2) * 1.2)}`}
                            fill="none"
                            stroke="#d1d5db"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </>
                      )
                    }
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
