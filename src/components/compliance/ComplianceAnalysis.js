import React from 'react';
import { AlertTriangle, AlertOctagon, CheckCircle } from 'lucide-react';
import './compliance.css';

const ComplianceAnalysis = ({ complianceResults }) => {
  if (!complianceResults) return null;

  const { criticalIssues, warnings, isCompliant } = complianceResults;

  return (
    <div className="compliance-analysis">
      <h3 className="compliance-title">Legal Compliance Analysis</h3>
      
      <div className={`compliance-status ${isCompliant ? 'compliant' : 'non-compliant'}`}>
        {isCompliant ? (
          <div className="status-indicator success">
            <CheckCircle size={24} />
            <span>Document is compliant with current regulations</span>
          </div>
        ) : (
          <div className="status-indicator error">
            <AlertOctagon size={24} />
            <span>Critical compliance issues found</span>
          </div>
        )}
      </div>

      {criticalIssues.count > 0 && (
        <div className="issues-section critical">
          <h4>
            <AlertOctagon size={20} />
            Critical Issues ({criticalIssues.count})
          </h4>
          {criticalIssues.items.map((issue, index) => (
            <div key={index} className="issue-item critical">
              <div className="issue-header">
                <AlertOctagon size={16} />
                <strong>{issue.message}</strong>
              </div>
              <div className="issue-details">
                <p><strong>Law Reference:</strong> {issue.lawReference}</p>
                <p><strong>Found Text:</strong> "{issue.flaggedText}"</p>
                <p><strong>Action Required:</strong> {issue.actionRequired}</p>
                {issue.suggestion && (
                  <p><strong>Suggestion:</strong> {issue.suggestion}</p>
                )}
                {issue.alternativeLanguage && (
                  <p><strong>Recommended Language:</strong> {issue.alternativeLanguage}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {warnings.count > 0 && (
        <div className="issues-section warnings">
          <h4>
            <AlertTriangle size={20} />
            Warnings ({warnings.count})
          </h4>
          {warnings.items.map((issue, index) => (
            <div key={index} className="issue-item warning">
              <div className="issue-header">
                <AlertTriangle size={16} />
                <strong>{issue.message}</strong>
              </div>
              <div className="issue-details">
                <p><strong>Law Reference:</strong> {issue.lawReference}</p>
                <p><strong>Found Text:</strong> "{issue.flaggedText}"</p>
                <p><strong>Suggestion:</strong> {issue.suggestion}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {isCompliant && !warnings.count && (
        <div className="no-issues">
          <p>No compliance issues found. The document appears to comply with current regulations.</p>
        </div>
      )}
    </div>
  );
};

export default ComplianceAnalysis;
