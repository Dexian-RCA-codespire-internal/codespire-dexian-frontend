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
import { FiDatabase, FiLoader, FiCheckCircle, FiX, FiInfo } from 'react-icons/fi'

const KnowledgeBaseModal = ({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  isCreating = false,
  ticketData = null
}) => {
  const [creating, setCreating] = useState(false)

  const handleConfirm = async () => {
    setCreating(true)
    try {
      await onConfirm()
    } finally {
      setCreating(false)
    }
  }

  const handleCancel = () => {
    if (!creating) {
      onCancel()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <FiDatabase className="w-4 h-4 text-blue-600" />
            </div>
            Create Knowledge Base Entry
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 mt-2">
            Would you like to create a knowledge base entry for this resolved ticket? This will help other team members find solutions for similar issues in the future.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FiInfo className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-medium text-blue-900 text-sm mb-2">
                  What will be included in the Knowledge Base?
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>Problem Statement:</strong> Issue description and type</li>
                  <li>• <strong>Impact Assessment:</strong> Affected areas and severity</li>
                  <li>• <strong>Root Cause Analysis:</strong> Identified cause and evidence</li>
                  <li>• <strong>Solution Steps:</strong> Corrective actions taken</li>
                  <li>• <strong>Resolution Summary:</strong> Technical and customer reports</li>
                </ul>
              </div>
            </div>
          </div>

          {ticketData && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
              <div className="text-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-700">Ticket:</span>
                  <span className="text-gray-900">{ticketData.ticket_id}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-700">Category:</span>
                  <span className="text-gray-900">{ticketData.category}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Status:</span>
                  <span className="text-gray-900">{ticketData.status}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={creating}
            className="flex items-center gap-2"
          >
            <FiX className="w-4 h-4" />
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={creating}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            {creating ? (
              <>
                <FiLoader className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <FiCheckCircle className="w-4 h-4" />
                Create Knowledge Base
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default KnowledgeBaseModal