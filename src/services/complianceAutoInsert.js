// src/services/complianceAutoInsert.js

import { COMPLIANCE_RULES } from '../components/compliance/complianceRules';

// Heuristics to detect if a rule is already "present" in the content
function ruleAppearsInContent(content, rule) {
  const hay = (content || '').toLowerCase();

  // 1) Flagged phrases
  if (Array.isArray(rule.flaggedPhrases)) {
    const any = rule.flaggedPhrases.some(p => hay.includes(String(p).toLowerCase()));
    if (any) return true;
  }

  // 2) Alternative language
  if (rule.alternativeLanguage && hay.includes(String(rule.alternativeLanguage).toLowerCase())) {
    return true;
  }

  // 3) Law reference
  if (rule.lawReference && hay.includes(String(rule.lawReference).toLowerCase())) {
    return true;
  }

  return false;
}

// Build a clause block for insertion
function buildClauseBlock(ruleKey, rule) {
  const title = rule.message || ruleKey;
  const cite = rule.lawReference ? ` (${rule.lawReference})` : '';
  const body = rule.alternativeLanguage || rule.suggestion || 'This clause is recommended to ensure compliance.';

  return [
    '',
    '',
    `<!-- [AUTO_ADDED_CLAUSE:${ruleKey}] -->`,
    `<h3>${title}${cite}</h3>`,
    `<p>${body}</p>`,
    `<!-- [/AUTO_ADDED_CLAUSE:${ruleKey}] -->`,
    ''
  ].join('\n');
}

/**
 * Ensure compliance clauses exist in the content, inserting missing ones.
 * @param {string} content - Current template content (HTML/text)
 * @param {string} stateCode - e.g., 'CA'
 * @param {object} options - { modes: { required: true, warnings: true, info: false } }
 * @returns {{ content: string, addedClauses: Array<{key:string,severity:string,title:string,reference?:string}> }}
 */
export function ensureComplianceClauses(content, stateCode = 'CA', options = {}) {
  const state = COMPLIANCE_RULES[stateCode];
  if (!state || !state.rules) return { content, addedClauses: [] };

  const { modes = { required: true, warnings: true, info: false } } = options;

  const rules = state.rules;
  const addedClauses = [];
  let updated = content || '';

  Object.entries(rules).forEach(([ruleKey, rule]) => {
    const severity = rule.severity || 'info';

    // Decide if this type should be auto-inserted
    const shouldInsert =
      (severity === 'error'   && modes.required) ||
      (severity === 'warning' && modes.warnings) ||
      (severity === 'info'    && modes.info);

    if (!shouldInsert) return;

    // If it already appears, skip
    if (ruleAppearsInContent(updated, rule)) return;

    // Don’t double-insert (check marker)
    const marker = `<!-- [AUTO_ADDED_CLAUSE:${ruleKey}] -->`;
    if (updated.includes(marker)) return;

    // Build and append clause
    const block = buildClauseBlock(ruleKey, rule);
    updated = `${updated}\n${block}`;
    addedClauses.push({
      key: ruleKey,
      severity,
      title: rule.message || ruleKey,
      reference: rule.lawReference || null
    });
  });

  return { content: updated, addedClauses };
}

/**
 * Build a minimal variables map based on common entities detected.
 * @param {Array} entities - Array of {text,label,...}
 * @returns {Object} variables map
 */
export function buildVariablesFromEntities(entities = []) {
  const vars = {};
  const pickFirst = (label) => entities.find(e => e.label === label)?.text;

  const candidate = pickFirst('PERSON');
  if (candidate) vars['CANDIDATE_NAME'] = candidate;

  const org = pickFirst('ORG');
  if (org) vars['COMPANY_NAME'] = org;

  const job = pickFirst('JOB_TITLE');
  if (job) vars['POSITION'] = job;

  const salary = entities.find(e => e.label === 'MONEY' || e.label === 'SALARY')?.text;
  if (salary) vars['SALARY'] = salary;

  const startDate = pickFirst('DATE');
  if (startDate) vars['START_DATE'] = startDate;

  const email = pickFirst('EMAIL');
  if (email) vars['EMAIL_ADDRESS'] = email;

  const phone = pickFirst('PHONE');
  if (phone) vars['PHONE_NUMBER'] = phone;

  const age = pickFirst('AGE');
  if (age) vars['AGE'] = age;

  const dob = pickFirst('DOB');
  if (dob) vars['DATE_OF_BIRTH'] = dob;

  return vars;
}
