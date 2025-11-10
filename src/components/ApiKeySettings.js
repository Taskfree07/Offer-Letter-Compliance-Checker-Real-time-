import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { isApiKeyConfigured, updateDeepSeekApiKey, getApiConfig } from '../config/apiConfig';

/**
 * API Key Settings Component
 * Allows users to configure their DeepSeek API key for AI-powered compliance analysis
 */
const ApiKeySettings = ({ onClose, onSave }) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    // Check if API key is already configured
    const configured = isApiKeyConfigured('deepseek');
    setIsConfigured(configured);

    // Load the current key (masked)
    if (configured) {
      const config = getApiConfig('deepseek');
      const maskedKey = maskApiKey(config.apiKey);
      setApiKey(maskedKey);
    }
  }, []);

  const maskApiKey = (key) => {
    if (!key || key.length < 8) return key;
    const start = key.substring(0, 7);
    const end = key.substring(key.length - 4);
    return `${start}${'*'.repeat(Math.max(0, key.length - 11))}${end}`;
  };

  const handleSave = async () => {
    if (!apiKey || apiKey.trim().length === 0) {
      setMessage({ type: 'error', text: 'Please enter a valid API key' });
      return;
    }

    // Don't save if the key is masked (user didn't change it)
    if (apiKey.includes('*')) {
      setMessage({ type: 'info', text: 'API key already configured. No changes made.' });
      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      // Save the API key
      updateDeepSeekApiKey(apiKey.trim());

      // Test the API key with a simple request
      const config = getApiConfig('deepseek');
      const testResponse = await fetch(`${config.baseUrl}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`,
        },
      });

      if (!testResponse.ok) {
        throw new Error('Invalid API key. Please check and try again.');
      }

      setMessage({ type: 'success', text: 'API key saved and verified successfully!' });
      setIsConfigured(true);

      // Callback to parent
      if (onSave) {
        onSave(apiKey.trim());
      }

      // Auto-close after success
      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);

    } catch (error) {
      console.error('API key validation error:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Failed to verify API key. Please check and try again.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Key size={24} color="white" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#1e293b' }}>
                DeepSeek API Configuration
              </h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#64748b' }}>
                Configure AI-powered compliance analysis
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>
          {/* Instructions */}
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
          }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
              How to get your DeepSeek API key:
            </h4>
            <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>
              <li>Visit <a
                href="https://platform.deepseek.com/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#3b82f6', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                DeepSeek Platform
                <ExternalLink size={12} />
              </a></li>
              <li>Sign up or log in to your account</li>
              <li>Navigate to API Keys section</li>
              <li>Create a new API key</li>
              <li>Copy and paste it below</li>
            </ol>
          </div>

          {/* Status indicator */}
          {isConfigured && !apiKey.includes('*') && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px',
              backgroundColor: '#d4edda',
              border: '1px solid #c3e6cb',
              borderRadius: '8px',
              marginBottom: '16px',
              color: '#155724',
              fontSize: '14px',
            }}>
              <CheckCircle size={18} />
              <span>API key is currently configured and active</span>
            </div>
          )}

          {/* API Key Input */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#334155',
            }}>
              DeepSeek API Key
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                style={{
                  width: '100%',
                  padding: '12px 44px 12px 12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'monospace',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
              />
              <button
                onClick={() => setShowKey(!showKey)}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#64748b',
                }}
              >
                {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#64748b' }}>
              Your API key is stored locally and never sent to our servers
            </p>
          </div>

          {/* Message */}
          {message && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px',
              backgroundColor: message.type === 'success' ? '#d4edda' :
                              message.type === 'error' ? '#f8d7da' : '#d1ecf1',
              border: `1px solid ${message.type === 'success' ? '#c3e6cb' :
                      message.type === 'error' ? '#f5c6cb' : '#bee5eb'}`,
              color: message.type === 'success' ? '#155724' :
                    message.type === 'error' ? '#721c24' : '#0c5460',
              fontSize: '14px',
            }}>
              {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              <span>{message.text}</span>
            </div>
          )}

          {/* Security Note */}
          <div style={{
            backgroundColor: '#fef3c7',
            border: '1px solid #fde68a',
            borderRadius: '8px',
            padding: '12px',
            fontSize: '13px',
            color: '#92400e',
            lineHeight: '1.5',
          }}>
            <strong>Security Note:</strong> Your API key is stored in your browser's local storage.
            Never share your API key with others or commit it to version control.
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
        }}>
          <button
            onClick={onClose}
            disabled={isSaving}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: 'white',
              color: '#475569',
              fontSize: '14px',
              fontWeight: '500',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              opacity: isSaving ? 0.6 : 1,
              transition: 'all 0.2s',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !apiKey || apiKey.trim().length === 0}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              cursor: (isSaving || !apiKey) ? 'not-allowed' : 'pointer',
              opacity: (isSaving || !apiKey) ? 0.6 : 1,
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {isSaving ? (
              <>
                <div style={{
                  width: '14px',
                  height: '14px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white',
                  borderRadius: '50%',
                  animation: 'spin 0.6s linear infinite',
                }} />
                Verifying...
              </>
            ) : (
              <>
                <CheckCircle size={16} />
                Save & Verify
              </>
            )}
          </button>
        </div>

        {/* CSS for spinner animation */}
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default ApiKeySettings;
