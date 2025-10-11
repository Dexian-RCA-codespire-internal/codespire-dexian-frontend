import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog'
import { Button } from './Button'
import { FiDatabase, FiLoader, FiCheckCircle, FiX, FiInfo, FiSave, FiBookOpen } from 'react-icons/fi'

const KnowledgeBaseModal = ({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  isCreating = false,
  ticketData = null
}) => {
  const [creating, setCreating] = useState(false)
  const [createKnowledgeBase, setCreateKnowledgeBase] = useState(false) // Default to unchecked

  const handleConfirm = async () => {
    setCreating(true)
    try {
      // Pass the createKnowledgeBase state to the parent component
      await onConfirm(createKnowledgeBase)
    } finally {
      setCreating(false)
    }
  }

  const handleCancel = () => {
    if (!creating) {
      onCancel()
    }
  }

  const handleSaveOnly = async () => {
    setCreating(true)
    try {
      // Save RCA without creating knowledge base
      await onConfirm(false)
    } finally {
      setCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0">
        {/* Enhanced Header */}
        <DialogHeader className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <DialogTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shadow-sm">
              <FiSave className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div>Save RCA Report</div>
              <div className="text-sm font-normal text-gray-600 mt-1">
                Choose how to save your analysis and findings
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-6 space-y-6">
          {/* RCA Save Confirmation */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                <FiCheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-green-900 text-sm mb-1">
                  RCA Report Ready to Save
                </h4>
                <p className="text-sm text-green-800">
                  Your technical analysis and customer-friendly summary will be saved to the database.
                </p>
              </div>
            </div>
          </div>

          {/* Knowledge Base Option */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <label className="flex items-center gap-3 cursor-pointer flex-1">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={createKnowledgeBase}
                    onChange={(e) => setCreateKnowledgeBase(e.target.checked)}
                    className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    disabled={creating}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <FiBookOpen className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-gray-900 text-sm">
                      Create Knowledge Base Entry
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Make this solution searchable for future similar issues
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Ticket Information */}
          {ticketData && (
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
              <h4 className="font-medium text-gray-900 text-sm mb-3 flex items-center gap-2">
                <FiDatabase className="w-4 h-4 text-gray-600" />
                Ticket Information
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Ticket ID:</span>
                    <span className="text-gray-900">{ticketData.ticket_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Priority:</span>
                    <span className="text-gray-900">{ticketData.priority}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Category:</span>
                    <span className="text-gray-900">{ticketData.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Status:</span>
                    <span className="text-gray-900">{ticketData.status}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex gap-3">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={creating}
            className="flex items-center gap-2"
          >
            <FiX className="w-4 h-4" />
            Cancel
          </Button>
          
          {!createKnowledgeBase && (
            <Button
              onClick={handleSaveOnly}
              disabled={creating}
              className="flex text-white items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              {creating ? (
                <>
                  <FiLoader className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <FiSave className="w-4 h-4" />
                  Save RCA Only
                </>
              )}
            </Button>
          )}
          
          {createKnowledgeBase && (
            <Button
              onClick={handleConfirm}
              disabled={creating}
              className="flex text-white items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              {creating ? (
                <>
                  <FiLoader className="w-4 h-4 animate-spin" />
                  Saving & Creating...
                </>
              ) : (
                <>
                  <FiBookOpen className="w-4 h-4" />
                  Save & Create KB
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default KnowledgeBaseModal