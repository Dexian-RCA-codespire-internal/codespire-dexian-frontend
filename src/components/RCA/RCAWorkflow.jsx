import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Skeleton } from '../ui/skeleton'
import { FiMessageCircle, FiZap, FiSearch, FiArrowRight, FiArrowLeft, FiCheck, FiSave, FiDownload, FiLoader } from 'react-icons/fi'
import { 
  ProblemDefinitionStep, 
  ImpactAssessmentStep, 
  RootCauseAnalysisStep, 
  CorrectiveActionsStep 
} from './steps';
import { BsStars } from "react-icons/bs";
import { aiService } from '../../api/services/aiService';

const RCAWorkflow = ({ 
  currentStep, 
  totalSteps, 
  stepData = {},
  setStepData,
  stepTitle, 
  aiGuidance, 
  response, 
  onResponseChange, 
  onNext, 
  onPrevious, 
  similarCases = [],
  similarCasesLoading = false,
  nextButtonText = "Next Step →",
  showPrevious = true,
  canProceed = true,
  onSaveProgress,
  onGenerateReport,
  ticketData = null,
  onStepClick = null,
  problemStatementData = null,
  isGeneratingProblemStatement = false,
  setIsGeneratingProblemStatement,
  hasAttemptedGeneration = false
}) => {
  // Note: Problem statement state is now managed in the parent component (Analysis.jsx)
  
  // State for Impact step (step 2)
  const [isGeneratingImpactAssessment, setIsGeneratingImpactAssessment] = useState(false)
  const [hasAttemptedImpactGeneration, setHasAttemptedImpactGeneration] = useState(false)

  // State for text enhancement loading
  const [isEnhancingRootCause, setIsEnhancingRootCause] = useState(false)
  const [isEnhancingCorrectiveActions, setIsEnhancingCorrectiveActions] = useState(false)

  // Note: Problem statement generation is now handled within the ProblemDefinitionStep component


  // Note: Impact assessment generation is now handled within the ImpactAssessmentStep component

  // Handle clicking on problem definition
  // Note: Problem definition click handling is now done within the ProblemDefinitionStep component


  // Note: Problem statement enhancement is now handled within the ProblemDefinitionStep component

  // Generic text enhancement function
  const handleEnhanceText = async (currentText, stepIndex, setLoadingState, setLoadingFunction) => {
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
        // Don't update stepData here - let handleRcaNext handle it
        
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

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI RCA Agent</h1>
          <p className="text-gray-600 mt-1">Interactive root cause analysis workflow with AI-powered guidance and suggestions.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            onClick={onSaveProgress}
            className="flex items-center"
          >
            <FiSave className="w-4 h-4 mr-2" />
            Save Progress
          </Button>
          <Button 
            className={`flex items-center ${
              currentStep === totalSteps 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            onClick={onGenerateReport}
            disabled={currentStep !== totalSteps}
          >
            <FiDownload className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* RCA Progress Card */}
      <Card className="bg-white shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">RCA Progress</h2>
            <span className="text-sm text-gray-600">Step {currentStep} of {totalSteps}</span>
          </div>
          
          {/* Progress Bar */}
          <div className="relative">
            {/* Background connecting line */}
            <div className="absolute top-4 left-4 h-0.5 bg-gray-200 rounded-full" style={{ width: 'calc(100% - 3rem)' }}></div>
            
            {/* Progress connecting line */}
            <div 
              className="absolute top-4 left-4 h-0.5 bg-green-600 rounded-full transition-all duration-300"
              style={{ 
                width: currentStep === totalSteps 
                  ? `calc(100% - 3rem)` 
                  : `${((currentStep - 1) / (totalSteps - 1)) * 100}%`
              }}
            ></div>
            
            <div className="flex items-center justify-between relative z-10">
              {Array.from({ length: totalSteps }, (_, index) => {
                const stepNumber = index + 1
                const isCompleted = stepNumber < currentStep
                const isCurrent = stepNumber === currentStep
                const isFuture = stepNumber > currentStep
                const isClickable = onStepClick
                
                return (
                  <div 
                    key={stepNumber} 
                    className={`flex flex-col items-center ${
                      isClickable ? 'cursor-pointer' : 'cursor-default'
                    }`}
                    onClick={() => {
                      if (isClickable) {
                        onStepClick(stepNumber)
                      }
                    }}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200 ${
                      isCompleted 
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : isCurrent 
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    } ${isClickable ? 'hover:scale-105 cursor-pointer' : 'cursor-default'}`}>
                      {isCompleted ? <FiCheck className="w-4 h-4" /> : stepNumber}
                    </div>
                    <span className={`text-xs mt-1 transition-colors duration-200 ${
                      isClickable ? 'text-gray-700 hover:text-gray-900' : 'text-gray-500'
                    }`}>
                      {stepNumber === 1 ? 'Problem' :
                       stepNumber === 2 ? 'Impact' :
                       stepNumber === 3 ? 'Root Cause' : 'Corrective actions'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      
      {/* Main Content */}
      <div className={`grid grid-cols-1 lg:grid-cols-1`}>
        {/* Ticket Information Header */}
{ticketData ? (
        <div className="p-4 bg-white rounded-lg shadow-sm border rounded-b-none">
          <h1 className="text-xl font-bold text-gray-900">
            Source Data
          </h1>
          
          <h1 className="text-md text-gray-900">
            <span className='font-semibold'>Problem:</span> {ticketData.short_description || 'No Title'}
          </h1>
          <div className="text-sm text-gray-600 mx-2">
            {ticketData.description}
            </div>
          <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
            <span><strong>Ticket ID:</strong> {ticketData.ticket_id}</span>
            <span><strong>Source:</strong> {ticketData.source}</span>
            <span><strong>Status:</strong> <Badge className="bg-green-100" variant="secondary">{ticketData.status}</Badge></span>
            <span><strong>Priority:</strong> <Badge className="bg-yellow-100" variant="secondary">{ticketData.priority}</Badge></span>
            <span><strong>Category:</strong> <Badge className="bg-blue-100" variant="secondary">{ticketData.category}</Badge></span>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-white rounded-lg shadow-sm border">
          <div className="flex items-center gap-3 mb-2">
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="flex flex-wrap gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-36" />
          </div>
        </div>
      )}
      {/* Main Content Area */}
      <div >
        <Card className="bg-white shadow-sm border-t-0 rounded-t-none">
          <CardContent className="p-8">
            {/* Step Header */}
            <div className="flex items-center mb-6">
              <div className="flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full text-sm font-semibold mr-3">
                {currentStep}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{stepTitle}</h1>
                <p className="text-sm text-gray-600">Step {currentStep} of {totalSteps}</p>
              </div>
            </div>

            {/* AI Guidance */}
            {/* <div className="mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <FiMessageCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-green-800">AI Guidance</span>
                </div>
                <p className="text-sm text-green-700">{aiGuidance}</p>
              </div>
            </div> */}

            {/* Note: AI Question is now handled within the ProblemDefinitionStep component */}

            {/* Step Content */}
            <div className="mb-8">
               {currentStep === 1 && (
                 <ProblemDefinitionStep
                   stepData={stepData}
                   setStepData={setStepData}
                   ticketData={ticketData}
                   response={response}
                   onResponseChange={onResponseChange}
                   isGeneratingProblemStatement={isGeneratingProblemStatement}
                   setIsGeneratingProblemStatement={setIsGeneratingProblemStatement}
                   hasAttemptedGeneration={hasAttemptedGeneration}
                   problemStatementData={problemStatementData}
                   onNext={onNext}
                   showPrevious={showPrevious}
                   onPrevious={onPrevious}
                 />
               )}
              
              {currentStep === 2 && (
                <ImpactAssessmentStep
                  stepData={stepData}
                  setStepData={setStepData}
                  ticketData={ticketData}
                  response={response}
                  onResponseChange={onResponseChange}
                  isGeneratingImpactAssessment={isGeneratingImpactAssessment}
                  setIsGeneratingImpactAssessment={setIsGeneratingImpactAssessment}
                  hasAttemptedImpactGeneration={hasAttemptedImpactGeneration}
                  setHasAttemptedImpactGeneration={setHasAttemptedImpactGeneration}
                  currentStep={currentStep}
                />
              )}
              
              {currentStep === 3 && (
                <RootCauseAnalysisStep
                  ticketData={ticketData}
                  response={response}
                  onResponseChange={onResponseChange}
                  isEnhancingRootCause={isEnhancingRootCause}
                  setIsEnhancingRootCause={setIsEnhancingRootCause}
                  stepData={stepData}
                  similarCases={similarCases}
                />
              )}
              
              {currentStep === 4 && (
                <CorrectiveActionsStep
                  ticketData={ticketData}
                  stepData={stepData}
                  response={response}
                  onResponseChange={onResponseChange}
                  isEnhancingCorrectiveActions={isEnhancingCorrectiveActions}
                  setIsEnhancingCorrectiveActions={setIsEnhancingCorrectiveActions}
                 />
               )}
            </div>

            {/* Navigation - Only show for steps 2-4, step 1 has its own navigation */}
            {currentStep !== 1 && (
            <div className="flex items-center justify-between">
              {showPrevious && (
                <Button 
                  onClick={onPrevious}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Previous
                </Button>
              )}
              <Button 
                onClick={onNext}
                  disabled={
                    currentStep === 2 ? (!response.trim() || isGeneratingImpactAssessment) :
                    currentStep === 3 ? (!response.trim() || isEnhancingRootCause) :
                    currentStep === 4 ? (!response.trim() || isEnhancingCorrectiveActions) :
                    !canProceed
                  }
                className={`ml-auto ${
                    (currentStep === 2 ? (response.trim() && !isGeneratingImpactAssessment) :
                     currentStep === 3 ? (response.trim() && !isEnhancingRootCause) :
                     currentStep === 4 ? (response.trim() && !isEnhancingCorrectiveActions) :
                     canProceed)
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {nextButtonText}
              </Button>
            </div>
            )}
          </CardContent>
        </Card>
      </div>

      </div>
    </div>
  )
}

export default RCAWorkflow

