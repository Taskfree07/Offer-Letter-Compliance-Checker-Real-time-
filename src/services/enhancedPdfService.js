/**
 * Enhanced PDF Service for clean variable extraction and editing
 * Integrates with PyMuPDF, pdfplumber, and GLiNER backend
 */

class EnhancedPdfService {
  constructor() {
    const { API_BASE_URL } = require('../config/constants');
    this.baseUrl = API_BASE_URL;
  }

  /**
   * Extract bracketed variables from PDF with precise positioning
   * @param {File} pdfFile - PDF file to process
   * @returns {Promise<Object>} Variables with positions and GLiNER suggestions
   */
  async extractPdfVariables(pdfFile) {
    try {
      const formData = new FormData();
      formData.append('file', pdfFile);

      const response = await fetch(`${this.baseUrl}/api/extract-pdf-variables`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to extract variables');
      }

      return {
        success: true,
        variables: result.data.variables || {},
        positions: result.data.positions || {},
        totalVariables: result.data.total_variables || 0,
        pagesProcessed: result.data.pages_processed || 0,
        message: result.message
      };

    } catch (error) {
      console.error('Enhanced PDF variable extraction failed:', error);
      return {
        success: false,
        error: error.message,
        variables: {},
        positions: {},
        totalVariables: 0,
        pagesProcessed: 0
      };
    }
  }

  /**
   * Create an editable PDF with form fields for variables
   * @param {File} pdfFile - Original PDF file
   * @param {Object} variables - Variable values to fill
   * @returns {Promise<Blob>} Editable PDF as blob
   */
  async createEditablePdf(pdfFile, variables = {}) {
    try {
      const formData = new FormData();
      formData.append('file', pdfFile);
      formData.append('variables', JSON.stringify(variables));

      const response = await fetch(`${this.baseUrl}/api/create-editable-pdf`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      // Return the PDF blob
      return await response.blob();

    } catch (error) {
      console.error('Failed to create editable PDF:', error);
      throw error;
    }
  }

  /**
   * Check if enhanced PDF service is available
   * @returns {Promise<Object>} Service availability status
   */
  async checkHealth() {
    try {
      const response = await fetch(`${this.baseUrl}/api/enhanced-pdf-health`);
      const result = await response.json();
      
      return {
        available: result.available || false,
        services: result.services || {},
        pymupdf: result.services?.pymupdf || false,
        pdfplumber: result.services?.pdfplumber || false,
        glinerIntegration: result.services?.gliner_integration || false
      };

    } catch (error) {
      console.error('Enhanced PDF health check failed:', error);
      return {
        available: false,
        services: {},
        pymupdf: false,
        pdfplumber: false,
        glinerIntegration: false,
        error: error.message
      };
    }
  }

  /**
   * Process PDF and extract variables for clean editing experience
   * @param {File} pdfFile - PDF file to process
   * @returns {Promise<Object>} Complete processing result
   */
  async processPdfForEditing(pdfFile) {
    try {
      // First check if service is available
      const health = await this.checkHealth();
      if (!health.available) {
        throw new Error('Enhanced PDF service is not available. Please install required libraries.');
      }

      // Extract variables with positions
      const extractionResult = await this.extractPdfVariables(pdfFile);
      
      if (!extractionResult.success) {
        throw new Error(extractionResult.error || 'Failed to extract variables');
      }

      // Process variables for UI
      const processedVariables = this.processVariablesForUI(extractionResult.variables);
      
      return {
        success: true,
        variables: processedVariables,
        positions: extractionResult.positions,
        stats: {
          totalVariables: extractionResult.totalVariables,
          pagesProcessed: extractionResult.pagesProcessed,
          glinerSuggestions: this.countGlinerSuggestions(extractionResult.variables)
        },
        message: extractionResult.message
      };

    } catch (error) {
      console.error('PDF processing for editing failed:', error);
      return {
        success: false,
        error: error.message,
        variables: {},
        positions: {},
        stats: {
          totalVariables: 0,
          pagesProcessed: 0,
          glinerSuggestions: 0
        }
      };
    }
  }

  /**
   * Process variables for UI display
   * @param {Object} variables - Raw variables from backend
   * @returns {Object} UI-friendly variables
   */
  processVariablesForUI(variables) {
    const processed = {};
    
    Object.entries(variables).forEach(([name, data]) => {
      processed[name] = {
        name: name,
        value: data.suggested_value || '',
        originalText: data.original_text || `[${name}]`,
        confidence: data.confidence || 0,
        occurrences: data.occurrences || 0,
        hasGlinerSuggestion: (data.confidence || 0) > 0.3,
        placeholder: `Enter ${name.toLowerCase().replace(/_/g, ' ')}...`
      };
    });

    return processed;
  }

  /**
   * Count GLiNER suggestions with good confidence
   * @param {Object} variables - Variables data
   * @returns {number} Count of good suggestions
   */
  countGlinerSuggestions(variables) {
    return Object.values(variables).filter(
      variable => (variable.confidence || 0) > 0.3
    ).length;
  }

  /**
   * Generate PDF URL for preview
   * @param {Blob} pdfBlob - PDF blob
   * @returns {string} Object URL for PDF
   */
  generatePdfUrl(pdfBlob) {
    return URL.createObjectURL(pdfBlob);
  }

  /**
   * Download PDF file
   * @param {Blob} pdfBlob - PDF blob
   * @param {string} filename - Download filename
   */
  downloadPdf(pdfBlob, filename = 'editable_offer_letter.pdf') {
    const url = this.generatePdfUrl(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Debug PDF text extraction
   * @param {File} pdfFile - PDF file to debug
   * @returns {Promise<Object>} Debug information
   */
  async debugPdfText(pdfFile) {
    try {
      const formData = new FormData();
      formData.append('file', pdfFile);

      const response = await fetch(`${this.baseUrl}/api/debug-pdf-text`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      return await response.json();

    } catch (error) {
      console.error('PDF debug failed:', error);
      return {
        success: false,
        error: error.message,
        pages: [],
        total_text_length: 0,
        variables_found: [],
        total_variables: 0
      };
    }
  }

  /**
   * Validate PDF file
   * @param {File} file - File to validate
   * @returns {Object} Validation result
   */
  validatePdfFile(file) {
    if (!file) {
      return { valid: false, error: 'No file provided' };
    }

    if (file.type !== 'application/pdf') {
      return { valid: false, error: 'File must be a PDF' };
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      return { valid: false, error: 'File size must be less than 50MB' };
    }

    return { valid: true };
  }
}

// Export singleton instance
const enhancedPdfService = new EnhancedPdfService();
export default enhancedPdfService;
