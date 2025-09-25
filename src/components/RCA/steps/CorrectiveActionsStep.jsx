import React, { useState } from 'react'
import AutoSuggestionTextarea from '../../ui/AutoSuggestionTextarea'
import { BsStars } from "react-icons/bs"
import { aiService } from '../../../api/services/aiService'

const CorrectiveActionsStep = ({
  ticketData,
  response,
  onResponseChange,
  isEnhancingCorrectiveActions,
  setIsEnhancingCorrectiveActions
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
          What specific actions will you take to prevent this issue from recurring? 
          Focus on immediate fixes, preventive measures, and long-term improvements.
        </p>
      </div>

      {/* Corrective Actions Textarea */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Corrective Actions
        </label>
        <AutoSuggestionTextarea
          value={response}
          onChange={(e) => {
            onResponseChange(e)
          }}
          placeholder="Enter your corrective actions here..."
          rows={8}
          className="w-full resize-none"
          reference={ticketData ? `${ticketData.short_description} ${ticketData.description || ''}`.trim() : ''}
          onEnhance={() => handleEnhanceText(response, isEnhancingCorrectiveActions, setIsEnhancingCorrectiveActions)}
          isEnhancing={isEnhancingCorrectiveActions}
        />
      </div>

      {/* Action Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <h4 className="text-sm font-medium text-green-900 mb-2">Immediate Actions</h4>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• Apply hotfixes</li>
            <li>• Restart services</li>
            <li>• Clear caches</li>
            <li>• Rollback changes</li>
          </ul>
        </div>
        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <h4 className="text-sm font-medium text-yellow-900 mb-2">Preventive Measures</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Update monitoring</li>
            <li>• Improve testing</li>
            <li>• Add validations</li>
            <li>• Enhance documentation</li>
          </ul>
        </div>
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Long-term Improvements</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Architecture changes</li>
            <li>• Process improvements</li>
            <li>• Training programs</li>
            <li>• Tool upgrades</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default CorrectiveActionsStep
