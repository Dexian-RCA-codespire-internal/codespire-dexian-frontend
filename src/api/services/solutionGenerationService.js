import api from '../index.js'

// Solution Generation API service
export const solutionGenerationService = {
  // Generate solution based on ticket and playbooks
  async generateSolution({ currentTicket, similarTickets = [], playbooks = [] }) {
    try {
      const response = await api.post('/solution-generation/generate', {
        currentTicket,
        similarTickets,
        playbooks
      })
      return response.data
    } catch (error) {
      console.error('Error generating solution:', error)
      throw error
    }
  }
}

export default solutionGenerationService
