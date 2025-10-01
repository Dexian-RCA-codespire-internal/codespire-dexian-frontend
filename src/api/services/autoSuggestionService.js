import api from '../index.js';

// Auto-suggestion API services
export const autoSuggestionService = {
  // Get auto-suggestion based on current text and reference
  getSuggestion: async ({ currentText, reference }) => {
    const response = await api.post('/auto-suggestion/suggest', {
      currentText,
      reference
    });
    return response.data;
  }
};
