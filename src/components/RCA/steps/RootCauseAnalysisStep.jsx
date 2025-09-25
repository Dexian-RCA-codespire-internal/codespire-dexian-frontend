import React, { useState } from 'react'
import { Textarea } from '../../ui/Textarea'
import { Button } from '../../ui/Button'
import { IoIosColorWand } from "react-icons/io"
import { BsStars } from "react-icons/bs"
import { aiService } from '../../../api/services/aiService'

const RootCauseAnalysisStep = ({
  ticketData,
  response,
  onResponseChange,
  isEnhancingRootCause,
  setIsEnhancingRootCause
}) => {
  // Generic text enhancement function
  const handleEnhanceText = async (currentText, setLoadingState, setLoadingFunction) => {
    if (!currentText.trim()) {
      alert('Please enter some text to enhance.')
      return
    }

    try {
      setLoadingFunction(true)
      
      const requestData = {
        text: currentText,
        reference: `${ticketData?.short_description || ''} ${ticketData?.description || ''}`.trim()
      }
      
      const response = await aiService.textEnhancement.enhance(requestData)
      
      if (response.success && response.data && response.data.enhancedText) {
        const enhancedText = response.data.enhancedText
        
        // Update the response with enhanced text
        onResponseChange(enhancedText)
        
        console.log('Text enhanced successfully:', response.data)
      } else {
        alert('Failed to enhance text. Please try again.')
      }
    } catch (error) {
      console.error('Error enhancing text:', error)
      alert('Failed to enhance text. Please try again.')
    } finally {
      setLoadingFunction(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* AI Guidance */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2 mb-2">
          <BsStars className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">AI Guidance</span>
        </div>
        <p className="text-sm text-blue-700">
          Based on your investigation, what is the underlying root cause? Consider the 5 Whys methodology, 
          technical analysis, and any patterns observed in the incident.
        </p>
      </div>

      {/* Root Cause Analysis Textarea */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Root Cause Analysis
        </label>
        <div className="relative">
          <Textarea
            value={response}
            onChange={(e) => {
              onResponseChange(e.target.value)
            }}
            placeholder="Enter your root cause analysis here..."
            rows={8}
            className="w-full resize-none pr-20"
            disabled={isEnhancingRootCause}
          />
          <Button
            onClick={() => handleEnhanceText(response, isEnhancingRootCause, setIsEnhancingRootCause)}
            disabled={isEnhancingRootCause}
            className="absolute bottom-0 right-0 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 px-3 py-1 h-auto rounded-md shadow-sm flex items-center gap-1"
            size="sm"
          >
            <IoIosColorWand className="w-4 h-4" />
            <span className="text-sm">Enhance</span>
          </Button>
        </div>
      </div>

      {/* Suggested Root Causes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Common Root Causes</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Configuration errors</li>
            <li>• Resource limitations</li>
            <li>• Code defects</li>
            <li>• Network connectivity issues</li>
            <li>• Third-party service failures</li>
          </ul>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Investigation Tips</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Check recent deployments</li>
            <li>• Review system logs</li>
            <li>• Analyze performance metrics</li>
            <li>• Verify dependencies</li>
            <li>• Consider environmental factors</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default RootCauseAnalysisStep
