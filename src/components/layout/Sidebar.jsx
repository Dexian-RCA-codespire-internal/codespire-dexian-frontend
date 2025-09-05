import React from 'react'
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  FaTachometerAlt, 
  FaChartLine, 
  FaRobot, 
  FaSearch, 
  FaBook, 
  FaFileAlt, 
  FaBell, 
  FaShieldAlt 
} from 'react-icons/fa'

const Sidebar = () => {
  const navigationItems = [
    { path: '/', label: 'Dashboard', icon: FaTachometerAlt },
    { path: '/rca-dashboard', label: 'RCA Dashboard', icon: FaChartLine },
    { path: '/ai-rca-guidance', label: 'AI RCA Guidance', icon: FaRobot },
    { path: '/pattern-detector', label: 'Pattern & Duplicate Detector', icon: FaSearch },
    { path: '/playbook-recommender', label: 'Playbook Recommender', icon: FaBook },
    { path: '/customer-rca-summary', label: 'Customer RCA Summary', icon: FaFileAlt },
    { path: '/alert-correlation', label: 'Alert Correlation', icon: FaBell },
    { path: '/compliance-audit', label: 'Compliance & Audit', icon: FaShieldAlt }
  ]

  return (
    <motion.aside 
      className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 shadow-sm z-40"
      initial={{ x: -256 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <nav className="p-4">
        <ul className="space-y-2">
          {navigationItems.map((item, index) => {
            const IconComponent = item.icon
            return (
              <motion.li
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
              >
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  <IconComponent className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                </NavLink>
              </motion.li>
            )
          })}
        </ul>
      </nav>
    </motion.aside>
  )
}

export default Sidebar
