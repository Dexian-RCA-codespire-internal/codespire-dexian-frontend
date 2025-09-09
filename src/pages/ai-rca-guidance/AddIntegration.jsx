import React, { useState } from 'react'
import { motion } from 'framer-motion'

const AddIntegration = () => {
  const [integrations, setIntegrations] = useState([
    { 
      name: 'Jira', 
      logo: '/logos/jira-logo.jpg', 
      connected: true, 
      pinned: true,
      pinStatus: '40ms'
    },
    { 
      name: 'Service Now', 
      logo: '/logos/servicenow-logo.png', 
      connected: false, 
      pinned: false,
      pinStatus: '40ms'
    },
    { 
      name: 'Zendesk', 
      logo: '/logos/zendesk-logo.png', 
      connected: true, 
      pinned: true,
      pinStatus: '40ms'
    },
    { 
      name: 'Remedy', 
      logo: '/logos/remedy-logo.png', 
      connected: false, 
      pinned: false,
      pinStatus: '40ms'
    }
  ])

  const toggleConnection = (index) => {
    setIntegrations(prev => prev.map((integration, i) => 
      i === index ? { ...integration, connected: !integration.connected } : integration
    ))
  }

  const togglePin = (index) => {
    setIntegrations(prev => prev.map((integration, i) => 
      i === index ? { ...integration, pinned: !integration.pinned } : integration
    ))
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Add Integration</h1>
        <p className="text-gray-600">Manage your service integrations and connections</p>
      </motion.div>

      <motion.div
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Integrations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {integrations.map((integration, index) => {
            return (
              <motion.div
                key={integration.name}
                className="bg-gray-50 rounded-lg border border-gray-200 p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
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
                  
                  <div className="flex space-x-2 pt-2">
                    <button
                      onClick={() => toggleConnection(index)}
                      className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                        integration.connected
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {integration.connected ? 'Disconnect' : 'Connect'}
                    </button>
                    <button
                      onClick={() => togglePin(index)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                        integration.pinned
                          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {integration.pinned ? 'Unpin' : 'Pin'}
                    </button>
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
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Integration Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Auto-sync Frequency</h3>
              <p className="text-sm text-gray-600">How often to sync data from integrations</p>
            </div>
            <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
              <option>Every 5 minutes</option>
              <option>Every 15 minutes</option>
              <option>Every 30 minutes</option>
              <option>Every hour</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Notification Settings</h3>
              <p className="text-sm text-gray-600">Get notified about integration status changes</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default AddIntegration
