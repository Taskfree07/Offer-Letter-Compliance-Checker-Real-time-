import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef, memo } from 'react';
import { API_BASE_URL } from '../config/constants';

const OnlyOfficeViewerComponent = forwardRef(({ documentId, onSave, onVariablesUpdate, onSessionExpired, onEditorReady }, ref) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const editorRef = useRef(null);
  const docEditorRef = useRef(null);
  const containerRef = useRef(null);
  const skipNextFetch = useRef(false); // Flag to skip variable fetch after replacement

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    reloadDocument: () => {
      console.log('🔄 Reloading ONLYOFFICE document...');
      setLoading(true);
      setReloadKey(prev => prev + 1);
    },
    updateVariable: (varName, newValue) => {
      updateVariableInDocument(varName, newValue);
    },
    replaceAllVariables: (variablesObj) => {
      replaceAllVariablesInDocument(variablesObj);
    },
    highlightVariable: (variableName) => {
      highlightVariableInDocument(variableName);
    },
    isEditorReady: () => {
      return docEditorRef.current !== null && !loading;
    }
  }));

  const updateVariableInDocument = async (varName, newValue) => {
    // This method is now a placeholder - the actual replacement happens on backend
    // when replaceAllVariablesInDocument is called
    console.log(`📝 Queuing variable [${varName}] to be replaced with "${newValue}"`);
    return true;
  };

  const replaceAllVariablesInDocument = async (variablesObj) => {
    if (!docEditorRef.current || loading) {
      console.warn('Editor not ready for bulk variable replacement');
      throw new Error('Editor not ready');
    }

    try {
      console.log('🔄 Using backend to update document with variables...', variablesObj);

      // Use backend to update the document properly
      const response = await fetch(`${API_BASE_URL}/api/onlyoffice/update-variables/${documentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ variables: variablesObj }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Backend update failed');
      }

      const result = await response.json();
      console.log('✅ Backend updated successfully:', result);

      // Set flag to skip the next variable fetch
      skipNextFetch.current = true;

      // Force document to save and reload to show changes
      // But DON'T refetch variables - they're preserved in the panel
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Reload the document to show the changes
      setLoading(true);
      setReloadKey(prev => prev + 1);

      console.log('✅ Document reloading to show changes - variables preserved in panel');
      return true;

    } catch (error) {
      console.error('❌ Variable update failed:', error);
      throw new Error('Failed to update variables: ' + error.message);
    }
  };

  const highlightVariableInDocument = async (variableName) => {
    if (!docEditorRef.current || loading) {
      console.warn('Editor not ready for highlighting');
      return;
    }

    try {
      console.log('🔍 Highlighting variable:', variableName);
      
      // Search for the variable with brackets (e.g., [Name])
      const searchText = `[${variableName}]`;
      
      console.log('🔍 Will search for:', searchText);
      
      // Use createConnector to access the Document API
      if (typeof docEditorRef.current.createConnector === 'function') {
        console.log('✅ createConnector is available, creating connector...');
        
        const connector = docEditorRef.current.createConnector();
        console.log('✅ Connector created:', connector);
        
        // Use callCommand to execute code in the document context
        connector.callCommand(function(searchTerm) {
          /* global Api */
          // This code runs inside OnlyOffice Document Editor
          var oDocument = Api.GetDocument();
          
          // Search for the variable text
          var aSearch = oDocument.Search(searchTerm);
          
          if (aSearch && aSearch.length > 0) {
            // Clear any existing selection
            oDocument.RemoveSelection();
            
            // Select the first occurrence
            var oRange = aSearch[0];
            oRange.Select();
            
            // Try to highlight it
            try {
              oRange.SetHighlight("yellow");
            } catch(e) {
              console.log('⚠️ SetHighlight not available, using selection only');
            }
            
            return { success: true, found: aSearch.length };
          } else {
            return { success: false, message: "Variable not found in document" };
          }
        }, [searchText], function(result) {
          if (result && result.success) {
            console.log('✅ Variable found and highlighted');
          } else {
            console.log('❌ Variable not found');
          }
        });
        
      } else {
        console.log('⚠️ createConnector not available in embedded mode');
        
        // Alternative: Try to find and focus the iframe, then use browser's find functionality
        const iframe = document.querySelector('iframe[id^="iframeEditor"]');
        
        if (iframe && iframe.contentWindow) {
          console.log('📱 Found OnlyOffice iframe, attempting to trigger find...');
          
          // Focus the iframe so the search works within it
          iframe.contentWindow.focus();
          
          // Use the browser's native find API
          // This will highlight the text without showing the search dialog
          try {
            // Try to use the find API if available
            if (iframe.contentWindow.find) {
              iframe.contentWindow.find(searchText);
              console.log('✅ Browser find executed for:', searchText);
            }
          } catch (e) {
            console.log('⚠️ Browser find API not accessible:', e);
          }
        } else {
          console.log('❌ Could not find OnlyOffice iframe');
        }
      }
      
    } catch (error) {
      console.error('❌ Error highlighting variable:', error);
    }
  };

  // Create editor container dynamically to avoid React DOM conflicts
  useEffect(() => {
    if (!containerRef.current) return;

    // Store the container reference for cleanup
    const container = containerRef.current;

    // Create a div that React won't manage
    const editorDiv = document.createElement('div');
    editorDiv.id = 'onlyoffice-editor-container';
    editorDiv.style.width = '100%';
    editorDiv.style.height = '100%';
    container.appendChild(editorDiv);
    editorRef.current = editorDiv;

    return () => {
      // Clean up: let ONLYOFFICE clean itself up first
      if (docEditorRef.current) {
        try {
          docEditorRef.current.destroyEditor();
          docEditorRef.current = null;
        } catch (err) {
          console.error('Error destroying editor:', err);
        }
      }
      // Then remove the container
      if (container && editorDiv.parentNode === container) {
        container.removeChild(editorDiv);
      }
      editorRef.current = null;
    };
  }, []);

  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 3;

    const loadConfig = async () => {
      try {
        console.log('📄 Loading ONLYOFFICE config for document:', documentId);
        console.log('📍 Using API base URL:', API_BASE_URL);
        const response = await fetch(`${API_BASE_URL}/api/onlyoffice/config/${documentId}`);

        // Check if it's a 404 first (document not found)
        if (response.status === 404) {
          console.warn('⚠️ Document session not found (404). Session may have expired or backend was restarted.');

          // Notify parent component
          if (onSessionExpired) {
            onSessionExpired();
          }

          // Show a more helpful error message
          const expiredError = 'Document session not found.\n\nThe document is no longer available on the server.\nThis can happen if:\n• The backend was restarted\n• The session expired\n\nPlease use the "Remove Document" button and import your document again.';
          throw new Error(expiredError);
        }

        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Backend returned non-JSON response. Check if Flask backend is running on port 5000.');
        }

        const data = await response.json();
        console.log('✅ Config received:', data);

        if (!data.success) {
          // Check if error message indicates "not found"
          if (data.error && data.error.includes('not found')) {
            console.warn('⚠️ Document session not found on backend. Session may have expired or backend was restarted.');

            // Notify parent component but don't show error yet
            if (onSessionExpired) {
              onSessionExpired();
            }

            // Show a more helpful error message
            const expiredError = 'Document session not found.\n\nThe document is no longer available on the server.\nThis can happen if:\n• The backend was restarted\n• The session expired\n\nPlease use the "Remove Document" button and import your document again.';
            throw new Error(expiredError);
          }
          throw new Error(data.error || 'Failed to load configuration');
        }

        // Load ONLYOFFICE API script with retry logic
        if (!window.DocsAPI) {
          console.log('📥 Loading ONLYOFFICE API script from:', `${data.documentServerUrl}/web-apps/apps/api/documents/api.js`);
          const script = document.createElement('script');
          script.src = `${data.documentServerUrl}/web-apps/apps/api/documents/api.js`;
          script.async = true;
          script.onload = () => {
            console.log('✅ ONLYOFFICE API script loaded, DocsAPI available:', !!window.DocsAPI);
            initEditor(data);
          };
          script.onerror = (e) => {
            console.error('❌ Failed to load ONLYOFFICE API script:', e);

            // Retry if ONLYOFFICE might still be starting up
            if (retryCount < maxRetries) {
              retryCount++;
              console.log(`⏳ Retrying in 3 seconds... (Attempt ${retryCount}/${maxRetries})`);
              setTimeout(() => {
                // Remove failed script
                if (script.parentNode) {
                  script.parentNode.removeChild(script);
                }
                loadConfig();
              }, 3000);
            } else {
              setError('ONLYOFFICE Document Server is not responding.\n\nTroubleshooting steps:\n1. Check if Docker is running: docker ps\n2. Restart ONLYOFFICE: docker-compose restart onlyoffice-documentserver\n3. Wait 1-2 minutes for ONLYOFFICE to fully start\n4. Verify http://localhost:8080 is accessible\n5. Clear browser cache and refresh this page\n\nNote: "Failed to fetch" errors for SVG icons are usually harmless and can be ignored.');
            }
          };
          document.body.appendChild(script);
        } else {
          console.log('✅ ONLYOFFICE API already loaded');
          initEditor(data);
        }
      } catch (err) {
        console.error('❌ Config error:', err);

        // Better error message for common issues
        if (err.message.includes('JSON')) {
          setError('Backend connection error. Make sure:\n\n1. Flask backend is running: python python-nlp/app.py\n2. Backend is accessible at http://localhost:5000\n3. No firewall is blocking the connection');
        } else {
          setError(err.message);
        }
        setLoading(false);
      }
    };

    const initEditor = (data) => {
      console.log('🚀 Initializing ONLYOFFICE editor...');
      console.log('Editor ref:', editorRef.current);
      console.log('DocsAPI available:', !!window.DocsAPI);
      console.log('Config:', data.config);

      // Wait for DOM element to be ready
      if (!editorRef.current) {
        console.log('⏳ Editor ref not ready, waiting...');
        setTimeout(() => initEditor(data), 100);
        return;
      }

      if (!window.DocsAPI) {
        console.error('❌ DocsAPI not available');
        setError('ONLYOFFICE API not loaded');
        setLoading(false);
        return;
      }

      if (docEditorRef.current) {
        console.log('🗑️ Destroying previous editor instance');
        try {
          docEditorRef.current.destroyEditor();
          docEditorRef.current = null;
        } catch (e) {
          console.warn('Could not destroy previous editor:', e);
        }

        // Also clear the container to force a complete reload
        if (editorRef.current) {
          editorRef.current.innerHTML = '';
        }
      }

      const editorConfig = {
        ...data.config,
        width: '100%',
        height: '100%',
        editorConfig: {
          ...(data.config.editorConfig || {}),
          plugins: {
            autostart: [],
            pluginsData: []
          },
          customization: {
            ...(data.config.editorConfig?.customization || {}),
            plugins: true  // Enable plugins support
          }
        },
        events: {
          onDocumentReady: () => {
            console.log('✅ ONLYOFFICE Document Ready');
            setLoading(false);

            // Check if createConnector is available now
            console.log('🔧 Checking createConnector availability:', typeof docEditorRef.current?.createConnector);
            console.log('🔧 DocEditor methods:', Object.keys(docEditorRef.current || {}));

            // Notify parent that editor is ready
            if (onEditorReady) {
              onEditorReady();
            }

            // Only fetch variables on initial load, not after replacements
            if (skipNextFetch.current) {
              console.log('⏭️ Skipping variable fetch after replacement - keeping panel values');
              skipNextFetch.current = false; // Reset flag
            } else {
              // Initial variables fetch on document ready
              fetchVariables();
            }

            // Store reference to window for variable updates
            if (docEditorRef.current) {
              window.onlyofficeEditor = docEditorRef.current;
              console.log('🔗 ONLYOFFICE editor reference stored globally');
            }
          },
          onDocumentStateChange: (event) => {
            if (event.data) {
              console.log('📝 Document changed by user');
              // Removed automatic variable fetching to prevent excessive updates
              // fetchVariables(); 
              if (onSave) onSave();
            }
          },
          onError: (event) => {
            console.error('❌ ONLYOFFICE Editor error:', event);
            
            // Handle specific error types
            if (event && event.data) {
              const errorData = event.data;
              console.log('Error details:', errorData);
              
              // Don't show error for minor issues like missing source maps
              if (errorData.type === 'warning' || 
                  (errorData.message && errorData.message.includes('socket.io.min.js.map')) ||
                  (errorData.message && errorData.message.includes('Failed to fetch') && 
                   errorData.message.includes('svg'))) {
                console.log('Ignoring non-critical ONLYOFFICE warning:', errorData);
                return;
              }
            }
            
            setError(`Editor error: ${JSON.stringify(event)}`);
            setLoading(false);
          },
          onWarning: (event) => {
            console.warn('⚠️ ONLYOFFICE Warning (ignored):', event);
            // Don't treat warnings as errors
          },
          onRequestCompareFile: () => {
            console.log('Compare file requested');
          },
          onRequestCreateNew: () => {
            console.log('Create new requested');
          }
        }
      };

      console.log('📋 Final editor config:', editorConfig);
      console.log('🎯 Creating DocEditor with container ID:', editorRef.current.id);

      try {
        docEditorRef.current = new window.DocsAPI.DocEditor(editorRef.current.id, editorConfig);
        console.log('✅ DocEditor instance created:', docEditorRef.current);
      } catch (err) {
        console.error('❌ Error creating DocEditor:', err);
        setError(`Failed to create editor: ${err.message}`);
        setLoading(false);
      }
    };

    const fetchVariables = async () => {
      try {
        console.log('🔍 Fetching variables for document:', documentId);

        // Call the real-time extraction endpoint
        const response = await fetch(`${API_BASE_URL}/api/onlyoffice/extract-realtime/${documentId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        const data = await response.json();

        if (data.success && onVariablesUpdate) {
          console.log('✅ Variables extracted in real-time:', {
            count: data.total_variables,
            method: data.extraction_method,
            glinerEnabled: data.gliner_enabled
          });

          onVariablesUpdate(data.variables);
        } else {
          console.warn('⚠️ Variable extraction returned no success:', data);
        }
      } catch (err) {
        console.error('❌ Error fetching variables:', err);
      }
    };

    if (documentId) {
      loadConfig();
    }
  }, [documentId, reloadKey, onSave, onSessionExpired, onVariablesUpdate, onEditorReady]);

  // Use useEffect to call onSessionExpired when error occurs (outside render cycle)
  useEffect(() => {
    if (error && onSessionExpired) {
      onSessionExpired();
    }
  }, [error, onSessionExpired]);

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        backgroundColor: '#fef2f2',
        color: '#dc2626',
        padding: '40px'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '600px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <div style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px', color: '#991b1b' }}>
            Document Session Issue
          </div>
          <div style={{
            fontSize: '14px',
            marginBottom: '20px',
            color: '#7f1d1d',
            lineHeight: '1.6',
            whiteSpace: 'pre-wrap',
            textAlign: 'left',
            backgroundColor: '#fee2e2',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #fca5a5'
          }}>
            {error}
          </div>
          <div style={{
            fontSize: '13px',
            color: '#7f1d1d',
            fontWeight: '500',
            marginTop: '16px'
          }}>
            💡 Tip: Use the "Remove Document" button in the Template Editor panel (right side) to clear this document and start fresh.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', position: 'relative' }}
    >
      {loading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(245, 245, 245, 0.95)',
          zIndex: 1000
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '50px',
              height: '50px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #3498db',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }} />
            <div>Loading ONLYOFFICE Editor...</div>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        </div>
      )}
    </div>
  );
});

OnlyOfficeViewerComponent.displayName = 'OnlyOfficeViewerComponent';

// Wrap with memo to prevent unnecessary re-renders
const OnlyOfficeViewer = memo(OnlyOfficeViewerComponent);

export default OnlyOfficeViewer;


