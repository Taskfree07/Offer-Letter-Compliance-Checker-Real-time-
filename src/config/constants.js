// API endpoint configuration
// In production (Azure), this will be set via Docker build ENV
// In development, it defaults to localhost
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';

console.log('API_BASE_URL configured as:', API_BASE_URL);
