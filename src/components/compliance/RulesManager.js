// /src/components/compliance/RulesManager.js
// Component for managing and adding new compliance rules

import React, { useState } from 'react';
import { BookOpen, AlertCircle } from 'lucide-react';

const RulesManager = ({ 
  selectedState, 
  currentRules, 
  onRulesUpdate, 
  onClose 
}) => {
  const [newRuleData, setNewRuleData] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  // Validate JSON format
  const validateRuleJSON = (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      
      // Check if it's an object
      if (typeof parsed !== 'object' || Array.isArray(parsed)) {
        return { valid: false, error: 'Must be a valid JSON object' };
      }

      // Validate each rule has required properties
      for (const ruleName in parsed) {
        const rule = parsed[ruleName];
        
        if (!rule.severity || !['error', 'warning', 'info'].includes(rule.severity)) {
          return { valid: false, error: `Rule "${ruleName}" must have severity: "error", "warning", or "info"` };
        }
        
        if (!rule.message || typeof rule.message !== 'string') {
          return { valid: false, error: `Rule "${ruleName}" must have a message string` };
        }
        
        if (!rule.flaggedPhrases || !Array.isArray(rule.flaggedPhrases) || rule.flaggedPhrases.length === 0) {
          return { valid: false, error: `Rule "${ruleName}" must have flaggedPhrases array with at least one phrase` };
        }
      }

      return { valid: true, error: null };
    } catch (error) {
      return { valid: false, error: 'Invalid JSON format: ' + error.message };
    }
  };

  // Handle adding new rule
  const handleAddRule = () => {
    setIsValidating(true);
    setValidationError('');

    const validation = validateRuleJSON(newRuleData);
    
    if (!validation.valid) {
      setValidationError(validation.error);
      setIsValidating(false);
      return;
    }

    try {
      const parsedRule = JSON.parse(newRuleData);
      
      const updatedRules = { ...currentRules };
      if (!updatedRules[selectedState]) {
        updatedRules[selectedState] = { 
          state: selectedState,
          lastUpdated: new Date().toISOString().split('T')[0],
          rules: {} 
        };
      }
      
      // Add timestamp and source info to each rule
      Object.keys(parsedRule).forEach(ruleKey => {
        parsedRule[ruleKey] = {
          ...parsedRule[ruleKey],
          dateAdded: new Date().toISOString(),
          source: parsedRule[ruleKey].source || 'Manual Entry'
        };
      });
      
      Object.assign(updatedRules[selectedState].rules, parsedRule);
      
      onRulesUpdate(updatedRules);
      setNewRuleData('');
      setIsValidating(false);
      
      alert(`Successfully added ${Object.keys(parsedRule).length} rule(s) for ${selectedState}!`);
    } catch (error) {
      setValidationError('Error adding rule: ' + error.message);
      setIsValidating(false);
    }
  };

  // Example rule format
  const exampleRule = `{
  "exampleRule": {
    "severity": "error",
    "message": "Description of what this rule checks",
    "lawReference": "Legal citation (e.g., California Labor Code Section 123)",
    "source": "Website or document name",
    "actionRequired": "What action is needed to fix this",
    "flaggedPhrases": ["phrase1", "phrase2", "phrase3"],
    "suggestion": "How to fix the issue",
    "alternativeLanguage": "Suggested replacement text"
  }
}`;

  return (
    <div className="rules-manager">
      <div className="rules-header">
        <h4>
          <BookOpen size={16} /> Rules Management for {selectedState}
        </h4>
        <p>Add new compliance rules extracted from legal websites below:</p>
      </div>

      <div className="add-rule-form">
        <div className="form-group">
          <label>Rule JSON (paste extracted rules here):</label>
          <textarea
            value={newRuleData}
            onChange={(e) => setNewRuleData(e.target.value)}
            placeholder={exampleRule}
            rows={15}
            className="rule-textarea"
            style={{ 
              borderColor: validationError ? '#dc3545' : '#ced4da'
            }}
          />
          
          {validationError && (
            <div style={{
              color: '#dc3545',
              fontSize: '0.875rem',
              marginTop: '5px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <AlertCircle size={16} />
              {validationError}
            </div>
          )}
        </div>

        <div className="form-actions">
          <button 
            onClick={handleAddRule} 
            className="btn-save-rule"
            disabled={isValidating || !newRuleData.trim()}
          >
            {isValidating ? 'Validating...' : 'Save Rule'}
          </button>
          <button 
            onClick={onClose} 
            className="btn-cancel"
          >
            Cancel
          </button>
        </div>

        <div className="rule-help">
          <h5>Rule Format Guide:</h5>
          <ul>
            <li><strong>severity:</strong> "error" (critical), "warning" (review needed), or "info" (notice)</li>
            <li><strong>message:</strong> Description of what the rule checks</li>
            <li><strong>flaggedPhrases:</strong> Array of phrases that trigger this rule</li>
            <li><strong>lawReference:</strong> Legal citation (optional but recommended)</li>
            <li><strong>source:</strong> Where this rule came from</li>
            <li><strong>actionRequired:</strong> What needs to be done</li>
            <li><strong>alternativeLanguage:</strong> Suggested replacement text</li>
          </ul>
        </div>
      </div>

      <div className="current-rules">
        <h5>Current {selectedState} Rules ({Object.keys(currentRules[selectedState]?.rules || {}).length}):</h5>
        <div className="rules-list">
          {Object.keys(currentRules[selectedState]?.rules || {}).length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#6c757d' }}>
              No rules configured for {selectedState}. Add rules using the form above.
            </div>
          ) : (
            Object.keys(currentRules[selectedState]?.rules || {}).map(ruleName => {
              const rule = currentRules[selectedState].rules[ruleName];
              return (
                <div key={ruleName} className="rule-item">
                  <div>
                    <strong>{ruleName}</strong>: {rule.message}
                    {rule.source && (
                      <div style={{ fontSize: '0.8em', color: '#6c757d' }}>
                        Source: {rule.source}
                      </div>
                    )}
                  </div>
                  <span className={`severity ${rule.severity}`}>
                    {rule.severity.toUpperCase()}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default RulesManager;