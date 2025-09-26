import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Button } from './Button';
import { IoIosColorWand } from 'react-icons/io';
import { FiCheck, FiLoader } from 'react-icons/fi';

const EnhancementModal = ({
  isOpen,
  onClose,
  originalText,
  onSelectOption,
  enhancedOptions = [],
  isLoading = false,
  title = "Enhance Text"
}) => {
  const [selectedOption, setSelectedOption] = useState(1); // Default to first option

  // Reset selection when modal opens - select highest confidence option
  useEffect(() => {
    if (isOpen && enhancedOptions.length > 0) {
      const sortedOptions = enhancedOptions.sort((a, b) => b.confidence - a.confidence);
      setSelectedOption(sortedOptions[0].option);
    }
  }, [isOpen, enhancedOptions]);

  const handleSelectOption = (optionNumber) => {
    setSelectedOption(optionNumber);
  };

  const handleApplySelection = () => {
    const selectedEnhancedOption = enhancedOptions.find(option => option.option === selectedOption);
    if (selectedEnhancedOption) {
      onSelectOption(selectedEnhancedOption.enhancedText);
    }
    onClose();
  };

  const getQualityBadgeColor = (qualityLevel) => {
    switch (qualityLevel?.toLowerCase()) {
      case 'basic':
        return 'bg-gray-100 text-gray-800';
      case 'standard':
        return 'bg-blue-100 text-blue-800';
      case 'premium':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEnhancementTypeColor = (enhancementType) => {
    switch (enhancementType?.toLowerCase()) {
      case 'clarity':
        return 'bg-green-100 text-green-800';
      case 'professional':
        return 'bg-blue-100 text-blue-800';
      case 'engaging':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <IoIosColorWand className="w-6 h-6 text-green-600" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Original Text */}
          {originalText && (
            <div className="p-4 bg-gray-50 rounded-lg border">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Original Text</h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{originalText}</p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-3">
                <FiLoader className="w-5 h-5 animate-spin text-green-600" />
                <span className="text-gray-600">Generating enhancement options...</span>
              </div>
            </div>
          )}

          {/* Enhanced Options */}
          {!isLoading && enhancedOptions.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Choose Enhancement Option</h3>
              
              <div className="grid grid-cols-1 gap-4">
                {enhancedOptions
                  .map((option, index) => (
                  <div
                    key={option.option}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedOption === option.option
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                    onClick={() => handleSelectOption(option.option)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            selectedOption === option.option
                              ? 'border-green-500 bg-green-500'
                              : 'border-gray-300'
                          }`}
                        >
                          {selectedOption === option.option && (
                            <FiCheck className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <span className="font-medium text-gray-900">
                          Option {option.option}
                        </span>
                      </div>
                      
                      <div className="flex gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEnhancementTypeColor(option.enhancementType)}`}>
                          {option.enhancementType}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getQualityBadgeColor(option.qualityLevel)}`}>
                          {option.qualityLevel}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          {option.confidence}% confidence
                        </span>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-4">
                        {option.enhancedText}
                      </p>
                    </div>

                    {/* Improvements */}
                    {option.improvements && option.improvements.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {option.improvements.map((improvement, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
                          >
                            {improvement}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              onClick={onClose}
              variant="outline"
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApplySelection}
              disabled={!enhancedOptions.length || isLoading}
              className="px-6 bg-green-600 hover:bg-green-700 text-white"
            >
              Apply Selected Option
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancementModal;
