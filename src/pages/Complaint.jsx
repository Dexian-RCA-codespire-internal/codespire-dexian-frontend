import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Badge } from '../components/ui/badge'
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
    { id: 'RCA-087', title: 'Payment timeout issues', match: 95 },
    { id: 'RCA-053', title: 'Database connection failures', match: 76 },
    { id: 'RCA-091', title: 'API response delays', match: 64 }
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
        {/* Progress Tracker */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full text-sm font-semibold">
                1
              </div>
              <span className="ml-2 text-sm font-medium text-green-600">Complaint</span>
            </div>
            <div className="w-16 h-0.5 bg-green-600"></div>
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full text-sm font-semibold">
                2
              </div>
              <span className="ml-2 text-sm font-medium text-green-600">Investigation</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 bg-gray-300 text-gray-600 rounded-full text-sm font-semibold">
                3
              </div>
              <span className="ml-2 text-sm font-medium text-gray-500">Analysis</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 bg-gray-300 text-gray-600 rounded-full text-sm font-semibold">
                4
              </div>
              <span className="ml-2 text-sm font-medium text-gray-500">Resolution</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Complaint Form */}
          <div className="lg:col-span-2">
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">Complaint Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Ticket ID */}
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">RCA-001 • E-commerce Platform</h2>
                  <p className="text-sm text-gray-600">Ticket ID and System Information</p>
                </div>

                {/* Type of Complaint */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type of Complaint
                  </label>
                  <Input
                    value={formData.typeOfComplaint}
                    onChange={(e) => handleInputChange('typeOfComplaint', e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Category, Priority, Source */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <Input
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <div className="flex items-center">
                      <Badge className="bg-red-600 text-white border-0 font-medium">
                        {formData.priority}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Source
                    </label>
                    <Input
                      value={formData.source}
                      onChange={(e) => handleInputChange('source', e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Complaint Details with File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Complaint Details
                  </label>
                  <Textarea
                    value={formData.complaintDetails}
                    onChange={(e) => handleInputChange('complaintDetails', e.target.value)}
                    rows={4}
                    className="w-full mb-4"
                  />
                  
                  {/* Uploaded Files */}
                  {uploadedFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                          {getFileIcon(file.type)}
                          <span className="text-sm text-gray-700 flex-1">{file.name}</span>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>


                {/* Comments for Next Stage */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comments for Next Stage
                  </label>
                  <Textarea
                    value={formData.comments}
                    onChange={(e) => handleInputChange('comments', e.target.value)}
                    placeholder="Add notes and observations for the next stage..."
                    rows={3}
                    className="w-full mb-4"
                  />
                  
                  {/* File Upload for Next Stage */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                    <FiUpload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      Upload additional files for next stage
                    </p>
                    <Button variant="outline" size="sm" onClick={() => document.getElementById('next-stage-upload').click()}>
                      Choose Files
                    </Button>
                    <input
                      id="next-stage-upload"
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-4 pt-4">
                  <Button variant="outline" className="flex-1">
                    Save as Draft
                  </Button>
                  <Button 
                    className="bg-green-600 hover:bg-green-700 text-white flex-1"
                    onClick={handleInvestigation}
                  >
                    Investigation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - AI Suggestions and Similar Cases */}
          <div className="lg:col-span-1 space-y-6">
            {/* AI Suggestions */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                  <FiZap className="w-5 h-5 mr-2 text-yellow-500" />
                  AI Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {aiSuggestions.map((suggestion, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer">
                    <p className="text-sm text-gray-700">{suggestion}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Similar Cases */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                  <FiSearch className="w-5 h-5 mr-2 text-blue-500" />
                  Similar Cases
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {similarCases.map((caseItem, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{caseItem.id}</p>
                        <p className="text-sm text-gray-600 mt-1">{caseItem.title}</p>
                      </div>
                      <Badge className={`ml-2 ${
                        caseItem.match >= 80 ? 'bg-green-100 text-green-800' :
                        caseItem.match >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {caseItem.match}% match
                      </Badge>
                    </div>
                    {caseItem.match >= 95 && (
                      <div className="mt-2">
                        <Button 
                          size="sm" 
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs"
                          onClick={() => handleAIResolve(caseItem.id)}
                        >
                          <FiZap className="w-3 h-3 mr-1" />
                          AI Auto-Resolve
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Complaint
