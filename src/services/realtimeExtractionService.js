/**
 * Real-Time Field Extraction Service
 * Automatically extracts variables from documents using GLiNER without refresh/buffer
 */

import glinerService from './glinerService';
import fieldExtractor from './fieldExtractor';

class RealtimeExtractionService {
  constructor() {
    this.listeners = new Set();
    this.currentVariables = {};
    this.extractionInProgress = false;
    this.debounceTimer = null;
  }

  /**
   * Register a listener for variable updates
   * @param {Function} callback - Called when variables are updated
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    this.listeners.add(callback);

    // Immediately call with current variables
    if (Object.keys(this.currentVariables).length > 0) {
      callback(this.currentVariables);
    }

    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Notify all listeners of variable updates
   * @param {Object} variables - Updated variables
   */
  notifyListeners(variables) {
    this.currentVariables = { ...variables };
    this.listeners.forEach(callback => {
      try {
        callback(variables);
      } catch (error) {
        console.error('Error in extraction listener:', error);
      }
    });
  }

  /**
   * Extract variables from document content in real-time
   * @param {File|string} input - Document file or text content
   * @param {Object} options - Extraction options
   * @returns {Promise<Object>} Extracted variables
   */
  async extractVariables(input, options = {}) {
    const {
      immediate = false,  // Skip debouncing
      useGLiNER = true,
      useRegex = true,
      confidenceThreshold = 0.3
    } = options;

    // Prevent concurrent extractions
    if (this.extractionInProgress && !immediate) {
      console.log('⏳ Extraction already in progress, skipping...');
      return this.currentVariables;
    }

    // Debounce for text inputs (not immediate)
    if (!immediate && typeof input === 'string') {
      clearTimeout(this.debounceTimer);

      return new Promise((resolve) => {
        this.debounceTimer = setTimeout(async () => {
          const result = await this._performExtraction(input, {
            useGLiNER,
            useRegex,
            confidenceThreshold
          });
          resolve(result);
        }, 500); // 500ms debounce
      });
    }

    // Immediate extraction for files
    return await this._performExtraction(input, {
      useGLiNER,
      useRegex,
      confidenceThreshold
    });
  }

  /**
   * Internal method to perform extraction
   * @private
   */
  async _performExtraction(input, options) {
    this.extractionInProgress = true;

    try {
      console.log('🔍 Starting real-time extraction...', {
        inputType: input instanceof File ? 'File' : 'Text',
        useGLiNER: options.useGLiNER,
        useRegex: options.useRegex
      });

      // Use enhanced field detection
      const result = await fieldExtractor.detectFieldsEnhanced(input, options);

      console.log('✅ Extraction completed:', {
        variableCount: Object.keys(result.variables || {}).length,
        methods: result.methods,
        confidence: result.confidence
      });

      // Notify all listeners immediately
      this.notifyListeners(result.variables || {});

      return {
        variables: result.variables || {},
        metadata: {
          methods: result.methods || [],
          confidence: result.confidence || 0,
          matchCount: result.matches?.length || 0,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('❌ Real-time extraction failed:', error);

      // Return empty result on error
      return {
        variables: {},
        metadata: {
          error: error.message,
          timestamp: new Date().toISOString()
        }
      };
    } finally {
      this.extractionInProgress = false;
    }
  }

  /**
   * Extract variables from DOCX file uploaded to OnlyOffice
   * @param {string} documentId - OnlyOffice document ID
   * @returns {Promise<Object>} Extracted variables
   */
  async extractFromOnlyOfficeDocument(documentId) {
    try {
      console.log('📄 Extracting variables from OnlyOffice document:', documentId);

      const response = await fetch(process.env.REACT_APP_API_URL || process.env.REACT_APP_API_URL || `http://127.0.0.1:5000/api/onlyoffice/extract-realtime/${documentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Extraction failed: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        console.log('✅ OnlyOffice extraction successful:', {
          variableCount: Object.keys(result.variables || {}).length,
          glinerEnabled: result.gliner_enabled
        });

        // Notify listeners
        this.notifyListeners(result.variables || {});

        return {
          variables: result.variables || {},
          metadata: {
            glinerEnabled: result.gliner_enabled,
            extractionMethod: result.extraction_method,
            timestamp: new Date().toISOString()
          }
        };
      } else {
        throw new Error(result.error || 'Extraction failed');
      }

    } catch (error) {
      console.error('❌ OnlyOffice extraction failed:', error);
      return {
        variables: {},
        metadata: {
          error: error.message,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Update a single variable value
   * @param {string} variableName - Variable name
   * @param {string} newValue - New value
   */
  updateVariable(variableName, newValue) {
    if (!variableName) return;

    const updated = {
      ...this.currentVariables,
      [variableName]: newValue
    };

    this.notifyListeners(updated);
  }

  /**
   * Batch update multiple variables
   * @param {Object} variables - Variables to update
   */
  updateVariables(variables) {
    if (!variables || typeof variables !== 'object') return;

    const updated = {
      ...this.currentVariables,
      ...variables
    };

    this.notifyListeners(updated);
  }

  /**
   * Clear all variables
   */
  clearVariables() {
    this.notifyListeners({});
  }

  /**
   * Get current variables
   * @returns {Object} Current variables
   */
  getCurrentVariables() {
    return { ...this.currentVariables };
  }

  /**
   * Check if GLiNER is available
   * @returns {Promise<boolean>}
   */
  async checkGLiNERAvailability() {
    try {
      const health = await glinerService.checkHealth();
      return health.success && health.available;
    } catch (error) {
      console.error('GLiNER health check failed:', error);
      return false;
    }
  }
}

// Create and export singleton instance
const realtimeExtractionService = new RealtimeExtractionService();

export default realtimeExtractionService;

// Named exports
export {
  realtimeExtractionService,
  RealtimeExtractionService
};


