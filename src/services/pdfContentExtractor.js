import pdfjs from '../utils/pdfWorker';
import nlpService from './nlpService';

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
    // Extract text with NLP
    const extractionResult = await extractTextWithNLP(file, {
      performNLP: true,
      replaceEntities: true
    });

    if (!extractionResult.nlp.processingSuccess) {
      throw new Error('NLP processing failed');
    }

    // Get processed text with variables
    let processedText = extractionResult.text;
    let variablesUsed = {};

    if (extractionResult.nlp.processedText) {
      processedText = extractionResult.nlp.processedText;
      variablesUsed = extractionResult.nlp.variablesUsed || {};
    } else {
      // Fallback: perform entity replacement
      const replacementResult = await nlpService.replaceEntitiesWithVariables(
        extractionResult.text, 
        entityMappings
      );
      processedText = replacementResult.processed_text;
      variablesUsed = replacementResult.variables_used;
    }

    return {
      originalText: extractionResult.text,
      templateText: processedText,
      variables: variablesUsed,
      entities: extractionResult.nlp.entities,
      suggestions: extractionResult.nlp.variableSuggestions,
      metadata: {
        filename: file.name,
        fileSize: file.size,
        processedAt: new Date().toISOString(),
        nlpProcessingSuccess: true
      }
    };
    
  } catch (error) {
    console.error('Error generating template from PDF:', error);
    throw new Error(`Failed to generate template: ${error.message}`);
  }
}
