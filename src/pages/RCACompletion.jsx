import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/Button'
import { Textarea } from '../components/ui/Textarea'
import { StreamingTextarea } from '../components/ui/StreamingTextarea'
import { Badge } from '../components/ui/Badge'
import { Skeleton } from '../components/ui/skeleton'
import { 
  FiFileText, 
  FiUsers, 
  FiSave, 
  FiDownload, 
  FiArrowLeft, 
  FiEdit3,
  FiCheckCircle,
  FiAlertCircle,
  FiLoader,
  FiWifi,
  FiWifiOff,
  FiPlay,
  FiSquare
} from 'react-icons/fi'
import websocketService from '../services/websocketService'
import { rcaService } from '../api'
import { ticketService } from '../api'

const RCACompletion = () => {
  const { id, ticketId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  
  // State for the two textareas
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
  
  // Step data from previous RCA workflow
  const [stepData, setStepData] = useState({
    problem_step1: '',
    timeline_step2: '',
    impact_step3: '',
    root_cause_step4: '',
    corrective_actions_step5: ''
  })

  useEffect(() => {
    // Get data from navigation state or fetch from API
    if (location.state?.ticketData) {
      setTicketData(location.state.ticketData)
      setStepData(location.state.stepData || {})
      setLoading(false)
      
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
    } else {
      // Fetch ticket data if not provided
      fetchTicketData()
    }
    
    // Cleanup on unmount
    return () => {
      // Remove direct socket listeners
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
      
      // Disconnect if needed
      websocketService.disconnect()
    }
  }, [location.state, ticketId])

  const fetchTicketData = async () => {
    try {
      setLoading(true)
      // This would be replaced with actual API call
      // const response = await ticketService.getTicket(ticketId)
      // setTicketData(response.data)
      
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
        setLoading(false)
        
        // Connect WebSocket first, then auto-trigger streaming API
        connectWebSocket().then(() => {
          // Add a small delay to ensure WebSocket is fully ready
          setAutoTriggering(true)
          setTimeout(() => {
            console.log('🔧 Auto-triggering RCA generation from fetchTicketData...')
            generateRCA().finally(() => {
              setAutoTriggering(false)
            })
          }, 1000) // 1 second delay
        }).catch((error) => {
          console.error('❌ Failed to connect WebSocket:', error)
          setStreamingError('Failed to connect to WebSocket server')
          setAutoTriggering(false)
        })
      }, 1000)
    } catch (err) {
      setError('Failed to load ticket data')
      setLoading(false)
    }
  }

  const connectWebSocket = async () => {
    try {
      await websocketService.connect()
      setWebsocketConnected(true)
      setSocketId(websocketService.getSocket()?.id || null)
      setStreamingError(null)
      console.log('✅ Connected to WebSocket server:', websocketService.getSocket()?.id)
      
      // Set up event listeners
      console.log('🔧 Setting up event listeners...')
      
      // Get the raw socket to listen for RCA events directly
      const socket = websocketService.getSocket()
      if (socket) {
        console.log('🔧 Setting up direct Socket.IO listeners for RCA events...')
        
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
    setGeneratingCustomer(false)
    
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
    const progress = ((currentIndex + 1) / stages.length) * 100
    setProgress(progress)
  }

  // Original streaming API call (restored and made robust)
  const callStreamingAPI = async (ticketData, stepData) => {
    try {
      setStreaming(true)
      setStreamingError(null)
      setStreamingProgress('Initializing RCA report generation...')
      
      // Generate WebSocket socket ID (in real implementation, this would come from WebSocket connection)
      const socketId = `socket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Prepare the request payload
      const requestPayload = {
        ticketData: {
          ticket_id: ticketData.ticket_id || 'INC0001234',
          short_description: ticketData.short_description || 'System outage affecting multiple users',
          category: ticketData.category || 'Infrastructure',
          priority: ticketData.priority || 'High',
          source: ticketData.source || 'ServiceNow'
        },
        rcaFields: {
          problem: stepData.problem_step1 || 'System outage due to connectivity issues',
          timeline: stepData.timeline_step2 || 'Issue reported at 2PM, resolved at 4PM',
          impact: stepData.impact_step3 || 'Multiple users affected, business operations disrupted',
          rootCause: stepData.root_cause_step4 || 'Hardware failure in network infrastructure',
          correctiveActions: stepData.corrective_actions_step5 || 'Replaced faulty hardware, implemented monitoring'
        }
      }
      
      console.log('Calling streaming API with payload:', requestPayload)
      
      // Make the API call
      const response = await fetch('http://localhost:8081/api/v1/rca/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || 'YOUR_AUTH_TOKEN'}`,
          'x-socket-id': socketId
        },
        body: JSON.stringify(requestPayload)
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      setStreamingProgress('Connected to streaming API, processing RCA data...')
      setWebsocketConnected(true)
      
      // Handle streaming response
      const reader = response.body?.getReader()
      if (reader) {
        const decoder = new TextDecoder()
        let buffer = ''
        
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''
          
          for (const line of lines) {
            if (line.trim()) {
              try {
                const data = JSON.parse(line)
                handleStreamingData(data)
              } catch (e) {
                console.log('Non-JSON streaming data:', line)
                setStreamingProgress(line)
              }
            }
          }
        }
      } else {
        // Fallback for non-streaming response
        const result = await response.json()
        handleStreamingData(result)
      }
      
    } catch (err) {
      console.error('Streaming API error:', err)
      setStreamingError(err.message)
      setWebsocketConnected(false)
    } finally {
      setStreaming(false)
      setStreamingProgress('')
    }
  }

  const handleStreamingData = (data) => {
    console.log('Received streaming data:', data)
    
    if (data.type === 'progress') {
      setStreamingProgress(data.message)
    } else if (data.type === 'technical_report') {
      setTechnicalReport(data.content)
      setStreamingProgress('Technical report generated successfully!')
    } else if (data.type === 'customer_summary') {
      setCustomerSummary(data.content)
      setStreamingProgress('Customer summary generated successfully!')
    } else if (data.type === 'complete') {
      setStreamingProgress('RCA reports generation completed!')
      setWebsocketConnected(false)
    } else if (data.error) {
      setStreamingError(data.error)
      setWebsocketConnected(false)
    }
  }

  // WebSocket-based RCA generation using websocketService
  const generateRCA = async () => {
    console.log('🚀 generateRCA called')
    console.log('🔍 WebSocket connected:', websocketConnected)
    console.log('🔍 WebSocket service status:', websocketService.getConnectionStatus())
    console.log('🔍 Socket instance:', websocketService.getSocket())
    
    // Check if WebSocket is connected, if not try to reconnect
    if (!websocketConnected || !websocketService.getConnectionStatus()) {
      console.log('🔄 WebSocket not connected, attempting to reconnect...')
      try {
        await connectWebSocket()
        // Wait a bit more for connection to be fully established
        await new Promise(resolve => setTimeout(resolve, 500))
      } catch (error) {
        console.error('❌ Failed to reconnect WebSocket:', error)
        setStreamingError('Failed to connect to WebSocket server')
        return
      }
    }
    
    // Double check connection after potential reconnect
    if (!websocketService.getConnectionStatus()) {
      console.error('❌ WebSocket still not connected after reconnect attempt')
      setStreamingError('WebSocket connection failed')
      return
    }

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
    setGeneratingCustomer(true)

    try {
      console.log('📡 Making API call to /rca/stream via rcaService')
      console.log('📡 Socket ID:', websocketService.getSocket()?.id)
      console.log('📡 Payload:', { ticketData: ticketDataPayload, rcaFields: rcaFieldsPayload })
      
      // Make API call using rcaService
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
      
      // Save both reports
      const reportData = {
        ticketId: ticketData?._id,
        technicalReport,
        customerSummary,
        status: 'Completed'
      }
      
      // This would be replaced with actual API call
      // await ticketService.saveRCAReports(reportData)
      
      console.log('Saving RCA reports:', reportData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      alert('RCA reports saved successfully!')
    } catch (err) {
      setError('Failed to save reports')
    } finally {
      setSaving(false)
    }
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
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={handleBack} variant="outline">
            <FiArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className='flex items-center space-x-4'>
            <Button onClick={handleBack} variant="outline">
                <FiArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">RCA Completion</h1>
              <p className="text-gray-600">Generate technical report and customer-friendly summary</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              
              <Button 
                onClick={handleSave} 
                disabled={saving || (!technicalReport && !customerSummary)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <FiSave className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Reports'}
              </Button>
            </div>
          </div>
        </div>

        {/* Ticket Info */}
        {ticketData && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">
                  {ticketData.short_description}
                </h2>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span><strong>Ticket ID:</strong> {ticketData.ticket_id}</span>
                  <span><strong>Status:</strong> {ticketData.status}</span>
                  <span><strong>Priority:</strong> {ticketData.priority}</span>
                  <span><strong>Category:</strong> {ticketData.category}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={`${
                  ticketData.priority === 'High' ? 'bg-red-100 text-red-800' :
                  ticketData.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {ticketData.priority} Priority
                </Badge>
                <Badge className="bg-blue-100 text-blue-800">
                  {ticketData.status}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Auto-triggering Status */}
        {autoTriggering && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-center">
              <FiLoader className="w-5 h-5 text-blue-500 animate-spin mr-3" />
              <p className="text-blue-700 font-medium">Auto-triggering RCA generation...</p>
            </div>
          </div>
        )}

        {/* Streaming Progress */}
        {streaming && streamingProgress && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FiLoader className="w-5 h-5 text-green-500 animate-spin mr-3" />
                <p className="text-green-700 font-medium">{streamingProgress}</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-green-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <span className="text-xs text-green-600">{Math.round(progress)}%</span>
              </div>
            </div>
          </div>
        )}

        {/* WebSocket Connection Status */}
        <div className="mb-6 flex justify-end">
          <div className={`flex items-center px-3 py-2 rounded-full text-sm ${
            websocketConnected 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {websocketConnected ? (
              <>
                <FiWifi className="w-4 h-4 mr-2" />
                WebSocket Connected
              </>
            ) : (
              <>
                <FiWifiOff className="w-4 h-4 mr-2" />
                WebSocket Disconnected
              </>
            )}
          </div>
        </div>

        {/* Regenerate Button */}
        {ticketData && (
          <div className="mb-6 flex justify-end">
            <Button 
              onClick={generateRCA}
              disabled={streaming || !websocketConnected || autoTriggering}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8"
            >
              {streaming ? (
                <>
                  <FiLoader className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : autoTriggering ? (
                <>
                  <FiLoader className="w-4 h-4 mr-2 animate-spin" />
                  Auto-triggering...
                </>
              ) : (
                <>
                  <FiPlay className="w-4 h-4 mr-2" />
                  Regenerate RCA Reports
                </>
              )}
            </Button>
          </div>
        )}



        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Technical RCA Report */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
                <FiFileText className="w-5 h-5 mr-2 text-blue-500" />
                Technical RCA Report
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Detailed technical analysis for internal use
                </p>
              </div>
                    <StreamingTextarea
                      value={technicalReport}
                      onChange={(e) => setTechnicalReport(e.target.value)}
                      placeholder="Technical RCA report will be generated here..."
                      rows={20}
                      className="font-mono"
                      streaming={streaming}
                      generating={generatingTechnical}
                      streamingProgress={streamingProgress}
                      type="technical"
                    />
            </CardContent>
          </Card>

          {/* Customer-Friendly Summary */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
                <FiUsers className="w-5 h-5 mr-2 text-green-500" />
                Customer-Friendly Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Simplified summary for customer communication
                </p>
              </div>
                    <StreamingTextarea
                      value={customerSummary}
                      onChange={(e) => setCustomerSummary(e.target.value)}
                      placeholder="Customer-friendly summary will be generated here..."
                      rows={20}
                      streaming={streaming}
                      generating={generatingCustomer}
                      streamingProgress={streamingProgress}
                      type="customer"
                    />
            </CardContent>
          </Card>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex justify-center gap-8">
          <div className="flex items-center space-x-4">
            <Button 
              onClick={handleSave} 
              disabled={saving || streaming || (!technicalReport && !customerSummary)}
              className="bg-green-600 hover:bg-green-700 text-white px-8"
            >
              <FiSave className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save & Complete RCA'}
            </Button>
          </div>
          <div>
            <Button 
            onClick={handleUpdateTicket} 
            variant="outline" 
            className='bg-blue-500 hover:bg-blue-600 text-white px-8'
            disabled={saving || streaming || (!technicalReport && !customerSummary)}
            >
              Update {ticketData?.source} Ticket
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RCACompletion
