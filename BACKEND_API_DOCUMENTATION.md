# Playbook API Documentation

This document outlines the backend API endpoints required for the Playbook Recommender functionality.

## Base URL
```
http://localhost:8081/api
```

## Authentication
All endpoints require authentication. Include the authentication token in the request headers:
```
Authorization: Bearer <token>
```

## Endpoints

### 1. Get All Playbooks
**GET** `/playbooks`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "playbook_id": "PB-123456-ABC",
      "title": "Database Restart Procedure",
      "description": "Steps to restart database cluster",
      "priority": "High",
      "tags": ["Database", "Custom"],
      "usage": "5 tickets resolved",
      "confidence": "90%",
      "steps": [
        {
          "step_id": 1,
          "title": "Check Database Status",
          "action": "Verify current database cluster status",
          "expected_outcome": "Identify if cluster is healthy",
          "resources": ["https://example.com/db-status"]
        }
      ],
      "outcome": "Database cluster restarted successfully",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### 2. Get Playbook by ID
**GET** `/playbooks/{id}`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "playbook_id": "PB-123456-ABC",
    "title": "Database Restart Procedure",
    "description": "Steps to restart database cluster",
    "priority": "High",
    "tags": ["Database", "Custom"],
    "usage": "5 tickets resolved",
    "confidence": "90%",
    "steps": [
      {
        "step_id": 1,
        "title": "Check Database Status",
        "action": "Verify current database cluster status",
        "expected_outcome": "Identify if cluster is healthy",
        "resources": ["https://example.com/db-status"]
      }
    ],
    "outcome": "Database cluster restarted successfully",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

### 3. Create New Playbook
**POST** `/playbooks`

**Request Body:**
```json
{
  "playbook_id": "PB-789123-XYZ",
  "title": "Network Troubleshooting",
  "description": "Steps to diagnose network issues",
  "priority": "Medium",
  "tags": ["Network", "Custom"],
  "usage": "0 tickets resolved",
  "confidence": "85%",
  "steps": [
    {
      "step_id": 1,
      "title": "Check Network Interface",
      "action": "Verify network interface status",
      "expected_outcome": "Identify network connectivity issues",
      "resources": ["https://example.com/network-tools"]
    }
  ],
  "outcome": "Network connectivity restored"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "playbook_id": "PB-789123-XYZ",
    "title": "Network Troubleshooting",
    "description": "Steps to diagnose network issues",
    "priority": "Medium",
    "tags": ["Network", "Custom"],
    "usage": "0 tickets resolved",
    "confidence": "85%",
    "steps": [
      {
        "step_id": 1,
        "title": "Check Network Interface",
        "action": "Verify network interface status",
        "expected_outcome": "Identify network connectivity issues",
        "resources": ["https://example.com/network-tools"]
      }
    ],
    "outcome": "Network connectivity restored",
    "created_at": "2024-01-15T11:00:00Z",
    "updated_at": "2024-01-15T11:00:00Z"
  }
}
```

### 4. Update Playbook
**PUT** `/playbooks/{id}`

**Request Body:** (Same as create, but with updated data)

**Response:** (Same as create response)

### 5. Delete Playbook
**DELETE** `/playbooks/{id}`

**Response:**
```json
{
  "success": true,
  "message": "Playbook deleted successfully"
}
```

### 6. Search Playbooks
**GET** `/playbooks/search`

**Query Parameters:**
- `tags`: Comma-separated list of tags
- `priority`: Priority level (Low, Medium, High, Critical)
- `search`: Text search in title and description

**Example:** `/playbooks/search?tags=Database,Network&priority=High&search=troubleshoot`

**Response:** (Same as get all playbooks)

## Error Responses

All endpoints return error responses in this format:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `404`: Not Found
- `500`: Internal Server Error

## Database Schema

### Playbooks Table
```sql
CREATE TABLE playbooks (
  id SERIAL PRIMARY KEY,
  playbook_id VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(20) NOT NULL,
  tags JSON,
  usage VARCHAR(100),
  confidence VARCHAR(10),
  steps JSON,
  outcome TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Steps JSON Structure
```json
[
  {
    "step_id": 1,
    "title": "Step Title",
    "action": "What to do",
    "expected_outcome": "Expected result",
    "resources": ["url1", "url2"]
  }
]
```

## Implementation Notes

1. **Validation**: Validate all required fields before saving
2. **Unique IDs**: Ensure playbook_id is unique
3. **JSON Fields**: Store tags and steps as JSON in the database
4. **Timestamps**: Automatically set created_at and updated_at
5. **Error Handling**: Return appropriate error messages for validation failures
6. **Pagination**: Consider implementing pagination for large datasets
7. **Search**: Implement full-text search for title and description fields

