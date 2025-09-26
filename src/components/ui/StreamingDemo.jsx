import React, { useState, useEffect } from 'react'
import { StreamingTextarea } from './StreamingTextarea'
import { Button } from './Button'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { FiPlay, FiSquare } from 'react-icons/fi'

const StreamingDemo = () => {
  const [technicalReport, setTechnicalReport] = useState('')
  const [customerSummary, setCustomerSummary] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [generatingTechnical, setGeneratingTechnical] = useState(false)
  const [generatingCustomer, setGeneratingCustomer] = useState(false)
  const [streamingProgress, setStreamingProgress] = useState('')

  // Simulate streaming data with proper chunk handling
  const simulateStreaming = async () => {
    setStreaming(true)
    setGeneratingTechnical(true)
    setGeneratingCustomer(true)
    setTechnicalReport('')
    setCustomerSummary('')
    setStreamingProgress('Starting RCA generation...')

    // Simulate technical report streaming with proper chunks
    const technicalText = `# Technical Root Cause Analysis Report

## Incident Summary
- **Ticket ID**: INC0012345
- **Severity**: P1 - Critical
- **Duration**: 2.5 hours
- **Affected Users**: 15,000+

## Root Cause Analysis
The incident was caused by database connection pool exhaustion due to unclosed connections in background job processing. The HikariCP connection pool was configured with a maximum of 20 connections, but the application was not properly releasing connections after job completion.

## Technical Details
- **Environment**: Production
- **Database**: PostgreSQL 13.4
- **Connection Pool**: HikariCP 4.0.3
- **Max Connections**: 20
- **Actual Connections at Failure**: 20 (100% utilization)

## Resolution Steps
1. Identified connection leak in background job processor
2. Implemented proper connection cleanup in job handlers
3. Added connection monitoring and alerting
4. Increased connection pool size to 30 as temporary measure

## Prevention Measures
- Added automated connection leak detection
- Implemented connection usage monitoring
- Updated job processing framework with proper resource management
- Created runbook for similar incidents

## Impact Assessment
- **MTTR**: 2.5 hours
- **Revenue Loss**: $45,000
- **SLA Breach**: Yes
- **Customer Complaints**: 247 tickets

## Recommendations
1. Implement connection pooling best practices across all services
2. Add comprehensive monitoring for database connections
3. Create automated recovery procedures for connection pool exhaustion
4. Conduct regular capacity planning reviews`

    const customerText = `# Customer Communication Summary

## What Happened
We experienced a brief service interruption that affected some of our systems for approximately 2.5 hours on January 15th, 2024.

## Impact on You
During this time, you may have experienced:
- Difficulty logging into your account
- Delays in processing payments
- Slower than usual response times

## What We Did
Our technical team immediately identified and resolved the issue. We:
- Located the source of the problem
- Implemented a fix to restore full service
- Added additional monitoring to prevent similar issues

## Current Status
All services are now fully operational and running normally. We have not detected any ongoing issues.

## What This Means for You
- All systems are working as expected
- Your data and accounts are secure
- No action is required on your part

## Our Commitment
We sincerely apologize for any inconvenience this may have caused. We are continuously working to improve our systems and prevent similar incidents in the future.

## Need Help?
If you continue to experience any issues or have questions, please don't hesitate to contact our support team at support@company.com or through your account portal.

Thank you for your patience and understanding.`

    // Stream technical report with proper chunking
    let currentTechnical = ''
    for (let i = 0; i < technicalText.length; i += 8) {
      const chunk = technicalText.slice(i, i + 8)
      currentTechnical += chunk
      setTechnicalReport(currentTechnical)
      setStreamingProgress(`Generating technical report... ${Math.round((i / technicalText.length) * 50)}%`)
      await new Promise(resolve => setTimeout(resolve, 80))
    }
    setGeneratingTechnical(false)

    // Small delay before customer summary
    setStreamingProgress('Preparing customer summary...')
    await new Promise(resolve => setTimeout(resolve, 500))

    // Stream customer summary with proper chunking
    let currentCustomer = ''
    for (let i = 0; i < customerText.length; i += 12) {
      const chunk = customerText.slice(i, i + 12)
      currentCustomer += chunk
      setCustomerSummary(currentCustomer)
      setStreamingProgress(`Generating customer summary... ${Math.round(50 + (i / customerText.length) * 50)}%`)
      await new Promise(resolve => setTimeout(resolve, 60))
    }
    setGeneratingCustomer(false)

    setStreamingProgress('RCA generation completed successfully!')
    setStreaming(false)
  }

  const stopStreaming = () => {
    setStreaming(false)
    setGeneratingTechnical(false)
    setGeneratingCustomer(false)
    setStreamingProgress('')
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Streaming Textarea Demo</h2>
          <p className="text-gray-600">Demonstration of real-time data streaming in textareas</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={simulateStreaming}
            disabled={streaming}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <FiPlay className="w-4 h-4 mr-2" />
            {streaming ? 'Generating...' : 'Start Demo'}
          </Button>
          {streaming && (
            <Button
              onClick={stopStreaming}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              <FiSquare className="w-4 h-4 mr-2" />
              Stop
            </Button>
          )}
        </div>
      </div>

      {streamingProgress && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-700 font-medium">{streamingProgress}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
              <div className="w-5 h-5 mr-2 bg-blue-100 rounded flex items-center justify-center">
                <span className="text-blue-600 text-xs font-bold">T</span>
              </div>
              Technical RCA Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StreamingTextarea
              value={technicalReport}
              onChange={(e) => setTechnicalReport(e.target.value)}
              placeholder="Technical RCA report will be generated here..."
              rows={20}
              className="font-mono"
              streaming={streaming}
              generating={generatingTechnical}
              streamingProgress={streamingProgress}
              type="technical"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
              <div className="w-5 h-5 mr-2 bg-green-100 rounded flex items-center justify-center">
                <span className="text-green-600 text-xs font-bold">C</span>
              </div>
              Customer-Friendly Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StreamingTextarea
              value={customerSummary}
              onChange={(e) => setCustomerSummary(e.target.value)}
              placeholder="Customer-friendly summary will be generated here..."
              rows={20}
              streaming={streaming}
              generating={generatingCustomer}
              streamingProgress={streamingProgress}
              type="customer"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default StreamingDemo
