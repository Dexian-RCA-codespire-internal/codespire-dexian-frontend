import api from '../api/index'

class ChartBotApiService {
  // Generate chart
  async generateChart(data, options = {}) {
    try {
      const response = await api.post('/chart/generate', {
        data,
        options
      })
      return response.data
    } catch (error) {
      console.error('Chart generation error:', error)
      throw new Error(error.response?.data?.error || 'Failed to generate chart')
    }
  }

  // Analyze data
  async analyzeData(data) {
    try {
      const response = await api.post('/chart/analyze', {
        data
      })
      return response.data
    } catch (error) {
      console.error('Data analysis error:', error)
      throw new Error(error.response?.data?.error || 'Failed to analyze data')
    }
  }

  // Generate smart chart with AI recommendations
  async generateSmartChart(data, preferences = {}) {
    try {
      const response = await api.post('/chart/smart', {
        data,
        preferences
      })
      return response.data
    } catch (error) {
      console.error('Smart chart generation error:', error)
      throw new Error(error.response?.data?.error || 'Failed to generate smart chart')
    }
  }

  // Get available chart types
  async getChartTypes() {
    try {
      const response = await api.get('/chart/types')
      return response.data
    } catch (error) {
      console.error('Get chart types error:', error)
      throw new Error(error.response?.data?.error || 'Failed to get chart types')
    }
  }

  // Test chart bot connection
  async testConnection() {
    try {
      const response = await api.get('/chart/test')
      return response.data
    } catch (error) {
      console.error('Test connection error:', error)
      throw new Error(error.response?.data?.error || 'Failed to test connection')
    }
  }

  // Get chart bot info
  async getInfo() {
    try {
      const response = await api.get('/chart/info')
      return response.data
    } catch (error) {
      console.error('Get info error:', error)
      throw new Error(error.response?.data?.error || 'Failed to get chart bot info')
    }
  }
}

export default new ChartBotApiService()
