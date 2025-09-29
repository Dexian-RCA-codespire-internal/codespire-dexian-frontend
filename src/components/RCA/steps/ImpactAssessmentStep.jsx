import React, { useState, useEffect } from 'react'
import { Textarea } from '../../ui/Textarea'
import { Button } from '../../ui/Button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select'
import { IoIosColorWand } from "react-icons/io"
import { FiLoader } from "react-icons/fi"
import { BsStars } from "react-icons/bs"
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
  currentStep = 2 // Default to step 2 since this component is only rendered for step 2
}) => {
  const [impactLevel, setImpactLevel] = useState('')
  const [departmentAffected, setDepartmentAffected] = useState('')
  const [isEnhancementModalOpen, setIsEnhancementModalOpen] = useState(false)
  const [enhancementOptions, setEnhancementOptions] = useState([])
  
  // Use the custom hook for text enhancement
  const { enhanceText, isLoading: isEnhancing, error: enhancementError } = useTextEnhancement()

  // Load existing dropdown values when stepData changes
  useEffect(() => {
    if (stepData) {
      if (stepData.impact_level_step2) {
        setImpactLevel(stepData.impact_level_step2)
      }
      if (stepData.department_affected_step2) {
        setDepartmentAffected(stepData.department_affected_step2)
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

  // Generate impact assessment when component mounts (only for step 2)
  useEffect(() => {
    const generateImpactAssessment = async () => {
      // Check if impact assessment data already exists
      const hasExistingData = response && response.trim().length > 0
      const hasExistingDataInStepData = stepData?.rca_workflow_steps?.[1] && stepData.rca_workflow_steps[1].trim().length > 0
      
      console.log('ImpactAssessmentStep: hasExistingData:', hasExistingData);
      console.log('ImpactAssessmentStep: hasExistingDataInStepData:', hasExistingDataInStepData);
      console.log('ImpactAssessmentStep: currentStep:', currentStep);
      console.log('ImpactAssessmentStep: isGeneratingImpactAssessment:', isGeneratingImpactAssessment);
      console.log('ImpactAssessmentStep: hasAttemptedImpactGeneration:', hasAttemptedImpactGeneration);
      
      if (currentStep === 2 && stepData && !isGeneratingImpactAssessment && !hasAttemptedImpactGeneration && !hasExistingData && !hasExistingDataInStepData) {
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
            
            if (response.success && response.data) {
              const { impactAssessment, impactLevel: aiImpactLevel, department } = response.data
              
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
              
              // Set the impact level
              const mappedImpactLevel = impactLevelMap[aiImpactLevel] || ''
              if (mappedImpactLevel) {
                setImpactLevel(mappedImpactLevel)
                setStepData((prevData) => ({
                  ...prevData,
                  impact_level_step2: mappedImpactLevel
                }))
              }
              
              // Set the department affected
              const mappedDepartment = departmentMap[department] || ''
              if (mappedDepartment) {
                setDepartmentAffected(mappedDepartment)
                setStepData((prevData) => ({
                  ...prevData,
                  department_affected_step2: mappedDepartment
                }))
              }
              
              // Set the impact assessment description
              if (impactAssessment) {
                onResponseChange(impactAssessment)
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
  }, [currentStep, stepData, isGeneratingImpactAssessment, hasAttemptedImpactGeneration, onResponseChange, setStepData, response])

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

  return (
    <div className="space-y-6">
      {/* AI Guidance */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2 mb-2">
          <BsStars className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">AI Guidance</span>
        </div>
        <p className="text-sm text-blue-700">
          {isGeneratingImpactAssessment 
            ? "Analyzing the problem statement to generate impact assessment..." 
            : "Based on the problem statement, AI has analyzed the potential impact. Review and adjust the assessment below."
          }
        </p>
      </div>

      {/* Skeleton Loader for Generating State */}
      {isGeneratingImpactAssessment ? (
        <div className="space-y-6">
          {/* Dropdown Fields Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          
          {/* Textarea Skeleton */}
          <div>
            <Skeleton className="h-4 w-48 mb-2" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      ) : (
        <>

      {/* Dropdown Fields Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Impact Level
          </label>
          <Select value={impactLevel} onValueChange={(value) => {
            setImpactLevel(value)
            setStepData((prevData) => ({
              ...prevData,
              impact_level_step2: value
            }))
          }}>
            <SelectTrigger>
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Department Affected
          </label>
          <Select value={departmentAffected} onValueChange={(value) => {
            setDepartmentAffected(value)
            setStepData((prevData) => ({
              ...prevData,
              department_affected_step2: value
            }))
          }}>
            <SelectTrigger>
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
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Impact Assessment Description
          </label>
        </div>
        <div className="relative">
          <Textarea
            value={response}
            onChange={(e) => {
              onResponseChange(e.target.value)
            }}
            placeholder={isGeneratingImpactAssessment ? "Generating AI impact assessment..." : "Describe the business and technical impact of this issue..."}
            rows={6}
            className="w-full"
            disabled={isGeneratingImpactAssessment}
          />
          <div className="absolute bottom-1 right-1 flex gap-1">
            <Button
              onClick={() => {
                onResponseChange("");
              }}
              disabled={isGeneratingImpactAssessment || !response.trim()}
              className="bg-white border border-gray-300 text-black hover:bg-gray-50 hover:border-gray-400 px-3 py-1 h-auto rounded shadow-sm text-sm"
              size="sm"
            >
              Clear
            </Button>
            <Button
              onClick={handleEnhanceImpactAssessment}
              disabled={isGeneratingImpactAssessment || isEnhancing}
              className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 px-3 py-1 h-auto rounded shadow-sm flex items-center gap-1"
              size="sm"
            >
              {isEnhancing ? (
                <FiLoader className="w-4 h-4 animate-spin" />
              ) : (
                <IoIosColorWand className="w-4 h-4 text-green-600" />
              )}
              <span className="text-sm text-green-600">{isEnhancing ? 'Enhancing...' : 'Enhance'}</span>
            </Button>
          </div>
        </div>
      </div>

        </>
      )}

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
