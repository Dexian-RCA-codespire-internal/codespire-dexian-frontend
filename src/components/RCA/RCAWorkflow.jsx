
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { Skeleton } from '../ui/skeleton'
import { FiMessageCircle, FiZap, FiSearch, FiArrowRight, FiArrowLeft, FiDownload, FiSave, FiCheck,FiLoader, FiFileText, FiCpu } from 'react-icons/fi'
import { 
  ImpactAssessmentStep, 
  RootCauseAnalysisStep, 
  CorrectiveActionsStep 
} from './steps';
import { BsStars } from "react-icons/bs";
import { aiService } from '../../api/services/aiService';
import ProblemDefinitionStep from './steps/ProblemDefinitionStep';
import EnhancementModal from '../ui/EnhancementModal';

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
  hasAttemptedGeneration = false,
  onGuidanceResult = null,
  rcaResolvedData = null,
  hasExistingRcaData = false,
  isLoadingRcaData = false,
  saveStepToDatabase = null
}) => {
  // State for Impact step (step 2)
  const [isGeneratingImpactAssessment, setIsGeneratingImpactAssessment] = useState(false)
  const [hasAttemptedImpactGeneration, setHasAttemptedImpactGeneration] = useState(false)

  // State for text enhancement loading
  const [isEnhancingRootCause, setIsEnhancingRootCause] = useState(false)
  const [isEnhancingCorrectiveActions, setIsEnhancingCorrectiveActions] = useState(false)

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
    <div className="space-y-5">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
            <BsStars className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-wide">AI RCA Agent</h1>
            <p className="text-sm text-gray-500 font-medium">Intelligent root cause analysis with AI-powered insights</p>
          </div>
        </div>
     
      </div>

      {/* Compact Progress Bar */}
      <Card className="bg-gradient-to-br from-gray-50 to-white border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-gray-900 tracking-wide">Analysis Progress</h2>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-0 font-semibold">
                Step {currentStep}/{totalSteps}
              </Badge>
            </div>
            <span className="text-xs text-gray-500 font-semibold">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
          </div>
          
          {/* Progress Bar */}
          <div className="relative">
            {/* Background line */}
            <div className="absolute top-3 left-3 h-0.5 bg-gray-200" style={{ width: 'calc(100% - 1.5rem)' }}></div>
            
            {/* Active progress line */}
            <div 
              className="absolute top-3 left-3 h-0.5 bg-gradient-to-r from-purple-500 to-blue-600 transition-all duration-500"
              style={{ 
                width: currentStep === totalSteps 
                  ? `calc(100% - 1.5rem)` 
                  : `${((currentStep - 1) / (totalSteps - 1)) * 100}%`
              }}
            ></div>
            
            <div className="flex items-center justify-between relative z-10">
              {Array.from({ length: totalSteps }, (_, index) => {
                const stepNumber = index + 1
                const isCompleted = stepNumber < currentStep
                const isCurrent = stepNumber === currentStep
                const isClickable = onStepClick && (stepNumber <= currentStep || stepNumber === currentStep + 1)
                
                const stepNames = ['Problem', 'Impact', 'Root Cause', 'Actions']
                
                return (
                  <div 
                    key={stepNumber} 
                    className={`flex flex-col items-center ${isClickable ? 'cursor-pointer' : ''}`}
                    onClick={() => isClickable && onStepClick(stepNumber)}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                      isCompleted 
                        ? 'bg-gradient-to-br from-purple-500 to-blue-600 text-white shadow-md' 
                        : isCurrent 
                        ? 'bg-gradient-to-br from-purple-500 to-blue-600 text-white shadow-lg ring-4 ring-purple-100' 
                        : isClickable
                        ? 'bg-blue-500 text-white hover:shadow-md'
                        : 'bg-gray-200 text-gray-400'
                    } ${isClickable ? 'hover:scale-110' : ''}`}>
                      {isCompleted ? <FiCheck className="w-3 h-3" /> : stepNumber}
                    </div>
                    <span className={`text-[10px] mt-1.5 font-semibold whitespace-nowrap ${
                      isCompleted || isCurrent ? 'text-gray-700' : 'text-gray-400'
                    }`}>
                      {stepNames[index]}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6">
        {/* Source Data Section */}
        {ticketData ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-100 to-indigo-50 px-5 py-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <FiFileText className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-semibold text-gray-900 tracking-wide">Source Data</h2>
              </div>
            </div>
            <div className="p-5">
              <h3 className="text-base font-semibold text-gray-900 mb-2 tracking-wide">
                {ticketData.short_description || 'No Title'}
              </h3>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed font-medium">
                {ticketData.description}
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs bg-gray-50 border-gray-300 text-gray-700 font-semibold">
                  <span className="font-semibold">ID:</span> {ticketData.ticket_id}
                </Badge>
                <Badge variant="outline" className="text-xs bg-gray-50 border-gray-300 text-gray-700 font-semibold">
                  <span className="font-semibold">Source:</span> {ticketData.source}
                </Badge>
                <Badge className="text-xs bg-green-50 border-green-200 text-green-700 border font-semibold">
                  {ticketData.status}
                </Badge>
                <Badge className="text-xs bg-yellow-50 border-yellow-200 text-yellow-700 border font-semibold">
                  {ticketData.priority}
                </Badge>
                <Badge className="text-xs bg-blue-50 border-blue-200 text-blue-700 border font-semibold">
                  {ticketData.category}
                </Badge>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <Skeleton className="h-8 w-48" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        )}

        {/* AI Analysis Section */}
        <div className="bg-white rounded-xl border border-purple-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 px-5 py-3 border-b border-purple-200">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                <FiCpu className="w-3 h-3 text-white" />
              </div>
          <h2 className="text-sm text-gray-900 font-medium">
  {stepTitle && (
    <>
     
      <span className="font-semibold tracking-wide">{stepTitle}</span>
       {" - "}
    </>
  )}   AI Analysis & Insights
</h2>

              <Badge className="bg-purple-100 text-purple-700 text-[10px] border-0 ml-auto font-semibold">
                Powered by AI
              </Badge>
            </div>
          </div>
          
          <CardContent className="p-6">
            {/* Step Header */}
            {/* <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 text-white rounded-lg text-sm font-semibold shadow-md">
                {currentStep}
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{stepTitle}</h1>
                <p className="text-xs text-gray-500">Step {currentStep} of {totalSteps}</p>
              </div>
            </div> */}

            {/* Step Content */}
            <div className="mb-6">
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
                  rcaResolvedData={rcaResolvedData}
                  hasExistingRcaData={hasExistingRcaData}
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
                  rcaResolvedData={rcaResolvedData}
                  hasExistingRcaData={hasExistingRcaData}
                  isLoadingRcaData={isLoadingRcaData}
                />
              )}
              
              {currentStep === 3 && (
                <>
                  {console.log('RCAWorkflow: Rendering step 3 with data:', {
                    hasTicketData: !!ticketData,
                    hasExistingRcaData,
                    isLoadingRcaData,
                    stepDataExists: !!stepData?.rca_workflow_steps?.[2]
                  })}
                  <RootCauseAnalysisStep
                    ticketData={ticketData}
                    response={response}
                    onResponseChange={onResponseChange}
                    isEnhancingRootCause={isEnhancingRootCause}
                    setIsEnhancingRootCause={setIsEnhancingRootCause}
                    handleEnhanceText={handleEnhanceText}
                    stepData={stepData}
                    setStepData={setStepData}
                    similarCases={similarCases}
                    rcaResolvedData={rcaResolvedData}
                    hasExistingRcaData={hasExistingRcaData}
                    saveStepToDatabase={saveStepToDatabase}
                    isLoadingRcaData={isLoadingRcaData}
                  />
                </>
              )}
              
              {currentStep === 4 && (
                <>
                  {console.log('RCAWorkflow: Rendering step 4 with data:', {
                    hasTicketData: !!ticketData,
                    hasExistingRcaData,
                    isLoadingRcaData,
                    stepDataExists: !!stepData?.rca_workflow_steps?.[3]
                  })}
                  <CorrectiveActionsStep
                    ticketData={ticketData}
                    stepData={stepData}
                    setStepData={setStepData}
                    response={response}
                    onResponseChange={onResponseChange}
                    isEnhancingCorrectiveActions={isEnhancingCorrectiveActions}
                    setIsEnhancingCorrectiveActions={setIsEnhancingCorrectiveActions}
                    aiGuidance={aiGuidance}
                    onGuidanceResult={onGuidanceResult}
                    rcaResolvedData={rcaResolvedData}
                    hasExistingRcaData={hasExistingRcaData}
                    saveStepToDatabase={saveStepToDatabase}
                    isLoadingRcaData={isLoadingRcaData}
                  />
                </>
              )}
            </div>

            {/* Navigation - Only show for steps 2-4 */}
            {currentStep !== 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                {showPrevious && (
                  <Button 
                    onClick={onPrevious}
                    variant="outline"
                    className="flex items-center gap-2 border-gray-300 hover:bg-gray-50 font-medium shadow-sm"
                  >
                    <FiArrowLeft className="w-4 h-4" />
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
                  className={`ml-auto flex items-center gap-2 font-medium shadow-sm ${
                    (currentStep === 2 ? (response.trim() && !isGeneratingImpactAssessment) :
                    currentStep === 3 ? (response.trim() && !isEnhancingRootCause) :
                    currentStep === 4 ? (response.trim() && !isEnhancingCorrectiveActions) :
                    canProceed)
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg shadow-purple-500/30' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {nextButtonText}
                  <FiArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </div>
      </div>
    </div>
  )
}

export default RCAWorkflow