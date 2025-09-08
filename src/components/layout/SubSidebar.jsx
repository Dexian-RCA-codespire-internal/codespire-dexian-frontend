import React from 'react'
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft } from 'lucide-react'

const SubSidebar = ({ isOpen, onClose, subItems }) => {

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Blur Overlay - Only covers main content area */}
          <motion.div
            className="fixed left-18 top-16 right-0 bottom-0 bg-black bg-opacity-20 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          
          {/* Sub Sidebar */}
          <motion.aside
            className="fixed left-18 top-16 bottom-0 w-64 bg-white border-r border-gray-200 shadow-lg z-50"
            initial={{ x: -256, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -256, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={onClose}
                    className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                  </button>
                  <h2 className="text-lg font-semibold text-gray-900">AI RCA Guidance</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="flex-1 p-4">
                <ul className="space-y-2">
                  {subItems.map((item, index) => (
                    <motion.li
                      key={item.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <NavLink
                        to={item.path}
                        className={({ isActive }) =>
                          `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                            isActive
                              ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                          }`
                        }
                        onClick={onClose}
                      >
                        <div className="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </NavLink>
                    </motion.li>
                  ))}
                </ul>
              </nav>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

export default SubSidebar
