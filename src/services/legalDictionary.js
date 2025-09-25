// src/services/legalDictionary.js

import { COMPLIANCE_RULES } from '../components/compliance/complianceRules';

const NLP_BASE_URL = 'http://127.0.0.1:5000';

/**
 * Collect legal/compliance phrases from COMPLIANCE_RULES for a state.
 * It aggregates all rule.flaggedPhrases into a flat list.
 */
export function collectPhrasesForState(stateCode = 'CA') {
  const state = COMPLIANCE_RULES[stateCode];
  if (!state || !state.rules) return [];
  const phrases = [];
  for (const rule of Object.values(state.rules)) {
    if (Array.isArray(rule.flaggedPhrases)) {
      rule.flaggedPhrases.forEach(p => {
        if (typeof p === 'string' && p.trim()) {
          phrases.push(p.trim());
        }
      });
    }
  }
  // De-duplicate (case-insensitive)
  const seen = new Set();
  return phrases.filter(p => {
    const key = p.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Push phrases into backend EntityRuler. The backend will tag them as LEGAL_POLICY.
 */
export async function loadLegalDictionary(phrases, label = 'LEGAL_POLICY') {
  if (!Array.isArray(phrases) || phrases.length === 0) return { success: true, count: 0 };
  try {
    const res = await fetch(`${NLP_BASE_URL}/api/load-legal-dictionary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phrases, label })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load legal dictionary');
    return data;
  } catch (e) {
    console.warn('Failed to load legal dictionary:', e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Convenience function: collect phrases for a state and push to backend.
 */
export async function syncCompliancePhrases(stateCode = 'CA') {
  const phrases = collectPhrasesForState(stateCode);
  return await loadLegalDictionary(phrases, 'LEGAL_POLICY');
}
