import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FiAlertTriangle } from "react-icons/fi";
import { PiUsersThree } from "react-icons/pi";
import { AiOutlineLineChart } from "react-icons/ai";
import { IoSpeedometerOutline } from "react-icons/io5";

const Dashboard = () => {
  const navigate = useNavigate()
  
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome to your RCA management dashboard</p>
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
    </div>
  )
}

export default Dashboard
