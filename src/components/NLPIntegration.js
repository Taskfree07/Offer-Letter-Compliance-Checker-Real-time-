import React, { useState, useEffect } from 'react';
import nlpService from '../services/nlpService';
import EntityHighlighter from './EntityHighlighter';
import { extractTextWithNLP, analyzeExtractedText } from '../services/pdfContentExtractor';
import './NLPIntegration.css';

/**
 * NLP Integration Component
 * Provides entity extraction, variable suggestions, and template generation
 */
const NLPIntegration = ({ 
  text, 
  onTextChange, 
  onVariablesChange,
  pdfFile = null,
  className = ''
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [nlpResults, setNlpResults] = useState(null);
  const [entities, setEntities] = useState([]);
  const [variableSuggestions, setVariableSuggestions] = useState({});
  const [serviceStatus, setServiceStatus] = useState('checking');
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('entities');
  const [processedText, setProcessedText] = useState('');
  const [variables, setVariables] = useState({});

  useEffect(() => {
    checkServiceStatus();
  }, []);

  useEffect(() => {
    if (text && serviceStatus === 'available') {
      processText(text);
    }
  }, [text, serviceStatus]);

  const checkServiceStatus = async () => {
    try {
      const isAvailable = await nlpService.checkServiceAvailability();
      setServiceStatus(isAvailable ? 'available' : 'unavailable');
      if (!isAvailable) {
        setError('NLP service is not available. Please ensure the Python server is running on port 5000.');
      }
    } catch (error) {
      setServiceStatus('unavailable');
      setError(`Failed to connect to NLP service: ${error.message}`);
    }
  };

  const processText = async (inputText) => {
    if (!inputText || !inputText.trim()) {
      setNlpResults(null);
      setEntities([]);
      setVariableSuggestions({});
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const result = await nlpService.processDocument(inputText, {
        extract_entities: true,
        suggest_variables: true,
        replace_entities: false
      });

      setNlpResults(result);
      setEntities(result.entities?.entities || []);
      setVariableSuggestions(result.variable_suggestions?.suggestions || {});
      
    } catch (error) {
      console.error('Error processing text:', error);
      setError(`Failed to process text: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const processPDFFile = async () => {
    if (!pdfFile) return;

    setIsProcessing(true);
    setError(null);

    try {
      const result = await extractTextWithNLP(pdfFile, {
        performNLP: true,
        extractEntities: true,
        suggestVariables: true
      });

      if (result.nlp.processingSuccess) {
        setNlpResults(result.nlp);
        setEntities(result.nlp.entities?.entities || []);
        setVariableSuggestions(result.nlp.variableSuggestions?.suggestions || {});
        
        if (onTextChange) {
          onTextChange(result.text);
        }
      } else {
        throw new Error(result.nlp.error || 'PDF processing failed');
      }
      
    } catch (error) {
      console.error('Error processing PDF:', error);
      setError(`Failed to process PDF: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const generateTemplate = async () => {
    if (!text) return;

    setIsProcessing(true);
    setError(null);

    try {
      const result = await nlpService.replaceEntitiesWithVariables(text);
      
      setProcessedText(result.processed_text);
      setVariables(result.variables_used);
      
      if (onTextChange) {
        onTextChange(result.processed_text);
      }
      
      if (onVariablesChange) {
        onVariablesChange(result.variables_used);
      }
      
      setActiveTab('template');
      
    } catch (error) {
      console.error('Error generating template:', error);
      setError(`Failed to generate template: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEntityClick = (entity) => {
    console.log('Entity clicked:', entity);
  };

  const handleVariableSelect = (variableName, entityData) => {
    console.log('Variable selected:', variableName, entityData);
    
    // Update variables
    const updatedVariables = {
      ...variables,
      [variableName]: entityData.text
    };
    
    setVariables(updatedVariables);
    
    if (onVariablesChange) {
      onVariablesChange(updatedVariables);
    }
  };

  const retryConnection = () => {
    setServiceStatus('checking');
    setError(null);
    checkServiceStatus();
  };

  if (serviceStatus === 'checking') {
    return (
      <div className={`nlp-integration ${className}`}>
        <div className="status-message">
          <div className="loading-spinner"></div>
          <p>Checking NLP service availability...</p>
        </div>
      </div>
    );
  }

  if (serviceStatus === 'unavailable') {
    return (
      <div className={`nlp-integration ${className}`}>
        <div className="error-message">
          <h3>NLP Service Unavailable</h3>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={retryConnection} className="retry-button">
              Retry Connection
            </button>
            <div className="setup-instructions">
              <h4>Setup Instructions:</h4>
              <ol>
                <li>Navigate to the python-nlp directory</li>
                <li>Install dependencies: <code>pip install -r requirements.txt</code></li>
                <li>Download spaCy model: <code>python -m spacy download en_core_web_sm</code></li>
                <li>Start the server: <code>python app.py</code></li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`nlp-integration ${className}`}>
      <div className="nlp-header">
        <h3>NLP Entity Extraction</h3>
        <div className="nlp-actions">
          {pdfFile && (
            <button 
              onClick={processPDFFile}
              disabled={isProcessing}
              className="action-button pdf-button"
            >
              {isProcessing ? 'Processing PDF...' : 'Process PDF'}
            </button>
          )}
          <button 
            onClick={generateTemplate}
            disabled={isProcessing || !text}
            className="action-button template-button"
          >
            {isProcessing ? 'Generating...' : 'Generate Template'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <p>{error}</p>
          <button onClick={() => setError(null)} className="dismiss-button">×</button>
        </div>
      )}

      <div className="nlp-tabs">
        <button 
          className={`tab-button ${activeTab === 'entities' ? 'active' : ''}`}
          onClick={() => setActiveTab('entities')}
        >
          Entities ({entities.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'suggestions' ? 'active' : ''}`}
          onClick={() => setActiveTab('suggestions')}
        >
          Suggestions ({Object.keys(variableSuggestions).length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'template' ? 'active' : ''}`}
          onClick={() => setActiveTab('template')}
        >
          Template
        </button>
      </div>

      <div className="nlp-content">
        {isProcessing && (
          <div className="processing-overlay">
            <div className="loading-spinner"></div>
            <p>Processing with NLP...</p>
          </div>
        )}

        {activeTab === 'entities' && (
          <div className="entities-tab">
            {text && entities.length > 0 ? (
              <EntityHighlighter
                text={text}
                entities={entities}
                onEntityClick={handleEntityClick}
                onVariableSelect={handleVariableSelect}
                showSuggestions={true}
              />
            ) : (
              <div className="empty-state">
                <p>No entities detected. {!text ? 'Enter some text to analyze.' : 'Try adding more content.'}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'suggestions' && (
          <div className="suggestions-tab">
            {Object.keys(variableSuggestions).length > 0 ? (
              <div className="variable-suggestions-list">
                {Object.entries(variableSuggestions).map(([variable, data]) => (
                  <div key={variable} className="suggestion-item">
                    <div className="suggestion-header">
                      <span className="variable-name">{variable}</span>
                      <span className="entity-type">{data.entity_type}</span>
                    </div>
                    <div className="suggestion-details">
                      <p><strong>Current Value:</strong> {data.current_value}</p>
                      <p><strong>Description:</strong> {data.description}</p>
                      <p><strong>Confidence:</strong> {Math.round(data.confidence * 100)}%</p>
                    </div>
                    <button 
                      className="use-suggestion-button"
                      onClick={() => handleVariableSelect(variable, { text: data.current_value })}
                    >
                      Use This Variable
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No variable suggestions available. Process some text first.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'template' && (
          <div className="template-tab">
            {processedText ? (
              <div className="template-result">
                <h4>Generated Template:</h4>
                <div className="template-text">
                  {processedText}
                </div>
                
                {Object.keys(variables).length > 0 && (
                  <div className="variables-used">
                    <h4>Variables Used:</h4>
                    <div className="variables-list">
                      {Object.entries(variables).map(([variable, instances]) => (
                        <div key={variable} className="variable-item">
                          <span className="variable-name">{variable}</span>
                          <div className="variable-instances">
                            {Array.isArray(instances) ? instances.map((instance, index) => (
                              <span key={index} className="instance">
                                {instance.original_text} ({instance.entity_type})
                              </span>
                            )) : (
                              <span className="instance">{instances}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="empty-state">
                <p>No template generated yet. Click "Generate Template" to create one.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {nlpResults && (
        <div className="nlp-metadata">
          <h4>Processing Statistics:</h4>
          <div className="metadata-grid">
            <div className="metadata-item">
              <span className="label">Entities Found:</span>
              <span className="value">{entities.length}</span>
            </div>
            <div className="metadata-item">
              <span className="label">Processing Time:</span>
              <span className="value">{nlpResults.processing_timestamp ? new Date(nlpResults.processing_timestamp).toLocaleTimeString() : 'N/A'}</span>
            </div>
            {nlpResults.metadata && (
              <>
                <div className="metadata-item">
                  <span className="label">Sentences:</span>
                  <span className="value">{nlpResults.metadata.sentence_count || 0}</span>
                </div>
                <div className="metadata-item">
                  <span className="label">Tokens:</span>
                  <span className="value">{nlpResults.metadata.token_count || 0}</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NLPIntegration;
