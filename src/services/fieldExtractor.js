// Field extraction service: detect "Field Name : Field Content" pairs and bracket placeholders
// Uses regex first; optionally uses nlpService.cleanPDFText to normalize PDF text
// Enhanced with GLiNER for advanced entity recognition

import nlpService from './nlpService';
import glinerService from './glinerService';

const WHITESPACE = /\s+/g;

// Canonical variable keys we support in the UI/template
export const CANON_KEYS = [
  'Candidate Name',
  'Job Title',
  'Company Name',
  'Address',
  'Department',
  'Start Date',
  'Amount',
  'Period',
  'Insert Date',
  'Client/Customer Name',
];

// Map synonyms/labels to canonical key
const LABEL_MAP = [
  { key: 'Candidate Name', synonyms: ['candidate name', 'candidate', 'name of candidate'] },
  { key: 'Job Title', synonyms: ['job title', 'title', 'position'] },
  { key: 'Company Name', synonyms: ['company name', 'company', 'employer', 'client', 'client/customer name', 'customer name'] },
  { key: 'Address', synonyms: ['address', 'mailing address'] },
  { key: 'Department', synonyms: ['department', 'dept'] },
  { key: 'Start Date', synonyms: ['start date', 'proposed start date', 'joining date', 'date of joining'] },
  { key: 'Amount', synonyms: ['amount', 'salary', 'annual salary', 'compensation'] },
  { key: 'Period', synonyms: ['period', 'semi monthly', 'semi-monthly', 'frequency', 'pay frequency'] },
  { key: 'Insert Date', synonyms: ['insert date', 'date'] },
  { key: 'Client/Customer Name', synonyms: ['client/customer name', 'client name', 'customer name'] },
];

// Create quick lookup for label to canonical key
const LABEL_TO_KEY = new Map();
LABEL_MAP.forEach(({ key, synonyms }) => {
  LABEL_TO_KEY.set(key.toLowerCase(), key);
  synonyms.forEach(s => LABEL_TO_KEY.set(s.toLowerCase(), key));
});

// Build regexes for known placeholders like [Job Title]
const PLACEHOLDER_REGEX = /\[\s*([^\]]+?)\s*\]/g; // captures inside brackets

function normalize(text) {
  if (!text) return '';
  try {
    // Prefer backend's PDF cleaning if available
    const cleaned = nlpService && typeof nlpService.cleanPDFText === 'function'
      ? nlpService.cleanPDFText(text)
      : text;
    return cleaned.replace(WHITESPACE, ' ').trim();
  } catch {
    return String(text).replace(WHITESPACE, ' ').trim();
  }
}

// Try to map a free-form label string to a canonical key
function mapLabelToKey(labelRaw) {
  const label = String(labelRaw || '').replace(WHITESPACE, ' ').trim().toLowerCase();
  if (!label) return null;
  // direct
  if (LABEL_TO_KEY.has(label)) return LABEL_TO_KEY.get(label);
  // remove trailing colon and punctuation
  const scrub = label.replace(/[:]+\s*$/, '').trim();
  if (LABEL_TO_KEY.has(scrub)) return LABEL_TO_KEY.get(scrub);
  // try without slashes
  const noslash = scrub.replace(/[/]+/g, ' ').replace(WHITESPACE, ' ').trim();
  if (LABEL_TO_KEY.has(noslash)) return LABEL_TO_KEY.get(noslash);
  return null;
}

// Regex patterns for "Label: Value" and context-specific signals
const FIELD_PATTERNS = [
  // Generic "Label: Value" on one line
  {
    type: 'label_value',
    regex: /(^|\n)\s*([A-Z][A-Za-z/[\] ]{2,}?)\s*[:]\s*([^\n]+?)\s*(?=\n|$)/g,
  },
  // "Dear John," captures Candidate Name
  {
    type: 'dear_name',
    regex: /(^|\n)\s*Dear\s+([^,\n[][^,\n]*)(?=,|\n|$)/gi,
    key: 'Candidate Name',
  },
  // Job title inline like "as a <title>" near Company reference
  {
    type: 'as_a_title',
    regex: /\(“?the Company”?\)\s+as\s+a\s+([^,.\n]+)/i,
    key: 'Job Title',
  },
  // Currency amount
  {
    type: 'amount_money',
    regex: /\b(\$|USD\b|Rs\.?|INR\b|€|£)\s?\d{1,3}(?:,\d{3})*(?:\.\d+)?\b/g,
    key: 'Amount',
  },
  // Date forms 12/12/24 or Month DD, YYYY
  {
    type: 'date_common',
    regex: /\b(\d{1,2}[/]\d{1,2}[/]\d{2,4}|January|February|March|April|May|June|July|August|September|October|November|December\s+\d{1,2},\s*\d{4})\b/g,
    key: 'Start Date',
  },
];

/**
 * Detect fields from free text (PDF text or template text).
 * Returns an object with variables (canonicalKey -> value) and details of matches.
 */
export function detectFieldsFromText(rawText) {
  const text = normalize(rawText);
  const variables = {};
  const matches = [];

  if (!text) {
    return { variables, matches };
  }

  // 1) Capture bracket placeholders and initialize variables
  for (const m of text.matchAll(PLACEHOLDER_REGEX)) {
    const inner = (m[1] || '').trim();
    const key = mapLabelToKey(inner);
    if (key) {
      if (!(key in variables)) variables[key] = '';
      matches.push({ type: 'placeholder', key, raw: m[0], value: '' });
    }
  }

  // 2) Label: Value pairs
  const labelVal = FIELD_PATTERNS.find(p => p.type === 'label_value');
  if (labelVal) {
    let m;
    labelVal.regex.lastIndex = 0;
    while ((m = labelVal.regex.exec(text)) !== null) {
      const labelRaw = (m[2] || '').trim();
      const valueRaw = (m[3] || '').trim();
      const key = mapLabelToKey(labelRaw);
      if (!key) continue;
      // Skip if value looks like another placeholder
      if (/^\[.*\]$/.test(valueRaw)) continue;
      if (!variables[key]) variables[key] = valueRaw;
      matches.push({ type: 'label_value', key, raw: m[0], value: valueRaw });
    }
  }

  // 3) Heuristics (Dear NAME, Amount, Date, etc.)
  FIELD_PATTERNS.filter(p => p.type !== 'label_value').forEach(p => {
    let m;
    p.regex.lastIndex = 0;
    while ((m = p.regex.exec(text)) !== null) {
      const key = p.key || mapLabelToKey(m[2] || m[1]);
      if (!key) continue;
      const value = (m[2] || m[1] || '').toString().trim();
      if (!value) continue;
      if (!variables[key]) variables[key] = value;
      matches.push({ type: p.type, key, raw: m[0], value });
    }
  });

  return { variables, matches };
}

/**
 * Enhanced field detection using GLiNER + regex fallback
 * @param {string|File} input - Text string or PDF file
 * @param {Object} options - Detection options
 * @returns {Promise<Object>} Enhanced detection results
 */
export async function detectFieldsEnhanced(input, options = {}) {
  const { 
    useGLiNER = true, 
    useRegex = true, 
    mergeResults = true,
    confidenceThreshold = 0.3 
  } = options;

  const results = {
    variables: {},
    matches: [],
    methods: [],
    confidence: 0,
    stats: {}
  };

  try {
    // Method 1: GLiNER extraction (if enabled and available)
    if (useGLiNER) {
      try {
        // First check if GLiNER is available
        const healthCheck = await glinerService.checkHealth();
        
        if (healthCheck.success && healthCheck.available) {
          const glinerResult = await glinerService.extractOfferLetterVariables(input);
          
          if (glinerResult && glinerResult.variables) {
            // Filter by confidence threshold
            Object.entries(glinerResult.variables).forEach(([key, value]) => {
              const entityData = glinerResult.entities[key];
              const confidence = entityData?.confidence || 0;
              
              if (confidence >= confidenceThreshold) {
                results.variables[key] = value;
                results.matches.push({
                  type: 'gliner',
                  key,
                  value,
                  confidence,
                  method: 'GLiNER'
                });
              }
            });
            
            results.methods.push('GLiNER');
            results.confidence = Math.max(results.confidence, glinerResult.confidence || 0);
            results.stats.gliner = glinerService.getExtractionStats(glinerResult);
          }
        } else {
          console.warn('GLiNER not available:', healthCheck.message || healthCheck.error);
          results.warnings = results.warnings || [];
          results.warnings.push('GLiNER service not available - using regex fallback');
        }
      } catch (glinerError) {
        console.warn('GLiNER extraction failed, falling back to regex:', glinerError);
        results.warnings = results.warnings || [];
        results.warnings.push('GLiNER extraction failed - using regex fallback');
      }
    }

    // Method 2: Regex extraction (if enabled or GLiNER failed)
    if (useRegex) {
      let textInput = input;
      
      // If input is a File, we need text - but GLiNER should have handled this
      if (input instanceof File) {
        console.warn('Regex extraction requires text input, skipping for File input');
      } else if (typeof input === 'string') {
        const regexResult = detectFieldsFromText(textInput);
        
        if (regexResult && regexResult.variables) {
          // Merge regex results (don't overwrite GLiNER results if merging)
          Object.entries(regexResult.variables).forEach(([key, value]) => {
            if (!mergeResults || !results.variables[key] || !results.variables[key].trim()) {
              results.variables[key] = value;
            }
          });
          
          // Add regex matches
          regexResult.matches.forEach(match => {
            results.matches.push({
              ...match,
              method: 'Regex'
            });
          });
          
          results.methods.push('Regex');
          results.stats.regex = {
            matchCount: regexResult.matches.length,
            variableCount: Object.keys(regexResult.variables).length
          };
        }
      }
    }

    // Calculate overall confidence
    if (results.matches.length > 0) {
      const confidenceScores = results.matches
        .map(m => m.confidence || 0.5) // Default confidence for regex
        .filter(c => c > 0);
      
      if (confidenceScores.length > 0) {
        results.confidence = confidenceScores.reduce((sum, c) => sum + c, 0) / confidenceScores.length;
      }
    }

    console.log('Enhanced field detection completed:', {
      methods: results.methods,
      variableCount: Object.keys(results.variables).length,
      confidence: results.confidence
    });

    return results;

  } catch (error) {
    console.error('Enhanced field detection failed:', error);
    
    // Fallback to basic regex if everything fails
    if (typeof input === 'string') {
      const fallbackResult = detectFieldsFromText(input);
      return {
        ...fallbackResult,
        methods: ['Regex (Fallback)'],
        confidence: 0.3,
        error: error.message
      };
    }
    
    throw error;
  }
}

/**
 * Detect fields from PDF file using enhanced methods
 * @param {File} pdfFile - PDF file
 * @param {Object} options - Detection options
 * @returns {Promise<Object>} Detection results
 */
export async function detectFieldsFromPDF(pdfFile, options = {}) {
  if (!(pdfFile instanceof File)) {
    throw new Error('Input must be a File object');
  }

  if (!pdfFile.name.toLowerCase().endsWith('.pdf')) {
    throw new Error('File must be a PDF');
  }

  return await detectFieldsEnhanced(pdfFile, {
    useGLiNER: true,
    useRegex: false, // Regex needs text, GLiNER handles PDF directly
    ...options
  });
}

const fieldExtractor = {
  detectFieldsFromText,
  detectFieldsEnhanced,
  detectFieldsFromPDF,
  CANON_KEYS,
};

export default fieldExtractor;
