import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Textarea } from '../components/ui/Textarea'
import { Badge } from '../components/ui/badge'
import { FiSave, FiSend, FiArrowLeft, FiFileText, FiUser, FiCheckCircle, FiAlertTriangle, FiClock } from 'react-icons/fi'

const CompleteRCA = () => {
  const { ticketId } = useParams()
  const navigate = useNavigate()
  const [technicalDoc, setTechnicalDoc] = useState('')
  const [userDoc, setUserDoc] = useState('')

  // RCA Cases data (same as in RCADashboard)
  const rcaCases = [
    {
      id: 'RCA-001',
      ticketId: 'INC0012345',
      title: 'Server Outage',
      source: 'Jira',
      system: 'E-commerce Platform',
      priority: 'P1',
      priorityColor: 'bg-red-100 text-red-800',
      progress: 20,
      progressColor: 'bg-red-500',
      daysOpen: 3,
      stage: 'Investigation',
      createdDate: '2024-01-15'
    },
    {
      id: 'RCA-002',
      ticketId: 'INC0012346',
      title: 'Payment Failure',
      source: 'Servicenow',
      system: 'Payment Gateway',
      priority: 'P1',
      priorityColor: 'bg-red-100 text-red-800',
      progress: 40,
      progressColor: 'bg-red-500',
      daysOpen: 5,
      stage: 'Analysis',
      createdDate: '2024-01-13'
    },
    {
      id: 'RCA-003',
      ticketId: 'INC0012347',
      title: 'Data Sync Issue',
      source: 'Jira',
      system: 'CRM System',
      priority: 'P2',
      priorityColor: 'bg-yellow-100 text-yellow-800',
      progress: 50,
      progressColor: 'bg-yellow-500',
      daysOpen: 8,
      stage: 'Analysis',
      createdDate: '2024-01-10'
    },
    {
      id: 'RCA-004',
      ticketId: 'INC0012348',
      title: 'Login Errors',
      source: 'Zendesk',
      system: 'User Portal',
      priority: 'P1',
      priorityColor: 'bg-red-100 text-red-800',
      progress: 60,
      progressColor: 'bg-red-500',
      daysOpen: 2,
      stage: 'Resolution',
      createdDate: '2024-01-16'
    },
    {
      id: 'RCA-005',
      ticketId: 'INC0012349',
      title: 'Page Load Slowness',
      source: 'Remedy',
      system: 'Web Application',
      priority: 'P2',
      priorityColor: 'bg-yellow-100 text-yellow-800',
      progress: 70,
      progressColor: 'bg-yellow-500',
      daysOpen: 12,
      stage: 'Resolution',
      createdDate: '2024-01-06'
    },
    {
      id: 'RCA-006',
      ticketId: 'INC0012350',
      title: 'Report Generation Bug',
      source: 'Zendesk',
      system: 'Reporting System',
      priority: 'P3',
      priorityColor: 'bg-green-100 text-green-800',
      progress: 100,
      progressColor: 'bg-green-500',
      daysOpen: 1,
      stage: 'Compliant',
      createdDate: '2024-01-17'
    },
    {
      id: 'RCA-007',
      ticketId: 'INC0012351',
      title: 'Database Connection Pool Exhaustion',
      source: 'Jira',
      system: 'Customer Portal',
      priority: 'P1',
      priorityColor: 'bg-red-100 text-red-800',
      progress: 25,
      progressColor: 'bg-red-500',
      daysOpen: 4,
      stage: 'Investigation',
      createdDate: '2024-01-14'
    },
    {
      id: 'RCA-008',
      ticketId: 'INC0012352',
      title: 'API Rate Limiting Issues',
      source: 'ServiceNow',
      system: 'Integration Platform',
      priority: 'P1',
      priorityColor: 'bg-red-100 text-red-800',
      progress: 60,
      progressColor: 'bg-red-500',
      daysOpen: 6,
      stage: 'Analysis',
      createdDate: '2024-01-12'
    },
    {
      id: 'RCA-009',
      ticketId: 'INC0012353',
      title: 'Memory Leak in Background Jobs',
      source: 'Remedy',
      system: 'Data Processing Engine',
      priority: 'P2',
      priorityColor: 'bg-yellow-100 text-yellow-800',
      progress: 80,
      progressColor: 'bg-yellow-500',
      daysOpen: 9,
      stage: 'Resolution',
      createdDate: '2024-01-09'
    },
    {
      id: 'RCA-010',
      ticketId: 'INC0012354',
      title: 'SSL Certificate Expiration',
      source: 'Zendesk',
      system: 'External API Gateway',
      priority: 'P1',
      priorityColor: 'bg-red-100 text-red-800',
      progress: 90,
      progressColor: 'bg-red-500',
      daysOpen: 2,
      stage: 'Resolution',
      createdDate: '2024-01-16'
    },
    {
      id: 'RCA-011',
      ticketId: 'INC0012355',
      title: 'User Session Timeout Problems',
      source: 'Jira',
      system: 'Authentication Service',
      priority: 'P2',
      priorityColor: 'bg-yellow-100 text-yellow-800',
      progress: 45,
      progressColor: 'bg-yellow-500',
      daysOpen: 7,
      stage: 'Analysis',
      createdDate: '2024-01-11'
    },
    {
      id: 'RCA-012',
      ticketId: 'INC0012356',
      title: 'File Upload Size Limit Exceeded',
      source: 'ServiceNow',
      system: 'Document Management',
      priority: 'P3',
      priorityColor: 'bg-green-100 text-green-800',
      progress: 100,
      progressColor: 'bg-green-500',
      daysOpen: 1,
      stage: 'Compliant',
      createdDate: '2024-01-17'
    }
  ]

  // Find the case data based on ticketId
  const currentCase = rcaCases.find(case_ => case_.id === ticketId) || rcaCases[0]
  
  // RCA case data from dashboard
  const rcaData = {
    id: currentCase.id,
    ticketId: currentCase.ticketId,
    title: currentCase.title,
    system: currentCase.system,
    source: currentCase.source,
    priority: currentCase.priority,
    priorityColor: currentCase.priorityColor,
    status: currentCase.stage,
    createdDate: currentCase.createdDate,
    resolvedDate: new Date().toISOString().split('T')[0], // Today's date as resolved
    assignee: 'John Smith', // Default assignee
    team: 'Platform Engineering' // Default team
  }

  // Dummy technical documentation data
  const technicalDocumentation = {
    rootCause: 'Database connection pool exhaustion due to unclosed connections in background job processing',
    impact: 'Complete service unavailability for 2.5 hours affecting 15,000+ users',
    resolution: 'Implemented connection pooling best practices and added connection monitoring',
    prevention: 'Added automated connection leak detection and improved error handling',
    metrics: {
      mttr: '2.5 hours',
      affectedUsers: '15,000+',
      revenueLoss: '$45,000',
      slaBreach: 'Yes'
    },
    technicalDetails: {
      environment: 'Production',
      affectedServices: ['User Authentication', 'Payment Processing', 'Order Management'],
      database: 'PostgreSQL 13.4',
      connectionPool: 'HikariCP 4.0.3',
      maxConnections: 20,
      actualConnections: 20
    }
  }

  // Dummy user documentation data
  const userDocumentation = {
    summary: 'Brief service interruption resolved - all systems operational',
    userImpact: 'Users experienced login issues and payment failures during the outage',
    resolution: 'Issue has been resolved and systems are fully operational',
    nextSteps: 'No action required from users. All services are running normally.',
    contactInfo: 'For any concerns, please contact support@company.com',
    timeline: {
      start: '2024-01-15 14:30 UTC',
      end: '2024-01-15 17:00 UTC',
      duration: '2.5 hours'
    }
  }

  const handleSaveTechnical = () => {
    // Handle saving technical documentation
    console.log('Saving technical documentation:', technicalDoc)
    // Add your save logic here
    alert('Technical documentation saved successfully!')
  }

  const handleSendUser = () => {
    // Handle sending user documentation
    console.log('Sending user documentation:', userDoc)
    // Add your send logic here
    alert('User documentation sent successfully!')
  }

  const handleBack = () => {
    navigate('/rca-dashboard')
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Complete RCA</h1>
            <p className="text-sm text-gray-600">Finalize documentation and close the case</p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </div>

         {/* Case Information */}
         <Card className="mb-4">
           <CardHeader className="pb-3">
             <CardTitle className="flex items-center gap-2 text-sm">
               <FiFileText className="w-4 h-4" />
               Case Information
             </CardTitle>
           </CardHeader>
           <CardContent className="pt-0">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
               <div>
                 <p className="text-xs font-medium text-gray-600">Ticket ID</p>
                 <p className="text-xs font-medium text-gray-900">{rcaData.ticketId}</p>
               </div>
               <div>
                 <p className="text-xs font-medium text-gray-600">RCA ID</p>
                 <p className="text-xs font-medium text-gray-900">{rcaData.id}</p>
               </div>
               <div>
                 <p className="text-xs font-medium text-gray-600">Source</p>
                 <p className="text-xs font-medium text-gray-900">{rcaData.source}</p>
               </div>
               <div>
                 <p className="text-xs font-medium text-gray-600">System</p>
                 <p className="text-xs font-medium text-gray-900">{rcaData.system}</p>
               </div>
               <div>
                 <p className="text-xs font-medium text-gray-600">Title</p>
                 <p className="text-xs font-medium text-gray-900 truncate">{rcaData.title}</p>
               </div>
             </div>
           </CardContent>
         </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Technical Documentation */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FiFileText className="w-5 h-5" />
                Technical Documentation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Root Cause Analysis */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Root Cause</h4>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <FiAlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                    <p className="text-sm text-red-800">{technicalDocumentation.rootCause}</p>
                  </div>
                </div>
              </div>


              {/* Resolution */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Resolution</h4>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <FiCheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <p className="text-sm text-green-800">{technicalDocumentation.resolution}</p>
                  </div>
                </div>
              </div>


              {/* Technical Details */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Technical Details</h4>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs font-medium text-gray-600">Environment:</span>
                      <span className="text-xs text-gray-900">{technicalDocumentation.technicalDetails.environment}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs font-medium text-gray-600">Database:</span>
                      <span className="text-xs text-gray-900">{technicalDocumentation.technicalDetails.database}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs font-medium text-gray-600">Connection Pool:</span>
                      <span className="text-xs text-gray-900">{technicalDocumentation.technicalDetails.connectionPool}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs font-medium text-gray-600">Max Connections:</span>
                      <span className="text-xs text-gray-900">{technicalDocumentation.technicalDetails.maxConnections}</span>
                    </div>
                  </div>
                </div>
              </div>


              {/* Save Button */}
              <Button 
                onClick={handleSaveTechnical}
                className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
              >
                <FiSave className="w-4 h-4" />
                Save Technical Documentation
              </Button>
            </CardContent>
          </Card>

          {/* User Documentation */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FiUser className="w-5 h-5" />
                User Documentation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Summary</h4>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700">{userDocumentation.summary}</p>
                </div>
              </div>

              {/* User Impact */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">User Impact</h4>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">{userDocumentation.userImpact}</p>
                </div>
              </div>

              {/* Resolution Status */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Resolution Status</h4>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <FiCheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <p className="text-sm text-green-800">{userDocumentation.resolution}</p>
                  </div>
                </div>
              </div>



              {/* Contact Information */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Contact Information</h4>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700">{userDocumentation.contactInfo}</p>
                </div>
              </div>


              {/* Send Button */}
              <Button 
                onClick={handleSendUser}
                className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
              >
                <FiSend className="w-4 h-4" />
                Send User Documentation
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Action Bar */}
        <div className="mt-8 flex justify-end gap-4">
          <Button 
            variant="outline"
            onClick={handleBack}
          >
            Cancel
          </Button>
           <Button 
             className="bg-green-600 hover:bg-green-700 text-white"
             onClick={() => {
               handleSaveTechnical()
               handleSendUser()
               navigate('/rca-dashboard')
             }}
           >
             Close
           </Button>
        </div>
      </div>

    </div>
  )
}

export default CompleteRCA
