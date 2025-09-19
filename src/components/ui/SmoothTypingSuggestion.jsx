import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiLoader } from 'react-icons/fi';

const SmoothTypingSuggestion = ({ 
  suggestion, 
  index, 
  isStreaming, 
  onComplete = () => {} 
}) => {
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (suggestion && isStreaming) {
      setIsTyping(true);
      setIsComplete(false);
    } else if (suggestion && suggestion.isComplete) {
      setIsTyping(false);
      setIsComplete(true);
      onComplete();
    }
  }, [suggestion, isStreaming, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.2,
        ease: "easeOut"
      }}
      className="p-4 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-start gap-3">
        {/* Status Icon */}
        <motion.div 
          className="flex-shrink-0 mt-1"
          animate={{ 
            scale: isTyping ? [1, 1.1, 1] : 1,
            rotate: isTyping ? [0, 5, -5, 0] : 0
          }}
          transition={{ 
            duration: 0.6, 
            repeat: isTyping ? Infinity : 0,
            ease: "easeInOut"
          }}
        >
          {isTyping ? (
            <FiLoader className="w-5 h-5 text-blue-500 animate-spin" />
          ) : isComplete ? (
            <FiCheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <div className="w-5 h-5 rounded-full bg-gray-300" />
          )}
        </motion.div>
        
        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-700">
              Suggestion {index + 1}
            </span>
            <AnimatePresence>
              {isTyping && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                >
                  Typing...
                </motion.span>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {isComplete && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full"
                >
                  Complete
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          
          <motion.div 
            className="text-sm text-gray-700 leading-relaxed"
            layout
          >
            {suggestion.text || ''}
            <AnimatePresence>
              {isTyping && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ 
                    duration: 0.8, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="text-blue-500 font-bold"
                >
                  |
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default SmoothTypingSuggestion;
