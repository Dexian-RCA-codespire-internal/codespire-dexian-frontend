// Navigation Configuration
// Enable/disable navigation features by setting them to true/false

export const navigationConfig = {
  // Core features (always enabled)
  dashboard: true,
  aiRca: true,

  
  // Optional features (can be enabled/disabled)
  patternDetector: true,        // Pattern & Duplicate Detector
  playbookRecommender: true,    // Playbook Recommender
  customerRcaSummary: true,     // Customer RCA Summary
  alertCorrelation: true,       // Alert Correlation
  complianceAudit: true,        // Compliance & Audit
  chartBot: false,             // Chart Bot
  
  // UI Components
  chatbot: true,               // ChatBot component visibility
}

// Helper function to get enabled navigation items
export const getEnabledNavigationItems = () => {
  return Object.entries(navigationConfig)
    .filter(([key, enabled]) => enabled)
    .map(([key]) => key)
}

// Helper function to check if a specific feature is enabled
export const isFeatureEnabled = (featureName) => {
  return navigationConfig[featureName] === true
}

// Helper function to check if chatbot is enabled
export const isChatbotEnabled = () => {
  return navigationConfig.chatbot === true
}

// Navigation items mapping
export const navigationItems = {
  dashboard: {
    path: "/",
    label: "Dashboard",
    icon: "AiOutlineHome",
    hasSubItems: false
  },
  aiRca: {
    path: null,
    label: "AI RCA",
    icon: "RiAiGenerate2",
    hasSubItems: true
  },
  patternDetector: {
    path: "/pattern-detector",
    label: "Pattern & Duplicate Detector",
    icon: "AiOutlineSearch",
    hasSubItems: false
  },
  playbookRecommender: {
    path: "/playbook-recommender",
    label: "Playbook Recommender",
    icon: "AiOutlineBook",
    hasSubItems: false
  },
  customerRcaSummary: {
    path: "/customer-rca-summary",
    label: "Customer RCA Summary",
    icon: "FaRegFile",
    hasSubItems: false
  },
  alertCorrelation: {
    path: "/alert-correlation",
    label: "Alert Correlation",
    icon: "BellIcon",
    hasSubItems: false
  },
  complianceAudit: {
    path: "/compliance-audit",
    label: "Compliance & Audit",
    icon: "FiShield",
    hasSubItems: false
  },
  chartBot: {
    path: "/chart-bot",
    label: "Chart Bot",
    icon: "AiOutlineBarChart",
    hasSubItems: false
  }
}

// Get filtered navigation items based on configuration
export const getFilteredNavigationItems = () => {
  return Object.entries(navigationItems)
    .filter(([key]) => navigationConfig[key])
    .map(([key, item]) => ({
      key,
      ...item
    }))
}
