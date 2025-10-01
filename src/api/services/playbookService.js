import api from '../index.js'

// Playbook API service
export const playbookService = {
  // Get all playbooks
  async getPlaybooks() {
    try {
      const response = await api.get('/v1/playbooks')
      return response.data
    } catch (error) {
      console.error('Error fetching playbooks:', error)
      throw error
    }
  },

  // Get playbook by ID
  async getPlaybookById(id) {
    try {
      const response = await api.get(`/v1/playbooks/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching playbook:', error)
      throw error
    }
  },

  // Create new playbook
  async createPlaybook(playbookData) {
    try {
      const response = await api.post('/v1/playbooks', playbookData)
      return response.data
    } catch (error) {
      console.error('Error creating playbook:', error)
      throw error
    }
  },

  // Update existing playbook
  async updatePlaybook(id, playbookData) {
    try {
      const response = await api.put(`/v1/playbooks/${id}`, playbookData)
      return response.data
    } catch (error) {
      console.error('Error updating playbook:', error)
      throw error
    }
  },

  // Delete playbook
  async deletePlaybook(id) {
    try {
      const response = await api.delete(`/v1/playbooks/${id}`)
      return response.data
    } catch (error) {
      console.error('Error deleting playbook:', error)
      throw error
    }
  },

  // Get playbooks by tags
  async getPlaybooksByTags(tags) {
    try {
      const response = await api.get('/v1/playbooks/search', {
        params: { tags: tags.join(',') }
      })
      return response.data
    } catch (error) {
      console.error('Error searching playbooks by tags:', error)
      throw error
    }
  },

  // Get playbooks by priority
  async getPlaybooksByPriority(priority) {
    try {
      const response = await api.get('/v1/playbooks/search', {
        params: { priority }
      })
      return response.data
    } catch (error) {
      console.error('Error searching playbooks by priority:', error)
      throw error
    }
  },

  // Search playbooks using vector similarity
  async searchPlaybooksByVector(query, options = {}) {
    try {
      const params = { query }
      if (options.topK) params.topK = options.topK
      if (options.minScore) params.minScore = options.minScore
      if (options.filters?.priority) params.priority = options.filters.priority
      if (options.filters?.tags) params.tags = options.filters.tags.join(',')

      const response = await api.get('/v1/playbooks/search/vector', { params })
      return response.data
    } catch (error) {
      console.error('Error searching playbooks by vector:', error)
      throw error
    }
  },

  // Hybrid search combining text and vector similarity
  async hybridSearchPlaybooks(query, options = {}) {
    try {
      const params = { query }
      if (options.vectorWeight) params.vectorWeight = options.vectorWeight
      if (options.textWeight) params.textWeight = options.textWeight
      if (options.maxResults) params.maxResults = options.maxResults
      if (options.filters?.priority) params.priority = options.filters.priority
      if (options.filters?.tags) params.tags = options.filters.tags.join(',')

      const response = await api.get('/v1/playbooks/search/hybrid', { params })
      return response.data
    } catch (error) {
      console.error('Error performing hybrid playbook search:', error)
      throw error
    }
  },

  // Increment usage count for a playbook
  async incrementUsage(playbookId) {
    try {
      const response = await api.post(`/v1/playbooks/${playbookId}/increment-usage`)
      return response.data
    } catch (error) {
      console.error('Error incrementing playbook usage:', error)
      throw error
    }
  }
}

export default playbookService
