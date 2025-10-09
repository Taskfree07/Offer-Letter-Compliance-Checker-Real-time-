import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';

const OnlyOfficeViewer = forwardRef(({ documentId, onSave, onVariablesUpdate }, ref) => {
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
    editorDiv.style.minHeight = '600px';
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
    const loadConfig = async () => {
      try {
        console.log('📄 Loading ONLYOFFICE config for document:', documentId);
        const response = await fetch(`http://localhost:5000/api/onlyoffice/config/${documentId}`);
        const data = await response.json();

        console.log('✅ Config received:', data);

        if (!data.success) {
          throw new Error(data.error || 'Failed to load configuration');
        }

        setConfig(data);

        // Load ONLYOFFICE API script
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
            setError('Failed to load ONLYOFFICE. Make sure Docker is running: docker-compose up -d');
          };
          document.body.appendChild(script);
        } else {
          console.log('✅ ONLYOFFICE API already loaded');
          initEditor(data);
        }
      } catch (err) {
        console.error('❌ Config error:', err);
        setError(err.message);
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
        const response = await fetch(`http://localhost:5000/api/onlyoffice/variables/${documentId}`);
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

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        backgroundColor: '#fff3f3',
        color: '#d32f2f',
        padding: '20px'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '500px' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>
            Error Loading Editor
          </div>
          <div style={{ fontSize: '14px', marginBottom: '16px' }}>{error}</div>
          <div style={{ fontSize: '12px', color: '#666', backgroundColor: '#f5f5f5', padding: '12px', borderRadius: '4px', textAlign: 'left' }}>
            <strong>Setup Instructions:</strong><br/>
            1. Run: <code>docker-compose up -d</code><br/>
            2. Wait for ONLYOFFICE to start (http://localhost:8080)<br/>
            3. Reload this page
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', minHeight: '800px', position: 'relative' }}
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
