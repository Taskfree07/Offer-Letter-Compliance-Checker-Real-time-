// GLiNER service for advanced entity extraction from PDFs
// Interfaces with Python GLiNER backend for flexible NER

const API_BASE_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';

class GLiNERService {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  /**
   * Check if GLiNER service is available
   */
  async checkHealth() {
    try {
      const response = await fetch(`${this.baseUrl}/api/gliner-health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`GLiNER health check failed: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('GLiNER health check error:', error);
      return { 
        success: false, 
        available: false,
        error: error.message,
        message: 'GLiNER service may be initializing. Please wait a moment and try again.'
      };
    }
  }

  /**
   * Extract entities from text using GLiNER
   * @param {string} text - Input text
   * @param {string} entityType - Type of entities to extract ('offer_letter' or 'compliance')
   * @returns {Promise<Object>} Extracted entities
   */
  async extractEntitiesFromText(text, entityType = 'offer_letter') {
    try {
      const response = await fetch(`${this.baseUrl}/api/extract-entities-gliner`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          entity_type: entityType
        }),
      });

      if (!response.ok) {
        throw new Error(`GLiNER extraction failed: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'GLiNER extraction failed');
      }

      return result.data;
    } catch (error) {
      console.error('GLiNER text extraction error:', error);
      throw error;
    }
  }

  /**
   * Extract entities from PDF file using GLiNER
   * @param {File} file - PDF file
   * @param {string} entityType - Type of entities to extract
   * @returns {Promise<Object>} Extracted entities and text
   */
  async extractEntitiesFromPDF(file, entityType = 'offer_letter') {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('entity_type', entityType);

      const response = await fetch(`${this.baseUrl}/api/extract-pdf-entities-gliner`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`GLiNER PDF extraction failed: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'GLiNER PDF extraction failed');
      }

      return result.data;
    } catch (error) {
      console.error('GLiNER PDF extraction error:', error);
      throw error;
    }
  }

  /**
   * Convert GLiNER entities to template variables format
   * @param {Object} glinerResult - Result from GLiNER extraction
   * @returns {Object} Variables in template format
   */
  convertToTemplateVariables(glinerResult) {
    const variables = {};
    
    if (!glinerResult || !glinerResult.entities) {
      return variables;
    }

    // Convert GLiNER structured entities to simple key-value pairs
    Object.entries(glinerResult.entities).forEach(([fieldName, entityData]) => {
      if (entityData && entityData.value) {
        // Clean up the value
        let cleanValue = entityData.value.trim();
        
        // Remove common prefixes/suffixes
        cleanValue = cleanValue.replace(/^(dear|hi|hello)\s+/i, '');
        cleanValue = cleanValue.replace(/[,.:;]$/, '');
        
        variables[fieldName] = cleanValue;
      }
    });

    return variables;
  }

  /**
   * Extract offer letter variables using GLiNER
   * @param {string|File} input - Text string or PDF file
   * @returns {Promise<Object>} Extracted variables
   */
  async extractOfferLetterVariables(input) {
    try {
      let glinerResult;

      if (typeof input === 'string') {
        // Text input
        glinerResult = await this.extractEntitiesFromText(input, 'offer_letter');
      } else if (input instanceof File) {
        // PDF file input
        const pdfResult = await this.extractEntitiesFromPDF(input, 'offer_letter');
        glinerResult = pdfResult.gliner_entities;
      } else {
        throw new Error('Invalid input type. Expected string or File.');
      }

      // Convert to template variables format
      const variables = this.convertToTemplateVariables(glinerResult);

      return {
        variables,
        entities: glinerResult.entities || {},
        rawEntities: glinerResult.raw_entities || [],
        confidence: this.calculateAverageConfidence(glinerResult.entities || {}),
        extractionMethod: 'GLiNER'
      };

    } catch (error) {
      console.error('Offer letter variable extraction error:', error);
      throw error;
    }
  }

  /**
   * Extract compliance rules using GLiNER
   * @param {string|File} input - Text string or PDF file
   * @returns {Promise<Object>} Extracted compliance rules
   */
  async extractComplianceRules(input) {
    try {
      let glinerResult;

      if (typeof input === 'string') {
        glinerResult = await this.extractEntitiesFromText(input, 'compliance');
      } else if (input instanceof File) {
        const pdfResult = await this.extractEntitiesFromPDF(input, 'compliance');
        glinerResult = pdfResult.gliner_entities;
      } else {
        throw new Error('Invalid input type. Expected string or File.');
      }

      // Convert compliance entities to rules format
      const rules = this.convertToComplianceRules(glinerResult);

      return {
        rules,
        extractedRules: glinerResult.extracted_rules || {},
        ruleCount: Object.keys(rules).length,
        extractionMethod: 'GLiNER'
      };

    } catch (error) {
      console.error('Compliance rules extraction error:', error);
      throw error;
    }
  }

  /**
   * Convert GLiNER compliance result to rules format
   * @param {Object} glinerResult - GLiNER compliance extraction result
   * @returns {Object} Formatted compliance rules
   */
  convertToComplianceRules(glinerResult) {
    const rules = {};

    if (glinerResult.extracted_rules) {
      // Use pre-processed rules from Python backend
      Object.entries(glinerResult.extracted_rules).forEach(([ruleName, ruleData]) => {
        rules[ruleName] = {
          severity: ruleData.severity || 'warning',
          message: ruleData.message || '',
          lawReference: ruleData.lawReference || 'GLiNER extracted',
          flaggedPhrases: ruleData.flaggedPhrases || [],
          confidence: ruleData.confidence || 0,
          entityType: ruleData.entity_type || 'unknown'
        };
      });
    }

    return rules;
  }

  /**
   * Calculate average confidence score
   * @param {Object} entities - Entities with confidence scores
   * @returns {number} Average confidence (0-1)
   */
  calculateAverageConfidence(entities) {
    const confidenceScores = Object.values(entities)
      .map(entity => entity.confidence || 0)
      .filter(score => score > 0);

    if (confidenceScores.length === 0) return 0;

    const sum = confidenceScores.reduce((acc, score) => acc + score, 0);
    return sum / confidenceScores.length;
  }

  /**
   * Get entity extraction statistics
   * @param {Object} glinerResult - GLiNER extraction result
   * @returns {Object} Statistics
   */
  getExtractionStats(glinerResult) {
    if (!glinerResult) return { entityCount: 0, avgConfidence: 0 };

    const entityCount = glinerResult.entity_count || 0;
    const avgConfidence = this.calculateAverageConfidence(glinerResult.entities || {});

    return {
      entityCount,
      avgConfidence,
      textLength: glinerResult.text_length || 0,
      extractionMethod: 'GLiNER'
    };
  }
}

// Create and export singleton instance
const glinerService = new GLiNERService();

export default glinerService;

// Named exports for specific functions
export {
  glinerService,
  GLiNERService
};


