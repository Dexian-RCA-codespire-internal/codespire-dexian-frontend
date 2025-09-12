import React, { useState, useEffect, useRef } from 'react'
import { 
  AiOutlineSearch, 
  AiOutlinePlus, 
  AiOutlineEye, 
  AiOutlineEdit, 
  AiOutlineMore,
  AiOutlineFilter,
  AiOutlineArrowUp,
  AiOutlineArrowDown
} from 'react-icons/ai'
import ChatBot from '../components/ChatBot'
import { isChatbotEnabled } from '../config/navigation'

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

  // Sample playbook data with new format
  const playbooks = [
    {
      id: 1,
      title: "Restart Database Cluster",
      tags: ["Database", "Automation"],
      usage: "24 tickets resolved",
      confidence: "90%"
    },
    {
      id: 2,
      title: "Network Connectivity Troubleshooting",
      tags: ["Network", "Infrastructure"],
      usage: "18 tickets resolved",
      confidence: "85%"
    },
    {
      id: 3,
      title: "Security Incident Response",
      tags: ["Security", "Incident"],
      usage: "12 tickets resolved",
      confidence: "95%"
    },
    {
      id: 4,
      title: "API Integration Debugging",
      tags: ["API", "Integration"],
      usage: "31 tickets resolved",
      confidence: "88%"
    },
    {
      id: 5,
      title: "Server Performance Optimization",
      tags: ["Performance", "Server"],
      usage: "22 tickets resolved",
      confidence: "82%"
    },
    {
      id: 6,
      title: "Authentication System Reset",
      tags: ["Authentication", "Security"],
      usage: "15 tickets resolved",
      confidence: "92%"
    },
    {
      id: 7,
      title: "Database Backup Recovery",
      tags: ["Database", "Backup"],
      usage: "8 tickets resolved",
      confidence: "96%"
    },
    {
      id: 8,
      title: "Load Balancer Configuration",
      tags: ["Infrastructure", "Network"],
      usage: "19 tickets resolved",
      confidence: "87%"
    },
    {
      id: 9,
      title: "SSL Certificate Renewal",
      tags: ["Security", "Certificate"],
      usage: "13 tickets resolved",
      confidence: "94%"
    },
    {
      id: 10,
      title: "Cache System Flush",
      tags: ["Performance", "Cache"],
      usage: "27 tickets resolved",
      confidence: "89%"
    },
    {
      id: 11,
      title: "User Account Lockout Resolution",
      tags: ["Authentication", "User Management"],
      usage: "35 tickets resolved",
      confidence: "91%"
    },
    {
      id: 12,
      title: "Database Connection Pool Reset",
      tags: ["Database", "Connection"],
      usage: "16 tickets resolved",
      confidence: "86%"
    },
    {
      id: 13,
      title: "Firewall Rule Update",
      tags: ["Security", "Network"],
      usage: "11 tickets resolved",
      confidence: "93%"
    },
    {
      id: 14,
      title: "Application Service Restart",
      tags: ["Application", "Service"],
      usage: "29 tickets resolved",
      confidence: "84%"
    },
    {
      id: 15,
      title: "Disk Space Cleanup",
      tags: ["Storage", "Maintenance"],
      usage: "42 tickets resolved",
      confidence: "88%"
    },
    {
      id: 16,
      title: "DNS Resolution Fix",
      tags: ["Network", "DNS"],
      usage: "14 tickets resolved",
      confidence: "90%"
    },
    {
      id: 17,
      title: "Database Index Rebuild",
      tags: ["Database", "Performance"],
      usage: "7 tickets resolved",
      confidence: "97%"
    },
    {
      id: 18,
      title: "VPN Connection Troubleshooting",
      tags: ["Network", "VPN"],
      usage: "21 tickets resolved",
      confidence: "83%"
    },
    {
      id: 19,
      title: "Email Service Configuration",
      tags: ["Email", "Configuration"],
      usage: "17 tickets resolved",
      confidence: "85%"
    },
    {
      id: 20,
      title: "Memory Leak Investigation",
      tags: ["Performance", "Memory"],
      usage: "9 tickets resolved",
      confidence: "92%"
    },
    {
      id: 21,
      title: "Database Schema Migration",
      tags: ["Database", "Migration"],
      usage: "5 tickets resolved",
      confidence: "98%"
    },
    {
      id: 22,
      title: "Web Server Configuration",
      tags: ["Web Server", "Configuration"],
      usage: "25 tickets resolved",
      confidence: "87%"
    },
    {
      id: 23,
      title: "File System Permission Fix",
      tags: ["File System", "Permissions"],
      usage: "33 tickets resolved",
      confidence: "89%"
    },
    {
      id: 24,
      title: "API Rate Limit Adjustment",
      tags: ["API", "Rate Limiting"],
      usage: "20 tickets resolved",
      confidence: "86%"
    },
    {
      id: 25,
      title: "Database Query Optimization",
      tags: ["Database", "Query"],
      usage: "12 tickets resolved",
      confidence: "94%"
    },
    {
      id: 26,
      title: "Network Port Configuration",
      tags: ["Network", "Ports"],
      usage: "18 tickets resolved",
      confidence: "91%"
    },
    {
      id: 27,
      title: "Application Log Analysis",
      tags: ["Logging", "Analysis"],
      usage: "26 tickets resolved",
      confidence: "88%"
    },
    {
      id: 28,
      title: "Database Replication Setup",
      tags: ["Database", "Replication"],
      usage: "6 tickets resolved",
      confidence: "95%"
    },
    {
      id: 29,
      title: "Service Dependency Resolution",
      tags: ["Service", "Dependencies"],
      usage: "23 tickets resolved",
      confidence: "84%"
    },
    {
      id: 30,
      title: "System Resource Monitoring",
      tags: ["Monitoring", "Resources"],
      usage: "38 tickets resolved",
      confidence: "90%"
    }
  ]

  // Get all unique tags for filter options
  const allTags = [...new Set(playbooks.flatMap(playbook => playbook.tags))]

  const filteredPlaybooks = playbooks.filter(playbook => {
    const matchesSearch = playbook.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         playbook.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.some(tag => playbook.tags.includes(tag))
    
    const confidence = parseInt(playbook.confidence.replace('%', ''))
    const matchesConfidence = confidence >= confidenceRange[0] && confidence <= confidenceRange[1]

    return matchesSearch && matchesTags && matchesConfidence
  })

  // Sort playbooks
  const sortedPlaybooks = [...filteredPlaybooks].sort((a, b) => {
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

  // Pagination
  const totalPages = Math.ceil(sortedPlaybooks.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedPlaybooks = sortedPlaybooks.slice(startIndex, endIndex)

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

  const handleEdit = (playbookId) => {
    console.log('Edit playbook:', playbookId)
    setActiveMenu(null)
  }

  const handleView = (playbookId) => {
    console.log('View playbook:', playbookId)
    setActiveMenu(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      {/* Outer Layout Container */}
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 px-6 py-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                <AiOutlineSearch className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Playbook Templates
                </h1>
                <p className="text-gray-600 mt-1">Discover and manage your incident response playbooks</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Enhanced Search Bar */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <div className="relative">
                  <AiOutlineSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-blue-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search playbooks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300"
                />
                </div>
              </div>
              {/* Enhanced Filter Toggle Button */}
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-5 py-3 rounded-xl transition-all duration-300 font-medium ${
                  showFilters 
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-200 shadow-md' 
                    : 'bg-white/80 text-gray-700 border border-gray-200 hover:bg-blue-50 hover:border-blue-200 shadow-sm hover:shadow-md'
                }`}
              >
                <AiOutlineFilter className="w-4 h-4" />
                <span>Filters</span>
                {selectedTags.length > 0 && (
                  <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    {selectedTags.length}
                  </span>
                )}
              </button>
              {/* Enhanced New Button */}
              <button className="group flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-semibold text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                <AiOutlinePlus className="text-lg group-hover:rotate-90 transition-transform duration-300" />
                <span>New Playbook</span>
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Filter Section */}
        {showFilters && (
          <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200/50 px-6 py-6 shadow-sm animate-in slide-in-from-top duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                  <AiOutlineFilter className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Filter Options</h2>
              </div>
              <button
                onClick={clearFilters}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                <span>Clear all filters</span>
              </button>
            </div>
            
            {/* Enhanced Tags Filter Grid */}
            <div className="mb-8">
              <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>Tags</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {allTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag)
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-4 py-2 text-sm rounded-xl border-2 transition-all duration-200 transform hover:scale-105 ${
                        isSelected
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-transparent shadow-lg'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50 shadow-sm hover:shadow-md'
                      }`}
                    >
                      {tag}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Enhanced Confidence Range Filter */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Confidence Range: {confidenceRange[0]}% - {confidenceRange[1]}%</span>
              </h3>
              <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={confidenceRange[0]}
                  onChange={(e) => setConfidenceRange([parseInt(e.target.value), confidenceRange[1]])}
                    className="flex-1 h-3 bg-gradient-to-r from-red-200 to-green-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={confidenceRange[1]}
                  onChange={(e) => setConfidenceRange([confidenceRange[0], parseInt(e.target.value)])}
                    className="flex-1 h-3 bg-gradient-to-r from-red-200 to-green-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span>0%</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>100%</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Enhanced Results Count */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                <span>Showing <span className="font-semibold text-indigo-600">{sortedPlaybooks.length}</span> of <span className="font-semibold text-gray-900">{playbooks.length}</span> playbooks</span>
              </div>
              {selectedTags.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">Active filters:</span>
                  <div className="flex space-x-1">
                    {selectedTags.slice(0, 3).map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                    {selectedTags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{selectedTags.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Enhanced Playbook Table */}
        <div className="p-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/50 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200/50">
                <thead className="bg-gradient-to-r from-gray-50 to-blue-50/30">
                  <tr>
                    <th 
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-blue-100/50 transition-all duration-200 group"
                      onClick={() => handleSort('title')}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="group-hover:text-blue-600 transition-colors">Playbook Title</span>
                        {sortField === 'title' && (
                          <div className="flex items-center space-x-1">
                            {sortDirection === 'asc' ? 
                              <AiOutlineArrowUp className="w-3 h-3 text-blue-600" /> : 
                              <AiOutlineArrowDown className="w-3 h-3 text-blue-600" />
                            }
                          </div>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      <div className="flex items-center space-x-2">
                        <span>Tags</span>
                        <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                      </div>
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-blue-100/50 transition-all duration-200 group"
                      onClick={() => handleSort('usage')}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="group-hover:text-blue-600 transition-colors">Usage</span>
                        {sortField === 'usage' && (
                          <div className="flex items-center space-x-1">
                            {sortDirection === 'asc' ? 
                              <AiOutlineArrowUp className="w-3 h-3 text-blue-600" /> : 
                              <AiOutlineArrowDown className="w-3 h-3 text-blue-600" />
                            }
                          </div>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-blue-100/50 transition-all duration-200 group"
                      onClick={() => handleSort('confidence')}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="group-hover:text-blue-600 transition-colors">Confidence</span>
                        {sortField === 'confidence' && (
                          <div className="flex items-center space-x-1">
                            {sortDirection === 'asc' ? 
                              <AiOutlineArrowUp className="w-3 h-3 text-blue-600" /> : 
                              <AiOutlineArrowDown className="w-3 h-3 text-blue-600" />
                            }
                          </div>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      <div className="flex items-center justify-end space-x-2">
                        <span>Actions</span>
                        <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/50 divide-y divide-gray-200/30">
                  {paginatedPlaybooks.map((playbook, index) => (
                    <tr 
                      key={playbook.id} 
                      className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/30 transition-all duration-300 group"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                    {playbook.title}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-2">
                          {playbook.tags.map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200/50 hover:from-blue-200 hover:to-indigo-200 transition-all duration-200 transform hover:scale-105"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                          <div className="text-sm font-medium text-gray-900">
                            {playbook.usage}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="flex-1 bg-gray-200/50 rounded-full h-3 overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500 ease-out" 
                              style={{ width: playbook.confidence }}
                            ></div>
                          </div>
                          <span className="text-sm font-bold text-gray-900 min-w-[3rem]">
                            {playbook.confidence}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                  <div className="relative" ref={menuRef}>
                    <button
                      onClick={() => toggleMenu(playbook.id)}
                            className="p-2 hover:bg-gradient-to-r hover:from-gray-100 hover:to-blue-50 rounded-xl transition-all duration-200 group/btn"
                    >
                            <AiOutlineMore className="text-gray-600 group-hover/btn:text-blue-600 transition-colors" />
                    </button>
                    
                          {/* Enhanced Dropdown Menu */}
                    {activeMenu === playbook.id && (
                            <div className="absolute right-0 top-10 bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-xl shadow-xl z-10 min-w-[140px] overflow-hidden animate-in slide-in-from-top duration-200">
                        <button
                          onClick={() => handleView(playbook.id)}
                                className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200"
                        >
                                <AiOutlineEye className="w-4 h-4" />
                                <span>View Details</span>
                        </button>
                        <button
                          onClick={() => handleEdit(playbook.id)}
                                className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-200"
                        >
                                <AiOutlineEdit className="w-4 h-4" />
                                <span>Edit Playbook</span>
                        </button>
                      </div>
                    )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredPlaybooks.length === 0 && (
              <div className="text-center py-16">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-full blur-3xl"></div>
                  <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <AiOutlineSearch className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">No playbooks found</h3>
                    <p className="text-gray-600 mb-6">Try adjusting your search criteria or filters</p>
                    <button
                      onClick={clearFilters}
                      className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <span>Clear Filters</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
                </div>

          {/* Enhanced Pagination */}
          {totalPages > 1 && (
            <div className="bg-white/90 backdrop-blur-sm px-6 py-4 flex items-center justify-between border-t border-gray-200/50 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse"></div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-semibold text-blue-600">{startIndex + 1}</span> to{' '}
                    <span className="font-semibold text-blue-600">{Math.min(endIndex, sortedPlaybooks.length)}</span> of{' '}
                    <span className="font-semibold text-gray-900">{sortedPlaybooks.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-xl shadow-lg -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-3 py-2 rounded-l-xl border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-all duration-200 ${
                          page === currentPage
                            ? 'z-10 bg-gradient-to-r from-blue-500 to-indigo-500 border-transparent text-white shadow-lg'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-3 py-2 rounded-r-xl border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ChatBot - Only render if enabled in config */}
        {isChatbotEnabled() && (
          <ChatBot 
            pageContext={{
              pageName: 'Playbook Recommender',
              totalPlaybooks: playbooks.length,
              filteredPlaybooks: filteredPlaybooks.length,
              selectedTags: selectedTags,
              searchTerm: searchTerm
            }}
          />
        )}
      </div>
    </div>
  )
}

export default PlaybookRecommender
