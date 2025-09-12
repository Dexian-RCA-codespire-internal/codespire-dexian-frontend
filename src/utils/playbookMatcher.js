// new file servicenow
// Utility to match ticket data with appropriate playbook recommendations

// Base playbook database with all available playbooks
const allPlaybooks = [
  {
    id: 1,
    title: "Database Connection Pool Reset",
    description: "Standard procedure for resolving database connection issues",
    score: 95,
    tags: ["Database", "Connection"],
    usage: "127 tickets resolved",
    confidence: "High",
    keywords: ["database", "connection", "pool", "exhaustion", "timeout", "db"]
  },
  {
    id: 2,
    title: "Network Connectivity Troubleshooting",
    description: "Comprehensive network issue diagnosis and resolution",
    score: 88,
    tags: ["Network", "Infrastructure"],
    usage: "89 tickets resolved",
    confidence: "High",
    keywords: ["network", "connectivity", "timeout", "connection", "dns", "vpn"]
  },
  {
    id: 3,
    title: "Application Service Restart",
    description: "Service restart procedures for application-related issues",
    score: 82,
    tags: ["Application", "Service"],
    usage: "156 tickets resolved",
    confidence: "Medium",
    keywords: ["application", "service", "restart", "crash", "hang", "unresponsive"]
  },
  {
    id: 4,
    title: "Memory Leak Investigation",
    description: "Systematic approach to identifying and resolving memory leaks",
    score: 76,
    tags: ["Performance", "Memory"],
    usage: "43 tickets resolved",
    confidence: "Medium",
    keywords: ["memory", "leak", "performance", "slow", "ram", "consumption"]
  },
  {
    id: 5,
    title: "Payment Gateway Troubleshooting",
    description: "Comprehensive payment processing issue resolution",
    score: 92,
    tags: ["Payment", "Gateway"],
    usage: "78 tickets resolved",
    confidence: "High",
    keywords: ["payment", "gateway", "transaction", "billing", "credit", "card"]
  },
  {
    id: 6,
    title: "Authentication System Reset",
    description: "User authentication and login issue resolution",
    score: 89,
    tags: ["Authentication", "Security"],
    usage: "95 tickets resolved",
    confidence: "High",
    keywords: ["authentication", "login", "password", "user", "access", "auth"]
  },
  {
    id: 7,
    title: "API Rate Limiting Issues",
    description: "API throttling and rate limiting problem resolution",
    score: 85,
    tags: ["API", "Rate Limiting"],
    usage: "62 tickets resolved",
    confidence: "High",
    keywords: ["api", "rate", "limit", "throttling", "quota", "endpoint"]
  },
  {
    id: 8,
    title: "SSL Certificate Renewal",
    description: "SSL certificate expiration and renewal procedures",
    score: 94,
    tags: ["Security", "Certificate"],
    usage: "34 tickets resolved",
    confidence: "High",
    keywords: ["ssl", "certificate", "https", "security", "expired", "tls"]
  },
  {
    id: 9,
    title: "Server Performance Optimization",
    description: "Server resource optimization and performance tuning",
    score: 81,
    tags: ["Performance", "Server"],
    usage: "112 tickets resolved",
    confidence: "Medium",
    keywords: ["server", "performance", "cpu", "slow", "optimization", "resource"]
  },
  {
    id: 10,
    title: "File Upload Size Limit Issues",
    description: "File upload configuration and size limit resolution",
    score: 87,
    tags: ["File", "Upload"],
    usage: "45 tickets resolved",
    confidence: "High",
    keywords: ["file", "upload", "size", "limit", "document", "attachment"]
  }
]

// Function to get playbook recommendations based on ticket data
export const getPlaybookRecommendations = (ticketData) => {
  if (!ticketData) {
    // Return default recommendations if no ticket data
    return allPlaybooks.slice(0, 4)
  }

  const { title = '', system = '', source = '', priority = '' } = ticketData
  
  // Combine all searchable text
  const searchText = `${title} ${system} ${source}`.toLowerCase()
  
  // Score each playbook based on keyword matches
  const scoredPlaybooks = allPlaybooks.map(playbook => {
    let score = 0
    let matches = 0
    
    // Check for keyword matches
    playbook.keywords.forEach(keyword => {
      if (searchText.includes(keyword)) {
        score += 10
        matches++
      }
    })
    
    // Boost score for exact title matches
    if (title.toLowerCase().includes(playbook.title.toLowerCase().split(' ')[0])) {
      score += 20
    }
    
    // Boost score for system matches
    if (system.toLowerCase().includes('database') && playbook.tags.includes('Database')) {
      score += 15
    }
    if (system.toLowerCase().includes('payment') && playbook.tags.includes('Payment')) {
      score += 15
    }
    if (system.toLowerCase().includes('api') && playbook.tags.includes('API')) {
      score += 15
    }
    
    // Priority-based scoring
    if (priority === 'P1' && playbook.confidence === 'High') {
      score += 5
    }
    
    return {
      ...playbook,
      matchScore: score,
      keywordMatches: matches
    }
  })
  
  // Sort by match score and return top 4 recommendations
  const sortedPlaybooks = scoredPlaybooks
    .filter(playbook => playbook.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 4)
  
  // If no matches found, return default recommendations
  if (sortedPlaybooks.length === 0) {
    return allPlaybooks.slice(0, 4)
  }
  
  return sortedPlaybooks
}

// Function to get the best matching playbook for a ticket
export const getBestPlaybookMatch = (ticketData) => {
  const recommendations = getPlaybookRecommendations(ticketData)
  return recommendations[0] || allPlaybooks[0]
}

// Function to get playbook by ID
export const getPlaybookById = (id) => {
  return allPlaybooks.find(playbook => playbook.id === id)
}

export default {
  getPlaybookRecommendations,
  getBestPlaybookMatch,
  getPlaybookById,
  allPlaybooks
}
