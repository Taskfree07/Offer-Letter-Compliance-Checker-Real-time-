
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
    lastUpdated: '2025-10-01',
    sources: [
      {
        url: 'https://dol.ny.gov/system/files/documents/2021/03/ls59.pdf',
        title: 'NY Department of Labor - Wage Theft Prevention Act',
        dateAccessed: '2025-10-01'
      },
      {
        url: 'https://labor.ny.gov',
        title: 'New York State Department of Labor',
        dateAccessed: '2025-10-01'
      }
    ],
    rules: {
      // CRITICAL: Non-compete restrictions
      nonCompete: {
        restricted: true,
        severity: 'warning',
        lawReference: 'New York common law - reasonableness standard',
        message: 'Non-compete agreements are heavily restricted and scrutinized in New York',
        detailedExplanation: 'NY courts require non-competes to be reasonable in scope, time, and geography. They must protect legitimate business interest and cannot be oppressive. Courts frequently invalidate overly broad restrictions.',
        suggestion: 'Use narrow restrictions, limit to 1 year maximum, reasonable geography only. Consider confidentiality agreements instead.',
        actionRequired: 'Review non-compete for reasonableness or remove',
        flaggedPhrases: [
          'restrictions on certain competitive and solicitation activities',
          'competitive activities',
          'restraint of trade',
          'covenant not to compete',
          'competing business',
          'non-compete',
          'noncompete',
          'solicit customers'
        ],
        alternativeLanguage: 'reasonable confidentiality obligations and protection of trade secrets',
        source: 'NY Legal Standards'
      },

      // CRITICAL: Salary history ban
      salaryHistory: {
        prohibited: true,
        severity: 'error',
        lawReference: 'New York Labor Law Section 194-a',
        message: 'Employers CANNOT ask about salary history',
        detailedExplanation: 'New York State and NYC prohibit employers from asking job applicants about their salary history, including compensation and benefits. Cannot rely on salary history in determining compensation.',
        actionRequired: 'Remove all salary history questions immediately',
        flaggedPhrases: [
          'previous salary',
          'current compensation',
          'salary history',
          'what did you earn',
          'compensation at previous job',
          'prior wages',
          'past earnings',
          'previous pay'
        ],
        alternativeLanguage: 'What are your salary expectations for this role?',
        source: 'NY Labor Law Section 194-a'
      },

      // CRITICAL: Pay transparency
      payTransparency: {
        required: true,
        severity: 'error',
        lawReference: 'NY State Pay Transparency Law (Sept 2023) & NYC Local Law 32 (Nov 2022)',
        message: 'Must include salary range in job postings (4+ employees)',
        detailedExplanation: 'Employers with 4+ employees must disclose salary range (minimum to maximum) in all job postings, both external and internal, including promotions and transfers.',
        requirement: 'Include specific salary range showing minimum and maximum',
        actionRequired: 'Ensure salary range is clearly stated in posting and offer',
        flaggedPhrases: [
          'salary to be determined',
          'competitive salary',
          'compensation TBD',
          'salary commensurate with experience',
          'DOE',
          'salary negotiable'
        ],
        alternativeLanguage: 'Salary Range: $XX,XXX - $XX,XXX per year',
        source: 'NY Pay Transparency Law'
      },

      // CRITICAL: Exempt salary thresholds (2025)
      exemptThreshold: {
        required: true,
        severity: 'error',
        lawReference: 'New York Labor Law',
        message: 'Exempt employees must meet NY salary threshold (higher than federal)',
        detailedExplanation: 'NY minimum for exempt status: NYC/LI/Westchester: $64,350/year ($1,237.50/week), Rest of NY: $60,405.80/year ($1,161.65/week). Increases to $66,300 and $62,353.20 on Jan 1, 2026.',
        requirement: 'Salary must meet or exceed NY threshold for exempt classification',
        actionRequired: 'Verify salary meets NY threshold or classify as non-exempt',
        flaggedPhrases: [
          'exempt',
          'salaried exempt',
          'exempt from overtime'
        ],
        bestPractice: 'Clearly state exempt status and ensure salary compliance',
        source: 'NY DOL Wage Orders'
      },

      // REQUIRED: Wage notice
      wageNotice: {
        required: true,
        severity: 'warning',
        lawReference: 'New York Labor Law Section 195 - Wage Theft Prevention Act',
        message: 'Must provide written wage notice at time of hire',
        detailedExplanation: 'Employers must provide written notice including: rate of pay, overtime rate, how paid (hourly/salary/commission), regular payday, employer name/address/phone. Must update within 7 days if changes.',
        requirement: 'Provide LS 59 form or equivalent notice with offer letter',
        actionRequired: 'Include wage notice documentation with offer',
        source: 'NY Wage Theft Prevention Act'
      },

      // REQUIRED: Commissioned salespeople
      commissionedSales: {
        required: true,
        severity: 'warning',
        lawReference: 'New York Labor Law Section 191(1)(c)',
        message: 'Commissioned employees require detailed payment structure disclosure',
        detailedExplanation: 'For commissioned employees, offer letter MUST include: detailed description of how commissions calculated, all payment structure details, information about payment when employment ends.',
        requirement: 'Include comprehensive commission calculation details',
        actionRequired: 'Add detailed commission structure and separation payment terms',
        flaggedPhrases: [
          'commission',
          'commissioned',
          'commission-based'
        ],
        suggestion: 'Include: calculation method, payment schedule, treatment upon termination',
        source: 'NY Labor Law 191(1)(c)'
      },

      // CRITICAL: Background checks
      backgroundChecks: {
        restricted: true,
        severity: 'error',
        lawReference: 'NY Clean Slate Act (Effective Nov 16, 2024) & NYC Fair Chance Act',
        message: 'Criminal background check restrictions - Clean Slate Act in effect',
        detailedExplanation: 'Automatically sealed convictions cannot be accessed or used. NYC Fair Chance Act (4+ employees): Cannot inquire about criminal history until after conditional offer. Must conduct individualized assessment if issues found.',
        requirement: 'Background checks only after conditional offer (NYC). Cannot use sealed convictions.',
        actionRequired: 'Ensure background check occurs after conditional offer made',
        flaggedPhrases: [
          'background check',
          'criminal history',
          'criminal record',
          'prior to employment offer'
        ],
        suggestion: 'Background check contingency acceptable if done post-offer',
        source: 'NY Clean Slate Act & NYC Fair Chance Act'
      },

      // REQUIRED: Paid leave (2025)
      paidLeave: {
        required: true,
        severity: 'warning',
        lawReference: 'NY Paid Prenatal Leave (Effective Jan 1, 2025) & Paid Sick Leave',
        message: 'Must provide paid prenatal leave (20 hours) and paid sick leave',
        detailedExplanation: 'Paid Prenatal Leave: 20 hours per 52 weeks (effective 1/1/25). Paid Sick Leave: 56 hours (100+ employees), 40 hours (5-99 employees), 40 hours unpaid (0-4 employees). Paid Family Leave: up to 12 weeks.',
        requirement: 'Include paid leave benefits information in offer',
        actionRequired: 'Reference paid sick leave, prenatal leave, and paid family leave eligibility',
        bestPractice: 'Include benefits section noting all required leave types',
        source: 'NY Paid Leave Laws'
      },

      // INFO: At-will employment
      atWill: {
        acceptable: true,
        severity: 'info',
        message: 'At-will language is acceptable in New York',
        bestPractice: 'Include clear at-will statement to avoid implied contract claims',
        flaggedPhrases: [
          'at-will',
          'at will'
        ],
        suggestion: 'At-will language is legally protective - include it'
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
    lastUpdated: '2025-10-01',
    sources: [
      {
        url: 'https://www.lni.wa.gov/workers-rights/',
        title: 'Washington State Department of Labor & Industries',
        dateAccessed: '2025-10-01'
      },
      {
        url: 'https://lni.wa.gov',
        title: 'WA L&I Official Site',
        dateAccessed: '2025-10-01'
      }
    ],
    rules: {
      // CRITICAL: Non-compete restrictions
      nonCompete: {
        restricted: true,
        severity: 'error',
        lawReference: 'RCW 49.62 - Washington Non-Compete Law',
        message: 'Non-compete agreements heavily restricted - salary threshold required',
        detailedExplanation: 'Non-competes ONLY enforceable for employees earning $123,394.17+/year (2025 threshold). For independent contractors: $308,485.43+/year. Must be disclosed before job acceptance. Reasonable in scope, time, geography.',
        requirement: 'Can only use for employees above $123,394.17 annual salary',
        actionRequired: 'Remove non-compete OR ensure salary exceeds threshold AND disclose before acceptance',
        flaggedPhrases: [
          'restrictions on certain competitive and solicitation activities',
          'competitive activities',
          'restraint of trade',
          'covenant not to compete',
          'non-compete',
          'noncompete',
          'competing business',
          'solicit customers'
        ],
        suggestion: 'Use confidentiality agreements instead, or ensure salary exceeds $123,394.17 and proper pre-acceptance disclosure',
        alternativeLanguage: 'confidentiality obligations and protection of proprietary information in accordance with Washington law',
        source: 'RCW 49.62'
      },

      // CRITICAL: Salary history ban
      salaryHistory: {
        prohibited: true,
        severity: 'error',
        lawReference: 'RCW 49.58.110 - Equal Pay and Opportunities Act',
        message: 'Employers CANNOT seek salary history information',
        detailedExplanation: 'Washington prohibits employers from seeking wage or salary history from applicants. Employers may discuss expectations after making an offer.',
        actionRequired: 'Remove all salary history questions immediately',
        flaggedPhrases: [
          'previous salary',
          'current compensation',
          'salary history',
          'what did you earn',
          'prior wages',
          'past earnings',
          'compensation at previous job'
        ],
        alternativeLanguage: 'What are your salary expectations for this role?',
        source: 'WA Equal Pay Act'
      },

      // CRITICAL: Pay transparency
      payTransparency: {
        required: true,
        severity: 'error',
        lawReference: 'RCW 49.58.110 - Equal Pay and Opportunities Act (Effective Jan 1, 2023)',
        message: 'Must disclose wage scale or salary range in ALL job postings (15+ employees)',
        detailedExplanation: 'Employers with 15+ employees must include: wage scale/salary range (minimum to maximum) OR fixed wage/salary, plus general description of benefits and other compensation. Applies to Washington-based positions and remote positions.',
        requirement: 'Include specific salary range and benefits description in job postings and offer letters',
        actionRequired: 'Ensure salary range is clearly stated',
        flaggedPhrases: [
          'salary to be determined',
          'competitive salary',
          'compensation TBD',
          'DOE',
          'salary commensurate with experience',
          'starting at $',
          'up to $'
        ],
        alternativeLanguage: 'Salary Range: $XX,XXX - $XX,XXX per year. Benefits: [list benefits]',
        source: 'WA EPOA - 2025 Amendments'
      },

      // CRITICAL: Exempt salary thresholds (2025)
      exemptThreshold: {
        required: true,
        severity: 'error',
        lawReference: 'Washington Administrative Code',
        message: 'Exempt employees must meet WA salary threshold',
        detailedExplanation: 'WA minimum for exempt status (2025): Small employers (1-50): $69,305.60/year ($1,332.80/week), Large employers (51+): $77,968.80/year ($1,499.40/week). 2028: increases to 2.5x minimum wage for ALL. Computer professionals: $58.31/hour minimum.',
        requirement: 'Salary must meet or exceed WA threshold for exempt classification',
        actionRequired: 'Verify salary meets WA threshold or classify as non-exempt',
        flaggedPhrases: [
          'exempt',
          'salaried exempt',
          'exempt from overtime'
        ],
        bestPractice: 'Clearly state exempt status and ensure salary compliance',
        source: 'WA Exempt Salary Rules 2025'
      },

      // REQUIRED: Paid sick leave
      paidSickLeave: {
        required: true,
        severity: 'warning',
        lawReference: 'RCW 49.46.210 - Washington Paid Sick Leave Law',
        message: 'Washington requires paid sick leave for ALL employees',
        detailedExplanation: 'All employees must accrue at least 1 hour of paid sick leave for every 40 hours worked. Can use for own illness, family care, public health emergencies, domestic violence situations.',
        requirement: 'Include paid sick leave policy in offer documentation',
        actionRequired: 'Ensure benefits section includes paid sick leave accrual',
        bestPractice: 'Clearly state: "You will accrue 1 hour of paid sick leave per 40 hours worked"',
        source: 'WA Paid Sick Leave Law'
      },

      // REQUIRED: Paid Family and Medical Leave
      paidFamilyLeave: {
        required: true,
        severity: 'warning',
        lawReference: 'RCW 50A.04 - Washington Paid Family and Medical Leave (PFML)',
        message: 'Washington Paid Family and Medical Leave program',
        detailedExplanation: 'Coverage up to 12 weeks (16-18 weeks in certain circumstances). Up to 90% of average weekly wage (capped). Employee premium shared between employer and employee (50+ employees).',
        requirement: 'Note PFML eligibility in benefits section',
        actionRequired: 'Include PFML in benefits overview',
        bestPractice: 'Reference: "Eligible for Washington Paid Family and Medical Leave"',
        source: 'WA PFML Program'
      },

      // REQUIRED: Lactation accommodation
      lactation: {
        required: true,
        severity: 'warning',
        lawReference: 'Washington Lactation Accommodation Law',
        message: 'Must provide lactation accommodation',
        detailedExplanation: 'Reasonable break time to express breast milk. Private space (not bathroom). For up to 2 years after child\'s birth.',
        requirement: 'Provide lactation accommodation',
        actionRequired: 'Ensure policy is in place',
        bestPractice: 'Note in benefits: "Lactation accommodation provided in accordance with WA law"'
      },

      // REQUIRED: Background checks
      backgroundChecks: {
        restricted: true,
        severity: 'warning',
        lawReference: 'RCW 49.94 - Fair Chance Act',
        message: 'Cannot inquire about criminal history until after determining applicant is otherwise qualified',
        detailedExplanation: 'Fair Chance Act: Cannot inquire about criminal history until after determining applicant is otherwise qualified for position. Some exceptions for certain positions. Must follow FCRA for background checks.',
        requirement: 'Criminal history inquiry only after initial qualification determination',
        actionRequired: 'Ensure background check process follows Fair Chance Act',
        flaggedPhrases: [
          'background check',
          'criminal history',
          'before offer',
          'prior to employment'
        ],
        suggestion: 'Background check contingency acceptable if done after qualification determination',
        source: 'WA Fair Chance Act'
      },

      // INFO: At-will employment
      atWill: {
        acceptable: true,
        severity: 'info',
        message: 'At-will language is acceptable in Washington',
        bestPractice: 'Include clear at-will statement to avoid implied contract claims',
        flaggedPhrases: [
          'at-will',
          'at will'
        ],
        suggestion: 'At-will language is legally protective'
      }
    }
  },

  // Florida State Rules
  FL: {
    state: 'Florida',
    lastUpdated: '2025-10-01',
    sources: [
      {
        url: 'http://www.leg.state.fl.us/statutes/',
        title: 'Florida Statutes',
        dateAccessed: '2025-10-01'
      },
      {
        url: 'https://floridajobs.org',
        title: 'Florida Department of Economic Opportunity',
        dateAccessed: '2025-10-01'
      }
    ],
    rules: {
      // ACCEPTABLE: Non-compete allowed
      nonCompete: {
        acceptable: true,
        severity: 'info',
        lawReference: 'Florida Statute 542.335',
        message: 'Non-compete agreements are ENFORCEABLE in Florida',
        detailedExplanation: 'Florida statute presumes non-competes reasonable if 6 months or less. Up to 2 years acceptable with legitimate business interest. Must be reasonable in time, geography, and scope.',
        bestPractice: 'Keep time restriction to 2 years or less, reasonable geographic scope, protect legitimate business interest',
        flaggedPhrases: [
          'non-compete',
          'competitive activities',
          'restraint of trade'
        ],
        suggestion: 'Non-compete is ENFORCEABLE in Florida - ensure time/geography limits are reasonable (6 months to 2 years)',
        source: 'FL Statute 542.335'
      },

      // INFO: No salary history ban
      salaryHistory: {
        acceptable: true,
        severity: 'info',
        message: 'Florida does NOT prohibit salary history inquiries',
        detailedExplanation: 'Florida has no state law restricting salary history questions. Employers may ask about previous compensation.',
        bestPractice: 'While legal, consider avoiding salary history questions to promote pay equity'
      },

      // INFO: No pay transparency requirement
      payTransparency: {
        notRequired: true,
        severity: 'info',
        message: 'Florida does NOT require salary range disclosure',
        detailedExplanation: 'No Florida law requires disclosure of salary ranges in job postings or offer letters.',
        bestPractice: 'Including salary information is optional but can attract better candidates'
      },

      // INFO: At-will employment (strong protection)
      atWill: {
        acceptable: true,
        severity: 'info',
        message: 'Florida is a strong at-will employment state',
        detailedExplanation: 'Florida strongly favors at-will employment with very limited exceptions.',
        bestPractice: 'Include clear at-will language to maximize employer protection',
        flaggedPhrases: [
          'at-will',
          'at will'
        ],
        suggestion: 'At-will language is strongly recommended in Florida'
      },

      // INFO: Drug testing allowed
      drugScreening: {
        acceptable: true,
        severity: 'info',
        lawReference: 'Florida Statute 440.102',
        message: 'Drug testing is PERMITTED in Florida',
        detailedExplanation: 'Florida allows pre-employment, reasonable suspicion, and random drug testing when properly implemented. Drug-free workplace policies encouraged.',
        bestPractice: 'Ensure drug-free workplace policy is documented',
        flaggedPhrases: [
          'drug test',
          'drug screening',
          'substance test'
        ],
        suggestion: 'Drug testing is legal and acceptable in Florida'
      },

      // CRITICAL: Medical Freedom Act
      medicalFreedom: {
        required: true,
        severity: 'error',
        lawReference: 'Florida Medical Freedom Act',
        message: 'CANNOT require COVID-19 vaccination, testing, or mask-wearing',
        detailedExplanation: 'Florida law prohibits requiring COVID-19 vaccination, COVID-19 testing, mandating mask-wearing, or discriminating based on vaccination/immunity status.',
        actionRequired: 'Remove any COVID-19 vaccination, testing, or mask requirements',
        flaggedPhrases: [
          'COVID-19 vaccination',
          'COVID vaccination required',
          'proof of vaccination',
          'COVID test',
          'mask requirement',
          'vaccination status'
        ],
        suggestion: 'Remove all COVID-19 related requirements',
        source: 'FL Medical Freedom Act'
      },

      // INFO: Minimum wage (2025)
      minimumWage: {
        required: true,
        severity: 'info',
        lawReference: 'Florida Minimum Wage Act (Fla. Stat. § 448.110)',
        message: 'Florida minimum wage increases throughout 2025',
        detailedExplanation: 'Through 9/29/25: $13.00/hour. 9/30/25-9/29/26: $14.00/hour. 9/30/26: $15.00/hour. Tipped employees: Cash wage $9.98 (through 9/29/25), $10.98 (9/30/25-9/29/26), $11.98 (9/30/26).',
        requirement: 'Ensure compensation meets current minimum wage',
        bestPractice: 'Check effective date and ensure compliance with current rate'
      },

      // INFO: Background checks - no state restrictions
      backgroundChecks: {
        acceptable: true,
        severity: 'info',
        lawReference: 'Federal FCRA',
        message: 'Florida has NO statewide ban-the-box law',
        detailedExplanation: 'Can inquire about criminal history on application. Must follow federal FCRA requirements: disclosure, authorization, pre-adverse action, adverse action notices.',
        bestPractice: 'Follow FCRA procedures: standalone disclosure, written authorization, proper notices',
        flaggedPhrases: [
          'background check',
          'criminal history'
        ],
        suggestion: 'Background checks are permitted. Ensure FCRA compliance.'
      }
    }
  },

  // Illinois State Rules
  IL: {
    state: 'Illinois',
    lastUpdated: '2025-10-01',
    sources: [
      {
        url: 'https://www2.illinois.gov/idol/',
        title: 'Illinois Department of Labor',
        dateAccessed: '2025-10-01'
      },
      {
        url: 'https://labor.illinois.gov',
        title: 'IL DOL Official Site',
        dateAccessed: '2025-10-01'
      }
    ],
    rules: {
      // RESTRICTED: Non-compete limitations
      nonCompete: {
        restricted: true,
        severity: 'error',
        lawReference: '820 ILCS 90 - Illinois Freedom to Work Act',
        message: 'Non-compete agreements restricted - $75,000 salary threshold required',
        detailedExplanation: 'Illinois prohibits non-competes for employees earning less than $75,000/year ($45,000 for non-solicitation). Must be reasonable in time, geography, scope and provide adequate consideration.',
        requirement: 'Can only use for employees earning $75,000+ annually',
        actionRequired: 'Ensure salary meets $75,000 threshold OR remove non-compete',
        flaggedPhrases: [
          'restrictions on certain competitive and solicitation activities',
          'competitive activities',
          'non-compete',
          'covenant not to compete',
          'noncompete',
          'restraint of trade',
          'competing business'
        ],
        suggestion: 'Verify salary exceeds $75,000 threshold or use confidentiality agreement instead',
        alternativeLanguage: 'confidentiality and trade secret protection obligations in accordance with Illinois law',
        source: 'IL Freedom to Work Act'
      },

      // CRITICAL: Salary history ban
      salaryHistory: {
        prohibited: true,
        severity: 'error',
        lawReference: '820 ILCS 112/10 - Illinois Equal Pay Act',
        message: 'Employers CANNOT ask about salary history',
        detailedExplanation: 'Illinois prohibits employers from screening applicants based on wage/salary history or seeking such information from applicants or current/former employers.',
        actionRequired: 'Remove all salary history questions immediately',
        flaggedPhrases: [
          'previous salary',
          'current compensation',
          'salary history',
          'prior wages',
          'what did you earn',
          'compensation at previous job',
          'past earnings'
        ],
        alternativeLanguage: 'What are your salary expectations for this role?',
        source: 'IL Equal Pay Act'
      },

      // CRITICAL: Pay transparency
      payTransparency: {
        required: true,
        severity: 'error',
        lawReference: '820 ILCS 112/10 - Illinois Equal Pay Act (Effective Jan 1, 2025)',
        message: 'Must include salary range and benefits in ALL job postings (15+ employees)',
        detailedExplanation: 'Employers with 15+ employees (nationwide count) must include: wage/salary OR wage/salary range ("good faith" expected compensation), plus general description of benefits and other compensation (bonuses, stock, incentives). Applies to jobs performed at least in part in Illinois.',
        requirement: 'Include specific salary range and benefits description',
        actionRequired: 'Ensure salary range and benefits clearly stated in posting',
        flaggedPhrases: [
          'salary to be determined',
          'competitive salary',
          'compensation TBD',
          'DOE',
          'salary commensurate with experience',
          'salary negotiable'
        ],
        alternativeLanguage: 'Salary Range: $XX,XXX - $XX,XXX per year. Benefits: [health insurance, 401(k), PTO, bonuses, etc.]',
        source: 'IL Pay Transparency Law 2025'
      },

      // REQUIRED: Promotional opportunities
      promotionalOpportunities: {
        required: true,
        severity: 'warning',
        lawReference: '820 ILCS 112 - Illinois Equal Pay Act (Effective Jan 1, 2025)',
        message: 'Must announce promotion opportunities to current employees within 14 days',
        detailedExplanation: 'Within 14 calendar days after making external job posting, employer must announce/post/make known promotion opportunities to current employees.',
        requirement: 'Communicate internal promotion opportunities within 14 days of external posting',
        actionRequired: 'Ensure internal promotion posting process is in place',
        bestPractice: 'Post internally within 14 days of external posting',
        source: 'IL Equal Pay Act'
      },

      // REQUIRED: Recordkeeping
      recordkeeping: {
        required: true,
        severity: 'warning',
        lawReference: '820 ILCS 112 - Illinois Equal Pay Act',
        message: 'Must maintain pay scales and job postings for 5 years',
        detailedExplanation: 'Must maintain for 5 years: pay scale and benefits for each position, job posting for each position (if applicable), employee information (name, address, occupation, wages paid).',
        requirement: 'Maintain 5-year records of pay scales, postings, and employee information',
        actionRequired: 'Implement 5-year recordkeeping system',
        bestPractice: 'Set up automated archiving for compliance'
      },

      // REQUIRED: Paid leave
      paidLeave: {
        required: true,
        severity: 'warning',
        lawReference: '820 ILCS 192 - Paid Leave for All Workers Act (Effective Jan 1, 2024)',
        message: 'Illinois requires paid leave for all employees',
        detailedExplanation: 'Accrual: 1 hour per 40 hours worked (up to 40 hours per year). Use: own illness, family care, safety reasons (domestic violence, sexual violence). Applies to ALL employees.',
        requirement: 'Include paid leave policy in offer documentation',
        actionRequired: 'Ensure benefits section includes paid leave accrual',
        bestPractice: 'State: "You will accrue 1 hour of paid leave per 40 hours worked (up to 40 hours annually)"',
        source: 'IL Paid Leave Act'
      },

      // REQUIRED: One day rest in seven
      restDay: {
        required: true,
        severity: 'warning',
        lawReference: '820 ILCS 140 - One Day Rest in Seven Act',
        message: 'Employees must receive 24 consecutive hours of rest per week',
        detailedExplanation: 'Employees must receive at least 24 consecutive hours of rest in every calendar week. Applies to all employers and employees. Some exceptions for specific industries.',
        requirement: 'Ensure work schedules provide one rest day per week',
        actionRequired: 'Include rest day policy',
        bestPractice: 'Note work schedule provides required weekly rest period'
      },

      // WARNING: Background checks
      backgroundChecks: {
        restricted: true,
        severity: 'warning',
        lawReference: '775 ILCS 5/2-103',
        message: 'Criminal background checks have restrictions',
        detailedExplanation: 'Illinois prohibits asking about criminal history until after conditional offer or interview ("ban the box"). Must conduct individualized assessment. Chicago has additional ban-the-box requirements.',
        requirement: 'Criminal history inquiry only after conditional offer or interview',
        actionRequired: 'Ensure background check occurs after conditional offer',
        flaggedPhrases: [
          'background check',
          'criminal history',
          'before offer',
          'prior to interview'
        ],
        suggestion: 'Background check contingency acceptable if done post-offer',
        bestPractice: 'Follow ban-the-box requirements',
        source: 'IL Ban the Box Law'
      },

      // INFO: At-will employment
      atWill: {
        acceptable: true,
        severity: 'info',
        message: 'At-will language is acceptable in Illinois',
        bestPractice: 'Include clear at-will statement',
        flaggedPhrases: [
          'at-will',
          'at will'
        ],
        suggestion: 'At-will language is legally protective'
      }
    }
  }
};