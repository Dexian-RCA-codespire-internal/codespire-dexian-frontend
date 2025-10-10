import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ticketService, aiService, rcaService } from '../api'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Textarea } from '../components/ui/Textarea'
import { Badge } from '../components/ui/Badge'
import { Skeleton } from '../components/ui/skeleton'
import { RCAWorkflow } from '../components/RCA'
import { FiUpload, FiImage, FiUser, FiPlus, FiClock, FiMoreHorizontal, FiSearch, FiZap, FiTrendingUp, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi'

const Analysis = () => {
  const { id, ticketId } = useParams()
  const navigate = useNavigate()
  
  // Ticket data state
  const [ticketData, setTicketData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Similar cases state
  const [similarCases, setSimilarCases] = useState(null)
  const [similarCasesLoading, setSimilarCasesLoading] = useState(false)
  const [similarCasesError, setSimilarCasesError] = useState(null)
  
  // AI suggestions state
  
  const [analysisNotes, setAnalysisNotes] = useState('')
  const [rootCause, setRootCause] = useState('')
  const [recommendations, setRecommendations] = useState('')

  // RCA Workflow State
  const [rcaStep, setRcaStep] = useState(1)
  const [analysisResponse, setAnalysisResponse] = useState('')
  
  // RCA Resolved Data State
  const [rcaResolvedData, setRcaResolvedData] = useState(null)
  const [isLoadingRcaData, setIsLoadingRcaData] = useState(false)
  const [rcaDataError, setRcaDataError] = useState(null)
  const [hasExistingRcaData, setHasExistingRcaData] = useState(false)
  
  // Problem Statement State
  const [problemStatementData, setProblemStatementData] = useState({
    problemDefinitions: [],
    aiQuestion: '',
    issueType: '',
    severity: '',
    businessImpactCategory: '',
    generatedProblemStatement: ''
  })
  const [isGeneratingProblemStatement, setIsGeneratingProblemStatement] = useState(false)
  const [hasAttemptedGeneration, setHasAttemptedGeneration] = useState(false)
  
  // Impact Assessment state
  const [impactAssessments, setImpactAssessments] = useState([])
  const [isGeneratingImpactAssessment, setIsGeneratingImpactAssessment] = useState(false)
  const [hasAttemptedImpactGeneration, setHasAttemptedImpactGeneration] = useState(false)
  
  // Debug wrapper for setAnalysisResponse
  const debugSetAnalysisResponse = (value) => {
    console.log('setAnalysisResponse called with:', value);
    setAnalysisResponse(value);
  }
  
  // Step data tracking
  const [stepData, setStepData] = useState({
    rca_workflow_steps: ['', '', '', ''], // Array for 4 steps
    impact_level_step2: '',
    department_affected_step2: '',
    // Step 1 dropdown values
    issueType: '',
    severity: '',
    businessImpactCategory: ''
  })

  // Fetch RCA resolved data
  const fetchRcaResolvedData = async (ticketId) => {
    if (!ticketId) return
    
    try {
      setIsLoadingRcaData(true)
      setRcaDataError(null)
      
      console.log('Fetching RCA resolved data for ticket:', ticketId)
      const response = await rcaService.getRCAResolvedTicket(ticketId)
      
      if (response.success && response.ticket) {
        console.log('RCA resolved data found:', response)
        setRcaResolvedData(response)
        setHasExistingRcaData(true)
        
        // Load existing step data into state
        const resolutionSteps = response.ticket.resolution_steps
        
        // Update step data based on existing progress
        const newStepData = { 
          ...stepData,
          rca_workflow_steps: [...(stepData.rca_workflow_steps || ['', '', '', ''])]
        }
        
        // Problem Statement (Step 1)
        if (resolutionSteps.problem_statement?.completed) {
          newStepData.issueType = resolutionSteps.problem_statement.issueType || ''
          newStepData.severity = resolutionSteps.problem_statement.severity || ''
          newStepData.businessImpactCategory = resolutionSteps.problem_statement.businessImpactCategory || ''
          newStepData.rca_workflow_steps[0] = resolutionSteps.problem_statement.problemStatement || ''
        }
        
        // Impact Assessment (Step 2)
        if (resolutionSteps.impact_analysis?.completed) {
          newStepData.impact_level_step2 = resolutionSteps.impact_analysis.impactLevel || ''
          newStepData.department_affected_step2 = resolutionSteps.impact_analysis.departmentAffected || ''
          const impactsText = Array.isArray(resolutionSteps.impact_analysis.impacts) 
            ? resolutionSteps.impact_analysis.impacts.join('\n') 
            : resolutionSteps.impact_analysis.impacts || ''
          newStepData.rca_workflow_steps[1] = impactsText
        }
        
        // Root Cause Analysis (Step 3)
        if (resolutionSteps.root_cause?.completed) {
          // Use analysis field for the main text content
          newStepData.rca_workflow_steps[2] = resolutionSteps.root_cause.analysis || resolutionSteps.root_cause.title || ''
          // Store additional root cause data
          if (resolutionSteps.root_cause.supportingEvidences) {
            newStepData.rootCauseAnalysis = {
              ...newStepData.rootCauseAnalysis,
              supportingEvidences: resolutionSteps.root_cause.supportingEvidences
            }
          }
        }
        
        // Corrective Actions (Step 4)
        if (resolutionSteps.corrective_actions?.completed) {
          // Convert stepsToResolve array to text format
          let correctiveActionsText = resolutionSteps.corrective_actions.shortDes || resolutionSteps.corrective_actions.title || ''
          if (resolutionSteps.corrective_actions.stepsToResolve && resolutionSteps.corrective_actions.stepsToResolve.length > 0) {
            const stepsText = resolutionSteps.corrective_actions.stepsToResolve
              .map((step, index) => `${index + 1}. ${step.title}: ${step.description}`)
              .join('\n')
            correctiveActionsText = correctiveActionsText ? `${correctiveActionsText}\n\n${stepsText}` : stepsText
          }
          newStepData.rca_workflow_steps[3] = correctiveActionsText
          // Store structured corrective actions data
          newStepData.correctiveActions = {
            ...newStepData.correctiveActions,
            stepsToResolve: resolutionSteps.corrective_actions.stepsToResolve || []
          }
        }
        
        setStepData(newStepData)
        
        // Set current step based on progress - find first incomplete step
        const stepsStatus = response.progress?.stepsStatus
        let targetStep = 1
        if (stepsStatus) {
          if (!stepsStatus.problem_statement) {
            targetStep = 1
          } else if (!stepsStatus.impact_analysis) {
            targetStep = 2
          } else if (!stepsStatus.root_cause) {
            targetStep = 3
          } else if (!stepsStatus.corrective_actions) {
            targetStep = 4
          } else {
            targetStep = 4 // All completed, stay on last step
          }
        }
        
        console.log('Setting RCA step to:', targetStep, 'based on progress status:', stepsStatus)
        setRcaStep(targetStep)
        
        // Set the response for the current step
        const stepResponse = newStepData.rca_workflow_steps[targetStep - 1] || ''
        if (stepResponse && stepResponse.trim().length > 0) {
          console.log(`Loading existing data for step ${targetStep}:`, stepResponse)
          setAnalysisResponse(stepResponse)
        }
      } else {
        console.log('No RCA resolved data found for ticket:', ticketId)
        setHasExistingRcaData(false)
        
        // Don't trigger AI generation here to prevent infinite loops
        // AI generation will be triggered by the RCAWorkflow component when user interacts with it
        console.log('No existing RCA data found. AI generation will be triggered when user interacts with the workflow.')
      }
    } catch (err) {
      console.log('RCA resolved data not found or error:', err.message)
      setRcaDataError(err.message)
      setHasExistingRcaData(false)
      
      // Don't trigger AI generation here to prevent infinite loops
      // AI generation will be triggered by the RCAWorkflow component when user interacts with it
      console.log('RCA resolved data not found. AI generation will be triggered when user interacts with the workflow.')
    } finally {
      setIsLoadingRcaData(false)
    }
  }

  // Fetch similar cases
  const fetchSimilarCases = async (ticketData) => {
    try {
      setSimilarCasesLoading(true)
      setSimilarCasesError(null)
      console.log('Fetching similar cases for ticket:', ticketData)
      
      const requestData = {
        source: ticketData.source,
        short_description: ticketData.short_description,
        description: ticketData.description || ticketData.short_description,
        category: ticketData.category
      }
      
      const response = await ticketService.getSimilarTickets(requestData)
      console.log('Similar cases received:', response)
      
      setSimilarCases(response)
      return response
    } catch (err) {
      console.error('Error fetching similar cases:', err)
      setSimilarCasesError(err.message || 'Failed to fetch similar cases')
      return null
    } finally {
      setSimilarCasesLoading(false)
    }
  }


  // Fetch ticket data when component loads
  useEffect(() => {
    const fetchTicketData = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log('Fetching ticket data for ID:', id)
        
        const response = await ticketService.getTicketById(id)
        console.log('Ticket data received:', response)
        
        const ticket = response.data || response
        setTicketData(ticket)
        
        // Load existing step data from ticket
        if (ticket) {
          // Handle both old and new data structures
          let existingStepData
          if (ticket.rca_workflow_steps && Array.isArray(ticket.rca_workflow_steps)) {
            // New structure: use rca_workflow_steps array
            console.log('Using new structure, ticket.rca_workflow_steps:', ticket.rca_workflow_steps);
            existingStepData = {
              rca_workflow_steps: ticket.rca_workflow_steps.length > 0 ? ticket.rca_workflow_steps : ['', '', '', ''],
              impact_level_step2: ticket.impact_level_step2 || '',
              department_affected_step2: ticket.department_affected_step2 || '',
              issueType: ticket.issueType || '',
              severity: ticket.severity || '',
              businessImpactCategory: ticket.businessImpactCategory || '',
              impact_assessments_step2: ticket.impact_assessments_step2 || null,
              problemStatementData: ticket.problemStatementData || null,
              impactAssessments: ticket.impactAssessments || null,
              rootCauseAnalysis: ticket.rootCauseAnalysis || null,
              correctiveActions: ticket.correctiveActions || null
            }
          } else {
            // Old structure: convert individual step fields to array
            console.log('Using old structure, converting individual fields');
            existingStepData = {
              rca_workflow_steps: [
                ticket.problem_step1 || '',
                ticket.timeline_step2 || '',
                ticket.impact_step3 || '',
                ticket.root_cause_step4 || ticket.findings_step4 || '',
                ticket.corrective_actions_step5 || ''
              ].slice(0, 4), // Take only first 4 steps since we removed timeline
              impact_level_step2: ticket.impact_level_step2 || '',
              department_affected_step2: ticket.department_affected_step2 || '',
              issueType: ticket.issueType || '',
              severity: ticket.severity || '',
              businessImpactCategory: ticket.businessImpactCategory || '',
              impact_assessments_step2: ticket.impact_assessments_step2 || null,
              problemStatementData: ticket.problemStatementData || null,
              impactAssessments: ticket.impactAssessments || null,
              rootCauseAnalysis: ticket.rootCauseAnalysis || null,
              correctiveActions: ticket.correctiveActions || null
            }
          }
          console.log('Final existingStepData:', existingStepData);
          setStepData(existingStepData)
          
          // Find and navigate to first incomplete step
          const firstIncompleteStep = findFirstIncompleteStepWithData(existingStepData)
          console.log('=== SETTING RCA STEP ===')
          console.log('First incomplete step determined:', firstIncompleteStep)
          setRcaStep(firstIncompleteStep)
          
          // Load the response for the current step
          const stepResponse = existingStepData.rca_workflow_steps[firstIncompleteStep - 1] || ''
          console.log('Loading step response for step', firstIncompleteStep, ':', stepResponse)
          debugSetAnalysisResponse(stepResponse)
          
          // Restore problem statement data if available
          if (existingStepData.problemStatementData) {
            setProblemStatementData(existingStepData.problemStatementData)
          }
          
          // Restore impact assessments if available
          if (existingStepData.impactAssessments) {
            console.log('Restoring impact assessments:', existingStepData.impactAssessments)
            // Store impact assessments in stepData for ImpactAssessmentStep to access
            setStepData(prevData => ({
              ...prevData,
              impact_assessments_step2: existingStepData.impactAssessments
            }))
          } else if (existingStepData.impact_assessments_step2) {
            console.log('Restoring impact assessments from step2 field:', existingStepData.impact_assessments_step2)
          }
          
          // Don't generate AI content immediately - wait for RCA resolved data to be checked first
          // This prevents race conditions where AI generation starts before we know if data exists
          console.log('Ticket data loaded. RCA resolved data will be checked separately before AI generation.')
        }
        
        // Start fetching similar cases and RCA resolved data after ticket data is loaded
        if (ticket) {
          fetchSimilarCases(ticket)
          // Fetch RCA resolved data immediately if ticketId is available
          if (ticketId) {
            fetchRcaResolvedData(ticketId)
          }
        }
      } catch (err) {
        console.error('Error fetching ticket data:', err)
        setError(err.message || 'Failed to fetch ticket data')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchTicketData()
    }
  }, [id])

  // Backup: Fetch RCA resolved data when ticketId and ticketData are available (in case ticketId wasn't available during initial fetch)
  useEffect(() => {
    if (ticketId && ticketData && !hasExistingRcaData && !isLoadingRcaData) {
      fetchRcaResolvedData(ticketId)
    }
  }, [ticketId, ticketData]) // Removed hasExistingRcaData and isLoadingRcaData to prevent infinite loops

  // Set response data when existing RCA data is loaded and current step data exists
  useEffect(() => {
    if (hasExistingRcaData && rcaResolvedData && stepData.rca_workflow_steps) {
      const currentStepIndex = rcaStep - 1
      const currentStepData = stepData.rca_workflow_steps[currentStepIndex]
      
      if (currentStepData && currentStepData.trim().length > 0 && (!analysisResponse || analysisResponse.trim().length === 0)) {
        console.log(`Loading existing data for step ${rcaStep}:`, currentStepData)
        setAnalysisResponse(currentStepData)
      }
    }
  }, [hasExistingRcaData, rcaResolvedData, stepData.rca_workflow_steps, rcaStep, analysisResponse])

  // Trigger AI generation for step 1 when appropriate
  useEffect(() => {
    // Only trigger if:
    // 1. We have ticket data
    // 2. We're on step 1
    // 3. No existing RCA data
    // 4. Haven't attempted generation yet
    // 5. Not currently generating
    // 6. Current step response is empty
    if (
      ticketData && 
      rcaStep === 1 && 
      !hasExistingRcaData && 
      !hasAttemptedGeneration && 
      !isGeneratingProblemStatement &&
      (!analysisResponse || analysisResponse.trim().length === 0) &&
      (!stepData.rca_workflow_steps?.[0] || stepData.rca_workflow_steps[0].trim().length === 0)
    ) {
      console.log('Triggering initial problem statement generation for new ticket')
      generateProblemStatement(ticketData)
    }
  }, [ticketData, rcaStep, hasExistingRcaData, hasAttemptedGeneration, isGeneratingProblemStatement, analysisResponse, stepData.rca_workflow_steps])

  // Trigger AI generation for step 2 when appropriate  
  useEffect(() => {
    // Only trigger if:
    // 1. We have ticket data
    // 2. We're on step 2
    // 3. No existing RCA data
    // 4. Haven't attempted impact generation yet
    // 5. Not currently generating
    // 6. Current step response is empty
    if (
      ticketData && 
      rcaStep === 2 && 
      !hasExistingRcaData && 
      !hasAttemptedImpactGeneration && 
      !isGeneratingImpactAssessment &&
      (!analysisResponse || analysisResponse.trim().length === 0) &&
      (!stepData.rca_workflow_steps?.[1] || stepData.rca_workflow_steps[1].trim().length === 0)
    ) {
      console.log('Triggering initial impact assessment generation for new ticket')
      generateImpactAssessment(ticketData)
    }
  }, [ticketData, rcaStep, hasExistingRcaData, hasAttemptedImpactGeneration, isGeneratingImpactAssessment, analysisResponse, stepData.rca_workflow_steps])

  // Populate stepData from RCA resolved data when available
  useEffect(() => {
    if (hasExistingRcaData && rcaResolvedData?.ticket?.resolution_steps) {
      console.log('Populating stepData from RCA resolved data')
      
      const resolutionSteps = rcaResolvedData.ticket.resolution_steps
      const newWorkflowSteps = [...(stepData.rca_workflow_steps || ['', '', '', ''])]

      // Populate step 1 (Problem Statement)
      if (resolutionSteps.problem_statement?.completed && resolutionSteps.problem_statement.problemStatement) {
        newWorkflowSteps[0] = resolutionSteps.problem_statement.problemStatement
      }

      // Populate step 2 (Impact Assessment)
      if (resolutionSteps.impact_analysis?.completed && resolutionSteps.impact_analysis.impacts) {
        newWorkflowSteps[1] = resolutionSteps.impact_analysis.impacts.join('\n')
      }

      // Populate step 3 (Root Cause Analysis)
      if (resolutionSteps.root_cause?.completed && resolutionSteps.root_cause.analysis) {
        newWorkflowSteps[2] = resolutionSteps.root_cause.analysis
      }

      // Populate step 4 (Corrective Actions)
      if (resolutionSteps.corrective_actions?.completed && resolutionSteps.corrective_actions.stepsToResolve) {
        const actionsText = resolutionSteps.corrective_actions.stepsToResolve
          .map(step => `${step.title}\n${step.description}`)
          .join('\n\n')
        newWorkflowSteps[3] = actionsText
      }

      // Update stepData if any steps were populated
      if (JSON.stringify(newWorkflowSteps) !== JSON.stringify(stepData.rca_workflow_steps)) {
        console.log('Updating stepData with RCA resolved data:', newWorkflowSteps)
        setStepData(prev => ({
          ...prev,
          rca_workflow_steps: newWorkflowSteps
        }))
      }
    }
  }, [hasExistingRcaData, rcaResolvedData, stepData.rca_workflow_steps, setStepData])

  // Generate problem statement function
  const generateProblemStatement = async (ticket) => {
    console.log('generateProblemStatement called with:', {
      ticket: !!ticket,
      isGeneratingProblemStatement,
      hasAttemptedGeneration
    })
    
    if (!ticket || isGeneratingProblemStatement) {
      console.log('Skipping problem statement generation due to conditions')
      return
    }
    
    // Check if problem statement data already exists
    if (problemStatementData.generatedProblemStatement && problemStatementData.generatedProblemStatement.trim().length > 0) {
      console.log('Problem statement already exists, skipping generation')
      return
    }
    
    // Check if RCA resolved data already has problem statement
    if (hasExistingRcaData && rcaResolvedData?.ticket?.resolution_steps?.problem_statement?.completed) {
      console.log('Problem statement already exists in RCA resolved data, skipping generation')
      return
    }
    
    console.log('Generating problem statement...')

    try {
      setIsGeneratingProblemStatement(true)
      setHasAttemptedGeneration(true)
      
      const requestData = {
        shortDescription: ticket.short_description || '',
        description: ticket.description || '',
        category: ticket.category || '',
        logs: ticket.logs || []
      }
      
      console.log('Generating problem statement with data:', requestData)
      const response = await aiService.problemStatement.generate(requestData)
      // const response = {
      //   success: true,
      //   message: "Problem statement generated successfully",
      //   inputData: {
      //     hasDescription: true,
      //     logCount: 0
      //   },
      //   problemStatement: {
      //     problemDefinitions: [
      //       "The operating system's registry entries responsible for file type associations are corrupted or incorrectly configured, preventing applications from launching correctly when specific file types are opened. This may involve issues with the .reg files or system-level settings.",
      //       "Users are unable to open files using their default applications, leading to potential delays in completing tasks and impacting overall productivity. This disruption affects workflow efficiency and may result in missed deadlines.",
      //       "Users report an inability to open files with their preferred programs, resulting in a frustrating and unproductive user experience.  This impacts user satisfaction and may lead to increased help desk tickets."
      //     ],
      //     question: "Are the file type associations in the Windows Registry correctly mapped to the appropriate executable files?",
      //     issueType: "Software",
      //     severity: "Sev 3 – Moderate",
      //     businessImpact: "Operational Downtime",
      //     confidence: 0.85
      //   },
      //   processingTimeMs: 19527,
      //   metadata: {
      //     timestamp: "2025-09-25T11:16:28.941Z"
      //   }
      // }
      // console.log('Problem statement API response:', response)
      
      if (response.success && response.problemStatement) {
        const { problemStatement } = response
        
        // Update problem statement data
        const newProblemStatementData = {
          problemDefinitions: problemStatement.problemDefinitions || [],
          aiQuestion: problemStatement.question || '',
          issueType: problemStatement.issueType || '',
          severity: problemStatement.severity || '',
          businessImpactCategory: problemStatement.businessImpact || '',
          generatedProblemStatement: problemStatement.problemDefinitions?.[0] || ''
        }
        
        setProblemStatementData(newProblemStatementData)
        
        // Store problem statement data in stepData for persistence
        setStepData(prevData => ({
          ...prevData,
          problemStatementData: newProblemStatementData
        }))
        
        // Auto-populate step 1 with the first problem definition and dropdown values
        if (problemStatement.problemDefinitions && problemStatement.problemDefinitions.length > 0) {
          const firstDefinition = problemStatement.problemDefinitions[0]
          setAnalysisResponse(firstDefinition)
          
          // Map AI values to dropdown values
          const issueTypeMap = {
            'Software': 'software',
            'Hardware': 'hardware', 
            'Network': 'network',
            'Configuration': 'configuration',
            'User Error': 'user_error',
            'Other': 'other'
          }
          
          const severityMap = {
            'Sev 1 – Critical': 'sev1',
            'Sev 2 – Major': 'sev2',
            'Sev 3 – Moderate': 'sev3',
            'Sev 4 – Minor': 'sev4'
          }
          
          const impactMap = {
            'Revenue Loss': 'revenue_loss',
            'Compliance Issue': 'compliance_issue',
            'Operational Downtime': 'operational_downtime',
            'Customer Support': 'customer_support',
            'Other': 'other'
          }
          
           // Update step data with problem statement and dropdown values
           const updatedStepData = {
             ...stepData,
             rca_workflow_steps: [
               firstDefinition,
               stepData.rca_workflow_steps[1] || '',
               stepData.rca_workflow_steps[2] || '',
               stepData.rca_workflow_steps[3] || ''
             ],
             issueType: issueTypeMap[problemStatement.issueType] || '',
             severity: severityMap[problemStatement.severity] || '',
             businessImpactCategory: impactMap[problemStatement.businessImpact] || ''
           }
           
           setStepData(updatedStepData)
           
           console.log('Auto-populating dropdowns with values:', {
             issueType: updatedStepData.issueType,
             severity: updatedStepData.severity,
             businessImpactCategory: updatedStepData.businessImpactCategory,
             originalValues: {
               issueType: problemStatement.issueType,
               severity: problemStatement.severity,
               businessImpact: problemStatement.businessImpact
             }
           })
           
           // Save generated problem statement to database immediately
           if (ticketId && !hasExistingRcaData && !rcaResolvedData?.ticket?.resolution_steps?.problem_statement?.completed) {
             console.log('Saving generated problem statement to database...')
             try {
               const dummyUserInfo = {
                 id: "user123",
                 name: "John Doe"
               }
               
               const ticketInfo = {
                 source: ticket.source || "ServiceNow",
                 short_description: ticket.short_description || "",
                 description: ticket.description || "",
                 category: ticket.category || "",
                 status: ticket.status || "In Progress"
               }
               
               const problemStatementData = {
                 issueType: updatedStepData.issueType,
                 severity: updatedStepData.severity,
                 problemStatement: firstDefinition,
                 ticketInfo,
                 userInfo: dummyUserInfo
               }
               
               const saveResponse = await rcaService.updateProblemStatement({
                 ticketId,
                 data: problemStatementData
               })
               
               console.log('Problem statement saved to database:', saveResponse)
               
               // Update local RCA resolved data state
               if (saveResponse.success && saveResponse.ticket) {
                 setRcaResolvedData(saveResponse)
                 setHasExistingRcaData(true)
               }
             } catch (error) {
               console.error('Error saving generated problem statement:', error)
             }
           }
        }
        
        console.log('Problem statement generated successfully:', newProblemStatementData)
      } else {
        console.warn('Problem statement API returned unsuccessful response:', response)
      }
    } catch (error) {
      console.error('Error generating problem statement:', error)
      // Don't show alert here as it's automatic generation
    } finally {
      setIsGeneratingProblemStatement(false)
    }
  }

  // Generate Impact Assessment function
  const generateImpactAssessment = async (ticket) => {
    console.log('generateImpactAssessment called with:', {
      ticket: !!ticket,
      isGeneratingImpactAssessment,
      hasAttemptedImpactGeneration
    })
    
    if (!ticket || isGeneratingImpactAssessment) {
      console.log('Skipping impact assessment generation due to conditions')
      return
    }
    
    // Check if impact assessment data already exists
    if (impactAssessments.length > 0) {
      console.log('Impact assessments already exist, skipping generation')
      return
    }
    
    // Check if RCA resolved data already has impact analysis
    if (hasExistingRcaData && rcaResolvedData?.ticket?.resolution_steps?.impact_analysis?.completed) {
      console.log('Impact analysis already exists in RCA resolved data, skipping generation')
      return
    }

    console.log('Generating impact assessment...')

    try {
      setIsGeneratingImpactAssessment(true)
      setHasAttemptedImpactGeneration(true)
      

      const requestData = {
        shortDescription: ticket.short_description || ticket.shortDescription || '',
        description: ticket.description || '',
        category: ticket.category || '',
        subcategory: ticket.subcategory || ticket.sub_category || ''
      }
  
      const response = await aiService.impactAssessment.analyze(requestData)
      
      if (response.success && response.data && response.data.impactAssessments) {
        // Store the impact assessments
        setImpactAssessments(response.data.impactAssessments)
        
        // Save impact assessments to stepData for persistence
        const updatedStepData = {
          ...stepData,
          impact_assessments_step2: response.data.impactAssessments
        }
        setStepData(updatedStepData)
        
        console.log('Impact assessments generated successfully:', response.data.impactAssessments)
        
        // Save generated impact assessment to database immediately
        if (ticketId && !hasExistingRcaData && !rcaResolvedData?.ticket?.resolution_steps?.impact_analysis?.completed && response.data.impactAssessments.length > 0) {
          console.log('Saving generated impact assessment to database...')
          try {
            const firstAssessment = response.data.impactAssessments[0]
            
            // Map AI values to our dropdown values
            const impactLevelMap = {
              'Sev 1 - Critical Impact': 'Critical',
              'Sev 2 - Major Impact': 'Major',
              'Sev 3 - Normal Impact': 'Normal',
              'Sev 4 - Minor Impact': 'Minor'
            }
            
            const departmentMap = {
              'Customer Support': 'Customer Support',
              'Sales': 'Sales',
              'IT Operations': 'IT Operations',
              'Finance': 'Finance',
              'Human Resources': 'Human Resources',
              'Engineering': 'Engineering',
              'Other': 'Other'
            }
            
            const impactAnalysisData = {
              impactLevel: impactLevelMap[firstAssessment.impactLevel] || firstAssessment.impactLevel || 'Critical',
              departmentAffected: departmentMap[firstAssessment.department] || firstAssessment.department || 'Engineering',
              impacts: [firstAssessment.impacts] || response.data.impactAssessments.map(ia => ia.impacts)
            }
            
            const saveResponse = await rcaService.updateImpactAnalysis({
              ticketId,
              data: impactAnalysisData
            })
            
            console.log('Impact assessment saved to database:', saveResponse)
            
            // Update local RCA resolved data state
            if (saveResponse.success && saveResponse.ticket) {
              setRcaResolvedData(saveResponse)
              setHasExistingRcaData(true)
            }
            
            // Also update the step data with the mapped values
            setStepData(prevData => ({
              ...prevData,
              impact_level_step2: impactAnalysisData.impactLevel,
              department_affected_step2: impactAnalysisData.departmentAffected,
              rca_workflow_steps: [
                prevData.rca_workflow_steps[0] || '',
                firstAssessment.impacts,
                prevData.rca_workflow_steps[2] || '',
                prevData.rca_workflow_steps[3] || ''
              ]
            }))
            
            // Set the response for the UI
            if (firstAssessment.impacts) {
              setAnalysisResponse(firstAssessment.impacts)
            }
            
          } catch (error) {
            console.error('Error saving generated impact assessment:', error)
          }
        }
      } else {
        console.warn('Impact assessment API returned unsuccessful response:', response)
      }
    } catch (error) {
      console.error('Error generating impact assessment:', error)
      // Don't show alert here as it's automatic generation
    } finally {
      setIsGeneratingImpactAssessment(false)
    }
  }

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
    // Keep resolution functionality within the analysis page
    // No navigation needed - user can complete resolution here
    console.log('Resolution completed for ticket:', ticketId)
  }

  // Trigger AI generation for step 1 when appropriate
  useEffect(() => {
    // Only trigger if:
    // 1. We have ticket data
    // 2. We're on step 1
    // 3. No existing RCA data
    // 4. Haven't attempted generation yet
    // 5. Not currently generating
    // 6. Current step response is empty
    if (
      ticketData && 
      rcaStep === 1 && 
      !hasExistingRcaData && 
      !hasAttemptedGeneration && 
      !isGeneratingProblemStatement &&
      (!analysisResponse || analysisResponse.trim().length === 0) &&
      (!stepData.rca_workflow_steps?.[0] || stepData.rca_workflow_steps[0].trim().length === 0)
    ) {
      console.log('Triggering initial problem statement generation for new ticket')
      generateProblemStatement(ticketData)
    }
  }, [ticketData, rcaStep, hasExistingRcaData, hasAttemptedGeneration, isGeneratingProblemStatement, analysisResponse, stepData.rca_workflow_steps])

  // Trigger AI generation for step 2 when appropriate  
  useEffect(() => {
    // Only trigger if:
    // 1. We have ticket data
    // 2. We're on step 2
    // 3. No existing RCA data
    // 4. Haven't attempted impact generation yet
    // 5. Not currently generating
    // 6. Current step response is empty
    if (
      ticketData && 
      rcaStep === 2 && 
      !hasExistingRcaData && 
      !hasAttemptedImpactGeneration && 
      !isGeneratingImpactAssessment &&
      (!analysisResponse || analysisResponse.trim().length === 0) &&
      (!stepData.rca_workflow_steps?.[1] || stepData.rca_workflow_steps[1].trim().length === 0)
    ) {
      console.log('Triggering initial impact assessment generation for new ticket')
      generateImpactAssessment(ticketData)
    }
  }, [ticketData, rcaStep, hasExistingRcaData, hasAttemptedImpactGeneration, isGeneratingImpactAssessment, analysisResponse, stepData.rca_workflow_steps])

  // RCA Workflow Data
  const rcaSteps = [
    {
      step: 1,
      title: 'Problem Definition',
      aiGuidance: 'What specific problem or incident occurred? Please describe the symptoms observed.',
    },
    {
      step: 2,
      title: 'Impact Assessment',
      aiGuidance: 'What was the business and technical impact of this issue?'
    },
    {
      step: 3,
      title: 'Root Cause Analysis',
      aiGuidance: 'Based on your investigation, what is the underlying root cause?'
    },
    {
      step: 4,
      title: 'Corrective Actions',
      aiGuidance: 'What specific actions will you take to prevent this issue from recurring?'
    }
  ]

  // Generic function to save any step data - can be called from any step component
  const saveStepToDatabase = async (stepNumber, stepSpecificData) => {
    if (!ticketId) return
    
    try {
      console.log(`Saving step ${stepNumber} data to database:`, stepSpecificData)
      
      const dummyUserInfo = {
        id: "user123",
        name: "John Doe"
      }
      
      const ticketInfo = ticketData ? {
        source: ticketData.source || "ServiceNow",
        short_description: ticketData.short_description || "",
        description: ticketData.description || "",
        category: ticketData.category || "",
        status: ticketData.status || "In Progress"
      } : undefined
      
      let response
      
      switch (stepNumber) {
        case 3: // Root Cause Analysis
          const rootCauseData = {
            title: stepSpecificData.title || "Root Cause Analysis",
            analysis: stepSpecificData.analysis || "",
            supportingEvidences: stepSpecificData.supportingEvidences || [],
            confidencePercentage: stepSpecificData.confidencePercentage || 85,
            ticketInfo,
            userInfo: dummyUserInfo
          }
          response = await rcaService.updateRootCause({
            ticketId,
            data: rootCauseData
          })
          break
        
        case 4: // Corrective Actions
          const correctiveActionsData = {
            title: stepSpecificData.title || "Corrective Actions",
            shortDes: stepSpecificData.shortDes || "Resolution steps to address the root cause",
            stepsToResolve: stepSpecificData.stepsToResolve || [],
            ticketInfo,
            userInfo: dummyUserInfo
          }
          response = await rcaService.updateCorrectiveActions({
            ticketId,
            data: correctiveActionsData
          })
          break
        
        default:
          console.warn('Unknown step number for database save:', stepNumber)
          return
      }
      
      console.log(`Step ${stepNumber} data saved successfully:`, response)
      
      // Update local state with the response
      if (response.success && response.ticket) {
        setRcaResolvedData(response)
        setHasExistingRcaData(true)
      }
      
      return response
      
    } catch (error) {
      console.error(`Error saving step ${stepNumber} data:`, error)
      throw error
    }
  }

  // Save RCA step data to backend
  const saveRcaStepData = async (currentStepNumber, stepDataToSave) => {
    if (!ticketId) return
    
    try {
      console.log('Saving RCA step data for step:', currentStepNumber, 'Ticket:', ticketId)
      console.log('Step data to save:', stepDataToSave)
      
      let response
      const dummyUserInfo = {
        id: "user123",
        name: "John Doe"
      }
      
      const ticketInfo = ticketData ? {
        source: ticketData.source || "ServiceNow",
        short_description: ticketData.short_description || "",
        description: ticketData.description || "",
        category: ticketData.category || "",
        status: ticketData.status || "In Progress"
      } : undefined
      
      switch (currentStepNumber) {
        case 1: // Problem Statement
          const problemStatementData = {
            issueType: stepDataToSave.issueType || '',
            severity: stepDataToSave.severity || '',
            problemStatement: stepDataToSave.rca_workflow_steps?.[0] || analysisResponse,
            ticketInfo,
            userInfo: dummyUserInfo
          }
          response = await rcaService.updateProblemStatement({
            ticketId,
            data: problemStatementData
          })
          break
        
        case 2: // Impact Assessment
          // Map dropdown values to display values that backend expects
          const impactLevelDisplayMap = {
            'sev1': 'Sev 1 - Critical Impact',
            'sev2': 'Sev 2 - Major Impact',
            'sev3': 'Sev 3 - Normal Impact',
            'sev4': 'Sev 4 - Minor Impact'
          }
          
          const departmentDisplayMap = {
            'customer_support': 'Customer Support',
            'sales': 'Sales',
            'it_operations': 'IT Operations',
            'finance': 'Finance',
            'hr': 'Human Resources',
            'other': 'Other'
          }
          
          const impactAnalysisData = {
            impactLevel: impactLevelDisplayMap[stepDataToSave.impact_level_step2] || stepDataToSave.impact_level_step2 || '',
            departmentAffected: departmentDisplayMap[stepDataToSave.department_affected_step2] || stepDataToSave.department_affected_step2 || '',
            impacts: stepDataToSave.rca_workflow_steps?.[1] ? 
              stepDataToSave.rca_workflow_steps[1].split('\n').filter(impact => impact.trim()) : 
              analysisResponse.split('\n').filter(impact => impact.trim())
          }

          
          // Validation check before API call
          if (!impactAnalysisData.impactLevel || !impactAnalysisData.departmentAffected) {
            console.error('❌ Missing required fields for impact analysis:', {
              impactLevel: impactAnalysisData.impactLevel,
              departmentAffected: impactAnalysisData.departmentAffected,
              fullStepData: stepDataToSave
            })
            
            // Provide default values if missing
            if (!impactAnalysisData.impactLevel) {
              impactAnalysisData.impactLevel = 'Sev 3 - Normal Impact' // Default impact level
            }
            
            if (!impactAnalysisData.departmentAffected) {
              impactAnalysisData.departmentAffected = 'IT Operations' // Default department
          }
          }
          response = await rcaService.updateImpactAnalysis({
            ticketId,
            data: impactAnalysisData
          })
          break
        
        case 3: // Root Cause Analysis
          console.log('Processing Root Cause Analysis step data:', {
            hasRootCauseAnalysis: !!stepDataToSave.rootCauseAnalysis,
            rootCauses: stepDataToSave.rootCauseAnalysis?.rootCauses,
            workflowStep: stepDataToSave.rca_workflow_steps?.[2],
            analysisResponse
          })
          
          // Use structured data from rootCauseAnalysis if available (from Save button)
          // Otherwise fall back to text-based data (from Next button without save)
          let rootCauseTitle = "Root Cause Analysis"
          let rootCauseAnalysisText = ""
          let supportingEvidences = []
          let confidencePercentage = 85
          
          if (stepDataToSave.rootCauseAnalysis?.rootCauses?.length > 0) {
            // Use structured data from the component's save functionality
            console.log('Using structured root cause data')
            const topRootCause = stepDataToSave.rootCauseAnalysis.rootCauses[0]
            rootCauseTitle = topRootCause.rootCause || "Root Cause Analysis"
            rootCauseAnalysisText = topRootCause.analysis || ""
            supportingEvidences = topRootCause.evidence || []
            confidencePercentage = topRootCause.confidence || 85
          } else {
            // Fall back to text-based data
            console.log('Using fallback text-based data')
            rootCauseAnalysisText = stepDataToSave.rca_workflow_steps?.[2] || analysisResponse
          }
          
          const rootCauseData = {
            title: rootCauseTitle,
            analysis: rootCauseAnalysisText,
            supportingEvidences: supportingEvidences,
            confidencePercentage: confidencePercentage,
            ticketInfo,
            userInfo: dummyUserInfo
          }
          
          console.log('Final root cause data being sent:', rootCauseData)
          
          response = await rcaService.updateRootCause({
            ticketId,
            data: rootCauseData
          })
          break
        
        case 4: // Corrective Actions
          // Prepare corrective actions data according to schema
          let correctiveActionsSteps = []
          
          // Try to get structured data first
          if (stepDataToSave.correctiveActions?.generatedSolutions?.solutions?.length > 0) {
            const firstSolution = stepDataToSave.correctiveActions.generatedSolutions.solutions[0]
            correctiveActionsSteps = firstSolution.steps.map(step => ({
              title: step.title,
              description: step.description
            }))
          }
          
          // Fallback: Parse from text if no structured data
          if (correctiveActionsSteps.length === 0 && (stepDataToSave.rca_workflow_steps?.[3] || analysisResponse)) {
            const textContent = stepDataToSave.rca_workflow_steps?.[3] || analysisResponse
            // Simple parsing for steps - look for numbered items
            const lines = textContent.split('\n')
            let currentStep = null
            
            lines.forEach(line => {
              const trimmedLine = line.trim()
              // Check if line starts with a number followed by a period
              const stepMatch = trimmedLine.match(/^(\d+)\.\s*(.+)/)
              if (stepMatch) {
                if (currentStep) {
                  correctiveActionsSteps.push(currentStep)
                }
                currentStep = {
                  title: stepMatch[2],
                  description: ""
                }
              } else if (currentStep && trimmedLine.length > 0 && !trimmedLine.startsWith('-')) {
                // Add to description if it's not a sub-bullet
                currentStep.description = currentStep.description ? 
                  `${currentStep.description} ${trimmedLine}` : trimmedLine
              }
            })
            
            // Add the last step
            if (currentStep) {
              correctiveActionsSteps.push(currentStep)
            }
            
            // If no steps found, create a single step with the entire content
            if (correctiveActionsSteps.length === 0) {
              correctiveActionsSteps = [{
                title: "Implement Corrective Actions",
                description: textContent
              }]
            }
          }
          
          const correctiveActionsData = {
            title: stepDataToSave.correctiveActions?.generatedSolutions?.solutions?.[0]?.title || "Corrective Actions",
            shortDes: stepDataToSave.correctiveActions?.generatedSolutions?.solutions?.[0]?.description || "Resolution steps to address the root cause",
            stepsToResolve: correctiveActionsSteps,
            ticketInfo,
            userInfo: dummyUserInfo
          }
          
          console.log('Saving corrective actions with schema format:', correctiveActionsData)
          response = await rcaService.updateCorrectiveActions({
            ticketId,
            data: correctiveActionsData
          })
          break
        
        default:
          console.warn('Unknown step number:', currentStepNumber)
          return
      }
      
      console.log('RCA step data saved successfully:', response)
      
      // Update local state with the response
      if (response.success && response.ticket) {
        setRcaResolvedData(response)
      }
      
    } catch (error) {
      console.error('Error saving RCA step data:', error)
      // Don't throw error, just log it so user can continue
    }
  }

  // Mock similar cases data (will be replaced by API data)
  const mockSimilarCases = [
    { id: 'RCA-087', title: 'Payment timeout issues', match: 89 },
    { id: 'RCA-053', title: 'Database connection failures', match: 76 },
    { id: 'RCA-091', title: 'API response delays', match: 64 }
  ]

  // RCA Workflow Handlers
  const handleRcaNext = async () => {
    try {
      // Validation: Only save and proceed if there's data to save or if data already exists
      const currentStepIndex = rcaStep - 1
      const hasCurrentStepData = stepData.rca_workflow_steps?.[currentStepIndex]?.trim()
      const hasAnalysisResponse = analysisResponse?.trim()
      
      if (!hasCurrentStepData && !hasAnalysisResponse) {
        alert('Please enter some information before proceeding to the next step.')
        return
      }

      // Always save current step data before proceeding if we have data
      // This ensures that any modifications made by the user are saved to the database
      if (hasAnalysisResponse || hasCurrentStepData) {
        // Update stepData with current response before saving
        const updatedStepData = {
          ...stepData,
          rca_workflow_steps: stepData.rca_workflow_steps.map((step, index) => 
            index === currentStepIndex ? (analysisResponse || step) : step
          )
        }
        setStepData(updatedStepData)
        
        await saveRcaStepData(rcaStep, updatedStepData)
      }
      
      if (rcaStep < 4) {
        setRcaStep(rcaStep + 1)
        setAnalysisResponse('')
      } else {
        // Final step completed
        console.log('RCA workflow completed')
        // Navigate to completion page or handle completion
        navigate(`/rca-completion/${id}/${ticketId}`, {
          state: {
            ticketData: ticketData,
            stepData: stepData
          }
        })
      }
    } catch (error) {
      console.error('Error in RCA next step:', error)
    }
  }

  const handleRcaPrevious = () => {
    if (rcaStep > 1) {
      const previousStep = rcaStep - 1
      setRcaStep(previousStep)
      
      // Load previous step data if available
      if (stepData.rca_workflow_steps[previousStep - 1]) {
        debugSetAnalysisResponse(stepData.rca_workflow_steps[previousStep - 1])
      } else {
        debugSetAnalysisResponse('')
      }
    }
  }

  const getCurrentStepData = () => {
    return rcaSteps.find(step => step.step === rcaStep) || rcaSteps[0]
  }

  // Check if all previous steps have data
  const areAllPreviousStepsComplete = () => {
    if (rcaStep < 4) return true // Not on final step yet
    
    // Check if steps 1-3 have data
    const hasStep1 = stepData.rca_workflow_steps[0] && stepData.rca_workflow_steps[0].trim().length > 0
    const hasStep2 = stepData.rca_workflow_steps[1] && stepData.rca_workflow_steps[1].trim().length > 0
    const hasStep3 = stepData.rca_workflow_steps[2] && stepData.rca_workflow_steps[2].trim().length > 0
    
    return hasStep1 && hasStep2 && hasStep3
  }

  // Find the first incomplete step
  const findFirstIncompleteStep = () => {
    // Check step 1 (Problem Definition)
    if (!stepData.rca_workflow_steps[0] || stepData.rca_workflow_steps[0].trim().length === 0) {
      return 1
    }
    
    // Check step 2 (Impact Assessment) - needs content
    if (!stepData.rca_workflow_steps[1] || stepData.rca_workflow_steps[1].trim().length === 0) {
      return 2
    }
    
    // Check step 3 (Root Cause Analysis)
    if (!stepData.rca_workflow_steps[2] || stepData.rca_workflow_steps[2].trim().length === 0) {
      return 3
    }
    
    // If all steps are complete, return step 4
    return 4
  }

  // Find the first incomplete step with provided data
  const findFirstIncompleteStepWithData = (stepDataToCheck) => {
    console.log('=== FINDING FIRST INCOMPLETE STEP ===')
    console.log('stepDataToCheck:', stepDataToCheck)
    console.log('rca_workflow_steps:', stepDataToCheck.rca_workflow_steps)
    
    // Check step 1 (Problem Definition)
    const step1Content = stepDataToCheck.rca_workflow_steps?.[0] || ''
    console.log('Step 1 content:', step1Content, 'Length:', step1Content.trim().length)
    if (!step1Content || step1Content.trim().length === 0) {
      console.log('Step 1 is incomplete, returning step 1')
      return 1
    }
    
    // Check step 2 (Impact Assessment) - needs step content (dropdowns are optional)
    const step2Content = stepDataToCheck.rca_workflow_steps?.[1] || ''
    console.log('Step 2 content:', step2Content, 'Length:', step2Content.trim().length)
    console.log('impact_level_step2:', stepDataToCheck.impact_level_step2)
    console.log('department_affected_step2:', stepDataToCheck.department_affected_step2)
    if (!step2Content || step2Content.trim().length === 0) {
      console.log('Step 2 is incomplete (no content), returning step 2')
      return 2
    }
    
    // Check step 3 (Root Cause Analysis)
    const step3Content = stepDataToCheck.rca_workflow_steps?.[2] || ''
    console.log('Step 3 content:', step3Content, 'Length:', step3Content.trim().length)
    if (!step3Content || step3Content.trim().length === 0) {
      console.log('Step 3 is incomplete, returning step 3')
      return 3
    }
    
    // Check step 4 (Corrective Actions)
    const step4Content = stepDataToCheck.rca_workflow_steps?.[3] || ''
    console.log('Step 4 content:', step4Content, 'Length:', step4Content.trim().length)
    if (!step4Content || step4Content.trim().length === 0) {
      console.log('Step 4 is incomplete, returning step 4')
      return 4
    }
    
    // If all steps are complete, return step 4 (final step)
    console.log('All steps are complete, returning step 4')
    return 4
  }

  const handleSaveProgress = () => {
    console.log('Saving progress...')
    // Implement save functionality
  }

  const handleGenerateReport = () => {
    console.log('Generating report...')
    // Implement report generation
  }

  // Handle step navigation
  const handleStepClick = (stepNumber) => {
    console.log('=== STEP CLICK DEBUG ===');
    console.log('Clicked step:', stepNumber);
    console.log('Current stepData:', stepData);
    console.log('rca_workflow_steps:', stepData.rca_workflow_steps);
    console.log('Current analysisResponse before update:', analysisResponse);
    console.log('Step 1 dropdown values:', {
      issueType: stepData.issueType,
      severity: stepData.severity,
      businessImpactCategory: stepData.businessImpactCategory
    });
    
    // Allow navigation to any step
    setRcaStep(stepNumber)
    
    // Load existing step data if available
    const stepResponse = stepData.rca_workflow_steps[stepNumber - 1] || ''
    console.log('Loading response for step', stepNumber, ':', stepResponse);
    console.log('Setting analysisResponse to:', stepResponse);
    debugSetAnalysisResponse(stepResponse)
    
    // Debug: Check if the response was set correctly
    setTimeout(() => {
      console.log('analysisResponse after update:', analysisResponse);
    }, 100);
  }

  // Show loading state with skeleton loaders instead of full page spinner
  if (loading || (isLoadingRcaData && !ticketData)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
          
          

          {/* RCA Workflow with skeleton loaders - only show ticket data skeleton */}
          <RCAWorkflow
            currentStep={rcaStep}
            totalSteps={4}
            stepData={stepData}
            setStepData={setStepData}
            stepTitle={getCurrentStepData().title}
            aiGuidance={getCurrentStepData().aiGuidance}
            response={analysisResponse}
            onResponseChange={debugSetAnalysisResponse}
            onNext={handleRcaNext}
            onPrevious={handleRcaPrevious}
            similarCases={null}
            similarCasesLoading={false}
            nextButtonText={rcaStep === 5 ? "Complete RCA →" : "Next Step →"}
            showPrevious={rcaStep > 1}
            canProceed={analysisResponse.trim().length > 0}
            onSaveProgress={handleSaveProgress}
            onGenerateReport={handleGenerateReport}
            ticketData={null}
            onStepClick={handleStepClick}
            problemStatementData={problemStatementData}
            isGeneratingProblemStatement={isGeneratingProblemStatement}
            setIsGeneratingProblemStatement={setIsGeneratingProblemStatement}
            hasAttemptedGeneration={hasAttemptedGeneration}
          />
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <FiAlertTriangle className="w-12 h-12 mx-auto mb-2" />
            <p className="text-lg font-semibold">Error Loading Ticket</p>
            <p className="text-sm text-gray-600">{error}</p>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* RCA Workflow */}
        <RCAWorkflow
          currentStep={rcaStep}
          totalSteps={4}
          stepData={stepData}
          setStepData={setStepData}
          stepTitle={getCurrentStepData().title}
          aiGuidance={getCurrentStepData().aiGuidance}
          response={analysisResponse}
          onResponseChange={debugSetAnalysisResponse}
          onNext={handleRcaNext}
          onPrevious={handleRcaPrevious}
          similarCases={similarCases}
          similarCasesLoading={similarCasesLoading}
          nextButtonText={rcaStep === 4 ? "Complete RCA →" : "Next Step →"}
          showPrevious={rcaStep > 1}
          canProceed={analysisResponse.trim().length > 0 || (stepData.rca_workflow_steps?.[rcaStep - 1]?.trim().length > 0)}
          onSaveProgress={handleSaveProgress}
          onGenerateReport={handleGenerateReport}
          ticketData={ticketData}
          onStepClick={handleStepClick}
          problemStatementData={problemStatementData}
          isGeneratingProblemStatement={isGeneratingProblemStatement}
          setIsGeneratingProblemStatement={setIsGeneratingProblemStatement}
          hasAttemptedGeneration={hasAttemptedGeneration}
          rcaResolvedData={rcaResolvedData}
          hasExistingRcaData={hasExistingRcaData}
          isLoadingRcaData={isLoadingRcaData}
          saveStepToDatabase={saveStepToDatabase}
        />
      </div>
    </div>
  )
}

export default Analysis