/**
 * Dynamic PDF Variable Replacer
 * Automatically detects and replaces bracketed variables in PDFs
 */

/**
 * Create dynamic placeholder patterns from variable names
 * @param {Object} variables - The variables object with key-value pairs
 * @returns {Array} Array of pattern objects with regex and variable name
 */
export function createDynamicPatterns(variables) {
  const patterns = [];
  
  // For each variable, create multiple patterns to match different formats
  Object.keys(variables).forEach(varKey => {
    // Remove special characters for display name
    const displayName = varKey
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .trim();
    
    // Pattern 1: Exact match with original key
    patterns.push({
      regex: new RegExp(`\\[${escapeRegex(varKey)}\\]`, 'gi'),
      variable: varKey,
      priority: 1
    });
    
    // Pattern 2: Match with spaces instead of underscores
    if (varKey.includes('_')) {
      const spacedKey = varKey.replace(/_/g, ' ');
      patterns.push({
        regex: new RegExp(`\\[${escapeRegex(spacedKey)}\\]`, 'gi'),
        variable: varKey,
        priority: 2
      });
    }
    
    // Pattern 3: Match with flexible spacing
    const flexiblePattern = displayName.replace(/\s+/g, '\\s*');
    patterns.push({
      regex: new RegExp(`\\[${flexiblePattern}\\]`, 'gi'),
      variable: varKey,
      priority: 3
    });
    
    // Pattern 4: Case-insensitive with word boundaries
    patterns.push({
      regex: new RegExp(`\\[\\s*${escapeRegex(displayName)}\\s*\\]`, 'gi'),
      variable: varKey,
      priority: 4
    });
  });
  
  // Sort by priority (exact matches first)
  patterns.sort((a, b) => a.priority - b.priority);
  
  return patterns;
}

/**
 * Find variable value for any bracketed text
 * @param {string} bracketedText - Text found within brackets
 * @param {Object} variables - Variables object
 * @returns {string|null} Variable value or null if not found
 */
export function findVariableForBracketedText(bracketedText, variables) {
  // Remove brackets if present
  const cleanText = bracketedText.replace(/^\[|\]$/g, '').trim();
  
  // Direct match
  if (variables[cleanText]) {
    return variables[cleanText];
  }
  
  // Try with underscores instead of spaces
  const underscoreKey = cleanText.replace(/\s+/g, '_');
  if (variables[underscoreKey]) {
    return variables[underscoreKey];
  }
  
  // Try camelCase
  const camelKey = cleanText
    .replace(/\s+(\w)/g, (match, char) => char.toUpperCase())
    .replace(/^\w/, char => char.toLowerCase());
  if (variables[camelKey]) {
    return variables[camelKey];
  }
  
  // Try UPPER_SNAKE_CASE
  const upperSnakeKey = cleanText.replace(/\s+/g, '_').toUpperCase();
  if (variables[upperSnakeKey]) {
    return variables[upperSnakeKey];
  }
  
  // Case-insensitive search
  const lowerClean = cleanText.toLowerCase();
  for (const key in variables) {
    if (key.toLowerCase() === lowerClean ||
        key.toLowerCase().replace(/_/g, ' ') === lowerClean ||
        key.toLowerCase().replace(/\s+/g, '') === lowerClean.replace(/\s+/g, '')) {
      return variables[key];
    }
  }
  
  return null;
}

/**
 * Process text and replace all bracketed placeholders with variable values
 * @param {string} text - Text containing bracketed placeholders
 * @param {Object} variables - Variables object
 * @returns {Object} Object with processed text and replacement info
 */
export function replaceVariablesInText(text, variables) {
  const replacements = [];
  let processedText = text;
  
  // Find all bracketed text
  const bracketRegex = /\[([^\]]+)\]/g;
  let match;
  
  while ((match = bracketRegex.exec(text)) !== null) {
    const fullMatch = match[0];
    const innerText = match[1];
    const value = findVariableForBracketedText(innerText, variables);
    
    if (value !== null && value !== undefined && value !== '') {
      replacements.push({
        original: fullMatch,
        variable: innerText,
        value: value,
        position: match.index
      });
      
      // Replace in processed text
      processedText = processedText.replace(fullMatch, value);
    }
  }
  
  return {
    original: text,
    processed: processedText,
    replacements: replacements,
    hasReplacements: replacements.length > 0
  };
}

/**
 * Escape special regex characters
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Get all bracketed placeholders from text
 * @param {string} text - Text to search
 * @returns {Array} Array of bracketed placeholders found
 */
export function extractBracketedPlaceholders(text) {
  const placeholders = [];
  const bracketRegex = /\[([^\]]+)\]/g;
  let match;
  
  while ((match = bracketRegex.exec(text)) !== null) {
    placeholders.push({
      full: match[0],
      inner: match[1],
      position: match.index,
      length: match[0].length
    });
  }
  
  return placeholders;
}

/**
 * Create a generic pattern that matches any bracketed text
 * and attempts to find corresponding variables
 */
export function getGenericBracketHandler(variables) {
  return {
    regex: /\[([^\]]+)\]/gi,
    handler: (match, innerText) => {
      const value = findVariableForBracketedText(innerText, variables);
      return value !== null ? value : match; // Return original if no match
    }
  };
}

/**
 * Debug function to log variable matching attempts
 */
export function debugVariableMatching(text, variables) {
  console.log('=== Variable Matching Debug ===');
  console.log('Available variables:', Object.keys(variables));
  console.log('Text to process:', text);
  
  const placeholders = extractBracketedPlaceholders(text);
  console.log('Found placeholders:', placeholders);
  
  placeholders.forEach(ph => {
    const value = findVariableForBracketedText(ph.inner, variables);
    console.log(`  [${ph.inner}] => ${value !== null ? value : 'NO MATCH'}`);
  });
  
  const result = replaceVariablesInText(text, variables);
  console.log('Final result:', result);
  
  return result;
}
