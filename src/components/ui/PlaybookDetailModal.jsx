import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog'
import { Badge } from './Badge'
import { Button } from './Button'
import { FiX, FiBookOpen, FiClock, FiTag, FiCheckCircle, FiAlertTriangle, FiInfo } from 'react-icons/fi'

const PlaybookDetailModal = ({ playbook, isOpen, onClose }) => {
  if (!playbook) return null

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'Invalid Date'
    }
  }

  // Format similarity score
  const formatSimilarityScore = (score) => {
    if (score === undefined || score === null) return 'N/A'
    return `${Math.round(score * 100)}%`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto [&>button]:hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center">
            <FiBookOpen className="w-6 h-6 mr-2 text-blue-600" />
            Playbook Details
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-gray-100"
          >
            <FiX className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Section */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  {playbook.title}
                </h2>
                <p className="text-sm text-gray-600 mb-3">
                  {playbook.description}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2 ml-4">
                <Badge className={`${getPriorityColor(playbook.priority)} text-xs font-medium`}>
                  {playbook.priority}
                </Badge>
                {playbook.similarity_score && (
                  <Badge className="bg-green-100 text-green-800 text-xs font-medium">
                    {formatSimilarityScore(playbook.similarity_score)} Match
                  </Badge>
                )}
              </div>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center text-gray-600">
                <FiBookOpen className="w-4 h-4 mr-2" />
                <span className="font-medium">ID:</span>
                <span className="ml-1">{playbook.playbook_id}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FiClock className="w-4 h-4 mr-2" />
                <span className="font-medium">Created:</span>
                <span className="ml-1">{formatDate(playbook.created_at)}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FiClock className="w-4 h-4 mr-2" />
                <span className="font-medium">Updated:</span>
                <span className="ml-1">{formatDate(playbook.updated_at)}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FiInfo className="w-4 h-4 mr-2" />
                <span className="font-medium">Search Type:</span>
                <span className="ml-1 capitalize">{playbook.search_type || 'vector'}</span>
              </div>
            </div>

            {/* Tags */}
            {playbook.tags && playbook.tags.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center mb-2">
                  <FiTag className="w-4 h-4 mr-2 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Tags:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {playbook.tags.map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="text-xs bg-blue-100 text-blue-800 hover:bg-blue-200"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Triggers Section */}
          {playbook.triggers && playbook.triggers.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FiCheckCircle className="w-5 h-5 mr-2 text-green-600" />
                Troubleshooting Steps & Solutions
              </h3>
              
              {playbook.triggers.map((trigger, index) => (
                <div key={trigger.trigger_id || index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  {/* Trigger Title */}
                  <div className="mb-3">
                    <h4 className="text-md font-medium text-gray-900 mb-2 flex items-start">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full mr-3 mt-0.5">
                        Step {index + 1}
                      </span>
                      {trigger.title}
                    </h4>
                  </div>

                  {/* Action Steps */}
                  {trigger.action && (
                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <FiAlertTriangle className="w-4 h-4 mr-2 text-orange-600" />
                        Action Steps:
                      </h5>
                      <div className="bg-gray-50 p-3 rounded-md">
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                          {trigger.action}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Expected Outcome */}
                  {trigger.expected_outcome && (
                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <FiCheckCircle className="w-4 h-4 mr-2 text-green-600" />
                        Expected Outcome:
                      </h5>
                      <div className="bg-green-50 p-3 rounded-md border border-green-200">
                        <p className="text-sm text-green-800 leading-relaxed">
                          {trigger.expected_outcome}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Resources */}
                  {trigger.resources && trigger.resources.length > 0 && trigger.resources[0] && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <FiBookOpen className="w-4 h-4 mr-2 text-blue-600" />
                        Resources:
                      </h5>
                      <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                        <p className="text-sm text-blue-800 leading-relaxed">
                          {trigger.resources[0]}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Steps Section (fallback for older playbook format) */}
          {playbook.steps && playbook.steps.length > 0 && !playbook.triggers && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FiCheckCircle className="w-5 h-5 mr-2 text-green-600" />
                Playbook Steps
              </h3>
              
              {playbook.steps.map((step, index) => (
                <div key={step.step_id || index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-start mb-3">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full mr-3">
                      Step {step.step_id || index + 1}
                    </span>
                    <h4 className="text-md font-medium text-gray-900">
                      {step.title}
                    </h4>
                  </div>

                  {step.action && (
                    <div className="mb-3">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Action:</h5>
                      <div className="bg-gray-50 p-3 rounded-md">
                        <p className="text-sm text-gray-700">{step.action}</p>
                      </div>
                    </div>
                  )}

                  {step.expected_outcome && (
                    <div className="mb-3">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Expected Outcome:</h5>
                      <div className="bg-green-50 p-3 rounded-md border border-green-200">
                        <p className="text-sm text-green-800">{step.expected_outcome}</p>
                      </div>
                    </div>
                  )}

                  {step.resources && step.resources.length > 0 && step.resources[0] && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Resources:</h5>
                      <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                        <p className="text-sm text-blue-800">{step.resources[0]}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Additional Information */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
              <FiInfo className="w-5 h-5 mr-2 text-gray-600" />
              Additional Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {playbook.usage && (
                <div className="flex items-center text-gray-600">
                  <span className="font-medium">Usage:</span>
                  <span className="ml-2">{playbook.usage}</span>
                </div>
              )}
              {playbook.confidence && (
                <div className="flex items-center text-gray-600">
                  <span className="font-medium">Confidence:</span>
                  <span className="ml-2">{playbook.confidence}</span>
                </div>
              )}
              {playbook.match_percentage && (
                <div className="flex items-center text-gray-600">
                  <span className="font-medium">Match Percentage:</span>
                  <span className="ml-2">{playbook.match_percentage}%</span>
                </div>
              )}
              {playbook.similarity_score && (
                <div className="flex items-center text-gray-600">
                  <span className="font-medium">Similarity Score:</span>
                  <span className="ml-2">{formatSimilarityScore(playbook.similarity_score)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 text-white">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default PlaybookDetailModal
