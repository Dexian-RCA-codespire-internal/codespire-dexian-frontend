// Navigation Configuration
// Enable/disable navigation features by setting them to true/false

export const navigationConfig = {
  // Core features (always enabled)
  dashboard: true,
  aiRca: true,
  sla: false,                    // SLA Monitoring

  
  // Optional features (can be enabled/disabled)
  patternDetector: false,        // Pattern & Duplicate Detector
  playbookRecommender:false,    // Playbook Recommender
  customerRcaSummary: false,     // Customer RCA Summary
  alertCorrelation: false,       // Alert Correlation
  complianceAudit: false,        // Compliance & Audit
  userManagement: false,          // User Management
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
  sla: {
    path: "/sla",
    label: "SLA",
    icon: "AiOutlineTrophy",
    hasSubItems: false
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
  userManagement: {
    path: "/user-management",
    label: "User Management",
    icon: "LuUser",
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
