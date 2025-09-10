import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Badge } from '../components/ui/badge'
import { Checkbox } from '../components/ui/checkbox'
import { FiUpload, FiImage, FiFileText, FiFile, FiUser, FiPlus, FiClock, FiMoreHorizontal, FiSearch, FiCheckCircle, FiX, FiExternalLink, FiDownload } from 'react-icons/fi'

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Tracker */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate(`/complaint/${ticketId}`)}>
              <div className="flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full text-sm font-semibold">
                1
              </div>
              <span className="ml-2 text-sm font-medium text-green-600">Complaint</span>
            </div>
            <div className="w-16 h-0.5 bg-green-600"></div>
            <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate(`/investigation/${ticketId}`)}>
              <div className="flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full text-sm font-semibold">
                2
              </div>
              <span className="ml-2 text-sm font-medium text-green-600">Investigation</span>
            </div>
            <div className="w-16 h-0.5 bg-green-600"></div>
            <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate(`/analysis/${ticketId}`)}>
              <div className="flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full text-sm font-semibold">
                3
              </div>
              <span className="ml-2 text-sm font-medium text-green-600">Analysis</span>
            </div>
            <div className="w-16 h-0.5 bg-green-600"></div>
            <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate(`/resolution/${ticketId}`)}>
              <div className="flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full text-sm font-semibold">
                4
              </div>
              <span className="ml-2 text-sm font-medium text-green-600">Resolution</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Resolution Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Issue Header */}
            <Card className="bg-white shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      Resolution Summary
                    </h1>
                    <p className="text-lg text-gray-600 mb-4">
                      {ticketId} – Payment Gateway Timeout Issues
                    </p>
                    
                    <div className="flex items-center space-x-3 mb-4">
                      <Badge className="bg-green-600 text-white border-0 font-medium">
                        Resolved
                      </Badge>
                      <Badge className="bg-blue-100 text-blue-800 border-0 font-medium">
                        Resolution Phase
                      </Badge>
                      <div className="flex items-center text-sm text-gray-600">
                        <FiClock className="w-4 h-4 mr-1" />
                        Completed: 2 hours ago
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
                    <FiMoreHorizontal className="w-5 h-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Resolution Summary */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Resolution Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How was the issue fixed?
                  </label>
                  <Textarea
                    value={resolutionSummary}
                    onChange={(e) => setResolutionSummary(e.target.value)}
                    placeholder="Updated load balancer configuration and restarted the payment gateway service to resolve timeout errors."
                    rows={4}
                    className="w-full"
                  />
                  {!resolutionSummary.trim() && (
                    <div className="mt-2 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md p-2">
                      <strong>Note:</strong> Please enter how the issue was fixed before closing the RCA case.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Steps Taken */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Steps Taken</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stepsTaken.map((step) => (
                    <div key={step.id} className="flex items-center space-x-3">
                      <Checkbox
                        checked={step.completed}
                        onChange={() => handleStepToggle(step.id)}
                        className="flex-shrink-0"
                      />
                      <span className={`text-sm ${step.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {step.text}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Final Attachments */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Final Attachments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Uploaded Files */}
                {finalAttachments.length > 0 && (
                  <div className="space-y-2">
                    {finalAttachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-3">
                          {getFileIcon(file.type)}
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500">{file.size}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                            <FiDownload className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <FiX className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <FiUpload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Drag and drop files here, or{' '}
                    <button 
                      className="text-blue-600 hover:text-blue-700 underline"
                      onClick={() => document.getElementById('final-upload').click()}
                    >
                      Upload
                    </button>
                  </p>
                  <input
                    id="final-upload"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - QA Verification & Approval */}
          <div className="lg:col-span-1 space-y-6">
            {/* QA Verification */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">QA Verification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={qaVerified}
                    onChange={(e) => setQaVerified(e.target.checked)}
                  />
                  <span className="text-sm font-medium text-gray-900">Verified by QA</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={managerApproved}
                    onChange={(e) => setManagerApproved(e.target.checked)}
                  />
                  <span className="text-sm font-medium text-gray-900">Manager Approval</span>
                </div>
              </CardContent>
            </Card>

            {/* Comments Section */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Closing Comments</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Final Notes
                  </label>
                  <Textarea
                    value={closingComments}
                    onChange={(e) => setClosingComments(e.target.value)}
                    placeholder="Add closing remarks or final notes..."
                    rows={4}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Linked External Tickets */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                  <FiExternalLink className="w-5 h-5 mr-2 text-blue-500" />
                  Linked Tickets
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {linkedTickets.map((ticket, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{ticket.id}</p>
                        <p className="text-sm text-gray-600 mt-1">{ticket.platform}</p>
                      </div>
                      <Badge className={`ml-2 ${
                        ticket.status === 'Resolved' || ticket.status === 'Completed' || ticket.status === 'Closed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {ticket.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Section - Action Buttons */}
        <div className="mt-8 flex items-center justify-center space-x-4">
            <Button 
              variant="outline" 
              className="flex items-center"
              onClick={handleReopenInvestigation}
            >
              <FiX className="w-4 h-4 mr-2" />
              Reopen Investigation
            </Button>
            
            <Button variant="outline" className="flex items-center">
              <FiUser className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            
            <Button 
              className={`flex items-center ${
                canCloseCase() 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              onClick={handleCloseCase}
              disabled={!canCloseCase()}
            >
              <FiCheckCircle className="w-4 h-4 mr-2" />
              Close RCA Case
            </Button>
        </div>
      </div>
    </div>
  )
}

export default Resolution
