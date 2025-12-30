/**
 * Microsoft Authentication Library (MSAL) Configuration
 * Uses Azure AD credentials from .env file
 */
import { PublicClientApplication } from '@azure/msal-browser';

export const msalConfig = {
  auth: {
    clientId: process.env.REACT_APP_MICROSOFT_CLIENT_ID || '',
    authority: `https://login.microsoftonline.com/${process.env.REACT_APP_MICROSOFT_TENANT_ID || 'common'}`,
    redirectUri: process.env.REACT_APP_REDIRECT_URI || 'http://localhost:3000/auth/callback',
  },
  cache: {
    cacheLocation: 'localStorage', // This configures where your cache will be stored
    storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
  }
};

// Create MSAL instance
export const msalInstance = new PublicClientApplication(msalConfig);

// Scopes for Microsoft Graph API
export const loginRequest = {
  scopes: ['User.Read', 'email', 'profile', 'openid']
};

// Optional: Additional Graph API scopes
export const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me'
};
