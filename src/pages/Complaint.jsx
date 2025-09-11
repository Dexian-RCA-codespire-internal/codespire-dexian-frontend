import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Badge } from '../components/ui/badge'
import { RCAWorkflow } from '../components/RCA'
import { FiUpload, FiImage, FiFileText, FiFile, FiZap, FiSearch } from 'react-icons/fi'

const Complaint = () => {
  const { ticketId } = useParams()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    typeOfComplaint: 'Payment Gateway Timeout Issues',
    category: 'E-commerce',
    priority: 'Critical',
    source: 'Jira',
    complaintDetails: 'The payment gateway is experiencing intermittent timeout issues, causing transactions to fail.',
    comments: ''
  })

  // RCA Workflow State
  const [rcaStep, setRcaStep] = useState(1)
  const [problemDefinition, setProblemDefinition] = useState('')

  const [uploadedFiles, setUploadedFiles] = useState([
    { name: 'error_screenshot.png', type: 'image' },
    { name: 'gateway_log.txt', type: 'text' },
    { name: 'repot.pdf', type: 'pdf' }
  ])

  const aiSuggestions = [
    'Payment gateway timeouts during peak traffic',
    'User authentication failures after deployment',
    'Database connection pool exhaustion'
  ]

  const similarCases = [
    { id: 'RCA-087', title: 'Payment timeout issues', match: 89 },
    { id: 'RCA-053', title: 'Database connection failures', match: 76 },
    { id: 'RCA-091', title: 'API response delays', match: 64 }
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


  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files)
    const newFiles = files.map(file => ({
      name: file.name,
      type: file.type.split('/')[0]
    }))
    setUploadedFiles(prev => [...prev, ...newFiles])
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

  const handleInvestigation = () => {
    // Navigate to investigation page
    navigate(`/investigation/${ticketId}`)
  }

  // RCA Workflow Handlers
  const handleRcaNext = () => {
    if (rcaStep < 5) {
      setRcaStep(rcaStep + 1)
    } else {
      // Complete RCA and navigate to investigation
      navigate(`/investigation/${ticketId}`)
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

  const handleAIResolve = (caseId) => {
    // AI resolve functionality for high match cases
    console.log(`AI resolving case ${caseId} with 95% match`)
    // Here you would typically call an API to auto-resolve the case
    // For now, we'll show a success message or navigate to resolution
    alert(`AI has automatically resolved case ${caseId} based on 95% match with previous similar case.`)
    // Navigate to resolution page with AI resolution
    navigate(`/resolution/${ticketId}?ai-resolved=true&similar-case=${caseId}`)
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
          response={problemDefinition}
          onResponseChange={setProblemDefinition}
          onNext={handleRcaNext}
          onPrevious={handleRcaPrevious}
          aiSuggestions={getCurrentStepData().aiSuggestions}
          similarCases={similarCases}
          nextButtonText={rcaStep === 5 ? "Complete RCA →" : "Next Step →"}
          showPrevious={rcaStep > 1}
          canProceed={problemDefinition.trim().length > 0}
          onSaveProgress={handleSaveProgress}
          onGenerateReport={handleGenerateReport}
        />
      </div>
    </div>
  )
}

export default Complaint
