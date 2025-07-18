// API configuration for both development and production
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
}; 