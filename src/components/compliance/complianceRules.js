
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

  // New York State Rules
  NY: {
    state: 'New York',
    lastUpdated: '2025-01-01',
    sources: [
      {
        url: 'https://dol.ny.gov/system/files/documents/2021/03/ls59.pdf',
        title: 'NY Department of Labor - Wage Theft Prevention Act',
        dateAccessed: '2025-01-01'
      }
    ],
    rules: {
      // CRITICAL: Non-compete restrictions (2023 law - pending)
      nonCompete: {
        restricted: true,
        severity: 'warning',
        lawReference: 'New York Labor Law Section 191-d (proposed)',
        message: 'Non-compete agreements are heavily restricted in New York',
        detailedExplanation: 'While not fully prohibited, NY severely limits non-competes. They must be reasonable in time, geography, and scope. Courts often invalidate overly broad restrictions.',
        suggestion: 'Limit non-compete to narrow, reasonable restrictions or use confidentiality agreements instead',
        flaggedPhrases: [
          'restrictions on certain competitive and solicitation activities',
          'competitive activities',
          'restraint of trade',
          'covenant not to compete',
          'competing business',
          'non-compete',
          'noncompete'
        ],
        alternativeLanguage: 'reasonable confidentiality and trade secret protection obligations',
        source: 'NY DOL Guidelines'
      },

      // CRITICAL: Salary history ban
      salaryHistory: {
        prohibited: true,
        severity: 'error',
        lawReference: 'New York Labor Law Section 194-a',
        message: 'Employers cannot ask about salary history',
        detailedExplanation: 'NYC and NYS prohibit employers from asking job applicants about their salary history, including compensation and benefits.',
        actionRequired: 'Remove all salary history questions',
        flaggedPhrases: [
          'previous salary',
          'current compensation',
          'salary history',
          'what did you earn',
          'compensation at previous job',
          'prior wages'
        ],
        source: 'NY Labor Law'
      },

      // REQUIRED: Pay transparency (NYC)
      payTransparency: {
        required: true,
        severity: 'error',
        lawReference: 'NYC Local Law 32 of 2022',
        message: 'NYC employers must include salary range in job postings',
        detailedExplanation: 'Employers with 4+ employees must include minimum and maximum salary in any job advertisement.',
        requirement: 'Include specific salary range in offer letter and job postings',
        actionRequired: 'Ensure salary range is clearly stated',
        flaggedPhrases: [
          'salary to be determined',
          'competitive salary',
          'compensation TBD',
          'salary commensurate with experience'
        ],
        alternativeLanguage: 'Annual Salary Range: $X to $Y',
        source: 'NYC Local Law 32'
      },

      // REQUIRED: Notice requirements
      wageNotice: {
        required: true,
        severity: 'warning',
        lawReference: 'New York Labor Law Section 195',
        message: 'Wage Theft Prevention Act notice required',
        detailedExplanation: 'Employers must provide written notice of wage rate, pay schedule, employer information, and allowances at time of hiring.',
        requirement: 'Provide LS 59 form or equivalent notice with offer letter',
        actionRequired: 'Include wage notice with offer documentation',
        source: 'NY Wage Theft Prevention Act'
      },

      // INFO: At-will employment
      atWill: {
        acceptable: true,
        severity: 'info',
        message: 'At-will language is acceptable in New York',
        bestPractice: 'Clearly state at-will relationship to avoid implied contract claims'
      }
    }
  },

  // Texas State Rules
  TX: {
    state: 'Texas',
    lastUpdated: '2025-01-01',
    sources: [
      {
        url: 'https://www.twc.texas.gov/businesses/employee-rights-laws',
        title: 'Texas Workforce Commission',
        dateAccessed: '2025-01-01'
      }
    ],
    rules: {
      // ACCEPTABLE: Non-compete allowed
      nonCompete: {
        acceptable: true,
        severity: 'info',
        lawReference: 'Texas Business & Commerce Code Section 15.50',
        message: 'Non-compete agreements are enforceable in Texas if reasonable',
        detailedExplanation: 'Texas allows non-competes if they: (1) are ancillary to an otherwise enforceable agreement, (2) contain reasonable time/geographic/scope limits, and (3) do not impose greater restraint than necessary.',
        bestPractice: 'Ensure time limit is reasonable (typically 2 years max), geographic scope is limited, and restrictions are tied to legitimate business interests',
        flaggedPhrases: [
          'non-compete',
          'competitive activities',
          'restraint of trade'
        ],
        suggestion: 'Non-compete is acceptable but ensure reasonableness standards are met',
        source: 'TX Business Code'
      },

      // ACCEPTABLE: At-will employment (strong protection)
      atWill: {
        acceptable: true,
        severity: 'info',
        message: 'Texas is a strong at-will employment state',
        detailedExplanation: 'Texas strongly favors at-will employment. Very limited exceptions exist.',
        bestPractice: 'Include clear at-will language to maximize protection'
      },

      // WARNING: Arbitration clause considerations
      arbitration: {
        acceptable: true,
        severity: 'info',
        lawReference: 'Texas Civil Practice & Remedies Code',
        message: 'Arbitration agreements are generally enforceable in Texas',
        detailedExplanation: 'Texas follows Federal Arbitration Act. Mandatory arbitration is acceptable if agreement is not unconscionable.',
        bestPractice: 'Ensure arbitration clause provides fair procedures and reasonable costs',
        flaggedPhrases: [
          'mandatory arbitration',
          'disputes arising out of'
        ],
        suggestion: 'Arbitration clause is acceptable but ensure fairness standards'
      },

      // INFO: No salary history ban
      salaryHistory: {
        acceptable: true,
        severity: 'info',
        message: 'Texas does not prohibit salary history inquiries',
        detailedExplanation: 'Texas has no state law prohibiting employers from asking about salary history.',
        bestPractice: 'While legal, consider avoiding to promote pay equity'
      },

      // INFO: Payday requirements
      paySchedule: {
        required: true,
        severity: 'info',
        lawReference: 'Texas Labor Code Section 61.011',
        message: 'Texas requires at least monthly paydays',
        detailedExplanation: 'Employers must pay employees at least once per month. Exempt employees can be paid less frequently if agreed.',
        requirement: 'Ensure pay frequency is stated and at least monthly',
        bestPractice: 'Semi-monthly or bi-weekly is common and acceptable'
      }
    }
  },

  // Washington State Rules
  WA: {
    state: 'Washington',
    lastUpdated: '2025-01-01',
    sources: [
      {
        url: 'https://www.lni.wa.gov/workers-rights/',
        title: 'Washington State Department of Labor & Industries',
        dateAccessed: '2025-01-01'
      }
    ],
    rules: {
      // CRITICAL: Non-compete restrictions
      nonCompete: {
        restricted: true,
        severity: 'error',
        lawReference: 'RCW 49.62',
        message: 'Non-compete agreements are heavily restricted in Washington',
        detailedExplanation: 'Washington prohibits non-competes for employees earning less than $116,593 annually (2024 threshold). Even for higher earners, agreements must be reasonable and disclosed before acceptance of employment.',
        requirement: 'Can only use for employees earning above threshold, must disclose before job acceptance',
        actionRequired: 'Remove or limit non-compete based on salary threshold',
        flaggedPhrases: [
          'restrictions on certain competitive and solicitation activities',
          'competitive activities',
          'restraint of trade',
          'covenant not to compete',
          'non-compete',
          'noncompete'
        ],
        suggestion: 'Use confidentiality agreements instead, or ensure salary exceeds threshold and proper disclosure is made',
        alternativeLanguage: 'confidentiality obligations and protection of proprietary information',
        source: 'RCW 49.62'
      },

      // CRITICAL: Salary history ban
      salaryHistory: {
        prohibited: true,
        severity: 'error',
        lawReference: 'RCW 49.58.110',
        message: 'Employers cannot seek salary history information',
        detailedExplanation: 'Washington prohibits employers from seeking wage or salary history from applicants. Employers may discuss expectations after making an offer.',
        actionRequired: 'Remove all salary history questions',
        flaggedPhrases: [
          'previous salary',
          'current compensation',
          'salary history',
          'what did you earn',
          'prior wages'
        ],
        source: 'WA Equal Pay Act'
      },

      // REQUIRED: Pay transparency
      payTransparency: {
        required: true,
        severity: 'error',
        lawReference: 'RCW 49.58.110',
        message: 'Must disclose wage scale or salary range in job postings',
        detailedExplanation: 'Washington requires employers to disclose wage scale or salary range in all job postings.',
        requirement: 'Include specific salary range in offer letter and postings',
        actionRequired: 'Ensure salary range is clearly stated',
        flaggedPhrases: [
          'salary to be determined',
          'competitive salary',
          'compensation TBD'
        ],
        alternativeLanguage: 'Annual Salary Range: $X to $Y',
        source: 'WA Equal Pay Act'
      },

      // INFO: Paid sick leave
      paidSickLeave: {
        required: true,
        severity: 'warning',
        lawReference: 'RCW 49.46.210',
        message: 'Washington requires paid sick leave',
        detailedExplanation: 'All employees must accrue at least 1 hour of paid sick leave for every 40 hours worked.',
        requirement: 'Include paid sick leave policy in offer documentation',
        actionRequired: 'Ensure benefits section includes paid sick leave',
        bestPractice: 'Clearly state sick leave accrual rate and usage policies'
      },

      // INFO: At-will employment
      atWill: {
        acceptable: true,
        severity: 'info',
        message: 'At-will language is acceptable in Washington',
        bestPractice: 'Include clear at-will statement to avoid implied contract claims'
      }
    }
  },

  // Florida State Rules
  FL: {
    state: 'Florida',
    lastUpdated: '2025-01-01',
    sources: [
      {
        url: 'http://www.leg.state.fl.us/statutes/',
        title: 'Florida Statutes',
        dateAccessed: '2025-01-01'
      }
    ],
    rules: {
      // ACCEPTABLE: Non-compete allowed
      nonCompete: {
        acceptable: true,
        severity: 'info',
        lawReference: 'Florida Statute 542.335',
        message: 'Non-compete agreements are enforceable in Florida',
        detailedExplanation: 'Florida statute presumes non-competes reasonable if 6 months or less. Up to 2 years is acceptable with legitimate business interest.',
        bestPractice: 'Keep time restriction to 2 years or less, reasonable geographic scope',
        flaggedPhrases: [
          'non-compete',
          'competitive activities'
        ],
        suggestion: 'Non-compete is acceptable but ensure time/geography limits are reasonable',
        source: 'FL Statute 542.335'
      },

      // INFO: No salary history ban
      salaryHistory: {
        acceptable: true,
        severity: 'info',
        message: 'Florida does not prohibit salary history inquiries',
        detailedExplanation: 'Florida has no state law restricting salary history questions.'
      },

      // INFO: At-will employment (strong protection)
      atWill: {
        acceptable: true,
        severity: 'info',
        message: 'Florida is a strong at-will employment state',
        bestPractice: 'Include clear at-will language'
      },

      // INFO: Private sector drug testing allowed
      drugScreening: {
        acceptable: true,
        severity: 'info',
        lawReference: 'Florida Statute 440.102',
        message: 'Drug testing is permitted in Florida',
        detailedExplanation: 'Florida allows pre-employment, reasonable suspicion, and random drug testing when properly implemented.',
        bestPractice: 'Ensure drug-free workplace policy is documented'
      }
    }
  },

  // Illinois State Rules
  IL: {
    state: 'Illinois',
    lastUpdated: '2025-01-01',
    sources: [
      {
        url: 'https://www2.illinois.gov/idol/',
        title: 'Illinois Department of Labor',
        dateAccessed: '2025-01-01'
      }
    ],
    rules: {
      // RESTRICTED: Non-compete limitations
      nonCompete: {
        restricted: true,
        severity: 'warning',
        lawReference: '820 ILCS 90 (Illinois Freedom to Work Act)',
        message: 'Non-compete agreements are restricted in Illinois',
        detailedExplanation: 'Illinois prohibits non-competes for employees earning less than $75,000/year ($45,000 for non-solicitation). Must be reasonable and provide adequate consideration.',
        requirement: 'Can only use for employees above salary threshold',
        actionRequired: 'Ensure salary meets threshold or remove non-compete',
        flaggedPhrases: [
          'restrictions on certain competitive and solicitation activities',
          'competitive activities',
          'non-compete',
          'covenant not to compete'
        ],
        suggestion: 'Verify salary exceeds $75,000 threshold or use confidentiality agreement instead',
        alternativeLanguage: 'confidentiality and trade secret protection obligations',
        source: 'IL Freedom to Work Act'
      },

      // CRITICAL: Salary history ban
      salaryHistory: {
        prohibited: true,
        severity: 'error',
        lawReference: '820 ILCS 112/10',
        message: 'Employers cannot ask about salary history',
        detailedExplanation: 'Illinois prohibits employers from screening applicants based on wage/salary history or seeking such information.',
        actionRequired: 'Remove all salary history questions',
        flaggedPhrases: [
          'previous salary',
          'current compensation',
          'salary history',
          'prior wages'
        ],
        source: 'IL Equal Pay Act'
      },

      // REQUIRED: Pay transparency
      payTransparency: {
        required: true,
        severity: 'warning',
        lawReference: '820 ILCS 112/10',
        message: 'Must provide pay scale and benefits upon request',
        detailedExplanation: 'Illinois requires employers to provide pay scale and benefits for the position to applicants upon request.',
        requirement: 'Be prepared to disclose full compensation details',
        actionRequired: 'Include clear salary information in offer',
        bestPractice: 'Proactively include salary range in offer letter'
      },

      // INFO: At-will employment
      atWill: {
        acceptable: true,
        severity: 'info',
        message: 'At-will language is acceptable in Illinois',
        bestPractice: 'Include clear at-will statement'
      },

      // WARNING: Criminal background checks
      backgroundChecks: {
        restricted: true,
        severity: 'warning',
        lawReference: '775 ILCS 5/2-103',
        message: 'Criminal background checks have restrictions',
        detailedExplanation: 'Illinois prohibits asking about criminal history until after conditional offer or interview. Must conduct individualized assessment.',
        actionRequired: 'Ensure background checks occur after conditional offer',
        bestPractice: 'Follow "ban the box" requirements'
      }
    }
  }
};

export default COMPLIANCE_RULES;