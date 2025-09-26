

// import React, { useState, useEffect } from 'react'
// import { IoIosColorWand, IoMdAdd, IoMdTrash } from "react-icons/io"
// import { BsStars, BsClock, BsExclamationTriangle, BsFileText } from "react-icons/bs"
// import { FiUsers, FiServer, FiDatabase, FiGlobe, FiLoader } from "react-icons/fi"
// import { aiService } from '../../../api/services/aiService'

// const RootCauseAnalysisStep = ({ 
//   ticketData = null, 
//   response = '', 
//   onResponseChange = () => {},
//   isEnhancingRootCause = false,
//   setIsEnhancingRootCause = () => {}
// }) => {
//   // Use ticketData prop or fallback to dummy data
//   const currentTicket = ticketData ? {
//     ...ticketData,
//     // Ensure impact is always an array
//     impact: Array.isArray(ticketData.impact) ? ticketData.impact : 
//             ticketData.impact ? [ticketData.impact] : []
//   } : {
//     category: "Network Infrastructure",
//     description: "Multiple users are reporting intermittent connectivity issues when accessing internal applications hosted in the data center. Latency spikes have been observed during peak hours. Network monitoring tools are showing sporadic packet loss between core switches and distribution layer devices.",
//     short_description: "Intermittent connectivity and latency issues in internal network",
//     enhanced_problem: "The issue appears to be affecting connectivity between core switches and distribution switches in the data center, causing performance degradation for internal apps. Latency and packet loss are correlated with high network traffic times.",
//     impact: ["Service degradation for internal apps", "80% of corporate users impacted during peak hours"],
//     priority: "High",
//     urgency: "Critical",
//     source: "ServiceNow"
//   }

//   // Initial root causes from analysis with concise data
//   const initialRootCauses = [
//     {
//       id: 1,
//       rootCause: "BGP Routing Configuration Error",
//       analysis: "Network infrastructure failure due to misconfigured BGP routing tables deployed during maintenance window on 2025-01-15 at 08:30 UTC. The configuration change introduced asymmetric routing paths causing packet loss between data centers.",
//       confidence: 95,
//       category: "Configuration",
//       severity: "Critical",
//       evidence: [
//         {
//           type: "Log Analysis",
//           finding: "BGP route flapping detected in router logs starting 08:32 UTC",
//           source: "Router-Core-01, Router-Core-02"
//         },
//         {
//           type: "Network Monitoring", 
//           finding: "Packet loss increased from 0.1% to 15.2% on inter-DC links",
//           source: "PRTG Network Monitor"
//         },
//         {
//           type: "Change Correlation",
//           finding: "Network configuration change matches incident timeline",
//           source: "Change Management System"
//         }
//       ]
//     },
//     {
//       id: 2,
//       rootCause: "Database Connection Pool Exhaustion",
//       analysis: "Application database connection pool reached maximum capacity (500 connections) during peak traffic. Connection timeout errors cascaded to dependent services causing widespread service degradation.",
//       confidence: 87,
//       category: "Capacity",
//       severity: "High",
//       evidence: [
//         {
//           type: "Database Metrics",
//           finding: "Connection pool utilization reached 100% at 09:15 UTC",
//           source: "PostgreSQL Monitoring"
//         },
//         {
//           type: "Application Logs",
//           finding: "Connection timeout errors increased by 2400%",
//           source: "App-Server-Pool"
//         }
//       ]
//     },
//     {
//       id: 3,
//       rootCause: "Load Balancer SSL Certificate Expiry",
//       analysis: "Primary load balancer SSL certificate expired at 2025-01-15T06:00:00Z causing HTTPS connection failures. Secondary load balancer took over but insufficient capacity led to performance degradation.",
//       confidence: 78,
//       category: "Security/Configuration",
//       severity: "High",
//       evidence: [
//         {
//           type: "Certificate Monitoring",
//           finding: "SSL certificate expired on primary load balancer",
//           source: "LB-Primary-01"
//         },
//         {
//           type: "Traffic Analysis",
//           finding: "HTTPS connection failures increased from 0.02% to 12.8%",
//           source: "Load Balancer Logs"
//         }
//       ]
//     },
//     {
//       id: 4,
//       rootCause: "Memory Leak in Authentication Service",
//       analysis: "Java heap memory leak in user authentication service causing garbage collection pressure and eventual OutOfMemoryError. Service restarts provided temporary relief but issue persists.",
//       confidence: 65,
//       category: "Code",
//       severity: "Medium",
//       evidence: [
//         {
//           type: "JVM Monitoring",
//           finding: "Heap memory utilization increased linearly over 6 hours",
//           source: "Auth-Service-JVM-Metrics"
//         }
//       ]
//     }
//   ]

//   // Similar tickets data for API request
//   const similarTickets = [
//     {
//       id: "INC-2023-5612",
//       short_description: "Core switch buffer overflows during peak hours",
//       category: "Network Infrastructure",
//       description: "Observed consistent packet loss and increased latency traced to buffer overflows on core switch ports connected to distribution switches. Issue was resolved after adjusting buffer thresholds and upgrading firmware.",
//       priority: "High"
//     },
//     {
//       id: "INC-2024-1489",
//       short_description: "High CPU utilization on distribution switches",
//       category: "Network Infrastructure",
//       description: "Distribution switches showed CPU utilization above 90% during peak usage, leading to delays in routing decisions and intermittent connectivity. Resolved after identifying malformed broadcast traffic causing CPU spikes.",
//       priority: "Medium"
//     },
//     {
//       id: "INC-2024-2277",
//       short_description: "Misconfigured QoS policy impacting internal app performance",
//       category: "Network Infrastructure",
//       description: "QoS misconfiguration led to non-prioritized internal app traffic during congestion. Users experienced slow response times. Fixed by reclassifying traffic and adjusting QoS policy on distribution layer.",
//       priority: "High"
//     }
//   ]

//   const [rootCauses, setRootCauses] = useState([])
//   const [newRootCause, setNewRootCause] = useState({
//     rootCause: "",
//     analysis: "",
//     category: "Configuration",
//     confidence: 50,
//     severity: "Medium"
//   })
//   const [showAddForm, setShowAddForm] = useState(false)
//   const [isAnalyzing, setIsAnalyzing] = useState(false)
//   const [analysisError, setAnalysisError] = useState(null)
//   const [hasAnalyzed, setHasAnalyzed] = useState(false)
//   const [analysisMetadata, setAnalysisMetadata] = useState(null)

//   // Function to analyze root causes using the API
//   const analyzeRootCauses = async () => {
//     if (isAnalyzing || hasAnalyzed) {
//       console.log('Analysis already in progress or completed, skipping...')
//       return
//     }

//     try {
//       setIsAnalyzing(true)
//       setAnalysisError(null)

//       // Ensure all required fields are present and properly formatted
//       const requestData = {
//         currentTicket: {
//           category: currentTicket.category || "Unknown",
//           description: currentTicket.description || currentTicket.short_description || "",
//           short_description: currentTicket.short_description || "",
//           enhanced_problem: currentTicket.enhanced_problem || currentTicket.description || "",
//           impact: Array.isArray(currentTicket.impact) ? currentTicket.impact : 
//                   currentTicket.impact ? [currentTicket.impact] : [],
//           priority: currentTicket.priority || "Medium",
//           urgency: currentTicket.urgency || "Medium"
//         },
//         similarTickets: similarTickets
//       }

//       console.log('Sending RCA analysis request:', requestData)
//       const response = await aiService.rootCauseAnalysis.analyze(requestData)

//       if (response.success && response.results) {
//         // Transform API response to match our UI format
//         const transformedResults = response.results.map((result, index) => ({
//           id: result.id || index + 1,
//           rootCause: result.rootCause,
//           analysis: result.analysis,
//           confidence: result.confidence,
//           category: getCategoryFromRootCause(result.rootCause),
//           severity: getSeverityFromConfidence(result.confidence),
//           evidence: result.evidence || []
//         }))

//         setRootCauses(transformedResults)
//         setHasAnalyzed(true)
        
//         // Store analysis metadata
//         if (response.analysis_metadata) {
//           setAnalysisMetadata(response.analysis_metadata)
//         }
        
//         // Update the response in the parent component
//         if (onResponseChange) {
//           const summaryText = `Root cause analysis completed. Found ${transformedResults.length} potential causes with confidence scores ranging from ${Math.min(...transformedResults.map(r => r.confidence))}% to ${Math.max(...transformedResults.map(r => r.confidence))}%.`
//           onResponseChange(summaryText)
//         }
//       } else {
//         throw new Error(response.message || 'Failed to analyze root causes')
//       }
//     } catch (error) {
//       console.error('Error analyzing root causes:', error)
//       setAnalysisError(error.message || 'Failed to analyze root causes')
//     } finally {
//       setIsAnalyzing(false)
//     }
//   }

//   // Helper function to determine category from root cause
//   const getCategoryFromRootCause = (rootCause) => {
//     const lowerCause = rootCause.toLowerCase()
//     if (lowerCause.includes('configuration') || lowerCause.includes('config')) return 'Configuration'
//     if (lowerCause.includes('capacity') || lowerCause.includes('buffer') || lowerCause.includes('exhaustion')) return 'Capacity'
//     if (lowerCause.includes('network') || lowerCause.includes('routing') || lowerCause.includes('qos')) return 'Infrastructure'
//     if (lowerCause.includes('memory') || lowerCause.includes('leak') || lowerCause.includes('code')) return 'Code'
//     if (lowerCause.includes('security') || lowerCause.includes('certificate') || lowerCause.includes('ssl')) return 'Security/Configuration'
//     return 'Configuration'
//   }

//   // Helper function to determine severity from confidence
//   const getSeverityFromConfidence = (confidence) => {
//     if (confidence >= 90) return 'Critical'
//     if (confidence >= 80) return 'High'
//     if (confidence >= 60) return 'Medium'
//     return 'Low'
//   }

//   // Trigger analysis when component mounts (only once)
//   useEffect(() => {
//     if (currentTicket && !hasAnalyzed && !isAnalyzing) {
//       analyzeRootCauses()
//     }
//   }, []) // Empty dependency array to run only once on mount

//   const addRootCause = () => {
//     if (!newRootCause.rootCause.trim() || !newRootCause.analysis.trim()) {
//       alert('Please fill in both root cause and analysis')
//       return
//     }

//     const newCause = {
//       id: Date.now(),
//       ...newRootCause,
//       evidence: [],
//       createdAt: new Date().toISOString()
//     }

//     setRootCauses([...rootCauses, newCause])
//     setNewRootCause({
//       rootCause: "",
//       analysis: "",
//       category: "Configuration",
//       confidence: 50,
//       severity: "Medium"
//     })
//     setShowAddForm(false)
//   }

//   const deleteRootCause = (id) => {
//     setRootCauses(rootCauses.filter(cause => cause.id !== id))
//   }

//   const getPriorityColor = (priority) => {
//     switch (priority?.toLowerCase()) {
//       case 'critical': return 'text-red-600 bg-red-50 border-red-200'
//       case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
//       case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
//       default: return 'text-gray-600 bg-gray-50 border-gray-200'
//     }
//   }

//   const getConfidenceColor = (confidence) => {
//     const confidenceNum = typeof confidence === 'number' ? confidence : parseInt(confidence) || 0
//     if (confidenceNum >= 80) return 'text-green-700 bg-green-100 border-green-300'
//     if (confidenceNum >= 60) return 'text-yellow-700 bg-yellow-100 border-yellow-300'
//     return 'text-red-700 bg-red-100 border-red-300'
//   }

//   const getSeverityColor = (severity) => {
//     switch (severity?.toLowerCase()) {
//       case 'critical': return 'text-red-700 bg-red-100 border-red-300'
//       case 'high': return 'text-orange-700 bg-orange-100 border-orange-300'
//       case 'medium': return 'text-yellow-700 bg-yellow-100 border-yellow-300'
//       case 'low': return 'text-blue-700 bg-blue-100 border-blue-300'
//       default: return 'text-gray-700 bg-gray-100 border-gray-300'
//     }
//   }

//   const getCategoryIcon = (category) => {
//     switch (category?.toLowerCase()) {
//       case 'database': return <FiDatabase className="w-4 h-4" />
//       case 'network infrastructure': return <FiGlobe className="w-4 h-4" />
//       case 'api gateway': return <FiServer className="w-4 h-4" />
//       default: return <BsFileText className="w-4 h-4" />
//     }
//   }

//   return (
//     <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Main Content */}
//         <div className="lg:col-span-2 space-y-6">
//           {/* Incident Summary - Compact */}
//           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
//              <h1 className="text-lg font-bold text-gray-900">Root Cause Analysis</h1>
//             <div className="flex items-center justify-between mb-3">
//               <div className="flex items-center gap-3">
               
//                 <span className="text-sm text-gray-500">#{currentTicket.source}-2025-001</span>
//                 <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
//                   {currentTicket.category}
//                 </span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <span className={`px-3 py-1 rounded text-sm font-semibold ${getPriorityColor(currentTicket.priority)}`}>
//                   {currentTicket.priority}
//                 </span>
//                 <span className={`px-3 py-1 rounded text-sm font-semibold ${getPriorityColor(currentTicket.urgency)}`}>
//                   {currentTicket.urgency}
//                 </span>
//               </div>
//             </div>
            
//             <h2 className="text-base font-semibold text-gray-800 mb-2">{currentTicket.short_description}</h2>
            
//             <div className="bg-gray-50 p-3 rounded border border-gray-200">
//               <p className="text-sm text-gray-700 leading-relaxed">{currentTicket.enhanced_problem}</p>
//             </div>
//           </div>

         

//           {/* Root Causes Section */}
//           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//             <div className="flex items-center justify-between mb-4">
//               <h2 className="text-lg font-semibold text-gray-900">AI Root Cause Analysis</h2>
//               {!hasAnalyzed && !isAnalyzing && (
//                 <button
//                   onClick={analyzeRootCauses}
//                   className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
//                 >
//                   <BsStars className="w-4 h-4" />
//                   Analyze Root Causes
//                 </button>
//               )}
//             </div>

//             {/* Loading State */}
//             {isAnalyzing && (
//               <div className="flex items-center justify-center py-8">
//                 <div className="flex items-center gap-3">
//                   <FiLoader className="w-5 h-5 animate-spin text-blue-600" />
//                   <span className="text-gray-600">Analyzing root causes...</span>
//                 </div>
//               </div>
//             )}

//             {/* Error State */}
//             {analysisError && (
//               <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
//                 <div className="flex items-center gap-2 mb-2">
//                   <BsExclamationTriangle className="w-4 h-4 text-red-600" />
//                   <span className="text-sm font-medium text-red-800">Analysis Error</span>
//                 </div>
//                 <p className="text-sm text-red-700">{analysisError}</p>
//                 <button
//                   onClick={analyzeRootCauses}
//                   className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
//                 >
//                   Retry Analysis
//                 </button>
//               </div>
//             )}

//             {/* Add New Root Cause Form */}
//             {showAddForm && (
//               <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
//                 <h3 className="text-sm font-medium text-gray-900 mb-3">Add New Root Cause Analysis</h3>
//                 <div className="space-y-3">
//                   <input
//                     type="text"
//                     value={newRootCause.rootCause}
//                     onChange={(e) => setNewRootCause({...newRootCause, rootCause: e.target.value})}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
//                     placeholder="Enter the identified root cause..."
//                   />
                  
//                   <textarea
//                     value={newRootCause.analysis}
//                     onChange={(e) => setNewRootCause({...newRootCause, analysis: e.target.value})}
//                     rows={3}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
//                     placeholder="Provide detailed technical analysis..."
//                   />
                  
//                   <div className="grid grid-cols-3 gap-3">
//                     <select
//                       value={newRootCause.category}
//                       onChange={(e) => setNewRootCause({...newRootCause, category: e.target.value})}
//                       className="px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
//                     >
//                       <option value="Configuration">Configuration</option>
//                       <option value="Capacity">Capacity</option>
//                       <option value="Infrastructure">Infrastructure</option>
//                       <option value="Code">Code</option>
//                       <option value="Security/Configuration">Security</option>
//                     </select>
                    
//                     <input
//                       type="number"
//                       min="0"
//                       max="100"
//                       value={newRootCause.confidence}
//                       onChange={(e) => setNewRootCause({...newRootCause, confidence: parseInt(e.target.value)})}
//                       className="px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
//                       placeholder="Confidence %"
//                     />
                    
//                     <select
//                       value={newRootCause.severity}
//                       onChange={(e) => setNewRootCause({...newRootCause, severity: e.target.value})}
//                       className="px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
//                     >
//                       <option value="Critical">Critical</option>
//                       <option value="High">High</option>
//                       <option value="Medium">Medium</option>
//                       <option value="Low">Low</option>
//                     </select>
//                   </div>
                  
//                   <div className="flex gap-2">
//                     <button
//                       onClick={addRootCause}
//                       className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
//                     >
//                       Add Analysis
//                     </button>
//                     <button
//                       onClick={() => setShowAddForm(false)}
//                       className="px-3 py-1.5 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors text-sm"
//                     >
//                       Cancel
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Root Causes List - List Format */}
//             <div className="space-y-3">
//               {rootCauses.map((cause, index) => (
//                 <div key={cause.id} className="border border-gray-200 rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors">
//                   <div className="flex items-start gap-4">
//                     {/* List Number */}
//                     <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-semibold">
//                       {index + 1}
//                     </div>
                    
//                     {/* Content */}
//                     <div className="flex-1 min-w-0">
//                       <div className="flex items-start justify-between mb-2">
//                         <div className="flex-1">
//                           <h3 className="font-semibold text-gray-900 text-base leading-tight mb-2">
//                             {cause.rootCause}
//                           </h3>
//                           <div className="flex items-center gap-2 mb-3">
//                             <span className={`px-2 py-1 rounded text-xs font-medium ${getConfidenceColor(cause.confidence)}`}>
//                               {cause.confidence}% Confidence
//                             </span>
//                             <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(cause.severity)}`}>
//                               {cause.severity}
//                             </span>
//                           </div>
//                         </div>
                        
//                         <button
//                           onClick={() => deleteRootCause(cause.id)}
//                           className="ml-2 p-1.5 text-red-500 hover:bg-red-100 rounded transition-colors"
//                           title="Delete root cause"
//                         >
//                           <IoMdTrash className="w-4 h-4" />
//                         </button>
//                       </div>
                      
//                       {/* Analysis */}
//                       <p className="text-gray-700 text-sm leading-relaxed mb-3">
//                         {cause.analysis}
//                       </p>
                      
//                       {/* Evidence */}
//                       {cause.evidence && cause.evidence.length > 0 ? (
//                         <div>
//                           <h4 className="text-xs font-semibold text-gray-600 mb-2">Supporting Evidence:</h4>
//                           <div className="space-y-1">
//                             {cause.evidence.map((evidence, evidenceIndex) => (
//                               <div key={evidenceIndex} className="text-xs text-gray-600 pl-3 border-l-2 border-blue-200">
//                                 <span className="font-medium text-blue-700">{evidence.type}:</span> {evidence.finding}
//                                 <span className="text-gray-500 ml-2">({evidence.source})</span>
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                       ) : (
//                         <div className="flex items-center gap-2 text-xs text-yellow-700 bg-yellow-50 px-2 py-1 rounded">
//                           <BsExclamationTriangle className="w-3 h-3" />
//                           <span>No direct evidence - {cause.confidence}% confidence based on analysis</span>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               ))}
              
//               {rootCauses.length === 0 && (
//                 <div className="text-center py-8 text-gray-500">
//                   <BsFileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
//                   <p>No root causes identified yet. Add one to begin the analysis.</p>
//                 </div>
//               )}
//             </div>
//             <div className="flex justify-end mt-4">
//   <button
//     onClick={() => setShowAddForm(!showAddForm)}
//     className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg shadow-sm 
//                hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
//   >
//     <IoMdAdd className="w-4 h-4" />
//     Add Root Cause
//   </button>
// </div>

//           </div>
//         </div>

//         {/* Right Sidebar - Similar Tickets */}
//         <div className="space-y-6">
//           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//             <h2 className="text-lg font-semibold text-gray-900 mb-4">Similar Tickets</h2>
            
//             <div className="space-y-4">
//               {similarTickets.map((ticket) => (
//                 <div key={ticket.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
//                   <div className="flex items-start justify-between mb-2">
//                     <div className="flex items-center gap-2">
//                       {getCategoryIcon(ticket.category)}
//                       <span className="text-sm font-medium text-gray-900">{ticket.id}</span>
//                     </div>
//                     <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
//                       Similar Case
//                     </span>
//                   </div>
                  
//                   <h4 className="font-medium text-gray-800 mb-1">{ticket.short_description}</h4>
//                   <p className="text-xs text-gray-600 mb-3 line-clamp-2">{ticket.description}</p>
                  
//                   <div className="flex items-center justify-between text-xs">
//                     <span className={`px-2 py-1 rounded-full font-medium ${getPriorityColor(ticket.priority)}`}>
//                       {ticket.priority}
//                     </span>
//                     <span className="text-gray-500">
//                       {ticket.category}
//                     </span>
//                   </div>
//                 </div>
//               ))}
//             </div>
            
//             <button className="w-full mt-4 px-3 py-2 text-sm text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors">
//               View All Similar Tickets
//             </button>
//           </div>

//           {/* Analysis Summary */}
//           {analysisMetadata ? (
//             <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//               <h3 className="text-sm font-semibold text-gray-900 mb-4">Analysis Summary</h3>
              
             
//               <div className="grid grid-cols-2 gap-4 mb-4">
//                 <div className="bg-blue-50 p-3 rounded-lg">
//                   <div className="text-xs text-blue-600 font-medium mb-1">Total Root Causes</div>
//                   <div className="text-lg font-bold text-blue-900">{analysisMetadata.total_root_causes}</div>
//                 </div>
//                 <div className="bg-green-50 p-3 rounded-lg">
//                   <div className="text-xs text-green-600 font-medium mb-1">Highest Confidence</div>
//                   <div className="text-lg font-bold text-green-900">{analysisMetadata.highest_confidence}%</div>
//                 </div>
//                 <div className="bg-yellow-50 p-3 rounded-lg">
//                   <div className="text-xs text-yellow-600 font-medium mb-1">Average Confidence</div>
//                   <div className="text-lg font-bold text-yellow-900">{analysisMetadata.average_confidence}%</div>
//                 </div>
//                 <div className="bg-purple-50 p-3 rounded-lg">
//                   <div className="text-xs text-purple-600 font-medium mb-1">Similar Tickets</div>
//                   <div className="text-lg font-bold text-purple-900">{analysisMetadata.similar_tickets_analyzed}</div>
//                 </div>
//               </div>

//               {/* Ticket Category */}
//               <div className="mb-4">
//                 <div className="text-xs text-gray-600 font-medium mb-1">Ticket Category</div>
//                 <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded border">
//                   {analysisMetadata.ticket_category}
//                 </div>
//               </div>

//               {/* Referenced Tickets */}
//               {analysisMetadata.referenced_tickets && analysisMetadata.referenced_tickets.length > 0 && (
//                 <div>
//                   <div className="text-xs text-gray-600 font-medium mb-2">Referenced Tickets</div>
//                   <div className="space-y-1">
//                     {analysisMetadata.referenced_tickets.map((ticketId, index) => (
//                       <div key={index} className="flex items-center gap-2 text-sm">
//                         <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
//                         <span className="text-gray-700 font-mono">{ticketId}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>
//           ) : (
//             <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//               <h3 className="text-sm font-semibold text-gray-900 mb-3">Investigation Tips</h3>
//               <ul className="text-sm text-gray-700 space-y-2">
//                 <li className="flex items-center gap-2">
//                   <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
//                   Check recent deployments
//                 </li>
//                 <li className="flex items-center gap-2">
//                   <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
//                   Review system logs
//                 </li>
//                 <li className="flex items-center gap-2">
//                   <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
//                   Analyze performance metrics
//                 </li>
//                 <li className="flex items-center gap-2">
//                   <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
//                   Verify dependencies
//                 </li>
//                 <li className="flex items-center gap-2">
//                   <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
//                   Consider environmental factors
//                 </li>
//               </ul>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }

// export default RootCauseAnalysisStep





import React, { useState, useEffect } from 'react'
import { IoIosColorWand, IoMdAdd, IoMdTrash, IoIosArrowDown, IoIosArrowUp } from "react-icons/io"
import { BsStars, BsClock, BsExclamationTriangle, BsFileText, BsRobot, BsDatabase } from "react-icons/bs"
import { FiUsers, FiServer, FiDatabase, FiGlobe, FiLoader, FiChevronDown, FiChevronRight } from "react-icons/fi"
import { HiSparkles, HiLightBulb } from "react-icons/hi"
import { MdSource, MdSmartToy } from "react-icons/md"
import { aiService } from '../../../api/services/aiService'

const RootCauseAnalysisStep = ({ 
  ticketData = null, 
  response = '', 
  onResponseChange = () => {},
  isEnhancingRootCause = false,
  setIsEnhancingRootCause = () => {},
  stepData = {},
  similarCases = null
}) => {
  // Build currentTicket from real data from previous steps and ticketData
  const currentTicket = ticketData ? {
    ...ticketData,
    // Use problem statement from step 1 as enhanced_problem
    enhanced_problem: stepData.rca_workflow_steps?.[0] || ticketData.description || ticketData.short_description || "",
    // Use impact assessment from step 2 as impact
    impact: stepData.rca_workflow_steps?.[1] ? [stepData.rca_workflow_steps[1]] : 
            Array.isArray(ticketData.impact) ? ticketData.impact : 
            ticketData.impact ? [ticketData.impact] : [],
    // Use dropdown values from step 1
    issueType: stepData.issueType || ticketData.category || "Unknown",
    severity: stepData.severity || ticketData.priority || "Medium",
    businessImpactCategory: stepData.businessImpactCategory || "Other",
    // Use impact level and department from step 2
    impactLevel: stepData.impact_level_step2 || "",
    departmentAffected: stepData.department_affected_step2 || ""
  } : {
    category: "Unknown",
    description: "No ticket data available",
    short_description: "No ticket data available",
    enhanced_problem: stepData.rca_workflow_steps?.[0] || "No problem statement available",
    impact: stepData.rca_workflow_steps?.[1] ? [stepData.rca_workflow_steps[1]] : [],
    priority: "Medium",
    urgency: "Medium",
    source: "Unknown"
  }

  // Initial root causes from analysis with concise data
  const initialRootCauses = [
    {
      id: 1,
      rootCause: "BGP Routing Configuration Error",
      analysis: "Network infrastructure failure due to misconfigured BGP routing tables deployed during maintenance window on 2025-01-15 at 08:30 UTC. The configuration change introduced asymmetric routing paths causing packet loss between data centers.",
      confidence: 95,
      category: "Configuration",
      severity: "Critical",
      evidence: [
        {
          type: "Log Analysis",
          finding: "BGP route flapping detected in router logs starting 08:32 UTC",
          source: "Router-Core-01, Router-Core-02"
        },
        {
          type: "Network Monitoring", 
          finding: "Packet loss increased from 0.1% to 15.2% on inter-DC links",
          source: "PRTG Network Monitor"
        },
        {
          type: "Change Correlation",
          finding: "Network configuration change matches incident timeline",
          source: "Change Management System"
        }
      ]
    },
    {
      id: 2,
      rootCause: "Database Connection Pool Exhaustion",
      analysis: "Application database connection pool reached maximum capacity (500 connections) during peak traffic. Connection timeout errors cascaded to dependent services causing widespread service degradation.",
      confidence: 87,
      category: "Capacity",
      severity: "High",
      evidence: [
        {
          type: "Database Metrics",
          finding: "Connection pool utilization reached 100% at 09:15 UTC",
          source: "PostgreSQL Monitoring"
        },
        {
          type: "Application Logs",
          finding: "Connection timeout errors increased by 2400%",
          source: "App-Server-Pool"
        }
      ]
    },
    {
      id: 3,
      rootCause: "Load Balancer SSL Certificate Expiry",
      analysis: "Primary load balancer SSL certificate expired at 2025-01-15T06:00:00Z causing HTTPS connection failures. Secondary load balancer took over but insufficient capacity led to performance degradation.",
      confidence: 78,
      category: "Security/Configuration",
      severity: "High",
      evidence: [
        {
          type: "Certificate Monitoring",
          finding: "SSL certificate expired on primary load balancer",
          source: "LB-Primary-01"
        },
        {
          type: "Traffic Analysis",
          finding: "HTTPS connection failures increased from 0.02% to 12.8%",
          source: "Load Balancer Logs"
        }
      ]
    },
    {
      id: 4,
      rootCause: "Memory Leak in Authentication Service",
      analysis: "Java heap memory leak in user authentication service causing garbage collection pressure and eventual OutOfMemoryError. Service restarts provided temporary relief but issue persists.",
      confidence: 65,
      category: "Code",
      severity: "Medium",
      evidence: [
        {
          type: "JVM Monitoring",
          finding: "Heap memory utilization increased linearly over 6 hours",
          source: "Auth-Service-JVM-Metrics"
        }
      ]
    }
  ]

  // Use real similar cases data from API or fallback to empty array
  const similarTickets = similarCases && similarCases.results ? 
    similarCases.results.map(ticket => ({
      id: ticket.ticket_id || ticket.id || "Unknown",
      short_description: ticket.short_description || ticket.title || "No description",
      category: ticket.category || "Unknown",
      description: ticket.description || ticket.short_description || "No description available",
      priority: ticket.priority || "Medium",
      source: ticket.source || "Unknown",
      confidence_percentage: ticket.confidence_percentage || 0
    })) : []

  const [rootCauses, setRootCauses] = useState([])
  const [collapsedRootCauses, setCollapsedRootCauses] = useState({})
  const [newRootCause, setNewRootCause] = useState({
    rootCause: "",
    analysis: "",
    category: "Configuration",
    confidence: 50,
    severity: "Medium"
  })
  const [showAddForm, setShowAddForm] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState(null)
  const [hasAnalyzed, setHasAnalyzed] = useState(false)
  const [analysisMetadata, setAnalysisMetadata] = useState(null)

  // Toggle collapse state for root causes
  const toggleRootCause = (id) => {
    setCollapsedRootCauses(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  // Function to analyze root causes using the API
  const analyzeRootCauses = async () => {
    if (isAnalyzing || hasAnalyzed) {
      console.log('Analysis already in progress or completed, skipping...')
      return
    }

    try {
      setIsAnalyzing(true)
      setAnalysisError(null)

      // Build comprehensive request data using real data from previous steps
      const requestData = {
        currentTicket: {
          category: currentTicket.category || "Unknown",
          description: currentTicket.description || currentTicket.short_description || "",
          short_description: currentTicket.short_description || "",
          enhanced_problem: currentTicket.enhanced_problem || currentTicket.description || "",
          impact: Array.isArray(currentTicket.impact) ? currentTicket.impact : 
                  currentTicket.impact ? [currentTicket.impact] : [],
          priority: currentTicket.priority || "Medium",
          urgency: currentTicket.urgency || "Medium",
          // Include additional data from previous steps
          issueType: currentTicket.issueType || "",
          severity: currentTicket.severity || "",
          businessImpactCategory: currentTicket.businessImpactCategory || "",
          impactLevel: currentTicket.impactLevel || "",
          departmentAffected: currentTicket.departmentAffected || "",
          // Include step data for context
          problemStatement: stepData.rca_workflow_steps?.[0] || "",
          impactAssessment: stepData.rca_workflow_steps?.[1] || ""
        },
        similarTickets: similarTickets,
        // Include metadata about the analysis
        analysisContext: {
          hasProblemStatement: !!(stepData.rca_workflow_steps?.[0] && stepData.rca_workflow_steps[0].trim().length > 0),
          hasImpactAssessment: !!(stepData.rca_workflow_steps?.[1] && stepData.rca_workflow_steps[1].trim().length > 0),
          hasSimilarTickets: similarTickets.length > 0,
          stepData: stepData
        }
      }

      console.log('Sending RCA analysis request:', requestData)
      const response = await aiService.rootCauseAnalysis.analyze(requestData)

      if (response.success && response.results) {
        // Transform API response to match our UI format
        const transformedResults = response.results.map((result, index) => ({
          id: result.id || index + 1,
          rootCause: result.rootCause,
          analysis: result.analysis,
          confidence: result.confidence,
          category: getCategoryFromRootCause(result.rootCause),
          severity: getSeverityFromConfidence(result.confidence),
          evidence: result.evidence || []
        }))

        setRootCauses(transformedResults)
        setHasAnalyzed(true)
        
        // Initialize first root cause as uncollapsed, rest as collapsed
        const initialCollapsedState = {}
        transformedResults.forEach((cause, index) => {
          initialCollapsedState[cause.id] = index !== 0 // true means collapsed, false means uncollapsed
        })
        setCollapsedRootCauses(initialCollapsedState)
        
        // Store analysis metadata
        if (response.analysis_metadata) {
          setAnalysisMetadata(response.analysis_metadata)
        }
        
        // Update the response in the parent component
        if (onResponseChange) {
          const summaryText = `Root cause analysis completed. Found ${transformedResults.length} potential causes with confidence scores ranging from ${Math.min(...transformedResults.map(r => r.confidence))}% to ${Math.max(...transformedResults.map(r => r.confidence))}%.`
          onResponseChange(summaryText)
        }
      } else {
        throw new Error(response.message || 'Failed to analyze root causes')
      }
    } catch (error) {
      console.error('Error analyzing root causes:', error)
      setAnalysisError(error.message || 'Failed to analyze root causes')
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Helper function to determine category from root cause
  const getCategoryFromRootCause = (rootCause) => {
    const lowerCause = rootCause.toLowerCase()
    if (lowerCause.includes('configuration') || lowerCause.includes('config')) return 'Configuration'
    if (lowerCause.includes('capacity') || lowerCause.includes('buffer') || lowerCause.includes('exhaustion')) return 'Capacity'
    if (lowerCause.includes('network') || lowerCause.includes('routing') || lowerCause.includes('qos')) return 'Infrastructure'
    if (lowerCause.includes('memory') || lowerCause.includes('leak') || lowerCause.includes('code')) return 'Code'
    if (lowerCause.includes('security') || lowerCause.includes('certificate') || lowerCause.includes('ssl')) return 'Security/Configuration'
    return 'Configuration'
  }

  // Helper function to determine severity from confidence
  const getSeverityFromConfidence = (confidence) => {
    if (confidence >= 90) return 'Critical'
    if (confidence >= 80) return 'High'
    if (confidence >= 60) return 'Medium'
    return 'Low'
  }

  // Debug: Log the data being used for analysis
  useEffect(() => {
    console.log('RootCauseAnalysisStep: Data for analysis:', {
      currentTicket: currentTicket,
      stepData: stepData,
      similarTickets: similarTickets,
      hasProblemStatement: !!(stepData.rca_workflow_steps?.[0] && stepData.rca_workflow_steps[0].trim().length > 0),
      hasImpactAssessment: !!(stepData.rca_workflow_steps?.[1] && stepData.rca_workflow_steps[1].trim().length > 0),
      hasSimilarTickets: similarTickets.length > 0
    })
  }, [currentTicket, stepData, similarTickets])

  // Trigger analysis when component mounts (only once)
  useEffect(() => {
    if (currentTicket && !hasAnalyzed && !isAnalyzing) {
      // Auto-analyze after a short delay to show the loading state
      setTimeout(() => {
        analyzeRootCauses()
      }, 500)
    }
  }, []) // Empty dependency array to run only once on mount

  const addRootCause = () => {
    if (!newRootCause.rootCause.trim() || !newRootCause.analysis.trim()) {
      alert('Please fill in both root cause and analysis')
      return
    }

    const newCause = {
      id: Date.now(),
      ...newRootCause,
      evidence: [],
      createdAt: new Date().toISOString()
    }

    setRootCauses([...rootCauses, newCause])
    
    // Set the new root cause as collapsed by default
    setCollapsedRootCauses(prev => ({
      ...prev,
      [newCause.id]: true // true means collapsed
    }))
    
    setNewRootCause({
      rootCause: "",
      analysis: "",
      category: "Configuration",
      confidence: 50,
      severity: "Medium"
    })
    setShowAddForm(false)
  }

  const deleteRootCause = (id) => {
    setRootCauses(rootCauses.filter(cause => cause.id !== id))
    // Remove from collapsed state as well
    setCollapsedRootCauses(prev => {
      const newState = { ...prev }
      delete newState[id]
      return newState
    })
  }

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getConfidenceColor = (confidence) => {
    const confidenceNum = typeof confidence === 'number' ? confidence : parseInt(confidence) || 0
    if (confidenceNum >= 80) return 'text-green-700 bg-green-100 border-green-300'
    if (confidenceNum >= 60) return 'text-yellow-700 bg-yellow-100 border-yellow-300'
    return 'text-red-700 bg-red-100 border-red-300'
  }

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'text-red-700 bg-red-100 border-red-300'
      case 'high': return 'text-orange-700 bg-orange-100 border-orange-300'
      case 'medium': return 'text-yellow-700 bg-yellow-100 border-yellow-300'
      case 'low': return 'text-blue-700 bg-blue-100 border-blue-300'
      default: return 'text-gray-700 bg-gray-100 border-gray-300'
    }
  }

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'database': return <FiDatabase className="w-4 h-4" />
      case 'network infrastructure': return <FiGlobe className="w-4 h-4" />
      case 'api gateway': return <FiServer className="w-4 h-4" />
      default: return <BsFileText className="w-4 h-4" />
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* SOURCE SECTION */}
          {/* <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MdSource className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Source Ticket Information</h1>
                  <p className="text-sm text-gray-600">Original ticket details and description</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 font-mono">#{currentTicket.source}-2025-001</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                    {currentTicket.category}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getPriorityColor(currentTicket.priority)}`}>
                    {currentTicket.priority} Priority
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getPriorityColor(currentTicket.urgency)}`}>
                    {currentTicket.urgency} Urgency
                  </span>
                </div>
              </div>
              
              <h2 className="text-lg font-semibold text-gray-800 mb-4">{currentTicket.short_description}</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-700 leading-relaxed">{currentTicket.description}</p>
                  </div>
                </div>
                
                {currentTicket.enhanced_problem && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Enhanced Problem Statement</h3>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800 leading-relaxed">{currentTicket.enhanced_problem}</p>
                    </div>
                  </div>
                )}
                
                {currentTicket.impact && currentTicket.impact.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Impact</h3>
                    <div className="space-y-2">
                      {currentTicket.impact.map((impact, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                          <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                          {impact}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div> */}

          {/* AI SUGGESTED SECTION */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg">
                    <HiSparkles className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      AI Root Cause Analysis
                    
                    </h2>
                    <p className="text-sm text-gray-600">AI-powered analysis with confidence scoring</p>
                  </div>
                </div>
                
                {!hasAnalyzed && !isAnalyzing && (
                  <button
                    onClick={analyzeRootCauses}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg shadow-sm hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all transform hover:scale-105"
                  >
                    <BsStars className="w-4 h-4" />
                    Analyze Root Causes
                  </button>
                )}
              </div>
            </div>

            <div className="p-6">
              {/* Loading State */}
              {isAnalyzing && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <HiSparkles className="w-6 h-6 text-purple-600 animate-pulse" />
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-gray-600 font-medium">AI is analyzing root causes...</p>
                    <p className="text-sm text-gray-500">This may take a few moments</p>
                  </div>
                </div>
              )}

              {/* Error State */}
              {analysisError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <BsExclamationTriangle className="w-5 h-5 text-red-600" />
                    <span className="font-medium text-red-800">Analysis Error</span>
                  </div>
                  <p className="text-sm text-red-700 mb-3">{analysisError}</p>
                  <button
                    onClick={analyzeRootCauses}
                    className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Retry Analysis
                  </button>
                </div>
              )}

      

              {/* Root Causes List - Collapsible Cards */}
              <div className="space-y-4">
                {rootCauses.map((cause, index) => (
                  <div key={cause.id} className="border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
                    {/* Root Cause Header - Always Visible */}
                    <div 
                      className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => toggleRootCause(cause.id)}
                    >
                      <div className="flex items-start gap-4">
                        {/* AI Badge */}
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-bold border border-purple-200">
                          {index + 1}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className=" text-gray-900 text-base text-md font-semibold text-gray-600  leading-tight mb-2 pr-4">
                                {cause.rootCause}
                              </h3> 
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getConfidenceColor(cause.confidence)}`}>
                                  {cause.confidence}% Confidence
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(cause.severity)}`}>
                                  {cause.severity} Risk
                                </span>
                                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full border border-gray-200">
                                  {cause.category}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteRootCause(cause.id)
                                }}
                                className="p-1.5 text-red-500 hover:bg-red-100 rounded transition-colors"
                                title="Delete root cause"
                              >
                                <IoMdTrash className="w-4 h-4" />
                              </button>
                              
                              <div className="text-gray-400">
                                {collapsedRootCauses[cause.id] ? 
                                  <FiChevronRight className="w-5 h-5" /> : 
                                  <FiChevronDown className="w-5 h-5" />
                                }
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Collapsible Content */}
                    {!collapsedRootCauses[cause.id] && (
                      <div className="px-4 pb-4 border-t border-gray-100">
                        <div className="pl-14">
                          {/* Analysis */}
                          {/* <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Analysis</h4>
                            <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 p-3 rounded-lg">
                              {cause.analysis}
                            </p>
                          </div> */}
<h4 className="text-xs font-semibold text-gray-600 mb-2 mt-3">Analysis:</h4>
<p className="text-gray-700 text-sm leading-relaxed mb-3">
                         {cause.analysis}
                       </p>
                          
                          {/* Evidence */}
                          {/* {cause.evidence && cause.evidence.length > 0 ? (
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-3">Supporting Evidence</h4>
                              <div className="space-y-3">
                                {cause.evidence.map((evidence, evidenceIndex) => (
                                  <div key={evidenceIndex} className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                                    <div className="flex items-start gap-2">
                                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                      <div className="flex-1">
                                        <div className="text-sm font-medium text-blue-800 mb-1">{evidence.type}</div>
                                        <p className="text-sm text-blue-700 mb-1">{evidence.finding}</p>
                                        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded font-medium">
                                          Source: {evidence.source}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                              <BsExclamationTriangle className="w-4 h-4" />
                              <span>Limited evidence available - {cause.confidence}% confidence based on pattern analysis</span>
                            </div>
                          )} */}
                                         {cause.evidence && cause.evidence.length > 0 ? (
                     <div className='mb-3'>
                          <h4 className="text-xs font-semibold text-gray-600 mb-2">Supporting Evidence:</h4>
                          <div className="space-y-1">
                             {cause.evidence.map((evidence, evidenceIndex) => (
                               <div key={evidenceIndex} className="text-xs text-gray-600 pl-3 border-l-2 border-blue-200">                                 <span className="font-medium text-blue-700">{evidence.type}:</span> {evidence.finding}
                                 <span className="text-gray-500 ml-2">({evidence.source})</span>
                               </div>
                             ))}
                           </div>
                         </div>                       ) : (
                         <div className="flex items-center gap-2 text-xs text-yellow-700 bg-yellow-50 px-2 py-1 rounded">
                           <BsExclamationTriangle className="w-3 h-3" />
                           <span>No direct evidence - {cause.confidence}% confidence based on analysis</span>                         </div>
                     )}
                       
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {rootCauses.length === 0 && !isAnalyzing && (
                  <div className="text-center py-12 text-gray-500">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BsFileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-lg font-medium text-gray-600 mb-2">No Root Causes Identified</p>
                    <p className="text-sm text-gray-500">Click "Analyze Root Causes" to begin AI-powered analysis</p>
                  </div>
                )}


                        {/* Add New Root Cause Form */}
              {showAddForm && (
                <div className="mb-6 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <HiLightBulb className="w-5 h-5 text-yellow-500" />
                    Add Custom Root Cause Analysis
                  </h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={newRootCause.rootCause}
                      onChange={(e) => setNewRootCause({...newRootCause, rootCause: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="Enter the identified root cause..."
                    />
                    
                    <textarea
                      value={newRootCause.analysis}
                      onChange={(e) => setNewRootCause({...newRootCause, analysis: e.target.value})}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="Provide detailed technical analysis..."
                    />
                    
                    
                    
                    <div className="flex gap-3">
                      <button
                        onClick={addRootCause}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        Add Analysis
                      </button>
                      <button
                        onClick={() => setShowAddForm(false)}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
              </div>

              {/* Add Root Cause Button */}
              {rootCauses.length > 0 && (
                <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-lg shadow-sm 
                               hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all transform hover:scale-105"
                  >
                    <IoMdAdd className="w-4 h-4" />
                    Add Custom Root Cause
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Similar Tickets */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <BsDatabase className="w-5 h-5 text-emerald-600" />
                Similar Tickets
              </h2>
              <p className="text-sm text-gray-600">Historical incidents for context</p>
            </div>
            
            <div className="p-6">
              {similarTickets.length > 0 ? (
                <div className="space-y-4">
                  {similarTickets.slice(0, 3).map((ticket) => (
                    <div key={ticket.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(ticket.category)}
                          <span className="text-sm font-medium text-gray-900 font-mono">{ticket.id}</span>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                
                          {ticket.confidence_percentage && (
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              ticket.confidence_percentage >= 90 ? 'bg-green-100 text-green-800' :
                              ticket.confidence_percentage >= 80 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-orange-100 text-orange-800'
                            }`}>
                              {ticket.confidence_percentage}% match
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <h4 className="font-medium text-gray-800 mb-2 text-sm leading-tight">{ticket.short_description}</h4>
                      <p className="text-xs text-gray-600 mb-3 line-clamp-3 leading-relaxed">{ticket.description}</p>
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className={`px-2 py-1 rounded-full font-medium border ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {ticket.category}
                          </span>
                          {ticket.source && (
                            <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                              {ticket.source}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BsDatabase className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No similar tickets found</p>
                  <p className="text-xs text-gray-400 mt-1">Similar cases will appear here when available</p>
                </div>
              )}
            </div>
          </div>


          {/* {analysisMetadata ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <BsStars className="w-5 h-5 text-indigo-600" />
                  Analysis Summary
                </h3>
                <p className="text-sm text-gray-600">AI analysis insights</p>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                    <div className="text-xs text-blue-600 font-medium mb-1">Root Causes</div>
                    <div className="text-2xl font-bold text-blue-900">{analysisMetadata.total_root_causes}</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                    <div className="text-xs text-green-600 font-medium mb-1">Max Confidence</div>
                    <div className="text-2xl font-bold text-green-900">{analysisMetadata.highest_confidence}%</div>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
                    <div className="text-xs text-yellow-600 font-medium mb-1">Avg Confidence</div>
                    <div className="text-2xl font-bold text-yellow-900">{analysisMetadata.average_confidence}%</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                    <div className="text-xs text-purple-600 font-medium mb-1">References</div>
                    <div className="text-2xl font-bold text-purple-900">{analysisMetadata.similar_tickets_analyzed}</div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-xs text-gray-600 font-medium mb-2">Ticket Category</div>
                  <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                    {analysisMetadata.ticket_category}
                  </div>
                </div>

                {analysisMetadata.referenced_tickets && analysisMetadata.referenced_tickets.length > 0 && (
                  <div>
                    <div className="text-xs text-gray-600 font-medium mb-2">Referenced Tickets</div>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {analysisMetadata.referenced_tickets.map((ticketId, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm bg-gray-50 px-3 py-2 rounded border border-gray-200">
                          <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                          <span className="text-gray-700 font-mono text-xs">{ticketId}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <HiLightBulb className="w-5 h-5 text-yellow-600" />
                  Investigation Tips
                </h3>
                <p className="text-sm text-gray-600">Best practices for root cause analysis</p>
              </div>
              
              <div className="p-6">
                <ul className="text-sm text-gray-700 space-y-3">
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></span>
                    Check recent deployments and changes
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"></span>
                    Review system and application logs
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-gradient-to-r from-yellow-500 to-red-500 rounded-full"></span>
                    Analyze performance metrics and trends
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></span>
                    Verify service dependencies
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full"></span>
                    Consider environmental factors
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full"></span>
                    Cross-reference with similar incidents
                  </li>
                </ul>
              </div>
            </div>
          )} */}
        </div>
      </div>
    </div>
  )
}

export default RootCauseAnalysisStep