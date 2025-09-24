import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { SimpleDateTimePicker } from '../ui/simple-date-time-picker'
import AutoSuggestionTextarea from '../ui/AutoSuggestionTextarea'
import { Badge } from '../ui/badge'
import { Skeleton } from '../ui/skeleton'
import { FiMessageCircle, FiZap, FiSearch, FiArrowRight, FiArrowLeft, FiCheck, FiSave, FiDownload, FiLoader } from 'react-icons/fi'
import { BsStars } from 'react-icons/bs'
import { aiService } from '../../api/services/aiService'

const RCAWorkflow = ({ 
  currentStep, 
  totalSteps, 
  stepTitle, 
  aiGuidance, 
  response, 
  onResponseChange, 
  onNext, 
  onPrevious, 
  aiSuggestions = [], 
  similarCases = [],
  aiSuggestionsLoading = false,
  similarCasesLoading = false,
  nextButtonText = "Next Step →",
  showPrevious = true,
  canProceed = true,
  onSaveProgress,
  onGenerateReport,
  ticketData = null,
  onStepClick = null
}) => {
  // State for Problem Definition step fields
  const [issueType, setIssueType] = useState('')
  const [severity, setSeverity] = useState('')
  const [businessImpactCategory, setBusinessImpactCategory] = useState('')
  const [problemSummary, setProblemSummary] = useState('')
  const [problemDefinitions, setProblemDefinitions] = useState([])
  const [aiQuestion, setAiQuestion] = useState('')
  const [isGeneratingProblemStatement, setIsGeneratingProblemStatement] = useState(false)
  const [hasAttemptedGeneration, setHasAttemptedGeneration] = useState(false)
  
  // State for Timeline step (step 2)
  const [logs, setLogs] = useState([])
  const [newLog, setNewLog] = useState({ time: '', service: '', message: '' })
  const [isAddingLog, setIsAddingLog] = useState(false)

  // Generate problem statement when component mounts and we're on step 1
  useEffect(() => {
    const generateProblemStatement = async () => {
      if (currentStep === 1 && ticketData && !isGeneratingProblemStatement && !hasAttemptedGeneration) {
        try {
          setIsGeneratingProblemStatement(true)
          setHasAttemptedGeneration(true)
          
          const requestData = {
            shortDescription: ticketData.short_description || '',
            description: ticketData.description || ticketData.short_description || '',
            serverLogs: ticketData?.logs || []
          }
          
          const response = await aiService.problemStatement.generate(requestData)
          
          if (response.success && response.problemStatement) {
            const { problemStatement } = response
            
            // Set the first problem definition in the textarea and store all definitions
            if (problemStatement.problemDefinitions && problemStatement.problemDefinitions.length > 0) {
              setProblemSummary(problemStatement.problemDefinitions[0])
              setProblemDefinitions(problemStatement.problemDefinitions)
            }
            
            // Set the AI question
            if (problemStatement.question) {
              setAiQuestion(problemStatement.question)
            }
            
            // Map issue type
            const issueTypeMap = {
              'Software': 'software',
              'Hardware': 'hardware', 
              'Network': 'network',
              'Configuration': 'configuration',
              'User Error': 'user_error',
              'Other': 'other'
            }
            setIssueType(issueTypeMap[problemStatement.issueType] || '')
            
            // Map severity
            const severityMap = {
              'Sev 1 – Critical': 'sev1',
              'Sev 2 – Major': 'sev2',
              'Sev 3 – Moderate': 'sev3',
              'Sev 4 – Minor': 'sev4'
            }
            setSeverity(severityMap[problemStatement.severity] || '')
            
            // Map business impact
            const impactMap = {
              'Revenue Loss': 'revenue_loss',
              'Compliance Issue': 'compliance_issue',
              'Operational Downtime': 'operational_downtime',
              'Customer Support': 'customer_support',
              'Other': 'other'
            }
            setBusinessImpactCategory(impactMap[problemStatement.businessImpact] || '')
          }
        } catch (error) {
          console.error('Error generating problem statement:', error)
          alert('Failed to generate AI problem statement. Please fill in the fields manually.')
        } finally {
          setIsGeneratingProblemStatement(false)
        }
      }
    }
    
    generateProblemStatement()
  }, [currentStep, ticketData, isGeneratingProblemStatement, hasAttemptedGeneration])

  // Load logs when on Timeline step (step 2)
  useEffect(() => {
    if (currentStep === 2 && ticketData && ticketData.logs) {
      setLogs(ticketData.logs)
    }
  }, [currentStep, ticketData])

  // Handle clicking on problem definition
  const handleProblemDefinitionClick = (definition) => {
    setProblemSummary(definition)
  }

  // Handle adding new log
  const handleAddLog = () => {
    if (newLog.time && newLog.service && newLog.message) {
      const logWithId = { ...newLog, id: Date.now(), isUserGenerated: true }
      setLogs([...logs, logWithId])
      setNewLog({ time: '', service: '', message: '' })
      setIsAddingLog(false)
    }
  }

  // Handle deleting user-generated log
  const handleDeleteLog = (logId) => {
    setLogs(logs.filter(log => log.id !== logId))
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI RCA Agent</h1>
          <p className="text-gray-600 mt-1">Interactive root cause analysis workflow with AI-powered guidance and suggestions.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            onClick={onSaveProgress}
            className="flex items-center"
          >
            <FiSave className="w-4 h-4 mr-2" />
            Save Progress
          </Button>
          <Button 
            className={`flex items-center ${
              currentStep === totalSteps 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            onClick={onGenerateReport}
            disabled={currentStep !== totalSteps}
          >
            <FiDownload className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* RCA Progress Card */}
      <Card className="bg-white shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">RCA Progress</h2>
            <span className="text-sm text-gray-600">Step {currentStep} of {totalSteps}</span>
          </div>
          
          {/* Progress Bar */}
          <div className="relative">
            {/* Background connecting line */}
            <div className="absolute top-4 left-4 h-0.5 bg-gray-200 rounded-full" style={{ width: 'calc(100% - 3rem)' }}></div>
            
            {/* Progress connecting line */}
            <div 
              className="absolute top-4 left-4 h-0.5 bg-green-600 rounded-full transition-all duration-300"
              style={{ 
                width: currentStep === totalSteps 
                  ? `calc(100% - 3rem)` 
                  : `${((currentStep - 1) / (totalSteps - 1)) * 100}%`
              }}
            ></div>
            
            <div className="flex items-center justify-between relative z-10">
              {Array.from({ length: totalSteps }, (_, index) => {
                const stepNumber = index + 1
                const isCompleted = stepNumber < currentStep
                const isCurrent = stepNumber === currentStep
                const isFuture = stepNumber > currentStep
                const isClickable = onStepClick
                
                return (
                  <div 
                    key={stepNumber} 
                    className={`flex flex-col items-center ${
                      isClickable ? 'cursor-pointer' : 'cursor-default'
                    }`}
                    onClick={() => {
                      if (isClickable) {
                        onStepClick(stepNumber)
                      }
                    }}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200 ${
                      isCompleted 
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : isCurrent 
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    } ${isClickable ? 'hover:scale-105 cursor-pointer' : 'cursor-default'}`}>
                      {isCompleted ? <FiCheck className="w-4 h-4" /> : stepNumber}
                    </div>
                    <span className={`text-xs mt-1 transition-colors duration-200 ${
                      isClickable ? 'text-gray-700 hover:text-gray-900' : 'text-gray-500'
                    }`}>
                      {stepNumber === 1 ? 'Problem' :
                       stepNumber === 2 ? 'Timeline' :
                       stepNumber === 3 ? 'Impact' :
                       stepNumber === 4 ? 'Root Cause' : 'Corrective actions'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

{/* Ticket Information Header */}
{ticketData ? (
        <div className="p-4 bg-white rounded-lg shadow-sm border">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {ticketData.short_description || 'No Title'}
          </h1>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <span><strong>Ticket ID:</strong> {ticketData.ticket_id}</span>
            <span><strong>Source:</strong> {ticketData.source}</span>
            <span><strong>Status:</strong> {ticketData.status}</span>
            <span><strong>Priority:</strong> {ticketData.priority}</span>
            <span><strong>Category:</strong> {ticketData.category}</span>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-white rounded-lg shadow-sm border">
          <div className="flex items-center gap-3 mb-2">
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="flex flex-wrap gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-36" />
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className={`grid grid-cols-1 gap-8 ${(currentStep === 1 || currentStep === 4) ? 'lg:grid-cols-3' : 'lg:grid-cols-1'}`}>
      {/* Main Content Area */}
      <div className={(currentStep === 1 || currentStep === 4) ? 'lg:col-span-2' : 'lg:col-span-1'}>
        <Card className="bg-white shadow-sm">
          <CardContent className="p-8">
            {/* Step Header */}
            <div className="flex items-center mb-6">
              <div className="flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full text-sm font-semibold mr-3">
                {currentStep}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{stepTitle}</h1>
                <p className="text-sm text-gray-600">Step {currentStep} of {totalSteps}</p>
              </div>
            </div>

            {/* AI Guidance */}
            <div className="mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <FiMessageCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-green-800">AI Guidance</span>
                </div>
                <p className="text-sm text-green-700">{aiGuidance}</p>
              </div>
            </div>

            {/* AI Question - Only show for Problem Definition step (step 1) */}
            {/* {currentStep === 1 && aiQuestion && (
              <div className="mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <BsStars className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-800">AI Question</span>
                  </div>
                  <p className="text-sm text-blue-700">{aiQuestion}</p>
                </div>
              </div>
            )} */}

            {/* Response Input */}
            <div className="mb-8">
              {currentStep === 1 ? (
                // Problem Definition step - show ticket description and form fields
                <div className="space-y-6">
                  {/* Ticket Description */}
                  {ticketData && ticketData.description && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ticket Description
                      </label>
                      <Input
                        value={ticketData.description}
                        disabled
                        className="w-full bg-gray-50"
                      />
                    </div>
                  )}
                  
                  {/* Dropdown Fields Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Issue Type
                      </label>
                      <Select value={issueType} onValueChange={setIssueType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select issue type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="network">Network</SelectItem>
                          <SelectItem value="hardware">Hardware</SelectItem>
                          <SelectItem value="software">Software</SelectItem>
                          <SelectItem value="configuration">Configuration</SelectItem>
                          <SelectItem value="user_error">User Error</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Severity
                      </label>
                      <Select value={severity} onValueChange={setSeverity}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select severity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sev1">Sev 1 – Critical</SelectItem>
                          <SelectItem value="sev2">Sev 2 – Major</SelectItem>
                          <SelectItem value="sev3">Sev 3 – Moderate</SelectItem>
                          <SelectItem value="sev4">Sev 4 – Minor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Impact Category
                      </label>
                      <Select value={businessImpactCategory} onValueChange={setBusinessImpactCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select impact category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="revenue_loss">Revenue Loss</SelectItem>
                          <SelectItem value="compliance_issue">Compliance Issue</SelectItem>
                          <SelectItem value="operational_downtime">Operational Downtime</SelectItem>
                          <SelectItem value="customer_support">Customer Support</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Problem Statement */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Problem Statement (AI-assisted)
                    </label>
                    <Textarea
                      value={problemSummary}
                      onChange={(e) => setProblemSummary(e.target.value)}
                      placeholder={isGeneratingProblemStatement ? "Generating AI problem summary..." : "AI-generated problem summary..."}
                      rows={6}
                      className="w-full resize-none"
                      disabled={isGeneratingProblemStatement}
                    />
                  </div>
                </div>
              ) : currentStep === 2 ? (
                // Timeline step - show ticket creation time and logs
                <div className="space-y-6">
                  {/* Ticket Creation Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ticket Creation Time
                    </label>
                    <Input
                      value={ticketData?.opened_time ? formatDate(ticketData.opened_time) : ''}
                      disabled
                      className="w-full bg-gray-50"
                    />
                  </div>
                  
                  {/* Logs Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Logs</h3>
                      <Button
                        onClick={() => setIsAddingLog(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        size="sm"
                      >
                        + Add Log
                      </Button>
                    </div>
                    
                    {/* Existing Logs */}
                    <div className="space-y-3">
                      {logs.map((log, index) => (
                        <div key={log.id || index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                          <div className="w-48 flex-shrink-0">
                            <Input
                              value={formatDate(log.time)}
                              disabled
                              className="w-full"
                              placeholder="Time"
                            />
                          </div>
                          <div className="w-32 flex-shrink-0">
                            <Input
                              value={log.service}
                              disabled
                              className="w-full"
                              placeholder="Service"
                            />
                          </div>
                          <div className="flex-grow">
                            <Input
                              value={log.message}
                              disabled
                              className="w-full"
                              placeholder="Message"
                            />
                          </div>
                          {log.isUserGenerated && (
                            <Button
                              onClick={() => handleDeleteLog(log.id)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                            >
                              ✕
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {/* Add New Log Form */}
                    {isAddingLog && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-3">
                          <div className="w-48 flex-shrink-0">
                            <SimpleDateTimePicker
                              value={newLog.time ? new Date(newLog.time) : null}
                              onChange={(date) => setNewLog({...newLog, time: date ? date.toISOString() : ''})}
                              placeholder="Select date and time"
                              className="w-full"
                            />
                          </div>
                          <div className="w-32 flex-shrink-0">
                            <Input
                              value={newLog.service}
                              onChange={(e) => setNewLog({...newLog, service: e.target.value})}
                              placeholder="Service"
                              className="w-full"
                            />
                          </div>
                          <div className="flex-grow">
                            <Input
                              value={newLog.message}
                              onChange={(e) => setNewLog({...newLog, message: e.target.value})}
                              placeholder="Message"
                              className="w-full"
                            />
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <Button
                              onClick={handleAddLog}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              ✓
                            </Button>
                            <Button
                              onClick={() => {
                                setIsAddingLog(false)
                                setNewLog({ time: '', service: '', message: '' })
                              }}
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              ✕
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : currentStep === 5 ? (
                <AutoSuggestionTextarea
                  value={response}
                  onChange={(e) => onResponseChange(e)}
                  placeholder="Enter your corrective actions here..."
                  rows={8}
                  className="w-full resize-none"
                  reference={ticketData ? `${ticketData.short_description} ${ticketData.description || ''}`.trim() : ''}
                />
              ) : (
                <Textarea
                  value={response}
                  onChange={(e) => onResponseChange(e.target.value)}
                  placeholder="Enter your response here..."
                  rows={8}
                  className="w-full resize-none"
                />
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              {showPrevious && (
                <Button 
                  onClick={onPrevious}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Previous
                </Button>
              )}
              <Button 
                onClick={onNext}
                disabled={currentStep === 1 ? (!issueType || !severity || !businessImpactCategory || !problemSummary.trim()) : !canProceed}
                className={`ml-auto ${
                  (currentStep === 1 ? (issueType && severity && businessImpactCategory && problemSummary.trim()) : canProceed)
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {nextButtonText}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Sidebar - Show for Problem Definition (step 1) and Root Cause (step 4) */}
      {(currentStep === 1 || currentStep === 4) && (
      <div className="lg:col-span-1 space-y-6">
         
        {/* Problem Definitions - Only show for Problem Definition step (step 1) */}
        {currentStep === 1 && (
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                <BsStars className="w-5 h-5 mr-2 text-blue-500" />
                AI Problem Definitions
                {!isGeneratingProblemStatement && problemDefinitions.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {problemDefinitions.length} options
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isGeneratingProblemStatement ? (
                // Skeleton loader for problem definitions
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between mb-2">
                      <Skeleton className="h-5 w-16" />
                    </div>
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-3/4 mb-1" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))
              ) : problemDefinitions.length > 0 ? (
                problemDefinitions.map((definition, index) => (
                  <div 
                    key={index} 
                    className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => handleProblemDefinitionClick(definition)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                        Option {index + 1}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-3">{definition}</p>
                  </div>
                ))
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-center">
                  <p className="text-sm text-gray-500">No problem definitions available</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Similar Cases - Only show for Root Cause step (step 4) */}
        {currentStep === 4 && ((similarCases && similarCases.results && similarCases.results.length > 0) || similarCasesLoading) ? (
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                <FiSearch className="w-5 h-5 mr-2 text-blue-500" />
                Similar Cases
                {similarCases && similarCases.total_results && (
                  <Badge variant="secondary" className="ml-2">
                    {similarCases.total_results} found
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {similarCasesLoading ? (
                // Skeleton loader for similar cases
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-4 w-full mb-1" />
                        <Skeleton className="h-3 w-3/4" />
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Skeleton className="h-6 w-16" />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))
              ) : (
                similarCases.results.map((caseItem, index) => (
                  <div key={caseItem.ticket_id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{caseItem.ticket_id}</p>
                        <p className="text-sm text-gray-600 mt-1">{caseItem.short_description}</p>
                        {caseItem.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{caseItem.description}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge className={`${
                          caseItem.confidence_percentage >= 90 ? 'bg-green-100 text-green-800' :
                          caseItem.confidence_percentage >= 80 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {caseItem.confidence_percentage}% match
                        </Badge>
                        {/* <span className="text-xs text-gray-500">Rank #{caseItem.rank}</span> */}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                      {/* <span><strong>Status:</strong> {caseItem.status}</span>
                      <span><strong>Priority:</strong> {caseItem.priority}</span>
                      <span><strong>Category:</strong> {caseItem.category}</span> */}
                      <span><strong>Source:</strong> {caseItem.source}</span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        ) : null}

        {/* AI Suggestions - Only show for Root Cause step (step 4) */}
        {currentStep === 4 && (aiSuggestions.length > 0 || aiSuggestionsLoading) && (
           <Card className="bg-white shadow-sm">
             <CardHeader>
               <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                 <FiZap className="w-5 h-5 mr-2 text-yellow-500" />
                 AI Suggestions
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-3">
               {aiSuggestionsLoading ? (
                 // Skeleton loader for AI suggestions
                 Array.from({ length: 3 }).map((_, index) => (
                   <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                     <Skeleton className="h-4 w-full mb-2" />
                     <Skeleton className="h-4 w-3/4 mb-1" />
                     <Skeleton className="h-4 w-1/2" />
                   </div>
                 ))
               ) : (
                 aiSuggestions.map((suggestion, index) => (
                   <div 
                     key={index} 
                     className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                     onClick={() => onResponseChange(suggestion)}
                   >
                     <p className="text-sm text-gray-700">{suggestion}</p>
                   </div>
                 ))
               )}
             </CardContent>
           </Card>
         )}
      </div>
      )}
      </div>
    </div>
  )
}

export default RCAWorkflow
