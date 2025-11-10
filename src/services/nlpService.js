/**
 * NLP Service for Entity Extraction
 * Communicates with Python Flask API for advanced NLP processing
 */

class NLPService {
  constructor(baseUrl = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000') {
    this.baseUrl = baseUrl;
    this.isAvailable = false;
    this.checkServiceAvailability();
  }

  /**
   * Check if the NLP service is available
   */
  async checkServiceAvailability() {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        this.isAvailable = data.nlp_service_available;
        console.log('NLP Service status:', data);
      } else {
        this.isAvailable = false;
        console.warn('NLP Service health check failed');
      }
    } catch (error) {
      this.isAvailable = false;
      console.warn('NLP Service not available:', error.message);
    }
    
    return this.isAvailable;
  }

  /**
   * Extract entities from text
   * @param {string} text - Text to analyze
   * @returns {Promise<Object>} - Extracted entities and metadata
   */
  async extractEntities(text) {
    if (!this.isAvailable) {
      await this.checkServiceAvailability();
    }

    if (!this.isAvailable) {
      throw new Error('NLP Service is not available. Please ensure the Python server is running.');
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/extract-entities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to extract entities');
      }

      return data.data;
    } catch (error) {
      console.error('Error extracting entities:', error);
      throw error;
    }
  }

  /**
   * Get template variable suggestions based on extracted entities
   * @param {string} text - Text to analyze
   * @returns {Promise<Object>} - Variable suggestions
   */
  async suggestTemplateVariables(text) {
    if (!this.isAvailable) {
      await this.checkServiceAvailability();
    }

    if (!this.isAvailable) {
      throw new Error('NLP Service is not available. Please ensure the Python server is running.');
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/suggest-variables`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to suggest variables');
      }

      return data.data;
    } catch (error) {
      console.error('Error suggesting variables:', error);
      throw error;
    }
  }

  /**
   * Replace entities in text with template variables
   * @param {string} text - Text to process
   * @param {Object} entityMappings - Optional custom entity mappings
   * @returns {Promise<Object>} - Processed text with variables
   */
  async replaceEntitiesWithVariables(text, entityMappings = null) {
    if (!this.isAvailable) {
      await this.checkServiceAvailability();
    }

    if (!this.isAvailable) {
      throw new Error('NLP Service is not available. Please ensure the Python server is running.');
    }

    try {
      const payload = { text };
      if (entityMappings) {
        payload.entity_mappings = entityMappings;
      }

      const response = await fetch(`${this.baseUrl}/api/replace-entities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to replace entities');
      }

      return data.data;
    } catch (error) {
      console.error('Error replacing entities:', error);
      throw error;
    }
  }

  /**
   * Comprehensive document processing
   * @param {string} text - Text to process
   * @param {Object} options - Processing options
   * @returns {Promise<Object>} - Complete processing results
   */
  async processDocument(text, options = {}) {
    if (!this.isAvailable) {
      await this.checkServiceAvailability();
    }

    if (!this.isAvailable) {
      throw new Error('NLP Service is not available. Please ensure the Python server is running.');
    }

    const defaultOptions = {
      extract_entities: true,
      suggest_variables: true,
      replace_entities: false,
      entity_mappings: {}
    };

    const processOptions = { ...defaultOptions, ...options };

    try {
      const response = await fetch(`${this.baseUrl}/api/process-document`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          options: processOptions
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to process document');
      }

      return data.data;
    } catch (error) {
      console.error('Error processing document:', error);
      throw error;
    }
  }

  /**
   * Get NLP model information
   * @returns {Promise<Object>} - Model information
   */
  async getModelInfo() {
    if (!this.isAvailable) {
      await this.checkServiceAvailability();
    }

    if (!this.isAvailable) {
      throw new Error('NLP Service is not available. Please ensure the Python server is running.');
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/model-info`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get model info');
      }

      return data.data;
    } catch (error) {
      console.error('Error getting model info:', error);
      throw error;
    }
  }

  /**
   * Process text extracted from PDF for entity recognition
   * @param {string} pdfText - Text extracted from PDF
   * @returns {Promise<Object>} - Processing results optimized for PDF content
   */
  async processPDFContent(pdfText) {
    try {
      // Clean PDF text (remove excessive whitespace, fix line breaks)
      const cleanedText = this.cleanPDFText(pdfText);

      // Process with comprehensive options
      const result = await this.processDocument(cleanedText, {
        extract_entities: true,
        suggest_variables: true,
        replace_entities: false
      });

      // Add PDF-specific metadata
      result.pdf_metadata = {
        original_length: pdfText.length,
        cleaned_length: cleanedText.length,
        cleaning_applied: pdfText !== cleanedText
      };

      return result;
    } catch (error) {
      console.error('Error processing PDF content:', error);
      throw error;
    }
  }

  /**
   * Clean text extracted from PDF
   * @param {string} text - Raw PDF text
   * @returns {string} - Cleaned text
   */
  cleanPDFText(text) {
    if (!text) return '';

    let cleaned = text;

    // Fix common PDF extraction issues
    cleaned = cleaned.replace(/\s+/g, ' '); // Multiple spaces to single space
    cleaned = cleaned.replace(/\n\s*\n/g, '\n\n'); // Multiple line breaks to double
    cleaned = cleaned.replace(/([a-z])([A-Z])/g, '$1 $2'); // Add space between camelCase
    cleaned = cleaned.replace(/(\w)([.!?])(\w)/g, '$1$2 $3'); // Add space after punctuation
    cleaned = cleaned.trim();

    return cleaned;
  }

  /**
   * Generate entity highlighting data for UI
   * @param {string} text - Original text
   * @param {Array} entities - Extracted entities
   * @returns {Array} - Highlighting data for UI components
   */
  generateHighlightingData(text, entities) {
    if (!entities || entities.length === 0) {
      return [{ text, isEntity: false }];
    }

    const segments = [];
    let lastEnd = 0;

    // Sort entities by start position
    const sortedEntities = [...entities].sort((a, b) => a.start - b.start);

    for (const entity of sortedEntities) {
      // Add text before entity
      if (entity.start > lastEnd) {
        segments.push({
          text: text.slice(lastEnd, entity.start),
          isEntity: false
        });
      }

      // Add entity
      segments.push({
        text: entity.text,
        isEntity: true,
        entityType: entity.label,
        confidence: entity.confidence,
        description: entity.description
      });

      lastEnd = entity.end;
    }

    // Add remaining text
    if (lastEnd < text.length) {
      segments.push({
        text: text.slice(lastEnd),
        isEntity: false
      });
    }

    return segments;
  }

  /**
   * Check if service is available
   * @returns {boolean} - Service availability status
   */
  isServiceAvailable() {
    return this.isAvailable;
  }

  /**
   * Set base URL for the NLP service
   * @param {string} url - New base URL
   */
  setBaseUrl(url) {
    this.baseUrl = url;
    this.checkServiceAvailability();
  }
}

// Create and export singleton instance
const nlpService = new NLPService();

export default nlpService;


