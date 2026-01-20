/**
 * Compliance Service - Connects frontend to backend RAG + LLM compliance analysis
 */

import { API_BASE_URL } from '../config/constants';

/**
 * Analyze document for compliance violations using backend RAG + LLM
 * @param {string} documentText - The offer letter text to analyze
 * @param {string} state - Two-letter state code (e.g., 'CA', 'NY')
 * @param {object} options - Optional analysis options
 * @returns {Promise<object>} Analysis results with violations
 */
export async function analyzeCompliance(documentText, state, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v2/compliance-check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        document_text: documentText,
        state: state.toUpperCase(),
        options: {
          min_confidence: options.minConfidence || 0.3,
          include_suggestions: true,
          ...options
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      violations: data.violations || [],
      summary: data.summary || {},
      state: state,
      totalViolations: data.total_violations || 0,
      analysisMethod: 'backend-llm'
    };
  } catch (error) {
    console.error('Backend compliance analysis failed:', error);
    return {
      success: false,
      error: error.message,
      violations: [],
      analysisMethod: 'backend-llm'
    };
  }
}

/**
 * Check if backend compliance service is available
 * @returns {Promise<boolean>}
 */
export async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v2/health`, {
      method: 'GET',
      timeout: 5000
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get list of supported states from backend
 * @returns {Promise<string[]>}
 */
export async function getSupportedStates() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v2/states`);
    if (response.ok) {
      const data = await response.json();
      return data.states || [];
    }
  } catch {
    // Return empty array if backend is not available
  }
  return [];
}

export default {
  analyzeCompliance,
  checkBackendHealth,
  getSupportedStates
};
