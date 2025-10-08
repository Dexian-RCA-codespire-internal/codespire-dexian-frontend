

// import React, { useState, useEffect, useMemo } from 'react'
// import { Textarea } from '../../ui/Textarea'
// import { Button } from '../../ui/Button'
// import { IoIosColorWand } from "react-icons/io"
// import { FiLoader } from "react-icons/fi"
// import { BsCheckCircle } from "react-icons/bs"
// import { FiChevronDown, FiChevronUp, FiUsers, FiCalendar, FiAlertTriangle, FiTool, FiTrendingUp } from "react-icons/fi"
// import { BsClock, BsLightning } from "react-icons/bs"
// import { aiService } from '../../../api/services/aiService'
// import EnhancementModal from '../../ui/EnhancementModal'
// import { useTextEnhancement } from '../../../hooks/useTextEnhancement'
// import PlaybookRecommender from '../../PlaybookRecommender'
// import { BsStars } from "react-icons/bs";

// const CorrectiveActionsStep = ({
//   ticketData,
//   stepData,
//   setStepData,
//   response,
//   onResponseChange,
//   isEnhancingCorrectiveActions,
//   setIsEnhancingCorrectiveActions, // kept for compatibility
//   aiGuidance,
//   onGuidanceResult,
//   rcaResolvedData = null,
//   hasExistingRcaData = false,
//   saveStepToDatabase = null
// }) => {
//   const [isGeneratingSolutions, setIsGeneratingSolutions] = useState(false)
//   const [generatedSolutions, setGeneratedSolutions] = useState(null)
//   const [expandedSolution, setExpandedSolution] = useState(null)
//   const [selectedSolution, setSelectedSolution] = useState(null)
//   const [hasGeneratedSolutions, setHasGeneratedSolutions] = useState(false)
//   const [isEnhancementModalOpen, setIsEnhancementModalOpen] = useState(false)
//   const [enhancementOptions, setEnhancementOptions] = useState([])
//   const [isPlaybookGenerating, setIsPlaybookGenerating] = useState(false)
//   const [existingRcaActions, setExistingRcaActions] = useState(null)

//   const { enhanceText, isLoading: isEnhancing, error: enhancementError } = useTextEnhancement()

//   /** 1) Load existing RCA corrective actions if present */
//   useEffect(() => {
//     if (hasExistingRcaData && rcaResolvedData?.ticket?.resolution_steps?.corrective_actions) {
//       const actions = rcaResolvedData.ticket.resolution_steps.corrective_actions
//       setExistingRcaActions(actions)
//     }
//   }, [hasExistingRcaData, rcaResolvedData])

//   /** 2) Restore from stepData if present */
//   useEffect(() => {
//     if (stepData?.correctiveActions) {
//       setGeneratedSolutions(stepData.correctiveActions.generatedSolutions || null)
//       setHasGeneratedSolutions(!!stepData.correctiveActions.generatedSolutions)
//     }
//   }, [stepData?.correctiveActions])

//   /** 3) Auto-generate if nothing exists */
//   useEffect(() => {
//     const hasExistingRcaCorrectiveData =
//       hasExistingRcaData &&
//       rcaResolvedData?.ticket?.resolution_steps?.corrective_actions?.completed

//     const hasExistingStepData =
//       stepData?.rca_workflow_steps?.[3] && stepData.rca_workflow_steps[3].trim().length > 0

//     if (hasExistingRcaCorrectiveData || hasExistingStepData) return

//     if (ticketData && !hasGeneratedSolutions && !stepData?.correctiveActions) {
//       generateSolutions()
//     }
//   }, [stepData?.correctiveActions, stepData?.rca_workflow_steps, hasExistingRcaData, rcaResolvedData])

//   const generateSolutions = async () => {
//     if (!ticketData) return

//     try {
//       setIsGeneratingSolutions(true)

//       const currentTicket = {
//         category: ticketData.category || 'General',
//         description: ticketData.description || '',
//         short_description: ticketData.short_description || '',
//         enhanced_problem: ticketData.enhanced_problem || stepData?.rca_workflow_steps?.[0] || '',
//         impact: Array.isArray(ticketData.impact) ? ticketData.impact : ticketData.impact ? [ticketData.impact] : [],
//         priority: ticketData.priority || 'Medium',
//         urgency: ticketData.urgency || 'Medium',
//         issueType: stepData?.issueType || ticketData.issueType || 'Performance',
//         severity: stepData?.severity || ticketData.severity || 'Medium',
//         businessImpactCategory: stepData?.businessImpactCategory || 'Service Availability',
//         impactLevel: stepData?.impact_level_step2 || 'Medium',
//         departmentAffected: stepData?.department_affected_step2 || 'IT Operations',
//         problemStatement: stepData?.rca_workflow_steps?.[0] || '',
//         impactAssessment: stepData?.rca_workflow_steps?.[1] || '',
//         rootCauseAnalysis: stepData?.rca_workflow_steps?.[2] || ''
//       }

//       const requestData = { currentTicket, similarTickets: [] }
//       const result = await aiService.solutionGeneration.generate(requestData)

//       if (result?.success && result?.solutions) {
//         setGeneratedSolutions(result)
//         setHasGeneratedSolutions(true)

//         if (result.solutions.length > 0) {
//           const firstSolution = result.solutions[0]
//           const solutionSummary = formatSolutionForTextarea(firstSolution)
//           onResponseChange?.(solutionSummary)
//           setSelectedSolution(firstSolution)
//         }

//         const correctiveActionsData = {
//           generatedSolutions: result,
//           timestamp: new Date().toISOString()
//         }

//         const firstSolution = result.solutions[0]
//         const correctiveActionsText = firstSolution
//           ? formatSolutionForTextarea(firstSolution)
//           : `Corrective actions generated with ${result.solutions.length} solution options.`

//         if (typeof setStepData === 'function') {
//           setStepData(prev => {
//             const newStepData = { ...prev }
//             newStepData.correctiveActions = correctiveActionsData
//             if (!newStepData.rca_workflow_steps) newStepData.rca_workflow_steps = ['', '', '', '']
//             newStepData.rca_workflow_steps[3] = correctiveActionsText
//             return newStepData
//           })
//         }

//         // Save normalized playbook using your schema
//         if (saveStepToDatabase && !hasExistingRcaData && result.solutions.length > 0) {
//           try {
//             const stepsToResolve = firstSolution.steps.map(step => ({
//               title: step.title,
//               description: step.description
//             }))
//             const saveData = {
//               title: firstSolution.title,
//               shortDes: firstSolution.description,
//               stepsToResolve
//             }
//             await saveStepToDatabase(4, saveData)
//           } catch (e) {
//             console.error('Error saving generated corrective actions:', e)
//           }
//         }
//       }
//     } catch (e) {
//       console.error('Error generating solutions:', e)
//       alert('Failed to generate solutions. Please try again.')
//     } finally {
//       setIsGeneratingSolutions(false)
//     }
//   }

//   const formatSolutionForTextarea = (solution) => {
//     return `${solution.title}

// Description: ${solution.description}

// Implementation Steps:
// ${solution.steps.map((step, index) => 
//   `${index + 1}. ${step.title} (${step.duration})
//    - ${step.description}
//    - Responsible: ${step.responsible}`
// ).join('\n\n')}

// Expected Outcome: ${solution.expectedOutcome}

// Risk Level: ${solution.riskLevel}
// Timeframe: ${solution.timeframe}
// Confidence: ${solution.confidence}%`
//   }

//   const handleSolutionSelect = (solution) => {
//     setSelectedSolution(solution)
//     const solutionSummary = formatSolutionForTextarea(solution)
//     onResponseChange?.(solutionSummary)
//   }

//   const toggleSolutionExpansion = (solutionId) => {
//     setExpandedSolution(expandedSolution === solutionId ? null : solutionId)
//   }

//   const getPriorityColor = (priority) => {
//     switch (priority?.toLowerCase()) {
//       case 'high': return 'text-red-600 bg-red-50 border-red-200'
//       case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200'
//       case 'low': return 'text-green-600 bg-green-50 border-green-200'
//       default: return 'text-gray-600 bg-gray-50 border-gray-200'
//     }
//   }

//   const getCategoryIcon = (category) => {
//     switch (category?.toLowerCase()) {
//       case 'immediate': return <BsLightning className="w-4 h-4" />
//       case 'short-term': return <BsClock className="w-4 h-4" />
//       case 'long-term': return <FiTrendingUp className="w-4 h-4" />
//       default: return <FiTool className="w-4 h-4" />
//     }
//   }

//   const handleEnhanceCorrectiveActions = async () => {
//     if (!response?.trim()) {
//       alert("Please enter some text in the corrective actions to enhance.")
//       return
//     }
//     setIsEnhancementModalOpen(true)
//     const reference = `${ticketData?.short_description || ""} ${ticketData?.description || ""}`.trim()
//     const result = await enhanceText(response, reference)
//     if (result && result.enhancedOptions) {
//       setEnhancementOptions(result.enhancedOptions)
//     } else if (enhancementError) {
//       alert(`Failed to enhance text: ${enhancementError}`)
//       setIsEnhancementModalOpen(false)
//     }
//   }

//   const handleSelectEnhancement = (enhancedText) => {
//     handleManualTextChange(enhancedText)
//     setIsEnhancementModalOpen(false)
//     setEnhancementOptions([])
//   }

//   const handleCloseModal = () => {
//     setIsEnhancementModalOpen(false)
//     setEnhancementOptions([])
//   }

//   const handlePlaybookLoadingChange = (isLoading) => {
//     setIsPlaybookGenerating(isLoading)
//     if (isLoading) {
//       setGeneratedSolutions(null)
//       setHasGeneratedSolutions(false)
//     }
//   }

//   const handlePlaybookGuidanceResult = (result) => {
//     if (result && result.solutions) {
//       setGeneratedSolutions(result)
//       setHasGeneratedSolutions(true)

//       if (result.solutions.length > 0) {
//         const firstSolution = result.solutions[0]
//         const solutionSummary = formatSolutionForTextarea(firstSolution)
//         onResponseChange?.(solutionSummary)
//         setSelectedSolution(firstSolution)
//       }

//       const correctiveActionsData = {
//         generatedSolutions: result,
//         timestamp: new Date().toISOString()
//       }

//       const firstSolution = result.solutions[0]
//       const correctiveActionsText = firstSolution
//         ? formatSolutionForTextarea(firstSolution)
//         : `Corrective actions generated from playbooks with ${result.solutions.length} solution options.`

//       if (typeof setStepData === 'function') {
//         setStepData(prev => {
//           const newStepData = { ...prev, correctiveActions: correctiveActionsData }
//           if (!newStepData.rca_workflow_steps) newStepData.rca_workflow_steps = ['', '', '', '']
//           newStepData.rca_workflow_steps[3] = correctiveActionsText
//           return newStepData
//         })
//       }
//     }
//   }

//   const handleManualTextChange = (newText) => {
//     onResponseChange?.(newText)
//     if (typeof setStepData === 'function') {
//       setStepData(prev => {
//         const newStepData = { ...prev }
//         if (!newStepData.rca_workflow_steps) newStepData.rca_workflow_steps = ['', '', '', '']
//         newStepData.rca_workflow_steps[3] = newText
//         return newStepData
//       })
//     }
//   }

//   /** ---- RIGHT PANE: derive a normalized Playbook object using your schema ----
//    * Priority: 1) existingRcaActions (already in your schema)
//    *           2) selectedSolution (map -> your schema)
//    */
//   const rightPanePlaybook = useMemo(() => {
//     // 1) If we already have existing RCA corrective actions in your schema, use them directly
//     if (existingRcaActions?.title || existingRcaActions?.shortDes || existingRcaActions?.stepsToResolve) {
//       return {
//         title: existingRcaActions.title || 'Existing Corrective Actions',
//         shortDes: existingRcaActions.shortDes || '',
//         stepsToResolve: (existingRcaActions.stepsToResolve || []).map(s => ({
//           title: s?.title || '',
//           description: s?.description || ''
//         }))
//       }
//     }

//     // 2) Else, map selectedSolution -> your schema
//     if (selectedSolution) {
//       return {
//         title: selectedSolution.title || '',
//         shortDes: selectedSolution.description || '',
//         stepsToResolve: (selectedSolution.steps || []).map(s => ({
//           title: s?.title || '',
//           description: s?.description || ''
//         }))
//       }
//     }

//     // 3) Else, if generatedSolutions exist, take first one
//     if (generatedSolutions?.solutions?.length) {
//       const s = generatedSolutions.solutions[0]
//       return {
//         title: s?.title || '',
//         shortDes: s?.description || '',
//         stepsToResolve: (s?.steps || []).map(x => ({
//           title: x?.title || '',
//           description: x?.description || ''
//         }))
//       }
//     }

//     return null
//   }, [existingRcaActions, selectedSolution, generatedSolutions])

//   return (
//     <div className="grid grid-cols-10 gap-5">
//       {/* LEFT: 70% */}

         
//       <div className="col-span-10 lg:col-span-7 space-y-4">
    
//            <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
//                   <div className="flex items-center gap-2 mb-2">
//                     <div className="w-5 h-5 rounded bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
//                       <BsStars className="w-3 h-3 text-white" />
//                     </div>
//                     <span className="text-xs font-semibold text-gray-900">AI Guidance</span>
//                   </div>
//                   <div className="text-xs text-gray-700 line-clamp-4">
//                     Have you previously set up alternative recovery methods like a recovery email or phone number for this account?
//                   </div>
//                 </div>


//           <div className="">
//             {(isGeneratingSolutions || isPlaybookGenerating) && (
//               <div className="flex items-center justify-center py-12">
//                 <div className="text-center">
//                   <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-violet-200 border-t-violet-600 mb-3"></div>
//                   <p className="text-violet-700 font-medium">
//                     {isPlaybookGenerating ? 'Generating solutions from selected playbooks...' : 'Analyzing and generating comprehensive solutions...'}
//                   </p>
//                 </div>
//               </div>
//             )}

//             {generatedSolutions && (
//               <div className="space-y-3">
//                 {generatedSolutions.solutions?.map((solution, index) => (
//                   <div
//                     key={solution.id || index}
//                     className={`border rounded-xl p-4 cursor-pointer transition-all ${
//                       (selectedSolution?.id ?? selectedSolution) === (solution.id ?? solution) // safe compare
//                         ? 'border-violet-500 bg-gradient-to-br from-violet-50 to-purple-50 shadow-md'
//                         : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-sm'
//                     }`}
//                     onClick={() => handleSolutionSelect(solution)}
//                   >
//                     <div className="flex items-start justify-between">
//                       <div className="flex-1">
//                         <div className="flex items-center gap-2 mb-2">
//                           {getCategoryIcon(solution.category)}
//                           <h4 className="font-semibold text-gray-900">{solution.title}</h4>
//                           <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getPriorityColor(solution.priority)}`}>
//                             {solution.priority}
//                           </span>
//                         </div>
//                         <p className="text-sm text-gray-600 mb-3">{solution.description}</p>

//                         <div className="flex items-center gap-3 text-xs text-gray-600">
                 
//                           <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-200">
//                             <BsCheckCircle className="w-3.5 h-3.5 text-green-600" />
//                             <span>{solution.confidence}% Confidence</span>
//                           </div>
//                           <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-200">
//                             <FiAlertTriangle className="w-3.5 h-3.5 text-amber-600" />
//                             <span>{solution.riskLevel} Risk</span>
//                           </div>
//                         </div>
//                       </div>

//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation()
//                           toggleSolutionExpansion(solution.id || index)
//                         }}
//                         className="ml-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
//                       >
//                         {expandedSolution === (solution.id || index) ? (
//                           <FiChevronUp className="w-5 h-5" />
//                         ) : (
//                           <FiChevronDown className="w-5 h-5" />
//                         )}
//                       </button>
//                     </div>

//                     {expandedSolution === (solution.id || index) && (
//                       <div className="mt-4 pt-4 border-t border-gray-200">
//                         <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
//                           <FiTool className="w-4 h-4 text-violet-600" />
//                           Implementation Steps
//                         </h5>
//                         <div className="space-y-2.5">
//                           {solution.steps?.map((step, stepIndex) => (
//                             <div key={stepIndex} className="bg-gray-50 rounded-lg p-3.5 border border-gray-200">
//                               <div className="flex items-start gap-3">
//                                 <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-full flex items-center justify-center text-xs font-semibold shadow-sm">
//                                   {step.step || stepIndex + 1}
//                                 </div>
//                                 <div className="flex-1">
//                                   <div className="flex items-center justify-between mb-1">
//                                     <h6 className="font-medium text-sm text-gray-900">{step.title}</h6>
//                                   </div>
//                                   <p className="text-sm text-gray-600 mb-2 leading-relaxed">{step.description}</p>
//                                   <div className="flex items-center gap-3 text-xs text-gray-500">
                
//                                   </div>

//                                   {!!step.requirements?.length && (
//                                     <div className="mt-2 pt-2 border-t border-gray-200">
//                                       <span className="text-xs font-medium text-gray-700">Requirements: </span>
//                                       <span className="text-xs text-gray-600">{step.requirements.join(', ')}</span>
//                                     </div>
//                                   )}
//                                 </div>
//                               </div>
//                             </div>
//                           ))}
//                         </div>

//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
      
//       </div>

//       {/* RIGHT: 30% */}
//       <div className="col-span-10 lg:col-span-3 space-y-5">
     

//         {/* Playbook Recommender (generate on the right) */}
//         <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
//           <div className="bg-gradient-to-r from-cyan-50 via-blue-50 to-sky-50 px-5 py-4 border-b border-gray-200">
//             <div className="flex items-center gap-2.5">
//               <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg shadow-sm">
//                 <FiTool className="w-5 h-5 text-white" />
//               </div>
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-900">Playbook Recommender</h3>
//                 <p className="text-sm text-gray-600">Generate solutions from curated playbooks</p>
//               </div>
//             </div>
//           </div>
//           <div className="p-5">
//             <PlaybookRecommender
//               ticketData={ticketData}
//               aiGuidanceQuestion={aiGuidance}
//               onGuidanceResult={handlePlaybookGuidanceResult}
//               onLoadingChange={handlePlaybookLoadingChange}
//             />
//           </div>
//         </div>
//       </div>

//       {/* Enhancement Modal */}
//       <EnhancementModal
//         isOpen={isEnhancementModalOpen}
//         onClose={handleCloseModal}
//         originalText={response}
//         onSelectOption={handleSelectEnhancement}
//         enhancedOptions={enhancementOptions}
//         isLoading={isEnhancing}
//         title="Enhance Corrective Actions"
//       />
//     </div>
//   )
// }

// export default CorrectiveActionsStep




import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Textarea } from '../../ui/Textarea'
import { Button } from '../../ui/Button'
import { IoIosColorWand } from "react-icons/io"
import { FiLoader } from "react-icons/fi"
import { BsCheckCircle } from "react-icons/bs"
import { FiChevronDown, FiChevronUp, FiUsers, FiCalendar, FiAlertTriangle, FiTool, FiTrendingUp } from "react-icons/fi"
import { BsClock, BsLightning } from "react-icons/bs"
import { aiService } from '../../../api/services/aiService'
import EnhancementModal from '../../ui/EnhancementModal'
import { useTextEnhancement } from '../../../hooks/useTextEnhancement'
import PlaybookRecommender from '../../PlaybookRecommender'
import { BsStars } from "react-icons/bs"

const CorrectiveActionsStep = ({
  ticketData,
  stepData,
  setStepData,
  response,
  onResponseChange,
  isEnhancingCorrectiveActions,
  setIsEnhancingCorrectiveActions,
  aiGuidance,
  onGuidanceResult,
  rcaResolvedData = null,
  hasExistingRcaData = false,
  saveStepToDatabase = null,
  isLoadingRcaData = false
}) => {
  const [isGeneratingSolutions, setIsGeneratingSolutions] = useState(false)
  const [generatedSolutions, setGeneratedSolutions] = useState(null)
  const [expandedSolution, setExpandedSolution] = useState(null)
  const [selectedSolution, setSelectedSolution] = useState(null)
  const [hasGeneratedSolutions, setHasGeneratedSolutions] = useState(false)
  const [isEnhancementModalOpen, setIsEnhancementModalOpen] = useState(false)
  const [enhancementOptions, setEnhancementOptions] = useState([])
  const [isPlaybookGenerating, setIsPlaybookGenerating] = useState(false)
  const [existingRcaActions, setExistingRcaActions] = useState(null)
  
  // Refs to prevent duplicate generation
  const hasInitialized = useRef(false)
  const isGenerating = useRef(false)

  const { enhanceText, isLoading: isEnhancing, error: enhancementError } = useTextEnhancement()

  /** 1) Load existing RCA corrective actions if present */
  useEffect(() => {
    // Only load existing RCA data if the corrective actions step was actually completed
    if (hasExistingRcaData && 
        rcaResolvedData?.ticket?.resolution_steps?.corrective_actions?.completed && 
        rcaResolvedData?.ticket?.resolution_steps?.corrective_actions) {
      
      console.log('CorrectiveActionsStep: Loading existing completed RCA corrective actions');
      
      const actions = rcaResolvedData.ticket.resolution_steps.corrective_actions
      setExistingRcaActions(actions)
      
      // If we have existing RCA data that was completed, mark as initialized and don't auto-generate
      hasInitialized.current = true
      
      // Convert existing RCA data to generatedSolutions format for consistency
      if (actions.title || actions.shortDes || actions.stepsToResolve) {
        const existingSolution = {
          id: 'existing-rca',
          title: actions.title || 'Existing Corrective Actions',
          description: actions.shortDes || '',
          steps: (actions.stepsToResolve || []).map((step, idx) => ({
            step: idx + 1,
            title: step.title || '',
            description: step.description || '',
            duration: 'N/A',
            responsible: 'N/A',
            requirements: []
          })),
          category: 'Immediate',
          priority: 'High',
          riskLevel: 'Low',
          timeframe: 'N/A',
          confidence: 100,
          expectedOutcome: 'Resolve the issue based on previous analysis'
        }
        
        setGeneratedSolutions({
          success: true,
          solutions: [existingSolution],
          metadata: { source: 'existing_rca' }
        })
        setHasGeneratedSolutions(true)
        setSelectedSolution(existingSolution)
        
        // Set the response text
        const formattedText = formatSolutionForTextarea(existingSolution)
        onResponseChange?.(formattedText)
      }
    } else {
      console.log('CorrectiveActionsStep: No existing completed RCA corrective actions found:', {
        hasExistingRcaData,
        correctiveActionsCompleted: rcaResolvedData?.ticket?.resolution_steps?.corrective_actions?.completed,
        hasCorrectiveActionsData: !!rcaResolvedData?.ticket?.resolution_steps?.corrective_actions
      });
    }
  }, [hasExistingRcaData, rcaResolvedData])

  /** 2) Restore from stepData if present */
  useEffect(() => {
    if (stepData?.correctiveActions?.generatedSolutions) {
      const savedSolutions = stepData.correctiveActions.generatedSolutions
      setGeneratedSolutions(savedSolutions)
      setHasGeneratedSolutions(true)
      hasInitialized.current = true
      
      // Restore selected solution if available
      if (savedSolutions.solutions?.length > 0) {
        const firstSolution = savedSolutions.solutions[0]
        setSelectedSolution(firstSolution)
        
        // Restore response text if not already set
        if (!response || response.trim().length === 0) {
          const formattedText = formatSolutionForTextarea(firstSolution)
          onResponseChange?.(formattedText)
        }
      }
    }
  }, [stepData?.correctiveActions])

  /** 3) Auto-generate if nothing exists - with proper guards */
  useEffect(() => {
    // Don't generate if already initialized or currently generating
    if (hasInitialized.current || isGenerating.current) {
      return
    }

    // Don't proceed if we're still loading ticket data or RCA resolved data
    if (!ticketData || isLoadingRcaData) {
      console.log('CorrectiveActionsStep: Waiting for data to load...', {
        hasTicketData: !!ticketData,
        isLoadingRcaData
      });
      return;
    }

    // Check if we have existing data from RCA that was actually completed
    const hasExistingRcaCorrectiveData =
      hasExistingRcaData &&
      rcaResolvedData?.ticket?.resolution_steps?.corrective_actions?.completed &&
      rcaResolvedData?.ticket?.resolution_steps?.corrective_actions?.title

    // Check if we have existing step data
    const hasExistingStepData =
      (stepData?.rca_workflow_steps?.[3] && stepData.rca_workflow_steps[3].trim().length > 0) ||
      (stepData?.correctiveActions?.generatedSolutions)

    console.log('CorrectiveActionsStep: Decision factors:', {
      hasExistingRcaCorrectiveData,
      hasExistingStepData,
      rcaCorrectiveActionsCompleted: rcaResolvedData?.ticket?.resolution_steps?.corrective_actions?.completed,
      hasRcaCorrectiveActionsData: !!rcaResolvedData?.ticket?.resolution_steps?.corrective_actions?.title,
      hasTicketData: !!ticketData,
      hasGeneratedSolutions,
      isLoadingRcaData
    });

    // Don't generate if we have existing data
    if (hasExistingRcaCorrectiveData || hasExistingStepData) {
      console.log('CorrectiveActionsStep: Skipping generation - existing data found:', {
        hasExistingRcaCorrectiveData,
        hasExistingStepData
      });
      hasInitialized.current = true
      return
    }

    // Only generate if we have ticket data and haven't generated yet
    if (ticketData && !hasGeneratedSolutions) {
      console.log('CorrectiveActionsStep: Starting auto-generation with ticket data available');
      hasInitialized.current = true
      generateSolutions()
    }
  }, [ticketData, hasExistingRcaData, rcaResolvedData, stepData, hasGeneratedSolutions, isLoadingRcaData]) // Add isLoadingRcaData dependency

  const generateSolutions = async () => {
    if (!ticketData || isGenerating.current) return

    try {
      isGenerating.current = true
      setIsGeneratingSolutions(true)

      const currentTicket = {
        category: ticketData.category || 'General',
        description: ticketData.description || '',
        short_description: ticketData.short_description || '',
        enhanced_problem: ticketData.enhanced_problem || stepData?.rca_workflow_steps?.[0] || '',
        impact: Array.isArray(ticketData.impact) ? ticketData.impact : ticketData.impact ? [ticketData.impact] : [],
        priority: ticketData.priority || 'Medium',
        urgency: ticketData.urgency || 'Medium',
        issueType: stepData?.issueType || ticketData.issueType || 'Performance',
        severity: stepData?.severity || ticketData.severity || 'Medium',
        businessImpactCategory: stepData?.businessImpactCategory || 'Service Availability',
        impactLevel: stepData?.impact_level_step2 || 'Medium',
        departmentAffected: stepData?.department_affected_step2 || 'IT Operations',
        problemStatement: stepData?.rca_workflow_steps?.[0] || '',
        impactAssessment: stepData?.rca_workflow_steps?.[1] || '',
        rootCauseAnalysis: stepData?.rca_workflow_steps?.[2] || ''
      }

      const requestData = { currentTicket, similarTickets: [] }
      const result = await aiService.solutionGeneration.generate(requestData)

      if (result?.success && result?.solutions && result.solutions.length > 0) {
        setGeneratedSolutions(result)
        setHasGeneratedSolutions(true)

        const firstSolution = result.solutions[0]
        const solutionSummary = formatSolutionForTextarea(firstSolution)
        onResponseChange?.(solutionSummary)
        setSelectedSolution(firstSolution)

        const correctiveActionsData = {
          generatedSolutions: result,
          timestamp: new Date().toISOString()
        }

        // Update step data
        if (typeof setStepData === 'function') {
          setStepData(prev => {
            const newStepData = { ...prev }
            newStepData.correctiveActions = correctiveActionsData
            if (!newStepData.rca_workflow_steps) newStepData.rca_workflow_steps = ['', '', '', '']
            newStepData.rca_workflow_steps[3] = solutionSummary
            return newStepData
          })
        }

        // Save to database if available and not existing RCA data
        if (saveStepToDatabase && !hasExistingRcaData) {
          try {
            const stepsToResolve = firstSolution.steps.map(step => ({
              title: step.title,
              description: step.description
            }))
            const saveData = {
              title: firstSolution.title,
              shortDes: firstSolution.description,
              stepsToResolve
            }
            await saveStepToDatabase(4, saveData)
          } catch (e) {
            console.error('Error saving generated corrective actions:', e)
          }
        }
      }
    } catch (e) {
      console.error('Error generating solutions:', e)
      alert('Failed to generate solutions. Please try again.')
    } finally {
      setIsGeneratingSolutions(false)
      isGenerating.current = false
    }
  }

  const formatSolutionForTextarea = (solution) => {
    if (!solution) return ''
    
    return `${solution.title || 'Solution'}

Description: ${solution.description || 'No description available'}

Implementation Steps:
${(solution.steps || []).map((step, index) => 
  `${index + 1}. ${step.title || 'Step ' + (index + 1)} ${step.duration ? `(${step.duration})` : ''}
   - ${step.description || 'No description'}
   ${step.responsible ? `- Responsible: ${step.responsible}` : ''}`
).join('\n\n')}

Expected Outcome: ${solution.expectedOutcome || 'N/A'}

Risk Level: ${solution.riskLevel || 'Medium'}
Timeframe: ${solution.timeframe || 'N/A'}
Confidence: ${solution.confidence || 0}%`
  }

  const handleSolutionSelect = (solution) => {
    if (!solution) return
    
    setSelectedSolution(solution)
    const solutionSummary = formatSolutionForTextarea(solution)
    onResponseChange?.(solutionSummary)
    
    // Update step data when manually selecting a solution
    if (typeof setStepData === 'function') {
      setStepData(prev => {
        const newStepData = { ...prev }
        if (!newStepData.rca_workflow_steps) newStepData.rca_workflow_steps = ['', '', '', '']
        newStepData.rca_workflow_steps[3] = solutionSummary
        return newStepData
      })
    }
  }

  const toggleSolutionExpansion = (solutionId) => {
    setExpandedSolution(expandedSolution === solutionId ? null : solutionId)
  }

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'immediate': return <BsLightning className="w-4 h-4" />
      case 'short-term': return <BsClock className="w-4 h-4" />
      case 'long-term': return <FiTrendingUp className="w-4 h-4" />
      default: return <FiTool className="w-4 h-4" />
    }
  }

  const handleEnhanceCorrectiveActions = async () => {
    if (!response?.trim()) {
      alert("Please enter some text in the corrective actions to enhance.")
      return
    }
    setIsEnhancementModalOpen(true)
    const reference = `${ticketData?.short_description || ""} ${ticketData?.description || ""}`.trim()
    const result = await enhanceText(response, reference)
    if (result && result.enhancedOptions) {
      setEnhancementOptions(result.enhancedOptions)
    } else if (enhancementError) {
      alert(`Failed to enhance text: ${enhancementError}`)
      setIsEnhancementModalOpen(false)
    }
  }

  const handleSelectEnhancement = (enhancedText) => {
    handleManualTextChange(enhancedText)
    setIsEnhancementModalOpen(false)
    setEnhancementOptions([])
  }

  const handleCloseModal = () => {
    setIsEnhancementModalOpen(false)
    setEnhancementOptions([])
  }

  const handlePlaybookLoadingChange = (isLoading) => {
    setIsPlaybookGenerating(isLoading)
    if (isLoading) {
      // Don't clear solutions while loading
      // setGeneratedSolutions(null)
      // setHasGeneratedSolutions(false)
    }
  }

  const handlePlaybookGuidanceResult = (result) => {
    if (result && result.solutions && result.solutions.length > 0) {
      setGeneratedSolutions(result)
      setHasGeneratedSolutions(true)

      const firstSolution = result.solutions[0]
      const solutionSummary = formatSolutionForTextarea(firstSolution)
      onResponseChange?.(solutionSummary)
      setSelectedSolution(firstSolution)

      const correctiveActionsData = {
        generatedSolutions: result,
        timestamp: new Date().toISOString()
      }

      if (typeof setStepData === 'function') {
        setStepData(prev => {
          const newStepData = { ...prev, correctiveActions: correctiveActionsData }
          if (!newStepData.rca_workflow_steps) newStepData.rca_workflow_steps = ['', '', '', '']
          newStepData.rca_workflow_steps[3] = solutionSummary
          return newStepData
        })
      }
    }
  }

  const handleManualTextChange = (newText) => {
    onResponseChange?.(newText)
    if (typeof setStepData === 'function') {
      setStepData(prev => {
        const newStepData = { ...prev }
        if (!newStepData.rca_workflow_steps) newStepData.rca_workflow_steps = ['', '', '', '']
        newStepData.rca_workflow_steps[3] = newText
        return newStepData
      })
    }
  }

  /** Get selected solution ID safely */
  const getSelectedSolutionId = (solution) => {
    if (!solution) return null
    return solution.id || JSON.stringify(solution)
  }

  const isSelectedSolution = (solution) => {
    if (!selectedSolution || !solution) return false
    return getSelectedSolutionId(selectedSolution) === getSelectedSolutionId(solution)
  }

  /** Normalized Playbook object for right pane */
  const rightPanePlaybook = useMemo(() => {
    // 1) Existing RCA actions (only if completed)
    if (existingRcaActions?.title || existingRcaActions?.shortDes || existingRcaActions?.stepsToResolve) {
      return {
        title: existingRcaActions.title || 'Existing Corrective Actions',
        shortDes: existingRcaActions.shortDes || '',
        stepsToResolve: (existingRcaActions.stepsToResolve || []).map(s => ({
          title: s?.title || '',
          description: s?.description || ''
        }))
      }
    }

    // 2) Selected solution
    if (selectedSolution) {
      return {
        title: selectedSolution.title || '',
        shortDes: selectedSolution.description || '',
        stepsToResolve: (selectedSolution.steps || []).map(s => ({
          title: s?.title || '',
          description: s?.description || ''
        }))
      }
    }

    // 3) First generated solution
    if (generatedSolutions?.solutions?.length) {
      const s = generatedSolutions.solutions[0]
      return {
        title: s?.title || '',
        shortDes: s?.description || '',
        stepsToResolve: (s?.steps || []).map(x => ({
          title: x?.title || '',
          description: x?.description || ''
        }))
      }
    }

    return null
  }, [existingRcaActions, selectedSolution, generatedSolutions])

  return (
    <div className="grid grid-cols-10 gap-5">
      {/* LEFT: 70% */}
      <div className="col-span-10 lg:col-span-7 space-y-4">
        <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
              <BsStars className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs font-semibold text-gray-900">AI Guidance</span>
          </div>
          <div className="text-xs text-gray-700 line-clamp-4">
            {aiGuidance || "Have you previously set up alternative recovery methods like a recovery email or phone number for this account?"}
          </div>
        </div>

        <div className="">
          {(isGeneratingSolutions || isPlaybookGenerating) && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-violet-200 border-t-violet-600 mb-3"></div>
                <p className="text-violet-700 font-medium">
                  {isPlaybookGenerating ? 'Generating solutions from selected playbooks...' : 'Analyzing and generating comprehensive solutions...'}
                </p>
              </div>
            </div>
          )}

          {generatedSolutions && generatedSolutions.solutions && (
            <div className="space-y-3">
              {generatedSolutions.solutions.map((solution, index) => {
                const solutionId = solution.id || `solution-${index}`
                return (
                  <div
                    key={solutionId}
                    className={`border rounded-xl p-4 cursor-pointer transition-all ${
                      isSelectedSolution(solution)
                        ? 'border-violet-500 '
                        : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-sm'
                    }`}
                    onClick={() => handleSolutionSelect(solution)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getCategoryIcon(solution.category)}
                          <h4 className="font-semibold text-gray-900">{solution.title || 'Solution'}</h4>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getPriorityColor(solution.priority)}`}>
                            {solution.priority || 'Medium'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{solution.description || 'No description available'}</p>

                        <div className="flex items-center gap-3 text-xs text-gray-600">
                          <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-200">
                            <BsCheckCircle className="w-3.5 h-3.5 text-green-600" />
                            <span>{solution.confidence || 0}% Confidence</span>
                          </div>
                          <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-200">
                            <FiAlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            <span>{solution.riskLevel || 'Medium'} Risk</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleSolutionExpansion(solutionId)
                        }}
                        className="ml-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        {expandedSolution === solutionId ? (
                          <FiChevronUp className="w-5 h-5" />
                        ) : (
                          <FiChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    {expandedSolution === solutionId && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <FiTool className="w-4 h-4 text-violet-600" />
                          Implementation Steps
                        </h5>
                        <div className="space-y-2.5">
                          {(solution.steps || []).map((step, stepIndex) => (
                            <div key={stepIndex} className="bg-gray-50 rounded-lg p-3.5 border border-gray-200">
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-full flex items-center justify-center text-xs font-semibold shadow-sm">
                                  {step.step || stepIndex + 1}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <h6 className="font-medium text-sm text-gray-900">{step.title || `Step ${stepIndex + 1}`}</h6>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-2 leading-relaxed">{step.description || 'No description available'}</p>
                                  
                                  {(step.duration || step.responsible) && (
                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                      {step.duration && <span>Duration: {step.duration}</span>}
                                      {step.responsible && <span>Responsible: {step.responsible}</span>}
                                    </div>
                                  )}

                                  {step.requirements?.length > 0 && (
                                    <div className="mt-2 pt-2 border-t border-gray-200">
                                      <span className="text-xs font-medium text-gray-700">Requirements: </span>
                                      <span className="text-xs text-gray-600">{step.requirements.join(', ')}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: 30% */}
      <div className="col-span-10 lg:col-span-3 space-y-5">
        {/* Playbook Recommender */}
        <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50   border-purple-200">
            <div className="flex items-center gap-2.5">
              <div className="p-1 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg shadow-sm">
                <FiTool className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-md font-semibold text-gray-900">Playbook Recommender</h3>
                <p className="text-xs text-gray-700 line-clamp-4">Generate solutions from playbooks</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <PlaybookRecommender
              ticketData={ticketData}
              aiGuidanceQuestion={aiGuidance}
              onGuidanceResult={handlePlaybookGuidanceResult}
              onLoadingChange={handlePlaybookLoadingChange}
            />
          </div>
        </div>
      </div>

      {/* Enhancement Modal */}
      <EnhancementModal
        isOpen={isEnhancementModalOpen}
        onClose={handleCloseModal}
        originalText={response}
        onSelectOption={handleSelectEnhancement}
        enhancedOptions={enhancementOptions}
        isLoading={isEnhancing}
        title="Enhance Corrective Actions"
      />
    </div>
  )
}

export default CorrectiveActionsStep