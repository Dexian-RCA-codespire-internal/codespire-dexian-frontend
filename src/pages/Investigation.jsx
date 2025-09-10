import React, { useState } from 'react'
// Investigation page with chat interface
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { FiUpload, FiImage, FiFileText, FiFile, FiUser, FiPlus, FiClock, FiMoreHorizontal, FiSearch, FiBarChart, FiPaperclip, FiSend } from 'react-icons/fi'

const Investigation = () => {
  const { ticketId } = useParams()
  const navigate = useNavigate()
  const [comment, setComment] = useState('')
  const [chatMessage, setChatMessage] = useState('')

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
            <div className="w-16 h-0.5 bg-gray-300"></div>
            <div 
              className={`flex items-center transition-opacity ${
                canNavigateToAnalysis() 
                  ? 'cursor-pointer hover:opacity-80' 
                  : 'cursor-not-allowed opacity-50'
              }`} 
              onClick={canNavigateToAnalysis() ? () => navigate(`/analysis/${ticketId}`) : undefined}
            >
              <div className="flex items-center justify-center w-8 h-8 bg-gray-300 text-gray-600 rounded-full text-sm font-semibold">
                3
              </div>
              <span className="ml-2 text-sm font-medium text-gray-500">Analysis</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300"></div>
            <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate(`/resolution/${ticketId}`)}>
              <div className="flex items-center justify-center w-8 h-8 bg-gray-300 text-gray-600 rounded-full text-sm font-semibold">
                4
              </div>
              <span className="ml-2 text-sm font-medium text-gray-500">Resolution</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Complaint Details and Attachments */}
          <div className="lg:col-span-2 space-y-6">
            {/* Issue Header */}
            <Card className="bg-white shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      Payment Gateway Timeout Issues
                    </h1>
                    <p className="text-lg text-gray-600 mb-4">
                      {ticketId} – E-commerce Platform
                    </p>
                    
                    <div className="flex items-center space-x-3 mb-4">
                      <Badge className="bg-red-600 text-white border-0 font-medium">
                        Critical
                      </Badge>
                      <Badge className="bg-gray-100 text-gray-800 border-0 font-medium">
                        Jira
                      </Badge>
                      <div className="flex items-center text-sm text-gray-600">
                        <FiClock className="w-4 h-4 mr-1" />
                        SLA: 8 h 12 m remaining
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
                    <FiMoreHorizontal className="w-5 h-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Attachments Section */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Attachments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* File Previews */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex flex-col items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="mb-2">
                        {file.icon}
                      </div>
                      <span className="text-xs text-gray-600 text-center truncate w-full">
                        {file.name}
                      </span>
                      {file.name === 'error_log.pdf' && (
                        <span className="text-xs text-gray-500 mt-1">PJ 2 days ago</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Notes Section */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-900">Notes</h4>
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Add notes..."
                      className="pl-10 w-full h-24"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {!canNavigateToAnalysis() && (
                    <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md p-3">
                      <strong>Note:</strong> Please add investigation notes before proceeding to Analysis.
                    </div>
                  )}
                  <div className="flex items-center space-x-4">
                    <Button variant="outline" className="flex-1">
                      Save as Draft
                    </Button>
                    <Button 
                      className={`flex-1 ${
                        canNavigateToAnalysis() 
                          ? 'bg-green-600 hover:bg-green-700 text-white' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      onClick={handleAnalysisNavigation}
                      disabled={!canNavigateToAnalysis()}
                    >
                      Analysis
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Investigation Chat */}
          <div className="lg:col-span-1">
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Investigation Chat</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Chat Messages */}
                <div className="space-y-4">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <FiUser className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{msg.user}</p>
                        <p className="text-sm text-gray-700 mt-1">{msg.message}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat Input */}
                <div className="space-y-3">
                  <div className="relative">
                    <Input
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="w-full pr-20"
                    />
                  </div>
                  
                  {/* Chat Actions */}
                  <div className="flex items-center justify-between">
                    <button className="flex items-center text-sm text-gray-600 hover:text-gray-800">
                      <FiPaperclip className="w-4 h-4 mr-1" />
                      Attach File
                    </button>
                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                      <FiSend className="w-4 h-4 mr-1" />
                      Send
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Investigation
