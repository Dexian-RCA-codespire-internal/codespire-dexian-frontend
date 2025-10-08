import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import usePingStatusUpdater from '../../hooks/usePingStatusUpdater';
import { motion } from 'framer-motion'
import { integrationService } from "../../api"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Cell } from 'recharts';
import { IoSettingsOutline } from "react-icons/io5";
import IntegrationSettingsModal from '../../components/ui/IntegrationSettingsModal';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import { useToast } from '../../contexts/ToastContext';

const AddIntegration = () => {
  const dispatch = useDispatch(); // Initialize dispatch
  const [integrations, setIntegrations] = useState([
    {
      name: 'Service Now',
      logo: '/logos/servicenow-logo.png',
      isConnected: false,
      pinStatus: '0ms'
    },
    {
      name: 'Jira',
      logo: '/logos/jira-logo.jpg',
      isConnected: false,
      pinStatus: '0ms'
    },
    {
      name: 'Zen Desk',
      logo: '/logos/zendesk-logo.png',
      isConnected: false,
      pinStatus: '0ms'
    },
    {
      name: 'Remedy',
      logo: '/logos/remedy-logo.png',
      isConnected: false,
      pinStatus: '0ms'
    }
  ])
  const [pingData, setPingData] = useState(null);
  const { success, error, info, warning } = useToast();
  // Use redux ping status for chart data
  const data = useSelector(state => state.pingStatus.pingHistory);
  usePingStatusUpdater();

  const COLORS = {
    ServiceNow: "#1b4332", // green-600
    Jira: "#40916c", // green-500
    Remedy: "#74c69d", // emerald-500
    Zendesk: "#b7e4c7", // emerald-400
  };

  const toggleConnection = async (index) => {
    const integration = integrations[index];
    const response = await integrationService.updateIntegration({ integrationId: integration.name, integrationData: { isConnected: !integration.isConnected } })
    if (response?.success) {
      if (!integration.isConnected) {
        success(`${integration.name} connected successfully!`)
      } else {
        info(`${integration.name} disconnected successfully!`)
      }
      setIntegrations(prev => prev.map((integration, i) =>
        i === index ? { ...integration, isConnected: !integration.isConnected } : integration
      ))
    }
  }

  // Modal state
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [selectedIntegrationIndex, setSelectedIntegrationIndex] = useState(null);

  const handleSettingsClick = (index) => {
    setSelectedIntegrationIndex(index);
    setSettingsModalOpen(true);
  };

  const handleCloseSettingsModal = () => {
    setSettingsModalOpen(false);
    setSelectedIntegrationIndex(null);
  };

  const getIntegrations = async () => {
    const integrations = await integrationService.getIntegrations();
    if (integrations?.success) {
      const integrationsData = integrations.data;
      setIntegrations(prevState => {
        const updatedState = prevState.map(integration => {
          const currentIntegration = integrationsData.find(int => int.name === integration.name)
          return { ...integration, ...currentIntegration, }
        })
        return updatedState;
      })
    }
  }

  const getPingStatus = async () => {
    const response = await integrationService.getPingStatus();
    setPingData(response.data);
    setIntegrations(prevState => {
      const updatedState = prevState.map(integration => {
        let pinStatus = '0ms';
        if (integration.name === 'Service Now' && response.data.serviceNow) {
          pinStatus = `${response.data.serviceNow}ms`;
        }
        else if (integration.name === 'Jira' && response.data.jira) {
          pinStatus = `${response.data.jira}ms`;
        }
        else if (integration.name === 'Remedy' && response.data.remedy) {
          pinStatus = `${response.data.remedy}ms`;
        }
        else if (integration.name === 'Zen Desk' && response.data.zendesk) {
          pinStatus = `${response.data.zendesk}ms`;
        }
        return { ...integration, pinStatus }
      })
      return updatedState;
    });
  }
  useEffect(() => {
    getIntegrations();
    getPingStatus();

    const pingInterval = setInterval(() => {
      getPingStatus(); // Call the API every 2 minutes
    }, 2 * 60 * 1000); // 2 minutes in milliseconds

    return () => clearInterval(pingInterval); // Cleanup on unmount
  }, [])

  // Confirmation modal state
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [integrationToDisconnect, setIntegrationToDisconnect] = useState(null);

  const handleDisconnectClick = (index) => {
    setIntegrationToDisconnect(index);
    setShowConfirmationModal(true);
  };

  const confirmDisconnect = async () => {
    const index = integrationToDisconnect;
    const integration = integrations[index];
    const response = await integrationService.updateIntegration({ integrationId: integration.name, integrationData: { isConnected: false } });
    if (response?.success) {
      setIntegrations(prev => prev.map((integration, i) =>
        i === index ? { ...integration, isConnected: false } : integration
      ));
      warning(`${integration.name} disconnected successfully!`)
    }
    setShowConfirmationModal(false);
    setIntegrationToDisconnect(null);
  };

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
                className={`rounded-lg border border-gray-200 p-4 ${integration.name == 'Service Now' ? "bg-gray-50" : "bg-gray-200"}`}
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
                        className={`w-16 h-16 object-contain bg-white rounded-lg shadow-sm border border-gray-100 p-2 hover:shadow-md transition-all duration-200 ${integration.name === 'Service Now' || integration.name === 'Zendesk' || integration.name === 'Remedy'
                          ? 'hover:scale-110 transform'
                          : ''
                          }`}
                      />
                    </div>
                    <span className="font-medium text-gray-900">{integration.name}</span>
                  </div>
                  {/* <div className='cursor-pointer text-xl text-gray-600' onClick={() => handleSettingsClick(index)} title="Integration Settings">
                    <IoSettingsOutline />
                  </div> */}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Connection Status</span>
                    <span className={`text-sm font-medium ${integration.isConnected ? 'text-green-600' : 'text-red-600'
                      }`}>
                      {integration.isConnected ? 'Connected' : 'Not Connected'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Ping Status</span>
                    <span className="text-sm font-medium text-gray-600">{integration.pinStatus}</span>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <button
                      onClick={integration.isConnected ? () => handleDisconnectClick(index) : () => toggleConnection(index)}
                      className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${integration.isConnected
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-300 text-green-700 hover:bg-green-400'
                        } ${['Jira', 'Remedy', 'Zen Desk'].includes(integration.name) ? 'cursor-not-allowed' : ''}`}
                      disabled={['Jira', 'Remedy', 'Zen Desk'].includes(integration.name)}
                    >
                      {integration.isConnected ? 'Disconnect' : 'Connect'}
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
        <div className='flex flex-col gap-2 lg:flex-row '>
          <div className='p-2 min-w-72 border rounded'>
            <h3 className="text-md font-semibold text-gray-900 mb-4"> Network Status</h3>
            <div className='flex justify-between mt-4 p-2 rounded bg-gray-50'>
              <div className='flex justify-between items-center gap-1'>
                <div className={`w-2 h-2 rounded bg-green-400 ${pingData?.serviceNow <= 100 ? 'bg-green-400' : pingData?.serviceNow < 500 ? 'bg-yellow-400' : 'bg-red-400'}`}></div>Service Now</div>
              <div>{pingData?.serviceNow || 0} ms</div>
            </div>
            <div className='flex justify-between mt-4 p-2 rounded bg-gray-100'>
              <div className='flex justify-between items-center gap-1'>
                <div className='w-2 h-2 rounded bg-gray-400'></div>Jira</div>
              <div>{pingData?.jira || 0} ms</div>
            </div>
            <div className='flex justify-between mt-4 p-2 rounded bg-gray-100'>
              <div className='flex justify-between items-center gap-1'>
                <div className='w-2 h-2 rounded bg-gray-400'></div>Remedy</div>
              <div>{pingData?.remedy || 0} ms</div>
            </div>
            <div className='flex justify-between mt-4 p-2 rounded bg-gray-100'>
              <div className='flex justify-between items-center gap-1'>
                <div className='w-2 h-2 rounded bg-gray-400'></div>Zen Desk</div>
              <div>{pingData?.zendesk || 0} ms</div>
            </div>
          </div>
          <div className='p-2 border rounded w-full'>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
              >
                <CartesianGrid stroke="#1F2937" strokeDasharray="3 3" />
                <XAxis
                  dataKey="time"
                  stroke="#9CA3AF"
                  tick={{ fill: "#9CA3AF", fontSize: 12 }}
                />
                <YAxis stroke="#9CA3AF" tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111827",
                    border: "1px solid #1F2937",
                    borderRadius: "6px",
                    color: "#D1FAE5",
                  }}
                />
                <Legend
                  wrapperStyle={{
                    color: "#9CA3AF",
                    fontSize: "13px",
                  }}
                />
                {/* <Bar dataKey="ServiceNow" fill={COLORS.ServiceNow} radius={[4, 4, 0, 0]} /> */}
                <Bar dataKey="ServiceNow" radius={[4, 4, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell
                      key={`ServiceNow-${index}`}
                      fill={
                        entry.ServiceNow <= 100
                          ? '#4ade80' // Tailwind bg-green-400
                          : entry.ServiceNow < 500
                            ? '#facc15' // Tailwind bg-yellow-400
                            : '#f87171' // Tailwind bg-red-400
                      }
                    />
                  ))}
                </Bar>
                {/* <Bar dataKey="Jira" fill={COLORS.Jira} radius={[4, 4, 0, 0]} /> */}
                {/* <Bar dataKey="Remedy" fill={COLORS.Remedy} radius={[4, 4, 0, 0]} /> */}
                {/* <Bar dataKey="Zendesk" fill={COLORS.Zendesk} radius={[4, 4, 0, 0]} /> */}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        onConfirm={confirmDisconnect}
        message="If you proceed, your system will no longer receive ticket updates from ServiceNow. Do you still want to Disconnect?"
      />
    </div>
  )
}

export default AddIntegration
