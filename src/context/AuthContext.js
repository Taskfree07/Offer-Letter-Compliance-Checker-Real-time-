/**
 * AuthContext - Global authentication state management
 * Handles both Microsoft OAuth and traditional email/password authentication
 */
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../config/msalConfig';
import { authAPI } from '../utils/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { instance: msalInstance } = useMsal();

  // Check if user is logged in on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const accessToken = localStorage.getItem('access_token');
        const storedUser = localStorage.getItem('user');

        if (accessToken && storedUser) {
          // Validate token by fetching current user
          try {
            const response = await authAPI.getCurrentUser();
            if (response.data.success) {
              setUser(response.data.user);
            } else {
              // Token invalid, clear storage
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
              localStorage.removeItem('user');
              setUser(null);
            }
          } catch (err) {
            // Token validation failed
            console.error('Token validation failed:', err);
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Register with email and password
  const register = async (email, password, name) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authAPI.register(email, password, name);

      if (response.data.success) {
        const { user, access_token, refresh_token } = response.data;

        // Store tokens and user data
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        localStorage.setItem('user', JSON.stringify(user));

        setUser(user);
        return { success: true, user };
      } else {
        setError(response.data.error || 'Registration failed');
        return { success: false, error: response.data.error };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Login with email and password
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authAPI.login(email, password);

      if (response.data.success) {
        const { user, access_token, refresh_token } = response.data;

        // Store tokens and user data
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        localStorage.setItem('user', JSON.stringify(user));

        setUser(user);
        return { success: true, user };
      } else {
        setError(response.data.error || 'Login failed');
        return { success: false, error: response.data.error };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Login with Microsoft OAuth
  const loginWithMicrosoft = async () => {
    try {
      setLoading(true);
      setError(null);

      // Initiate Microsoft login popup
      const loginResponse = await msalInstance.loginPopup(loginRequest);

      if (loginResponse.accessToken) {
        // Verify token with backend
        const response = await authAPI.verifyMicrosoft(loginResponse.accessToken);

        if (response.data.success) {
          const { user, access_token, refresh_token } = response.data;

          // Store tokens and user data
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', refresh_token);
          localStorage.setItem('user', JSON.stringify(user));

          setUser(user);
          return { success: true, user };
        } else {
          setError(response.data.error || 'Microsoft authentication failed');
          return { success: false, error: response.data.error };
        }
      } else {
        throw new Error('No access token received from Microsoft');
      }
    } catch (err) {
      console.error('Microsoft login error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Microsoft login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      setLoading(true);

      // Call backend logout (optional - for token blacklisting if implemented)
      try {
        await authAPI.logout();
      } catch (err) {
        console.warn('Backend logout failed:', err);
      }

      // Check if user is logged in with Microsoft
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        await msalInstance.logoutPopup();
      }

      // Clear local storage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');

      setUser(null);
      setError(null);

      return { success: true };
    } catch (err) {
      console.error('Logout error:', err);
      // Even if logout fails, clear local state
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      setUser(null);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (data) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authAPI.updateProfile(data);

      if (response.data.success) {
        const updatedUser = response.data.user;
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return { success: true, user: updatedUser };
      } else {
        setError(response.data.error || 'Profile update failed');
        return { success: false, error: response.data.error };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Profile update failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    loginWithMicrosoft,
    logout,
    updateProfile,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
