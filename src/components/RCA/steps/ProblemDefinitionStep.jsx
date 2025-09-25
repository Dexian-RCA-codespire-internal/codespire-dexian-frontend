import React, { useState, useEffect } from "react";
import { Textarea } from "../../ui/Textarea";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
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
import { aiService } from "../../../api/services/aiService";

const ProblemDefinitionStep = ({
  stepData,
  setStepData,
  ticketData,
  response,
  onResponseChange,
  isGeneratingProblemStatement,
  hasAttemptedGeneration,
  problemStatementData,
}) => {
  const [problemSummary, setProblemSummary] = useState("");

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

  // Handle enhancing problem statement
  const handleEnhanceProblemStatement = async () => {
    if (!problemSummary.trim()) {
      alert("Please enter some text in the problem statement to enhance.");
      return;
    }

    try {
      setIsGeneratingProblemStatement(true);

      const requestData = {
        text: problemSummary,
        reference:
          `${ticketData?.short_description || ""} ${ticketData?.description || ""}`.trim(),
      };

      const response = await aiService.textEnhancement.enhance(requestData);

      if (response.success && response.data && response.data.enhancedText) {
        const enhancedText = response.data.enhancedText;

        // Update the problem statement with enhanced text
        setProblemSummary(enhancedText);
        onResponseChange(enhancedText);

        console.log("Text enhanced successfully:", response.data);
      } else {
        alert("Failed to enhance text. Please try again.");
      }
    } catch (error) {
      console.error("Error enhancing text:", error);
      alert("Failed to enhance text. Please try again.");
    } finally {
      setIsGeneratingProblemStatement(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {aiQuestion && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <BsStars className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                AI Guidance
              </span>
            </div>
            <p className="text-sm text-blue-700">{aiQuestion}</p>
          </div>
        )}

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
                <SelectItem value="operational_downtime">
                  Operational Downtime
                </SelectItem>
                <SelectItem value="customer_support">Customer Support</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Problem Statement Textarea */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Problem Statement (AI-assisted)
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
              disabled={isGeneratingProblemStatement}
              className="absolute bottom-2 right-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 px-3 py-1 h-auto rounded-md shadow-sm flex items-center gap-1"
              size="sm"
            >
              <IoIosColorWand className="w-4 h-4" />
              <span className="text-sm">Enhance</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Right Column - Suggested Problem Definitions */}
      {problemDefinitions.length > 0 && (
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Suggested Problem Definitions
            </h3>
            <div className="space-y-2">
              {problemDefinitions.map((definition, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => handleProblemDefinitionClick(definition)}
                >
                  <p className="text-sm text-gray-700">{definition}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProblemDefinitionStep;
