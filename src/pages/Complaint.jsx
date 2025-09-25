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
    ticket_id: '',
    source: '',
    short_description: '',
    description: '',
    category: '',
    subcategory: '',
    urgency: '',
    opened_time: '',
    // RCA Step Data
    problem_step1: '',
    timeline_step2: '',
    impact_step3: '',
    findings_step4: '',
    root_cause_step5: ''
  })

  // Fetch ticket data when component loads
  useEffect(() => {
    const fetchTicketData = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await ticketService.getTicketById(ticketId)
        
        // Handle different response structures
        let ticket
        if (response.success && response.data) {
          ticket = response.data
        } else if (response.data) {
          ticket = response.data
        } else {
          ticket = response
        }
        
        setTicketData(ticket)
        
        // Populate form data
        if (ticket) {
          const formDataToSet = {
            ticket_id: ticket.ticket_id || '',
            source: ticket.source || '',
            short_description: ticket.short_description || '',
            description: ticket.description || '',
            category: ticket.category || '',
            subcategory: ticket.subcategory || '',
            urgency: ticket.urgency || '',
            opened_time: ticket.opened_time ? new Date(ticket.opened_time).toISOString().slice(0, 16) : '',
            // RCA Step Data
            problem_step1: ticket.problem_step1 || '',
            timeline_step2: ticket.timeline_step2 || '',
            impact_step3: ticket.impact_step3 || '',
            findings_step4: ticket.findings_step4 || '',
            root_cause_step5: ticket.root_cause_step5 || ''
          }
          
          setFormData(formDataToSet)
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/rca-dashboard')}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
            >
              <FiArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-black">Ticket Details</h1>
              <p className="text-black">View and manage ticket information</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2"
                >
                  <FiEdit className="w-4 h-4" />
                  Edit
                </Button>
                <Button
                  onClick={handleResolve}
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                >
                  <FiCheckCircle className="w-4 h-4" />
                  Resolve
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="flex items-center gap-2"
                >
                  <FiX className="w-4 h-4" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                >
                  <FiSave className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              </>
            )}
          </div>
        </div>


        {/* Single Page: Ticket Details with RCA Progress */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black">
              <FiFileText className="w-5 h-5" />
              Ticket Details & RCA Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Ticket Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Ticket ID
                </label>
                <Input
                  value={formData.ticket_id}
                  onChange={(e) => handleInputChange('ticket_id', e.target.value)}
                  disabled={!isEditing}
                  className="bg-gray-50 text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Source
                </label>
                <Input
                  value={formData.source}
                  onChange={(e) => handleInputChange('source', e.target.value)}
                  disabled={!isEditing}
                  className="bg-gray-50 text-black"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Short Description
              </label>
              <Input
                value={formData.short_description}
                onChange={(e) => handleInputChange('short_description', e.target.value)}
                disabled={!isEditing}
                className="bg-gray-50 text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                disabled={!isEditing}
                rows={4}
                className="bg-gray-50 text-black"
              />
            </div>

            {/* Category and Classification */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Category
                </label>
                <Input
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  disabled={!isEditing}
                  className="bg-gray-50 text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Subcategory
                </label>
                <Input
                  value={formData.subcategory}
                  onChange={(e) => handleInputChange('subcategory', e.target.value)}
                  disabled={!isEditing}
                  className="bg-gray-50 text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Urgency
                </label>
                <Input
                  value={formData.urgency}
                  onChange={(e) => handleInputChange('urgency', e.target.value)}
                  disabled={!isEditing}
                  className="bg-gray-50 text-black"
                />
              </div>
            </div>

            {/* Timestamp */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                <FiClock className="w-4 h-4 inline mr-1" />
                Opened Time
              </label>
              <Input
                type="datetime-local"
                value={formData.opened_time}
                onChange={(e) => handleInputChange('opened_time', e.target.value)}
                disabled={!isEditing}
                className="bg-gray-50 text-black"
              />
            </div>

            {/* RCA Steps Status */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-black">RCA Analysis Steps</h4>
              </div>
            </div>

            {/* RCA Steps - Only show steps that have data */}
            <div className="space-y-4">
              
              {/* Step 1: Problem Definition - Only show if has data */}
              {formData.problem_step1 && formData.problem_step1.trim().length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Step 1: Problem Definition
                  </label>
                  <Textarea
                    value={formData.problem_step1}
                    onChange={(e) => handleInputChange('problem_step1', e.target.value)}
                    disabled={!isEditing}
                    rows={3}
                    placeholder="Describe the problem that occurred..."
                    className="bg-gray-50 text-black"
                  />
                </div>
              )}

              {/* Step 2: Timeline & Context - Only show if has data */}
              {formData.timeline_step2 && formData.timeline_step2.trim().length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Step 2: Timeline & Context
                  </label>
                  <Textarea
                    value={formData.timeline_step2}
                    onChange={(e) => handleInputChange('timeline_step2', e.target.value)}
                    disabled={!isEditing}
                    rows={3}
                    placeholder="When did this issue occur? What events preceded it?"
                    className="bg-gray-50 text-black"
                  />
                </div>
              )}

              {/* Step 3: Impact Assessment - Only show if has data */}
              {formData.impact_step3 && formData.impact_step3.trim().length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Step 3: Impact Assessment
                  </label>
                  <Textarea
                    value={formData.impact_step3}
                    onChange={(e) => handleInputChange('impact_step3', e.target.value)}
                    disabled={!isEditing}
                    rows={3}
                    placeholder="What was the impact on users, systems, or business?"
                    className="bg-gray-50 text-black"
                  />
                </div>
              )}

              {/* Step 4: Investigation Findings - Only show if has data */}
              {formData.findings_step4 && formData.findings_step4.trim().length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Step 4: Investigation Findings
                  </label>
                  <Textarea
                    value={formData.findings_step4}
                    onChange={(e) => handleInputChange('findings_step4', e.target.value)}
                    disabled={!isEditing}
                    rows={3}
                    placeholder="What did the investigation reveal? Any error logs or evidence?"
                    className="bg-gray-50 text-black"
                  />
                </div>
              )}

              {/* Step 5: Root Cause Analysis - Only show if has data */}
              {formData.root_cause_step5 && formData.root_cause_step5.trim().length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Step 5: Root Cause Analysis
                  </label>
                  <Textarea
                    value={formData.root_cause_step5}
                    onChange={(e) => handleInputChange('root_cause_step5', e.target.value)}
                    disabled={!isEditing}
                    rows={3}
                    placeholder="What is the root cause of this issue?"
                    className="bg-gray-50 text-black"
                  />
                </div>
              )}

              {/* Show message if no steps have data */}
              {calculateRCAProgress().completedSteps === 0 && (
                <div className="text-center py-8 text-black">
                  <p>No RCA analysis steps have been completed yet.</p>
                  <p className="text-sm mt-1">Click "Resolve" to start the RCA process.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Complaint
