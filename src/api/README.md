# API Services Documentation

This directory contains all API service modules for the Codespire Dexian Frontend application. The API services are organized by functionality and provide a clean, consistent interface for making HTTP requests to the backend.

## Structure

```
src/api/
├── index.js                 # Main API configuration and exports
├── rcaService.js           # Legacy RCA service (for backward compatibility)
├── services/               # Organized API service modules
│   ├── authService.js      # Authentication and user management
│   ├── clientService.js    # Client management
│   ├── rcaService.js       # Root Cause Analysis
│   ├── ticketService.js    # Ticket management
│   ├── dashboardService.js # Dashboard data and analytics
│   ├── integrationService.js # Third-party integrations
│   ├── aiService.js        # AI and machine learning services
│   ├── notificationService.js # Notifications and alerts
│   └── auditService.js     # Audit logs and compliance
└── README.md              # This documentation
```

## Usage

### Import Services

```javascript
// Import individual services
import { authService, clientService, rcaService } from '@/api'

// Or import specific service
import { authService } from '@/api/services/authService.js'

// Or import the axios instance directly
import api from '@/api'
```

### Example Usage

#### Authentication Service
```javascript
import { authService } from '@/api'

// Login user
const loginUser = async (credentials) => {
  try {
    const response = await authService.login(credentials)
    return response
  } catch (error) {
    console.error('Login failed:', error)
    throw error
  }
}

// Get current user
const getCurrentUser = async () => {
  try {
    const user = await authService.getCurrentUser()
    return user
  } catch (error) {
    console.error('Failed to get user:', error)
    throw error
  }
}
```

#### Client Service
```javascript
import { clientService } from '@/api'

// Fetch clients with pagination
const fetchClients = async (page = 1, limit = 20) => {
  try {
    const clients = await clientService.fetchClients({ page, limit })
    return clients
  } catch (error) {
    console.error('Failed to fetch clients:', error)
    throw error
  }
}

// Create new client
const createClient = async (clientData) => {
  try {
    const newClient = await clientService.createClient(clientData)
    return newClient
  } catch (error) {
    console.error('Failed to create client:', error)
    throw error
  }
}
```

#### RCA Service
```javascript
import { rcaService } from '@/api'

// Fetch RCA cases
const fetchRCACases = async (filters = {}) => {
  try {
    const cases = await rcaService.fetchRCACases(filters)
    return cases
  } catch (error) {
    console.error('Failed to fetch RCA cases:', error)
    throw error
  }
}

// Update RCA case status
const updateCaseStatus = async (caseId, status, notes) => {
  try {
    const updatedCase = await rcaService.updateRCACaseStatus({ caseId, status, notes })
    return updatedCase
  } catch (error) {
    console.error('Failed to update case status:', error)
    throw error
  }
}
```

#### Integration Service
```javascript
import { integrationService } from '@/api'

// Get ServiceNow tickets
const getServiceNowTickets = async (params = {}) => {
  try {
    const tickets = await integrationService.servicenow.getTickets(params)
    return tickets
  } catch (error) {
    console.error('Failed to fetch ServiceNow tickets:', error)
    throw error
  }
}

// Test integration connection
const testConnection = async (integrationId) => {
  try {
    const result = await integrationService.testIntegration(integrationId)
    return result
  } catch (error) {
    console.error('Integration test failed:', error)
    throw error
  }
}
```

#### AI Service
```javascript
import { aiService } from '@/api'

// Get AI RCA recommendations
const getAIRecommendations = async (caseId) => {
  try {
    const recommendations = await aiService.rcaGuidance.getRecommendations(caseId)
    return recommendations
  } catch (error) {
    console.error('Failed to get AI recommendations:', error)
    throw error
  }
}

// Detect patterns
const detectPatterns = async (data) => {
  try {
    const patterns = await aiService.patternDetection.detectPatterns(data)
    return patterns
  } catch (error) {
    console.error('Pattern detection failed:', error)
    throw error
  }
}
```

## Service Modules

### AuthService
Handles all authentication-related operations:
- User login/logout
- Registration
- Password reset
- OTP verification
- Profile management

### ClientService
Manages client data and operations:
- CRUD operations for clients
- Client statistics
- Client integrations
- Search functionality

### RCAService
Root Cause Analysis operations:
- RCA case management
- Workflow management
- Case assignments
- Comments and attachments
- Case completion

### TicketService
Ticket management across different platforms:
- Ticket CRUD operations
- Status updates
- Comments and attachments
- Bulk operations
- Export functionality

### DashboardService
Dashboard data and analytics:
- Overview statistics
- Performance metrics
- Recent activities
- Widget configuration
- Filter management

### IntegrationService
Third-party platform integrations:
- ServiceNow integration
- Jira integration
- Zendesk integration
- Remedy integration
- Integration testing and management

### AIService
AI and machine learning features:
- RCA guidance and recommendations
- Pattern detection
- Alert correlation
- Playbook recommendations
- Predictive analytics

### NotificationService
Notification management:
- User notifications
- Notification preferences
- Templates
- Bulk notifications

### AuditService
Audit and compliance:
- Audit logs
- Compliance reports
- User activity tracking
- System audit logs
- Compliance standards

## Error Handling

All services include proper error handling. Errors are automatically logged to the console and re-thrown for component-level handling.

## Configuration

The API base URL is configured via environment variables:
- `VITE_API_URL`: The base URL for the API (defaults to `http://localhost:8081/api`)

## Best Practices

1. **Always use try-catch blocks** when calling API services
2. **Handle loading states** in your components
3. **Implement proper error boundaries** for better UX
4. **Use the service methods** instead of direct axios calls
5. **Follow the established patterns** for consistency

## Adding New Services

To add a new service:

1. Create a new file in `src/api/services/`
2. Follow the established pattern with proper error handling
3. Export the service from `src/api/index.js`
4. Update this README with documentation

## Legacy Support

The original `rcaService.js` is maintained for backward compatibility. New code should use the services in the `services/` directory.
