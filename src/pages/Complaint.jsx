import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/Input'
import { Textarea } from '../components/ui/textarea'
import { Badge } from '../components/ui/badge'
import { Skeleton } from '../components/ui/skeleton'
import { ticketService } from '../api'
import { FiArrowLeft, FiEdit, FiSave, FiX, FiClock, FiUser, FiTag, FiAlertTriangle, FiCheckCircle, FiFileText } from 'react-icons/fi'

const Complaint = () => {
  const { ticketId } = useParams()
  const navigate = useNavigate()
  
  // Ticket data state
  const [ticketData, setTicketData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form data state
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
    },
    {
      step: 2,
      title: 'Timeline & Context',
      aiGuidance: 'When did this issue first occur? What events preceded it?'
    },
    {
      step: 3,
      title: 'Impact Assessment',
      aiGuidance: 'What was the business and technical impact of this issue?'
    },
    {
      step: 4,
      title: 'Investigation Findings',
      aiGuidance: 'What data have you gathered? What patterns or clues were discovered?'
    },
    {
      step: 5,
      title: 'Root Cause Analysis',
      aiGuidance: 'Based on your investigation, what is the underlying root cause?'
    }
  ]


  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }


  const handleSave = async () => {
    try {
      setSaving(true)
      // Call API to update ticket
      await ticketService.updateTicket({ ticketId, ticketData: formData })
      
      // Update local ticket data
      setTicketData({ ...ticketData, ...formData })
      setIsEditing(false)
    } catch (err) {
      console.error('Error saving ticket:', err)
      alert(`Error saving ticket: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    // Reset form data to original ticket data
    if (ticketData) {
      setFormData({
        ticket_id: ticketData.ticket_id || '',
        source: ticketData.source || '',
        short_description: ticketData.short_description || '',
        description: ticketData.description || '',
        category: ticketData.category || '',
        subcategory: ticketData.subcategory || '',
        urgency: ticketData.urgency || '',
        opened_time: ticketData.opened_time ? new Date(ticketData.opened_time).toISOString().slice(0, 16) : '',
        // RCA Step Data
        problem_step1: ticketData.problem_step1 || '',
        timeline_step2: ticketData.timeline_step2 || '',
        impact_step3: ticketData.impact_step3 || '',
        findings_step4: ticketData.findings_step4 || '',
        root_cause_step5: ticketData.root_cause_step5 || ''
      })
    }
    setIsEditing(false)
  }

  const handleResolve = () => {
    // Navigate to analysis page with ticket ID and ticket_id
    if (ticketData?.ticket_id) {
      navigate(`/analysis/${ticketId}/${ticketData.ticket_id}`)
    } else {
      console.error('Ticket data not available for navigation')
    }
  }


  // Calculate RCA progress
  const calculateRCAProgress = () => {
    const rcaSteps = [
      'problem_step1',
      'timeline_step2', 
      'impact_step3',
      'findings_step4',
      'root_cause_step5'
    ]
    
    const completedSteps = rcaSteps.filter(stepKey => {
      const stepValue = formData[stepKey]
      return stepValue && stepValue.trim().length > 0
    }).length
    
    const progressPercentage = Math.round((completedSteps / rcaSteps.length) * 100)
    
    return {
      percentage: progressPercentage,
      completedSteps,
      totalSteps: rcaSteps.length
    }
  }


  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-64" />
            </div>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-black mb-4">
            <FiAlertTriangle className="w-12 h-12 mx-auto mb-2" />
            <p className="text-lg font-semibold">Error Loading Ticket</p>
            <p className="text-sm text-black">{error}</p>
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
          response={problemDefinition}
          onResponseChange={setProblemDefinition}
          onNext={handleRcaNext}
          onPrevious={handleRcaPrevious}
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
