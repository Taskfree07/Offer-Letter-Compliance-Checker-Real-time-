import React, { useState, useEffect, memo } from 'react';
import './VariablePanel.css';

const VariablePanel = memo(({
  variables,
  onReplaceInTemplate,
  isEditorReady = false
}) => {
  const [localVariables, setLocalVariables] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Only update localVariables if incoming variables have different keys
    // or if localVariables is empty (initial load)
    const incomingKeys = Object.keys(variables || {}).sort().join(',');
    const localKeys = Object.keys(localVariables).sort().join(',');
    
    // If keys are the same, don't reset - user might be editing
    if (incomingKeys !== localKeys || Object.keys(localVariables).length === 0) {
      setLocalVariables(variables || {});
      setHasChanges(false);
    }
  }, [variables]);

  const handleVariableEdit = (varName, newValue) => {
    const updatedVariables = {
      ...localVariables,
      [varName]: {
        ...localVariables[varName],
        value: newValue
      }
    };

    setLocalVariables(updatedVariables);
    setHasChanges(true);
  };

  const handleReplaceInTemplate = async () => {
    if (!isEditorReady) {
      alert('Document editor is not ready. Please wait a moment and try again.');
      return;
    }

    try {
      // Convert to simple format
      const simpleVariables = {};
      Object.entries(localVariables).forEach(([key, data]) => {
        if (typeof data === 'object' && data !== null) {
          simpleVariables[key] = data.value || '';
        } else {
          simpleVariables[key] = data || '';
        }
      });

      console.log('🔄 Starting lightweight variable replacement:', simpleVariables);

      if (onReplaceInTemplate) {
        // Call the lightweight replacement method
        await onReplaceInTemplate(simpleVariables);

        // Mark changes as saved
        setHasChanges(false);

        // Success notification - lightweight, no reload needed
        console.log('✅ Variables replaced successfully using lightweight method!');
        alert('✅ Variables replaced successfully!\n\nYour changes are now visible in the document.');
      }

    } catch (error) {
      console.error('❌ Error replacing variables:', error);

      // Provide helpful error message
      let errorMessage = 'Error replacing variables:\n\n';

      if (error.message.includes('not available') || error.message.includes('not ready')) {
        errorMessage += 'The editor is not ready yet. Please wait a moment and try again.';
      } else if (error.message.includes('Backend')) {
        errorMessage += 'Backend connection error. Make sure the backend server is running.\n\n';
        errorMessage += 'Details: ' + error.message;
      } else {
        errorMessage += error.message + '\n\nPlease check the console for more details.';
      }

      alert(errorMessage);
    }
  };

  // Convert variables to simple array with additional metadata
  const variablesList = Object.entries(localVariables).map(([name, data]) => {
    const varData = typeof data === 'object' ? data : { value: data || '' };
    
    return {
      name,
      value: varData.value || '',
      type: varData.type || 'bracketed_variable',
      fieldLabel: varData.field_label || varData.fieldLabel || null,
      displayName: varData.field_label || varData.fieldLabel || name
    };
  });

  return (
    <div style={{ padding: '15px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px solid #ddd' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 'bold', fontSize: '14px' }}>Variables</span>
          <span style={{ fontSize: '12px', color: isEditorReady ? '#28a745' : '#6c757d' }}>
            {isEditorReady ? 'Ready' : 'Loading...'}
          </span>
        </div>
      </div>

      {/* Variables List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {variablesList.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#6c757d', padding: '20px' }}>
            <p>No variables detected</p>
          </div>
        ) : (
          <div>
            {variablesList.map((variable, index) => (
              <div
                key={variable.name}
                style={{
                  marginBottom: '12px',
                  paddingBottom: '12px',
                  borderBottom: index < variablesList.length - 1 ? '1px solid #eee' : 'none'
                }}
              >
                {/* Display label or variable name */}
                <div style={{ 
                  fontSize: '12px', 
                  color: '#666',
                  marginBottom: '4px',
                  fontWeight: '500'
                }}>
                  {variable.fieldLabel ? (
                    <>
                      <span style={{ color: '#007bff' }}>{variable.fieldLabel}</span>
                      <span style={{ fontSize: '11px', color: '#999', marginLeft: '6px' }}>
                        ({variable.name})
                      </span>
                    </>
                  ) : (
                    <span>{variable.name}</span>
                  )}
                  {variable.type === 'labeled_field' && (
                    <span style={{
                      fontSize: '10px',
                      backgroundColor: '#e3f2fd',
                      color: '#1976d2',
                      padding: '2px 6px',
                      borderRadius: '3px',
                      marginLeft: '6px'
                    }}>
                      Field
                    </span>
                  )}
                </div>

                {/* Input field */}
                <input
                  type="text"
                  value={variable.value}
                  onChange={(e) => handleVariableEdit(variable.name, e.target.value)}
                  placeholder={variable.fieldLabel ? `Enter ${variable.fieldLabel.toLowerCase()}` : `Enter ${variable.name}`}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#007bff'}
                  onBlur={(e) => e.target.style.borderColor = '#ddd'}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        marginTop: '15px',
        paddingTop: '15px',
        borderTop: '1px solid #ddd'
      }}>
        <button
          onClick={handleReplaceInTemplate}
          disabled={!isEditorReady}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: isEditorReady ? (hasChanges ? '#007bff' : '#6c757d') : '#e9ecef',
            color: isEditorReady ? '#fff' : '#adb5bd',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            cursor: isEditorReady ? 'pointer' : 'not-allowed',
            fontWeight: '500'
          }}
        >
          Replace in Template
        </button>
        {hasChanges && (
          <p style={{
            fontSize: '12px',
            color: '#6c757d',
            textAlign: 'center',
            marginTop: '8px',
            marginBottom: 0
          }}>
            You have unsaved changes
          </p>
        )}
      </div>
    </div>
  );
});

VariablePanel.displayName = 'VariablePanel';

export default VariablePanel;
