// API Configuration for AI Services
// This file stores API keys and endpoints for external services

/**
 * DeepSeek API Configuration
 *
 * To use DeepSeek API:
 * 1. Get your API key from: https://platform.deepseek.com/
 * 2. Replace 'YOUR_DEEPSEEK_API_KEY_HERE' below with your actual key
 * 3. Save this file
 *
 * IMPORTANT: Never commit your API keys to version control!
 * Add this file to .gitignore if not already added.
 */

const API_CONFIG = {
  // DeepSeek API for AI-powered compliance analysis
  deepseek: {
    apiKey: 'YOUR_DEEPSEEK_API_KEY_HERE',
    baseUrl: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat', // Or 'deepseek-coder' depending on your needs
    timeout: 30000, // 30 seconds timeout
  },

  // Backend API endpoint (use environment variable or default to Azure)
  backend: {
    baseUrl: process.env.REACT_APP_API_URL || 'https://backend.reddesert-f6724e64.centralus.azurecontainerapps.io',
  },
};

/**
 * Check if API key is configured
 * @param {string} service - Service name ('deepseek', etc.)
 * @returns {boolean} - True if API key is configured
 */
export const isApiKeyConfigured = (service = 'deepseek') => {
  const config = API_CONFIG[service];
  return config?.apiKey &&
         config.apiKey !== 'YOUR_DEEPSEEK_API_KEY_HERE' &&
         config.apiKey.trim().length > 0;
};

/**
 * Get API configuration for a service
 * @param {string} service - Service name
 * @returns {object} - API configuration
 */
export const getApiConfig = (service = 'deepseek') => {
  return API_CONFIG[service];
};

/**
 * Update DeepSeek API key at runtime
 * @param {string} apiKey - New API key
 */
export const updateDeepSeekApiKey = (apiKey) => {
  API_CONFIG.deepseek.apiKey = apiKey;
  // Store in localStorage for persistence
  try {
    localStorage.setItem('deepseek_api_key', apiKey);
  } catch (error) {
    console.error('Failed to store API key:', error);
  }
};

/**
 * Load API key from localStorage on initialization
 */
const loadStoredApiKey = () => {
  try {
    const storedKey = localStorage.getItem('deepseek_api_key');
    if (storedKey && storedKey.trim().length > 0) {
      API_CONFIG.deepseek.apiKey = storedKey;
    }
  } catch (error) {
    console.error('Failed to load stored API key:', error);
  }
};

// Load stored API key on module initialization
loadStoredApiKey();

export default API_CONFIG;
