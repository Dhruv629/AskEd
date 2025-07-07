import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

export const summarizeText = async (text) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/ai/summarize`, {
      inputText: text // must match `@RequestBody SummarizeRequest inputText`
    });
    return response.data;
  } catch (error) {
    console.error('Summarization failed:', error);
    throw error;
  }
};
