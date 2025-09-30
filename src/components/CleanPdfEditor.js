import React, { useState, useEffect, useRef } from 'react';
import { FileText, Download, Edit3, Check, X, Loader, AlertCircle } from 'lucide-react';
import enhancedPdfService from '../services/enhancedPdfService';

/**
 * Clean PDF Editor Component
 * Provides a clean editing experience where bracketed variables become editable fields
 */
export default function CleanPdfEditor({ onVariablesChange = () => {} }) {
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [variables, setVariables] = useState({});
  const [positions, setPositions] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCreatingEditable, setIsCreatingEditable] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ totalVariables: 0, pagesProcessed: 0, glinerSuggestions: 0 });
  const [editingVariable, setEditingVariable] = useState(null);
  const [serviceHealth, setServiceHealth] = useState({ available: false });
  
  const fileInputRef = useRef(null);
  const pdfViewerRef = useRef(null);

  // Check service health on mount
  useEffect(() => {
    checkServiceHealth();
  }, []);

  const checkServiceHealth = async () => {
    const health = await enhancedPdfService.checkHealth();
    setServiceHealth(health);
    
    if (!health.available) {
      setError('Enhanced PDF service is not available. Please install required libraries (PyMuPDF, pdfplumber).');
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file
    const validation = enhancedPdfService.validatePdfFile(file);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setError(null);
    setPdfFile(file);
    
    // Create PDF URL for preview
    const url = URL.createObjectURL(file);
    setPdfUrl(url);

    // Process PDF for variable extraction
    await processPdfFile(file);
  };

  const processPdfFile = async (file) => {
    setIsProcessing(true);
    setError(null);

    try {
      const result = await enhancedPdfService.processPdfForEditing(file);
      
      if (result.success) {
        setVariables(result.variables);
        setPositions(result.positions);
        setStats(result.stats);
        
        // Notify parent component
        onVariablesChange(result.variables);
        
        console.log('PDF processed successfully:', {
          variables: Object.keys(result.variables).length,
          glinerSuggestions: result.stats.glinerSuggestions
        });
      } else {
        setError(result.error || 'Failed to process PDF');
      }
    } catch (error) {
      console.error('PDF processing error:', error);
      setError(error.message || 'Failed to process PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVariableChange = (variableName, newValue) => {
    const updatedVariables = {
      ...variables,
      [variableName]: {
        ...variables[variableName],
        value: newValue
      }
    };
    
    setVariables(updatedVariables);
    onVariablesChange(updatedVariables);
  };

  const createEditablePdf = async () => {
    if (!pdfFile) return;

    setIsCreatingEditable(true);
    setError(null);

    try {
      // Prepare variables for backend
      const variableValues = {};
      Object.entries(variables).forEach(([name, data]) => {
        variableValues[name] = data.value || '';
      });

      const editablePdfBlob = await enhancedPdfService.createEditablePdf(pdfFile, variableValues);
      
      // Download the editable PDF
      enhancedPdfService.downloadPdf(editablePdfBlob, 'editable_offer_letter.pdf');
      
    } catch (error) {
      console.error('Failed to create editable PDF:', error);
      setError(error.message || 'Failed to create editable PDF');
    } finally {
      setIsCreatingEditable(false);
    }
  };

  const renderVariablesList = () => {
    const variableEntries = Object.entries(variables);
    
    if (variableEntries.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <FileText size={48} className="mx-auto mb-4 opacity-50" />
          <p>No variables detected yet.</p>
          <p className="text-sm">Upload a PDF with bracketed variables like [Name], [Title], etc.</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {variableEntries.map(([name, data]) => (
          <div key={name} className="variable-item bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{name}</span>
                {data.hasGlinerSuggestion && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    AI Suggested
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500">
                {data.occurrences} occurrence(s)
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={data.value}
                onChange={(e) => handleVariableChange(name, e.target.value)}
                placeholder={data.placeholder}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {editingVariable === name ? (
                <button
                  onClick={() => setEditingVariable(null)}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-md"
                  title="Done editing"
                >
                  <Check size={16} />
                </button>
              ) : (
                <button
                  onClick={() => setEditingVariable(name)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                  title="Edit in PDF"
                >
                  <Edit3 size={16} />
                </button>
              )}
            </div>
            
            {data.confidence > 0 && (
              <div className="mt-2 text-xs text-gray-600">
                GLiNER confidence: {(data.confidence * 100).toFixed(1)}%
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderStats = () => {
    if (stats.totalVariables === 0) return null;

    return (
      <div className="bg-blue-50 rounded-lg p-4 mb-4">
        <h4 className="font-medium text-blue-900 mb-2">Processing Results</h4>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="font-medium text-blue-800">{stats.totalVariables}</div>
            <div className="text-blue-600">Variables Found</div>
          </div>
          <div>
            <div className="font-medium text-blue-800">{stats.pagesProcessed}</div>
            <div className="text-blue-600">Pages Processed</div>
          </div>
          <div>
            <div className="font-medium text-blue-800">{stats.glinerSuggestions}</div>
            <div className="text-blue-600">AI Suggestions</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="clean-pdf-editor h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Clean PDF Editor</h2>
          <p className="text-sm text-gray-600">Upload PDF to extract and edit bracketed variables</p>
        </div>
        
        <div className="flex items-center gap-2">
          {!serviceHealth.available && (
            <div className="flex items-center gap-1 text-amber-600 text-sm">
              <AlertCircle size={16} />
              <span>Service Unavailable</span>
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={!serviceHealth.available}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileText size={16} />
            Upload PDF
          </button>
          
          {Object.keys(variables).length > 0 && (
            <button
              onClick={createEditablePdf}
              disabled={isCreatingEditable}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {isCreatingEditable ? (
                <Loader size={16} className="animate-spin" />
              ) : (
                <Download size={16} />
              )}
              Create Editable PDF
            </button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-4 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle size={16} />
            <span className="font-medium">Error</span>
          </div>
          <p className="text-red-700 mt-1">{error}</p>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* PDF Viewer */}
        <div className="flex-1 bg-gray-100 p-4">
          {pdfUrl ? (
            <div className="h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <iframe
                ref={pdfViewerRef}
                src={pdfUrl}
                className="w-full h-full"
                title="PDF Preview"
              />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center bg-white rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-center">
                <FileText size={64} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No PDF Loaded</h3>
                <p className="text-gray-600 mb-4">Upload a PDF to start editing variables</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!serviceHealth.available}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Choose PDF File
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Variables Panel */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-medium text-gray-900 mb-1">Variables</h3>
            <p className="text-sm text-gray-600">Edit values for bracketed variables</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {isProcessing ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Loader size={32} className="animate-spin mx-auto mb-2 text-blue-600" />
                  <p className="text-sm text-gray-600">Processing PDF...</p>
                  <p className="text-xs text-gray-500 mt-1">Extracting variables with GLiNER</p>
                </div>
              </div>
            ) : (
              <>
                {renderStats()}
                {renderVariablesList()}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
