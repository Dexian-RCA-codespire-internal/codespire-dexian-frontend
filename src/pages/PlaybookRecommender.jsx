import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Checkbox } from '../components/ui/checkbox'
import { Textarea } from '../components/ui/Textarea'
import { Select } from '../components/ui/select'
import { playbookService } from '../api/services/playbookService'
import { FiSearch, FiPlus, FiEye, FiEdit, FiMoreHorizontal, FiFilter, FiChevronUp, FiChevronDown, FiChevronLeft, FiChevronRight, FiX, FiTrash2 } from 'react-icons/fi'

// Function to calculate confidence based on tickets resolved
const calculateConfidence = (usageString) => {
  const ticketsMatch = usageString.match(/(\d+)\s+tickets?\s+resolved/)
  if (!ticketsMatch) return 0
  
  const ticketsResolved = parseInt(ticketsMatch[1])
  
  // If 0 tickets resolved, confidence is 0%
  if (ticketsResolved === 0) return 0
  
  // For 1+ tickets, use a formula that gives reasonable confidence
  // This gives 50% for 1 ticket, 75% for 5 tickets, 90% for 20+ tickets
  const confidence = Math.min(50 + (ticketsResolved * 2), 95)
  return Math.round(confidence)
}

const PlaybookRecommender = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeMenu, setActiveMenu] = useState(null)
  const [selectedTags, setSelectedTags] = useState([])
  const [confidenceRange, setConfidenceRange] = useState([0, 100])
  const [showFilters, setShowFilters] = useState(false)
  const [sortField, setSortField] = useState('title')
  const [sortDirection, setSortDirection] = useState('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [showNewPlaybookModal, setShowNewPlaybookModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedPlaybook, setSelectedPlaybook] = useState(null)
  const [savedPlaybooks, setSavedPlaybooks] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [backendStatus, setBackendStatus] = useState('connecting')
  const [newPlaybook, setNewPlaybook] = useState({
    playbook_id: '',
    title: '',
    description: '',
    priority: 'Medium',
    steps: [
      {
        step_id: 1,
        title: '',
        action: '',
        expected_outcome: '',
        resources: ['']
      }
    ],
    outcome: ''
  })
  const menuRef = useRef(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenu(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])


  // Empty array - no sample data, only use saved playbooks from backend
  const samplePlaybooks = []

  // Use only saved playbooks from backend
  const playbooks = useMemo(() => {
    return savedPlaybooks
  }, [savedPlaybooks])

  // Load playbooks from backend on component mount
  useEffect(() => {
    loadPlaybooks()
  }, [])

  // Get all unique tags for filter options
  const allTags = useMemo(() => {
    return [...new Set(playbooks.flatMap(playbook => playbook.tags))]
  }, [playbooks])

  const filteredPlaybooks = useMemo(() => {
    return playbooks.filter(playbook => {
      const matchesSearch = playbook.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           playbook.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesTags = selectedTags.length === 0 || 
                         selectedTags.some(tag => playbook.tags.includes(tag))
      
      const confidence = parseInt(playbook.confidence.replace('%', ''))
      const matchesConfidence = confidence >= confidenceRange[0] && confidence <= confidenceRange[1]

      return matchesSearch && matchesTags && matchesConfidence
    })
  }, [playbooks, searchTerm, selectedTags, confidenceRange])

  // Sort playbooks
  const sortedPlaybooks = useMemo(() => {
    return [...filteredPlaybooks].sort((a, b) => {
      let aValue, bValue
      
      switch (sortField) {
        case 'title':
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        case 'usage':
          aValue = parseInt(a.usage.split(' ')[0])
          bValue = parseInt(b.usage.split(' ')[0])
          break
        case 'confidence':
          aValue = parseInt(a.confidence.replace('%', ''))
          bValue = parseInt(b.confidence.replace('%', ''))
          break
        default:
          aValue = a[sortField]
          bValue = b[sortField]
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [filteredPlaybooks, sortField, sortDirection])

  // Pagination
  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(sortedPlaybooks.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedPlaybooks = sortedPlaybooks.slice(startIndex, endIndex)
    return { totalPages, startIndex, endIndex, paginatedPlaybooks }
  }, [sortedPlaybooks, itemsPerPage, currentPage])
  
  const { totalPages, startIndex, endIndex, paginatedPlaybooks } = paginationData

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const clearFilters = () => {
    setSelectedTags([])
    setConfidenceRange([0, 100])
    setSearchTerm('')
    setCurrentPage(1)
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
    setCurrentPage(1)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const toggleMenu = (playbookId) => {
    setActiveMenu(activeMenu === playbookId ? null : playbookId)
  }

  const handleEdit = async (playbookId) => {
    try {
      // Fetch the latest data from the database
      console.log('🔍 Fetching playbook for edit:', playbookId)
      const response = await playbookService.getPlaybookById(playbookId)
      const playbook = response.data || response
      console.log('✅ Playbook loaded for edit:', playbook.title)
      
      setSelectedPlaybook(playbook)
      setNewPlaybook({
        playbook_id: playbook.playbook_id || '',
        title: playbook.title,
        description: playbook.description || '',
        priority: playbook.priority || 'Medium',
        steps: Array.isArray(playbook.steps) && playbook.steps.length > 0 
          ? playbook.steps 
          : [
              {
                step_id: 1,
                title: '',
                action: '',
                expected_outcome: '',
                resources: ['']
              }
            ],
        outcome: playbook.outcome || ''
      })
      setShowEditModal(true)
    } catch (error) {
      console.error('Error fetching playbook for edit:', error)
      // Fallback to local data if API fails
      const playbook = playbooks.find(p => (p.id === playbookId) || (p._id === playbookId))
      if (playbook) {
        setSelectedPlaybook(playbook)
        setNewPlaybook({
          playbook_id: playbook.playbook_id || '',
          title: playbook.title,
          description: playbook.description || '',
          priority: playbook.priority || 'Medium',
          steps: Array.isArray(playbook.steps) && playbook.steps.length > 0 
            ? playbook.steps 
            : [
                {
                  step_id: 1,
                  title: '',
                  action: '',
                  expected_outcome: '',
                  resources: ['']
                }
              ],
          outcome: playbook.outcome || ''
        })
        setShowEditModal(true)
      }
    }
    setActiveMenu(null)
  }

  const handleView = async (playbookId) => {
    try {
      // Fetch the latest data from the database
      console.log('👁️ Fetching playbook for view:', playbookId)
      const response = await playbookService.getPlaybookById(playbookId)
      const playbook = response.data || response
      console.log('✅ Playbook loaded for view:', playbook.title)
      
      setSelectedPlaybook(playbook)
      setShowViewModal(true)
    } catch (error) {
      console.error('Error fetching playbook for view:', error)
      // Fallback to local data if API fails
      const playbook = playbooks.find(p => (p.id === playbookId) || (p._id === playbookId))
      if (playbook) {
        setSelectedPlaybook(playbook)
        setShowViewModal(true)
      }
    }
    setActiveMenu(null)
  }

  // Form handlers
  // Load playbooks from backend
  const loadPlaybooks = async () => {
    try {
      setIsLoading(true)
      setError(null)
      console.log('🔄 Loading playbooks from backend...')
      const response = await playbookService.getPlaybooks()
      
      // Update confidence for loaded playbooks based on usage
      const updatedPlaybooks = (response.data || []).map(playbook => ({
        ...playbook,
        confidence: `${calculateConfidence(playbook.usage || "0 tickets resolved")}%`
      }))
      
      console.log(`✅ Backend connected! Loaded ${updatedPlaybooks.length} playbooks`)
      setSavedPlaybooks(updatedPlaybooks)
      setBackendStatus('connected')
    } catch (error) {
      console.error('❌ Backend connection failed:', error.message)
      setError('Failed to load playbooks from server')
      setBackendStatus('disconnected')
      // Keep existing saved playbooks if API fails
    } finally {
      setIsLoading(false)
    }
  }

  // Generate automatic playbook ID
  const generatePlaybookId = () => {
    const timestamp = Date.now().toString().slice(-6) // Last 6 digits of timestamp
    const random = Math.random().toString(36).substring(2, 5).toUpperCase() // 3 random chars
    return `PB-${timestamp}-${random}`
  }

  const handleNewPlaybook = () => {
    // Generate automatic playbook ID
    const autoId = generatePlaybookId()
    setNewPlaybook(prev => ({
      ...prev,
      playbook_id: autoId
    }))
    setShowNewPlaybookModal(true)
  }

  const handleCloseModal = () => {
    setShowNewPlaybookModal(false)
    setNewPlaybook({
      playbook_id: '',
      title: '',
      description: '',
      priority: 'Medium',
      steps: [
        {
          step_id: 1,
          title: '',
          action: '',
          expected_outcome: '',
          resources: ['']
        }
      ],
      outcome: ''
    })
  }

  const handleInputChange = (field, value) => {
    setNewPlaybook(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleStepChange = (stepIndex, field, value) => {
    setNewPlaybook(prev => ({
      ...prev,
      steps: prev.steps.map((step, index) => 
        index === stepIndex ? { ...step, [field]: value } : step
      )
    }))
  }

  const handleResourceChange = (stepIndex, resourceIndex, value) => {
    setNewPlaybook(prev => ({
      ...prev,
      steps: prev.steps.map((step, index) => 
        index === stepIndex 
          ? { 
              ...step, 
              resources: step.resources.map((resource, resIndex) => 
                resIndex === resourceIndex ? value : resource
              )
            } 
          : step
      )
    }))
  }

  const addStep = () => {
    setNewPlaybook(prev => ({
      ...prev,
      steps: [
        ...prev.steps,
        {
          step_id: prev.steps.length + 1,
          title: '',
          action: '',
          expected_outcome: '',
          resources: ['']
        }
      ]
    }))
  }

  const removeStep = (stepIndex) => {
    if (newPlaybook.steps.length > 1) {
      setNewPlaybook(prev => ({
        ...prev,
        steps: prev.steps.filter((_, index) => index !== stepIndex)
      }))
    }
  }

  const addResource = (stepIndex) => {
    setNewPlaybook(prev => ({
      ...prev,
      steps: prev.steps.map((step, index) => 
        index === stepIndex 
          ? { ...step, resources: [...step.resources, ''] }
          : step
      )
    }))
  }

  const removeResource = (stepIndex, resourceIndex) => {
    setNewPlaybook(prev => ({
      ...prev,
      steps: prev.steps.map((step, index) => 
        index === stepIndex 
          ? { 
              ...step, 
              resources: step.resources.filter((_, resIndex) => resIndex !== resourceIndex)
            }
          : step
      )
    }))
  }

  const handleSavePlaybook = async () => {
    // Validate required fields
    if (!newPlaybook.title || !newPlaybook.description) {
      alert('Please fill in all required fields (Title, Description)')
      return
    }

    // Validate steps
    const hasEmptySteps = newPlaybook.steps.some(step => 
      !step.title || !step.action || !step.expected_outcome
    )
    
    if (hasEmptySteps) {
      alert('Please fill in all step details (Title, Action, Expected Outcome)')
      return
    }
    
    // Ensure steps array is properly formatted
    const formattedSteps = newPlaybook.steps.map((step, index) => ({
      step_id: step.step_id || (index + 1),
      title: step.title || '',
      action: step.action || '',
      expected_outcome: step.expected_outcome || '',
      resources: Array.isArray(step.resources) ? step.resources : ['']
    }))
    

    // Create new playbook object
    const usageString = "0 tickets resolved"
    const confidence = calculateConfidence(usageString)
    
    const playbookToSave = {
      title: newPlaybook.title,
      tags: ["Custom"], // Default tag for user-created playbooks
      usage: usageString,
      confidence: `${confidence}%`,
      playbook_id: newPlaybook.playbook_id,
      description: newPlaybook.description,
      priority: newPlaybook.priority,
      steps: formattedSteps,
      outcome: newPlaybook.outcome
    }
    

    try {
      setIsLoading(true)
      setError(null)

      if (showEditModal && selectedPlaybook) {
        // Update existing playbook
        console.log('💾 Updating playbook:', playbookToSave.title)
        const playbookId = selectedPlaybook._id || selectedPlaybook.id
        console.log('🔍 Using playbook ID:', playbookId)
        const response = await playbookService.updatePlaybook(playbookId, playbookToSave)
        setSavedPlaybooks(prev => 
          prev.map(p => (p._id || p.id) === playbookId ? response.data : p)
        )
        console.log('✅ Playbook updated successfully!')
        alert('Playbook updated successfully!')
        setShowEditModal(false)
        setSelectedPlaybook(null)
        // Refresh the playbook list to get the latest data
        await loadPlaybooks()
      } else {
        // Create new playbook
        console.log('💾 Creating new playbook:', playbookToSave.title)
        const response = await playbookService.createPlaybook(playbookToSave)
        setSavedPlaybooks(prev => [...prev, response.data])
        console.log('✅ Playbook created successfully!')
        alert('Playbook saved successfully!')
        setShowNewPlaybookModal(false)
        // Refresh the playbook list to get the latest data
        await loadPlaybooks()
      }

      // Reset form after successful save
      setNewPlaybook({
        playbook_id: '',
        title: '',
        description: '',
        priority: 'Medium',
        steps: [
          {
            step_id: 1,
            title: '',
            action: '',
            expected_outcome: '',
            resources: ['']
          }
        ],
        outcome: ''
      })
    } catch (error) {
      console.error('Error saving playbook:', error)
      setError('Failed to save playbook. Please try again.')
      alert('Failed to save playbook. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearForm = () => {
    // Generate new playbook ID when clearing form
    const autoId = generatePlaybookId()
    setNewPlaybook({
      playbook_id: autoId,
      title: '',
      description: '',
      priority: 'Medium',
      steps: [
        {
          step_id: 1,
          title: '',
          action: '',
          expected_outcome: '',
          resources: ['']
        }
      ],
      outcome: ''
    })
  }


  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-6">
         {/* Page Header */}
         <div className="flex items-center justify-between mb-8">
           <div className="flex items-center gap-3">
             <h1 className="text-3xl font-bold text-gray-900">Playbook Recommender</h1>
             {isLoading && (
               <div className="text-sm text-blue-600">Loading...</div>
             )}
             <div className={`text-xs px-2 py-1 rounded-full ${
               backendStatus === 'connected' ? 'bg-green-100 text-green-800' :
               backendStatus === 'disconnected' ? 'bg-red-100 text-red-800' :
               'bg-yellow-100 text-yellow-800'
             }`}>
               {backendStatus === 'connected' ? '🟢 Backend Connected' :
                backendStatus === 'disconnected' ? '🔴 Backend Disconnected' :
                '🟡 Connecting...'}
             </div>
             {error && (
               <div className="text-sm text-red-600">{error}</div>
             )}
               </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
                onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              Filter
              <FiFilter className="text-sm" />
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleNewPlaybook}
            >
              <FiPlus className="text-sm mr-2" />
              New Playbook
            </Button>
              </div>
            </div>

        {/* Search Bar with Filter Dropdown */}
        <div className="relative mb-6 max-w-full">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Input
                  type="text"
                placeholder="Search playbooks by title, tags, or confidence..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <FiSearch className="text-lg" />
                </div>
              </div>
            <Button 
              variant="outline" 
                onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              Filter
              <FiChevronDown className={`text-sm transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
        </div>

          {/* Filter Dropdown */}
        {showFilters && (
            <Card className="absolute top-full left-0 right-0 mt-2 z-20 bg-white border border-gray-200 shadow-lg">
              <CardContent className="p-6">
                <div className="flex gap-8">
                  {/* Tags Filter */}
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Tags</h3>
                    <div className="space-y-2">
                      {allTags.map((tag) => (
                        <div key={tag} className="flex items-center space-x-2">
                          <Checkbox
                            id={`tag-${tag}`}
                            checked={selectedTags.includes(tag)}
                            onCheckedChange={(checked) => toggleTag(tag)}
                          />
                          <label 
                            htmlFor={`tag-${tag}`} 
                            className="text-sm text-gray-700 cursor-pointer flex-1"
                    >
                      {tag}
                          </label>
                        </div>
                      ))}
              </div>
            </div>

                  {/* Confidence Range Filter */}
                  <div className="w-40">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Confidence Range</h3>
                    <div className="space-y-2">
                      <div>
                        <label htmlFor="min-confidence" className="block text-xs font-medium text-gray-700 mb-1">
                          Min: {confidenceRange[0]}%
                        </label>
                <input
                          id="min-confidence"
                  type="range"
                  min="0"
                  max="100"
                  value={confidenceRange[0]}
                  onChange={(e) => setConfidenceRange([parseInt(e.target.value), confidenceRange[1]])}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                      </div>
                      <div>
                        <label htmlFor="max-confidence" className="block text-xs font-medium text-gray-700 mb-1">
                          Max: {confidenceRange[1]}%
                        </label>
                <input
                          id="max-confidence"
                  type="range"
                  min="0"
                  max="100"
                  value={confidenceRange[1]}
                  onChange={(e) => setConfidenceRange([confidenceRange[0], parseInt(e.target.value)])}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearFilters}
                        className="w-full text-xs h-7"
                      >
                        Clear Filters
                      </Button>
                </div>
              </div>
            </div>
              </CardContent>
            </Card>
          )}
              </div>

        {/* Active Filter Badges */}
        {(selectedTags.length > 0 || confidenceRange[0] > 0 || confidenceRange[1] < 100) && (
          <div className="mb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-600 font-medium">Active filters:</span>
              
              {/* Tag Badges */}
              {selectedTags.map((tag) => (
                <Badge 
                  key={`tag-${tag}`}
                  variant="secondary" 
                  className="bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer"
                  onClick={() => toggleTag(tag)}
                >
                  Tag: {tag}
                  <span className="ml-1 text-green-600">×</span>
                </Badge>
              ))}
              
              {/* Confidence Range Badge */}
              {(confidenceRange[0] > 0 || confidenceRange[1] < 100) && (
                <Badge 
                  variant="secondary" 
                  className="bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer"
                  onClick={() => setConfidenceRange([0, 100])}
                >
                  Confidence: {confidenceRange[0]}% - {confidenceRange[1]}%
                  <span className="ml-1 text-green-600">×</span>
                </Badge>
              )}
              
              {/* Clear All Button */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearFilters}
                className="text-xs h-6 px-2"
              >
                Clear All
              </Button>
                  </div>
                </div>
              )}

        {/* Main Content Area */}
        <div className="mb-6 max-w-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Playbooks
            </h2>
            </div>

          {filteredPlaybooks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <FiSearch className="text-4xl mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No playbooks found</h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your search criteria or filters
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Clear All Filters
              </Button>
            </div>
          ) : (
            <div className="bg-white shadow-sm rounded-lg overflow-hidden relative">
              {/* Desktop Table View */}
              <div className="hidden lg:block relative">
                <table className="w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr className="h-12">
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('title')}
                    >
                        <div className="flex items-center gap-2">
                          <span>Playbook Title</span>
                        {sortField === 'title' && (
                            sortDirection === 'asc' ? 
                              <FiChevronUp className="w-3 h-3" /> : 
                              <FiChevronDown className="w-3 h-3" />
                        )}
                      </div>
                    </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tags
                    </th>
                    <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('usage')}
                    >
                        <div className="flex items-center gap-2">
                          <span>Usage</span>
                        {sortField === 'usage' && (
                            sortDirection === 'asc' ? 
                              <FiChevronUp className="w-3 h-3" /> : 
                              <FiChevronDown className="w-3 h-3" />
                        )}
                      </div>
                    </th>
                    <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('confidence')}
                    >
                        <div className="flex items-center gap-2">
                          <span>Confidence</span>
                        {sortField === 'confidence' && (
                            sortDirection === 'asc' ? 
                              <FiChevronUp className="w-3 h-3" /> : 
                              <FiChevronDown className="w-3 h-3" />
                        )}
                      </div>
                    </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                    </th>
                  </tr>
                </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedPlaybooks.map((playbook, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors h-16">
                        <td className="px-6 py-4 whitespace-nowrap align-middle">
                          <div className="text-sm font-medium text-gray-900">
                    {playbook.title}
                        </div>
                      </td>
                        <td className="px-6 py-4 align-middle">
                          <div className="flex flex-wrap gap-1">
                          {playbook.tags.map((tag, tagIndex) => (
                              <Badge
                              key={tagIndex}
                                className="bg-green-100 text-green-800 border-0 font-medium text-xs"
                            >
                              {tag}
                              </Badge>
                          ))}
                        </div>
                      </td>
                        <td className="px-6 py-4 whitespace-nowrap align-middle">
                          <span className="text-sm font-medium text-gray-900">
                            {playbook.usage}
                          </span>
                      </td>
                        <td className="px-6 py-4 whitespace-nowrap align-middle">
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full" 
                              style={{ width: playbook.confidence }}
                            ></div>
                          </div>
                            <span className="text-sm font-medium text-gray-900 min-w-[3rem]">
                            {playbook.confidence}
                          </span>
                        </div>
                      </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right align-middle">
                          <div className="flex items-center justify-end space-x-2">
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleView(playbook._id || playbook.id)}
                            >
                              View
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                          onClick={() => handleEdit(playbook._id || playbook.id)}
                            >
                              Edit
                            </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

              {/* Mobile Card View */}
              <div className="lg:hidden relative">
                {paginatedPlaybooks.map((playbook, index) => (
                  <div key={index} className="border-b border-gray-200 p-3 last:border-b-0">
                    {/* Header with Title */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0 pr-2">
                        <h3 className="text-sm font-medium text-gray-900 mb-1 break-words">
                          {playbook.title}
                        </h3>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {playbook.tags.map((tag, tagIndex) => (
                            <Badge
                              key={tagIndex}
                              className="bg-green-100 text-green-800 border-0 font-medium text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                    </div>
                        <p className="text-xs text-gray-500 mb-1">
                          {playbook.usage}
                        </p>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: playbook.confidence }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium text-gray-900 min-w-[3rem]">
                            {playbook.confidence}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-center">
                      <div className="flex items-center space-x-2">
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1"
                            onClick={() => handleView(playbook._id || playbook.id)}
                          >
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEdit(playbook._id || playbook.id)}
                          className="text-xs px-3 py-1"
                        >
                          Edit
                        </Button>
                  </div>
                </div>
              </div>
                ))}
                </div>
              </div>
            )}

          {/* Pagination Controls */}
          {filteredPlaybooks.length > 0 && totalPages > 1 && (
            <div className="mt-6">
              {/* Mobile Pagination */}
              <div className="lg:hidden space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm text-gray-700">Show:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => setCurrentPage(1)}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="text-sm text-gray-700">per page</span>
                </div>
                <div className="text-sm text-gray-700 text-center">
                  Showing {startIndex + 1} to {Math.min(endIndex, sortedPlaybooks.length)} of {sortedPlaybooks.length} results
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                    className="flex items-center gap-1"
                >
                    <FiChevronLeft className="w-4 h-4" />
                  Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(totalPages - 2, currentPage - 1)) + i
                      if (pageNum > totalPages) return null
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                    className="flex items-center gap-1"
                >
                  Next
                    <FiChevronRight className="w-4 h-4" />
                  </Button>
              </div>
                </div>

              {/* Desktop Pagination */}
              <div className="hidden lg:flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">Show:</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => setCurrentPage(1)}
                      className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                    <span className="text-sm text-gray-700">per page</span>
                  </div>
                  <div className="text-sm text-gray-700">
                    Showing {startIndex + 1} to {Math.min(endIndex, sortedPlaybooks.length)} of {sortedPlaybooks.length} results
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    className="flex items-center gap-1"
                    >
                    <FiChevronLeft className="w-4 h-4" />
                      Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                      if (pageNum > totalPages) return null
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    className="flex items-center gap-1"
                    >
                      Next
                    <FiChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
        </div>

      {/* New Playbook Modal */}
      {showNewPlaybookModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Create New Playbook</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseModal}
                className="h-8 w-8 p-0"
              >
                <FiX className="h-4 w-4" />
              </Button>
      </div>

            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Playbook ID
                  </label>
                  <Input
                    value={newPlaybook.playbook_id}
                    readOnly
                    placeholder="Auto-generated"
                    className="w-full bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={newPlaybook.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <Input
                  value={newPlaybook.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Payment Failure Resolution"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <Textarea
                  value={newPlaybook.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the playbook purpose and scope..."
                  rows={3}
                  className="w-full"
                />
              </div>

              {/* Steps Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Steps</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addStep}
                    className="flex items-center gap-2"
                  >
                    <FiPlus className="h-4 w-4" />
                    Add Step
                  </Button>
                </div>

                <div className="space-y-4">
                  {newPlaybook.steps.map((step, stepIndex) => (
                    <Card key={stepIndex} className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900">Step {stepIndex + 1}</h4>
                        {newPlaybook.steps.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeStep(stepIndex)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Step Title *
                          </label>
                          <Input
                            value={step.title}
                            onChange={(e) => handleStepChange(stepIndex, 'title', e.target.value)}
                            placeholder="e.g., Verify Payment Gateway Logs"
                            className="w-full"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Action *
                          </label>
                          <Textarea
                            value={step.action}
                            onChange={(e) => handleStepChange(stepIndex, 'action', e.target.value)}
                            placeholder="Describe the action to be taken..."
                            rows={2}
                            className="w-full"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Expected Outcome *
                          </label>
                          <Input
                            value={step.expected_outcome}
                            onChange={(e) => handleStepChange(stepIndex, 'expected_outcome', e.target.value)}
                            placeholder="e.g., Identify if the payment failure is related to gateway issues"
                            className="w-full"
                          />
                        </div>

                        {/* Resources */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Resources
                            </label>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => addResource(stepIndex)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <FiPlus className="h-4 w-4 mr-1" />
                              Add Resource
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {step.resources.map((resource, resourceIndex) => (
                              <div key={resourceIndex} className="flex items-center gap-2">
                                <Input
                                  value={resource}
                                  onChange={(e) => handleResourceChange(stepIndex, resourceIndex, e.target.value)}
                                  placeholder="https://example.com/resource"
                                  className="flex-1"
                                />
                                {step.resources.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeResource(stepIndex, resourceIndex)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <FiTrash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Outcome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Final Outcome
                </label>
                <Textarea
                  value={newPlaybook.outcome}
                  onChange={(e) => handleInputChange('outcome', e.target.value)}
                  placeholder="Describe the expected final outcome..."
                  rows={2}
                  className="w-full"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <Button
                variant="outline"
                onClick={handleClearForm}
                className="flex items-center gap-2"
              >
                Clear
              </Button>
              <Button
                variant="outline"
                onClick={handleCloseModal}
                className="flex items-center gap-2"
              >
                Cancel
              </Button>
                <Button
                  onClick={handleSavePlaybook}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : 'Save Playbook'}
                </Button>
            </div>
          </div>
        </div>
      )}

      {/* View Playbook Modal */}
      {showViewModal && selectedPlaybook && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">View Playbook</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowViewModal(false)}
                  className="h-8 w-8 p-0"
                >
                  <FiX className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-6">
                {/* Playbook Form - Same as Edit Modal */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-black mb-4">Playbook Details</h3>
                  
                  <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-black mb-2">
                          Playbook ID
                        </label>
                        <Input
                          value={selectedPlaybook.playbook_id || ''}
                          readOnly
                          className="bg-white text-black"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black mb-2">
                          Priority
                        </label>
                        <Input
                          value={selectedPlaybook.priority || 'Medium'}
                          readOnly
                          className="bg-white text-black"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Title
                      </label>
                      <Input
                        value={selectedPlaybook.title}
                        readOnly
                        className="bg-white text-black"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Description
                      </label>
                      <Textarea
                        value={selectedPlaybook.description || ''}
                        readOnly
                        rows={3}
                        className="bg-white text-black"
                      />
                    </div>

                    {/* Steps Section */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-md font-medium text-black">Resolution Steps</h4>
                      </div>
                      <div className="space-y-4">
                        {selectedPlaybook.steps && selectedPlaybook.steps.length > 0 ? (
                          selectedPlaybook.steps.map((step, stepIndex) => (
                            <Card key={stepIndex} className="p-4 bg-white border-gray-200">
                              <div className="flex items-center justify-between mb-3">
                                <h5 className="font-medium text-black">
                                  Step {stepIndex + 1}: {step.title}
                                </h5>
                              </div>
                              
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-sm font-medium text-black mb-2">
                                    Step Title
                                  </label>
                                  <Input
                                    value={step.title}
                                    readOnly
                                    className="bg-gray-50 text-black"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-black mb-2">
                                    Action
                                  </label>
                                  <Textarea
                                    value={step.action}
                                    readOnly
                                    rows={2}
                                    className="bg-gray-50 text-black"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-black mb-2">
                                    Expected Outcome
                                  </label>
                                  <Textarea
                                    value={step.expected_outcome}
                                    readOnly
                                    rows={2}
                                    className="bg-gray-50 text-black"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-black mb-2">
                                    Resources
                                  </label>
                                  <div className="space-y-2">
                                    {step.resources && step.resources.length > 0 ? (
                                      step.resources.map((resource, resourceIndex) => (
                                        <div key={resourceIndex} className="flex items-center gap-2">
                                          <Input
                                            value={resource}
                                            readOnly
                                            className="bg-gray-50 text-black"
                                          />
                                          <a 
                                            href={resource} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800 underline text-sm"
                                          >
                                            Open
                                          </a>
                                        </div>
                                      ))
                                    ) : (
                                      <div className="text-sm text-gray-500 italic">No resources provided</div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </Card>
                          ))
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            No steps defined for this playbook
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Outcome */}
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Expected Final Outcome
                      </label>
                      <Textarea
                        value={selectedPlaybook.outcome || ''}
                        readOnly
                        rows={3}
                        className="bg-white text-black"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                <Button
                  variant="outline"
                  onClick={() => setShowViewModal(false)}
                  className="flex items-center gap-2"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setShowViewModal(false)
                    handleEdit(selectedPlaybook._id || selectedPlaybook.id)
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                >
                  Edit Playbook
                </Button>
              </div>
            </div>
          </div>
      )}

      {/* Edit Playbook Modal */}
      {showEditModal && selectedPlaybook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Edit Playbook</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEditModal(false)}
                className="h-8 w-8 p-0"
              >
                <FiX className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Playbook ID *
                  </label>
                  <Input
                    value={newPlaybook.playbook_id}
                    onChange={(e) => handleInputChange('playbook_id', e.target.value)}
                    placeholder="e.g., payment-failure-001"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={newPlaybook.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <Input
                  value={newPlaybook.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Payment Failure Resolution"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <Textarea
                  value={newPlaybook.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the playbook purpose and scope..."
                  rows={3}
                  className="w-full"
                />
              </div>

              {/* Steps Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Steps</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addStep}
                    className="flex items-center gap-2"
                  >
                    <FiPlus className="h-4 w-4" />
                    Add Step
                  </Button>
                </div>

                <div className="space-y-4">
                  {newPlaybook.steps.map((step, stepIndex) => (
                    <Card key={stepIndex} className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900">Step {stepIndex + 1}</h4>
                        {newPlaybook.steps.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeStep(stepIndex)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Step Title *
                          </label>
                          <Input
                            value={step.title}
                            onChange={(e) => handleStepChange(stepIndex, 'title', e.target.value)}
                            placeholder="e.g., Verify Payment Gateway Logs"
                            className="w-full"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Action *
                          </label>
                          <Textarea
                            value={step.action}
                            onChange={(e) => handleStepChange(stepIndex, 'action', e.target.value)}
                            placeholder="Describe the action to be taken..."
                            rows={2}
                            className="w-full"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Expected Outcome *
                          </label>
                          <Input
                            value={step.expected_outcome}
                            onChange={(e) => handleStepChange(stepIndex, 'expected_outcome', e.target.value)}
                            placeholder="e.g., Identify if the payment failure is related to gateway issues"
                            className="w-full"
                          />
                        </div>

                        {/* Resources */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Resources
                            </label>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => addResource(stepIndex)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <FiPlus className="h-4 w-4 mr-1" />
                              Add Resource
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {step.resources.map((resource, resourceIndex) => (
                              <div key={resourceIndex} className="flex items-center gap-2">
                                <Input
                                  value={resource}
                                  onChange={(e) => handleResourceChange(stepIndex, resourceIndex, e.target.value)}
                                  placeholder="https://example.com/resource"
                                  className="flex-1"
                                />
                                {step.resources.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeResource(stepIndex, resourceIndex)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <FiTrash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Outcome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Final Outcome
                </label>
                <Textarea
                  value={newPlaybook.outcome}
                  onChange={(e) => handleInputChange('outcome', e.target.value)}
                  placeholder="Describe the expected final outcome..."
                  rows={2}
                  className="w-full"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <Button
                variant="outline"
                onClick={() => setShowEditModal(false)}
                className="flex items-center gap-2"
              >
                Cancel
              </Button>
                <Button
                  onClick={handleSavePlaybook}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? 'Updating...' : 'Update Playbook'}
                </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PlaybookRecommender
