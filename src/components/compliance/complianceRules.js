
export const COMPLIANCE_RULES = {
  CA: {
    state: 'California',
    lastUpdated: '2025-01-24',
    sources: [
      {
        url: 'https://advocacy.calchamber.com/2025/01/24/2025-compliance-checklist-key-hr-practices-for-employers',
        title: 'CalChamber 2025 Compliance Checklist',
        dateAccessed: '2025-01-19'
      },
      {
        url: 'https://www.dir.ca.gov/dlse/',
        title: 'California Department of Industrial Relations',
        dateAccessed: '2025-01-19'
      }
    ],
    rules: {
      // CRITICAL: Non-compete clauses
      nonCompete: {
        prohibited: true,
        severity: 'error',
        lawReference: 'California Business & Professions Code Section 16600',
        message: 'Non-compete clauses are VOID and unenforceable in California',
        detailedExplanation: 'California B&P Code 16600 makes any contract that restrains trade void. This includes non-compete, non-solicitation of customers, and broadly written non-solicitation of employees.',
        suggestion: 'Remove all competitive restriction language. Use only confidentiality and trade secret protection.',
        actionRequired: 'MUST REMOVE - This clause is void and unenforceable',
        flaggedPhrases: [
          'restrictions on certain competitive and solicitation activities',
          'competitive activities',
          'solicitation activities', 
          'restraint of trade',
          'covenant not to compete',
          'competing business',
          'non-compete',
          'noncompete',
          'solicit customers',
          'compete directly'
        ],
        alternativeLanguage: 'confidentiality obligations and protection of trade secrets in accordance with California law',
        source: 'CalChamber 2025 Guide'
      },

      // WARNING: Salary history restrictions
      salaryHistory: {
        prohibited: true,
        severity: 'error',
        lawReference: 'California Labor Code Section 432.3',
        message: 'Employers are prohibited from asking applicants about their salary history',
        detailedExplanation: 'California prohibits employers from seeking salary history information from applicants, either orally or in writing, personally or through an agent.',
        suggestion: 'Remove any requests for previous compensation information',
        actionRequired: 'Remove any salary history questions from application process',
        flaggedPhrases: [
          'previous salary',
          'current compensation',
          'salary history',
          'what did you earn',
          'compensation at previous job',
          'prior wages',
          'past earnings'
        ],
        source: 'CalChamber 2025 Guide'
      },

      // WARNING: Background check timing
      backgroundChecks: {
        timing: 'after conditional offer only',
        severity: 'error',
        lawReference: 'California Fair Chance Act (Labor Code Section 432.9)',
        message: 'Criminal background checks can only occur AFTER conditional offer is made',
        detailedExplanation: 'The Fair Chance Act requires employers to make a conditional offer before conducting criminal background checks, then conduct individualized assessment if issues are found.',
        actionRequired: 'Ensure background checks occur only after conditional offer',
        flaggedPhrases: [
          'background check before offer',
          'criminal history inquiry',
          'prior to employment offer'
        ],
        process: [
          'Make conditional offer first',
          'Then conduct background check', 
          'If issues found, conduct individualized assessment',
          'Give applicant chance to provide additional information'
        ],
        source: 'CalChamber 2025 Guide'
      },

      // WARNING: Drug screening updates
      drugScreening: {
        restricted: true,
        severity: 'warning',
        lawReference: 'California Government Code Section 12954 & Fair Employment and Housing Act',
        message: 'Cannot discriminate against off-job cannabis use',
        detailedExplanation: 'Employers cannot discriminate against employees for off-duty cannabis use. Drug screenings must avoid testing for non-psychoactive cannabis metabolites.',
        requirement: 'Drug screenings must avoid testing for non-psychoactive cannabis metabolites',
        actionRequired: 'Work with drug screening vendors to ensure compliance',
        flaggedPhrases: [
          'drug test',
          'substance screening',
          'marijuana test',
          'cannabis screening'
        ],
        suggestion: 'Specify compliance with California cannabis protection laws',
        alternativeLanguage: 'drug screening conducted in compliance with California Fair Employment and Housing Act',
        source: 'CalChamber 2025 Guide'
      },

      // WARNING: Arbitration restrictions
      arbitration: {
        restricted: true,
        severity: 'warning',
        lawReference: 'California Code of Civil Procedure Section 1281',
        message: 'Mandatory arbitration clauses have specific requirements in California',
        detailedExplanation: 'While arbitration clauses are generally enforceable, they cannot be unconscionable and must provide reasonable procedures. Courts scrutinize mandatory arbitration more closely.',
        suggestion: 'Consider making arbitration optional or ensure clause meets California fairness standards',
        flaggedPhrases: [
          'will be resolved using',
          'mandatory arbitration',
          'exclusive remedy',
          'arbitration procedures',
          'disputes arising out of'
        ],
        alternativeLanguage: 'Any disputes may be resolved through arbitration if both parties agree, using fair and neutral procedures',
        source: 'Employment Law Updates'
      },

      // INFO: At-will employment
      atWill: {
        acceptable: true,
        severity: 'info',
        message: 'At-will language is acceptable in California',
        bestPractice: 'Ensure language is clear and not contradicted by other contract terms',
        flaggedPhrases: [
          'at-will',
          'at will',
          'terminate employment at any time'
        ],
        suggestion: 'Language is acceptable but ensure it\'s not contradicted elsewhere in contract'
      },

      // INFO: Pay transparency (new requirement)
      payTransparency: {
        required: true,
        severity: 'warning',
        lawReference: 'California Labor Code Section 432.3',
        message: 'Large employers must provide pay scale disclosure',
        detailedExplanation: 'Employers with 15+ employees must provide pay scale for positions upon request or in job postings.',
        flaggedPhrases: [
          'salary to be determined',
          'competitive salary',
          'compensation TBD'
        ],
        suggestion: 'Include specific salary range or amount as you currently do',
        alternativeLanguage: 'Annual Salary: $X - $Y based on experience and qualifications',
        source: 'CalChamber 2025 Guide'
      },

      // PLACEHOLDER FOR NEW RULES - Add extracted rules from websites here
      // When you provide new California law websites, I'll extract rules in this format:
      /*
      newRuleName: {
        severity: 'error|warning|info',
        message: 'Description of what this rule covers',
        lawReference: 'Specific legal citation',
        source: 'Website or document name',
        actionRequired: 'What action is needed',
        flaggedPhrases: ['phrases', 'that trigger', 'this rule'],
        suggestion: 'How to fix the issue',
        alternativeLanguage: 'Suggested replacement text'
      }
      */
    }
  },

  // Future state rules can be added here
  NY: {
    state: 'New York',
    lastUpdated: '2025-01-01', 
    rules: {
      // Add New York rules as needed
    }
  },

  TX: {
    state: 'Texas',
    lastUpdated: '2025-01-01',
    rules: {
      // Add Texas rules as needed
    }
  },

  // Add more states as needed
  WA: {
    state: 'Washington',
    lastUpdated: '2025-01-01',
    rules: {
      // Add Washington rules as needed
    }
  }
};

export default COMPLIANCE_RULES;