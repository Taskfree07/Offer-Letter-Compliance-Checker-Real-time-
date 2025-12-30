// Dynamic API URL detection - works for both local and deployed environments
function getApiBaseUrl() {
  // Priority 1: Check if running locally (localhost or 127.0.0.1)
  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    
    // LOCAL DEVELOPMENT: Use localhost backend
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0') {
      console.log('🏠 Local development mode - using localhost:5000');
      return 'http://localhost:5000';
    }

    // AZURE DEPLOYMENT: frontend.*.azurecontainerapps.io -> backend.*.azurecontainerapps.io
    if (hostname.includes('azurecontainerapps.io')) {
      const backendUrl = hostname.replace('frontend', 'backend');
      const url = `${protocol}//${backendUrl}`;
      console.log('☁️ Azure deployment detected - using backend:', url);
      return url;
    }

    // OTHER PRODUCTION: use environment variable or same hostname
    if (process.env.REACT_APP_API_URL) {
      console.log('🌐 Using REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
      return process.env.REACT_APP_API_URL;
    }

    // Fallback for other production deployments
    const url = `${protocol}//${hostname}`;
    console.log('🌐 Production deployment:', url);
    return url;
  }

  // SSR fallback
  console.log('🌐 Fallback to localhost:5000');
  return 'http://localhost:5000';
}

// API endpoint configuration
// Automatically detects URL based on environment
export const API_BASE_URL = getApiBaseUrl();

console.log('🌐 API_BASE_URL configured as:', API_BASE_URL);
