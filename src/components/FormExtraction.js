import React, { useState, useCallback, memo } from 'react';
import onlyofficeFormService from '../services/onlyofficeFormService';
import './FormExtraction.css';

const FormExtraction = memo(({ documentId, onVariablesExtracted, editorRef }) => {
  const [extractedFields, setExtractedFields] = useState(null);
  const [analyzedFields, setAnalyzedFields] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Extract form fields from document
  const handleExtractFormData = useCallback(async () => {
    if (!documentId) {
      setStatusMessage('❌ No document loaded');
      return;
    }

    setIsExtracting(true);
    setStatusMessage('🔍 Extracting form fields...');

    try {
      onlyofficeFormService.setDocumentId(documentId);
      const result = await onlyofficeFormService.extractFormData(documentId);

      if (result.success) {
        setExtractedFields(result.fields);
        setStatusMessage(`✅ Extracted ${result.count} form fields`);
      }
    } catch (error) {
      console.error('Error extracting form data:', error);
      setStatusMessage(`❌ Failed: ${error.message}`);
    } finally {
      setIsExtracting(false);
    }
  }, [documentId]);

  // Analyze extracted fields with NLP
  const handleAnalyzeWithNLP = useCallback(async () => {
    if (!extractedFields || extractedFields.length === 0) {
      setStatusMessage('❌ Please extract form data first');
      return;
    }

    setIsAnalyzing(true);
    setStatusMessage('🔬 Analyzing with NLP...');

    try {
      const result = await onlyofficeFormService.analyzeWithNLP(extractedFields);

      if (result.success) {
        setAnalyzedFields(result.fields);
        setStatusMessage(`✅ Analyzed ${result.count} fields with NLP`);

        // Convert to variables format and pass to parent
        if (onVariablesExtracted) {
          const variables = onlyofficeFormService.convertFieldsToVariables(result.fields);
          onVariablesExtracted(variables);
        }
      }
    } catch (error) {
      console.error('Error analyzing with NLP:', error);
      setStatusMessage(`❌ Analysis failed: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  }, [extractedFields, onVariablesExtracted]);

  // Update form data in document using direct editor manipulation
  const handleUpdateFormData = useCallback(async () => {
    if (!analyzedFields || analyzedFields.length === 0) {
      setStatusMessage('❌ Please analyze fields first');
      return;
    }

    if (!editorRef || !editorRef.current) {
      setStatusMessage('❌ Editor not ready');
      return;
    }

    setIsUpdating(true);
    setStatusMessage('💾 Updating document...');

    try {
      // Pass the editor reference for direct manipulation
      const result = await onlyofficeFormService.updateFormData(analyzedFields, editorRef.current);

      if (result.success) {
        setStatusMessage(`✅ Updated ${result.updatedCount} fields in document`);
      }
    } catch (error) {
      console.error('Error updating form data:', error);
      setStatusMessage(`❌ Update failed: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  }, [analyzedFields, editorRef]);

  return (
    <div className="form-extraction-panel">
      <div className="form-extraction-header">
        <h3>🔍 Form Field Extraction & NLP</h3>
        <p>Extract bracketed fields from your document and analyze them with AI</p>
      </div>

      <div className="form-extraction-content">
        {/* Status Message */}
        {statusMessage && (
          <div className={`status-message ${statusMessage.includes('✅') ? 'success' : statusMessage.includes('❌') ? 'error' : 'info'}`}>
            {statusMessage}
          </div>
        )}

        {/* Workflow Steps */}
        <div className="workflow-steps">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h4>Extract Form Fields</h4>
              <p>Find all [VARIABLE_NAME] patterns in your document</p>
              <button
                className="extract-btn"
                onClick={handleExtractFormData}
                disabled={isExtracting || !documentId}
              >
                {isExtracting ? '⏳ Extracting...' : '📋 Extract Form Fields'}
              </button>
            </div>
          </div>

          <div className={`step ${extractedFields ? 'enabled' : 'disabled'}`}>
            <div className="step-number">2</div>
            <div className="step-content">
              <h4>Analyze with NLP</h4>
              <p>Use AI to categorize and suggest field values</p>
              <button
                className="analyze-btn"
                onClick={handleAnalyzeWithNLP}
                disabled={isAnalyzing || !extractedFields || extractedFields.length === 0}
              >
                {isAnalyzing ? '⏳ Analyzing...' : '🔬 Analyze with NLP'}
              </button>
            </div>
          </div>

          <div className={`step ${analyzedFields ? 'enabled' : 'disabled'}`}>
            <div className="step-number">3</div>
            <div className="step-content">
              <h4>Update Document</h4>
              <p>Write analyzed values back to your document</p>
              <button
                className="update-btn"
                onClick={handleUpdateFormData}
                disabled={isUpdating || !analyzedFields || analyzedFields.length === 0}
              >
                {isUpdating ? '⏳ Updating...' : '💾 Update Document'}
              </button>
            </div>
          </div>
        </div>

        {/* Extracted Fields Preview */}
        {extractedFields && extractedFields.length > 0 && (
          <div className="fields-preview">
            <h4>Extracted Fields ({extractedFields.length})</h4>
            <div className="fields-list">
              {extractedFields.map((field, index) => (
                <div key={index} className="field-item">
                  <span className="field-name">{field.key || field.name}</span>
                  {analyzedFields && analyzedFields[index] && analyzedFields[index].nlp_category && (
                    <span className="field-category">{analyzedFields[index].nlp_category}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="instructions">
          <h4>💡 How to Use</h4>
          <ol>
            <li>Click "Extract Form Fields" to find all bracketed variables</li>
            <li>Click "Analyze with NLP" to categorize fields with AI</li>
            <li>Switch to Variables tab to edit field values</li>
            <li>Click "Update Document" to apply changes</li>
          </ol>
        </div>
      </div>
    </div>
  );
});

FormExtraction.displayName = 'FormExtraction';

export default FormExtraction;
