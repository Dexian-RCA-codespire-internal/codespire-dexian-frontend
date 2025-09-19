import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import { Badge } from '../ui/badge'
import { Skeleton } from '../ui/skeleton'
import SmoothTypingSuggestion from '../ui/SmoothTypingSuggestion'
import { FiMessageCircle, FiZap, FiSearch, FiArrowRight, FiArrowLeft, FiCheck, FiSave, FiDownload, FiEye } from 'react-icons/fi'
import SimilarTicketModal from './SimilarTicketModal'

const RCAWorkflow = ({ 
  currentStep, 
  totalSteps, 
  stepTitle, 
  aiGuidance, 
  response, 
  onResponseChange, 
  onNext, 
  onPrevious, 
  aiSuggestions = [], 
  similarCases = [],
  aiSuggestionsLoading = false,
  similarCasesLoading = false,
  nextButtonText = "Next Step →",
  showPrevious = true,
  canProceed = true,
  onSaveProgress,
  onGenerateReport,
  ticketData = null,
  onStepClick = null,
  isFallbackSuggestions = false,
  isStreaming = false,
  streamingText = '',
  streamingSuggestions = [],
  wsConnected = false
}) => {
  // Modal state for viewing similar ticket details
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Handle opening modal with ticket details
  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket)
    setIsModalOpen(true)
  }

  // Handle closing modal
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedTicket(null)
  }
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI RCA Agent</h1>
          <p className="text-gray-600 mt-1">Interactive root cause analysis workflow with AI-powered guidance and suggestions.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            onClick={onSaveProgress}
            className="flex items-center"
          >
            <FiSave className="w-4 h-4 mr-2" />
            Save Progress
          </Button>
          <Button 
            className={`flex items-center ${
              currentStep === totalSteps 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            onClick={onGenerateReport}
            disabled={currentStep !== totalSteps}
          >
            <FiDownload className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

           
      {/* Ticket Information Header */}
      {ticketData ? (
        <div className="p-4 bg-white rounded-lg shadow-sm border">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {ticketData.short_description || 'No Title'}
          </h1>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <span><strong>Ticket ID:</strong> {ticketData.ticket_id}</span>
            <span><strong>Source:</strong> {ticketData.source}</span>
            <span><strong>Status:</strong> {ticketData.status}</span>
            <span><strong>Priority:</strong> {ticketData.priority}</span>
            <span><strong>Category:</strong> {ticketData.category}</span>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-white rounded-lg shadow-sm border">
          <div className="flex items-center gap-3 mb-2">
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="flex flex-wrap gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-36" />
          </div>
        </div>
      )}

      {/* RCA Progress Card */}
      <Card className="bg-white shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">RCA Progress</h2>
            <span className="text-sm text-gray-600">Step {currentStep} of {totalSteps}</span>
          </div>
          
          {/* Progress Bar */}
          <div className="relative">
            {/* Background connecting line */}
            <div className="absolute top-4 left-4 h-0.5 bg-gray-200 rounded-full" style={{ width: 'calc(100% - 3rem)' }}></div>
            
            {/* Progress connecting line */}
            <div 
              className="absolute top-4 left-4 h-0.5 bg-green-600 rounded-full transition-all duration-300"
              style={{ 
                width: currentStep === totalSteps 
                  ? `calc(100% - 3rem)` 
                  : `${((currentStep - 1) / (totalSteps - 1)) * 100}%`
              }}
            ></div>
            
            <div className="flex items-center justify-between relative z-10">
              {Array.from({ length: totalSteps }, (_, index) => {
                const stepNumber = index + 1
                const isCompleted = stepNumber < currentStep
                const isCurrent = stepNumber === currentStep
                const isFuture = stepNumber > currentStep
                const isClickable = onStepClick
                
                return (
                  <div 
                    key={stepNumber} 
                    className={`flex flex-col items-center ${
                      isClickable ? 'cursor-pointer' : 'cursor-default'
                    }`}
                    onClick={() => {
                      if (isClickable) {
                        onStepClick(stepNumber)
                      }
                    }}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200 ${
                      isCompleted 
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : isCurrent 
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    } ${isClickable ? 'hover:scale-105 cursor-pointer' : 'cursor-default'}`}>
                      {isCompleted ? <FiCheck className="w-4 h-4" /> : stepNumber}
                    </div>
                    <span className={`text-xs mt-1 transition-colors duration-200 ${
                      isClickable ? 'text-gray-700 hover:text-gray-900' : 'text-gray-500'
                    }`}>
                      {stepNumber === 1 ? 'Problem' :
                       stepNumber === 2 ? 'Timeline' :
                       stepNumber === 3 ? 'Impact' :
                       stepNumber === 4 ? 'Findings' : 'Root Cause'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content Area */}
      <div className="lg:col-span-2">
        <Card className="bg-white shadow-sm">
          <CardContent className="p-8">
            {/* Step Header */}
            <div className="flex items-center mb-6">
              <div className="flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full text-sm font-semibold mr-3">
                {currentStep}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{stepTitle}</h1>
                <p className="text-sm text-gray-600">Step {currentStep} of {totalSteps}</p>
              </div>
            </div>

            {/* AI Guidance */}
            <div className="mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <FiMessageCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-green-800">AI Guidance</span>
                </div>
                <p className="text-sm text-green-700">{aiGuidance}</p>
              </div>
            </div>

            {/* Response Input */}
            <div className="mb-8">
              <Textarea
                value={response}
                onChange={(e) => onResponseChange(e.target.value)}
                placeholder="Enter your response here..."
                rows={8}
                className="w-full resize-none"
              />
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              {showPrevious && (
                <Button 
                  onClick={onPrevious}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Previous
                </Button>
              )}
              <Button 
                onClick={onNext}
                disabled={!canProceed}
                className={`ml-auto ${
                  canProceed 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {nextButtonText}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Sidebar */}
      <div className="lg:col-span-1 space-y-6">
         

        {/* Similar Cases */}
        {(similarCases && similarCases.results && similarCases.results.length > 0) || similarCasesLoading || (similarCases && similarCases.results && similarCases.results.length === 0) ? (
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                <FiSearch className="w-5 h-5 mr-2 text-blue-500" />
                Similar Cases
                {similarCases && similarCases.total_results > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {similarCases.total_results} found
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {similarCasesLoading ? (
                // Skeleton loader for similar cases
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-4 w-full mb-1" />
                        <Skeleton className="h-3 w-3/4" />
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Skeleton className="h-6 w-16" />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))
              ) : similarCases && similarCases.results && similarCases.results.length > 0 ? (
                similarCases.results.map((caseItem, index) => (
                  <div key={caseItem.ticket_id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{caseItem.ticket_id}</p>
                        <p className="text-sm text-gray-600 mt-1">{caseItem.short_description}</p>
                        {caseItem.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{caseItem.description}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge className={`${
                          caseItem.confidence_percentage >= 90 ? 'bg-green-100 text-green-800' :
                          caseItem.confidence_percentage >= 80 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {caseItem.confidence_percentage}% match
                        </Badge>
                        {/* <span className="text-xs text-gray-500">Rank #{caseItem.rank}</span> */}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                        {/* <span><strong>Status:</strong> {caseItem.status}</span>
                        <span><strong>Priority:</strong> {caseItem.priority}</span>
                        <span><strong>Category:</strong> {caseItem.category}</span> */}
                        <span><strong>Source:</strong> {caseItem.source}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewTicket(caseItem)}
                        className="h-7 px-2 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                      >
                        <FiEye className="w-3 h-3 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  <p className="text-sm">No similar tickets found</p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : null}

        {/* AI Suggestions - Only show if similar tickets are available */}
        {(aiSuggestions.length > 0 || aiSuggestionsLoading) && similarCases && similarCases.results && similarCases.results.length > 0 && (
           <Card className="bg-white shadow-sm">
             <CardHeader>
               <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                 <FiZap className="w-5 h-5 mr-2 text-yellow-500" />
                 AI Suggestions
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-3 min-h-[400px]">
               {isStreaming ? (
                 // FIXED: Stream all suggestions with smooth typing
                 <div className="space-y-3">
                   {streamingSuggestions.map((suggestion, index) => (
                     <SmoothTypingSuggestion
                       key={suggestion.id || index}
                       suggestion={suggestion}
                       index={index}
                       isStreaming={suggestion.isStreaming}
                       onComplete={() => {
                         // Handle suggestion completion if needed
                         const suggestionText = suggestion.text || suggestion.description || '';
                         onResponseChange(suggestionText);
                       }}
                     />
                   ))}
                 </div>
               ) : aiSuggestionsLoading ? (
                 // Skeleton loader for AI suggestions
                 Array.from({ length: 3 }).map((_, index) => (
                   <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                     <Skeleton className="h-4 w-full mb-2" />
                     <Skeleton className="h-4 w-3/4 mb-1" />
                     <Skeleton className="h-4 w-1/2" />
                   </div>
                 ))
               ) : (
                 <motion.div 
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ duration: 0.5, ease: "easeOut" }}
                   className="space-y-3"
                 >
                   {aiSuggestions.map((suggestion, index) => {
                   const rank = index + 1;
                   const isBestMatch = rank === 1 && !isFallbackSuggestions; // Only show golden highlighting for real AI suggestions
                   
                   // Handle both string and object formats
                   const suggestionText = typeof suggestion === 'string' 
                     ? suggestion 
                     : suggestion?.suggestion || suggestion?.text || suggestion?.description || JSON.stringify(suggestion);
                   
                   
                   return (
                     <motion.div 
                       key={index}
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ duration: 0.3, delay: index * 0.1, ease: "easeOut" }}
                       className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                         isBestMatch 
                           ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300 hover:from-yellow-100 hover:to-amber-100 shadow-md' 
                           : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                       }`}
                       onClick={() => onResponseChange(suggestionText)}
                     >
                       <div className="flex items-start gap-3">
                         {/* Ranking Badge */}
                         <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                           isBestMatch 
                             ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-lg' 
                             : 'bg-gray-400 text-white'
                         }`}>
                           {rank}
                         </div>
                         
                         {/* Suggestion Content */}
                         <div className="flex-1">
                           <div className="flex items-center gap-2 mb-1">
                             <p className={`text-sm font-medium ${
                               isBestMatch ? 'text-amber-800' : 'text-gray-700'
                             }`}>
                               {isBestMatch ? '🥇 Best Match' : `Suggestion ${rank}`}
                             </p>
                             {isBestMatch && (
                               <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full font-medium">
                                 Recommended
                               </span>
                             )}
                           </div>
                           <p className={`text-sm leading-relaxed ${
                             isBestMatch ? 'text-amber-700' : 'text-gray-700'
                           }`}>
                             {suggestionText}
                           </p>
                         </div>
                       </div>
                     </motion.div>
                   );
                 })}
                 </motion.div>
               )}
             </CardContent>
           </Card>
         )}
      </div>
      </div>

      {/* Similar Ticket Details Modal */}
      <SimilarTicketModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        ticket={selectedTicket}
        currentTicket={ticketData}
      />
    </div>
  )
}

export default RCAWorkflow
