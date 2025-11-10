// DeepSeek AI-Powered Compliance Service
// Analyzes documents for state-specific employment law compliance

import { getApiConfig, isApiKeyConfigured } from '../config/apiConfig';

/**
 * US States configuration with full names
 */
export const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
  { code: 'DC', name: 'District of Columbia' },
];

/**
 * Get state name from code
 */
const getStateName = (stateCode) => {
  const state = US_STATES.find(s => s.code === stateCode);
  return state ? state.name : stateCode;
};

/**
 * Call DeepSeek API for compliance analysis
 * @param {string} documentText - The full text of the document to analyze
 * @param {string} stateCode - US state code (e.g., 'CA', 'NY')
 * @returns {Promise<object>} - Compliance analysis results
 */
export const analyzeDocumentCompliance = async (documentText, stateCode) => {
  // Check if API key is configured
  if (!isApiKeyConfigured('deepseek')) {
    throw new Error('DeepSeek API key not configured. Please add your API key in the settings.');
  }

  const config = getApiConfig('deepseek');
  const stateName = getStateName(stateCode);

  // Build the prompt for DeepSeek
  const prompt = `You are an expert employment law attorney specializing in ${stateName} employment regulations and compliance.

Analyze the following employment document (offer letter/employment agreement) for compliance with ${stateName} employment laws as of 2025.

Document Text:
"""
${documentText}
"""

Please analyze this document and identify:

1. **Critical Compliance Issues (Errors)**: Legal violations that make clauses void, unenforceable, or expose the employer to liability under ${stateName} law. Include specific legal citations.

2. **Warnings**: Clauses that may be problematic, require review, or have specific ${stateName} requirements.

3. **Required Disclosures**: Any mandatory disclosures, notices, or language required by ${stateName} law that may be missing.

For each issue found, provide:
- **Severity**: "error" (critical/illegal), "warning" (needs review), or "info" (best practice)
- **Issue Title**: Brief description (e.g., "Non-Compete Clause Violation")
- **Legal Reference**: Specific ${stateName} statute, code section, or regulation
- **Flagged Text**: The exact problematic text from the document
- **Explanation**: Why this is an issue under ${stateName} law
- **Action Required**: What must be done to fix it
- **Suggested Fix**: Compliant alternative language if applicable

Respond in valid JSON format with this structure:
{
  "state": "${stateCode}",
  "stateName": "${stateName}",
  "analysisDate": "YYYY-MM-DD",
  "isCompliant": boolean,
  "issues": [
    {
      "severity": "error|warning|info",
      "title": "Issue title",
      "legalReference": "Citation",
      "flaggedText": "Exact text from document",
      "explanation": "Why this is problematic",
      "actionRequired": "What to do",
      "suggestedFix": "Compliant alternative text",
      "category": "non-compete|salary-history|background-checks|arbitration|pay-transparency|at-will|other"
    }
  ],
  "summary": {
    "totalIssues": number,
    "errors": number,
    "warnings": number,
    "info": number
  },
  "recommendations": ["General recommendations for compliance"]
}

IMPORTANT: Return ONLY valid JSON. Do not include any markdown formatting, code blocks, or explanatory text outside the JSON.`;

  try {
    console.log(`🤖 Calling DeepSeek API for ${stateName} compliance analysis...`);

    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: 'system',
            content: `You are an expert employment law attorney specializing in US state-specific employment regulations. You provide detailed compliance analysis in JSON format only.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3, // Lower temperature for more consistent, factual responses
        max_tokens: 4000,
        response_format: { type: 'json_object' }, // Request JSON response if API supports it
      }),
      signal: AbortSignal.timeout(config.timeout),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `DeepSeek API error (${response.status}): ${errorData.error?.message || errorData.message || 'Unknown error'}`
      );
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from DeepSeek API');
    }

    const content = data.choices[0].message.content;

    // Parse the JSON response
    let analysis;
    try {
      // Remove any markdown code blocks if present
      const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysis = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Failed to parse DeepSeek response:', content);
      throw new Error('Failed to parse compliance analysis response. The AI returned invalid JSON.');
    }

    // Validate the response structure
    if (!analysis.issues || !Array.isArray(analysis.issues)) {
      throw new Error('Invalid analysis format: missing or invalid issues array');
    }

    console.log(`✅ DeepSeek analysis complete: ${analysis.issues.length} issues found`);

    return analysis;
  } catch (error) {
    console.error('DeepSeek API error:', error);

    if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
      throw new Error('Request timed out. Please try again.');
    }

    if (error.message.includes('API key')) {
      throw new Error('Invalid API key. Please check your DeepSeek API key in settings.');
    }

    throw error;
  }
};

/**
 * Analyze specific text snippet for compliance
 * (For real-time inline checking)
 * @param {string} text - Text snippet to analyze
 * @param {string} stateCode - US state code
 * @returns {Promise<object>} - Quick compliance check result
 */
export const quickComplianceCheck = async (text, stateCode) => {
  if (!isApiKeyConfigured('deepseek')) {
    throw new Error('DeepSeek API key not configured');
  }

  const config = getApiConfig('deepseek');
  const stateName = getStateName(stateCode);

  const prompt = `As an employment law expert for ${stateName}, quickly analyze this text snippet for compliance issues:

"${text}"

Return JSON with any issues found:
{
  "hasIssue": boolean,
  "severity": "error|warning|info",
  "issue": "Brief description",
  "legalReference": "Citation if applicable"
}`;

  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: 'You are an employment law expert. Return only JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 500,
      }),
      signal: AbortSignal.timeout(10000), // 10 second timeout for quick checks
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    return JSON.parse(cleanedContent);
  } catch (error) {
    console.error('Quick compliance check error:', error);
    return { hasIssue: false, error: error.message };
  }
};

/**
 * Convert DeepSeek analysis to the format expected by ComplianceAnalysis component
 * @param {object} deepseekAnalysis - Analysis from DeepSeek
 * @returns {object} - Formatted for UI components
 */
export const formatAnalysisForUI = (deepseekAnalysis) => {
  const criticalIssues = deepseekAnalysis.issues.filter(i => i.severity === 'error');
  const warnings = deepseekAnalysis.issues.filter(i => i.severity === 'warning');
  const infos = deepseekAnalysis.issues.filter(i => i.severity === 'info');

  return {
    state: deepseekAnalysis.state,
    stateName: deepseekAnalysis.stateName,
    analysisDate: deepseekAnalysis.analysisDate,
    isCompliant: deepseekAnalysis.isCompliant,
    criticalIssues: {
      count: criticalIssues.length,
      items: criticalIssues.map(issue => ({
        message: issue.title,
        lawReference: issue.legalReference,
        flaggedText: issue.flaggedText,
        actionRequired: issue.actionRequired,
        suggestion: issue.explanation,
        alternativeLanguage: issue.suggestedFix,
      }))
    },
    warnings: {
      count: warnings.length,
      items: warnings.map(issue => ({
        message: issue.title,
        lawReference: issue.legalReference,
        flaggedText: issue.flaggedText,
        suggestion: issue.explanation,
      }))
    },
    infos: {
      count: infos.length,
      items: infos.map(issue => ({
        message: issue.title,
        suggestion: issue.explanation,
      }))
    },
    totalIssues: deepseekAnalysis.issues.length,
    recommendations: deepseekAnalysis.recommendations || [],
  };
};

export default {
  analyzeDocumentCompliance,
  quickComplianceCheck,
  formatAnalysisForUI,
  US_STATES,
};
