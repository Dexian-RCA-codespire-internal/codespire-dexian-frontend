import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ticketService } from '../api'
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
  const [aiSuggestions, setAiSuggestions] = useState([])
  const [aiSuggestionsData, setAiSuggestionsData] = useState([]) // Store full suggestion objects
  const [aiSuggestionsLoading, setAiSuggestionsLoading] = useState(false)
  const [aiSuggestionsError, setAiSuggestionsError] = useState(null)
  
  const [analysisNotes, setAnalysisNotes] = useState('')
  const [rootCause, setRootCause] = useState('')
  const [recommendations, setRecommendations] = useState('')

  // RCA Workflow State
  const [rcaStep, setRcaStep] = useState(1)
  const [analysisResponse, setAnalysisResponse] = useState('')
  
  // Debug wrapper for setAnalysisResponse
  const debugSetAnalysisResponse = (value) => {
    console.log('setAnalysisResponse called with:', value);
    setAnalysisResponse(value);
  }
  
  // Step data tracking
  const [stepData, setStepData] = useState({
    rca_workflow_steps: ['', '', '', ''], // Array for 4 steps
    impact_level_step2: '',
    department_affected_step2: ''
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

  // Fetch AI suggestions based on similar cases
  const fetchAISuggestions = async (similarCasesData, currentTicket) => {
    try {
      setAiSuggestionsLoading(true)
      setAiSuggestionsError(null)
      console.log('Fetching AI suggestions for similar cases:', similarCasesData)
      
      if (similarCasesData && similarCasesData.results && similarCasesData.results.length > 0) {
        const response = await ticketService.getAISuggestions(similarCasesData.results, currentTicket)
        console.log('AI suggestions received:', response)
        
        // Extract suggestions from response - adjust based on actual API response structure
        const suggestions = response.suggestions || response.data?.suggestions || []
        console.log('Raw suggestions from API:', suggestions)
        
        // Convert suggestion objects to strings for display
        const suggestionStrings = suggestions.map(suggestion => {
          if (typeof suggestion === 'string') {
            return suggestion
          } else if (suggestion && typeof suggestion === 'object') {
            return suggestion.suggestion || suggestion.text || suggestion.description || JSON.stringify(suggestion)
          }
          return String(suggestion)
        })
        
        console.log('Processed suggestion strings:', suggestionStrings)
        setAiSuggestions(suggestionStrings)
        setAiSuggestionsData(suggestions) // Store full objects for future use
      }
    } catch (err) {
      console.error('Error fetching AI suggestions:', err)
      setAiSuggestionsError(err.message || 'Failed to fetch AI suggestions')
    } finally {
      setAiSuggestionsLoading(false)
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
              department_affected_step2: ticket.department_affected_step2 || ''
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
              department_affected_step2: ticket.department_affected_step2 || ''
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
        }
        
        // Start fetching similar cases and AI suggestions after ticket data is loaded
        if (ticket) {
          // Start both requests in parallel for better UX
          fetchSimilarCases(ticket).then(similarCasesData => {
            if (similarCasesData) {
              fetchAISuggestions(similarCasesData, ticket)
            }
          })
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
      aiSuggestions: [
        'Payment gateway timeouts during peak traffic',
        'User authentication failures after deployment',
        'Database connection pool exhaustion'
      ]
    },
    {
      step: 2,
      title: 'Impact Assessment',
      aiGuidance: 'What was the business and technical impact of this issue?',
      aiSuggestions: [
        '50% increase in failed transactions',
        'Customer support tickets increased by 200%',
        'Revenue loss of $15K during outage'
      ]
    },
    {
      step: 3,
      title: 'Root Cause Analysis',
      aiGuidance: 'Based on your investigation, what is the underlying root cause?',
      aiSuggestions: [
        'Inefficient database query causing resource contention',
        'Missing connection pool configuration limits',
        'Inadequate load balancing for traffic spikes'
      ]
    },
    {
      step: 4,
      title: 'Corrective Actions',
      aiGuidance: 'What specific actions will you take to prevent this issue from recurring?',
      aiSuggestions: [
        'Implement database query optimization and indexing',
        'Configure proper connection pool limits and monitoring',
        'Set up auto-scaling for traffic spikes'
      ]
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
        rca_workflow_steps: updatedSteps,
        impact_level_step2: stepData.impact_level_step2 || '',
        department_affected_step2: stepData.department_affected_step2 || '',
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
    
    // Allow navigation to any step
    setRcaStep(stepNumber)
    
    // Load existing step data if available
    const stepResponse = stepData.rca_workflow_steps[stepNumber - 1] || ''
    console.log('Loading response for step', stepNumber, ':', stepResponse);
    debugSetAnalysisResponse(stepResponse)
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
            aiSuggestions={[]}
            similarCases={null}
            aiSuggestionsLoading={false}
            similarCasesLoading={false}
            nextButtonText={rcaStep === 5 ? "Complete RCA →" : "Next Step →"}
            showPrevious={rcaStep > 1}
            canProceed={analysisResponse.trim().length > 0}
            onSaveProgress={handleSaveProgress}
            onGenerateReport={handleGenerateReport}
            ticketData={null}
            onStepClick={handleStepClick}
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
          aiSuggestions={aiSuggestions.length > 0 ? aiSuggestions : getCurrentStepData().aiSuggestions}
          similarCases={similarCases}
          aiSuggestionsLoading={aiSuggestionsLoading}
          similarCasesLoading={similarCasesLoading}
          nextButtonText={rcaStep === 4 ? "Complete RCA →" : "Next Step →"}
          showPrevious={rcaStep > 1}
          canProceed={analysisResponse.trim().length > 0}
          onSaveProgress={handleSaveProgress}
          onGenerateReport={handleGenerateReport}
          ticketData={ticketData}
          onStepClick={handleStepClick}
        />
      </div>
    </div>
  )
}

export default Analysis
