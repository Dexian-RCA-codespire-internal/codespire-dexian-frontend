
import React, { useState, useEffect } from "react";
import { Textarea } from "../../ui/Textarea";
import { Button } from "../../ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { IoIosColorWand } from "react-icons/io";
import { FiLoader, FiArrowRight, FiArrowLeft, FiEdit } from "react-icons/fi";
import { BsStars } from "react-icons/bs";
import { RiRobot2Line } from "react-icons/ri";
import { Skeleton } from "../../ui/skeleton";
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
  rcaResolvedData = null,
  hasExistingRcaData = false
}) => {
  const [problemSummary, setProblemSummary] = useState("");
  const [isEnhancementModalOpen, setIsEnhancementModalOpen] = useState(false);
  const [enhancementOptions, setEnhancementOptions] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const { enhanceText, isLoading: isEnhancing, error: enhancementError } = useTextEnhancement();

  const problemDefinitions = problemStatementData?.problemDefinitions || [];
  const aiQuestion = problemStatementData?.aiQuestion || "";
  
  const issueType = stepData?.issueType || "";
  const severity = stepData?.severity || "";

  useEffect(() => {
    if (response && response !== problemSummary) {
      setProblemSummary(response);
    }
  }, [response, problemSummary]);

  const handleProblemDefinitionClick = (definition) => {
    setProblemSummary(definition);
    onResponseChange(definition);
  };

  const handleEnhanceProblemStatement = async () => {
    if (!problemSummary.trim()) {
      alert("Please enter some text in the problem statement to enhance.");
      return;
    }

    setIsEnhancementModalOpen(true);
    
    const reference = `${ticketData?.short_description || ""} ${ticketData?.description || ""}`.trim();
    const result = await enhanceText(problemSummary, reference);
    
    if (result && result.enhancedOptions) {
      setEnhancementOptions(result.enhancedOptions);
    } else if (enhancementError) {
      alert(`Failed to enhance text: ${enhancementError}`);
      setIsEnhancementModalOpen(false);
    }
  };

  const handleSelectEnhancement = (enhancedText) => {
    setProblemSummary(enhancedText);
    onResponseChange(enhancedText);
    setIsEnhancementModalOpen(false);
    setEnhancementOptions([]);
  };

  const handleCloseModal = () => {
    setIsEnhancementModalOpen(false);
    setEnhancementOptions([]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* AI Guidance */}
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
            <FiEdit className="w-4 h-4 text-gray-600" />
          </Button>
        </div>

        {/* Dropdown Fields Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 tracking-wide">
              Issue Type
            </label>
            {isEditMode ? (
              <Select value={issueType} onValueChange={(value) => {
                setStepData(prevData => ({
                  ...prevData,
                  issueType: value
                }))
              }} disabled={!isEditMode}>
                <SelectTrigger className="h-10 text-sm font-medium shadow-sm bg-white">
                  <SelectValue placeholder="Select type" />
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
            ) : (
              <div className="h-10 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-700 font-medium flex items-center shadow-sm">
                {issueType || "Not selected"}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 tracking-wide">
              Severity
            </label>
            {isEditMode ? (
              <Select value={severity} onValueChange={(value) => {
                setStepData(prevData => ({
                  ...prevData,
                  severity: value
                }))
              }} disabled={!isEditMode}>
                <SelectTrigger className="h-10 text-sm font-medium shadow-sm bg-white">
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sev1">Sev 1 – Critical</SelectItem>
                  <SelectItem value="sev2">Sev 2 – Major</SelectItem>
                  <SelectItem value="sev3">Sev 3 – Moderate</SelectItem>
                  <SelectItem value="sev4">Sev 4 – Minor</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="h-10 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-700 font-medium flex items-center shadow-sm">
                {severity || "Not selected"}
              </div>
            )}
          </div>
        </div>

        {/* Problem Statement Textarea */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 tracking-wide">
            Problem Statement
          </label>
          <div className="relative">
            {isEditMode ? (
              <Textarea
                value={problemSummary}
                onChange={(e) => {
                  setProblemSummary(e.target.value);
                  onResponseChange(e.target.value);
                }}
                placeholder={
                  isGeneratingProblemStatement
                    ? "Generating AI problem summary..."
                    : "Describe the problem in detail..."
                }
                rows={6}
                className="w-full text-sm font-medium pr-32 leading-relaxed shadow-sm bg-white"
                disabled={!isEditMode || isGeneratingProblemStatement}
              />
            ) : (
              <div className="min-h-[120px] p-3 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-700 font-medium leading-relaxed shadow-sm">
                {problemSummary || "No problem statement provided"}
              </div>
            )}
            {isEditMode && (
              <div className="absolute bottom-2 right-2 flex gap-2">
                <Button
                  onClick={() => {
                    setProblemSummary("");
                    onResponseChange("");
                  }}
                  disabled={!isEditMode || isGeneratingProblemStatement || !problemSummary.trim()}
                  className="bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 px-3 py-1.5 h-auto rounded shadow-sm text-xs font-medium"
                  size="sm"
                >
                  Clear
                </Button>
                <Button
                  onClick={handleEnhanceProblemStatement}
                  disabled={!isEditMode || isGeneratingProblemStatement || isEnhancing || !problemSummary.trim()}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-3 py-1.5 h-auto rounded shadow-sm flex items-center gap-1.5"
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

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4">
          {showPrevious && onPrevious && (
            <Button 
              onClick={onPrevious}
              variant="outline"
              className="flex items-center gap-2 border-gray-300 hover:bg-gray-50"
            >
              <FiArrowLeft className="w-4 h-4" />
              Previous
            </Button>
          )}
          <Button 
            onClick={onNext}
            disabled={!response.trim() || isGeneratingProblemStatement}
            className={`ml-auto flex items-center gap-2 ${
              (response.trim() && !isGeneratingProblemStatement)
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg shadow-purple-500/30'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Next Step
            <FiArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Right Column - AI Suggestions */}
      <div className="lg:col-span-1">
        <Card className="sticky top-4 border-purple-200 shadow-sm">
          <CardHeader className="pb-3 bg-gradient-to-br from-purple-50 to-blue-50 border-b border-purple-200 rounded-t-xl">
            <CardTitle className="flex items-center gap-2 text-sm font-bold tracking-wide">
              <div className="w-5 h-5 rounded bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                <RiRobot2Line className="w-3 h-3 text-white" />
              </div>
              AI Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3 px-3">
            {isGeneratingProblemStatement ? (
              <div className="space-y-2">
                {[1, 2, 3].map((index) => (
                  <div key={index} className="p-2.5 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
                    <Skeleton className="h-3 w-full mb-1.5" />
                    <Skeleton className="h-3 w-3/4 mb-1.5" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            ) : problemDefinitions.length > 0 ? (
              <div className="space-y-2">
                {problemDefinitions.map((definition, index) => (
                  <div
                    key={index}
                    className={`p-2.5 rounded-lg border transition-all cursor-pointer group ${
                      index === 0 
                        ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-400 ring-2 ring-blue-300 shadow-md hover:shadow-lg' 
                        : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm shadow-sm'
                    }`}
                    onClick={() => handleProblemDefinitionClick(definition)}
                  >
                    <div className={`text-xs line-clamp-4 font-medium leading-relaxed ${
                      index === 0 ? 'text-gray-800' : 'text-gray-700 group-hover:text-gray-900'
                    }`}>
                      {definition}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center mx-auto mb-2">
                  <RiRobot2Line className="w-6 h-6 text-purple-400" />
                </div>
                <p className="text-xs font-medium">AI suggestions will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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