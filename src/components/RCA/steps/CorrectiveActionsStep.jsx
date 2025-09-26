import React, { useState, useEffect } from 'react'
import AutoSuggestionTextarea from '../../ui/AutoSuggestionTextarea'
import { BsStars, BsClock, BsCheckCircle, BsExclamationTriangle, BsLightning } from "react-icons/bs"
import { FiChevronDown, FiChevronUp, FiUsers, FiCalendar, FiAlertTriangle, FiTool, FiShield, FiTrendingUp } from "react-icons/fi"
import { aiService } from '../../../api/services/aiService'

  const CorrectiveActionsStep = ({
  ticketData,
  stepData,
  response,
  onResponseChange,
  isEnhancingCorrectiveActions,
  setIsEnhancingCorrectiveActions
}) => {
  const [isGeneratingSolutions, setIsGeneratingSolutions] = useState(false)
  const [generatedSolutions, setGeneratedSolutions] = useState(null)
  const [expandedSolution, setExpandedSolution] = useState(null)
  const [selectedSolution, setSelectedSolution] = useState(null)
  const [hasGeneratedSolutions, setHasGeneratedSolutions] = useState(false)

  // Generate solutions when component mounts or when ticket data is available
  useEffect(() => {
    if (ticketData && stepData && !hasGeneratedSolutions && !isGeneratingSolutions) {
      generateSolutions()
    }
  }, [ticketData, stepData, hasGeneratedSolutions, isGeneratingSolutions])

  // Generate AI solutions
  const generateSolutions = async () => {
    if (!ticketData) {
      console.error('No ticket data available for solution generation')
      return
    }

    try {
      setIsGeneratingSolutions(true)
      
      // Build the request payload from previous steps
      const currentTicket = {
        category: ticketData.category || 'General',
        description: ticketData.description || '',
        short_description: ticketData.short_description || '',
        enhanced_problem: ticketData.enhanced_problem || stepData?.rca_workflow_steps?.[0] || '',
        impact: Array.isArray(ticketData.impact) ? ticketData.impact : 
               ticketData.impact ? [ticketData.impact] : [],
        priority: ticketData.priority || 'Medium',
        urgency: ticketData.urgency || 'Medium',
        issueType: stepData?.issueType || ticketData.issueType || 'Performance',
        severity: stepData?.severity || ticketData.severity || 'Medium',
        businessImpactCategory: stepData?.businessImpactCategory || 'Service Availability',
        impactLevel: stepData?.impact_level_step2 || 'Medium',
        departmentAffected: stepData?.department_affected_step2 || 'IT Operations',
        problemStatement: stepData?.rca_workflow_steps?.[0] || '',
        impactAssessment: stepData?.rca_workflow_steps?.[1] || '',
        rootCauseAnalysis: stepData?.rca_workflow_steps?.[2] || ''
      }

      const requestData = {
        currentTicket,
        similarTickets: [] // Can be enhanced with similar ticket data if available
      }

      console.log('Generating solutions with request data:', requestData)

      const result = await aiService.solutionGeneration.generate(requestData)
      
      if (result.success && result.solutions) {
        setGeneratedSolutions(result)
        setHasGeneratedSolutions(true)
        console.log('Solutions generated successfully:', result)
      } else {
        console.error('Failed to generate solutions:', result)
        alert('Failed to generate solutions. Please try again.')
      }
    } catch (error) {
      console.error('Error generating solutions:', error)
      alert('Failed to generate solutions. Please try again.')
    } finally {
      setIsGeneratingSolutions(false)
    }
  }

  // Handle solution selection
  const handleSolutionSelect = (solution) => {
    setSelectedSolution(solution)
    // Create a summary text from the selected solution
    const solutionSummary = `${solution.title}

Description: ${solution.description}

Implementation Steps:
${solution.steps.map((step, index) => 
  `${index + 1}. ${step.title} (${step.duration})
   - ${step.description}
   - Responsible: ${step.responsible}`
).join('\n\n')}

Expected Outcome: ${solution.expectedOutcome}

Risk Level: ${solution.riskLevel}
Timeframe: ${solution.timeframe}
Confidence: ${solution.confidence}%`

    onResponseChange(solutionSummary)
  }

  // Toggle solution expansion
  const toggleSolutionExpansion = (solutionId) => {
    setExpandedSolution(expandedSolution === solutionId ? null : solutionId)
  }

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  // Get category icon
  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'immediate': return <BsLightning className="w-4 h-4" />
      case 'short-term': return <BsClock className="w-4 h-4" />
      case 'long-term': return <FiTrendingUp className="w-4 h-4" />
      default: return <FiTool className="w-4 h-4" />
    }
  }

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
      {/* AI-Generated Solutions Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BsStars className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900">AI-Generated Solutions</h3>
          </div>
          {!generatedSolutions && !isGeneratingSolutions && (
            <button
              onClick={generateSolutions}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Generate Solutions
            </button>
          )}
        </div>

        {isGeneratingSolutions && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-blue-700">Generating comprehensive solutions...</span>
          </div>
        )}

        {generatedSolutions && (
          <div className="space-y-4">
            {/* Solutions List */}
            <div className="grid gap-4">
              {generatedSolutions.solutions?.map((solution, index) => (
                <div
                  key={solution.id || index}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedSolution?.id === solution.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleSolutionSelect(solution)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getCategoryIcon(solution.category)}
                        <h4 className="font-semibold text-gray-900">{solution.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(solution.priority)}`}>
                          {solution.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{solution.description}</p>
                      
                      {/* Solution Metadata */}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <FiCalendar className="w-3 h-3" />
                          <span>{solution.timeframe}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BsCheckCircle className="w-3 h-3" />
                          <span>{solution.confidence}% Confidence</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FiAlertTriangle className="w-3 h-3" />
                          <span>{solution.riskLevel} Risk</span>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleSolutionExpansion(solution.id || index)
                      }}
                      className="ml-4 p-1 text-gray-400 hover:text-gray-600"
                    >
                      {expandedSolution === (solution.id || index) ? (
                        <FiChevronUp className="w-4 h-4" />
                      ) : (
                        <FiChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Expanded Solution Details */}
                  {expandedSolution === (solution.id || index) && (
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                      {/* Implementation Steps */}
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                            <FiTool className="w-4 h-4" />
                            Implementation Steps
                          </h5>
                          <div className="space-y-3">
                            {solution.steps?.map((step, stepIndex) => (
                              <div key={stepIndex} className="bg-white rounded-md p-3 border">
                                <div className="flex items-start gap-3">
                                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                                    {step.step}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                      <h6 className="font-medium text-sm text-gray-900">{step.title}</h6>
                                      {/* <span className="text-xs text-gray-500">{step.duration}</span> */}
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                      <div className="flex items-center gap-1">
                                        <FiUsers className="w-3 h-3" />
                                        <span>{step.responsible}</span>
                                      </div>
                                    </div>
                                
                                    {step.requirements?.length > 0 && (
                                      <div className="mt-2">
                                        <span className="text-xs font-medium text-gray-700">Requirements: </span>
                                        <span className="text-xs text-gray-600">{step.requirements.join(', ')}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                      {/* Expected Outcome */}
                      <div className="bg-green-50 rounded-md p-3 border border-green-200">
                        <h6 className="font-medium text-green-900 mb-1 flex items-center gap-2">
                          <BsCheckCircle className="w-4 h-4" />
                          Expected Outcome
                        </h6>
                        <p className="text-sm text-green-700">{solution.expectedOutcome}</p>
                      </div>

                      {/* Rollback Plan */}
                      {solution.rollbackPlan && (
                        <div className="bg-yellow-50 rounded-md p-3 border border-yellow-200">
                          <h6 className="font-medium text-yellow-900 mb-1 flex items-center gap-2">
                            <FiShield className="w-4 h-4" />
                            Rollback Plan
                          </h6>
                          <p className="text-sm text-yellow-700">{solution.rollbackPlan}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Implementation Plan */}
            {/* {generatedSolutions.implementationPlan && (
              <div className="mt-6 bg-gray-50 rounded-lg p-4 border">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FiCalendar className="w-4 h-4" />
                  Implementation Plan
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Total Time: </span>
                    <span className="text-gray-600">{generatedSolutions.implementationPlan.totalEstimatedTime}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Approval Required: </span>
                    <span className="text-gray-600">{generatedSolutions.implementationPlan.approvalRequired ? 'Yes' : 'No'}</span>
                  </div>
                </div>
                
                {generatedSolutions.implementationPlan.resourcesRequired?.length > 0 && (
                  <div className="mt-3">
                    <span className="font-medium text-gray-700">Resources Required: </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {generatedSolutions.implementationPlan.resourcesRequired.map((resource, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs">
                          {resource}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )} */}

          </div>
        )}
      </div>

      {/* Manual Input Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Corrective Actions or Modifications
        </label>
        <AutoSuggestionTextarea
          value={response}
          onChange={(e) => {
            onResponseChange(e)
          }}
          placeholder="Add custom corrective actions or modify the generated solutions..."
          rows={6}
          className="w-full resize-none"
          reference={ticketData ? `${ticketData.short_description} ${ticketData.description || ''}`.trim() : ''}
          onEnhance={() => handleEnhanceText(response, isEnhancingCorrectiveActions, setIsEnhancingCorrectiveActions)}
          isEnhancing={isEnhancingCorrectiveActions}
        />
      </div>

      {/* Action Categories (kept as reference) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <h4 className="text-sm font-medium text-green-900 mb-2 flex items-center gap-2">
            <BsLightning className="w-4 h-4" />
            Immediate Actions
          </h4>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• Apply hotfixes</li>
            <li>• Restart services</li>
            <li>• Clear caches</li>
            <li>• Rollback changes</li>
          </ul>
        </div>
        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <h4 className="text-sm font-medium text-yellow-900 mb-2 flex items-center gap-2">
            <BsClock className="w-4 h-4" />
            Preventive Measures
          </h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Update monitoring</li>
            <li>• Improve testing</li>
            <li>• Add validations</li>
            <li>• Enhance documentation</li>
          </ul>
        </div>
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center gap-2">
            <FiTrendingUp className="w-4 h-4" />
            Long-term Improvements
          </h4>
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
