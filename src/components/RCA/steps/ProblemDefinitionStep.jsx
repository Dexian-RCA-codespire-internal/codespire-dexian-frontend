import React, { useState, useEffect } from "react";
import { Textarea } from "../../ui/Textarea";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { IoIosColorWand } from "react-icons/io";
import { FiLoader } from "react-icons/fi";
import { BsStars } from "react-icons/bs";
import { RiRobot2Line } from "react-icons/ri";
import EnhancementModal from "../../ui/EnhancementModal";
import { useTextEnhancement } from "../../../hooks/useTextEnhancement";
const ProblemDefinitionStep = ({
  stepData,
  setStepData,
  ticketData,
  response,
  onResponseChange,
  isGeneratingProblemStatement,
  setIsGeneratingProblemStatement,
  hasAttemptedGeneration,
  problemStatementData,
  onNext,
  showPrevious = false,
  onPrevious,
}) => {
  const [problemSummary, setProblemSummary] = useState("");
  const [isEnhancementModalOpen, setIsEnhancementModalOpen] = useState(false);
  const [enhancementOptions, setEnhancementOptions] = useState([]);
  
  // Use the custom hook for text enhancement
  const { enhanceText, isLoading: isEnhancing, error: enhancementError } = useTextEnhancement();

  // Use data from props
  const problemDefinitions = problemStatementData?.problemDefinitions || [];
  const aiQuestion = problemStatementData?.aiQuestion || "";
  
  // Get dropdown values from stepData (user selections + AI auto-populated values)
  const issueType = stepData?.issueType || "";
  const severity = stepData?.severity || "";
  const businessImpactCategory = stepData?.businessImpactCategory || "";
  
  // Debug logging
  console.log('ProblemDefinitionStep received stepData:', {
    issueType,
    severity,
    businessImpactCategory,
    fullStepData: stepData
  });

  // Update problemSummary when response changes from parent
  useEffect(() => {
    if (response && response !== problemSummary) {
      setProblemSummary(response);
    }
  }, [response, problemSummary]);

  // Debug: Log when stepData changes
  useEffect(() => {
    console.log('ProblemDefinitionStep: stepData changed:', stepData);
  }, [stepData]);

  // Handle clicking on problem definition
  const handleProblemDefinitionClick = (definition) => {
    setProblemSummary(definition);
    onResponseChange(definition);
  };

  // Handle opening enhancement modal
  const handleEnhanceProblemStatement = async () => {
    if (!problemSummary.trim()) {
      alert("Please enter some text in the problem statement to enhance.");
      return;
    }

    setIsEnhancementModalOpen(true);
    
    // Call the enhancement API
    const reference = `${ticketData?.short_description || ""} ${ticketData?.description || ""}`.trim();
    const result = await enhanceText(problemSummary, reference);
    
    if (result && result.enhancedOptions) {
      setEnhancementOptions(result.enhancedOptions);
    } else if (enhancementError) {
      alert(`Failed to enhance text: ${enhancementError}`);
      setIsEnhancementModalOpen(false);
    }
  };

  // Handle selecting an enhancement option
  const handleSelectEnhancement = (enhancedText) => {
    setProblemSummary(enhancedText);
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Main Content */}
      <div className="lg:col-span-2">
        <Card>
          {/* <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader> */}
          <CardContent className="space-y-6 mt-6">
            {aiQuestion && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <BsStars className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    AI Guidance
                  </span>
                </div>
                <div className="text-sm text-blue-700 line-clamp-5 overflow-hidden">
                  {aiQuestion}
                  {aiQuestion.split('\n').length > 5 && '...'}
                </div>
              </div>
            )}

            {/* Ticket Description */}
            {/* {ticketData && ticketData.description && (
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
            )} */}

            {/* Dropdown Fields Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issue Type
                </label>
                <Select value={issueType} onValueChange={(value) => {
                  // Update the parent state with the new selection
                  setStepData(prevData => ({
                    ...prevData,
                    issueType: value
                  }))
                }}>
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
                <Select value={severity} onValueChange={(value) => {
                  // Update the parent state with the new selection
                  setStepData(prevData => ({
                    ...prevData,
                    severity: value
                  }))
                }}>
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
                <Select value={businessImpactCategory} onValueChange={(value) => {
                  // Update the parent state with the new selection
                  setStepData(prevData => ({
                    ...prevData,
                    businessImpactCategory: value
                  }))
                }}>
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

            {/* Problem Statement Textarea */}
            <div>
              <label className="flex gap-2 text-sm font-medium text-gray-700 mb-2">
                Problem Statement
              </label>
              <div className="relative">
                <Textarea
                  value={problemSummary}
                  onChange={(e) => {
                    console.log(
                      "Problem statement textarea onChange:",
                      e.target.value
                    );
                    setProblemSummary(e.target.value);
                    onResponseChange(e.target.value);
                    console.log("Called onResponseChange with:", e.target.value);
                  }}
                  placeholder={
                    isGeneratingProblemStatement
                      ? "Generating AI problem summary..."
                      : "AI-generated problem summary..."
                  }
                  rows={6}
                  className="w-full resize-none pr-20"
                  disabled={isGeneratingProblemStatement}
                />
                <Button
                  onClick={handleEnhanceProblemStatement}
                  disabled={isGeneratingProblemStatement || isEnhancing}
                  className="absolute bottom-2 right-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 px-3 py-1 h-auto rounded-md shadow-sm flex items-center gap-1"
                  size="sm"
                >
                  {isEnhancing ? (
                    <FiLoader className="w-4 h-4 animate-spin" />
                  ) : (
                    <IoIosColorWand className="w-4 h-4 text-green-600" />
                  )}
                  <span className="text-sm">{isEnhancing ? 'Enhancing...' : 'Enhance'}</span>
                </Button>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              {showPrevious && onPrevious && (
                <Button 
                  onClick={onPrevious}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Previous
                </Button>
              )}
              <Button 
                onClick={onNext}
                disabled={!response.trim() || isGeneratingProblemStatement}
                className={`ml-auto ${
                  (response.trim() && !isGeneratingProblemStatement)
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Next Step →
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Suggested Problem Definitions */}
      {problemDefinitions.length > 0 && (
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-end justify-center gap-2 font-normal"><RiRobot2Line className=" w-6 h-6 text-green-500" />Enhance Problem Statement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {problemDefinitions.map((definition, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => handleProblemDefinitionClick(definition)}
                  >
                    <div className="text-sm text-gray-700 line-clamp-5 overflow-hidden">
                      {definition}
                      {definition.split('\n').length > 5 && '...'}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Enhancement Modal */}
      <EnhancementModal
        isOpen={isEnhancementModalOpen}
        onClose={handleCloseModal}
        originalText={problemSummary}
        onSelectOption={handleSelectEnhancement}
        enhancedOptions={enhancementOptions}
        isLoading={isEnhancing}
        title="Enhance Problem Statement"
      />
    </div>
  );
};

export default ProblemDefinitionStep;
