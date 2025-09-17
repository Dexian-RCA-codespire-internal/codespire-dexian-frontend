import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FiAlertTriangle, FiInfo, FiWifi, FiWifiOff, FiAlertTriangle as FiAlertTriangleIcon } from "react-icons/fi";
import { PiUsersThree } from "react-icons/pi";
import { AiOutlineLineChart } from "react-icons/ai";
import { IoSpeedometerOutline } from "react-icons/io5";
import { Button } from '../components/ui/Button'
import useWebSocketOnly from '../hooks/useWebSocketOnly'
import ChatBot from '../components/ChatBot'
import { isChatbotEnabled } from '../config/navigation'

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
  
  const stats = [
    { title: 'Total RCAs', value: '24', icon: IoSpeedometerOutline, color: 'text-blue-500' },
    { title: 'Active Investigations', value: '8', icon: AiOutlineLineChart, color: 'text-green-500' },
    { title: 'Team Members', value: '12', icon: PiUsersThree, color: 'text-purple-500' },
    { title: 'Critical Issues', value: '3', icon: FiAlertTriangle, color: 'text-red-500' }
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

  // Auto-show info popup when any service is disconnected
  useEffect(() => {
    const isBackendDisconnected = !wsConnected
    const isServiceNowDisconnected = wsConnected && (pollingStatus?.isActive === false || pollingStatus?.isHealthy === false)
    
    // Only auto-show if user hasn't manually closed it
    if (!userManuallyClosed) {
      if (isBackendDisconnected) {
        setShowInfoPopup(true)
        setAutoShowReason('Backend disconnected')
      } else if (isServiceNowDisconnected) {
        setShowInfoPopup(true)
        setAutoShowReason('ServiceNow disconnected')
      } else if (autoShowReason) {
        // Auto-hide popup when all services are connected (with a small delay)
        setTimeout(() => {
          setShowInfoPopup(false)
          setAutoShowReason(null)
          setUserManuallyClosed(false) // Reset manual close flag when services reconnect
        }, 3000) // 3 second delay to let user see the reconnection
      }
    }
  }, [wsConnected, pollingStatus, autoShowReason, userManuallyClosed])

  // Periodic popup every 20 seconds when there are service issues
  useEffect(() => {
    const isBackendDisconnected = !wsConnected
    const isServiceNowDisconnected = wsConnected && (pollingStatus?.isActive === false || pollingStatus?.isHealthy === false)
    
    // Only show periodic popup if there are service issues
    if (isBackendDisconnected || isServiceNowDisconnected) {
      const interval = setInterval(() => {
        // Show popup every 20 seconds to remind user of issues
        setShowInfoPopup(true)
        if (isBackendDisconnected) {
          setAutoShowReason('Backend disconnected')
        } else if (isServiceNowDisconnected) {
          setAutoShowReason('ServiceNow disconnected')
        }
      }, 20000) // 20 seconds

      return () => clearInterval(interval)
    }
  }, [wsConnected, pollingStatus])

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

                    {/* Close Button */}
                    <div className="pt-2 border-t border-gray-200">
                      <button
                        onClick={() => setShowInfoPopup(false)}
                        className="w-full text-xs text-gray-500 hover:text-gray-700 text-center"
                      >
                        Close
                      </button>
                    </div>
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
          return (
            <motion.div
              key={stat.title}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <IconComponent className="w-6 h-6" />
                </div>
              </div>
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

      <motion.div
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-700">New RCA created for Service Outage</span>
            <span className="text-xs text-gray-500 ml-auto">2 hours ago</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-700">RCA #1234 completed</span>
            <span className="text-xs text-gray-500 ml-auto">4 hours ago</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Pattern detected in Database Issues</span>
            <span className="text-xs text-gray-500 ml-auto">6 hours ago</span>
          </div>
        </div>
      </motion.div>

      {/* ChatBot - Only render if enabled in config */}
      {isChatbotEnabled() && (
        <ChatBot 
          pageContext={{
            pageName: 'Main Dashboard',
            totalRCAs: stats[0].value,
            activeInvestigations: stats[1].value,
            teamMembers: stats[2].value,
            criticalIssues: stats[3].value,
            integrations: integrations
          }}
        />
      )}
    </div>
  )
}

export default Dashboard
