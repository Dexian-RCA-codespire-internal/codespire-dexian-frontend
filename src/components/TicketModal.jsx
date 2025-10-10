import React, { useEffect } from 'react'

const TicketModal = ({ ticket, open, onClose }) => {
  useEffect(() => {
    if (!open) return

    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open || !ticket) return null

  // Define keys to exclude from the modal view
  const excludeKeys = new Set([
    'system',
    'priorityColor',
    'progress',
    'progressColor',
    'stage',
    'subcategory',
    'assigned_to',
    'assignment_group',
    'id',
    '_id',
    'sys_id',
    'number',
  'company',
  'location',
    'sys_created_on',
    'sys_updated_on',
    'raw',
    // legacy/step fields that are often empty or noisy
    'stepData',
    'steps',
    'rcaSteps',
    'rca_workflow_steps',
    'problem_step1',
    'timeline_step2',
    'impact_step3',
    'findings_step4',
    'root_cause_step5'
  ])

  // Helper to determine if a value is empty
  const isEmpty = (v) => {
    if (v === null || v === undefined) return true
    if (typeof v === 'string' && v.trim() === '') return true
    if (Array.isArray(v) && v.length === 0) return true
    if (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0) return true
    return false
  }

  // Render entries, excluding unwanted and empty values
  const entries = Object.entries(ticket).filter(([k, v]) => {
    if (!k) return false
    if (excludeKeys.has(k)) return false
    if (isEmpty(v)) return false
    return true
  })

  // Find resolved time from common fields
  const resolvedField = ['resolved_at', 'resolvedAt', 'resolved_at_time', 'resolved_at_date'].find(f => Object.prototype.hasOwnProperty.call(ticket, f) && !isEmpty(ticket[f]))
  const resolvedTimeRaw = resolvedField ? ticket[resolvedField] : null
  const resolvedTimeFormatted = resolvedTimeRaw ? new Date(resolvedTimeRaw).toLocaleString() : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onClose} />

      <div className="relative bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[80vh] overflow-auto z-10 p-6">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-lg font-semibold">Ticket Details</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900">×</button>
        </div>

        <div className="space-y-3 text-sm text-gray-700">
          {resolvedTimeFormatted && (
            <div className="mb-2">
              <div className="text-xs text-gray-500">Resolved</div>
              <div className="text-sm font-medium text-gray-800">{resolvedTimeFormatted}</div>
            </div>
          )}
          {entries.length === 0 ? (
            <div className="text-sm text-gray-500">No additional details available.</div>
          ) : (
            entries.map(([key, value]) => (
              <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start border-b border-gray-100 py-2">
                <div className="text-sm font-bold text-gray-700 capitalize md:pr-3">{key.replace(/_/g, ' ')}</div>
                <div className="md:col-span-2 break-words whitespace-pre-wrap text-sm text-gray-800 md:border-l md:border-gray-100 md:pl-3">
                  {typeof value === 'object'
                    ? <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(value, null, 2)}</pre>
                    : String(value)}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 text-right">
          <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded">Close</button>
        </div>
      </div>
    </div>
  )
}

export default TicketModal
