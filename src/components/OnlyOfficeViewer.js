import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';

const OnlyOfficeViewer = forwardRef(({ documentId, onSave, onVariablesUpdate, onSessionExpired }, ref) => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const editorRef = useRef(null);
  const docEditorRef = useRef(null);
  const containerRef = useRef(null);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    reloadDocument: () => {
      console.log('🔄 Reloading ONLYOFFICE document...');
      setLoading(true);
      setReloadKey(prev => prev + 1);
    },
    updateVariable: (varName, newValue) => {
      console.log(`📝 Updating variable [${varName}] to "${newValue}" in real-time`);

      // Use ONLYOFFICE JavaScript API to update the document
      if (docEditorRef.current && window.Asc) {
        try {
          // Call connector to update text in document
          docEditorRef.current.serviceCommand('setMailMergeRecipients', {
            [varName]: newValue
          });

          console.log(`✅ Variable [${varName}] updated successfully`);
        } catch (err) {
          console.warn('Direct API update failed, using document replacement:', err);

          // Fallback: trigger backend update and reload
          setReloadKey(prev => prev + 1);
        }
      } else {
        console.log('⚠️ ONLYOFFICE API not ready, will reload document');
        setReloadKey(prev => prev + 1);
      }
    }
  }));

  // Create editor container dynamically to avoid React DOM conflicts
  useEffect(() => {
    if (!containerRef.current) return;

    // Create a div that React won't manage
    const editorDiv = document.createElement('div');
    editorDiv.id = 'onlyoffice-editor-container';
    editorDiv.style.width = '100%';
    editorDiv.style.height = '100%';
    containerRef.current.appendChild(editorDiv);
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
      if (containerRef.current && editorDiv.parentNode === containerRef.current) {
        containerRef.current.removeChild(editorDiv);
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
        const response = await fetch(`http://127.0.0.1:5000/api/onlyoffice/config/${documentId}`);

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

        setConfig(data);

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
              setError('ONLYOFFICE Document Server is not responding. Please ensure Docker is running:\n\n1. Run: docker-compose up -d\n2. Wait 1-2 minutes for ONLYOFFICE to fully start\n3. Check http://localhost:8080 is accessible\n4. Refresh this page');
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
        } catch (e) {
          console.warn('Could not destroy previous editor:', e);
        }
      }

      const editorConfig = {
        ...data.config,
        width: '100%',
        height: '100%',
        events: {
          onDocumentReady: () => {
            console.log('✅ ONLYOFFICE Document Ready');
            setLoading(false);
            fetchVariables();

            // Store reference to window for variable updates
            if (docEditorRef.current) {
              window.onlyofficeEditor = docEditorRef.current;
              console.log('🔗 ONLYOFFICE editor reference stored globally');
            }
          },
          onDocumentStateChange: (event) => {
            if (event.data) {
              console.log('📝 Document changed by user');
              fetchVariables();
              if (onSave) onSave();
            }
          },
          onError: (event) => {
            console.error('❌ ONLYOFFICE Editor error:', event);
            setError(`Editor error: ${JSON.stringify(event)}`);
            setLoading(false);
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
        const response = await fetch(`http://127.0.0.1:5000/api/onlyoffice/variables/${documentId}`);
        const data = await response.json();
        if (data.success && onVariablesUpdate) {
          onVariablesUpdate(data.variables);
        }
      } catch (err) {
        console.error('Error fetching variables:', err);
      }
    };

    if (documentId) {
      loadConfig();
    }
  }, [documentId, reloadKey]);

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

OnlyOfficeViewer.displayName = 'OnlyOfficeViewer';

export default OnlyOfficeViewer;
