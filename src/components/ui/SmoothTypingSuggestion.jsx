import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiLoader } from 'react-icons/fi';

const SmoothTypingSuggestion = ({ 
  suggestion, 
  index, 
  isStreaming, 
  onComplete = () => {},
  onClick = () => {}
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

  const isBestMatch = index === 0; // First suggestion is the best match
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.2,
        ease: "easeOut"
      }}
      className={`p-3 rounded-lg border transition-colors cursor-pointer min-h-[120px] ${
        isBestMatch 
          ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300 hover:from-yellow-100 hover:to-amber-100 shadow-md' 
          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
      }`}
      onClick={() => onClick(suggestion.text || suggestion.fullText || '')}
    >
      <div className="flex items-start gap-3">
        {/* Ranking Badge */}
        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
          isBestMatch 
            ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-lg' 
            : 'bg-gray-400 text-white'
        }`}>
          {index + 1}
        </div>
        
        {/* Suggestion Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className={`text-sm font-medium ${
              isBestMatch ? 'text-amber-800' : 'text-gray-700'
            }`}>
              {isBestMatch ? '🥇 Best Match' : `Suggestion ${index + 1}`}
            </p>
            {isBestMatch && (
              <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full font-medium">
                Recommended
              </span>
            )}
          </div>
          
          <p className={`text-sm leading-relaxed min-h-[60px] ${
            isBestMatch ? 'text-amber-700' : 'text-gray-700'
          }`}>
            <span className="whitespace-pre-wrap break-words overflow-wrap-anywhere">
              {suggestion.text || ''}
            </span>
            {isTyping && !suggestion.isComplete && (
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
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default SmoothTypingSuggestion;
