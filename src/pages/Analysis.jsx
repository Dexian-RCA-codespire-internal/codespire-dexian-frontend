import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Badge } from '../components/ui/badge'
import { RCAWorkflow } from '../components/RCA'
import { FiUpload, FiImage, FiUser, FiPlus, FiClock, FiMoreHorizontal, FiSearch, FiZap, FiTrendingUp, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi'
import { getTicketById } from '../utils/ticketData'
import ChatBot from '../components/ChatBot'
import { isChatbotEnabled } from '../config/navigation'

const Analysis = () => {
  const { ticketId } = useParams()
  const navigate = useNavigate()
  
  const [analysisNotes, setAnalysisNotes] = useState('')
  const [rootCause, setRootCause] = useState('')
  const [recommendations, setRecommendations] = useState('')
  const [ticketData, setTicketData] = useState(null)

  // RCA Workflow State
  const [rcaStep, setRcaStep] = useState(1)
  const [analysisResponse, setAnalysisResponse] = useState('')

  // Fetch ticket data when component mounts
  useEffect(() => {
    const ticket = getTicketById(ticketId)
    setTicketData(ticket)
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
    navigate(`/resolution/${ticketId}`)
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

  const similarCases = [
    { id: 'RCA-087', title: 'Payment timeout issues', match: 89 },
    { id: 'RCA-053', title: 'Database connection failures', match: 76 },
    { id: 'RCA-091', title: 'API response delays', match: 64 }
  ]

  // RCA Workflow Handlers
  const handleRcaNext = () => {
    if (rcaStep < 5) {
      setRcaStep(rcaStep + 1)
    } else {
      // Complete RCA and navigate to resolution
      navigate(`/resolution/${ticketId}`)
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
          aiSuggestions={getCurrentStepData().aiSuggestions}
          similarCases={similarCases}
          nextButtonText={rcaStep === 5 ? "Complete RCA →" : "Next Step →"}
          showPrevious={rcaStep > 1}
          canProceed={analysisResponse.trim().length > 0}
          onSaveProgress={handleSaveProgress}
          onGenerateReport={handleGenerateReport}
          ticketData={ticketData}
        />
      </div>

      {/* ChatBot - Only render if enabled in config */}
      {isChatbotEnabled() && (
        <ChatBot 
          pageContext={{
            pageName: 'Analysis',
            ticketData: ticketData,
          currentStep: rcaStep,
          totalSteps: 5
        }}
      />
      )}
    </div>
  )
}

export default Analysis
