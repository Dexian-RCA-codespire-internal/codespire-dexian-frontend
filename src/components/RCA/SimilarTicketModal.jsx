import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  FiCalendar, 
  FiUser, 
  FiTag, 
  FiAlertCircle, 
  FiClock, 
  FiTrendingUp,
  FiExternalLink,
  FiX,
  FiCheckCircle
} from 'react-icons/fi';

const SimilarTicketModal = ({ 
  isOpen, 
  onClose, 
  ticket, 
  currentTicket = null 
}) => {
  if (!ticket) return null;

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical':
      case '1':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
      case '2':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
      case '3':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
      case '4':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved':
      case 'closed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in progress':
      case 'assigned':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
      case 'open':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'bg-green-100 text-green-800 border-green-200';
    if (confidence >= 80) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (confidence >= 70) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900 flex items-center">
                <FiExternalLink className="w-5 h-5 mr-2 text-blue-500" />
                Similar Ticket Details
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Information */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                    {ticket.ticket_id}
                  </CardTitle>
                  <p className="text-base text-gray-700 leading-relaxed">
                    {ticket.short_description}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2 ml-4">
                  <Badge className={`${getConfidenceColor(ticket.confidence_percentage)} border`}>
                    {ticket.confidence_percentage}% match
                  </Badge>
                  {ticket.rank && (
                    <Badge variant="outline" className="text-xs">
                      Rank #{ticket.rank}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Ticket Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Basic Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-900 flex items-center">
                  <FiTag className="w-4 h-4 mr-2" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge className={`${getStatusColor(ticket.status)} border text-xs`}>
                    {ticket.status || 'N/A'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Priority:</span>
                  <Badge className={`${getPriorityColor(ticket.priority)} border text-xs`}>
                    {ticket.priority || 'N/A'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Category:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {ticket.category || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Source:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {ticket.source || 'N/A'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Impact & Urgency */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-900 flex items-center">
                  <FiTrendingUp className="w-4 h-4 mr-2" />
                  Impact & Urgency
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Impact:</span>
                  <Badge className={`${getPriorityColor(ticket.impact)} border text-xs`}>
                    {ticket.impact || 'N/A'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Urgency:</span>
                  <Badge className={`${getPriorityColor(ticket.urgency)} border text-xs`}>
                    {ticket.urgency || 'N/A'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Assignment Group:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {ticket.assignment_group || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Assigned To:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {ticket.assigned_to || 'N/A'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resolution Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-900 flex items-center">
                <FiCheckCircle className="w-4 h-4 mr-2" />
                Resolution Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ticket.resolution_analysis && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Resolution Analysis:</h4>
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {ticket.resolution_analysis}
                      </p>
                    </div>
                  </div>
                )}
                {ticket.root_cause && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Root Cause:</h4>
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {ticket.root_cause}
                      </p>
                    </div>
                  </div>
                )}
                {ticket.close_notes && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Close Notes:</h4>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {ticket.close_notes}
                      </p>
                    </div>
                  </div>
                )}
                {ticket.work_notes && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Work Notes:</h4>
                    <div className="bg-yellow-50 rounded-lg p-3">
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {ticket.work_notes}
                      </p>
                    </div>
                  </div>
                )}
                {ticket.customer_summary && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Customer Summary:</h4>
                    <div className="bg-orange-50 rounded-lg p-3">
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {ticket.customer_summary}
                      </p>
                    </div>
                  </div>
                )}
                {!ticket.resolution_analysis && !ticket.root_cause && !ticket.close_notes && !ticket.work_notes && !ticket.customer_summary && (
                  <div className="text-center py-4 text-gray-500">
                    <p className="text-sm">No resolution information available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          {ticket.description && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-900 flex items-center">
                  <FiAlertCircle className="w-4 h-4 mr-2" />
                  Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {ticket.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}


          {/* Comparison with Current Ticket */}
          {currentTicket && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-blue-900 flex items-center">
                  <FiTrendingUp className="w-4 h-4 mr-2" />
                  Comparison with Current Ticket
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-blue-800 mb-2">Current Ticket:</h4>
                    <div className="bg-white rounded-lg p-3 space-y-2">
                      <p className="text-sm"><strong>ID:</strong> {currentTicket.ticket_id}</p>
                      <p className="text-sm"><strong>Status:</strong> {currentTicket.status}</p>
                      <p className="text-sm"><strong>Priority:</strong> {currentTicket.priority}</p>
                      <p className="text-sm"><strong>Category:</strong> {currentTicket.category}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-blue-800 mb-2">Similar Ticket:</h4>
                    <div className="bg-white rounded-lg p-3 space-y-2">
                      <p className="text-sm"><strong>ID:</strong> {ticket.ticket_id}</p>
                      <p className="text-sm"><strong>Status:</strong> {ticket.status}</p>
                      <p className="text-sm"><strong>Priority:</strong> {ticket.priority}</p>
                      <p className="text-sm"><strong>Category:</strong> {ticket.category}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SimilarTicketModal;
