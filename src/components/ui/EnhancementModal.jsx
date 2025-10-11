
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Button } from './Button';
import { IoIosColorWand } from 'react-icons/io';
import { FiCheck, FiLoader } from 'react-icons/fi';
import { BsStars } from 'react-icons/bs';

const EnhancementModal = ({
  isOpen,
  onClose,
  originalText,
  onSelectOption,
  enhancedOptions = [],
  isLoading = false,
  title = "Enhance Text"
}) => {
  const [selectedOption, setSelectedOption] = useState(1);

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
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'standard':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'premium':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getEnhancementTypeColor = (enhancementType) => {
    switch (enhancementType?.toLowerCase()) {
      case 'clarity':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'professional':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'engaging':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
              <IoIosColorWand className="w-4 h-4 text-white" />
            </div>
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Original Text */}
          {originalText && (
            <div className="p-3 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xs font-semibold text-gray-900">Original Text</h3>
              </div>
              <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{originalText}</p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                  <FiLoader className="w-6 h-6 animate-spin text-purple-600" />
                </div>
                <span className="text-sm text-gray-600 font-medium">Generating enhancement options...</span>
              </div>
            </div>
          )}

          {/* Enhanced Options */}
          {!isLoading && enhancedOptions.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <BsStars className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-semibold text-gray-900">Choose Your Enhanced Version</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {enhancedOptions.map((option) => (
                  <div
                    key={option.option}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedOption === option.option
                        ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-purple-300 bg-white hover:shadow-sm'
                    }`}
                    onClick={() => handleSelectOption(option.option)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            selectedOption === option.option
                              ? 'border-purple-500 bg-purple-500 shadow-sm'
                              : 'border-gray-300 bg-white'
                          }`}
                        >
                          {selectedOption === option.option && (
                            <FiCheck className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          Option {option.option}
                        </span>
                      </div>
                      
                      <div className="flex gap-1.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getEnhancementTypeColor(option.enhancementType)}`}>
                          {option.enhancementType}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getQualityBadgeColor(option.qualityLevel)}`}>
                          {option.qualityLevel}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-700 border border-amber-200">
                          {option.confidence}%
                        </span>
                      </div>
                    </div>

                    <div className="mb-2">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {option.enhancedText}
                      </p>
                    </div>

                    {/* Improvements */}
                    {option.improvements && option.improvements.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {option.improvements.map((improvement, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] rounded border border-blue-200 font-medium"
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
          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button
              onClick={onClose}
              variant="outline"
              className="px-5 border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApplySelection}
              disabled={!enhancedOptions.length || isLoading}
              className="px-5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg shadow-purple-500/30"
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