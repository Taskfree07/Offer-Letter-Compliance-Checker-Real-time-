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
    setLocalVariables(variables || {});
    setHasChanges(false);
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

      console.log('🔄 Starting variable replacement:', simpleVariables);

      if (onReplaceInTemplate) {
        // Show loading state
        const originalButton = document.activeElement;

        await onReplaceInTemplate(simpleVariables);

        setHasChanges(false);
        alert('✅ Variables replaced successfully!\n\nThe document is reloading to show your changes.');
      }

    } catch (error) {
      console.error('❌ Error replacing variables:', error);
      alert(`Error replacing variables:\n\n${error.message}\n\nPlease check the console for more details.`);
    }
  };

  // Convert variables to simple array
  const variablesList = Object.entries(localVariables).map(([name, data]) => ({
    name,
    value: typeof data === 'object' ? (data.value || '') : (data || '')
  }));

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
                  marginBottom: '10px',
                  paddingBottom: '10px',
                  borderBottom: index < variablesList.length - 1 ? '1px solid #eee' : 'none'
                }}
              >
                {/* Variable Name | Input */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    fontSize: '13px',
                    fontFamily: 'monospace',
                    minWidth: '150px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {variable.name}
                  </span>
                  <span style={{ color: '#ccc' }}>|</span>
                  <input
                    type="text"
                    value={variable.value}
                    onChange={(e) => handleVariableEdit(variable.name, e.target.value)}
                    style={{
                      flex: 1,
                      padding: '5px 8px',
                      border: '1px solid #ddd',
                      borderRadius: '3px',
                      fontSize: '13px',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>
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
