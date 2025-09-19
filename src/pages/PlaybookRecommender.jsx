import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
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

  // Function to update sample playbooks with calculated confidence
  const updateSamplePlaybooksConfidence = (playbooks) => {
    return playbooks.map(playbook => ({
      ...playbook,
      confidence: `${calculateConfidence(playbook.usage)}%`
    }))
  }

  // Sample playbook data with new format
  const samplePlaybooks = updateSamplePlaybooksConfidence([
    {
      id: 1,
      title: "Restart Database Cluster",
      tags: ["Database", "Automation"],
      usage: "24 tickets resolved",
      confidence: "90%",
      playbook_id: "db-restart-001",
      description: "Steps to restart database cluster for maintenance or recovery",
      priority: "High",
      steps: [
        {
          step_id: 1,
          title: "Check Database Status",
          action: "Verify current database cluster status and active connections",
          expected_outcome: "Identify if cluster is healthy before restart",
          resources: ["https://example.com/db-status"]
        },
        {
          step_id: 2,
          title: "Initiate Restart",
          action: "Execute restart command on database cluster",
          expected_outcome: "Database cluster restarts successfully",
          resources: ["https://example.com/restart-tool"]
        }
      ],
      outcome: "Database cluster restarted successfully with minimal downtime"
    },
    {
      id: 2,
      title: "Network Connectivity Troubleshooting",
      tags: ["Network", "Infrastructure"],
      usage: "18 tickets resolved",
      confidence: "85%",
      playbook_id: "net-troubleshoot-002",
      description: "Comprehensive steps to diagnose and resolve network connectivity issues affecting multiple services",
      priority: "High",
      steps: [
        {
          step_id: 1,
          title: "Check Network Interface Status",
          action: "Verify network interface status and connectivity using ping and traceroute commands",
          expected_outcome: "Identify if network interface is up and routing is working",
          resources: ["https://example.com/network-tools", "https://example.com/ping-guide"]
        },
        {
          step_id: 2,
          title: "Verify DNS Resolution",
          action: "Test DNS resolution for affected domains and check DNS server connectivity",
          expected_outcome: "Confirm DNS is resolving correctly or identify DNS issues",
          resources: ["https://example.com/dns-troubleshooting"]
        },
        {
          step_id: 3,
          title: "Check Load Balancer Health",
          action: "Verify load balancer configuration and health check status",
          expected_outcome: "Load balancer is healthy and routing traffic correctly",
          resources: ["https://example.com/loadbalancer-monitoring"]
        }
      ],
      outcome: "Network connectivity restored and all services accessible"
    },
    {
      id: 3,
      title: "Security Incident Response",
      tags: ["Security", "Incident"],
      usage: "12 tickets resolved",
      confidence: "95%",
      playbook_id: "sec-incident-003",
      description: "Immediate response procedures for security incidents and potential breaches",
      priority: "Critical",
      steps: [
        {
          step_id: 1,
          title: "Isolate Affected Systems",
          action: "Immediately isolate compromised systems from the network to prevent further damage",
          expected_outcome: "Affected systems are isolated and cannot communicate with other systems",
          resources: ["https://example.com/network-isolation", "https://example.com/security-procedures"]
        },
        {
          step_id: 2,
          title: "Preserve Evidence",
          action: "Document all evidence including logs, screenshots, and system state",
          expected_outcome: "Complete evidence package preserved for investigation",
          resources: ["https://example.com/forensics-guide"]
        },
        {
          step_id: 3,
          title: "Notify Security Team",
          action: "Alert security team and management about the incident",
          expected_outcome: "Security team is aware and can begin investigation",
          resources: ["https://example.com/incident-escalation"]
        }
      ],
      outcome: "Security incident contained and investigation initiated"
    },
    {
      id: 4,
      title: "API Integration Debugging",
      tags: ["API", "Integration"],
      usage: "31 tickets resolved",
      confidence: "88%",
      playbook_id: "api-debug-004",
      description: "Systematic approach to debugging API integration issues and failures",
      priority: "Medium",
      steps: [
        {
          step_id: 1,
          title: "Check API Endpoint Status",
          action: "Verify API endpoint is responding and check response codes",
          expected_outcome: "API endpoint is accessible and returning expected responses",
          resources: ["https://example.com/api-monitoring", "https://example.com/http-status-codes"]
        },
        {
          step_id: 2,
          title: "Validate Request Format",
          action: "Verify request headers, authentication, and payload format",
          expected_outcome: "Request format matches API specification",
          resources: ["https://example.com/api-documentation"]
        },
        {
          step_id: 3,
          title: "Check Rate Limiting",
          action: "Verify if API calls are being rate limited or throttled",
          expected_outcome: "Rate limiting issues identified and resolved",
          resources: ["https://example.com/rate-limiting-guide"]
        }
      ],
      outcome: "API integration working correctly with proper error handling"
    },
    {
      id: 5,
      title: "Server Performance Optimization",
      tags: ["Performance", "Server"],
      usage: "22 tickets resolved",
      confidence: "82%",
      playbook_id: "perf-optimize-005",
      description: "Steps to identify and resolve server performance bottlenecks",
      priority: "Medium",
      steps: [
        {
          step_id: 1,
          title: "Monitor System Resources",
          action: "Check CPU, memory, disk I/O, and network utilization",
          expected_outcome: "Identify resource bottlenecks and performance issues",
          resources: ["https://example.com/system-monitoring", "https://example.com/performance-tools"]
        },
        {
          step_id: 2,
          title: "Analyze Application Logs",
          action: "Review application logs for errors, slow queries, and performance issues",
          expected_outcome: "Root cause of performance issues identified",
          resources: ["https://example.com/log-analysis"]
        },
        {
          step_id: 3,
          title: "Optimize Configuration",
          action: "Adjust server configuration parameters for optimal performance",
          expected_outcome: "Server performance improved and optimized",
          resources: ["https://example.com/server-tuning"]
        }
      ],
      outcome: "Server performance optimized and bottlenecks resolved"
    },
    {
      id: 6,
      title: "Authentication System Reset",
      tags: ["Authentication", "Security"],
      usage: "15 tickets resolved",
      confidence: "92%",
      playbook_id: "auth-reset-006",
      description: "Procedures for resetting authentication systems and user access",
      priority: "High",
      steps: [
        {
          step_id: 1,
          title: "Backup Authentication Data",
          action: "Create backup of current authentication configuration and user data",
          expected_outcome: "Complete backup of authentication system created",
          resources: ["https://example.com/auth-backup"]
        },
        {
          step_id: 2,
          title: "Reset Authentication Service",
          action: "Restart authentication service and clear cached sessions",
          expected_outcome: "Authentication service restarted and cache cleared",
          resources: ["https://example.com/auth-service-reset"]
        },
        {
          step_id: 3,
          title: "Verify User Access",
          action: "Test user login functionality and verify access permissions",
          expected_outcome: "All users can authenticate and access appropriate resources",
          resources: ["https://example.com/access-verification"]
        }
      ],
      outcome: "Authentication system reset and all users can access the system"
    },
    {
      id: 7,
      title: "Database Backup Recovery",
      tags: ["Database", "Backup"],
      usage: "8 tickets resolved",
      confidence: "96%",
      playbook_id: "db-recovery-007",
      description: "Complete database backup and recovery procedures for data restoration",
      priority: "Critical",
      steps: [
        {
          step_id: 1,
          title: "Verify Backup Integrity",
          action: "Check backup files for corruption and verify backup completeness",
          expected_outcome: "Backup files are intact and ready for restoration",
          resources: ["https://example.com/backup-verification"]
        },
        {
          step_id: 2,
          title: "Prepare Recovery Environment",
          action: "Set up clean database environment for recovery process",
          expected_outcome: "Recovery environment is ready and configured",
          resources: ["https://example.com/recovery-setup"]
        },
        {
          step_id: 3,
          title: "Execute Recovery Process",
          action: "Restore database from backup and verify data integrity",
          expected_outcome: "Database successfully restored with all data intact",
          resources: ["https://example.com/database-recovery"]
        }
      ],
      outcome: "Database successfully recovered with all data restored"
    },
    {
      id: 8,
      title: "Load Balancer Configuration",
      tags: ["Infrastructure", "Network"],
      usage: "19 tickets resolved",
      confidence: "87%",
      playbook_id: "lb-config-008",
      description: "Configuration and troubleshooting procedures for load balancer issues",
      priority: "High",
      steps: [
        {
          step_id: 1,
          title: "Check Load Balancer Status",
          action: "Verify load balancer health and backend server status",
          expected_outcome: "Load balancer is healthy and all backend servers are accessible",
          resources: ["https://example.com/lb-monitoring"]
        },
        {
          step_id: 2,
          title: "Review Configuration",
          action: "Check load balancer configuration for routing rules and health checks",
          expected_outcome: "Configuration is correct and optimized",
          resources: ["https://example.com/lb-configuration"]
        },
        {
          step_id: 3,
          title: "Test Traffic Distribution",
          action: "Verify traffic is being distributed evenly across backend servers",
          expected_outcome: "Traffic is properly distributed and balanced",
          resources: ["https://example.com/traffic-testing"]
        }
      ],
      outcome: "Load balancer configured correctly and traffic distributed properly"
    },
    {
      id: 9,
      title: "SSL Certificate Renewal",
      tags: ["Security", "Certificate"],
      usage: "13 tickets resolved",
      confidence: "94%",
      playbook_id: "ssl-renewal-009",
      description: "Procedures for renewing SSL certificates and updating configurations",
      priority: "High",
      steps: [
        {
          step_id: 1,
          title: "Check Certificate Expiry",
          action: "Verify current SSL certificate expiration date and validity",
          expected_outcome: "Certificate status confirmed and renewal timeline established",
          resources: ["https://example.com/certificate-check"]
        },
        {
          step_id: 2,
          title: "Generate New Certificate",
          action: "Create new SSL certificate with updated expiration date",
          expected_outcome: "New SSL certificate generated and ready for deployment",
          resources: ["https://example.com/certificate-generation"]
        },
        {
          step_id: 3,
          title: "Deploy New Certificate",
          action: "Install new certificate and update server configuration",
          expected_outcome: "New SSL certificate deployed and working correctly",
          resources: ["https://example.com/certificate-deployment"]
        }
      ],
      outcome: "SSL certificate renewed and all services using updated certificate"
    },
    {
      id: 10,
      title: "Cache System Flush",
      tags: ["Performance", "Cache"],
      usage: "27 tickets resolved",
      confidence: "89%",
      playbook_id: "cache-flush-010",
      description: "Procedures for clearing cache systems to resolve data consistency issues",
      priority: "Medium",
      steps: [
        {
          step_id: 1,
          title: "Identify Cache Type",
          action: "Determine which cache system needs to be flushed (Redis, Memcached, etc.)",
          expected_outcome: "Cache system identified and access method confirmed",
          resources: ["https://example.com/cache-identification"]
        },
        {
          step_id: 2,
          title: "Backup Cache Data",
          action: "Create backup of important cached data before flushing",
          expected_outcome: "Important cache data backed up and preserved",
          resources: ["https://example.com/cache-backup"]
        },
        {
          step_id: 3,
          title: "Execute Cache Flush",
          action: "Clear cache system and verify all cached data is removed",
          expected_outcome: "Cache system flushed and ready for fresh data",
          resources: ["https://example.com/cache-flush-procedures"]
        }
      ],
      outcome: "Cache system flushed and data consistency issues resolved"
    },
    {
      id: 11,
      title: "User Account Lockout Resolution",
      tags: ["Authentication", "User Management"],
      usage: "35 tickets resolved",
      confidence: "91%",
      playbook_id: "user-lockout-011",
      description: "Steps to resolve user account lockouts and restore access",
      priority: "Medium",
      steps: [
        {
          step_id: 1,
          title: "Verify Lockout Status",
          action: "Check user account status and identify lockout reason",
          expected_outcome: "Lockout cause identified and user status confirmed",
          resources: ["https://example.com/user-management"]
        },
        {
          step_id: 2,
          title: "Reset Account Access",
          action: "Unlock user account and reset password if necessary",
          expected_outcome: "User account unlocked and access restored",
          resources: ["https://example.com/account-reset"]
        }
      ],
      outcome: "User account unlocked and access restored"
    },
    {
      id: 12,
      title: "Database Connection Pool Reset",
      tags: ["Database", "Connection"],
      usage: "16 tickets resolved",
      confidence: "86%",
      playbook_id: "db-pool-reset-012",
      description: "Reset database connection pool to resolve connection issues",
      priority: "High",
      steps: [
        {
          step_id: 1,
          title: "Check Connection Pool Status",
          action: "Monitor current connection pool usage and identify issues",
          expected_outcome: "Connection pool issues identified",
          resources: ["https://example.com/connection-monitoring"]
        },
        {
          step_id: 2,
          title: "Reset Connection Pool",
          action: "Clear and reset database connection pool",
          expected_outcome: "Connection pool reset and functioning normally",
          resources: ["https://example.com/pool-reset"]
        }
      ],
      outcome: "Database connection pool reset and functioning properly"
    },
    {
      id: 13,
      title: "Firewall Rule Update",
      tags: ["Security", "Network"],
      usage: "11 tickets resolved",
      confidence: "93%",
      playbook_id: "firewall-update-013",
      description: "Update firewall rules to allow or block specific traffic",
      priority: "High",
      steps: [
        {
          step_id: 1,
          title: "Review Current Rules",
          action: "Analyze existing firewall rules and identify required changes",
          expected_outcome: "Required rule changes identified",
          resources: ["https://example.com/firewall-management"]
        },
        {
          step_id: 2,
          title: "Update Firewall Rules",
          action: "Apply new firewall rules and test connectivity",
          expected_outcome: "Firewall rules updated and traffic flowing correctly",
          resources: ["https://example.com/rule-update"]
        }
      ],
      outcome: "Firewall rules updated and network access configured correctly"
    },
    {
      id: 14,
      title: "Application Service Restart",
      tags: ["Application", "Service"],
      usage: "29 tickets resolved",
      confidence: "84%",
      playbook_id: "app-restart-014",
      description: "Restart application services to resolve issues",
      priority: "Medium",
      steps: [
        {
          step_id: 1,
          title: "Check Service Status",
          action: "Verify current service status and identify issues",
          expected_outcome: "Service issues identified",
          resources: ["https://example.com/service-monitoring"]
        },
        {
          step_id: 2,
          title: "Restart Service",
          action: "Restart application service and verify functionality",
          expected_outcome: "Service restarted and functioning normally",
          resources: ["https://example.com/service-restart"]
        }
      ],
      outcome: "Application service restarted and functioning properly"
    },
    {
      id: 15,
      title: "Disk Space Cleanup",
      tags: ["Storage", "Maintenance"],
      usage: "42 tickets resolved",
      confidence: "88%",
      playbook_id: "disk-cleanup-015",
      description: "Clean up disk space to resolve storage issues",
      priority: "Medium",
      steps: [
        {
          step_id: 1,
          title: "Analyze Disk Usage",
          action: "Identify large files and directories consuming disk space",
          expected_outcome: "Disk usage analysis completed",
          resources: ["https://example.com/disk-analysis"]
        },
        {
          step_id: 2,
          title: "Clean Up Files",
          action: "Remove unnecessary files and free up disk space",
          expected_outcome: "Disk space freed up and storage issues resolved",
          resources: ["https://example.com/disk-cleanup"]
        }
      ],
      outcome: "Disk space cleaned up and storage issues resolved"
    },
    {
      id: 16,
      title: "DNS Resolution Fix",
      tags: ["Network", "DNS"],
      usage: "14 tickets resolved",
      confidence: "90%",
      playbook_id: "dns-fix-016",
      description: "Fix DNS resolution issues affecting domain access",
      priority: "High",
      steps: [
        {
          step_id: 1,
          title: "Test DNS Resolution",
          action: "Check DNS resolution for affected domains",
          expected_outcome: "DNS resolution issues identified",
          resources: ["https://example.com/dns-testing"]
        },
        {
          step_id: 2,
          title: "Update DNS Configuration",
          action: "Fix DNS configuration and verify resolution",
          expected_outcome: "DNS resolution working correctly",
          resources: ["https://example.com/dns-config"]
        }
      ],
      outcome: "DNS resolution fixed and domain access restored"
    },
    {
      id: 17,
      title: "Database Index Rebuild",
      tags: ["Database", "Performance"],
      usage: "7 tickets resolved",
      confidence: "97%",
      playbook_id: "db-index-rebuild-017",
      description: "Rebuild database indexes to improve performance",
      priority: "Medium",
      steps: [
        {
          step_id: 1,
          title: "Analyze Index Performance",
          action: "Check database index usage and identify performance issues",
          expected_outcome: "Index performance issues identified",
          resources: ["https://example.com/index-analysis"]
        },
        {
          step_id: 2,
          title: "Rebuild Indexes",
          action: "Rebuild database indexes and monitor performance",
          expected_outcome: "Indexes rebuilt and performance improved",
          resources: ["https://example.com/index-rebuild"]
        }
      ],
      outcome: "Database indexes rebuilt and performance optimized"
    },
    {
      id: 18,
      title: "VPN Connection Troubleshooting",
      tags: ["Network", "VPN"],
      usage: "21 tickets resolved",
      confidence: "83%",
      playbook_id: "vpn-troubleshoot-018",
      description: "Troubleshoot VPN connection issues",
      priority: "High",
      steps: [
        {
          step_id: 1,
          title: "Check VPN Status",
          action: "Verify VPN service status and connection logs",
          expected_outcome: "VPN connection issues identified",
          resources: ["https://example.com/vpn-monitoring"]
        },
        {
          step_id: 2,
          title: "Restart VPN Service",
          action: "Restart VPN service and test connectivity",
          expected_outcome: "VPN service restarted and connections working",
          resources: ["https://example.com/vpn-restart"]
        }
      ],
      outcome: "VPN connection issues resolved and service functioning"
    },
    {
      id: 19,
      title: "Email Service Configuration",
      tags: ["Email", "Configuration"],
      usage: "17 tickets resolved",
      confidence: "85%",
      playbook_id: "email-config-019",
      description: "Configure email service settings and resolve delivery issues",
      priority: "Medium",
      steps: [
        {
          step_id: 1,
          title: "Check Email Service Status",
          action: "Verify email service configuration and delivery status",
          expected_outcome: "Email service issues identified",
          resources: ["https://example.com/email-monitoring"]
        },
        {
          step_id: 2,
          title: "Update Email Configuration",
          action: "Update email service settings and test delivery",
          expected_outcome: "Email service configured and delivering correctly",
          resources: ["https://example.com/email-config"]
        }
      ],
      outcome: "Email service configured and delivering messages correctly"
    },
    {
      id: 20,
      title: "Memory Leak Investigation",
      tags: ["Performance", "Memory"],
      usage: "9 tickets resolved",
      confidence: "92%",
      playbook_id: "memory-leak-020",
      description: "Investigate and resolve memory leak issues",
      priority: "High",
      steps: [
        {
          step_id: 1,
          title: "Monitor Memory Usage",
          action: "Track memory usage patterns and identify leaks",
          expected_outcome: "Memory leak source identified",
          resources: ["https://example.com/memory-monitoring"]
        },
        {
          step_id: 2,
          title: "Fix Memory Leak",
          action: "Apply fixes to resolve memory leak issues",
          expected_outcome: "Memory leak resolved and usage normalized",
          resources: ["https://example.com/memory-fix"]
        }
      ],
      outcome: "Memory leak resolved and system performance restored"
    },
    {
      id: 21,
      title: "Database Schema Migration",
      tags: ["Database", "Migration"],
      usage: "5 tickets resolved",
      confidence: "98%",
      playbook_id: "db-migration-021",
      description: "Migrate database schema to new version",
      priority: "Critical",
      steps: [
        {
          step_id: 1,
          title: "Backup Database",
          action: "Create complete backup of current database",
          expected_outcome: "Database backup created successfully",
          resources: ["https://example.com/db-backup"]
        },
        {
          step_id: 2,
          title: "Execute Migration",
          action: "Run database schema migration scripts",
          expected_outcome: "Database schema migrated successfully",
          resources: ["https://example.com/schema-migration"]
        }
      ],
      outcome: "Database schema migrated successfully with all data preserved"
    },
    {
      id: 22,
      title: "Web Server Configuration",
      tags: ["Web Server", "Configuration"],
      usage: "25 tickets resolved",
      confidence: "87%",
      playbook_id: "web-config-022",
      description: "Configure web server settings and resolve issues",
      priority: "Medium",
      steps: [
        {
          step_id: 1,
          title: "Check Web Server Status",
          action: "Verify web server configuration and service status",
          expected_outcome: "Web server issues identified",
          resources: ["https://example.com/web-monitoring"]
        },
        {
          step_id: 2,
          title: "Update Configuration",
          action: "Update web server configuration and restart service",
          expected_outcome: "Web server configured and serving content correctly",
          resources: ["https://example.com/web-config"]
        }
      ],
      outcome: "Web server configured and serving content properly"
    },
    {
      id: 23,
      title: "File System Permission Fix",
      tags: ["File System", "Permissions"],
      usage: "33 tickets resolved",
      confidence: "89%",
      playbook_id: "file-permissions-023",
      description: "Fix file system permission issues",
      priority: "Medium",
      steps: [
        {
          step_id: 1,
          title: "Check File Permissions",
          action: "Analyze current file permissions and identify issues",
          expected_outcome: "Permission issues identified",
          resources: ["https://example.com/permission-check"]
        },
        {
          step_id: 2,
          title: "Fix Permissions",
          action: "Update file permissions to correct values",
          expected_outcome: "File permissions fixed and access restored",
          resources: ["https://example.com/permission-fix"]
        }
      ],
      outcome: "File system permissions fixed and access restored"
    },
    {
      id: 24,
      title: "API Rate Limit Adjustment",
      tags: ["API", "Rate Limiting"],
      usage: "20 tickets resolved",
      confidence: "86%",
      playbook_id: "api-rate-limit-024",
      description: "Adjust API rate limiting settings",
      priority: "Medium",
      steps: [
        {
          step_id: 1,
          title: "Review Rate Limit Settings",
          action: "Check current API rate limiting configuration",
          expected_outcome: "Rate limiting issues identified",
          resources: ["https://example.com/rate-limit-monitoring"]
        },
        {
          step_id: 2,
          title: "Update Rate Limits",
          action: "Adjust API rate limiting settings",
          expected_outcome: "Rate limits updated and API functioning correctly",
          resources: ["https://example.com/rate-limit-config"]
        }
      ],
      outcome: "API rate limits adjusted and service functioning properly"
    },
    {
      id: 25,
      title: "Database Query Optimization",
      tags: ["Database", "Query"],
      usage: "12 tickets resolved",
      confidence: "94%",
      playbook_id: "db-query-opt-025",
      description: "Optimize slow database queries",
      priority: "Medium",
      steps: [
        {
          step_id: 1,
          title: "Identify Slow Queries",
          action: "Analyze database query performance and identify bottlenecks",
          expected_outcome: "Slow queries identified",
          resources: ["https://example.com/query-analysis"]
        },
        {
          step_id: 2,
          title: "Optimize Queries",
          action: "Rewrite and optimize database queries",
          expected_outcome: "Queries optimized and performance improved",
          resources: ["https://example.com/query-optimization"]
        }
      ],
      outcome: "Database queries optimized and performance improved"
    },
    {
      id: 26,
      title: "Network Port Configuration",
      tags: ["Network", "Ports"],
      usage: "18 tickets resolved",
      confidence: "91%",
      playbook_id: "network-ports-026",
      description: "Configure network ports and firewall rules",
      priority: "High",
      steps: [
        {
          step_id: 1,
          title: "Check Port Status",
          action: "Verify network port configuration and connectivity",
          expected_outcome: "Port configuration issues identified",
          resources: ["https://example.com/port-monitoring"]
        },
        {
          step_id: 2,
          title: "Update Port Configuration",
          action: "Configure network ports and update firewall rules",
          expected_outcome: "Ports configured and network access working",
          resources: ["https://example.com/port-config"]
        }
      ],
      outcome: "Network ports configured and connectivity restored"
    },
    {
      id: 27,
      title: "Application Log Analysis",
      tags: ["Logging", "Analysis"],
      usage: "26 tickets resolved",
      confidence: "88%",
      playbook_id: "log-analysis-027",
      description: "Analyze application logs to identify issues",
      priority: "Medium",
      steps: [
        {
          step_id: 1,
          title: "Collect Log Files",
          action: "Gather relevant application log files",
          expected_outcome: "Log files collected for analysis",
          resources: ["https://example.com/log-collection"]
        },
        {
          step_id: 2,
          title: "Analyze Logs",
          action: "Review logs for errors and performance issues",
          expected_outcome: "Issues identified from log analysis",
          resources: ["https://example.com/log-analysis-tools"]
        }
      ],
      outcome: "Log analysis completed and issues identified"
    },
    {
      id: 28,
      title: "Database Replication Setup",
      tags: ["Database", "Replication"],
      usage: "6 tickets resolved",
      confidence: "95%",
      playbook_id: "db-replication-028",
      description: "Set up database replication for high availability",
      priority: "Critical",
      steps: [
        {
          step_id: 1,
          title: "Prepare Replication Environment",
          action: "Configure database servers for replication",
          expected_outcome: "Replication environment prepared",
          resources: ["https://example.com/replication-setup"]
        },
        {
          step_id: 2,
          title: "Configure Replication",
          action: "Set up database replication and verify synchronization",
          expected_outcome: "Database replication configured and working",
          resources: ["https://example.com/replication-config"]
        }
      ],
      outcome: "Database replication set up and functioning correctly"
    },
    {
      id: 29,
      title: "Service Dependency Resolution",
      tags: ["Service", "Dependencies"],
      usage: "23 tickets resolved",
      confidence: "84%",
      playbook_id: "service-deps-029",
      description: "Resolve service dependency issues",
      priority: "High",
      steps: [
        {
          step_id: 1,
          title: "Map Service Dependencies",
          action: "Identify service dependencies and relationships",
          expected_outcome: "Service dependency issues identified",
          resources: ["https://example.com/dependency-mapping"]
        },
        {
          step_id: 2,
          title: "Resolve Dependencies",
          action: "Fix service dependency issues and restart services",
          expected_outcome: "Service dependencies resolved and services running",
          resources: ["https://example.com/dependency-resolution"]
        }
      ],
      outcome: "Service dependencies resolved and all services functioning"
    },
    {
      id: 30,
      title: "System Resource Monitoring",
      tags: ["Monitoring", "Resources"],
      usage: "38 tickets resolved",
      confidence: "90%",
      playbook_id: "resource-monitoring-030",
      description: "Set up and configure system resource monitoring",
      priority: "Medium",
      steps: [
        {
          step_id: 1,
          title: "Install Monitoring Tools",
          action: "Deploy system resource monitoring tools",
          expected_outcome: "Monitoring tools installed and configured",
          resources: ["https://example.com/monitoring-setup"]
        },
        {
          step_id: 2,
          title: "Configure Alerts",
          action: "Set up monitoring alerts and thresholds",
          expected_outcome: "Resource monitoring configured with alerts",
          resources: ["https://example.com/alert-configuration"]
        }
      ],
      outcome: "System resource monitoring configured and operational"
    }
  ])

  // Combine sample playbooks with saved playbooks
  const playbooks = useMemo(() => {
    return [...samplePlaybooks, ...savedPlaybooks]
  }, [samplePlaybooks, savedPlaybooks])

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
        const response = await playbookService.updatePlaybook(selectedPlaybook.id, playbookToSave)
        setSavedPlaybooks(prev => 
          prev.map(p => p.id === selectedPlaybook.id ? response.data : p)
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

  // Generate dummy incident data based on playbook type
  const generateDummyIncidentData = (playbook) => {
    const incidentTypes = {
      'Database': {
        incidentId: 'INC-DB-2024-001',
        severity: 'High',
        status: 'In Progress',
        assignedTo: 'John Smith',
        createdDate: '2024-01-15 09:30:00',
        lastUpdated: '2024-01-15 14:45:00',
        affectedSystems: ['Production Database', 'Application Server'],
        businessImpact: 'High - Customer transactions affected',
        description: 'Database cluster experiencing connection timeouts and slow query performance. Multiple users reporting failed transactions.',
        relatedTickets: ['INC-DB-2024-002', 'INC-APP-2024-015'],
        logs: [
          '2024-01-15 09:25:00 - Connection pool exhausted',
          '2024-01-15 09:30:00 - Query timeout errors detected',
          '2024-01-15 10:15:00 - Database locks detected'
        ]
      },
      'Network': {
        incidentId: 'INC-NET-2024-003',
        severity: 'Critical',
        status: 'Open',
        assignedTo: 'Sarah Johnson',
        createdDate: '2024-01-15 08:15:00',
        lastUpdated: '2024-01-15 16:20:00',
        affectedSystems: ['Load Balancer', 'Web Servers', 'API Gateway'],
        businessImpact: 'Critical - Complete service outage',
        description: 'Network connectivity issues affecting multiple services. Users unable to access the application.',
        relatedTickets: ['INC-NET-2024-004', 'INC-INFRA-2024-008'],
        logs: [
          '2024-01-15 08:10:00 - Network interface down',
          '2024-01-15 08:15:00 - Load balancer health check failed',
          '2024-01-15 08:20:00 - DNS resolution issues detected'
        ]
      },
      'Security': {
        incidentId: 'INC-SEC-2024-005',
        severity: 'Critical',
        status: 'Under Investigation',
        assignedTo: 'Mike Chen',
        createdDate: '2024-01-15 11:45:00',
        lastUpdated: '2024-01-15 17:30:00',
        affectedSystems: ['Authentication Service', 'User Portal'],
        businessImpact: 'High - Security breach detected',
        description: 'Suspicious login attempts detected from multiple IP addresses. Potential security breach in progress.',
        relatedTickets: ['INC-SEC-2024-006', 'INC-AUTH-2024-012'],
        logs: [
          '2024-01-15 11:40:00 - Multiple failed login attempts',
          '2024-01-15 11:45:00 - Unusual traffic pattern detected',
          '2024-01-15 12:00:00 - Security alert triggered'
        ]
      },
      'Payment': {
        incidentId: 'INC-PAY-2024-007',
        severity: 'High',
        status: 'In Progress',
        assignedTo: 'Lisa Wang',
        createdDate: '2024-01-15 13:20:00',
        lastUpdated: '2024-01-15 18:15:00',
        affectedSystems: ['Payment Gateway', 'Transaction Service'],
        businessImpact: 'High - Payment processing failures',
        description: 'Payment gateway integration issues causing transaction failures. Customers unable to complete purchases.',
        relatedTickets: ['INC-PAY-2024-008', 'INC-TXN-2024-020'],
        logs: [
          '2024-01-15 13:15:00 - Payment gateway timeout',
          '2024-01-15 13:20:00 - Transaction validation errors',
          '2024-01-15 13:25:00 - API rate limit exceeded'
        ]
      },
      'default': {
        incidentId: 'INC-GEN-2024-009',
        severity: 'Medium',
        status: 'Open',
        assignedTo: 'Alex Rodriguez',
        createdDate: '2024-01-15 15:00:00',
        lastUpdated: '2024-01-15 19:00:00',
        affectedSystems: ['Application Server'],
        businessImpact: 'Medium - Service degradation',
        description: 'General application issue requiring investigation and resolution.',
        relatedTickets: ['INC-GEN-2024-010'],
        logs: [
          '2024-01-15 14:55:00 - Application error detected',
          '2024-01-15 15:00:00 - Incident created'
        ]
      }
    }

    // Determine incident type based on playbook title or tags
    const title = playbook.title.toLowerCase()
    const tags = playbook.tags || []
    
    if (title.includes('database') || tags.some(tag => tag.toLowerCase().includes('database'))) {
      return incidentTypes.Database
    } else if (title.includes('network') || title.includes('connectivity') || tags.some(tag => tag.toLowerCase().includes('network'))) {
      return incidentTypes.Network
    } else if (title.includes('security') || title.includes('authentication') || tags.some(tag => tag.toLowerCase().includes('security'))) {
      return incidentTypes.Security
    } else if (title.includes('payment') || title.includes('transaction') || tags.some(tag => tag.toLowerCase().includes('payment'))) {
      return incidentTypes.Payment
    } else {
      return incidentTypes.default
    }
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
      {showViewModal && selectedPlaybook && (() => {
        const incidentData = generateDummyIncidentData(selectedPlaybook)
        return (
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
                    handleEdit(selectedPlaybook.id)
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                >
                  Edit Playbook
                </Button>
              </div>
            </div>
          </div>
        )
      })()}

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
