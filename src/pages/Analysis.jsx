import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ticketService, aiService } from '../api'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Badge } from '../components/ui/badge'
import { Skeleton } from '../components/ui/skeleton'
import { RCAWorkflow } from '../components/RCA'
import { FiUpload, FiImage, FiUser, FiPlus, FiClock, FiMoreHorizontal, FiSearch, FiZap, FiTrendingUp, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi'

const Analysis = () => {
  const { id, ticketId } = useParams()
  const navigate = useNavigate()
  
  // Ticket data state
  const [ticketData, setTicketData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Similar cases state
  const [similarCases, setSimilarCases] = useState(null)
  const [similarCasesLoading, setSimilarCasesLoading] = useState(false)
  const [similarCasesError, setSimilarCasesError] = useState(null)
  
  // AI suggestions state
  
  const [analysisNotes, setAnalysisNotes] = useState('')
  const [rootCause, setRootCause] = useState('')
  const [recommendations, setRecommendations] = useState('')

  // RCA Workflow State
  const [rcaStep, setRcaStep] = useState(1)
  const [analysisResponse, setAnalysisResponse] = useState('')
  
  // Problem Statement State
  const [problemStatementData, setProblemStatementData] = useState({
    problemDefinitions: [],
    aiQuestion: '',
    issueType: '',
    severity: '',
    businessImpactCategory: '',
    generatedProblemStatement: ''
  })
  const [isGeneratingProblemStatement, setIsGeneratingProblemStatement] = useState(false)
  const [hasAttemptedGeneration, setHasAttemptedGeneration] = useState(false)
  
  // Debug wrapper for setAnalysisResponse
  const debugSetAnalysisResponse = (value) => {
    console.log('setAnalysisResponse called with:', value);
    setAnalysisResponse(value);
  }
  
  // Step data tracking
  const [stepData, setStepData] = useState({
    rca_workflow_steps: ['', '', '', ''], // Array for 4 steps
    impact_level_step2: '',
    department_affected_step2: '',
    // Step 1 dropdown values
    issueType: '',
    severity: '',
    businessImpactCategory: ''
  })

  // Fetch similar cases
  const fetchSimilarCases = async (ticketData) => {
    try {
      setSimilarCasesLoading(true)
      setSimilarCasesError(null)
      console.log('Fetching similar cases for ticket:', ticketData)
      
      const requestData = {
        source: ticketData.source,
        short_description: ticketData.short_description,
        description: ticketData.description || ticketData.short_description,
        category: ticketData.category
      }
      
      const response = await ticketService.getSimilarTickets(requestData)
      console.log('Similar cases received:', response)
      
      setSimilarCases(response)
      return response
    } catch (err) {
      console.error('Error fetching similar cases:', err)
      setSimilarCasesError(err.message || 'Failed to fetch similar cases')
      return null
    } finally {
      setSimilarCasesLoading(false)
    }
  }


  // Fetch ticket data when component loads
  useEffect(() => {
    const fetchTicketData = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log('Fetching ticket data for ID:', id)
        
        const response = await ticketService.getTicketById(id)
        console.log('Ticket data received:', response)
        
        const ticket = response.data || response
        setTicketData(ticket)
        
        // Load existing step data from ticket
        if (ticket) {
          // Handle both old and new data structures
          let existingStepData
          if (ticket.rca_workflow_steps && Array.isArray(ticket.rca_workflow_steps)) {
            // New structure: use rca_workflow_steps array
            console.log('Using new structure, ticket.rca_workflow_steps:', ticket.rca_workflow_steps);
            existingStepData = {
              rca_workflow_steps: ticket.rca_workflow_steps.length > 0 ? ticket.rca_workflow_steps : ['', '', '', ''],
              impact_level_step2: ticket.impact_level_step2 || '',
              department_affected_step2: ticket.department_affected_step2 || '',
              issueType: ticket.issueType || '',
              severity: ticket.severity || '',
              businessImpactCategory: ticket.businessImpactCategory || ''
            }
          } else {
            // Old structure: convert individual step fields to array
            console.log('Using old structure, converting individual fields');
            existingStepData = {
              rca_workflow_steps: [
                ticket.problem_step1 || '',
                ticket.timeline_step2 || '',
                ticket.impact_step3 || '',
                ticket.root_cause_step4 || ticket.findings_step4 || '',
                ticket.corrective_actions_step5 || ''
              ].slice(0, 4), // Take only first 4 steps since we removed timeline
              impact_level_step2: ticket.impact_level_step2 || '',
              department_affected_step2: ticket.department_affected_step2 || '',
              issueType: ticket.issueType || '',
              severity: ticket.severity || '',
              businessImpactCategory: ticket.businessImpactCategory || '',
              problemStatementData: ticket.problemStatementData || null,
              impactAssessments: ticket.impactAssessments || null,
              rootCauseAnalysis: ticket.rootCauseAnalysis || null,
              correctiveActions: ticket.correctiveActions || null
            }
          }
          console.log('Final existingStepData:', existingStepData);
          setStepData(existingStepData)
          
          // Find and navigate to first incomplete step
          const firstIncompleteStep = findFirstIncompleteStepWithData(existingStepData)
          setRcaStep(firstIncompleteStep)
          
          // Load the response for the current step
          const stepResponse = existingStepData.rca_workflow_steps[firstIncompleteStep - 1] || ''
          console.log('Loading step response for step', firstIncompleteStep, ':', stepResponse)
          debugSetAnalysisResponse(stepResponse)
          
          // Restore problem statement data if available
          if (existingStepData.problemStatementData) {
            setProblemStatementData(existingStepData.problemStatementData)
          }
          
          // Restore impact assessments if available
          if (existingStepData.impactAssessments) {
            console.log('Restoring impact assessments:', existingStepData.impactAssessments)
          }
          
          // Generate problem statement if not already generated
          if (!hasAttemptedGeneration) {
            console.log('Triggering problem statement generation...')
            generateProblemStatement(ticket)
          } else {
            console.log('Problem statement generation already attempted, skipping...')
          }
        }
        
        // Start fetching similar cases after ticket data is loaded
        if (ticket) {
          fetchSimilarCases(ticket)
        }
      } catch (err) {
        console.error('Error fetching ticket data:', err)
        setError(err.message || 'Failed to fetch ticket data')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchTicketData()
    }
  }, [id])

  // Generate problem statement function
  const generateProblemStatement = async (ticket) => {
    console.log('generateProblemStatement called with:', {
      ticket: !!ticket,
      isGeneratingProblemStatement,
      hasAttemptedGeneration
    })
    
    if (!ticket || isGeneratingProblemStatement) {
      console.log('Skipping problem statement generation due to conditions')
      return
    }
    
    // Check if problem statement data already exists
    if (problemStatementData.generatedProblemStatement && problemStatementData.generatedProblemStatement.trim().length > 0) {
      console.log('Problem statement already exists, skipping generation')
      return
    }
    
    console.log('Generating problem statement...')

    try {
      setIsGeneratingProblemStatement(true)
      setHasAttemptedGeneration(true)
      
      const requestData = {
        shortDescription: ticket.short_description || '',
        description: ticket.description || '',
        category: ticket.category || '',
        logs: ticket.logs || []
      }
      
      console.log('Generating problem statement with data:', requestData)
      const response = await aiService.problemStatement.generate(requestData)
      // const response = {
      //   success: true,
      //   message: "Problem statement generated successfully",
      //   inputData: {
      //     hasDescription: true,
      //     logCount: 0
      //   },
      //   problemStatement: {
      //     problemDefinitions: [
      //       "The operating system's registry entries responsible for file type associations are corrupted or incorrectly configured, preventing applications from launching correctly when specific file types are opened. This may involve issues with the .reg files or system-level settings.",
      //       "Users are unable to open files using their default applications, leading to potential delays in completing tasks and impacting overall productivity. This disruption affects workflow efficiency and may result in missed deadlines.",
      //       "Users report an inability to open files with their preferred programs, resulting in a frustrating and unproductive user experience.  This impacts user satisfaction and may lead to increased help desk tickets."
      //     ],
      //     question: "Are the file type associations in the Windows Registry correctly mapped to the appropriate executable files?",
      //     issueType: "Software",
      //     severity: "Sev 3 – Moderate",
      //     businessImpact: "Operational Downtime",
      //     confidence: 0.85
      //   },
      //   processingTimeMs: 19527,
      //   metadata: {
      //     timestamp: "2025-09-25T11:16:28.941Z"
      //   }
      // }
      // console.log('Problem statement API response:', response)
      
      if (response.success && response.problemStatement) {
        const { problemStatement } = response
        
        // Update problem statement data
        const newProblemStatementData = {
          problemDefinitions: problemStatement.problemDefinitions || [],
          aiQuestion: problemStatement.question || '',
          issueType: problemStatement.issueType || '',
          severity: problemStatement.severity || '',
          businessImpactCategory: problemStatement.businessImpact || '',
          generatedProblemStatement: problemStatement.problemDefinitions?.[0] || ''
        }
        
        setProblemStatementData(newProblemStatementData)
        
        // Store problem statement data in stepData for persistence
        setStepData(prevData => ({
          ...prevData,
          problemStatementData: newProblemStatementData
        }))
        
        // Auto-populate step 1 with the first problem definition and dropdown values
        if (problemStatement.problemDefinitions && problemStatement.problemDefinitions.length > 0) {
          const firstDefinition = problemStatement.problemDefinitions[0]
          setAnalysisResponse(firstDefinition)
          
          // Map AI values to dropdown values
          const issueTypeMap = {
            'Software': 'software',
            'Hardware': 'hardware', 
            'Network': 'network',
            'Configuration': 'configuration',
            'User Error': 'user_error',
            'Other': 'other'
          }
          
          const severityMap = {
            'Sev 1 – Critical': 'sev1',
            'Sev 2 – Major': 'sev2',
            'Sev 3 – Moderate': 'sev3',
            'Sev 4 – Minor': 'sev4'
          }
          
          const impactMap = {
            'Revenue Loss': 'revenue_loss',
            'Compliance Issue': 'compliance_issue',
            'Operational Downtime': 'operational_downtime',
            'Customer Support': 'customer_support',
            'Other': 'other'
          }
          
           // Update step data with problem statement and dropdown values
           setStepData(prevData => {
             const updatedStepData = {
               ...prevData,
               rca_workflow_steps: [
                 firstDefinition,
                 prevData.rca_workflow_steps[1] || '',
                 prevData.rca_workflow_steps[2] || '',
                 prevData.rca_workflow_steps[3] || ''
               ],
               issueType: issueTypeMap[problemStatement.issueType] || '',
               severity: severityMap[problemStatement.severity] || '',
               businessImpactCategory: impactMap[problemStatement.businessImpact] || ''
             }
             
             console.log('Auto-populating dropdowns with values:', {
               issueType: updatedStepData.issueType,
               severity: updatedStepData.severity,
               businessImpactCategory: updatedStepData.businessImpactCategory,
               originalValues: {
                 issueType: problemStatement.issueType,
                 severity: problemStatement.severity,
                 businessImpact: problemStatement.businessImpact
               }
             })
             
             return updatedStepData
           })
        }
        
        console.log('Problem statement generated successfully:', newProblemStatementData)
      } else {
        console.warn('Problem statement API returned unsuccessful response:', response)
      }
    } catch (error) {
      console.error('Error generating problem statement:', error)
      // Don't show alert here as it's automatic generation
    } finally {
      setIsGeneratingProblemStatement(false)
    }
  }

  const analysisInsights = [
    {
      type: 'critical',
      title: 'Database Connection Pool Exhaustion',
      description: 'High traffic periods cause connection pool to reach maximum capacity',
      impact: 'High',
      icon: <FiAlertTriangle className="w-5 h-5 text-red-500" />
    },
    {
      type: 'warning',
      title: 'Memory Leak in Payment Service',
      description: 'Gradual memory consumption increase over time',
      impact: 'Medium',
      icon: <FiTrendingUp className="w-5 h-5 text-yellow-500" />
    },
    {
      type: 'success',
      title: 'API Response Time Improved',
      description: 'After implementing caching, response times reduced by 40%',
      impact: 'Low',
      icon: <FiCheckCircle className="w-5 h-5 text-green-500" />
    }
  ]


  const handleResolution = () => {
    // Keep resolution functionality within the analysis page
    // No navigation needed - user can complete resolution here
    console.log('Resolution completed for ticket:', ticketId)
  }

  // RCA Workflow Data
  const rcaSteps = [
    {
      step: 1,
      title: 'Problem Definition',
      aiGuidance: 'What specific problem or incident occurred? Please describe the symptoms observed.',
    },
    {
      step: 2,
      title: 'Impact Assessment',
      aiGuidance: 'What was the business and technical impact of this issue?'
    },
    {
      step: 3,
      title: 'Root Cause Analysis',
      aiGuidance: 'Based on your investigation, what is the underlying root cause?'
    },
    {
      step: 4,
      title: 'Corrective Actions',
      aiGuidance: 'What specific actions will you take to prevent this issue from recurring?'
    }
  ]

  // Mock similar cases data (will be replaced by API data)
  const mockSimilarCases = [
    { id: 'RCA-087', title: 'Payment timeout issues', match: 89 },
    { id: 'RCA-053', title: 'Database connection failures', match: 76 },
    { id: 'RCA-091', title: 'API response delays', match: 64 }
  ]

  // RCA Workflow Handlers
  const handleRcaNext = async () => {
    try {
      if (!ticketData) {
        console.error('No ticket data available')
        return
      }

      // Add validation to prevent empty submissions
      if (!analysisResponse || analysisResponse.trim().length === 0) {
        alert('Please enter some text before proceeding to the next step.')
        return
      }

      // Update the current step data in the array
      console.log('=== DEBUGGING RCA DATA ===');
      console.log('stepData:', stepData);
      console.log('rcaStep:', rcaStep);
      console.log('analysisResponse:', analysisResponse);
      console.log('stepData.rca_workflow_steps:', stepData.rca_workflow_steps);
      
      // Ensure rca_workflow_steps array exists and has proper length
      const currentSteps = stepData.rca_workflow_steps || ['', '', '', '']
      console.log('currentSteps before update:', currentSteps);
      
      // Get the current step data from the response or from stepData
      // For step 1, we need to get the problemSummary from the RCAWorkflow component
      let currentStepData
      if (rcaStep === 1) {
        // For step 1, we need to get the problemSummary from the RCAWorkflow component
        // Since we can't access it directly, we'll use analysisResponse which should be set by the textarea
        currentStepData = analysisResponse || currentSteps[rcaStep - 1] || ''
      } else {
        currentStepData = analysisResponse || currentSteps[rcaStep - 1] || ''
      }
      
      // Update the current step with the current data
      const updatedSteps = currentSteps.map((step, index) => 
        index === rcaStep - 1 ? currentStepData : step
      )
      console.log('updatedSteps after mapping:', updatedSteps);
      
      const updatedStepData = {
        ...stepData, // Preserve all existing stepData
        rca_workflow_steps: updatedSteps,
        status: rcaStep === 4 ? 'Resolved' : 'In Progress'
      }

      // Call API to update ticket with step data
      console.log('Sending to backend:', updatedStepData)
      await ticketService.updateTicketSteps({
        ticketId: ticketData._id,
        stepData: updatedStepData
      })

      // Update local step data state
      setStepData(updatedStepData)

      if (rcaStep < 4) {
        // Move to next step
        setRcaStep(rcaStep + 1)
        // Clear response for next step
        setAnalysisResponse('')
      } else {
        // Complete RCA - check if all previous steps are complete
        if (!areAllPreviousStepsComplete()) {
          // Show alert about incomplete steps
          const incompleteSteps = []
          if (!stepData.rca_workflow_steps[0] || stepData.rca_workflow_steps[0].trim().length === 0) {
            incompleteSteps.push('Problem Definition (Step 1)')
          }
          if (!stepData.rca_workflow_steps[1] || stepData.rca_workflow_steps[1].trim().length === 0 || 
              !stepData.impact_level_step2 || !stepData.department_affected_step2) {
            incompleteSteps.push('Impact Assessment (Step 2)')
          }
          if (!stepData.rca_workflow_steps[2] || stepData.rca_workflow_steps[2].trim().length === 0) {
            incompleteSteps.push('Root Cause Analysis (Step 3)')
          }
          
          alert(`Cannot complete RCA. The following steps are not completed:\n\n${incompleteSteps.join('\n')}\n\nPlease complete these steps first.`)
          return
        }
        
        // All steps complete - navigate to RCA completion page
        console.log('All RCA steps completed, navigating to completion page')
        
        // Navigate to RCA completion page with all the data
        navigate(`/rca-completion/${id}/${ticketId}`, {
          state: {
            ticketData: ticketData,
            stepData: {
              ...stepData,
              rca_workflow_steps: stepData.rca_workflow_steps.map((step, index) => 
                index === rcaStep - 1 ? analysisResponse : step
              )
            }
          }
        })
      }
    } catch (error) {
      console.error('Error saving step data:', error)
      alert(`Error saving step data: ${error.message}`)
    }
  }

  const handleRcaPrevious = () => {
    if (rcaStep > 1) {
      const previousStep = rcaStep - 1
      setRcaStep(previousStep)
      
      // Load previous step data if available
      if (stepData.rca_workflow_steps[previousStep - 1]) {
        debugSetAnalysisResponse(stepData.rca_workflow_steps[previousStep - 1])
      } else {
        debugSetAnalysisResponse('')
      }
    }
  }

  const getCurrentStepData = () => {
    return rcaSteps.find(step => step.step === rcaStep) || rcaSteps[0]
  }

  // Check if all previous steps have data
  const areAllPreviousStepsComplete = () => {
    if (rcaStep < 4) return true // Not on final step yet
    
    // Check if steps 1-3 have data
    const hasRequiredSteps = stepData.rca_workflow_steps[0] && stepData.rca_workflow_steps[0].trim().length > 0 &&
                            stepData.rca_workflow_steps[2] && stepData.rca_workflow_steps[2].trim().length > 0
    
    // Special check for step 2 (impact assessment) - needs all three fields
    const hasImpactStep = stepData.rca_workflow_steps[1] && stepData.rca_workflow_steps[1].trim().length > 0 && 
                         stepData.impact_level_step2 && stepData.department_affected_step2
    
    return hasRequiredSteps && hasImpactStep
  }

  // Find the first incomplete step
  const findFirstIncompleteStep = () => {
    // Check step 1 (Problem Definition)
    if (!stepData.rca_workflow_steps[0] || stepData.rca_workflow_steps[0].trim().length === 0) {
      return 1
    }
    
    // Check step 2 (Impact Assessment) - needs all three fields
    if (!stepData.rca_workflow_steps[1] || stepData.rca_workflow_steps[1].trim().length === 0 || 
        !stepData.impact_level_step2 || !stepData.department_affected_step2) {
      return 2
    }
    
    // Check step 3 (Root Cause Analysis)
    if (!stepData.rca_workflow_steps[2] || stepData.rca_workflow_steps[2].trim().length === 0) {
      return 3
    }
    
    // If all steps are complete, return step 4
    return 4
  }

  // Find the first incomplete step with provided data
  const findFirstIncompleteStepWithData = (stepDataToCheck) => {
    // Check step 1 (Problem Definition)
    if (!stepDataToCheck.rca_workflow_steps[0] || stepDataToCheck.rca_workflow_steps[0].trim().length === 0) {
      return 1
    }
    
    // Check step 2 (Impact Assessment) - needs all three fields
    if (!stepDataToCheck.rca_workflow_steps[1] || stepDataToCheck.rca_workflow_steps[1].trim().length === 0 || 
        !stepDataToCheck.impact_level_step2 || !stepDataToCheck.department_affected_step2) {
      return 2
    }
    
    // Check step 3 (Root Cause Analysis)
    if (!stepDataToCheck.rca_workflow_steps[2] || stepDataToCheck.rca_workflow_steps[2].trim().length === 0) {
      return 3
    }
    
    // If all steps are complete, return step 4
    return 4
  }

  const handleSaveProgress = () => {
    console.log('Saving progress...')
    // Implement save functionality
  }

  const handleGenerateReport = () => {
    console.log('Generating report...')
    // Implement report generation
  }

  // Handle step navigation
  const handleStepClick = (stepNumber) => {
    console.log('=== STEP CLICK DEBUG ===');
    console.log('Clicked step:', stepNumber);
    console.log('Current stepData:', stepData);
    console.log('rca_workflow_steps:', stepData.rca_workflow_steps);
    console.log('Current analysisResponse before update:', analysisResponse);
    console.log('Step 1 dropdown values:', {
      issueType: stepData.issueType,
      severity: stepData.severity,
      businessImpactCategory: stepData.businessImpactCategory
    });
    
    // Allow navigation to any step
    setRcaStep(stepNumber)
    
    // Load existing step data if available
    const stepResponse = stepData.rca_workflow_steps[stepNumber - 1] || ''
    console.log('Loading response for step', stepNumber, ':', stepResponse);
    console.log('Setting analysisResponse to:', stepResponse);
    debugSetAnalysisResponse(stepResponse)
    
    // Debug: Check if the response was set correctly
    setTimeout(() => {
      console.log('analysisResponse after update:', analysisResponse);
    }, 100);
  }

  // Show loading state with skeleton loaders instead of full page spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          

          {/* RCA Workflow with skeleton loaders - only show ticket data skeleton */}
          <RCAWorkflow
            currentStep={rcaStep}
            totalSteps={4}
            stepData={stepData}
            setStepData={setStepData}
            stepTitle={getCurrentStepData().title}
            aiGuidance={getCurrentStepData().aiGuidance}
            response={analysisResponse}
            onResponseChange={debugSetAnalysisResponse}
            onNext={handleRcaNext}
            onPrevious={handleRcaPrevious}
            similarCases={null}
            similarCasesLoading={false}
            nextButtonText={rcaStep === 5 ? "Complete RCA →" : "Next Step →"}
            showPrevious={rcaStep > 1}
            canProceed={analysisResponse.trim().length > 0}
            onSaveProgress={handleSaveProgress}
            onGenerateReport={handleGenerateReport}
            ticketData={null}
            onStepClick={handleStepClick}
            problemStatementData={problemStatementData}
            isGeneratingProblemStatement={isGeneratingProblemStatement}
            setIsGeneratingProblemStatement={setIsGeneratingProblemStatement}
            hasAttemptedGeneration={hasAttemptedGeneration}
          />
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <FiAlertTriangle className="w-12 h-12 mx-auto mb-2" />
            <p className="text-lg font-semibold">Error Loading Ticket</p>
            <p className="text-sm text-gray-600">{error}</p>
          </div>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* RCA Workflow */}
        <RCAWorkflow
          currentStep={rcaStep}
          totalSteps={4}
          stepData={stepData}
          setStepData={setStepData}
          stepTitle={getCurrentStepData().title}
          aiGuidance={getCurrentStepData().aiGuidance}
          response={analysisResponse}
          onResponseChange={debugSetAnalysisResponse}
          onNext={handleRcaNext}
          onPrevious={handleRcaPrevious}
          similarCases={similarCases}
          similarCasesLoading={similarCasesLoading}
          nextButtonText={rcaStep === 4 ? "Complete RCA →" : "Next Step →"}
          showPrevious={rcaStep > 1}
          canProceed={analysisResponse.trim().length > 0}
          onSaveProgress={handleSaveProgress}
          onGenerateReport={handleGenerateReport}
          ticketData={ticketData}
          onStepClick={handleStepClick}
          problemStatementData={problemStatementData}
          isGeneratingProblemStatement={isGeneratingProblemStatement}
          setIsGeneratingProblemStatement={setIsGeneratingProblemStatement}
          hasAttemptedGeneration={hasAttemptedGeneration}
        />
      </div>
    </div>
  )
}

export default Analysis
