import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Skeleton } from './ui/skeleton'
import { Checkbox } from './ui/checkbox'
import PlaybookDetailModal from './ui/PlaybookDetailModal'
import { FiBookOpen, FiExternalLink, FiRefreshCw, FiAlertCircle, FiCheckCircle, FiClock } from 'react-icons/fi'
import { playbookService } from '../api/services/playbookService'
import { aiService } from '../api/services/aiService'
import { solutionGenerationService } from '../api/services/solutionGenerationService'

const PlaybookRecommender = ({ ticketData, aiGuidanceQuestion, onGuidanceResult, onLoadingChange }) => {
  const [playbooks, setPlaybooks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastSearched, setLastSearched] = useState(null)
  const [guidanceLoading, setGuidanceLoading] = useState(false)
  const [selectedPlaybook, setSelectedPlaybook] = useState(null)
  const [showPlaybookModal, setShowPlaybookModal] = useState(false)
  const [selectedPlaybooks, setSelectedPlaybooks] = useState(new Set())

  // Generate search query from ticket data using short description and description
  const generateSearchQuery = (ticket) => {
    if (!ticket) return ''
    
    // Build query using short description and description
    const queryParts = []
    
    // Add short description (primary issue summary)
    if (ticket.short_description && ticket.short_description.trim()) {
      queryParts.push(ticket.short_description.trim())
    }
    
    // Add description (detailed issue information)
    if (ticket.description && ticket.description.trim()) {
      // Clean up description - remove extra whitespace and newlines
      const cleanDescription = ticket.description
        .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
        .replace(/\n+/g, ' ')  // Replace newlines with spaces
        .trim()
      
      if (cleanDescription && cleanDescription !== ticket.short_description) {
        queryParts.push(cleanDescription)
      }
    }
    
    // Create the final query
    let query = queryParts.join(' ')
    
    // Simplify the query for AI guidance search - extract key terms
    if (query.length > 100) {
      // Extract key terms from the query
      const keyTerms = []
      
      // Look for common technical terms
      const technicalTerms = [
        'email', 'smtp', 'quota', 'server', 'connection', 
        'network', 'dns', 'database', 'login', 'password', 'authentication',
        'ssl', 'tls', 'certificate', 'firewall', 'port', 'timeout'
      ]
      
      technicalTerms.forEach(term => {
        if (query.toLowerCase().includes(term)) {
          keyTerms.push(term)
        }
      })
      
      // If we found key terms, use them; otherwise use first 100 chars
      if (keyTerms.length > 0) {
        query = keyTerms.join(' ')
      } else {
        query = query.substring(0, 100)
      }
    }

    return query
  }

  // Search for relevant playbooks using vector search as primary method
  const searchPlaybooks = async (ticket) => {
    if (!ticket) {
      console.log('❌ No ticket data provided to searchPlaybooks')
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      
      console.log('🚀 === STARTING VECTOR-BASED PLAYBOOK SEARCH ===')
      console.log('📋 Input ticket data:', ticket)
      
      const searchQuery = generateSearchQuery(ticket)
      console.log('🔍 Generated search query:', searchQuery)
      console.log('📏 Query length:', searchQuery.length)
      
      if (!searchQuery.trim()) {
        console.log('❌ Empty search query generated')
        setError('No searchable content found in ticket data')
        return
      }
      
      // PRIMARY: Use vector search to find top matching playbooks
      console.log('🎯 === PRIMARY: Vector Search for Top Matches ===')
      const vectorSearchOptions = {
        topK: 3, // Get top 3 matches
        minScore: 0.1 // Minimum similarity score threshold
      }
      
      console.log('🔍 Vector search query:', searchQuery)
      console.log('🔍 Vector search options:', vectorSearchOptions)
      
      const vectorResponse = await playbookService.searchPlaybooksByVector(searchQuery, vectorSearchOptions)
      console.log('📚 Vector search response:', vectorResponse)
      console.log('📊 Vector search results:', vectorResponse.data?.length || 0)
      console.log('✅ Vector search success:', vectorResponse.success)
      
      let processedPlaybooks = []
      
      if (vectorResponse.success && vectorResponse.data && vectorResponse.data.length > 0) {
        console.log('✅ Vector search found results:')
        
        // Process all matching playbooks
        const allPlaybooks = vectorResponse.data
          .map(playbook => {
            // Extract actual data if it's a Mongoose document
            const actualData = playbook._doc || playbook
            return {
              ...actualData,
              similarity_score: playbook.similarity_score,
              search_type: 'vector',
              match_percentage: Math.round((playbook.similarity_score || 0) * 100)
            }
          })
        
        // Apply conditional logic: if any playbook has >50% match, show top 3; otherwise show only top 1
        const highMatchPlaybooks = allPlaybooks.filter(playbook => playbook.match_percentage > 50)
        
        if (highMatchPlaybooks.length > 0) {
          // Show top 3 playbooks with >50% match
          processedPlaybooks = highMatchPlaybooks.slice(0, 3)
          console.log('✅ Found high match playbooks (>50%), showing top 3')
        } else {
          // Show only the top 1 playbook if no high matches
          processedPlaybooks = allPlaybooks.slice(0, 1)
          console.log('⚠️ No high match playbooks found, showing only top 1')
        }
        
        console.log(`📊 ${processedPlaybooks.length > 1 ? 'Top matching playbooks' : 'Best match playbook'}:`)
        processedPlaybooks.forEach((playbook, index) => {
          console.log(`  ${index === 0 ? '🏆' : '🥈'} #${index + 1} ${playbook.title}`)
        })
        
        console.log(`🏆 ${processedPlaybooks.length > 1 ? 'Top matches' : 'Best match'}:`, processedPlaybooks.map(p => `${p.title} (${p.match_percentage}%)`).join(', '))
        
      } else {
        console.log('❌ Vector search returned no results, trying fallback...')
        
        // FALLBACK: Try with short description only
        if (ticket.short_description) {
          console.log('🔄 Fallback: Trying vector search with short description only...')
          const fallbackResponse = await playbookService.searchPlaybooksByVector(ticket.short_description, vectorSearchOptions)
          
          if (fallbackResponse.success && fallbackResponse.data && fallbackResponse.data.length > 0) {
            console.log('✅ Fallback vector search found results!')
            processedPlaybooks = fallbackResponse.data
              .map(playbook => {
                const actualData = playbook._doc || playbook
                return {
                  ...actualData,
                  similarity_score: playbook.similarity_score,
                  search_type: 'vector_fallback',
                  match_percentage: Math.round((playbook.similarity_score || 0) * 100)
                }
              })
            
            // Apply same conditional logic for fallback
            const fallbackHighMatchPlaybooks = fallbackPlaybooks.filter(playbook => playbook.match_percentage > 50)
            
            if (fallbackHighMatchPlaybooks.length > 0) {
              processedPlaybooks = fallbackHighMatchPlaybooks.slice(0, 3)
            } else {
              processedPlaybooks = fallbackPlaybooks.slice(0, 1)
            }
          }
        }
      }
      
      // Set results
      if (processedPlaybooks.length > 0) {
        console.log('🔍 Final playbooks to display:', processedPlaybooks.length)
        console.log(`🏆 ${processedPlaybooks.length > 1 ? 'Top matches' : 'Best match'}:`, processedPlaybooks.map(p => `${p.title} (${p.match_percentage}%)`).join(', '))
        
        setPlaybooks(processedPlaybooks)
        setLastSearched(new Date())
        console.log(`✅ ${processedPlaybooks.length > 1 ? 'Top matching playbooks' : 'Best match playbook'} set successfully`)
      } else {
        console.log('❌ No playbooks found with vector search')
        setError('No relevant playbooks found for this ticket')
      }
      
      console.log('🏁 === VECTOR SEARCH COMPLETE ===')
    } catch (err) {
      console.error('❌ === CRITICAL ERROR IN VECTOR SEARCH ===')
      console.error('❌ Error object:', err)
      console.error('❌ Error message:', err.message)
      setError(err.message || 'Failed to search playbooks')
    } finally {
      setLoading(false)
      console.log('🏁 === SEARCH PROCESS COMPLETED ===')
    }
  }

  // Auto-search when ticket data changes
  useEffect(() => {
    if (ticketData) {
      console.log('🎫 PlaybookRecommender received ticket data:', ticketData)
      console.log('🎫 Ticket ID:', ticketData.ticket_id)
      console.log('🎫 Short description:', ticketData.short_description)
      console.log('🎫 Description:', ticketData.description?.substring(0, 100) + '...')
      console.log('🚀 Starting playbook search with improved query generation...')
      
      // Clear previous results when new ticket is loaded
      setPlaybooks([])
      setError(null)
      setLastSearched(null)
      
      searchPlaybooks(ticketData)
    }
  }, [ticketData])

  // Handle manual refresh
  const handleRefresh = () => {
    if (ticketData) {
      searchPlaybooks(ticketData)
    }
  }

  // Handle playbook click to open modal
  const handlePlaybookClick = (playbook) => {
    setSelectedPlaybook(playbook)
    setShowPlaybookModal(true)
    
    // Also increment usage
    if (playbook.playbook_id) {
      playbookService.incrementUsage(playbook.playbook_id).catch(err => {
        console.warn('⚠️ Failed to increment playbook usage:', err)
      })
    }
  }

  // Handle modal close
  const handleCloseModal = () => {
    setShowPlaybookModal(false)
    setSelectedPlaybook(null)
  }

  // Handle checkbox selection
  const handlePlaybookSelection = (playbookId, isSelected) => {
    setSelectedPlaybooks(prev => {
      const newSet = new Set(prev)
      if (isSelected) {
        newSet.add(playbookId)
      } else {
        newSet.delete(playbookId)
      }
      return newSet
    })
  }

  // Handle regenerate based on selected playbooks
  const handleRegenerateBasedOnPlaybooks = async () => {
    if (selectedPlaybooks.size === 0) return

    try {
      setGuidanceLoading(true)
      setError(null)
      
      // Notify parent component about loading state
      if (onLoadingChange) {
        onLoadingChange(true)
      }
      
      console.log('🔄 Regenerating solution based on selected playbooks:', Array.from(selectedPlaybooks))
      
      // Get selected playbook data
      const selectedPlaybookData = playbooks.filter(p => 
        selectedPlaybooks.has(p.playbook_id || p._id)
      )
      
      console.log('📋 Selected playbook data:', selectedPlaybookData)
      
      // Extract playbook IDs
      const playbookIds = selectedPlaybookData.map(p => p.playbook_id || p._id)
      
      // Prepare the request payload for solution generation
      const requestPayload = {
        currentTicket: {
          category: ticketData.category || "Inquiry / Help",
          description: ticketData.description || "",
          short_description: ticketData.short_description || "",
          enhanced_problem: ticketData.enhanced_problem || ticketData.description || "",
          impact: ticketData.impact || ["3 - Low"],
          priority: ticketData.priority || "5 - Planning",
          urgency: ticketData.urgency || "3 - Low",
          issueType: ticketData.issueType || "software",
          severity: ticketData.severity || "sev2",
          businessImpactCategory: ticketData.businessImpactCategory || "operational_downtime",
          impactLevel: ticketData.impactLevel || "sev3",
          departmentAffected: ticketData.departmentAffected || "it_operations",
          problemStatement: ticketData.problemStatement || ticketData.description || "",
          impactAssessment: ticketData.impactAssessment || "Technical/operational impact assessment focusing on system availability and infrastructure",
          rootCauseAnalysis: ticketData.rootCauseAnalysis || "Root cause analysis completed. Found potential causes with confidence scores."
        },
        similarTickets: [], // Empty array as per the API example
        playbooks: selectedPlaybookData
      }
      
      console.log('🎯 Calling solution generation API with payload:', requestPayload)
      
      // Call solution generation service
      const response = await solutionGenerationService.generateSolution(requestPayload)
      
      console.log('✅ Solution generation response:', response)
      
      if (response.success && response.solutions && response.solutions.length > 0) {
        // Send the result to the parent component (like CorrectiveActionsStep does)
        if (onGuidanceResult) {
          onGuidanceResult(response)
        }
        
        // Increment usage for all selected playbooks
        for (const playbookId of playbookIds) {
          try {
            await playbookService.incrementUsage(playbookId)
            console.log('✅ Playbook usage incremented for:', playbookId)
          } catch (err) {
            console.warn('⚠️ Failed to increment playbook usage:', err)
          }
        }
        
        // Update confidence scores for selected playbooks
        for (const playbookId of playbookIds) {
          await updateConfidenceScore(playbookId)
        }
        
      } else {
        console.log('❌ No solution generated')
        alert('No solution was generated for the selected playbooks.')
      }
      
    } catch (err) {
      console.error('❌ Error regenerating solution based on playbooks:', err)
      setError(err.message || 'Failed to regenerate solution based on selected playbooks')
      alert(`Error: ${err.message || 'Failed to regenerate solution based on selected playbooks'}`)
    } finally {
      setGuidanceLoading(false)
      
      // Notify parent component that loading is complete
      if (onLoadingChange) {
        onLoadingChange(false)
      }
    }
  }

  // Update confidence score based on usage for a specific playbook
  const updateConfidenceScore = async (playbookId) => {
    try {
      // Get current playbook data
      const playbook = playbooks.find(p => p.playbook_id === playbookId)
      if (!playbook) {
        console.warn(`⚠️ Playbook not found: ${playbookId}`)
        return
      }
      
      // Calculate new confidence based on usage
      const currentUsage = parseInt(playbook.usage?.replace(/\D/g, '') || '0')
      const newUsage = currentUsage + 1
      
      // Confidence calculation: 50% base + usage bonus (max 95%)
      const baseConfidence = 50
      const usageBonus = Math.min(newUsage * 2, 45) // 2% per usage, max 45%
      const newConfidence = Math.min(baseConfidence + usageBonus, 95)
      

      
      // Update ONLY the specific playbook in the local state
      setPlaybooks(prev => prev.map(p => 
        p.playbook_id === playbookId 
          ? { 
              ...p, 
              usage: `${newUsage} tickets resolved`,
              confidence: `${newConfidence}%`
            }
          : p  // Keep other playbooks unchanged
      ))
      
    } catch (err) {
      console.warn('⚠️ Failed to update confidence score:', err)
    }
  }

  // Handle "Use" button click (kept for backward compatibility)
  const handleUsePlaybook = async (playbookId) => {
    try {
      await playbookService.incrementUsage(playbookId)
      console.log('✅ Playbook usage incremented via Use button:', playbookId)
      await updateConfidenceScore(playbookId)
      alert('Playbook usage incremented successfully!')
    } catch (err) {
      console.warn('⚠️ Failed to increment playbook usage:', err)
      alert('Failed to increment playbook usage. Please try again.')
    }
  }

  // Browser console test function - you can call this directly in browser console
  window.testAIGuidanceAPI = async () => {
    try {
      const playbookIds = ['PB-000076-2025-09-24T09-06-07-613Z'];
      const guidanceQuestion = "Check SMTP server status";
      
      console.log('🔍 Testing AI Guidance API directly...');
      console.log('📋 Playbook IDs:', playbookIds);
      console.log('❓ Question:', guidanceQuestion);
      
      const response = await fetch('http://localhost:8081/api/v1/ai/playbook-recommender/search-guidance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playbookIds: playbookIds,
          guidanceQuestion: guidanceQuestion
        })
      });
      
      const data = await response.json();
      console.log('📊 Direct API Response:', data);
      
    } catch (error) {
      console.error('❌ Direct API Error:', error);
    }
  };

  // Test query generation function
  window.testQueryGeneration = (ticketData) => {
    console.log('🔍 Testing Query Generation...');
    console.log('📋 Input ticket:', ticketData);
    const query = generateSearchQuery(ticketData);
    console.log('📋 Generated query:', query);
    console.log('📋 Query length:', query.length);
    return query;
  };

  // Preprocess AI guidance questions to extract key terms for better matching
  const preprocessAIGuidanceQuestion = (question) => {
    console.log('🔧 Preprocessing AI guidance question:', question);
    
    // Define mapping of complex questions to simpler search terms
    const questionMappings = {
      // Step 5: Root Cause Analysis
      'Based on your investigation, what is the underlying root cause?': 'root cause investigation',
      'What is the underlying root cause?': 'root cause',
      'What caused this issue?': 'root cause',
      
      // Step 6: Corrective Actions  
      'Check SMTP server status?': 'email server',
      'Check server status?': 'server status',
      'Verify server configuration?': 'server configuration',
      
      // Step 1: Problem Definition
      'What specific problem or incident occurred?': 'problem incident',
      'Describe the symptoms observed': 'symptoms problem',
      
      // Step 2: Timeline
      'When did this issue first occur?': 'timeline issue',
      'What events preceded it?': 'timeline events',
      
      // Step 3: Impact
      'What was the business and technical impact?': 'impact business technical',
      'What was the impact of this issue?': 'impact issue',
      
      // Step 4: Investigation
      'What data have you gathered?': 'investigation data',
      'What patterns or clues were discovered?': 'investigation patterns clues'
    };
    
    // Check for exact matches first
    if (questionMappings[question]) {
      const mapped = questionMappings[question];
      console.log('🎯 Found exact mapping:', question, '→', mapped);
      return mapped;
    }
    
    // Extract key technical terms from the question
    const technicalTerms = [
      'email', 'smtp', 'server', 'status', 'configuration', 'delivery',
      'root', 'cause', 'investigation', 'problem', 'issue', 'impact',
      'timeline', 'data', 'patterns', 'symptoms', 'business', 'technical'
    ];
    
    const foundTerms = technicalTerms.filter(term => 
      question.toLowerCase().includes(term)
    );
    
    if (foundTerms.length > 0) {
      const processed = foundTerms.join(' ');
      console.log('🎯 Extracted technical terms:', foundTerms, '→', processed);
      return processed;
    }
    
    // Fallback: use first few words of the question
    const words = question.split(' ').slice(0, 3).join(' ');
    console.log('🎯 Fallback to first words:', words);
    return words;
  };

  // Handle "Get" button click - Search AI guidance in playbook triggers
  const handleGetGuidance = async () => {
    if (!playbooks.length || !ticketData) {
      alert('No playbooks available or ticket data missing')
      return
    }

    try {
      setGuidanceLoading(true)
      setError(null)
      
    
      
      // Extract playbook IDs from current recommendations
      const playbookIds = playbooks.map(p => p.playbook_id || p._id)
      
      // Use AI guidance question from RCA workflow if available, otherwise generate from ticket data
      let guidanceQuestion
      
      if (aiGuidanceQuestion && aiGuidanceQuestion.trim()) {
        // Use the AI guidance question from the current RCA step
        let rawQuestion = aiGuidanceQuestion.trim()
        console.log('🎯 Raw AI guidance question:', rawQuestion)
        
        // Preprocess the question to extract key terms for better matching
        guidanceQuestion = preprocessAIGuidanceQuestion(rawQuestion)
        console.log('🎯 Processed AI guidance question:', guidanceQuestion)
      } else {
        // Fallback: generate from ticket data
        guidanceQuestion = generateSearchQuery(ticketData)
        console.log('🔄 Fallback: Generated from ticket data:', guidanceQuestion)
        
        // Further simplify for better matching - remove specific terms
        if (guidanceQuestion.includes('quota exceeded')) {
          guidanceQuestion = 'email quota'
          console.log('🔄 Simplified query for better matching:', guidanceQuestion)
        }
      }
      
      // Debug: Log detailed information

      // Debug: Log request payload
      const requestPayload = {
        playbookIds: playbookIds,
        guidanceQuestion: guidanceQuestion
      };
      console.log('📤 Request Payload:', JSON.stringify(requestPayload, null, 2));
      
      console.log('🎯 Searching guidance in playbooks:', playbookIds)
      console.log('❓ Guidance question:', guidanceQuestion)
      
      // Call AI service to search guidance in triggers
      const response = await aiService.playbookRecommender.searchGuidanceInTriggers({
        playbookIds,
        guidanceQuestion
      })
      
     
      
      if (response.success && response.data) {
        setAiGuidanceResults(response.data)
        console.log('🎯 AI guidance results:', response.data)
        
        // Send the result to the parent component and increment usage for the specific playbook
        if (response.data.length > 0) {
          const bestResult = response.data[0] // Get only the first/best result
          console.log('🎯 Sending AI guidance result to parent:', bestResult)
          
          // Increment usage ONLY for the specific playbook that provided the guidance
          if (bestResult.playbook_id) {
            try {
              await playbookService.incrementUsage(bestResult.playbook_id)
              console.log('✅ Playbook usage incremented for:', bestResult.playbook_id)
              console.log('📊 Playbook title:', bestResult.playbook_title)
              
              // Update confidence score for this specific playbook only
              await updateConfidenceScore(bestResult.playbook_id)
            } catch (err) {
              console.warn('⚠️ Failed to increment playbook usage:', err)
            }
          }
          
          // Call the callback function to pass the result to parent
          if (onGuidanceResult) {
            onGuidanceResult(bestResult)
          }
        } else {
          console.log('❌ No AI guidance results found')
          // Still call the callback with null to indicate no results
          if (onGuidanceResult) {
            onGuidanceResult(null)
          }
        }
      } else {
        console.log('❌ No AI guidance results found')
        alert('No AI guidance actions found for this ticket.')
      }
      
    } catch (err) {
      console.error('❌ Error searching AI guidance:', err)
      console.error('❌ Error Response:', err.response?.data);
      console.error('❌ Error Status:', err.response?.status);
      setError(err.message || 'Failed to search AI guidance')
      alert(`Error searching AI guidance: ${err.message || 'Unknown error'}`)
    } finally {
      setGuidanceLoading(false)
    }
  }

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Get search type indicator
  const getSearchTypeIndicator = (searchType) => {
    switch (searchType) {
      case 'vector':
        return { icon: <FiCheckCircle className="w-3 h-3" />, color: 'text-green-600', label: 'AI Match' }
      case 'text':
        return { icon: <FiBookOpen className="w-3 h-3" />, color: 'text-blue-600', label: 'Text Match' }
      case 'hybrid':
        return { icon: <FiRefreshCw className="w-3 h-3" />, color: 'text-purple-600', label: 'Hybrid Match' }
      default:
        return { icon: <FiBookOpen className="w-3 h-3" />, color: 'text-gray-600', label: 'Match' }
    }
  }

  return (
    <div style={{ width: '30%', minWidth: '280px' }}>
      <Card className="bg-white shadow-sm h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-gray-900 flex items-center">
                <FiBookOpen className="w-4 h-4 mr-1 text-green-500" />
                {playbooks.length > 1 ? 'Top Matches' : 'Best Match'}
              </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 text-xs"
                onClick={handleRegenerateBasedOnPlaybooks}
                disabled={guidanceLoading || selectedPlaybooks.size === 0}
              >
                {guidanceLoading ? '...' : 'Regenerate'}
              </Button>
            </div>
          </div>
          {playbooks.length > 0 && (
            <p className="text-xs text-gray-500 flex items-center">
              <FiBookOpen className="w-3 h-3 mr-1" />
              ID: {playbooks[0]?.playbook_id}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
          {loading ? (
            // Skeleton loader
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="p-2 bg-gray-50 rounded border">
                <div className="flex items-start justify-between mb-1">
                  <div className="flex-1">
                    <Skeleton className="h-3 w-3/4 mb-1" />
                    <Skeleton className="h-2 w-full mb-1" />
                    <Skeleton className="h-2 w-2/3" />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Skeleton className="h-4 w-12" />
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  <Skeleton className="h-2 w-12" />
                  <Skeleton className="h-2 w-16" />
                </div>
              </div>
            ))
          ) : error ? (
            // Error state
            <div className="p-2 bg-red-50 border border-red-200 rounded">
              <div className="flex items-center mb-1">
                <FiAlertCircle className="w-3 h-3 text-red-600 mr-1" />
                <span className="text-xs font-medium text-red-800">Error</span>
              </div>
              <p className="text-xs text-red-700">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="mt-1 text-red-700 border-red-300 hover:bg-red-100 text-xs px-2 py-1"
              >
                Retry
              </Button>
            </div>
          ) : playbooks.length === 0 ? (
            // No results state
            <div className="p-2 bg-gray-50 border rounded text-center">
              <FiBookOpen className="w-6 h-6 text-gray-400 mx-auto mb-1" />
              <p className="text-xs text-gray-600 mb-1">No matches found</p>
              <p className="text-xs text-gray-500">
                Add more details
              </p>
            </div>
          ) : (
            // Playbook results
            playbooks.map((playbook, index) => {
              console.log(`🎨 Rendering playbook ${index}:`, playbook)
              const searchTypeInfo = getSearchTypeIndicator(playbook.search_type)

              return (
                <div
                  key={playbook.playbook_id || playbook._id || index}
                  className="p-2 bg-gray-50 rounded border hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <Checkbox
                        checked={selectedPlaybooks.has(playbook.playbook_id || playbook._id)}
                        onCheckedChange={(checked) =>
                          handlePlaybookSelection(playbook.playbook_id || playbook._id, checked)
                        }
                        className="mt-0.5 w-3 h-3"
                      />
                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => handlePlaybookClick(playbook)}
                      >
                        <h4 className="text-xs font-medium text-gray-900 mb-0.5 line-clamp-2">
                          {playbook.title}
                        </h4>
                        <p className="text-xs text-gray-600 mb-0.5 line-clamp-1">
                          {playbook.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-0.5 ml-1">
                      {playbook.match_percentage && (
                        <Badge className="bg-green-100 text-green-800 font-bold text-xs px-1 py-0">
                          {playbook.match_percentage}%
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs ml-5">
                    <span className={searchTypeInfo.color}>
                      {searchTypeInfo.icon}
                    </span>
                    <span className="text-gray-500">{searchTypeInfo.label}</span>
                    {playbook.match_percentage && (
                      <span className="text-green-600 font-semibold">
                        • {playbook.match_percentage}%
                      </span>
                    )}
                  </div>

                  {/* Tags */}
                  {playbook.tags && playbook.tags.length > 0 && (
                    <div className="flex flex-wrap gap-0.5 ml-5 mt-1">
                      {playbook.tags.slice(0, 2).map((tag, tagIndex) => (
                        <Badge
                          key={tagIndex}
                          variant="secondary"
                          className="text-xs bg-blue-100 text-blue-800 px-1 py-0"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {playbook.tags.length > 2 && (
                        <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600 px-1 py-0">
                          +{playbook.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Steps preview */}
                  {playbook.steps && playbook.steps.length > 0 && (
                    <div className="mt-1 text-xs text-gray-500 ml-5">
                      <span className="font-medium">{playbook.steps.length}</span> step{playbook.steps.length !== 1 ? 's' : ''}
                    </div>
                  )}

                </div>
              )
            })
          )}


        </CardContent>

        {/* Playbook Detail Modal */}
        <PlaybookDetailModal
          playbook={selectedPlaybook}
          isOpen={showPlaybookModal}
          onClose={handleCloseModal}
        />
      </Card>
    </div>
  )
}

export default PlaybookRecommender
