import pdfjs from '../utils/pdfWorker';
import nlpService from './nlpService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';

export async function extractTextFromPDF(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDocument = await pdfjs.getDocument(arrayBuffer).promise;
    let text = '';

    for (let i = 1; i <= pdfDocument.numPages; i++) {
      const page = await pdfDocument.getPage(i);
      const textContent = await page.getTextContent();
      text += textContent.items.map(item => item.str).join(' ') + '\n';
    }

    return text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

/**
 * Extract text from PDF and perform NLP entity extraction
 * @param {File} file - PDF file to process
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} - Text and NLP analysis results
 */
export async function extractTextWithNLP(file, options = {}) {
  try {
    // Extract text from PDF
    const text = await extractTextFromPDF(file);
    
    // Default options
    const defaultOptions = {
      performNLP: true,
      extractEntities: true,
      suggestVariables: true,
      replaceEntities: false,
      ...options
    };

    const result = {
      text,
      filename: file.name,
      fileSize: file.size,
      extractedAt: new Date().toISOString()
    };

    // Perform NLP processing if requested and service is available
    if (defaultOptions.performNLP && nlpService.isServiceAvailable()) {
      try {
        console.log('Processing PDF content with NLP...');
        
        const nlpResult = await nlpService.processPDFContent(text);
        
        result.nlp = {
          entities: nlpResult.entities || {},
          variableSuggestions: nlpResult.variable_suggestions || {},
          metadata: nlpResult.pdf_metadata || {},
          processingSuccess: true
        };

        // If entity replacement was requested
        if (defaultOptions.replaceEntities) {
          const replacementResult = await nlpService.replaceEntitiesWithVariables(text);
          result.nlp.processedText = replacementResult.processed_text;
          result.nlp.variablesUsed = replacementResult.variables_used;
        }

        console.log('NLP processing completed successfully');
        
      } catch (nlpError) {
        console.warn('NLP processing failed, continuing without NLP features:', nlpError.message);
        result.nlp = {
          processingSuccess: false,
          error: nlpError.message,
          fallbackMode: true
        };
      }
    } else {
      result.nlp = {
        processingSuccess: false,
        reason: defaultOptions.performNLP ? 'NLP service not available' : 'NLP processing disabled',
        fallbackMode: true
      };
    }

    return result;
    
  } catch (error) {
    console.error('Error extracting text with NLP from PDF:', error);
    throw new Error(`Failed to process PDF: ${error.message}`);
  }
}

/**
 * Extract entities from already extracted PDF text
 * @param {string} text - Previously extracted text
 * @returns {Promise<Object>} - NLP analysis results
 */
export async function analyzeExtractedText(text) {
  try {
    if (!nlpService.isServiceAvailable()) {
      throw new Error('NLP service is not available');
    }

    const result = await nlpService.processDocument(text, {
      extract_entities: true,
      suggest_variables: true,
      replace_entities: false
    });

    return {
      success: true,
      ...result
    };
    
  } catch (error) {
    console.error('Error analyzing extracted text:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Generate template from PDF with entity replacement
 * @param {File} file - PDF file to process
 * @param {Object} entityMappings - Custom entity mappings
 * @returns {Promise<Object>} - Template with variables
 */
export async function generateTemplateFromPDF(file, entityMappings = null) {
  try {
    const formData = new FormData();
    formData.append('file', file);

    // Call backend for structured HTML conversion
    const response = await fetch(`${API_BASE_URL}/api/pdf-to-html`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Backend error: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to generate HTML from PDF');
    }

    const conversionData = result.data;
    const templateHtml = conversionData.html;
    let variables = conversionData.variables || {};
    let entities = [];

    // Extract text from HTML for NLP if needed and NLP is available
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = templateHtml;
    const extractedText = (tempDiv.textContent || tempDiv.innerText || '').trim();

    // Run NLP on extracted text for additional processing if NLP service available
    if (nlpService.isServiceAvailable()) {
      const extractionResult = await extractTextWithNLP(file, {
        performNLP: true,
        extractEntities: true,
        suggestVariables: true,
        replaceEntities: false
      });

      entities = extractionResult.nlp?.entities || [];
      
      // Merge variables from backend and NLP suggestions
      if (extractionResult.nlp?.variableSuggestions) {
        Object.entries(extractionResult.nlp.variableSuggestions).forEach(([varName, suggestionData]) => {
          const cleanName = varName.replace(/^\[|\]$/g, '').trim();
          if (cleanName && !variables[cleanName]) {
            variables[cleanName] = suggestionData.current_value || '';
          }
        });
      }

      // If entity replacement requested, process the extracted text
      if (entityMappings) {
        const replacementResult = await nlpService.replaceEntitiesWithVariables(extractedText, entityMappings);
        // We keep the HTML structure, but could update variable placeholders if needed
      }
    }

    return {
      originalText: extractedText,
      templateHtml: templateHtml,
      templateText: extractedText,  // Fallback for legacy code
      variables: variables,
      entities: entities,
      suggestions: {}, // Use backend variables primarily; NLP suggestions merged into variables
      metadata: {
        filename: file.name,
        fileSize: file.size,
        processedAt: new Date().toISOString(),
        htmlGenerated: true,
        pageCount: conversionData.metadata?.page_count || 0,
        totalVariables: Object.keys(variables).length,
        nlpUsed: nlpService.isServiceAvailable()
      }
    };
    
  } catch (error) {
    console.error('Error generating template from PDF:', error);
    throw new Error(`Failed to generate template: ${error.message}`);
  }
}
