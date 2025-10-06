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
    
    console.log('🔍 Generated AI guidance search query:')
    console.log('📋 Ticket ID:', ticket.ticket_id)
    console.log('📋 Short description:', ticket.short_description)
    console.log('📋 Description:', ticket.description?.substring(0, 200) + '...')
    console.log('📋 Final query:', query)
    console.log('📋 Query length:', query.length)
    console.log('📋 Query parts count:', queryParts.length)
    console.log('🔍 Query for ticket:', ticket.ticket_id, '->', query)
    console.log('🔍 Query hash (first 50 chars):', query.substring(0, 50))
    console.log('🔍 Query hash (last 50 chars):', query.substring(Math.max(0, query.length - 50)))
    
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
          console.log(`      Playbook ID: ${playbook.playbook_id}`)
          console.log(`      Match: ${playbook.match_percentage}%`)
          console.log(`      Description: ${playbook.description?.substring(0, 100)}...`)
          console.log(`      Tags: ${JSON.stringify(playbook.tags)}`)
          console.log(`      Similarity Score: ${playbook.similarity_score}`)
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
      
      console.log(`📊 Updating confidence for specific playbook:`)
      console.log(`   Playbook ID: ${playbookId}`)
      console.log(`   Playbook Title: ${playbook.title}`)
      console.log(`   Current usage: ${currentUsage}`)
      console.log(`   New usage: ${newUsage}`)
      console.log(`   New confidence: ${newConfidence}%`)
      
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
    <Card className="bg-white shadow-sm" key={ticketData?.ticket_id || 'default'}>
      <CardHeader>
        <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <FiBookOpen className="w-5 h-5 mr-2 text-green-500" />
              {playbooks.length > 1 ? 'Top Matching Playbooks' : 'Best Match Playbook'}
            </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1"
              onClick={handleRegenerateBasedOnPlaybooks}
              disabled={guidanceLoading || selectedPlaybooks.size === 0}
            >
              {guidanceLoading ? 'Regenerating...' : 'Regenerate based on Playbook'}
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
      <CardContent className="space-y-3">
        {loading ? (
          // Skeleton loader
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-full mb-1" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          ))
        ) : error ? (
          // Error state
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center mb-2">
              <FiAlertCircle className="w-4 h-4 text-red-600 mr-2" />
              <span className="text-sm font-medium text-red-800">Search Error</span>
            </div>
            <p className="text-sm text-red-700">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="mt-2 text-red-700 border-red-300 hover:bg-red-100"
            >
              Try Again
            </Button>
          </div>
        ) : playbooks.length === 0 ? (
          // No results state
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
            <FiBookOpen className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">No matching playbooks found</p>
            <p className="text-xs text-gray-500">
              Try adding more details to the ticket description
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
                className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <Checkbox
                      checked={selectedPlaybooks.has(playbook.playbook_id || playbook._id)}
                      onCheckedChange={(checked) => 
                        handlePlaybookSelection(playbook.playbook_id || playbook._id, checked)
                      }
                      className="mt-1 bg-white"
                    />
                    <div 
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => handlePlaybookClick(playbook)}
                    >
                      <h4 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                        {playbook.title}
                      </h4>
                      <p className="text-xs text-black mb-1">
                        ID: {playbook.playbook_id}
                      </p>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {playbook.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 ml-2">
                    {playbook.match_percentage && (
                      <Badge className="bg-green-100 text-green-800 font-bold">
                        {playbook.match_percentage}% Match
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs ml-6">
                  <span className={searchTypeInfo.color}>
                    {searchTypeInfo.icon}
                  </span>
                  <span className="text-gray-500">{searchTypeInfo.label}</span>
                  {playbook.match_percentage && (
                    <span className="text-green-600 font-semibold">
                      • {playbook.match_percentage}% match
                    </span>
                  )}
                  {playbook.combined_score && !playbook.match_percentage && (
                    <span className="text-gray-500">
                      • {Math.round(playbook.combined_score * 100)}% match
                    </span>
                  )}
                  {playbook.similarity_score && !playbook.match_percentage && (
                    <span className="text-gray-500">
                      • {Math.round(playbook.similarity_score * 100)}% similarity
                    </span>
                  )}
                </div>
                
                {/* Tags */}
                {playbook.tags && playbook.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 ml-6">
                    {playbook.tags.slice(0, 3).map((tag, tagIndex) => (
                      <Badge 
                        key={tagIndex} 
                        variant="secondary" 
                        className="text-xs bg-blue-100 text-blue-800"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {playbook.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                        +{playbook.tags.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
                
                {/* Steps preview */}
                {playbook.steps && playbook.steps.length > 0 && (
                  <div className="mt-2 text-xs text-gray-500 ml-6">
                    <span className="font-medium">{playbook.steps.length}</span> step{playbook.steps.length !== 1 ? 's' : ''}
                    {playbook.outcome && (
                      <span className="ml-2">• Expected: {playbook.outcome}</span>
                    )}
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
  )
}

export default PlaybookRecommender
