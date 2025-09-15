import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ticketService } from '../api'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Badge } from '../components/ui/badge'
import { RCAWorkflow } from '../components/RCA'
import { FiUpload, FiImage, FiUser, FiPlus, FiClock, FiMoreHorizontal, FiSearch, FiZap, FiTrendingUp, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi'

const Analysis = () => {
  const { ticketId } = useParams()
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
        console.log('Fetching ticket data for ID:', ticketId)
        
        const response = await ticketService.getTicketById(ticketId)
        console.log('Ticket data received:', response)
        
        const ticket = response.data || response
        setTicketData(ticket)
        
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

    if (ticketId) {
      fetchTicketData()
    }
  }, [ticketId])



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
  const handleRcaNext = () => {
    if (rcaStep < 5) {
      setRcaStep(rcaStep + 1)
    } else {
      // Complete RCA - keep user on analysis page
      console.log('RCA completed for ticket:', ticketId)
      // You can add success message or update UI state here
    }
  }

  const handleRcaPrevious = () => {
    if (rcaStep > 1) {
      setRcaStep(rcaStep - 1)
    }
  }

  const getCurrentStepData = () => {
    return rcaSteps.find(step => step.step === rcaStep) || rcaSteps[0]
  }

  const handleSaveProgress = () => {
    console.log('Saving progress...')
    // Implement save functionality
  }

  const handleGenerateReport = () => {
    console.log('Generating report...')
    // Implement report generation
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ticket data...</p>
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
        
        {/* Ticket Information Header */}
        {ticketData && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Analysis: {ticketData.short_description || 'No Title'}
            </h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <span><strong>Ticket ID:</strong> {ticketData.ticket_id}</span>
              <span><strong>Source:</strong> {ticketData.source}</span>
              <span><strong>Status:</strong> {ticketData.status}</span>
              <span><strong>Priority:</strong> {ticketData.priority}</span>
              <span><strong>Category:</strong> {ticketData.category}</span>
            </div>
          </div>
        )}


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
          nextButtonText={rcaStep === 5 ? "Complete RCA →" : "Next Step →"}
          showPrevious={rcaStep > 1}
          canProceed={analysisResponse.trim().length > 0}
          onSaveProgress={handleSaveProgress}
          onGenerateReport={handleGenerateReport}
        />
      </div>
    </div>
  )
}

export default Analysis
