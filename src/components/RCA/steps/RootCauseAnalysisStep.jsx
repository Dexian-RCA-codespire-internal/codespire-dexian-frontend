




import React, { useState, useEffect } from 'react'
import { IoIosColorWand, IoMdAdd, IoMdTrash, IoMdCreate, IoMdCheckmark, IoMdClose, IoIosArrowDown, IoIosArrowUp } from "react-icons/io"
import { BsStars, BsClock, BsExclamationTriangle, BsFileText, BsRobot, BsDatabase } from "react-icons/bs"
import { FiUsers, FiServer, FiDatabase, FiGlobe, FiLoader, FiChevronDown, FiChevronRight, FiFileText } from "react-icons/fi"
import { HiSparkles, HiLightBulb } from "react-icons/hi"
import { MdSource, MdSmartToy } from "react-icons/md"
import { aiService } from '../../../api/services/aiService'
import { Textarea } from '../../../components/ui/Textarea'
import { useTextEnhancement } from '../../../hooks/useTextEnhancement'
import EnhancementModal from '../../../components/ui/EnhancementModal'

const RootCauseAnalysisStep = ({ 
  ticketData = null, 
  response = '', 
  onResponseChange = () => {},
  isEnhancingRootCause = false,
  setIsEnhancingRootCause = () => {},
  handleEnhanceText = () => {},
  stepData = {},
  setStepData = () => {},
  similarCases = null,
  rcaResolvedData = null,
  hasExistingRcaData = false,
  saveStepToDatabase = null,
  isLoadingRcaData = false
}) => {
  // Build currentTicket from real data from previous steps and ticketData
  const currentTicket = ticketData ? {
    ...ticketData,
    // Use problem statement from step 1 as enhanced_problem
    enhanced_problem: stepData.rca_workflow_steps?.[0] || ticketData.description || ticketData.short_description || "",
    // Use impact assessment from step 2 as impact
    impact: stepData.rca_workflow_steps?.[1] ? [stepData.rca_workflow_steps[1]] : 
            Array.isArray(ticketData.impact) ? ticketData.impact : 
            ticketData.impact ? [ticketData.impact] : [],
    // Use dropdown values from step 1
    issueType: stepData.issueType || ticketData.category || "Unknown",
    severity: stepData.severity || ticketData.priority || "Medium",
    businessImpactCategory: stepData.businessImpactCategory || "Other",
    // Use impact level and department from step 2
    impactLevel: stepData.impact_level_step2 || "",
    departmentAffected: stepData.department_affected_step2 || ""
  } : {
    category: "Unknown",
    description: "No ticket data available",
    short_description: "No ticket data available",
    enhanced_problem: stepData.rca_workflow_steps?.[0] || "No problem statement available",
    impact: stepData.rca_workflow_steps?.[1] ? [stepData.rca_workflow_steps[1]] : [],
    priority: "Medium",
    urgency: "Medium",
    source: "Unknown"
  }

  // Use real similar cases data from API or fallback to empty array
  const similarTickets = similarCases && similarCases.results ? 
    similarCases.results.map(ticket => ({
      id: ticket.ticket_id || ticket.id || "Unknown",
      short_description: ticket.short_description || ticket.title || "No description",
      category: ticket.category || "Unknown",
      description: ticket.description || ticket.short_description || "No description available",
      priority: ticket.priority || "Medium",
      source: ticket.source || "Unknown",
      confidence_percentage: ticket.confidence_percentage || 0
    })) : []

  const [rootCauses, setRootCauses] = useState([])
  const [collapsedRootCauses, setCollapsedRootCauses] = useState({})
  const [newRootCause, setNewRootCause] = useState({
    rootCause: "",
    analysis: "",
    category: "Configuration",
    confidence: 50,
    severity: "Medium"
  })
  const [showAddForm, setShowAddForm] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState(null)
  const [hasAnalyzed, setHasAnalyzed] = useState(false)
  const [analysisMetadata, setAnalysisMetadata] = useState(null)
  const [editingRootCause, setEditingRootCause] = useState(null)
  const [editFormData, setEditFormData] = useState({
    rootCause: "",
    analysis: ""
  })

  // Enhancement modal state
  const [isEnhancementModalOpen, setIsEnhancementModalOpen] = useState(false)
  const [enhancementOptions, setEnhancementOptions] = useState([])
  const [enhancingField, setEnhancingField] = useState(null) // 'rootCause' or 'analysis'

  // Use the custom hook for text enhancement
  const { enhanceText, isLoading: isEnhancing, error: enhancementError } = useTextEnhancement()

  // Toggle collapse state for root causes
  const toggleRootCause = (id) => {
    setCollapsedRootCauses(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  // Function to analyze root causes using the API
  const analyzeRootCauses = async () => {
    if (isAnalyzing || hasAnalyzed) {
      console.log('Analysis already in progress or completed, skipping...')
      return
    }

    try {
      setIsAnalyzing(true)
      setAnalysisError(null)

      // Build comprehensive request data using real data from previous steps
      const requestData = {
        currentTicket: {
          category: currentTicket.category || "Unknown",
          description: currentTicket.description || currentTicket.short_description || "",
          short_description: currentTicket.short_description || "",
          enhanced_problem: currentTicket.enhanced_problem || currentTicket.description || "",
          impact: Array.isArray(currentTicket.impact) ? currentTicket.impact : 
                  currentTicket.impact ? [currentTicket.impact] : [],
          priority: currentTicket.priority || "Medium",
          urgency: currentTicket.urgency || "Medium",
          // Include additional data from previous steps
          issueType: currentTicket.issueType || "",
          severity: currentTicket.severity || "",
          businessImpactCategory: currentTicket.businessImpactCategory || "",
          impactLevel: currentTicket.impactLevel || "",
          departmentAffected: currentTicket.departmentAffected || "",
          // Include step data for context
          problemStatement: stepData.rca_workflow_steps?.[0] || "",
          impactAssessment: stepData.rca_workflow_steps?.[1] || ""
        },
        similarTickets: similarTickets,
        // Include metadata about the analysis
        analysisContext: {
          hasProblemStatement: !!(stepData.rca_workflow_steps?.[0] && stepData.rca_workflow_steps[0].trim().length > 0),
          hasImpactAssessment: !!(stepData.rca_workflow_steps?.[1] && stepData.rca_workflow_steps[1].trim().length > 0),
          hasSimilarTickets: similarTickets.length > 0,
          stepData: stepData
        }
      }

      console.log('Sending RCA analysis request:', requestData)
      const response = await aiService.rootCauseAnalysis.analyze(requestData)

      if (response.success && response.results) {
        // Transform API response to match our UI format
        const transformedResults = response.results.map((result, index) => ({
          id: result.id || index + 1,
          rootCause: result.rootCause,
          analysis: result.analysis,
          confidence: result.confidence,
          category: getCategoryFromRootCause(result.rootCause),
          severity: getSeverityFromConfidence(result.confidence),
          evidence: result.evidence || []
        }))

        setRootCauses(transformedResults)
        setHasAnalyzed(true)
        
        // Initialize first root cause as uncollapsed, rest as collapsed
        const initialCollapsedState = {}
        transformedResults.forEach((cause, index) => {
          initialCollapsedState[cause.id] = index !== 0 // true means collapsed, false means uncollapsed
        })
        setCollapsedRootCauses(initialCollapsedState)
        
        // Store analysis metadata
        if (response.analysis_metadata) {
          setAnalysisMetadata(response.analysis_metadata)
        }
        
        // Store root cause analysis in stepData for persistence
        const rootCauseAnalysisData = {
          rootCauses: transformedResults,
          analysisMetadata: response.analysis_metadata || null,
          timestamp: new Date().toISOString()
        }
        
        // Prepare analysis text for stepData
        const topRootCause = transformedResults[0] // Get the highest confidence root cause
        const analysisText = topRootCause ? 
          `${topRootCause.rootCause}\n\nAnalysis: ${topRootCause.analysis}\n\nConfidence: ${topRootCause.confidence}%` :
          `Root cause analysis completed with ${transformedResults.length} potential causes identified.`
        
        // Update stepData with root cause analysis and text content
        if (typeof setStepData === 'function') {
          setStepData(prevData => {
            const newStepData = {
              ...prevData,
              rootCauseAnalysis: rootCauseAnalysisData
            }
            
            // Ensure rca_workflow_steps array exists and update step 3 (index 2)
            if (!newStepData.rca_workflow_steps) {
              newStepData.rca_workflow_steps = ['', '', '', '']
            }
            newStepData.rca_workflow_steps[2] = analysisText
            
            return newStepData
          })
          console.log('RootCauseAnalysisStep: Stored root cause analysis in stepData:', rootCauseAnalysisData)
          console.log('RootCauseAnalysisStep: Updated rca_workflow_steps[2]:', analysisText)
        }
        
        // Update the response in the parent component
        if (onResponseChange) {
          onResponseChange(analysisText)
        }
        
        // Save to database immediately if this is the first generation
        if (saveStepToDatabase && !hasExistingRcaData && !rcaResolvedData?.ticket?.resolution_steps?.root_cause?.completed && transformedResults.length > 0) {
          console.log('Saving generated root cause analysis to database...')
          try {
            const saveData = {
              title: topRootCause.rootCause,
              analysis: topRootCause.analysis,
              supportingEvidences: topRootCause.evidence || [],
              confidencePercentage: topRootCause.confidence
            }
            
            await saveStepToDatabase(3, saveData)
            console.log('Root cause analysis saved to database successfully')
            
          } catch (error) {
            console.error('Error saving generated root cause analysis:', error)
          }
        }
      } else {
        throw new Error(response.message || 'Failed to analyze root causes')
      }
    } catch (error) {
      console.error('Error analyzing root causes:', error)
      setAnalysisError(error.message || 'Failed to analyze root causes')
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Helper function to determine category from root cause
  const getCategoryFromRootCause = (rootCause) => {
    const lowerCause = rootCause.toLowerCase()
    if (lowerCause.includes('configuration') || lowerCause.includes('config')) return 'Configuration'
    if (lowerCause.includes('capacity') || lowerCause.includes('buffer') || lowerCause.includes('exhaustion')) return 'Capacity'
    if (lowerCause.includes('network') || lowerCause.includes('routing') || lowerCause.includes('qos')) return 'Infrastructure'
    if (lowerCause.includes('memory') || lowerCause.includes('leak') || lowerCause.includes('code')) return 'Code'
    if (lowerCause.includes('security') || lowerCause.includes('certificate') || lowerCause.includes('ssl')) return 'Security/Configuration'
    return 'Configuration'
  }

  // Helper function to determine severity from confidence
  const getSeverityFromConfidence = (confidence) => {
    if (confidence >= 90) return 'Critical'
    if (confidence >= 80) return 'High'
    if (confidence >= 60) return 'Medium'
    return 'Low'
  }

  // Edit functionality
  const startEditing = (cause) => {
    setEditingRootCause(cause.id)
    setEditFormData({
      rootCause: cause.rootCause,
      analysis: cause.analysis
    })
  }

  const cancelEditing = () => {
    setEditingRootCause(null)
    setEditFormData({
      rootCause: "",
      analysis: ""
    })
  }

  // Enhancement functionality
  const handleEnhanceEditText = async (field) => {
    if (!editFormData[field].trim()) {
      alert(`Please enter some text in the ${field === 'rootCause' ? 'root cause' : 'analysis'} field to enhance.`)
      return
    }

    setEnhancingField(field)
    setIsEnhancementModalOpen(true)

    const reference = `${ticketData?.short_description || ""} ${ticketData?.description || ""}`.trim()
    const result = await enhanceText(editFormData[field], reference)

    if (result && result.enhancedOptions) {
      setEnhancementOptions(result.enhancedOptions)
    } else if (enhancementError) {
      alert(`Failed to enhance text: ${enhancementError}`)
      setIsEnhancementModalOpen(false)
    }
  }

  const handleSelectEnhancement = (enhancedText) => {
    setEditFormData(prev => ({
      ...prev,
      [enhancingField]: enhancedText
    }))
    setIsEnhancementModalOpen(false)
    setEnhancementOptions([])
    setEnhancingField(null)
  }

  const handleCloseEnhancementModal = () => {
    setIsEnhancementModalOpen(false)
    setEnhancementOptions([])
    setEnhancingField(null)
  }

  const saveEditing = async () => {
    if (!editFormData.rootCause.trim() || !editFormData.analysis.trim()) {
      alert('Please fill in both root cause and analysis')
      return
    }

    // Update the root cause in state
    const updatedRootCauses = rootCauses.map(cause =>
      cause.id === editingRootCause
        ? { ...cause, rootCause: editFormData.rootCause, analysis: editFormData.analysis }
        : cause
    )
    
    setRootCauses(updatedRootCauses)

    // Find the edited root cause
    const editedRootCause = updatedRootCauses.find(cause => cause.id === editingRootCause)
    
    // Build analysis text for the edited root cause only (not the top one)
    const analysisText = editedRootCause ? 
      `${editedRootCause.rootCause}\n\nAnalysis: ${editedRootCause.analysis}\n\nConfidence: ${editedRootCause.confidence}%` :
      `Root cause analysis completed with ${updatedRootCauses.length} potential causes identified.`
    
    // Update stepData
    if (typeof setStepData === 'function') {
      setStepData(prevData => {
        const newStepData = {
          ...prevData,
          rootCauseAnalysis: {
            rootCauses: updatedRootCauses,
            analysisMetadata: analysisMetadata || null,
            timestamp: new Date().toISOString()
          }
        }
        
        // Ensure rca_workflow_steps array exists and update step 3 (index 2)
        if (!newStepData.rca_workflow_steps) {
          newStepData.rca_workflow_steps = ['', '', '', '']
        }
        newStepData.rca_workflow_steps[2] = analysisText
        
        return newStepData
      })
      console.log('RootCauseAnalysisStep: Updated root cause analysis in stepData after edit:', {
        rootCauses: updatedRootCauses,
        analysisText
      })
    }
    
    // Update the response in the parent component
    if (onResponseChange) {
      onResponseChange(analysisText)
    }
    
    // Save to database immediately after editing
    if (saveStepToDatabase && editedRootCause) {
      console.log('Saving edited root cause analysis to database...')
      try {
        const saveData = {
          title: editedRootCause.rootCause,
          analysis: editedRootCause.analysis,
          supportingEvidences: editedRootCause.evidence || [],
          confidencePercentage: editedRootCause.confidence
        }
        
        console.log('Save data payload:', saveData)
        await saveStepToDatabase(3, saveData)
        console.log('Edited root cause analysis saved to database successfully')
        
      } catch (error) {
        console.error('Error saving edited root cause analysis:', error)
      }
    }

    cancelEditing()
  }

  // Debug: Log the data being used for analysis
  useEffect(() => {
    console.log('RootCauseAnalysisStep: Data for analysis:', {
      currentTicket: currentTicket,
      stepData: stepData,
      similarTickets: similarTickets,
      hasProblemStatement: !!(stepData.rca_workflow_steps?.[0] && stepData.rca_workflow_steps[0].trim().length > 0),
      hasImpactAssessment: !!(stepData.rca_workflow_steps?.[1] && stepData.rca_workflow_steps[1].trim().length > 0),
      hasSimilarTickets: similarTickets.length > 0
    })
  }, [currentTicket, stepData, similarTickets])

  // Restore root cause analysis data from stepData when component mounts
  useEffect(() => {
    if (stepData?.rootCauseAnalysis) {
      console.log('RootCauseAnalysisStep: Restoring root cause analysis from stepData:', stepData.rootCauseAnalysis)
      setRootCauses(stepData.rootCauseAnalysis.rootCauses || [])
      setAnalysisMetadata(stepData.rootCauseAnalysis.analysisMetadata || null)
      setHasAnalyzed(true)
      
      // Initialize collapse state for restored root causes
      const initialCollapsedState = {}
      if (stepData.rootCauseAnalysis.rootCauses) {
        stepData.rootCauseAnalysis.rootCauses.forEach((cause, index) => {
          initialCollapsedState[cause.id] = index !== 0 // true means collapsed, false means uncollapsed
        })
      }
      setCollapsedRootCauses(initialCollapsedState)
    }
  }, [stepData?.rootCauseAnalysis])

  // Update stepData when response changes manually (to ensure manual edits are captured)
  useEffect(() => {
    if (response && response.trim().length > 0 && typeof setStepData === 'function') {
      setStepData(prevData => {
        const newStepData = { ...prevData }
        
        // Ensure rca_workflow_steps array exists and update step 3 (index 2)
        if (!newStepData.rca_workflow_steps) {
          newStepData.rca_workflow_steps = ['', '', '', '']
        }
        
        // Only update if the response is different from current step data
        if (newStepData.rca_workflow_steps[2] !== response) {
          newStepData.rca_workflow_steps[2] = response
          console.log('RootCauseAnalysisStep: Updated rca_workflow_steps[2] from manual response change:', response)
        }
        
        return newStepData
      })
    }
  }, [response, setStepData])

  // Restore root cause data from existing step data (rca_workflow_steps[2])
  useEffect(() => {
    const existingStepText = stepData.rca_workflow_steps?.[2]
    if (existingStepText && existingStepText.trim().length > 0 && !hasExistingRcaData && !stepData?.rootCauseAnalysis && (!response || response.trim().length === 0)) {
      console.log('RootCauseAnalysisStep: Restoring root cause text from step data:', existingStepText.substring(0, 100) + '...')
      
      // Populate the response text area with existing step text
      onResponseChange(existingStepText)
      
      // Mark as analyzed to prevent auto-analysis
      setHasAnalyzed(true)
      
      console.log('RootCauseAnalysisStep: Restored root cause text from step data')
    }
  }, [stepData.rca_workflow_steps, hasExistingRcaData, stepData?.rootCauseAnalysis, response, onResponseChange])

  // Restore root cause data from existing RCA resolved data
  useEffect(() => {
    console.log('RootCauseAnalysisStep: Checking for RCA resolved data restoration:', {
      hasExistingRcaData,
      hasRcaResolvedData: !!rcaResolvedData,
      rootCauseCompleted: rcaResolvedData?.ticket?.resolution_steps?.root_cause?.completed,
      hasStepDataRootCauseAnalysis: !!stepData?.rootCauseAnalysis,
      currentResponseLength: response?.trim().length || 0
    })

    // Prioritize RCA resolved data over stepData.rootCauseAnalysis
    if (hasExistingRcaData && rcaResolvedData?.ticket?.resolution_steps?.root_cause?.completed) {
      console.log('RootCauseAnalysisStep: Restoring root cause from RCA resolved data:', rcaResolvedData.ticket.resolution_steps.root_cause)

      const rootCauseData = rcaResolvedData.ticket.resolution_steps.root_cause

      // Populate the response text area with the analysis text
      if (rootCauseData.analysis && rootCauseData.analysis.trim()) {
        console.log('RootCauseAnalysisStep: Setting response from RCA resolved data')
        onResponseChange(rootCauseData.analysis)
      }

      // Create root cause object from the resolved data
      const restoredRootCause = {
        id: 1,
        rootCause: rootCauseData.title || 'Root Cause Analysis',
        analysis: rootCauseData.analysis || '',
        category: 'Configuration', // Default category
        confidence: rootCauseData.confidencePercentage || 85,
        severity: 'Medium', // Default severity
        evidence: rootCauseData.supportingEvidences || []
      }

      setRootCauses([restoredRootCause])
      setHasAnalyzed(true)

      // Initialize collapse state
      setCollapsedRootCauses({ 1: false })

      console.log('RootCauseAnalysisStep: Restored root cause data from RCA resolved:', restoredRootCause)
    }
  }, [hasExistingRcaData, rcaResolvedData, onResponseChange])

  // Trigger analysis when component mounts (only if no existing data)
  useEffect(() => {
    // Don't proceed if we're still loading ticket data or RCA resolved data
    if (!ticketData || isLoadingRcaData) {
      console.log('RootCauseAnalysisStep: Waiting for data to load...', {
        hasTicketData: !!ticketData,
        isLoadingRcaData
      });
      return;
    }
    
    // Check if RCA resolved data already has root cause analysis
    const hasExistingRcaRootCauseData = hasExistingRcaData && 
      rcaResolvedData?.ticket?.resolution_steps?.root_cause?.completed
    
    // Check if there's existing root cause text in step data
    const hasExistingStepData = stepData.rca_workflow_steps?.[2] && stepData.rca_workflow_steps[2].trim().length > 0
    
    // Check if we have root cause analysis data
    const hasExistingAnalysisData = !!stepData?.rootCauseAnalysis
    
    // Skip analysis if we have any existing data
    if (hasExistingRcaRootCauseData || hasExistingStepData || hasExistingAnalysisData || hasAnalyzed) {
      console.log('RootCauseAnalysisStep: Skipping analysis - existing data found:', {
        hasExistingRcaRootCauseData,
        hasExistingStepData,
        hasExistingAnalysisData,
        hasAnalyzed
      });
      return
    }
    
    // Only proceed with analysis if we have ticket data and no existing analysis
    if (currentTicket && !isAnalyzing) {
      console.log('RootCauseAnalysisStep: Starting auto-analysis with ticket data available');
      // Auto-analyze after a short delay to show the loading state
      setTimeout(() => {
        analyzeRootCauses()
      }, 500)
    }
  }, [stepData?.rootCauseAnalysis, stepData?.rca_workflow_steps, hasExistingRcaData, rcaResolvedData, ticketData, hasAnalyzed, isAnalyzing, isLoadingRcaData, currentTicket])

  const addRootCause = () => {
    if (!newRootCause.rootCause.trim() || !newRootCause.analysis.trim()) {
      alert('Please fill in both root cause and analysis')
      return
    }

    const newCause = {
      id: Date.now(),
      ...newRootCause,
      evidence: [],
      createdAt: new Date().toISOString()
    }

    setRootCauses([...rootCauses, newCause])
    
    // Set the new root cause as collapsed by default
    setCollapsedRootCauses(prev => ({
      ...prev,
      [newCause.id]: true // true means collapsed
    }))
    
    setNewRootCause({
      rootCause: "",
      analysis: "",
      category: "Configuration",
      confidence: 50,
      severity: "Medium"
    })
    setShowAddForm(false)
  }

  const deleteRootCause = (id) => {
    setRootCauses(rootCauses.filter(cause => cause.id !== id))
    // Remove from collapsed state as well
    setCollapsedRootCauses(prev => {
      const newState = { ...prev }
      delete newState[id]
      return newState
    })
  }

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getConfidenceColor = (confidence) => {
    const confidenceNum = typeof confidence === 'number' ? confidence : parseInt(confidence) || 0
    if (confidenceNum >= 80) return 'text-green-700 bg-green-100 border-green-300'
    if (confidenceNum >= 60) return 'text-yellow-700 bg-yellow-100 border-yellow-300'
    return 'text-red-700 bg-red-100 border-red-300'
  }

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'text-red-700 bg-red-100 border-red-300'
      case 'high': return 'text-orange-700 bg-orange-100 border-orange-300'
      case 'medium': return 'text-yellow-700 bg-yellow-100 border-yellow-300'
      case 'low': return 'text-blue-700 bg-blue-100 border-blue-300'
      default: return 'text-gray-700 bg-gray-100 border-gray-300'
    }
  }

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'database': return <FiDatabase className="w-4 h-4" />
      case 'network infrastructure': return <FiGlobe className="w-4 h-4" />
      case 'api gateway': return <FiServer className="w-4 h-4" />
      default: return <BsFileText className="w-4 h-4" />
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-1">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
   
          <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                <BsStars className="w-3 h-3 text-white" />
              </div>
              <span className="text-xs font-semibold text-gray-900 tracking-wide">AI Guidance</span>
            </div>
            <div className="text-xs text-gray-700 line-clamp-4 leading-relaxed font-medium">
              Have you previously set up alternative recovery methods like a recovery email or phone number for this account?
            </div>
          </div>

          <div className="p-">
            {/* Loading State */}
            {isAnalyzing && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <HiSparkles className="w-6 h-6 text-purple-600 animate-pulse" />
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-gray-600 font-semibold">AI is analyzing root causes...</p>
                  <p className="text-sm text-gray-500 font-medium">This may take a few moments</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {analysisError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <BsExclamationTriangle className="w-5 h-5 text-red-600" />
                  <span className="font-semibold text-red-800">Analysis Error</span>
                </div>
                <p className="text-sm text-red-700 mb-3 font-medium">{analysisError}</p>
                <button
                  onClick={analyzeRootCauses}
                  className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                >
                  Retry Analysis
                </button>
              </div>
            )}

            {/* Root Causes List - Collapsible Cards */}
            <div className="space-y-4">
              {rootCauses.map((cause, index) => (
                <div key={cause.id} className="border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
                  {/* Root Cause Header - Always Visible */}
                  <div 
                    className={`p-4 ${editingRootCause === cause.id ? '' : 'cursor-pointer hover:bg-gray-50'} transition-colors`}
                    onClick={() => editingRootCause !== cause.id && toggleRootCause(cause.id)}
                  >
                    <div className="flex items-start gap-4">
                      {/* AI Badge */}
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-semibold border border-purple-200">
                        {index + 1}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            {editingRootCause === cause.id ? (
                              <div className="relative mb-2">
                                <input
                                  type="text"
                                  value={editFormData.rootCause}
                                  onChange={(e) => setEditFormData(prev => ({ ...prev, rootCause: e.target.value }))}
                                  className="w-full pr-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base font-semibold shadow-sm"
                                  placeholder="Enter root cause title..."
                                  autoFocus
                                />
                       
                              </div>
                            ) : (
                              <h3 className="text-gray-900 text-base font-semibold leading-tight mb-2 pr-4 tracking-wide">
                                {cause.rootCause}
                              </h3>
                            )}
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getConfidenceColor(cause.confidence)}`}>
                                {cause.confidence}% Confidence
                              </span>
                           
                              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full border border-gray-200">
                                {cause.category}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {editingRootCause !== cause.id && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  startEditing(cause)
                                }}
                                className="p-1.5 text-blue-500 hover:bg-blue-100 rounded transition-colors"
                                title="Edit root cause"
                              >
                                <IoMdCreate className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteRootCause(cause.id)
                              }}
                              className="p-1.5 text-red-500 hover:bg-red-100 rounded transition-colors"
                              title="Delete root cause"
                            >
                              <IoMdTrash className="w-4 h-4" />
                            </button>
                            
                            <div className="text-gray-400">
                              {collapsedRootCauses[cause.id] ? 
                                <FiChevronRight className="w-5 h-5" /> : 
                                <FiChevronDown className="w-5 h-5" />
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Collapsible Content */}
                  {!collapsedRootCauses[cause.id] && (
                    <div className="px-4 pb-4 border-t border-gray-100">
                      <div className="pl-14">
         
                        <h4 className="text-xs font-semibold text-gray-600 mb-2 mt-3 tracking-wide">Analysis:</h4>
                        {editingRootCause === cause.id ? (
                          <div className="relative mb-3">
                            <textarea
                              value={editFormData.analysis}
                              onChange={(e) => setEditFormData(prev => ({ ...prev, analysis: e.target.value }))}
                              rows={4}
                              className="w-full pr-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm leading-relaxed font-medium shadow-sm"
                              placeholder="Provide detailed technical analysis..."
                            />
                            <div className="absolute bottom-2 right-2 flex gap-1">
                              <button
                                onClick={() => handleEnhanceEditText('analysis')}
                                disabled={isEnhancing || !editFormData.analysis.trim()}
                                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-2 py-1 h-auto rounded shadow-sm flex items-center gap-1 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isEnhancing && enhancingField === 'analysis' ? (
                                  <FiLoader className="w-3 h-3 animate-spin" />
                                ) : (
                                  <IoIosColorWand className="w-3 h-3" />
                                )}
                                <span>{isEnhancing && enhancingField === 'analysis' ? 'Enhancing...' : 'Enhance'}</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-700 text-sm leading-relaxed mb-3 font-medium">
                            {cause.analysis}
                          </p>
                        )}
                        
                        {cause.evidence && cause.evidence.length > 0 ? (
                          <div className='mb-3'>
                            <h4 className="text-xs font-semibold text-gray-600 mb-2 tracking-wide">Supporting Evidence:</h4>
                            <div className="space-y-1">
                              {cause.evidence.map((evidence, evidenceIndex) => (
                                <div key={evidenceIndex} className="text-xs text-gray-600 pl-3 border-l-2 border-blue-200 font-medium">
                                  <span className="font-semibold text-blue-700">{evidence.type}:</span> {evidence.finding}
                                  <span className="text-gray-500 ml-2">({evidence.source})</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-xs text-yellow-700 bg-yellow-50 px-2 py-1 rounded font-medium">
                            <BsExclamationTriangle className="w-3 h-3" />
                            <span>No direct evidence - {cause.confidence}% confidence based on analysis</span>
                          </div>
                        )}
                       
                      </div>
                      
                      {/* Edit Mode Buttons */}
                      {editingRootCause === cause.id && (
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                          <button
                            onClick={saveEditing}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                          >
                            <IoMdCheckmark className="w-4 h-4" />
                            Save
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-400 transition-colors shadow-sm"
                          >
                            <IoMdClose className="w-4 h-4" />
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              
              {rootCauses.length === 0 && !isAnalyzing && (
                <div className="text-center py-12 text-gray-500">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BsFileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-lg font-semibold text-gray-600 mb-2">No Root Causes Identified</p>
                  <p className="text-sm text-gray-500 font-medium">Click "Analyze Root Causes" to begin AI-powered analysis</p>
                </div>
              )}

              {/* Add New Root Cause Form */}
              {showAddForm && (
                <div className="mb-6 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 tracking-wide">
                    <HiLightBulb className="w-5 h-5 text-yellow-500" />
                    Add Custom Root Cause Analysis
                  </h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={newRootCause.rootCause}
                      onChange={(e) => setNewRootCause({...newRootCause, rootCause: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium shadow-sm"
                      placeholder="Enter the identified root cause..."
                    />
                    
                    <textarea
                      value={newRootCause.analysis}
                      onChange={(e) => setNewRootCause({...newRootCause, analysis: e.target.value})}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium leading-relaxed shadow-sm"
                      placeholder="Provide detailed technical analysis..."
                    />
                    
                    <div className="flex gap-3">
                      <button
                        onClick={addRootCause}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold shadow-sm"
                      >
                        Add Analysis
                      </button>
                      <button
                        onClick={() => setShowAddForm(false)}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm font-semibold shadow-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Add Root Cause Button */}
            {rootCauses.length > 0 && (
              <div className="mt-6 border-t border-gray-200 pt-4 text-right">
                <button
                  onClick={() => setShowAddForm(v => !v)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm leading-tight
                             text-white bg-gradient-to-r from-green-600 to-emerald-600
                             hover:from-green-700 hover:to-emerald-700
                             focus:outline-none focus:ring-1 focus:ring-green-500"
                  aria-label="Add custom root cause"
                >
                  <IoMdAdd className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
     
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 rounded-t-xl">
              <div className="text-lg font-semibold text-gray-900 flex items-center gap-2 tracking-wide">
                <BsDatabase className="w-5 h-5 text-emerald-600" />
                Similar Tickets
              </div>
              <p className="text-xs px-7 text-gray-600 font-medium">Historical incidents for context</p>
            </div>
            
            <div className="p-6">
              {similarTickets.length > 0 ? (
                <div className="space-y-4">
                  {similarTickets.slice(0, 3).map((ticket) => (
                    <div key={ticket.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors shadow-sm">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(ticket.category)}
                          <span className="text-sm font-semibold text-gray-900 font-mono">{ticket.id}</span>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {ticket.confidence_percentage && (
                            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                              ticket.confidence_percentage >= 90 ? 'bg-green-100 text-green-800' :
                              ticket.confidence_percentage >= 80 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-orange-100 text-orange-800'
                            }`}>
                              {ticket.confidence_percentage}% match
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <h4 className="font-semibold text-gray-800 mb-2 text-sm leading-tight">{ticket.short_description}</h4>
                      <p className="text-xs text-gray-600 mb-3 line-clamp-3 leading-relaxed font-medium">{ticket.description}</p>
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className={`px-2 py-1 rounded-full font-semibold border ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded-full font-medium">
                            {ticket.category}
                          </span>
                          {ticket.source && (
                            <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded-full font-medium">
                              {ticket.source}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BsDatabase className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm font-medium">No similar tickets found</p>
                  <p className="text-xs text-gray-400 mt-1 font-medium">Similar cases will appear here when available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enhancement Modal */}
      <EnhancementModal
        isOpen={isEnhancementModalOpen}
        onClose={handleCloseEnhancementModal}
        originalText={editFormData[enhancingField] || ""}
        onSelectOption={handleSelectEnhancement}
        enhancedOptions={enhancementOptions}
        isLoading={isEnhancing}
        title={`Enhance ${enhancingField === 'rootCause' ? 'Root Cause' : 'Analysis'}`}
      />
    </div>
  )
}

export default RootCauseAnalysisStep