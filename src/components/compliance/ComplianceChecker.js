// /src/components/compliance/ComplianceChecker.js
// Individual compliance flag component for sentence-level analysis

import React from 'react';

const ComplianceChecker = ({ 
  sentence, 
  sectionNumber, 
  selectedState, 
  rules, 
  onFlagUpdate 
}) => {
  // Analyze sentence against compliance rules
  const analyzeSentence = (text, section, state) => {
    const flags = [];
    const stateRules = rules[state]?.rules || {};
    const lowerText = text.toLowerCase();

    Object.keys(stateRules).forEach(ruleKey => {
      const rule = stateRules[ruleKey];
      
      if (rule.flaggedPhrases) {
        const hasMatch = rule.flaggedPhrases.some(phrase => 
          lowerText.includes(phrase.toLowerCase())
        );

        if (hasMatch) {
          flags.push({
            type: ruleKey,
            severity: rule.severity,
            message: rule.message,
            suggestion: rule.suggestion,
            actionRequired: rule.actionRequired,
            alternativeLanguage: rule.alternativeLanguage,
            lawReference: rule.lawReference,
            source: rule.source,
            detailedExplanation: rule.detailedExplanation
          });
        }
      }
    });

    return flags;
  };

  const flags = analyzeSentence(sentence, sectionNumber, selectedState);

  // Update parent component with flags
  React.useEffect(() => {
    if (onFlagUpdate) {
      onFlagUpdate(flags);
    }
  }, [sentence, selectedState, rules, onFlagUpdate]);

  if (flags.length === 0) return null;

  return (
    <div className="compliance-flags">
      {flags.map((flag, index) => (
        <div key={index} className={`compliance-flag ${flag.severity}`}>
          <div className="flag-header">
            <span className={`flag-icon ${flag.severity}`}>
              {flag.severity === 'error' ? '🚨' : flag.severity === 'warning' ? '⚡' : 'ℹ️'}
            </span>
            <strong>{flag.type.toUpperCase()}</strong>
          </div>
          
          <div className="flag-content">
            <p className="flag-message">{flag.message}</p>
            
            {flag.lawReference && (
              <div className="law-reference">
                <strong>📜 Legal Reference:</strong> {flag.lawReference}
              </div>
            )}

            {flag.source && (
              <div className="source">
                <strong>📚 Source:</strong> {flag.source}
              </div>
            )}

            {flag.detailedExplanation && (
              <div className="detailed-explanation">
                <strong>🔍 Explanation:</strong> {flag.detailedExplanation}
              </div>
            )}
            
            {flag.actionRequired && (
              <div className="action-required">
                <strong>⚡ Action Required:</strong> {flag.actionRequired}
              </div>
            )}
            
            {flag.suggestion && (
              <div className="suggestion">
                <strong>💡 Suggestion:</strong> {flag.suggestion}
              </div>
            )}
            
            {flag.alternativeLanguage && (
              <div className="alternative">
                <strong>✅ Alternative Language:</strong>
                <div className="alt-text">"{flag.alternativeLanguage}"</div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ComplianceChecker;