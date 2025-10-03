import React from 'react'
import { motion } from 'framer-motion'
import { FiLock, FiSettings, FiArrowLeft } from 'react-icons/fi'
import { Button } from '../ui/Button'
import { useNavigate } from 'react-router-dom'

const FeatureUnavailable = ({ featureName, featureDescription }) => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <FiLock className="w-8 h-8 text-gray-400" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="text-2xl font-bold text-gray-900 mb-3"
        >
          Feature Unavailable
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="text-gray-600 mb-2"
        >
          The <strong>{featureName}</strong> feature is currently disabled.
        </motion.p>

        {featureDescription && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="text-sm text-gray-500 mb-6"
          >
            {featureDescription}
          </motion.p>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
        >
          <div className="flex items-center justify-center text-blue-600 mb-2">
            <FiSettings className="w-5 h-5 mr-2" />
            <span className="text-sm font-medium">Administrator Note</span>
          </div>
          <p className="text-xs text-blue-600">
            To enable this feature, contact your system administrator or update the feature configuration.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <Button
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center gap-2"
          >
            <FiArrowLeft className="w-4 h-4" />
            Return to Dashboard
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default FeatureUnavailable