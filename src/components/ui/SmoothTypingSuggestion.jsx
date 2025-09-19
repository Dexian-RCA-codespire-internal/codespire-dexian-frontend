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
      className="p-4 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors min-h-[120px]"
    >
      <div className="flex items-start gap-3">
        {/* Status Icon */}
        <div className="flex-shrink-0 mt-1 w-5 h-5">
          <motion.div 
            className="w-full h-full"
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
        </div>
        
        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-700">
              Suggestion {index + 1}
            </span>
          </div>
          
          <div className="text-sm text-gray-700 leading-relaxed min-h-[60px]">
            <div className="whitespace-pre-wrap break-words overflow-wrap-anywhere">
              {suggestion.text || ''}
              {isTyping && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ 
                    duration: 0.8, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="inline-block ml-1 text-blue-500 font-bold"
                >
                  |
                </motion.span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SmoothTypingSuggestion;
