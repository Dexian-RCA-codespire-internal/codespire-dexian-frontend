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
  
  // Step data tracking
  const [stepData, setStepData] = useState({
    problem_step1: '',
    timeline_step2: '',
    impact_step3: '',
    findings_step4: '',
    root_cause_step5: ''
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
          const existingStepData = {
            problem_step1: ticket.problem_step1 || '',
            timeline_step2: ticket.timeline_step2 || '',
            impact_step3: ticket.impact_step3 || '',
            findings_step4: ticket.findings_step4 || '',
            root_cause_step5: ticket.root_cause_step5 || ''
          }
          setStepData(existingStepData)
          
          // Find and navigate to first incomplete step
          const firstIncompleteStep = findFirstIncompleteStepWithData(existingStepData)
          setRcaStep(firstIncompleteStep)
          
          // Load the response for the current step
          const stepKey = `${firstIncompleteStep === 1 ? 'problem' : 
                           firstIncompleteStep === 2 ? 'timeline' : 
                           firstIncompleteStep === 3 ? 'impact' : 
                           firstIncompleteStep === 4 ? 'findings' : 'root_cause'}_step${firstIncompleteStep}`
          setAnalysisResponse(existingStepData[stepKey] || '')
        }
        
        // Fetch similar cases after ticket data is loaded
        if (ticket) {
          const similarCasesData = await fetchSimilarCases(ticket)
          // Fetch AI suggestions after similar cases are loaded
          if (similarCasesData) {
            await fetchAISuggestions(similarCasesData, ticket)
          }
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
      title: 'Timeline & Context',
      aiGuidance: 'When did this issue first occur? What events preceded it?',
      aiSuggestions: [
        'Started after recent deployment at 2:30 PM',
        'Coincided with traffic spike during marketing campaign',
        'Followed database maintenance window'
      ]
    },
    {
      step: 3,
      title: 'Impact Assessment',
      aiGuidance: 'What was the business and technical impact of this issue?',
      aiSuggestions: [
        '50% increase in failed transactions',
        'Customer support tickets increased by 200%',
        'Revenue loss of $15K during outage'
      ]
    },
    {
      step: 4,
      title: 'Investigation Findings',
      aiGuidance: 'What data have you gathered? What patterns or clues were discovered?',
      aiSuggestions: [
        'Database CPU spiked to 95% during incident',
        'Error logs show connection timeout exceptions',
        'Monitoring alerts triggered for response time SLA'
      ]
    },
    {
      step: 5,
      title: 'Root Cause Analysis',
      aiGuidance: 'Based on your investigation, what is the underlying root cause?',
      aiSuggestions: [
        'Inefficient database query causing resource contention',
        'Missing connection pool configuration limits',
        'Inadequate load balancing for traffic spikes'
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

      // Update step data with current response
      const updatedStepData = {
        ...stepData,
        [`${rcaStep === 1 ? 'problem' : 
           rcaStep === 2 ? 'timeline' : 
           rcaStep === 3 ? 'impact' : 
           rcaStep === 4 ? 'findings' : 'root_cause'}_step${rcaStep}`]: analysisResponse,
        status: rcaStep === 5 ? 'Resolved' : 'In Progress'
      }

      // Call API to update ticket with step data
      await ticketService.updateTicketSteps({
        ticketId: ticketData._id,
        stepData: updatedStepData
      })

      // Update local step data state
      setStepData(updatedStepData)

      if (rcaStep < 5) {
        // Move to next step
        setRcaStep(rcaStep + 1)
        // Clear response for next step
        setAnalysisResponse('')
      } else {
        // Complete RCA - check if all previous steps are complete
        if (!areAllPreviousStepsComplete()) {
          // Show alert about incomplete steps
          const incompleteSteps = []
          if (!stepData.problem_step1 || stepData.problem_step1.trim().length === 0) {
            incompleteSteps.push('Problem Definition (Step 1)')
          }
          if (!stepData.timeline_step2 || stepData.timeline_step2.trim().length === 0) {
            incompleteSteps.push('Timeline & Context (Step 2)')
          }
          if (!stepData.impact_step3 || stepData.impact_step3.trim().length === 0) {
            incompleteSteps.push('Impact Assessment (Step 3)')
          }
          if (!stepData.findings_step4 || stepData.findings_step4.trim().length === 0) {
            incompleteSteps.push('Investigation Findings (Step 4)')
          }
          
          alert(`Cannot complete RCA. The following steps are not completed:\n\n${incompleteSteps.join('\n')}\n\nPlease complete these steps first.`)
          return
        }
        
        // All steps complete - call the resolve API
        const resolveResponse = await ticketService.resolveTicket({
          rootCause: analysisResponse,
          ticket: ticketData
        })
        
        console.log('Ticket resolved successfully:', resolveResponse)
        
        // Show success message and navigate
        alert('RCA completed successfully! Ticket has been resolved.')
        navigate('/rca-dashboard')
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
      const stepKey = `${previousStep === 1 ? 'problem' : 
                       previousStep === 2 ? 'timeline' : 
                       previousStep === 3 ? 'impact' : 
                       previousStep === 4 ? 'findings' : 'root_cause'}_step${previousStep}`
      
      if (stepData[stepKey]) {
        setAnalysisResponse(stepData[stepKey])
      } else {
        setAnalysisResponse('')
      }
    }
  }

  const getCurrentStepData = () => {
    return rcaSteps.find(step => step.step === rcaStep) || rcaSteps[0]
  }

  // Check if all previous steps have data
  const areAllPreviousStepsComplete = () => {
    if (rcaStep < 5) return true // Not on final step yet
    
    // Check if steps 1-4 have data
    const requiredSteps = ['problem_step1', 'timeline_step2', 'impact_step3', 'findings_step4']
    return requiredSteps.every(stepKey => stepData[stepKey] && stepData[stepKey].trim().length > 0)
  }

  // Find the first incomplete step
  const findFirstIncompleteStep = () => {
    const steps = [
      { step: 1, key: 'problem_step1', name: 'Problem Definition' },
      { step: 2, key: 'timeline_step2', name: 'Timeline & Context' },
      { step: 3, key: 'impact_step3', name: 'Impact Assessment' },
      { step: 4, key: 'findings_step4', name: 'Investigation Findings' },
      { step: 5, key: 'root_cause_step5', name: 'Root Cause Analysis' }
    ]
    
    for (const stepInfo of steps) {
      if (!stepData[stepInfo.key] || stepData[stepInfo.key].trim().length === 0) {
        return stepInfo.step
      }
    }
    
    // If all steps are complete, return step 5
    return 5
  }

  // Find the first incomplete step with provided data
  const findFirstIncompleteStepWithData = (stepDataToCheck) => {
    const steps = [
      { step: 1, key: 'problem_step1', name: 'Problem Definition' },
      { step: 2, key: 'timeline_step2', name: 'Timeline & Context' },
      { step: 3, key: 'impact_step3', name: 'Impact Assessment' },
      { step: 4, key: 'findings_step4', name: 'Investigation Findings' },
      { step: 5, key: 'root_cause_step5', name: 'Root Cause Analysis' }
    ]
    
    for (const stepInfo of steps) {
      if (!stepDataToCheck[stepInfo.key] || stepDataToCheck[stepInfo.key].trim().length === 0) {
        return stepInfo.step
      }
    }
    
    // If all steps are complete, return step 5
    return 5
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
    // Allow navigation to any step
    setRcaStep(stepNumber)
    
    // Load existing step data if available
    const stepKey = `${stepNumber === 1 ? 'problem' : 
                     stepNumber === 2 ? 'timeline' : 
                     stepNumber === 3 ? 'impact' : 
                     stepNumber === 4 ? 'findings' : 'root_cause'}_step${stepNumber}`
    
    if (stepData[stepKey]) {
      setAnalysisResponse(stepData[stepKey])
    } else {
      setAnalysisResponse('')
    }
  }

  // Show loading state with skeleton loaders instead of full page spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          

          {/* RCA Workflow with skeleton loaders */}
          <RCAWorkflow
            currentStep={rcaStep}
            totalSteps={5}
            stepTitle={getCurrentStepData().title}
            aiGuidance={getCurrentStepData().aiGuidance}
            response={analysisResponse}
            onResponseChange={setAnalysisResponse}
            onNext={handleRcaNext}
            onPrevious={handleRcaPrevious}
            aiSuggestions={[]}
            similarCases={null}
            aiSuggestionsLoading={true}
            similarCasesLoading={true}
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
          totalSteps={5}
          stepTitle={getCurrentStepData().title}
          aiGuidance={getCurrentStepData().aiGuidance}
          response={analysisResponse}
          onResponseChange={setAnalysisResponse}
          onNext={handleRcaNext}
          onPrevious={handleRcaPrevious}
          aiSuggestions={aiSuggestions.length > 0 ? aiSuggestions : getCurrentStepData().aiSuggestions}
          similarCases={similarCases}
          aiSuggestionsLoading={aiSuggestionsLoading}
          similarCasesLoading={similarCasesLoading}
          nextButtonText={rcaStep === 5 ? "Complete RCA →" : "Next Step →"}
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
