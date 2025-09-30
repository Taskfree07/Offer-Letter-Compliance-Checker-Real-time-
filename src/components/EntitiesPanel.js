import React, { useMemo, useState } from 'react';
import nlpService from '../services/nlpService';
import { detectFieldsEnhanced } from '../services/fieldExtractor';

export default function EntitiesPanel({
  entities = [],
  variables = {},
  content = '',
  onVariablesChange = () => {},
  onContentChange = () => {},
  onAfterApply = () => {},
}) {
  const [isApplying, setIsApplying] = useState(false);

  const grouped = useMemo(() => {
    const g = {};
    (entities || []).forEach(e => {
      const key = e.label || 'OTHER';
      if (!g[key]) g[key] = [];
      g[key].push(e);
    });
    return g;
  }, [entities]);

  const handleVarEdit = (name, value) => {
    onVariablesChange({ ...variables, [name]: value });
  };

  const applyRegexFieldDetection = async () => {
    try {
      setIsApplying(true);
      
      // Use enhanced detection with GLiNER + regex fallback
      const result = await detectFieldsEnhanced(content || '', {
        useGLiNER: false, // Temporarily disable GLiNER due to disk space issue
        useRegex: true,
        mergeResults: true,
        confidenceThreshold: 0.3
      });

      if (!result.variables || Object.keys(result.variables).length === 0) {
        alert('No field name/value pairs detected using GLiNER or regex patterns. Try importing a PDF with clear field data.');
        return;
      }

      // Merge without overwriting user-entered values
      const merged = { ...variables };
      Object.entries(result.variables).forEach(([key, val]) => {
        const v = typeof val === 'string' ? val.trim() : '';
        if (!v) return;
        if (!merged[key] || String(merged[key]).trim() === '') {
          merged[key] = v;
        }
      });

      onVariablesChange(merged);
      
      // Enhanced logging with method info
      console.log('Enhanced field detection completed:', {
        methods: result.methods,
        variables: result.variables,
        matches: result.matches,
        confidence: result.confidence,
        stats: result.stats
      });
      
      // Show success message with method info
      const methodsUsed = result.methods.join(' + ') || 'Regex';
      const confidence = Math.round(result.confidence * 100);
      let message = `Successfully detected ${Object.keys(result.variables).length} fields using ${methodsUsed}`;
      
      if (confidence > 0) {
        message += ` (${confidence}% confidence)`;
      }
      
      // Add warnings if any
      if (result.warnings && result.warnings.length > 0) {
        message += `\n\nNote: ${result.warnings.join(', ')}`;
      }
      
      alert(message);
      
      onAfterApply();
    } catch (e) {
      console.error('Enhanced field detection failed:', e);
      alert('Field detection failed: ' + e.message);
    } finally {
      setIsApplying(false);
    }
  };

  const applyNLPReplacement = async () => {
    try {
      setIsApplying(true);
      // Use backend to replace detected entities with template variables
      const result = await nlpService.replaceEntitiesWithVariables(content);
      const processed = result?.processed_text || content;
      const varsUsed = result?.variables_used || {};

      // Flatten backend map to simple { VAR: value }
      const merged = { ...variables };
      Object.entries(varsUsed).forEach(([varName, arr]) => {
        const clean = String(varName).replace(/^\[|\]$/g, '');
        if (Array.isArray(arr) && arr[0]?.original_text && !merged[clean]) {
          merged[clean] = arr[0].original_text;
        }
      });

      onContentChange(processed);
      onVariablesChange(merged);
      onAfterApply();
    } catch (e) {
      console.error('NLP replace failed:', e);
      alert('Failed to auto-replace entities with variables: ' + e.message);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div style={{ padding: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>Detected Entities</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" disabled={isApplying} onClick={applyRegexFieldDetection}>
            {isApplying ? 'Detecting...' : 'Detect Fields (Regex)'}
          </button>
          <button className="btn btn-primary" disabled={isApplying} onClick={applyNLPReplacement}>
            {isApplying ? 'Applying...' : 'Replace in Template (NLP)'}
          </button>
        </div>
      </div>

      {Object.keys(grouped).length === 0 && (
        <p style={{ color: '#64748b', marginTop: '8px' }}>No entities detected yet. Import a PDF first.</p>
      )}

      {Object.entries(grouped).map(([label, list]) => (
        <div key={label} style={{ marginTop: '12px' }}>
          <h4 style={{ margin: '8px 0' }}>{label} ({list.length})</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {list.map((e, idx) => (
              <div key={`${label}-${idx}`} style={{ background: '#f8fafc', padding: '8px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 12, color: '#475569' }}>"{e.text}"</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6 }}>
                  <span style={{ fontSize: 12, color: '#64748b' }}>Map to variable:</span>
                  <input
                    type="text"
                    placeholder={suggestVarName(label)}
                    value={variables[suggestVarName(label)] || ''}
                    onChange={ev => handleVarEdit(suggestVarName(label), ev.target.value)}
                    style={{ flex: 1, padding: 6, border: '1px solid #cbd5e1', borderRadius: 4 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function suggestVarName(label) {
  switch (label) {
    case 'PERSON': return 'CANDIDATE_NAME';
    case 'ORG': return 'COMPANY_NAME';
    case 'JOB_TITLE': return 'POSITION';
    case 'MONEY': return 'SALARY';
    case 'DATE': return 'START_DATE';
    case 'EMAIL': return 'EMAIL_ADDRESS';
    case 'PHONE': return 'PHONE_NUMBER';
    case 'AGE': return 'AGE';
    case 'DOB': return 'DATE_OF_BIRTH';
    default: return label;
  }
}
