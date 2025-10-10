import React, { useState, useEffect, useRef } from 'react'
import { Textarea } from '../../ui/Textarea'
import { Button } from '../../ui/Button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select'
import { IoIosColorWand } from "react-icons/io"
import { FiLoader, FiEdit3 } from "react-icons/fi"
import { BsStars } from "react-icons/bs"
import { RiRobot2Line } from "react-icons/ri"
import { Skeleton } from '../../ui/skeleton'
import { aiService } from '../../../api/services/aiService'
import EnhancementModal from '../../ui/EnhancementModal'
import { useTextEnhancement } from '../../../hooks/useTextEnhancement'

const ImpactAssessmentStep = ({
  stepData,
  setStepData,
  ticketData,
  response,
  onResponseChange,
  isGeneratingImpactAssessment,
  setIsGeneratingImpactAssessment,
  hasAttemptedImpactGeneration,
  setHasAttemptedImpactGeneration,
  currentStep = 2, // Default to step 2 since this component is only rendered for step 2
  rcaResolvedData = null,
  hasExistingRcaData = false,
  isLoadingRcaData = false
}) => {
  const [impactLevel, setImpactLevel] = useState('')
  const [departmentAffected, setDepartmentAffected] = useState('')
  const [isEnhancementModalOpen, setIsEnhancementModalOpen] = useState(false)
  const [enhancementOptions, setEnhancementOptions] = useState([])
  const [impactAssessments, setImpactAssessments] = useState([])
  const [isEditMode, setIsEditMode] = useState(false)
  
  // Use ref to track if API has been called to prevent loops
  const hasCalledAPI = useRef(false)
  
  // Use the custom hook for text enhancement
  const { enhanceText, isLoading: isEnhancing, error: enhancementError } = useTextEnhancement()

  // Ensure default values are set if none exist
  useEffect(() => {
    if (currentStep === 2 && stepData) {
      // Set default impact level if not set
      if (!stepData.impact_level_step2 && !impactLevel) {
   
        const defaultImpactLevel = 'sev3' // Sev 3 - Normal Impact
        setImpactLevel(defaultImpactLevel)
        setStepData((prevData) => ({
          ...prevData,
          impact_level_step2: defaultImpactLevel
        }))
      }
      
      // Set default department if not set
      if (!stepData.department_affected_step2 && !departmentAffected) {
      const defaultDepartment = 'it_operations' // IT Operations
        setDepartmentAffected(defaultDepartment)
        setStepData((prevData) => ({
          ...prevData,
          department_affected_step2: defaultDepartment
        }))
      }
    }
  }, [currentStep, stepData, impactLevel, departmentAffected, setStepData])

  // Load existing dropdown values when stepData changes
  useEffect(() => {
    if (stepData) {
      console.log('ImpactAssessmentStep: Loading existing data from stepData:', stepData);
      
      if (stepData.impact_level_step2) {
        setImpactLevel(stepData.impact_level_step2)
        console.log('ImpactAssessmentStep: Restored impact level:', stepData.impact_level_step2);
      }
      if (stepData.department_affected_step2) {
        setDepartmentAffected(stepData.department_affected_step2)
        console.log('ImpactAssessmentStep: Restored department:', stepData.department_affected_step2);
      }
      
      // Restore impact assessments if they exist in stepData
      if (stepData.impact_assessments_step2 && Array.isArray(stepData.impact_assessments_step2) && stepData.impact_assessments_step2.length > 0) {
        setImpactAssessments(stepData.impact_assessments_step2);
        console.log('ImpactAssessmentStep: Restored impact assessments from stepData:', stepData.impact_assessments_step2);
        
        // Auto-populate the first assessment if no response is set yet
        if (stepData.impact_assessments_step2.length > 0 && (!response || !response.trim())) {
          const firstAssessment = stepData.impact_assessments_step2[0];
          
          // Auto-populate description
          if (firstAssessment.impacts) {
                     onResponseChange(firstAssessment.impacts);
          }
          
          // Auto-populate dropdown fields if they're not already set
          if (!impactLevel && firstAssessment.impactLevel) {
            const impactLevelMap = {
              'Sev 1 - Critical Impact': 'sev1',
              'Sev 2 - Major Impact': 'sev2', 
              'Sev 3 - Normal Impact': 'sev3',
              'Sev 4 - Minor Impact': 'sev4'
            }
            const mappedLevel = impactLevelMap[firstAssessment.impactLevel] || 'sev3'
            setImpactLevel(mappedLevel)
            console.log('ImpactAssessmentStep: Auto-populated impact level:', mappedLevel)
          }
          
          if (!departmentAffected && firstAssessment.department) {
            const departmentMap = {
              'Customer Support': 'customer_support',
              'Sales': 'sales',
              'IT Operations': 'it_operations',
              'Finance': 'finance',
              'Human Resources': 'hr',
              'Other': 'other'
            }
            const mappedDepartment = departmentMap[firstAssessment.department] || 'it_operations'
            setDepartmentAffected(mappedDepartment)
            console.log('ImpactAssessmentStep: Auto-populated department:', mappedDepartment)
          }
        }
        
        // Set the flag to indicate we have existing data (don't call API)
        hasCalledAPI.current = true;
        console.log('ImpactAssessmentStep: Impact assessments exist, skipping API call');
      }
    }
  }, [stepData])

  // Debug: Log when response changes
  useEffect(() => {
    console.log('ImpactAssessmentStep: response changed:', response);
    console.log('ImpactAssessmentStep: response length:', response?.length || 0);
    console.log('ImpactAssessmentStep: stepData.rca_workflow_steps[1]:', stepData?.rca_workflow_steps?.[1]);
  }, [response, stepData])

  // Load existing impact assessment data from stepData if response is empty
  useEffect(() => {
    if (currentStep === 2 && stepData?.rca_workflow_steps?.[1] && stepData.rca_workflow_steps[1].trim().length > 0 && (!response || response.trim().length === 0)) {
      console.log('Loading existing impact assessment data from stepData');
      onResponseChange(stepData.rca_workflow_steps[1]);
    }
  }, [currentStep, stepData, response, onResponseChange])

  // Ensure impact assessments are preserved when component mounts with existing data
  useEffect(() => {
    if (stepData?.impact_assessments_step2 && impactAssessments.length === 0) {
      setImpactAssessments(stepData.impact_assessments_step2);
      console.log('ImpactAssessmentStep: Restored impact assessments on mount:', stepData.impact_assessments_step2);
    }
  }, [stepData?.impact_assessments_step2, impactAssessments.length])

  // Reset API call flag when leaving step 2
  useEffect(() => {
    if (currentStep !== 2) {
      hasCalledAPI.current = false
      console.log('ImpactAssessmentStep: Reset API call flag (left step 2)')
    }
  }, [currentStep])

  // Ensure stepData is updated when dropdown values change
  useEffect(() => {
    if (currentStep === 2 && (impactLevel || departmentAffected)) {
      setStepData((prevData) => ({
        ...prevData,
        impact_level_step2: impactLevel || prevData.impact_level_step2,
        department_affected_step2: departmentAffected || prevData.department_affected_step2
      }))
    }
  }, [impactLevel, departmentAffected, currentStep, setStepData])

  // Generate impact assessment when component mounts (only for step 2)
  useEffect(() => {
    const generateImpactAssessment = async () => {
      // Don't proceed if we're still loading ticket data or RCA resolved data
      if (!ticketData || isLoadingRcaData) {
        console.log('ImpactAssessmentStep: Waiting for data to load...', {
          hasTicketData: !!ticketData,
          isLoadingRcaData
        });
        return;
      }
      
      // Check if RCA resolved data already has impact analysis
      const hasExistingRcaImpactData = hasExistingRcaData && 
        rcaResolvedData?.ticket?.resolution_steps?.impact_analysis?.completed
      
      // Check if impact assessment data already exists
      const hasExistingData = response && response.trim().length > 0
      const hasExistingDataInStepData = stepData?.rca_workflow_steps?.[1] && stepData.rca_workflow_steps[1].trim().length > 0
      const hasExistingImpactAssessments = impactAssessments.length > 0 || (stepData?.impact_assessments_step2 && stepData.impact_assessments_step2.length > 0)
      
      console.log('ImpactAssessmentStep: hasExistingRcaImpactData:', hasExistingRcaImpactData);
      console.log('ImpactAssessmentStep: hasExistingData:', hasExistingData);
      console.log('ImpactAssessmentStep: hasExistingDataInStepData:', hasExistingDataInStepData);
      console.log('ImpactAssessmentStep: hasExistingImpactAssessments:', hasExistingImpactAssessments);
      console.log('ImpactAssessmentStep: currentStep:', currentStep);
      console.log('ImpactAssessmentStep: isGeneratingImpactAssessment:', isGeneratingImpactAssessment);
      console.log('ImpactAssessmentStep: hasAttemptedImpactGeneration:', hasAttemptedImpactGeneration);
      
      // Skip API call if we have existing RCA data for this step
      if (hasExistingRcaImpactData) {
        console.log('ImpactAssessmentStep: Skipping API call - existing RCA data found');
        return
      }
      
       // Only call API if no impact assessments exist yet and we have ticket data
       if (currentStep === 2 && stepData && ticketData && !isGeneratingImpactAssessment && !hasCalledAPI.current && impactAssessments.length === 0 && (!stepData.impact_assessments_step2 || stepData.impact_assessments_step2.length === 0)) {
        console.log('ImpactAssessmentStep: Calling API to get impact assessments (no existing data found, ticket data available)');
        hasCalledAPI.current = true
        try {
          setIsGeneratingImpactAssessment(true)
          setHasAttemptedImpactGeneration(true)
          
          // Check if we have the required data from previous steps
          if (stepData.rca_workflow_steps[0]) {
            const requestData = {
              problemStatement: stepData.rca_workflow_steps[0],
              timelineContext: stepData.rca_workflow_steps[0] // Use problem statement as context since timeline is removed
            }
            
            const response = await aiService.impactAssessment.analyze(requestData)
            
            if (response.success && response.data && response.data.impactAssessments) {
              // Store the impact assessments for display in sidebar
              setImpactAssessments(response.data.impactAssessments)
              
              // Save impact assessments to stepData for persistence
              setStepData((prevData) => ({
                ...prevData,
                impact_assessments_step2: response.data.impactAssessments
              }))
              
              console.log('ImpactAssessmentStep: Stored impact assessments:', response.data.impactAssessments)
              
              // Use the first impact assessment as the default selection
              const firstAssessment = response.data.impactAssessments[0]
              if (firstAssessment) {
                console.log('ImpactAssessmentStep: Auto-selecting first assessment:', firstAssessment)
                
                // Map AI impact level to our dropdown values
                const impactLevelMap = {
                  'Sev 1 - Critical Impact': 'sev1',
                  'Sev 2 - Major Impact': 'sev2', 
                  'Sev 3 - Normal Impact': 'sev3',
                  'Sev 4 - Minor Impact': 'sev4'
                }
                
                // Map AI department to our dropdown values
                const departmentMap = {
                  'Customer Support': 'customer_support',
                  'Sales': 'sales',
                  'IT Operations': 'it_operations',
                  'Finance': 'finance',
                  'Human Resources': 'hr',
                  'Other': 'other'
                }
                
                // Set the impact level from first assessment
                const mappedImpactLevel = impactLevelMap[firstAssessment.impactLevel] || ''
                if (mappedImpactLevel) {
                  setImpactLevel(mappedImpactLevel)
                  setStepData((prevData) => ({
                    ...prevData,
                    impact_level_step2: mappedImpactLevel
                  }))
                  console.log('ImpactAssessmentStep: Set impact level to:', mappedImpactLevel)
                }
                
                // Set the department affected from first assessment
                const mappedDepartment = departmentMap[firstAssessment.department] || ''
                if (mappedDepartment) {
                  setDepartmentAffected(mappedDepartment)
                  setStepData((prevData) => ({
                    ...prevData,
                    department_affected_step2: mappedDepartment
                  }))
                  console.log('ImpactAssessmentStep: Set department to:', mappedDepartment)
                }
                
                // Set the impact assessment description from first assessment
                if (firstAssessment.impacts) {
                 onResponseChange(firstAssessment.impacts)
                }
              }
            }
          }
        } catch (error) {
          console.error('Error generating impact assessment:', error)
          alert('Failed to generate AI impact assessment. Please fill in the fields manually.')
        } finally {
          setIsGeneratingImpactAssessment(false)
        }
      }
    }
    
     generateImpactAssessment()
   }, [currentStep, stepData, isGeneratingImpactAssessment, hasAttemptedImpactGeneration, onResponseChange, setStepData, response, hasExistingRcaData, rcaResolvedData, ticketData, isLoadingRcaData])

  // Handle opening enhancement modal
  const handleEnhanceImpactAssessment = async () => {
    if (!response.trim()) {
      alert("Please enter some text in the impact assessment to enhance.");
      return;
    }

    setIsEnhancementModalOpen(true);
    
    // Call the enhancement API
    const reference = `${ticketData?.short_description || ""} ${ticketData?.description || ""}`.trim();
    const result = await enhanceText(response, reference);
    
    if (result && result.enhancedOptions) {
      setEnhancementOptions(result.enhancedOptions);
    } else if (enhancementError) {
      alert(`Failed to enhance text: ${enhancementError}`);
      setIsEnhancementModalOpen(false);
    }
  };

  // Handle selecting an enhancement option
  const handleSelectEnhancement = (enhancedText) => {
    onResponseChange(enhancedText);
    setIsEnhancementModalOpen(false);
    setEnhancementOptions([]);
  };

  // Handle closing the modal
  const handleCloseModal = () => {
    setIsEnhancementModalOpen(false);
    setEnhancementOptions([]);
  };

  // Handle edit mode toggle
  const handleEditModeToggle = () => {
    setIsEditMode(!isEditMode);
  };

  // Handle clicking on impact assessment
  const handleImpactAssessmentClick = (assessment) => {
    onResponseChange(assessment.impacts);
    
    // Update dropdowns based on selected assessment
    const impactLevelMap = {
      'Sev 1 - Critical Impact': 'sev1',
      'Sev 2 - Major Impact': 'sev2', 
      'Sev 3 - Normal Impact': 'sev3',
      'Sev 4 - Minor Impact': 'sev4'
    }
    
    const departmentMap = {
      'Customer Support': 'customer_support',
      'Sales': 'sales',
      'IT Operations': 'it_operations',
      'Finance': 'finance',
      'Human Resources': 'hr',
      'Other': 'other'
    }
    
    const mappedImpactLevel = impactLevelMap[assessment.impactLevel] || ''
    if (mappedImpactLevel) {
      setImpactLevel(mappedImpactLevel)
      setStepData((prevData) => ({
        ...prevData,
        impact_level_step2: mappedImpactLevel
      }))
    }
    
    const mappedDepartment = departmentMap[assessment.department] || ''
    if (mappedDepartment) {
      setDepartmentAffected(mappedDepartment)
      setStepData((prevData) => ({
        ...prevData,
        department_affected_step2: mappedDepartment
      }))
    }
    
    // Ensure impact assessments are preserved in stepData
    setStepData((prevData) => ({
      ...prevData,
      impact_assessments_step2: impactAssessments
    }))
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Main Content */}
      <div className="lg:col-span-2">
        <div className="space-y-6">
          {/* AI Guidance Section - Keep unchanged */}
        <div className="relative">
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
          <Button
            onClick={() => setIsEditMode(!isEditMode)}
            className="absolute top-3 right-3 p-1.5 bg-white/80 hover:bg-white border border-gray-200 rounded-md shadow-sm transition-all duration-200"
          >
            <FiEdit3 className="w-4 h-4 text-gray-600" />
          </Button>
        </div>

      {/* Skeleton Loader for Generating State */}
      {isGeneratingImpactAssessment ? (
        <div className="space-y-6">
          {/* Dropdown Fields Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          
          {/* Textarea Skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      ) : (
        <>

      {/* Dropdown Fields Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700 tracking-wide">
            Impact Level
          </label>
          <Select 
            value={impactLevel} 
            onValueChange={(value) => {
              setImpactLevel(value)
              setStepData((prevData) => ({
                ...prevData,
                impact_level_step2: value
              }))
            }}
            disabled={!isEditMode && !isGeneratingImpactAssessment}
          >
            <SelectTrigger className={`h-10 text-sm font-medium shadow-sm ${!isEditMode && !isGeneratingImpactAssessment ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}>
              <SelectValue placeholder="Select impact level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sev1">Sev 1 - Critical Impact</SelectItem>
              <SelectItem value="sev2">Sev 2 - Major Impact</SelectItem>
              <SelectItem value="sev3">Sev 3 - Normal Impact</SelectItem>
              <SelectItem value="sev4">Sev 4 - Minor Impact</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700 tracking-wide">
            Department Affected
          </label>
          <Select 
            value={departmentAffected} 
            onValueChange={(value) => {
              setDepartmentAffected(value)
              setStepData((prevData) => ({
                ...prevData,
                department_affected_step2: value
              }))
            }}
            disabled={!isEditMode && !isGeneratingImpactAssessment}
          >
            <SelectTrigger className={`h-10 text-sm font-medium shadow-sm ${!isEditMode && !isGeneratingImpactAssessment ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="customer_support">Customer Support</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="it_operations">IT Operations</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="hr">Human Resources</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Impact Assessment Description */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-semibold text-gray-700 tracking-wide">
            Impact Assessment Description
          </label>
      
        </div>
        <div className="relative">
          {isEditMode ? (
            <Textarea
              value={response}
              onChange={(e) => {
                onResponseChange(e.target.value)
              }}
              placeholder={isGeneratingImpactAssessment ? "Generating AI impact assessment..." : "Describe the business and technical impact of this issue..."}
              rows={6}
              className={`w-full text-sm font-medium pr-32 resize-none leading-relaxed shadow-sm ${!isEditMode && !isGeneratingImpactAssessment ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
              disabled={!isEditMode && !isGeneratingImpactAssessment}
            />
          ) : (
            <div className="min-h-[120px] p-3 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-700 font-medium leading-relaxed shadow-sm">
              {response || "No impact assessment provided"}
            </div>
          )}
          {isEditMode && (
            <div className="absolute bottom-3 right-3 flex gap-2">
              <Button
                onClick={() => {
                  onResponseChange("");
                }}
                disabled={isGeneratingImpactAssessment || !response.trim()}
                className="bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 px-3 py-1.5 h-auto rounded-md shadow-sm text-xs font-medium transition-colors"
                size="sm"
              >
                Clear
              </Button>
              <Button
                onClick={handleEnhanceImpactAssessment}
                disabled={isGeneratingImpactAssessment || isEnhancing}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-3 py-1.5 h-auto rounded-md shadow-sm flex items-center gap-1.5 transition-colors"
                size="sm"
              >
                {isEnhancing ? (
                  <FiLoader className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <IoIosColorWand className="w-3.5 h-3.5" />
                )}
                <span className="text-xs font-semibold">{isEnhancing ? 'Enhancing...' : 'Enhance'}</span>
              </Button>
            </div>
          )}
        </div>
      </div>

        </>
      )}
        </div>
      </div>

      {/* Right Column - Suggested Impact Assessments */}
      <div className="lg:col-span-1">
        <div className="sticky top-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 rounded-t-xl">
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                <RiRobot2Line className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 tracking-wide">AI Suggestions</h3>
                <p className="text-xs text-gray-600 font-medium">Click to apply assessment</p>
              </div>
            </div>
            
            {isGeneratingImpactAssessment ? (
              <div className="space-y-4" style={{ padding: '0 16px 16px 16px' }}>
                {[1, 2, 3].map((index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
                    <div className="animate-pulse">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-5 bg-gray-300 rounded-full w-16"></div>
                        <div className="h-5 bg-gray-300 rounded-full w-20"></div>
                      </div>
                      <div className="space-y-2 mb-3">
                        <div className="h-3 bg-gray-300 rounded w-full"></div>
                        <div className="h-3 bg-gray-300 rounded w-4/5"></div>
                        <div className="h-3 bg-gray-300 rounded w-3/5"></div>
                      </div>
                      <div className="h-3 bg-gray-300 rounded w-20"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : impactAssessments.length > 0 ? (
              <div className="space-y-4" style={{ padding: '0 16px 16px 16px' }}>
                {impactAssessments.map((assessment, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-md ${
                      index === 0 
                        ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-400 ring-2 ring-blue-300 shadow-md' 
                        : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm'
                    }`}
                    onClick={() => handleImpactAssessmentClick(assessment)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full">
                          {assessment.impactLevel}
                        </span>
                        <span className="text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
                          {assessment.department}
                        </span>
                      </div>

                    </div>
                    <div className="text-sm text-gray-700 leading-relaxed mb-3 line-clamp-3 font-medium">
                      {assessment.impacts}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        AI-Generated Impact Assessment
                      </div>
                      <div className="text-xs text-blue-600 font-semibold">
                        Click to apply
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12" style={{ padding: '48px 16px' }}>
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <RiRobot2Line className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm font-semibold text-gray-900 mb-1">No AI suggestions yet</p>
                <p className="text-xs text-gray-500 font-medium">AI-generated impact assessments will appear here</p>
              </div>
            )}
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
        title="Enhance Impact Assessment"
      />
    </div>
  )
}

export default ImpactAssessmentStep
