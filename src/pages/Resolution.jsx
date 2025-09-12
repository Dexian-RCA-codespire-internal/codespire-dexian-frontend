import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Badge } from '../components/ui/badge'
import { Checkbox } from '../components/ui/checkbox'
import { RCAWorkflow } from '../components/RCA'
import { FiUpload, FiImage, FiFileText, FiFile, FiUser, FiPlus, FiClock, FiMoreHorizontal, FiSearch, FiCheckCircle, FiX, FiExternalLink, FiDownload } from 'react-icons/fi'
import { getTicketById } from '../utils/ticketData'
import ChatBot from '../components/ChatBot'
import { isChatbotEnabled } from '../config/navigation'

const Resolution = () => {
  const { ticketId } = useParams()
  const navigate = useNavigate()
  
  const [resolutionSummary, setResolutionSummary] = useState('')
  const [stepsTaken, setStepsTaken] = useState([
    { id: 1, text: 'Adjusted throttling rules in gateway', completed: false },
    { id: 2, text: 'Cleared service cache', completed: false },
    { id: 3, text: 'Performed QA testing', completed: false }
  ])
  const [finalAttachments, setFinalAttachments] = useState([
    { name: 'resolution_logs.txt', type: 'text', size: '2.3 MB' },
    { name: 'screenshot_fix.png', type: 'image', size: '1.1 MB' },
    { name: 'qa_report.pdf', type: 'pdf', size: '856 KB' }
  ])
  const [qaVerified, setQaVerified] = useState(false)
  const [managerApproved, setManagerApproved] = useState(false)
  const [closingComments, setClosingComments] = useState('')
  const [linkedTickets, setLinkedTickets] = useState([
    { id: 'JIRA-1234', platform: 'Jira', status: 'Resolved' },
    { id: 'ZEN-5678', platform: 'Zendesk', status: 'Closed' },
    { id: 'SN-9012', platform: 'ServiceNow', status: 'Completed' }
  ])
  const [ticketData, setTicketData] = useState(null)

  // RCA Workflow State
  const [rcaStep, setRcaStep] = useState(1)
  const [resolutionResponse, setResolutionResponse] = useState('')

  // Fetch ticket data when component mounts
  useEffect(() => {
    const ticket = getTicketById(ticketId)
    setTicketData(ticket)
  }, [ticketId])

  const handleStepToggle = (stepId) => {
    setStepsTaken(prev => prev.map(step => 
      step.id === stepId ? { ...step, completed: !step.completed } : step
    ))
  }

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files)
    const newFiles = files.map(file => ({
      name: file.name,
      type: file.type.split('/')[0],
      size: (file.size / 1024 / 1024).toFixed(1) + ' MB'
    }))
    setFinalAttachments(prev => [...prev, ...newFiles])
  }

  const getFileIcon = (type) => {
    switch (type) {
      case 'image':
        return <FiImage className="w-4 h-4 text-blue-600" />
      case 'text':
        return <FiFileText className="w-4 h-4 text-green-600" />
      case 'pdf':
        return <FiFile className="w-4 h-4 text-red-600" />
      default:
        return <FiFile className="w-4 h-4 text-gray-600" />
    }
  }

  // Validation function to check if resolution summary is entered
  const canCloseCase = () => {
    return resolutionSummary.trim().length > 0
  }

  const handleCloseCase = () => {
    if (canCloseCase()) {
      // Navigate back to dashboard or show success message
      navigate('/rca-dashboard')
    }
  }

  const handleReopenInvestigation = () => {
    navigate(`/investigation/${ticketId}`)
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
      // Complete RCA and close case
      navigate('/rca-dashboard')
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
          response={resolutionResponse}
          onResponseChange={setResolutionResponse}
          onNext={handleRcaNext}
          onPrevious={handleRcaPrevious}
          aiSuggestions={getCurrentStepData().aiSuggestions}
          similarCases={similarCases}
          nextButtonText={rcaStep === 5 ? "Complete RCA →" : "Next Step →"}
          showPrevious={rcaStep > 1}
          canProceed={resolutionResponse.trim().length > 0}
          onSaveProgress={handleSaveProgress}
          onGenerateReport={handleGenerateReport}
          ticketData={ticketData}
        />
      </div>

      {/* ChatBot - Only render if enabled in config */}
      {isChatbotEnabled() && (
        <ChatBot 
          pageContext={{
            pageName: 'Resolution',
            ticketData: ticketData,
          currentStep: rcaStep,
          totalSteps: 5
        }}
      />
      )}
    </div>
  )
}

export default Resolution
