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
  aiSuggestions = [], 
  similarCases = [],
  aiSuggestionsLoading = false,
  similarCasesLoading = false,
  nextButtonText = "Next Step →",
  showPrevious = true,
  canProceed = true,
  onSaveProgress,
  onGenerateReport,
  ticketData = null,
  onStepClick = null
}) => {
  // State for Problem Definition step fields
  // State for Problem Definition step (step 1)
  const [isGeneratingProblemStatement, setIsGeneratingProblemStatement] = useState(false)
  const [hasAttemptedGeneration, setHasAttemptedGeneration] = useState(false)
  
  // State for Impact step (step 2)
  const [isGeneratingImpactAssessment, setIsGeneratingImpactAssessment] = useState(false)
  const [hasAttemptedImpactGeneration, setHasAttemptedImpactGeneration] = useState(false)

  // State for text enhancement loading
  const [isEnhancingRootCause, setIsEnhancingRootCause] = useState(false)
  const [isEnhancingCorrectiveActions, setIsEnhancingCorrectiveActions] = useState(false)

  // Generate problem statement when component mounts and we're on step 1
  useEffect(() => {
    const generateProblemStatement = async () => {
      if (currentStep === 1 && ticketData && !isGeneratingProblemStatement && !hasAttemptedGeneration) {
        try {
          setIsGeneratingProblemStatement(true)
          setHasAttemptedGeneration(true)
          
          const requestData = {
            shortDescription: ticketData.short_description || '',
            description: ticketData.description || ticketData.short_description || '',
            serverLogs: ticketData?.logs || []
          }
          
          const response = await aiService.problemStatement.generate(requestData)
          
          if (response.success && response.problemStatement) {
            const { problemStatement } = response
            
             // Set the first problem definition in the textarea and store all definitions
             // Note: Problem definitions handling is now done within the ProblemDefinitionStep component
            
            // Note: AI question handling is now done within the ProblemDefinitionStep component
            
            // Note: Issue type, severity, and business impact mapping 
            // is now handled within the ProblemDefinitionStep component
          }
        } catch (error) {
          console.error('Error generating problem statement:', error)
          alert('Failed to generate AI problem statement. Please fill in the fields manually.')
        } finally {
          setIsGeneratingProblemStatement(false)
        }
      }
    }
    
    generateProblemStatement()
  }, [currentStep, ticketData, isGeneratingProblemStatement, hasAttemptedGeneration])


  // Generate impact assessment when on Impact step (step 2)
  useEffect(() => {
    const generateImpactAssessment = async () => {
      if (currentStep === 2 && stepData && !isGeneratingImpactAssessment && !hasAttemptedImpactGeneration) {
        try {
          setIsGeneratingImpactAssessment(true)
          setHasAttemptedImpactGeneration(true)
          
          // Check if we have the required data from previous steps
          if (stepData.rca_workflow_steps[0]) {
            const requestData = {
              problemStatement: stepData.rca_workflow_steps[0],
              timelineContext: stepData.rca_workflow_steps[0] // Use problem statement as context since timeline is removed
            }
            
            const response = await aiService.impactAssessment.analyze(requestData)
            
            if (response.success && response.data) {
              const { impactAssessment, impactLevel: aiImpactLevel, department } = response.data
              
              // Map AI impact level to our dropdown values
              const impactLevelMap = {
                'Sev 1 - Critical Impact': 'sev1',
                'Sev 2 - Major Impact': 'sev2', 
                'Sev 3 - Normal Impact': 'sev3',
                'Sev 4 - Minor Impact': 'sev4'
              }
              
              // Map AI department to our dropdown values
              const departmentMap = {
                'Customer Support': 'customer_support',
                'Sales': 'sales',
                'IT Operations': 'it_operations',
                'Finance': 'finance',
                'Human Resources': 'hr',
                'Other': 'other'
              }
              
              // Set the impact level
              const mappedImpactLevel = impactLevelMap[aiImpactLevel] || ''
              if (mappedImpactLevel) {
                setImpactLevel(mappedImpactLevel)
                setStepData((prevData) => ({
                  ...prevData,
                  impact_level_step2: mappedImpactLevel
                }))
              }
              
              // Set the department affected
              const mappedDepartment = departmentMap[department] || ''
              if (mappedDepartment) {
                setDepartmentAffected(mappedDepartment)
    setStepData((prevData) => ({
      ...prevData,
                  department_affected_step2: mappedDepartment
                }))
              }
              
              // Set the impact assessment description
              if (impactAssessment) {
                onResponseChange(impactAssessment)
                // Don't update stepData here - let handleRcaNext handle it
              }
            }
          }
        } catch (error) {
          console.error('Error generating impact assessment:', error)
          alert('Failed to generate AI impact assessment. Please fill in the fields manually.')
        } finally {
          setIsGeneratingImpactAssessment(false)
        }
      }
    }
    
    generateImpactAssessment()
  }, [currentStep, stepData, isGeneratingImpactAssessment, hasAttemptedImpactGeneration, onResponseChange])

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

{/* Ticket Information Header */}
{ticketData ? (
        <div className="p-4 bg-white rounded-lg shadow-sm border">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {ticketData.short_description || 'No Title'}
          </h1>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <span><strong>Ticket ID:</strong> {ticketData.ticket_id}</span>
            <span><strong>Source:</strong> {ticketData.source}</span>
            <span><strong>Status:</strong> {ticketData.status}</span>
            <span><strong>Priority:</strong> {ticketData.priority}</span>
            <span><strong>Category:</strong> {ticketData.category}</span>
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
      
      {/* Main Content */}
      <div className={`grid grid-cols-1 gap-8 ${(currentStep === 1 || currentStep === 4) ? 'lg:grid-cols-3' : 'lg:grid-cols-1'}`}>
      {/* Main Content Area */}
      <div className={(currentStep === 1 || currentStep === 4) ? 'lg:col-span-2' : 'lg:col-span-1'}>
        <Card className="bg-white shadow-sm">
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
            <div className="mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <FiMessageCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-green-800">AI Guidance</span>
                </div>
                <p className="text-sm text-green-700">{aiGuidance}</p>
              </div>
            </div>

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
                  setHasAttemptedGeneration={setHasAttemptedGeneration}
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
                />
              )}
              
              {currentStep === 3 && (
                <RootCauseAnalysisStep
                  ticketData={ticketData}
                  response={response}
                  onResponseChange={onResponseChange}
                  isEnhancingRootCause={isEnhancingRootCause}
                  setIsEnhancingRootCause={setIsEnhancingRootCause}
                />
              )}
              
              {currentStep === 4 && (
                <CorrectiveActionsStep
                  ticketData={ticketData}
                  response={response}
                  onResponseChange={onResponseChange}
                  isEnhancingCorrectiveActions={isEnhancingCorrectiveActions}
                  setIsEnhancingCorrectiveActions={setIsEnhancingCorrectiveActions}
                 />
               )}
            </div>

            {/* Navigation */}
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
                  currentStep === 1 ? (!response.trim() || isGeneratingProblemStatement) :
                  currentStep === 2 ? (!response.trim() || isGeneratingImpactAssessment) :
                  currentStep === 3 ? (!response.trim() || isEnhancingRootCause) :
                  currentStep === 4 ? (!response.trim() || isEnhancingCorrectiveActions) :
                  !canProceed
                }
                className={`ml-auto ${
                  (currentStep === 1 ? (response.trim() && !isGeneratingProblemStatement) :
                   currentStep === 2 ? (response.trim() && !isGeneratingImpactAssessment) :
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
          </CardContent>
        </Card>
      </div>

      {/* Right Sidebar - Show for Problem Definition (step 1) and Root Cause (step 4) */}
      {(currentStep === 1 || currentStep === 4) && (
      <div className="lg:col-span-1 space-y-6">
         
        {/* Note: Problem Definitions are now handled within the ProblemDefinitionStep component */}

        {/* Similar Cases - Only show for Root Cause step (step 4) */}
        {currentStep === 4 && ((similarCases && similarCases.results && similarCases.results.length > 0) || similarCasesLoading) ? (
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                <FiSearch className="w-5 h-5 mr-2 text-blue-500" />
                Similar Cases
                {similarCases && similarCases.total_results && (
                  <Badge variant="secondary" className="ml-2">
                    {similarCases.total_results} found
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {similarCasesLoading ? (
                // Skeleton loader for similar cases
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-4 w-full mb-1" />
                        <Skeleton className="h-3 w-3/4" />
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Skeleton className="h-6 w-16" />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))
              ) : (
                similarCases.results.map((caseItem, index) => (
                  <div key={caseItem.ticket_id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{caseItem.ticket_id}</p>
                        <p className="text-sm text-gray-600 mt-1">{caseItem.short_description}</p>
                        {caseItem.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{caseItem.description}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge className={`${
                          caseItem.confidence_percentage >= 90 ? 'bg-green-100 text-green-800' :
                          caseItem.confidence_percentage >= 80 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {caseItem.confidence_percentage}% match
                        </Badge>
                        {/* <span className="text-xs text-gray-500">Rank #{caseItem.rank}</span> */}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                      {/* <span><strong>Status:</strong> {caseItem.status}</span>
                      <span><strong>Priority:</strong> {caseItem.priority}</span>
                      <span><strong>Category:</strong> {caseItem.category}</span> */}
                      <span><strong>Source:</strong> {caseItem.source}</span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        ) : null}

        {/* AI Suggestions - Only show for Root Cause step (step 4) */}
        {currentStep === 4 && (aiSuggestions.length > 0 || aiSuggestionsLoading) && (
           <Card className="bg-white shadow-sm">
             <CardHeader>
               <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                 <FiZap className="w-5 h-5 mr-2 text-yellow-500" />
                 AI Suggestions
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-3">
               {aiSuggestionsLoading ? (
                 // Skeleton loader for AI suggestions
                 Array.from({ length: 3 }).map((_, index) => (
                   <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                     <Skeleton className="h-4 w-full mb-2" />
                     <Skeleton className="h-4 w-3/4 mb-1" />
                     <Skeleton className="h-4 w-1/2" />
                   </div>
                 ))
               ) : (
                 aiSuggestions.map((suggestion, index) => (
                   <div 
                     key={index} 
                     className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                     onClick={() => onResponseChange(suggestion)}
                   >
                     <p className="text-sm text-gray-700">{suggestion}</p>
                   </div>
                 ))
               )}
             </CardContent>
           </Card>
         )}
      </div>
      )}
      </div>
    </div>
  )
}

export default RCAWorkflow

