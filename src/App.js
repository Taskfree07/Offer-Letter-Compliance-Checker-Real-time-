import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MsalProvider } from '@azure/msal-react';
import { msalInstance } from './config/msalConfig';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import HomeScreen from './components/HomeScreen';
import OfferLetterPage from './components/OfferLetterPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import './App.css';

function App() {
  return (
    <MsalProvider instance={msalInstance}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected Routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <HomeScreen />
                </ProtectedRoute>
              } />
              <Route path="/offer-letter" element={
                <ProtectedRoute>
                  <OfferLetterPage />
                </ProtectedRoute>
              } />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </MsalProvider>
  );
}

export default App;
