// Dynamic API URL detection - works for both local and deployed environments
function getApiBaseUrl() {
  // Priority 1: Environment variable (set in .env or build time for Azure)
  if (process.env.REACT_APP_API_URL) {
    console.log('🌐 Using REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
    return process.env.REACT_APP_API_URL;
  }

  // Priority 2: Detect from current window location
  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;

    // Azure Container Apps: frontend.*.azurecontainerapps.io -> backend.*.azurecontainerapps.io
    if (hostname.includes('azurecontainerapps.io')) {
      const backendUrl = hostname.replace('frontend', 'backend');
      const url = `${protocol}//${backendUrl}`;
      console.log('🌐 Azure deployment detected, using backend:', url);
      return url;
    }

    // For other production deployments (not localhost)
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      // Production: use same protocol and hostname with /api prefix or direct
      const url = `${protocol}//${hostname}`;
      console.log('🌐 Production deployment detected:', url);
      return url;
    }

    // For local development, backend is on port 5000
    console.log('🌐 Local development mode, using localhost:5000');
    return 'http://127.0.0.1:5000';
  }

  // Fallback for server-side rendering or edge cases
  console.log('🌐 Fallback to localhost:5000');
  return 'http://127.0.0.1:5000';
}

// API endpoint configuration
// Automatically detects URL based on environment
export const API_BASE_URL = getApiBaseUrl();

console.log('🌐 API_BASE_URL configured as:', API_BASE_URL);
