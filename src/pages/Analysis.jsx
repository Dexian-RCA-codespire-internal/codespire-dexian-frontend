import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Badge } from '../components/ui/badge'
import { FiUpload, FiImage, FiUser, FiPlus, FiClock, FiMoreHorizontal, FiSearch, FiZap, FiTrendingUp, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi'

const Analysis = () => {
  const { ticketId } = useParams()
  const navigate = useNavigate()
  
  const [analysisNotes, setAnalysisNotes] = useState('')
  const [rootCause, setRootCause] = useState('')
  const [recommendations, setRecommendations] = useState('')



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
          {/* Left Column - Analysis Details and Attachments */}
          <div className="lg:col-span-2 space-y-6">
            {/* Issue Header */}
            <Card className="bg-white shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      Root Cause Analysis
                    </h1>
                    <p className="text-lg text-gray-600 mb-4">
                      {ticketId} – Payment Gateway Timeout Issues
                    </p>
                    
                    <div className="flex items-center space-x-3 mb-4">
                      <Badge className="bg-red-600 text-white border-0 font-medium">
                        Critical
                      </Badge>
                      <Badge className="bg-blue-100 text-blue-800 border-0 font-medium">
                        Analysis Phase
                      </Badge>
                      <div className="flex items-center text-sm text-gray-600">
                        <FiClock className="w-4 h-4 mr-1" />
                        SLA: 4 h 30 m remaining
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
                    <FiMoreHorizontal className="w-5 h-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Analysis Insights */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Analysis Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analysisInsights.map((insight, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {insight.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-gray-900">{insight.title}</h4>
                          <Badge className={`text-xs ${
                            insight.impact === 'High' ? 'bg-red-100 text-red-800' :
                            insight.impact === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {insight.impact} Impact
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{insight.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Root Cause Analysis */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Root Cause Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Identified Root Cause
                  </label>
                  <Textarea
                    value={rootCause}
                    onChange={(e) => setRootCause(e.target.value)}
                    placeholder="Describe the root cause of the issue..."
                    rows={4}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recommendations
                  </label>
                  <Textarea
                    value={recommendations}
                    onChange={(e) => setRecommendations(e.target.value)}
                    placeholder="Provide recommendations to prevent similar issues..."
                    rows={4}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Attachments Section */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Analysis Documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Analysis Notes */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-900">Analysis Notes</h4>
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      value={analysisNotes}
                      onChange={(e) => setAnalysisNotes(e.target.value)}
                      placeholder="Add analysis notes..."
                      className="pl-10 w-full h-24"
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
                    onClick={handleResolution}
                  >
                    Move to Resolution
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - AI Suggestions */}
          <div className="lg:col-span-1">
            {/* AI Suggestions */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                  <FiZap className="w-5 h-5 mr-2 text-yellow-500" />
                  AI Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer">
                  <p className="text-sm text-gray-700">Implement connection pooling limits</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer">
                  <p className="text-sm text-gray-700">Add monitoring for database connections</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer">
                  <p className="text-sm text-gray-700">Consider horizontal scaling</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analysis
