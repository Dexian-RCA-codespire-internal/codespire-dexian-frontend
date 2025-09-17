import React, { useState, useEffect } from 'react'
// Investigation page with chat interface
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { RCAWorkflow } from '../components/RCA'
import { FiUpload, FiImage, FiFileText, FiFile, FiUser, FiPlus, FiClock, FiMoreHorizontal, FiSearch, FiBarChart, FiPaperclip, FiSend } from 'react-icons/fi'
import { getTicketById } from '../utils/ticketData'

const Investigation = () => {
  const { ticketId } = useParams()
  const navigate = useNavigate()
  const [comment, setComment] = useState('')
  const [chatMessage, setChatMessage] = useState('')
  const [ticketData, setTicketData] = useState(null)

  // RCA Workflow State
  const [rcaStep, setRcaStep] = useState(1)
  const [investigationResponse, setInvestigationResponse] = useState('')

  // Fetch ticket data when component mounts
  useEffect(() => {
    const ticket = getTicketById(ticketId)
    setTicketData(ticket)
  }, [ticketId])

  // Validation function to check if notes are entered
  const canNavigateToAnalysis = () => {
    return comment.trim().length > 0
  }

  // Handle navigation to analysis with validation
  const handleAnalysisNavigation = () => {
    if (canNavigateToAnalysis()) {
      navigate(`/analysis/${ticketId}`)
    }
  }

  const attachments = [
    { name: 'chart_data.xlsx', type: 'chart', icon: <FiBarChart className="w-6 h-6 text-blue-600" /> },
    { name: 'error_log.txt', type: 'text', icon: <FiFileText className="w-6 h-6 text-gray-600" /> },
    { name: 'report.pdf', type: 'pdf', icon: <FiFile className="w-6 h-6 text-red-600" /> },
    { name: 'error_log.pdf', type: 'pdf', icon: <FiFile className="w-6 h-6 text-red-600" /> }
  ]

  const chatMessages = [
    {
      id: 1,
      user: 'Sarah Chen',
      message: 'I have found the cause of the problem.',
      timestamp: '2 hours ago'
    }
  ]

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
      // Complete RCA and navigate to Complete RCA page
      navigate(`/complete-rca/${ticketId}`)
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
          response={investigationResponse}
          onResponseChange={setInvestigationResponse}
          onNext={handleRcaNext}
          onPrevious={handleRcaPrevious}
          aiSuggestions={getCurrentStepData().aiSuggestions}
          similarCases={similarCases}
          nextButtonText={rcaStep === 5 ? "Complete RCA →" : "Next Step →"}
          showPrevious={rcaStep > 1}
          canProceed={investigationResponse.trim().length > 0}
          onSaveProgress={handleSaveProgress}
          onGenerateReport={handleGenerateReport}
          ticketData={ticketData}
        />
      </div>

    </div>
  )
}

export default Investigation
