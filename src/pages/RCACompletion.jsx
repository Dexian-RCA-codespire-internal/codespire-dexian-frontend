

import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/Button'
import { FormattedReport } from '../components/ui/FormattedReport'
import { Badge } from '../components/ui/Badge'
import { Skeleton } from '../components/ui/skeleton'
import KnowledgeBaseModal from '../components/ui/KnowledgeBaseModal'
import { 
  FiFileText, 
  FiUsers, 
  FiSave, 
  FiArrowLeft, 
  FiCheckCircle,
  FiAlertCircle,
  FiLoader,
  FiPlay,
  FiClock,
  FiDatabase
} from 'react-icons/fi'
import websocketService from '../services/websocketService'
import { rcaService, knowledgeBaseService } from '../api'
import { ticketService } from '../api'

const RCACompletion = () => {
  const { id, ticketId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [technicalReport, setTechnicalReport] = useState('')
  const [customerSummary, setCustomerSummary] = useState('')
  
  // Loading and error states
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  
  // Streaming API states
  const [streaming, setStreaming] = useState(false)
  const [streamingProgress, setStreamingProgress] = useState('')
  const [streamingError, setStreamingError] = useState(null)
  const [websocketConnected, setWebsocketConnected] = useState(false)
  const [socketId, setSocketId] = useState(null)
  const [progress, setProgress] = useState(0)
  const [currentStage, setCurrentStage] = useState('')
  const [autoTriggering, setAutoTriggering] = useState(false)
  const [generatingTechnical, setGeneratingTechnical] = useState(false)
  const [generatingCustomer, setGeneratingCustomer] = useState(false)
  
  // Refs for current content
  const currentTechnicalRCA = useRef('')
  const currentCustomerSummary = useRef('')
  
  // Track received chunks to prevent duplication
  const receivedTechnicalChunks = useRef(new Set())
  const receivedCustomerChunks = useRef(new Set())
  
  // Ticket data
  const [ticketData, setTicketData] = useState(null)
  const [resolvedTicketData, setResolvedTicketData] = useState(null)
  const [isLoadedFromDatabase, setIsLoadedFromDatabase] = useState(false)
  
  // Knowledge Base Modal states
  const [showKBModal, setShowKBModal] = useState(false)
  const [creatingKB, setCreatingKB] = useState(false)
  
  // Step data from previous RCA workflow
  const [stepData, setStepData] = useState({
    problem_step1: '',
    timeline_step2: '',
    impact_step3: '',
    root_cause_step4: '',
    corrective_actions_step5: ''
  })

  // View mode state for toggling between reports
  const [viewMode, setViewMode] = useState('technical')

  useEffect(() => {
    // Get data from navigation state or fetch from API
    if (location.state?.ticketData) {
      setTicketData(location.state.ticketData)
      setStepData(location.state.stepData || {})
      
      // Check if RCA report already exists for this ticket
      checkExistingRCAReport(location.state.ticketData.ticket_id)
    } else {
      // Fetch ticket data if not provided
      fetchTicketData()
    }
    
    // Cleanup on unmount
    return () => {
      // Remove direct socket listeners only - don't disconnect the socket
      // The WebSocket connection is shared across the app and should persist
      const socket = websocketService.getSocket()
      if (socket) {
        socket.off('rca_progress')
        socket.off('rca_generation')
        socket.off('rca_chunk')
        socket.off('rca_streaming')
        socket.off('rca_complete')
        socket.off('rca_error')
      }
      
      // Remove websocketService listeners
      websocketService.off('disconnect', handleDisconnect)
    }
  }, [location.state, ticketId])

  const fetchTicketData = async () => {
    try {
      setLoading(true)

      // Mock data for now
      setTimeout(() => {
        const mockTicketData = {
          _id: ticketId,
          ticket_id: 'RCA-001',
          short_description: 'Payment Gateway Timeout',
          status: 'In Progress',
          priority: 'High',
          category: 'Infrastructure'
        }
        setTicketData(mockTicketData)
        
        // Check if RCA report already exists
        checkExistingRCAReport(mockTicketData.ticket_id)
      }, 1000)
    } catch (err) {
      setError('Failed to load ticket data')
      setLoading(false)
    }
  }

  const checkExistingRCAReport = async (ticketId) => {
    try {
      console.log('🔍 Checking for existing RCA report for ticket:', ticketId)
      const response = await knowledgeBaseService.getRCAResolvedTicket(ticketId)
      
      if (response.success && response.ticket) {
        console.log('✅ Found existing ticket data:', response.ticket)
        setResolvedTicketData(response.ticket)
        
        // Check if RCA report already exists and is completed
        const rcaReport = response.ticket.resolution_steps?.rca_report
        if (rcaReport && rcaReport.completed && (rcaReport.rcaReport || rcaReport.customerFriSummery)) {
          console.log('📄 Loading existing RCA report from database')
          setTechnicalReport(rcaReport.rcaReport || '')
          setCustomerSummary(rcaReport.customerFriSummery || '')
          setIsLoadedFromDatabase(true) // Mark as loaded from database
          setLoading(false)
          
          // Don't auto-trigger generation if report already exists
          console.log('✅ RCA report already exists, skipping auto-generation')
          return
        }
      }
      
      // If no existing report found, proceed with auto-generation
      setLoading(false)
      setIsLoadedFromDatabase(false) // Mark as not loaded from database
      console.log('📝 No existing RCA report found, proceeding with generation')
      
      // Connect WebSocket first, then auto-trigger streaming API
      connectWebSocket().then(() => {
        // Add a small delay to ensure WebSocket is fully ready
        setAutoTriggering(true)
        setTimeout(() => {
          console.log('🔧 Auto-triggering RCA generation...')
          generateRCA().finally(() => {
            setAutoTriggering(false)
          })
        }, 1000) // 1 second delay
      }).catch((error) => {
        console.error('❌ Failed to connect WebSocket:', error)
        setStreamingError('Failed to connect to WebSocket server')
        setAutoTriggering(false)
      })
      
    } catch (error) {
      console.error('❌ Error checking existing RCA report:', error)
      // Proceed with auto-generation if check fails
      setLoading(false)
      setIsLoadedFromDatabase(false) // Mark as not loaded from database
      
      connectWebSocket().then(() => {
        setAutoTriggering(true)
        setTimeout(() => {
          console.log('🔧 Auto-triggering RCA generation (fallback)...')
          generateRCA().finally(() => {
            setAutoTriggering(false)
          })
        }, 1000)
      }).catch((error) => {
        console.error('❌ Failed to connect WebSocket:', error)
        setStreamingError('Failed to connect to WebSocket server')
        setAutoTriggering(false)
      })
    }
  }

  const connectWebSocket = async () => {
    try {
      // Check if already connected before attempting to connect
      if (websocketService.getConnectionStatus()) {
        console.log('✅ WebSocket already connected, reusing existing connection')
        setWebsocketConnected(true)
        setSocketId(websocketService.getSocket()?.id || null)
        setStreamingError(null)
      } else {
        await websocketService.connect()
        setWebsocketConnected(true)
        setSocketId(websocketService.getSocket()?.id || null)
        setStreamingError(null)
        console.log('✅ Connected to WebSocket server:', websocketService.getSocket()?.id)
      }
      
      // Set up event listeners
      console.log('🔧 Setting up event listeners...')
      
      // Get the raw socket to listen for RCA events directly
      const socket = websocketService.getSocket()
      if (socket) {
        console.log('🔧 Setting up direct Socket.IO listeners for RCA events...')
        
        // Remove any existing listeners first to prevent duplicates
        socket.off('rca_progress')
        socket.off('rca_generation')
        socket.off('rca_chunk')
        socket.off('rca_streaming')
        socket.off('rca_complete')
        socket.off('rca_error')
        
        // Listen for RCA events directly on the socket
        socket.on('rca_progress', (data) => {
          console.log('🔍 Received rca_progress:', data)
          handleProgress(data)
        })
        
        socket.on('rca_generation', (data) => {
          console.log('🔍 Received rca_generation:', data)
          handleGeneration(data)
        })
        
        socket.on('rca_chunk', (data) => {
          console.log('🔍 Received rca_chunk:', data)
          handleGeneration(data)
        })
        
        socket.on('rca_streaming', (data) => {
          console.log('🔍 Received rca_streaming:', data)
          handleGeneration(data)
        })
        
        socket.on('rca_complete', (data) => {
          console.log('🔍 Received rca_complete:', data)
          handleComplete(data)
        })
        
        socket.on('rca_error', (data) => {
          console.log('🔍 Received rca_error:', data)
          handleError(data)
        })
        
        console.log('✅ Direct Socket.IO listeners set up successfully')
      }
      
      // Also set up websocketService listeners for other events
      websocketService.off('disconnect', handleDisconnect) // Remove first to prevent duplicates
      websocketService.on('disconnect', handleDisconnect)
      console.log('✅ Event listeners set up successfully')
      
    } catch (error) {
      console.error('❌ WebSocket connection failed:', error)
      setStreamingError(`Connection error: ${error.message}`)
      setWebsocketConnected(false)
    }
  }

  const handleProgress = (data) => {
    setStreamingProgress(`${data.stage}: ${data.message}`)
    setCurrentStage(data.stage)
    updateProgress(data.stage)
  }

  const handleGeneration = (data) => {
    console.log('🔧 handleGeneration called with data:', data)
    
    if (data.type === 'technical') {
      if (data.chunk) {
        console.log('📝 Adding technical chunk:', data.chunk)
        // Create a unique hash for the chunk to prevent duplication
        const chunkHash = `${data.chunk.slice(0, 50)}_${data.chunk.length}`
        
        if (!receivedTechnicalChunks.current.has(chunkHash)) {
          receivedTechnicalChunks.current.add(chunkHash)
          currentTechnicalRCA.current += data.chunk
          setTechnicalReport(currentTechnicalRCA.current)
          setGeneratingTechnical(false) // Remove loading as soon as first chunk arrives
          console.log('📝 Updated technical report length:', currentTechnicalRCA.current.length)
        } else {
          console.log('📝 Skipping duplicate technical chunk:', chunkHash)
        }
      } else if (data.content) {
        // Handle complete content updates - replace entire content
        console.log('📝 Setting complete technical content')
        currentTechnicalRCA.current = data.content
        setTechnicalReport(data.content)
        setGeneratingTechnical(false)
        // Start customer summary generation after technical is complete
        setGeneratingCustomer(true)
        // Clear chunk tracking when setting complete content
        receivedTechnicalChunks.current.clear()
      }
    } else if (data.type === 'customer') {
      if (data.chunk) {
        console.log('👥 Adding customer chunk:', data.chunk)
        // Create a unique hash for the chunk to prevent duplication
        const chunkHash = `${data.chunk.slice(0, 50)}_${data.chunk.length}`
        
        if (!receivedCustomerChunks.current.has(chunkHash)) {
          receivedCustomerChunks.current.add(chunkHash)
          currentCustomerSummary.current += data.chunk
          setCustomerSummary(currentCustomerSummary.current)
          setGeneratingCustomer(false) // Remove loading as soon as first chunk arrives
          console.log('👥 Updated customer summary length:', currentCustomerSummary.current.length)
        } else {
          console.log('👥 Skipping duplicate customer chunk:', chunkHash)
        }
      } else if (data.content) {
        // Handle complete content updates - replace entire content
        console.log('👥 Setting complete customer content')
        currentCustomerSummary.current = data.content
        setCustomerSummary(data.content)
        setGeneratingCustomer(false)
        // Clear chunk tracking when setting complete content
        receivedCustomerChunks.current.clear()
      }
    }
    
    if (data.progress) {
      console.log('📊 Setting progress:', data.progress)
      setProgress(data.progress)
    }
  }

  const handleComplete = (data) => {
    setStreamingProgress('RCA generation completed successfully!')
    setStreaming(false)
    setProgress(100)
    setGeneratingTechnical(false)
    setGeneratingCustomer(false) // Ensure both are set to false on completion
    
    // Clear chunk tracking on completion
    receivedTechnicalChunks.current.clear()
    receivedCustomerChunks.current.clear()
    
    console.log('Complete RCA data:', data)
  }

  const handleError = (data) => {
    setStreamingError(data.error)
    setStreaming(false)
    setWebsocketConnected(false)
  }

  const handleDisconnect = () => {
    setWebsocketConnected(false)
    setSocketId(null)
    console.log('Disconnected from WebSocket server')
  }

  const updateProgress = (stage) => {
    const stages = ['starting', 'technical_rca', 'customer_summary']
    const currentIndex = stages.indexOf(stage)
    // More granular progress updates for better UX
    let progressValue = 0
    switch (stage) {
      case 'starting':
        progressValue = 15
        break
      case 'technical_rca':
        progressValue = 75  // Technical report in progress
        break
      case 'customer_summary':
        progressValue = 100  // Customer summary in progress
        break
      default:
        progressValue = ((currentIndex + 1) / stages.length) * 100
    }
    setProgress(progressValue)
  }

  // WebSocket-based RCA generation using websocketService
  const generateRCA = async () => {
    console.log('🚀 generateRCA called')
    console.log('🔍 WebSocket service status:', websocketService.getConnectionStatus())
    
    // Reset the loaded from database flag since we're generating new content
    setIsLoadedFromDatabase(false)
    
    // Clear any previous errors
    setStreamingError(null)
    
    // Ensure WebSocket is connected before proceeding
    if (!websocketService.getConnectionStatus()) {
      console.log('🔄 WebSocket not connected, establishing connection...')
      setStreamingProgress('Connecting to server...')
      try {
        await connectWebSocket()
        // Wait a bit for connection to be fully established
        await new Promise(resolve => setTimeout(resolve, 500))
      } catch (error) {
        console.error('❌ Failed to connect WebSocket:', error)
        setStreamingError('Failed to connect to server. Please try again.')
        return
      }
    }
    
    // Verify connection after potential connect attempt
    if (!websocketService.getConnectionStatus()) {
      console.error('❌ WebSocket connection failed')
      setStreamingError('Unable to establish server connection. Please try again.')
      return
    }
    
    console.log('✅ WebSocket verified connected, proceeding with RCA generation')

    const ticketDataPayload = {
      ticket_id: ticketData?.ticket_id || 'INC0001234',
      short_description: ticketData?.short_description || 'System outage affecting multiple users',
      category: ticketData?.category || 'Infrastructure',
      priority: ticketData?.priority || 'High',
      source: ticketData?.source || 'ServiceNow'
    }

    const rcaFieldsPayload = {
      problem: stepData.problem_step1 || 'System outage due to connectivity issues',
      timeline: stepData.timeline_step2 || 'Issue reported at 2PM, resolved at 4PM',
      impact: stepData.impact_step3 || 'Multiple users affected, business operations disrupted',
      rootCause: stepData.root_cause_step4 || 'Hardware failure in network infrastructure',
      correctiveActions: stepData.corrective_actions_step5 || 'Replaced faulty hardware, implemented monitoring'
    }

    // Clear previous results
    currentTechnicalRCA.current = ''
    currentCustomerSummary.current = ''
    setTechnicalReport('')
    setCustomerSummary('')
    
    // Clear chunk tracking
    receivedTechnicalChunks.current.clear()
    receivedCustomerChunks.current.clear()
    
    setStreaming(true)
    setProgress(0)
    setStreamingError(null)
    setGeneratingTechnical(true)
    // Don't set generatingCustomer to true yet - wait for technical to complete
    setGeneratingCustomer(false)

    try {
      const data = await rcaService.streamRCAGeneration({
        ticketData: ticketDataPayload,
        rcaFields: rcaFieldsPayload,
        socketId: websocketService.getSocket()?.id
      })

      console.log('📡 API Response data:', data)
      
      if (data.success) {
        setStreamingProgress('Streaming RCA generation started')
        console.log('✅ Streaming started successfully')
      } else {
        setStreamingError(`Error: ${data.error}`)
        setStreaming(false)
        console.error('❌ API returned error:', data.error)
      }
    } catch (error) {
      console.error('❌ API call failed:', error)
      setStreamingError(`Network error: ${error.message}`)
      setStreaming(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      // First, save the RCA report to the resolved ticket
      const reportData = {
        rcaReport: technicalReport,
        customerFriSummery: customerSummary,
      }
      
      console.log('💾 Saving RCA report to MongoDB:', reportData)
      
      try {
        const saveResponse = await knowledgeBaseService.updateRCAReport(
          ticketData?.ticket_id || ticketId, 
          reportData
        )
        console.log('✅ RCA report saved successfully:', saveResponse)
        
        // Update resolved ticket data with the saved report
        if (saveResponse.success) {
          setResolvedTicketData(saveResponse.ticket)
        }
        
      } catch (saveError) {
        console.error('❌ Failed to save RCA report:', saveError)
        setError('Failed to save RCA report to database')
        setSaving(false)
        return
      }
      
      // Show Knowledge Base creation modal
      setSaving(false)
      setShowKBModal(true)
      
    } catch (err) {
      console.error('❌ Error in handleSave:', err)
      setError('Failed to save reports')
      setSaving(false)
    }
  }

  const handleCreateKnowledgeBase = async () => {
    try {
      setCreatingKB(true)
      
      // Get the latest resolved ticket data or use current ticket data
      const currentTicketData = resolvedTicketData || ticketData
      
      if (!currentTicketData) {
        throw new Error('No ticket data available for knowledge base creation')
      }
      
      // Prepare knowledge base data according to the API specification
      const kbData = {
        ticketId: currentTicketData.ticket_id,
        category: currentTicketData.category || 'General',
        subcategory: currentTicketData.subcategory || '',
        shortDescription: currentTicketData.short_description || '',
        description: currentTicketData.description || currentTicketData.short_description || '',
        stepEntries: []
      }
      
      // Map resolution steps to knowledge base step entries
      const resolutionSteps = currentTicketData.resolution_steps || {}
      
      // Problem Statement
      if (resolutionSteps.problem_statement) {
        kbData.stepEntries.push({
          step_name: 'problem_statement',
          step_outcome: resolutionSteps.problem_statement.problemStatement || stepData.problem_step1 || ''
        })
      }
      
      // Impact Assessment
      if (resolutionSteps.impact_analysis) {
        const impacts = resolutionSteps.impact_analysis.impacts || []
        const impactSummary = impacts.length > 0 ? impacts.join(', ') : stepData.impact_step3 || ''
        kbData.stepEntries.push({
          step_name: 'impact_assessment',
          step_outcome: impactSummary
        })
      }
      
      // Root Cause
      if (resolutionSteps.root_cause) {
        kbData.stepEntries.push({
          step_name: 'root_cause',
          step_outcome: resolutionSteps.root_cause.analysis || stepData.root_cause_step4 || ''
        })
      }
      
      // Solution (Corrective Actions)
      if (resolutionSteps.corrective_actions) {
        const stepsToResolve = resolutionSteps.corrective_actions.stepsToResolve || []
        const solutionSummary = stepsToResolve.length > 0 
          ? stepsToResolve.map(step => `${step.title}: ${step.description}`).join('; ')
          : resolutionSteps.corrective_actions.shortDes || stepData.corrective_actions_step5 || ''
        
        kbData.stepEntries.push({
          step_name: 'solution',
          step_outcome: solutionSummary
        })
      }
      
      // Resolution (RCA Report)
      if (resolutionSteps.rca_report || (technicalReport && customerSummary)) {
        const resolutionOutcome = resolutionSteps.rca_report?.customerFriSummery || customerSummary || 
                                 resolutionSteps.rca_report?.rcaReport || technicalReport || ''
        
        kbData.stepEntries.push({
          step_name: 'resolution',
          step_outcome: resolutionOutcome
        })
      }
      
      console.log('📚 Creating Knowledge Base with data:', kbData)
      
      const kbResponse = await knowledgeBaseService.createKnowledgeBase(kbData)
      console.log('✅ Knowledge Base created successfully:', kbResponse)
      
      // Close modal and show success message
      setShowKBModal(false)
      alert('Knowledge Base entry created successfully! This solution is now available for future reference.')
      
    } catch (error) {
      console.error('❌ Failed to create Knowledge Base:', error)
      alert(`Failed to create Knowledge Base: ${error.message}`)
    } finally {
      setCreatingKB(false)
    }
  }

  const handleKBModalCancel = () => {
    setShowKBModal(false)
    // Show a simple success message for just saving the RCA report
    alert('RCA reports saved successfully!')
  }

  const handleUpdateTicket = async () => {
    const resolveResponse = await ticketService.resolveTicket({
      rootCause: customerSummary,
      ticket: ticketData
    })
    
    console.log('Ticket resolved successfully:', resolveResponse)
    
    // Show success message and navigate
    alert('RCA completed successfully! Ticket has been resolved.')
  }

  const handleBack = () => {
    navigate(-1) // Go back to previous page
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-lg shadow-md">
          <FiAlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={handleBack} variant="outline" size="sm">
            <FiArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-1">
      <div className="max-w-6xl mx-auto">
        {/* Compact Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-all"
              >
                <FiArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">RCA Completion</h1>
                <p className="text-xs text-gray-500 mt-0.5">Generate and review comprehensive reports</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="inline-flex bg-white rounded-lg shadow-sm p-1 border border-gray-200">
                <button
                  onClick={() => setViewMode('technical')}
                  className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-md transition-all ${
                    viewMode === 'technical'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <FiFileText className="w-3.5 h-3.5" />
                  <span>Technical</span>
                </button>
                <button
                  onClick={() => setViewMode('customer')}
                  className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-md transition-all ${
                    viewMode === 'customer'
                      ? 'bg-green-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                  }`}
                >
                  <FiUsers className="w-3.5 h-3.5" />
                  <span>Customer</span>
                </button>
                <button
                  onClick={() => setViewMode('both')}
                  className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-md transition-all ${
                    viewMode === 'both'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  <FiFileText className="w-3.5 h-3.5" />
                  <span>Both</span>
                </button>
              </div>

              <button
                onClick={generateRCA}
                disabled={streaming || autoTriggering}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-all shadow-sm"
              >
                {streaming || autoTriggering ? (
                  <>
                    <FiLoader className="w-4 h-4 animate-spin" />
                    <span>{autoTriggering ? 'Initializing...' : 'Generating...'}</span>
                  </>
                ) : (
                  <>
                    <FiPlay className="w-4 h-4" />
                    <span>Regenerate</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Auto-triggering Status */}
        {autoTriggering && (
          <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
            <div className="flex items-center justify-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <FiLoader className="w-6 h-6 text-blue-600 animate-spin" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full animate-ping"></div>
              </div>
              <div>
                <h3 className="text-base font-semibold text-blue-900">Initializing AI Analysis</h3>
                <p className="text-sm text-blue-700">Preparing comprehensive analysis...</p>
              </div>
            </div>
          </div>
        )}

        {/* Existing RCA Report Loaded Status */}
        {/* {isLoadedFromDatabase && (technicalReport || customerSummary) && !autoTriggering && !streaming && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <FiDatabase className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-green-900">Existing RCA Report Loaded</h3>
                
              </div>
            </div>
          </div>
        )} */}

        {/* Reports Layout */}
        <div className={`grid gap-4 ${viewMode === 'both' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
          {/* Technical RCA Report */}
          {(viewMode === 'technical' || viewMode === 'both') && (
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader className="pb-3 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                      <FiFileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Technical RCA Report</h3>
                      <p className="text-xs text-gray-500">Detailed analysis for internal use</p>
                    </div>



                  </div>
                  <div className="flex items-center gap-2">
                    {generatingTechnical && (
                      <Badge className="bg-blue-50 text-blue-700 text-xs px-2 py-1 font-medium border border-blue-200">
                        <FiLoader className="w-3 h-3 mr-1 animate-spin" />
                        Generating
                      </Badge>
                    )}
                    {technicalReport && !generatingTechnical && (
                      <Badge className="bg-green-50 text-green-700 text-xs px-2 py-1 font-medium border border-green-200">
                        <FiCheckCircle className="w-3 h-3 mr-1" />
                        Complete
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-1">
                <div className="relative">
                  <FormattedReport
                    value={technicalReport}
                    placeholder={generatingTechnical ? "Generating technical analysis..." : "Technical RCA report will be generated here..."}
                    streaming={streaming}
                    generating={generatingTechnical}
                    streamingProgress={streamingProgress}
                    type="technical"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Customer-Friendly Summary */}
          {(viewMode === 'customer' || viewMode === 'both') && (
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader className="pb-3 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                      <FiUsers className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Customer-Friendly Summary</h3>
                      <p className="text-xs text-gray-500">Simplified for customer communication</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {generatingCustomer && (
                      <Badge className="bg-green-50 text-green-700 text-xs px-2 py-1 font-medium border border-green-200">
                        <FiLoader className="w-3 h-3 mr-1 animate-spin" />
                        Generating
                      </Badge>
                    )}
                    {customerSummary && !generatingCustomer && (
                      <Badge className="bg-green-50 text-green-700 text-xs px-2 py-1 font-medium border border-green-200">
                        <FiCheckCircle className="w-3 h-3 mr-1" />
                        Complete
                      </Badge>
                    )}
                    {!generatingCustomer && !customerSummary && generatingTechnical && (
                      <Badge className="bg-yellow-50 text-yellow-700 text-xs px-2 py-1 font-medium border border-yellow-200">
                        <FiClock className="w-3 h-3 mr-1" />
                        Queued
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="relative">
                  <FormattedReport
                    value={customerSummary}
                    placeholder={
                      generatingCustomer
                        ? "Generating customer-friendly summary..."
                        : generatingTechnical
                          ? "Waiting for technical analysis..."
                          : "Customer-friendly summary will be generated here..."
                    }
                    streaming={streaming}
                    generating={generatingCustomer}
                    streamingProgress={streamingProgress}
                    type="customer"
                    waitingFor={generatingTechnical && !generatingCustomer ? "technical" : null}
                    otherReportGenerating={generatingTechnical}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex flex-col sm:flex-row justify-end items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving || streaming || (!technicalReport && !customerSummary)}
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-all shadow-sm"
          >
            <FiSave className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save RCA'}</span>
          </button>
          <button
            onClick={handleUpdateTicket}
            disabled={saving || streaming || (!technicalReport && !customerSummary)}
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-all shadow-sm border border-blue-700"
          >
            <span>Update {ticketData?.source || 'ServiceNow'}</span>
          </button>
        </div>

        {/* Knowledge Base Modal */}
        <KnowledgeBaseModal
          open={showKBModal}
          onOpenChange={setShowKBModal}
          onConfirm={handleCreateKnowledgeBase}
          onCancel={handleKBModalCancel}
          isCreating={creatingKB}
          ticketData={ticketData}
        />
      </div>
    </div>
  )
}

export default RCACompletion