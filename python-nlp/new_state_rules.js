
  // ==================== ALABAMA ====================
  AL: {
    state: 'Alabama',
    lastUpdated: '2026-01-19',
    sources: [{ url: "https://al.gov/labor", title: "Alabama Department of Labor" }],
    rules: {
      non_compete: {
        severity: 'info',
        lawReference: 'Alabama Code § 8-1-190 et seq.',
        message: 'Non-compete agreements are ENFORCEABLE if reasonable',
        flaggedPhrases: ['non compete']
      },
      salary_history: {
        severity: 'info',
        lawReference: 'No statutory prohibition',
        message: 'Salary history inquiries are PERMITTED in Alabama',
        flaggedPhrases: ['salary history']
      },
      pay_transparency: {
        severity: 'info',
        lawReference: 'No statutory requirement',
        message: 'NO pay transparency or salary disclosure requirements',
        flaggedPhrases: ['pay transparency']
      },
      background_checks_and_fcra: {
        severity: 'info',
        lawReference: 'Federal FCRA only',
        message: 'Background checks permitted at any stage - NO ban-the-box law',
        flaggedPhrases: ['background checks and fcra']
      },
      drug_screening: {
        severity: 'info',
        lawReference: 'Alabama Drug-Free Workplace Program (optional)',
        message: 'Drug testing PERMITTED and ENCOURAGED',
        flaggedPhrases: ['drug screening']
      },
      arbitration: {
        severity: 'info',
        lawReference: 'Federal Arbitration Act',
        message: 'Arbitration agreements are ENFORCEABLE',
        flaggedPhrases: ['arbitration']
      },
      at_will_employment: {
        severity: 'info',
        lawReference: 'Alabama common law',
        message: 'At-will employment STRONGLY PROTECTED in Alabama',
        flaggedPhrases: ['at will employment']
      },
      minimum_wage: {
        severity: 'info',
        lawReference: 'Federal FLSA (no state minimum)',
        message: 'NO state minimum wage - federal $7.25/hour applies',
        flaggedPhrases: ['minimum wage']
      },
      paid_leave_and_required_time_off: {
        severity: 'info',
        lawReference: 'No state mandate',
        message: 'NO state-mandated paid sick leave or paid family leave',
        flaggedPhrases: ['paid leave and required time off']
      },
      final_pay: {
        severity: 'info',
        lawReference: 'No specific statute',
        message: 'Final paycheck timing not specified by state law',
        flaggedPhrases: ['final pay']
      },
      right_to_work: {
        severity: 'info',
        lawReference: 'Alabama Constitution Amendment 772 & Alabama Code § 25-7-30',
        message: 'Alabama is a RIGHT TO WORK state',
        flaggedPhrases: ['right to work']
      },
      breaks: {
        severity: 'warning',
        lawReference: 'No state requirement',
        message: 'NO required meal or rest breaks for adults',
        flaggedPhrases: ['breaks']
      },
      childLaborLaws: {
        severity: 'info',
        lawReference: 'Alabama Child Labor Law',
        message: 'Strict child labor restrictions apply',
        flaggedPhrases: ['childLaborLaws']
      },
    }
  },

  // ==================== ALASKA ====================
  AK: {
    state: 'Alaska',
    lastUpdated: '2026-01-19',
    sources: [{ url: "https://ak.gov/labor", title: "Alaska Department of Labor" }],
    rules: {
      non_compete: {
        severity: 'info',
        lawReference: 'Alaska Statute § 45.50.910 (Trade Secret Act)',
        message: 'Non-competes DISFAVORED - very limited enforceability',
        flaggedPhrases: ['non compete']
      },
      salary_history: {
        severity: 'info',
        lawReference: 'No statutory prohibition',
        message: 'Salary history inquiries PERMITTED',
        flaggedPhrases: ['salary history']
      },
      pay_transparency: {
        severity: 'info',
        lawReference: 'No statutory requirement',
        message: 'NO pay transparency requirements',
        flaggedPhrases: ['pay transparency']
      },
      background_checks_and_fcra: {
        severity: 'info',
        lawReference: 'Federal FCRA',
        message: 'Background checks permitted at any stage',
        flaggedPhrases: ['background checks and fcra']
      },
      minimum_wage: {
        severity: 'info',
        lawReference: 'Alaska Statute § 23.10.065',
        message: 'Alaska minimum wage: $11.91/hour (2026)',
        flaggedPhrases: ['minimum wage']
      },
      breaks: {
        severity: 'warning',
        lawReference: 'Alaska Statute § 23.10.065',
        message: '30-minute meal break REQUIRED for 5+ hour shifts',
        flaggedPhrases: ['breaks']
      },
      paid_leave_and_required_time_off: {
        severity: 'info',
        lawReference: 'No state mandate',
        message: 'NO state-mandated paid leave',
        flaggedPhrases: ['paid leave and required time off']
      },
      drug_screening: {
        severity: 'info',
        lawReference: 'No restrictions',
        message: 'Drug testing PERMITTED',
        flaggedPhrases: ['drug screening']
      },
      final_pay: {
        severity: 'info',
        lawReference: 'Alaska Statute § 23.05.140',
        message: 'Final wages due within 3 WORKING DAYS of termination',
        flaggedPhrases: ['final pay']
      },
      at_will_employment: {
        severity: 'info',
        lawReference: 'Alaska common law',
        message: 'At-will employment applies',
        flaggedPhrases: ['at will employment']
      },
      arbitration: {
        severity: 'info',
        lawReference: 'Alaska common law',
        message: 'Arbitration agreements enforceable',
        flaggedPhrases: ['arbitration']
      },
      pay_frequency: {
        severity: 'warning',
        lawReference: 'Alaska Statute § 23.05.140',
        message: 'Must pay employees semi-monthly or monthly',
        flaggedPhrases: ['pay frequency']
      },
    }
  },

  // ==================== ARIZONA ====================
  AZ: {
    state: 'Arizona',
    lastUpdated: '2026-01-19',
    sources: [{ url: "https://az.gov/labor", title: "Arizona Department of Labor" }],
    rules: {
      non_compete: {
        severity: 'warning',
        message: 'Arizona enforces non-compete agreements but with statutory restrictions. A.R.S. § 23-494 allows non-competes that are reasonable in time, geographic area, and scope. Courts will reform unreasonable pr',
        flaggedPhrases: ['non compete']
      },
      salary_history: {
        severity: 'info',
        message: 'Arizona has NO statewide salary history ban. Employers may ask about and consider applicant salary history when setting compensation. No state-level restrictions on salary history inquiries.',
        flaggedPhrases: ['salary history']
      },
      pay_transparency: {
        severity: 'info',
        message: 'Arizona has NO statewide pay transparency law requiring salary ranges in job postings. No requirement to disclose compensation ranges to applicants or employees. No pay data reporting mandates.',
        flaggedPhrases: ['pay transparency']
      },
      background_checks: {
        severity: 'warning',
        message: 'Arizona has limited ban-the-box protections. Executive Order 2017-07 prohibits state agencies from asking about criminal history on initial applications. Private employers generally can ask about crim',
        flaggedPhrases: ['background checks']
      },
      paid_leave: {
        severity: 'info',
        message: 'Arizona has NO statewide paid sick leave or paid leave mandate for private employers. No state law requires employers to provide paid or unpaid sick leave beyond federal FMLA. Some local jurisdictions',
        flaggedPhrases: ['paid leave']
      },
      arbitration: {
        severity: 'warning',
        message: 'Arizona generally enforces arbitration agreements under federal and state law. Follows Federal Arbitration Act. Arizona has enacted Uniform Arbitration Act. Agreements must be clear, mutual, and not u',
        flaggedPhrases: ['arbitration']
      },
      at_will_employment: {
        severity: 'info',
        message: 'Arizona follows at-will employment doctrine. Either party can terminate employment at any time for any legal reason or no reason. Exceptions exist for discrimination, retaliation, public policy violat',
        flaggedPhrases: ['at will employment']
      },
      drug_screening: {
        severity: 'info',
        message: 'Arizona has NO state statute restricting private employer drug testing. Employers may conduct pre-employment, random, reasonable suspicion, and post-accident testing. Medical marijuana users have limi',
        flaggedPhrases: ['drug screening']
      },
    }
  },

  // ==================== ARKANSAS ====================
  AR: {
    state: 'Arkansas',
    lastUpdated: '2026-01-19',
    sources: [{ url: "https://ar.gov/labor", title: "Arkansas Department of Labor" }],
    rules: {
      non_compete: {
        severity: 'info',
        lawReference: 'Arkansas Code § 4-75-101 et seq.',
        message: 'Non-competes ENFORCEABLE if reasonable',
        flaggedPhrases: ['non compete']
      },
      salary_history: {
        severity: 'info',
        lawReference: 'Arkansas common law',
        message: 'Salary history inquiries PERMITTED',
        flaggedPhrases: ['salary history']
      },
      pay_transparency: {
        severity: 'info',
        lawReference: 'Arkansas common law',
        message: 'NO pay transparency requirements',
        flaggedPhrases: ['pay transparency']
      },
      background_checks_and_fcra: {
        severity: 'info',
        lawReference: 'Arkansas common law',
        message: 'Background checks permitted any stage',
        flaggedPhrases: ['background checks and fcra']
      },
      minimum_wage: {
        severity: 'info',
        lawReference: 'Arkansas Code § 11-4-210',
        message: 'Arkansas minimum wage: $11.00/hour (2021-present)',
        flaggedPhrases: ['minimum wage']
      },
      paid_leave_and_required_time_off: {
        severity: 'info',
        lawReference: 'Arkansas common law',
        message: 'NO state-mandated paid leave',
        flaggedPhrases: ['paid leave and required time off']
      },
      drug_screening: {
        severity: 'info',
        lawReference: 'Arkansas common law',
        message: 'Drug testing PERMITTED and ENCOURAGED',
        flaggedPhrases: ['drug screening']
      },
      at_will_employment: {
        severity: 'info',
        lawReference: 'Arkansas common law',
        message: 'At-will employment applies',
        flaggedPhrases: ['at will employment']
      },
      arbitration: {
        severity: 'info',
        lawReference: 'Arkansas common law',
        message: 'Arbitration enforceable',
        flaggedPhrases: ['arbitration']
      },
      final_pay: {
        severity: 'info',
        lawReference: 'Arkansas Code § 11-4-405',
        message: 'Final wages due within 7 days of discharge or termination',
        flaggedPhrases: ['final pay']
      },
      right_to_work: {
        severity: 'info',
        lawReference: 'Arkansas Constitution Amendment 34',
        message: 'Arkansas is RIGHT TO WORK state',
        flaggedPhrases: ['right to work']
      },
    }
  },

  // ==================== COLORADO ====================
  CO: {
    state: 'Colorado',
    lastUpdated: '2026-01-19',
    sources: [{ url: "https://co.gov/labor", title: "Colorado Department of Labor" }],
    rules: {
      non_compete: {
        severity: 'info',
        message: 'Colorado heavily restricts non-compete agreements. C.R.S. § 8-2-113 generally prohibits non-competes except for: (1) executives earning $112,500+ (threshold adjusted for inflation), (2) purchase/sale ',
        flaggedPhrases: ['non compete']
      },
      salary_history: {
        severity: 'info',
        message: 'Colorado prohibits employers from asking about salary history. Under the Equal Pay for Equal Work Act, employers cannot seek wage history from applicants or rely on it in determining compensation. App',
        flaggedPhrases: ['salary history']
      },
      pay_transparency: {
        severity: 'warning',
        message: 'Colorado has STRONG pay transparency requirements under the Equal Pay for Equal Work Act. Employers must include compensation and benefits in ALL job postings (including remote positions). Must notify',
        flaggedPhrases: ['pay transparency']
      },
      background_checks: {
        severity: 'warning',
        message: 'Colorado has ban-the-box protections. Employers cannot ask about criminal history on initial application. Cannot inquire until later in hiring process. Must comply with federal FCRA and Colorado\'s fa',
        flaggedPhrases: ['background checks']
      },
      paid_leave: {
        severity: 'info',
        message: 'Colorado has comprehensive paid family and medical leave through FAMLI (Family and Medical Leave Insurance). Provides up to 12 weeks paid leave for most reasons, 16 weeks for pregnancy complications. ',
        flaggedPhrases: ['paid leave']
      },
      arbitration: {
        severity: 'warning',
        message: 'Colorado enforces arbitration agreements under federal and state law but with some employee protections. Follows Federal Arbitration Act. Colorado Uniform Arbitration Act governs. Must be fair and not',
        flaggedPhrases: ['arbitration']
      },
      at_will_employment: {
        severity: 'info',
        message: 'Colorado follows at-will employment doctrine with exceptions. Either party can terminate employment for any legal reason. Exceptions exist for discrimination, retaliation, public policy violations, an',
        flaggedPhrases: ['at will employment']
      },
      drug_screening: {
        severity: 'info',
        message: 'Colorado restricts drug testing for marijuana. C.R.S. § 24-34-402.5 protects lawful off-duty activities including marijuana use. Employers cannot discriminate based on off-duty marijuana use unless it',
        flaggedPhrases: ['drug screening']
      },
    }
  },

  // ==================== CONNECTICUT ====================
  CT: {
    state: 'Connecticut',
    lastUpdated: '2026-01-19',
    sources: [{ url: "https://ct.gov/labor", title: "Connecticut Department of Labor" }],
    rules: {
      salary_history: {
        severity: 'error',
        lawReference: 'Conn. Gen. Stat. § 31-40z',
        message: 'Employers are prohibited from asking applicants about wage or salary history or relying on such information when determining compensation.',
        flaggedPhrases: ['salary history']
      },
      pay_transparency_and_pay_equity: {
        severity: 'warning',
        lawReference: 'Conn. Gen. Stat. § 31-40z; Connecticut Equal Pay Act',
        message: 'Employers must disclose wage ranges to applicants and employees and must ensure equal pay for comparable work unless justified by lawful factors.',
        flaggedPhrases: ['pay transparency and pay equity']
      },
      non_compete: {
        severity: 'error',
        lawReference: 'Conn. Gen. Stat. § 20-14p (physicians); common law',
        message: 'Non-competes are governed by common law reasonableness. Non-competes for physicians are statutorily prohibited.',
        flaggedPhrases: ['non compete']
      },
      background_checks_and_fcra: {
        severity: 'warning',
        lawReference: 'Conn. Gen. Stat. § 46a-80; Fair Credit Reporting Act (15 U.S.C. § 1681)',
        message: 'Employers must follow anti-discrimination rules when using criminal history and must comply with federal FCRA procedures when using consumer reports.',
        flaggedPhrases: ['background checks and fcra']
      },
      paid_leave_and_required_time_off: {
        severity: 'info',
        lawReference: 'Conn. Gen. Stat. § 31-57r et seq.; § 51-247a (jury duty); § 31-51ll (lactation)',
        message: 'Connecticut mandates paid sick leave and also protects certain statutory leaves such as jury duty, voting leave, and lactation accommodations.',
        flaggedPhrases: ['paid leave and required time off']
      },
      drug_screening_and_cannabis_protections: {
        severity: 'info',
        lawReference: 'Conn. Gen. Stat. § 21a-408p; Responsible and Equitable Regulation of Adult-Use Cannabis Act',
        message: 'Connecticut prohibits discrimination against registered medical marijuana users and provides employment protections for off-duty cannabis use, with exceptions.',
        flaggedPhrases: ['drug screening and cannabis protections']
      },
      arbitration: {
        severity: 'warning',
        lawReference: 'Federal Arbitration Act; Connecticut contract law',
        message: 'Arbitration agreements are generally enforceable but must be procedurally fair and not unconscionable.',
        flaggedPhrases: ['arbitration']
      },
      at_will_employment: {
        severity: 'info',
        lawReference: 'Common law; Connecticut Fair Employment Practices Act (CFEPA)',
        message: 'Employment is presumed at-will but subject to numerous statutory and common law exceptions.',
        flaggedPhrases: ['at will employment']
      },
      anti_discrimination_and_harassment: {
        severity: 'info',
        lawReference: 'Conn. Gen. Stat. § 46a-60 et seq. (CFEPA)',
        message: 'Connecticut law prohibits discrimination and harassment based on a wide range of protected characteristics beyond federal law.',
        flaggedPhrases: ['anti discrimination and harassment']
      },
    }
  },

  // ==================== DELAWARE ====================
  DE: {
    state: 'Delaware',
    lastUpdated: '2026-01-19',
    sources: [{ url: "https://de.gov/labor", title: "Delaware Department of Labor" }],
    rules: {
      non_compete: {
        severity: 'info',
        lawReference: 'Delaware Code Title 19 § 4104',
        message: 'Non-competes RESTRICTED - scrutinized closely',
        flaggedPhrases: ['non compete']
      },
      salary_history: {
        severity: 'info',
        lawReference: 'Delaware Code Title 19 § 709B',
        message: 'CANNOT inquire about salary history',
        flaggedPhrases: ['salary history']
      },
      pay_transparency: {
        severity: 'info',
        lawReference: 'Delaware common law',
        message: 'NO pay transparency mandate currently',
        flaggedPhrases: ['pay transparency']
      },
      background_checks_and_fcra: {
        severity: 'info',
        lawReference: 'Delaware Ban the Box Law',
        message: 'Cannot inquire about criminal history on initial application',
        flaggedPhrases: ['background checks and fcra']
      },
      minimum_wage: {
        severity: 'info',
        lawReference: 'Delaware Code Title 19 § 902',
        message: 'Delaware minimum wage: $13.25/hour (2025), $15.00/hour (January 1, 2026)',
        flaggedPhrases: ['minimum wage']
      },
      paid_leave_and_required_time_off: {
        severity: 'warning',
        lawReference: 'Delaware Healthy Delaware Families Act',
        message: 'PAID SICK LEAVE REQUIRED (2025)',
        flaggedPhrases: ['paid leave and required time off']
      },
      at_will_employment: {
        severity: 'info',
        lawReference: 'Delaware common law',
        message: 'At-will employment applies',
        flaggedPhrases: ['at will employment']
      },
      arbitration: {
        severity: 'info',
        lawReference: 'Delaware common law',
        message: 'Arbitration enforceable',
        flaggedPhrases: ['arbitration']
      },
      drug_screening: {
        severity: 'info',
        lawReference: 'Delaware common law',
        message: 'Drug testing permitted',
        flaggedPhrases: ['drug screening']
      },
      final_pay: {
        severity: 'info',
        lawReference: 'Delaware Code Title 19 § 1103',
        message: 'Final wages due next regular payday',
        flaggedPhrases: ['final pay']
      },
    }
  },

  // ==================== GEORGIA ====================
  GA: {
    state: 'Georgia',
    lastUpdated: '2026-01-19',
    sources: [{ url: "https://ga.gov/labor", title: "Georgia Department of Labor" }],
    rules: {
      non_compete: {
        severity: 'warning',
        lawReference: 'O.C.G.A. § 34-2-2 (Non-Compete Agreements); O.C.G.A. § 10-2-2 (Trade Secrets)',
        message: 'Georgia enforces non-compete agreements. O.C.G.A. § 34-2-2 provides statutory framework. Non-compete must be reasonable in time (typically 2-3 years), geography, and scope. Must protect legitimate bus',
        flaggedPhrases: ['non compete']
      },
      salary_history: {
        severity: 'info',
        lawReference: 'Federal Equal Pay Act (29 U.S.C. § 206(d)); Title VII (42 U.S.C. § 2000e); Georgia Code lacks specific ban',
        message: 'Georgia does NOT have statewide salary history ban. Employers may inquire about and consider past compensation. Federal equal pay principles apply (cannot use to justify discriminatory gaps). No local',
        flaggedPhrases: ['salary history']
      },
      pay_transparency: {
        severity: 'info',
        lawReference: 'Federal Equal Pay Act (29 U.S.C. § 206(d)); Federal OFCCP Rules for Federal Contractors',
        message: 'Georgia does NOT require pay transparency in job postings or employee communications at state level. No state-level pay range requirement. Federal contractors subject to pay equity audit requirements ',
        flaggedPhrases: ['pay transparency']
      },
      background_checks: {
        severity: 'info',
        lawReference: 'Fair Credit Reporting Act (15 U.S.C. § 1681); Georgia Code § 34-7-2 (limited provisions); Federal ADA (42 U.S.C. § 12101)',
        message: 'Georgia follows federal FCRA requirements. No state-specific ban-the-box law. Employers may conduct background checks at any time subject to FCRA compliance (written consent, pre-adverse and final adv',
        flaggedPhrases: ['background checks']
      },
      paid_leave: {
        severity: 'info',
        lawReference: 'Federal Family and Medical Leave Act (29 U.S.C. § 2601 et seq.); No comprehensive Georgia paid leave mandate',
        message: 'Georgia does NOT mandate paid sick leave or paid family leave for private employers. Federal FMLA applies to employers with 50+ employees. No state-run paid leave program. Private employers free to se',
        flaggedPhrases: ['paid leave']
      },
      arbitration: {
        severity: 'warning',
        lawReference: 'Federal Arbitration Act (9 U.S.C. § 1 et seq.); Georgia Uniform Arbitration Act (O.C.G.A. § 34-34-1 et seq.)',
        message: 'Georgia enforces arbitration agreements under Federal Arbitration Act (FAA). Must be clear mutual agreement in writing. Courts scrutinize for unconscionability but generally favor arbitration. Class a',
        flaggedPhrases: ['arbitration']
      },
      at_will_employment: {
        severity: 'info',
        lawReference: 'Georgia Common Law; O.C.G.A. § 34-7-2 (Protection Against Employer Retaliation); Federal Laws',
        message: 'Georgia follows at-will employment doctrine. Either party can terminate for any reason without cause or notice (absent contract/policy creating obligation). Exceptions: cannot terminate for illegal re',
        flaggedPhrases: ['at will employment']
      },
      drug_screening: {
        severity: 'info',
        lawReference: 'Georgia law lacks comprehensive drug testing statute; follows common law; Federal Drug-Free Workplace Act (41 U.S.C. § 8101); Federal ADA (42 U.S.C. § 12101)',
        message: 'Georgia allows drug testing under reasonable circumstances. No specific restrictions on pre-employment testing. Post-employment random testing permitted if policy provides. Marijuana (both recreationa',
        flaggedPhrases: ['drug screening']
      },
    }
  },

  // ==================== HAWAII ====================
  HI: {
    state: 'Hawaii',
    lastUpdated: '2026-01-19',
    sources: [{ url: "https://hi.gov/labor", title: "Hawaii Department of Labor" }],
    rules: {
      non_compete: {
        severity: 'error',
        lawReference: 'Hawaii Revised Statutes § 480-4(c)',
        message: 'Non-competes PROHIBITED for most tech/creative workers',
        flaggedPhrases: ['non compete']
      },
      salary_history: {
        severity: 'info',
        lawReference: 'Hawaii Revised Statutes § 378-2.3',
        message: 'CANNOT inquire about salary history',
        flaggedPhrases: ['salary history']
      },
      pay_transparency: {
        severity: 'info',
        lawReference: 'Hawaii common law',
        message: 'NO pay transparency requirement currently',
        flaggedPhrases: ['pay transparency']
      },
      background_checks_and_fcra: {
        severity: 'info',
        lawReference: 'Hawaii Fair Chance Law',
        message: 'Cannot inquire about convictions until after conditional offer',
        flaggedPhrases: ['background checks and fcra']
      },
      minimum_wage: {
        severity: 'info',
        lawReference: 'Hawaii Revised Statutes § 387-2',
        message: 'Hawaii minimum wage: $14.00/hour (2024-2027), $18.00/hour by 2028',
        flaggedPhrases: ['minimum wage']
      },
      paid_leave_and_required_time_off: {
        severity: 'warning',
        lawReference: 'Hawaii Family Leave Law & Temp Disability Insurance',
        message: 'Temporary Disability Insurance (TDI) and family leave required',
        flaggedPhrases: ['paid leave and required time off']
      },
      at_will_employment: {
        severity: 'info',
        lawReference: 'Hawaii common law',
        message: 'At-will employment applies with some exceptions',
        flaggedPhrases: ['at will employment']
      },
      arbitration: {
        severity: 'info',
        lawReference: 'Hawaii common law',
        message: 'Arbitration enforceable',
        flaggedPhrases: ['arbitration']
      },
      drug_screening: {
        severity: 'info',
        lawReference: 'Hawaii medical cannabis protections',
        message: 'Cannot discriminate against medical cannabis users',
        flaggedPhrases: ['drug screening']
      },
      final_pay: {
        severity: 'info',
        lawReference: 'Hawaii Revised Statutes § 388-3',
        message: 'Final wages due immediately or next business day',
        flaggedPhrases: ['final pay']
      },
    }
  },

  // ==================== IDAHO ====================
  ID: {
    state: 'Idaho',
    lastUpdated: '2026-01-19',
    sources: [{ url: "https://id.gov/labor", title: "Idaho Department of Labor" }],
    rules: {
      non_compete: {
        severity: 'info',
        lawReference: 'Idaho Code § 44-2701 et seq.',
        message: 'Non-competes ENFORCEABLE if reasonable',
        flaggedPhrases: ['non compete']
      },
      salary_history: {
        severity: 'info',
        lawReference: 'Idaho common law',
        message: 'Salary history inquiries PERMITTED',
        flaggedPhrases: ['salary history']
      },
      pay_transparency: {
        severity: 'info',
        lawReference: 'Idaho common law',
        message: 'NO pay transparency requirements',
        flaggedPhrases: ['pay transparency']
      },
      background_checks_and_fcra: {
        severity: 'info',
        lawReference: 'Idaho common law',
        message: 'Background checks permitted any stage',
        flaggedPhrases: ['background checks and fcra']
      },
      minimum_wage: {
        severity: 'info',
        lawReference: 'Idaho Code § 44-1502',
        message: 'Idaho follows federal minimum wage: $7.25/hour',
        flaggedPhrases: ['minimum wage']
      },
      paid_leave_and_required_time_off: {
        severity: 'info',
        lawReference: 'Idaho common law',
        message: 'NO state-mandated paid leave',
        flaggedPhrases: ['paid leave and required time off']
      },
      drug_screening: {
        severity: 'info',
        lawReference: 'Idaho common law',
        message: 'Drug testing PERMITTED',
        flaggedPhrases: ['drug screening']
      },
      at_will_employment: {
        severity: 'info',
        lawReference: 'Idaho common law',
        message: 'At-will employment applies',
        flaggedPhrases: ['at will employment']
      },
      arbitration: {
        severity: 'info',
        lawReference: 'Idaho common law',
        message: 'Arbitration enforceable',
        flaggedPhrases: ['arbitration']
      },
      final_pay: {
        severity: 'info',
        lawReference: 'Idaho Code § 45-606',
        message: 'Final wages due next payday or within 10 days',
        flaggedPhrases: ['final pay']
      },
      right_to_work: {
        severity: 'info',
        lawReference: 'Idaho Code § 44-2001',
        message: 'Idaho is RIGHT TO WORK state',
        flaggedPhrases: ['right to work']
      },
      breaks: {
        severity: 'warning',
        lawReference: 'Idaho common law',
        message: 'NO required meal or rest breaks for adults',
        flaggedPhrases: ['breaks']
      },
    }
  },

  // ==================== INDIANA ====================
  IN: {
    state: 'Indiana',
    lastUpdated: '2026-01-19',
    sources: [{ url: "https://in.gov/labor", title: "Indiana Department of Labor" }],
    rules: {
      non_compete: {
        severity: 'info',
        lawReference: 'State law and federal law as applicable',
        message: 'Indiana enforces non-compete agreements if reasonable in scope, duration, and geography and supported by legitimate business interests.',
        flaggedPhrases: ['non compete']
      },
      salary_history: {
        severity: 'info',
        lawReference: 'State law and federal law as applicable',
        message: 'Indiana has no statewide salary history ban.',
        flaggedPhrases: ['salary history']
      },
      pay_transparency: {
        severity: 'info',
        lawReference: 'State law and federal law as applicable',
        message: 'Indiana has no statewide pay transparency requirement.',
        flaggedPhrases: ['pay transparency']
      },
      background_checks: {
        severity: 'info',
        lawReference: 'State law and federal law as applicable',
        message: 'Indiana follows federal FCRA requirements; no statewide ban-the-box law.',
        flaggedPhrases: ['background checks']
      },
      paid_leave: {
        severity: 'info',
        lawReference: 'State law and federal law as applicable',
        message: 'Indiana does not mandate paid sick or family leave for private employers.',
        flaggedPhrases: ['paid leave']
      },
      drug_screening: {
        severity: 'info',
        lawReference: 'State law and federal law as applicable',
        message: 'Indiana permits drug testing under employer policies.',
        flaggedPhrases: ['drug screening']
      },
      arbitration: {
        severity: 'info',
        lawReference: 'State law and federal law as applicable',
        message: 'Indiana enforces arbitration agreements under the FAA.',
        flaggedPhrases: ['arbitration']
      },
      at_will: {
        severity: 'info',
        lawReference: 'State law and federal law as applicable',
        message: 'Indiana follows at-will employment with standard exceptions.',
        flaggedPhrases: ['at will']
      },
    }
  },

  // ==================== IOWA ====================
  IA: {
    state: 'Iowa',
    lastUpdated: '2026-01-19',
    sources: [{ url: "https://ia.gov/labor", title: "Iowa Department of Labor" }],
    rules: {
      salary_history: {
        severity: 'info',
        lawReference: 'No statewide statute',
        message: 'Iowa does not have a statewide law prohibiting employers from asking applicants about salary history.',
        flaggedPhrases: ['salary history']
      },
      pay_transparency: {
        severity: 'info',
        lawReference: 'No current statute mandating pay transparency',
        message: 'Iowa does not require employers to disclose wage ranges in job postings or offer letters.',
        flaggedPhrases: ['pay transparency']
      },
      non_compete: {
        severity: 'info',
        lawReference: 'Iowa common law',
        message: 'Non-compete agreements are generally enforceable in Iowa if reasonable in scope, duration, and geography and if they protect legitimate business interests.',
        flaggedPhrases: ['non compete']
      },
      background_checks_and_fcra: {
        severity: 'info',
        lawReference: 'Fair Credit Reporting Act (15 U.S.C. § 1681)',
        message: 'Iowa does not have a statewide ban-the-box law for private employers, but federal FCRA requirements apply when using background check vendors.',
        flaggedPhrases: ['background checks and fcra']
      },
      paid_leave_and_required_time_off: {
        severity: 'info',
        lawReference: 'Iowa Code § 607A.1 (jury duty); § 49.109 (voting leave)',
        message: 'Iowa does not mandate paid sick leave statewide but protects certain civic leave rights.',
        flaggedPhrases: ['paid leave and required time off']
      },
      drug_screening: {
        severity: 'info',
        lawReference: 'Iowa Code § 730.5 (drug testing procedures)',
        message: 'Iowa permits workplace drug testing and does not provide employment protections for recreational cannabis use.',
        flaggedPhrases: ['drug screening']
      },
      arbitration: {
        severity: 'info',
        lawReference: 'Federal Arbitration Act; Iowa Uniform Arbitration Act',
        message: 'Arbitration agreements are generally enforceable in Iowa if consistent with contract law and federal arbitration principles.',
        flaggedPhrases: ['arbitration']
      },
      at_will_employment: {
        severity: 'info',
        lawReference: 'Iowa common law',
        message: 'Iowa follows the at-will employment doctrine, subject to statutory, contractual, and public policy exceptions.',
        flaggedPhrases: ['at will employment']
      },
      anti_discrimination_and_harassment: {
        severity: 'info',
        lawReference: 'Iowa Civil Rights Act (Iowa Code § 216.6)',
        message: 'Iowa law prohibits discrimination in employment based on protected characteristics.',
        flaggedPhrases: ['anti discrimination and harassment']
      },
    }
  },

  // ==================== KANSAS ====================
  KS: {
    state: 'Kansas',
    lastUpdated: '2026-01-19',
    sources: [{ url: "https://ks.gov/labor", title: "Kansas Department of Labor" }],
    rules: {
      salary_history: {
        severity: 'info',
        lawReference: 'No statewide statute',
        message: 'Kansas does not have a statewide law prohibiting employers from asking applicants about salary history.',
        flaggedPhrases: ['salary history']
      },
      pay_transparency: {
        severity: 'info',
        lawReference: 'No current Kansas statute mandating pay transparency',
        message: 'Kansas does not require employers to disclose wage ranges in job postings or offer letters.',
        flaggedPhrases: ['pay transparency']
      },
      non_compete: {
        severity: 'info',
        lawReference: 'Kansas common law (e.g., Weber v. Tillman, 913 P.2d 84 (Kan. 1996))',
        message: 'Non-compete agreements are generally enforceable in Kansas if reasonable in scope, duration, and geographic area and if they protect legitimate business interests.',
        flaggedPhrases: ['non compete']
      },
      background_checks_and_fcra: {
        severity: 'info',
        lawReference: 'Fair Credit Reporting Act (15 U.S.C. § 1681)',
        message: 'Kansas does not have a statewide ban-the-box law for private employers, but federal FCRA requirements apply when using third-party background check providers.',
        flaggedPhrases: ['background checks and fcra']
      },
      paid_leave_and_required_time_off: {
        severity: 'info',
        lawReference: 'K.S.A. § 43-173 (jury duty); K.S.A. § 25-418 (voting leave)',
        message: 'Kansas does not mandate paid sick leave statewide but requires protection for civic leave such as jury duty and voting.',
        flaggedPhrases: ['paid leave and required time off']
      },
      drug_screening: {
        severity: 'info',
        lawReference: 'Kansas common law; criminal statutes governing marijuana',
        message: 'Kansas permits workplace drug testing and does not provide employment protections for recreational cannabis use.',
        flaggedPhrases: ['drug screening']
      },
      arbitration: {
        severity: 'info',
        lawReference: 'Federal Arbitration Act; Kansas Uniform Arbitration Act (K.S.A. § 5-401 et seq.)',
        message: 'Arbitration agreements are generally enforceable in Kansas if they comply with contract law principles and federal arbitration law.',
        flaggedPhrases: ['arbitration']
      },
      at_will_employment: {
        severity: 'info',
        lawReference: 'Kansas common law',
        message: 'Kansas follows the at-will employment doctrine, subject to exceptions for contracts, statutory protections, and public policy.',
        flaggedPhrases: ['at will employment']
      },
      anti_discrimination_and_harassment: {
        severity: 'info',
        lawReference: 'Kansas Act Against Discrimination (K.S.A. § 44-1001 et seq.)',
        message: 'Kansas law prohibits discrimination in employment based on protected characteristics.',
        flaggedPhrases: ['anti discrimination and harassment']
      },
    }
  },

  // ==================== KENTUCKY ====================
  KY: {
    state: 'Kentucky',
    lastUpdated: '2026-01-19',
    sources: [{ url: "https://ky.gov/labor", title: "Kentucky Department of Labor" }],
    rules: {
      non_compete: {
        severity: 'info',
        lawReference: 'Kentucky Revised Statutes § 365.350 et seq.',
        message: 'Non-competes ENFORCEABLE if reasonable',
        flaggedPhrases: ['non compete']
      },
      salary_history: {
        severity: 'info',
        lawReference: 'Kentucky common law',
        message: 'Salary history inquiries PERMITTED',
        flaggedPhrases: ['salary history']
      },
      pay_transparency: {
        severity: 'info',
        lawReference: 'Kentucky common law',
        message: 'NO pay transparency requirements',
        flaggedPhrases: ['pay transparency']
      },
      background_checks_and_fcra: {
        severity: 'info',
        lawReference: 'Kentucky common law',
        message: 'Background checks permitted any stage',
        flaggedPhrases: ['background checks and fcra']
      },
      minimum_wage: {
        severity: 'info',
        lawReference: 'Kentucky Revised Statutes § 337.275',
        message: 'Kentucky follows federal minimum: $7.25/hour',
        flaggedPhrases: ['minimum wage']
      },
      paid_leave_and_required_time_off: {
        severity: 'info',
        lawReference: 'Kentucky common law',
        message: 'NO state-mandated paid leave',
        flaggedPhrases: ['paid leave and required time off']
      },
      drug_screening: {
        severity: 'info',
        lawReference: 'Kentucky common law',
        message: 'Drug testing PERMITTED and ENCOURAGED',
        flaggedPhrases: ['drug screening']
      },
      at_will_employment: {
        severity: 'info',
        lawReference: 'Kentucky common law',
        message: 'At-will employment applies',
        flaggedPhrases: ['at will employment']
      },
      arbitration: {
        severity: 'info',
        lawReference: 'Kentucky common law',
        message: 'Arbitration enforceable',
        flaggedPhrases: ['arbitration']
      },
      final_pay: {
        severity: 'info',
        lawReference: 'Kentucky Revised Statutes § 337.055',
        message: 'Final wages due next regular payday or within 14 days',
        flaggedPhrases: ['final pay']
      },
      right_to_work: {
        severity: 'info',
        lawReference: 'Kentucky Constitution § 241',
        message: 'Kentucky is RIGHT TO WORK state',
        flaggedPhrases: ['right to work']
      },
      breaks: {
        severity: 'warning',
        lawReference: 'Kentucky Revised Statutes § 337.355',
        message: 'Meal break REQUIRED for 3-5 hour shifts',
        flaggedPhrases: ['breaks']
      },
    }
  },

  // ==================== LOUISIANA ====================
  LA: {
    state: 'Louisiana',
    lastUpdated: '2026-01-19',
    sources: [{ url: "https://la.gov/labor", title: "Louisiana Department of Labor" }],
    rules: {
      non_compete: {
        severity: 'info',
        lawReference: 'Louisiana Revised Statutes § 23:921',
        message: 'Non-competes ENFORCEABLE under specific statutory requirements',
        flaggedPhrases: ['non compete']
      },
      salary_history: {
        severity: 'info',
        lawReference: 'Louisiana common law',
        message: 'Salary history inquiries PERMITTED',
        flaggedPhrases: ['salary history']
      },
      pay_transparency: {
        severity: 'info',
        lawReference: 'Louisiana common law',
        message: 'NO pay transparency requirements',
        flaggedPhrases: ['pay transparency']
      },
      background_checks_and_fcra: {
        severity: 'info',
        lawReference: 'Louisiana common law',
        message: 'Background checks permitted any stage',
        flaggedPhrases: ['background checks and fcra']
      },
      minimum_wage: {
        severity: 'info',
        lawReference: 'Federal FLSA (no state minimum)',
        message: 'Louisiana has NO state minimum wage - federal $7.25 applies',
        flaggedPhrases: ['minimum wage']
      },
      paid_leave_and_required_time_off: {
        severity: 'info',
        lawReference: 'Louisiana common law',
        message: 'NO state-mandated paid leave',
        flaggedPhrases: ['paid leave and required time off']
      },
      drug_screening: {
        severity: 'info',
        lawReference: 'Louisiana common law',
        message: 'Drug testing PERMITTED',
        flaggedPhrases: ['drug screening']
      },
      at_will_employment: {
        severity: 'info',
        lawReference: 'Louisiana common law',
        message: 'At-will employment applies',
        flaggedPhrases: ['at will employment']
      },
      arbitration: {
        severity: 'info',
        lawReference: 'Louisiana common law',
        message: 'Arbitration enforceable',
        flaggedPhrases: ['arbitration']
      },
      final_pay: {
        severity: 'info',
        lawReference: 'Louisiana Revised Statutes § 23:631',
        message: 'Final wages due within 15 days or next regular payday',
        flaggedPhrases: ['final pay']
      },
      right_to_work: {
        severity: 'info',
        lawReference: 'Louisiana Constitution Article 1 § 12',
        message: 'Louisiana is RIGHT TO WORK state',
        flaggedPhrases: ['right to work']
      },
      breaks: {
        severity: 'warning',
        lawReference: 'Louisiana common law',
        message: 'NO required meal or rest breaks (under 18 exception)',
        flaggedPhrases: ['breaks']
      },
    }
  },

  // ==================== MASSACHUSETTS ====================
  MA: {
    state: 'Massachusetts',
    lastUpdated: '2026-01-19',
    sources: [{ url: "https://ma.gov/labor", title: "Massachusetts Department of Labor" }],
    rules: {
      non_compete: {
        severity: 'error',
        message: 'Massachusetts regulates non-compete agreements through the Massachusetts Noncompetition Agreement Act (MNAA). Non-competes are enforceable if: (1) in writing and signed by both parties, (2) provided w',
        flaggedPhrases: ['non compete']
      },
      salary_history: {
        severity: 'info',
        message: 'Massachusetts prohibits employers from seeking salary history information from job applicants until after extending an offer with compensation. Employers cannot screen applicants based on salary histo',
        flaggedPhrases: ['salary history']
      },
      pay_transparency: {
        severity: 'info',
        message: 'Massachusetts requires employers with 25+ employees to disclose salary ranges in job postings and to employees upon request. The Salary Range Transparency Law aims to increase equity and close wage ga',
        flaggedPhrases: ['pay transparency']
      },
      background_checks: {
        severity: 'info',
        message: 'Massachusetts has a comprehensive \'Ban the Box\' law that prohibits employers from asking about criminal history on initial job applications. Criminal record inquiries are restricted to later stages ',
        flaggedPhrases: ['background checks']
      },
      paid_leave: {
        severity: 'info',
        message: 'Massachusetts Earned Sick Time Law requires most employers to provide up to 40 hours of earned sick time per year. Employees earn 1 hour for every 30 hours worked. Sick time is paid for employers with',
        flaggedPhrases: ['paid leave']
      },
      arbitration: {
        severity: 'warning',
        message: 'Massachusetts generally enforces arbitration agreements but has specific requirements. For employment discrimination claims, arbitration agreements must explicitly cite the specific types of claims (e',
        flaggedPhrases: ['arbitration']
      },
      at_will_employment: {
        severity: 'info',
        message: 'Massachusetts follows at-will employment doctrine - either party can terminate employment at any time for any legal reason or no reason. However, numerous exceptions protect employees from wrongful te',
        flaggedPhrases: ['at will employment']
      },
      drug_screening: {
        severity: 'warning',
        message: 'Massachusetts has no statute directly regulating private employer drug testing. Case law (Webster v. Motorola) establishes that drug testing must balance employer business interests against employee p',
        flaggedPhrases: ['drug screening']
      },
    }
  },

  // ==================== MAINE ====================
  ME: {
    state: 'Maine',
    lastUpdated: '2026-01-19',
    sources: [{ url: "https://me.gov/labor", title: "Maine Department of Labor" }],
    rules: {
      non_compete: {
        severity: 'error',
        lawReference: 'Maine Revised Statutes Title 26 § 599-A',
        message: 'Non-competes PROHIBITED for most employees',
        flaggedPhrases: ['non compete']
      },
      salary_history: {
        severity: 'info',
        lawReference: 'Maine Revised Statutes Title 26 § 628',
        message: 'CANNOT seek salary history from applicants',
        flaggedPhrases: ['salary history']
      },
      pay_transparency: {
        severity: 'info',
        lawReference: 'Maine common law',
        message: 'NO pay transparency requirement currently',
        flaggedPhrases: ['pay transparency']
      },
      background_checks_and_fcra: {
        severity: 'info',
        lawReference: 'Maine Ban the Box Law',
        message: 'Cannot inquire about criminal history on initial application',
        flaggedPhrases: ['background checks and fcra']
      },
      minimum_wage: {
        severity: 'info',
        lawReference: 'Maine Revised Statutes Title 26 § 664',
        message: 'Maine minimum wage: $14.15/hour (2024), increases annually',
        flaggedPhrases: ['minimum wage']
      },
      paid_leave_and_required_time_off: {
        severity: 'warning',
        lawReference: 'Maine Earned Paid Leave Law',
        message: 'PAID LEAVE REQUIRED (effective January 1, 2021)',
        flaggedPhrases: ['paid leave and required time off']
      },
      at_will_employment: {
        severity: 'info',
        lawReference: 'Maine common law',
        message: 'At-will employment applies',
        flaggedPhrases: ['at will employment']
      },
      arbitration: {
        severity: 'info',
        lawReference: 'Maine common law',
        message: 'Arbitration enforceable',
        flaggedPhrases: ['arbitration']
      },
      drug_screening: {
        severity: 'info',
        lawReference: 'Maine common law',
        message: 'Drug testing permitted with restrictions',
        flaggedPhrases: ['drug screening']
      },
      final_pay: {
        severity: 'info',
        lawReference: 'Maine Revised Statutes Title 26 § 626',
        message: 'Final wages due next regular payday',
        flaggedPhrases: ['final pay']
      },
    }
  },

  // ==================== MARYLAND ====================
  MD: {
    state: 'Maryland',
    lastUpdated: '2026-01-19',
    sources: [{ url: "https://md.gov/labor", title: "Maryland Department of Labor" }],
    rules: {
      salary_history: {
        severity: 'info',
        lawReference: 'Md. Code, Labor & Employment § 3-304.2',
        message: 'Maryland prohibits employers from asking applicants about wage or salary history and from relying on such information in determining compensation.',
        flaggedPhrases: ['salary history']
      },
      pay_transparency: {
        severity: 'info',
        lawReference: 'Md. Code, Labor & Employment § 3-304.1 (as amended by 2022 pay transparency law)',
        message: 'Maryland requires employers to disclose wage ranges in job postings and provide pay range information to applicants and employees under certain circumstances.',
        flaggedPhrases: ['pay transparency']
      },
      non_compete: {
        severity: 'info',
        lawReference: 'Md. Code, Labor & Employment § 3-716',
        message: 'Maryland restricts non-compete agreements for low-wage employees and applies reasonableness standards for others.',
        flaggedPhrases: ['non compete']
      },
      background_checks_and_fcra: {
        severity: 'info',
        lawReference: 'Md. Code, State Gov’t § 20-602 (Ban-the-box for certain employers); Fair Credit Reporting Act (15 U.S.C. § 1681)',
        message: 'Maryland restricts criminal history inquiries and requires compliance with federal FCRA procedures when using background check vendors.',
        flaggedPhrases: ['background checks and fcra']
      },
      paid_leave_and_required_time_off: {
        severity: 'info',
        lawReference: 'Maryland Healthy Working Families Act (Md. Code, Labor & Employment § 3-1301 et seq.)',
        message: 'Maryland mandates paid sick and safe leave for covered employers and protects certain civic leave rights.',
        flaggedPhrases: ['paid leave and required time off']
      },
      drug_screening: {
        severity: 'info',
        lawReference: 'Maryland Labor and Employment guidance; Maryland cannabis legislation',
        message: 'Maryland permits workplace drug testing. Recreational cannabis use has limited employment protections depending on circumstances.',
        flaggedPhrases: ['drug screening']
      },
      arbitration: {
        severity: 'info',
        lawReference: 'Federal Arbitration Act; Maryland Uniform Arbitration Act',
        message: 'Arbitration agreements are generally enforceable in Maryland if consistent with contract law and federal arbitration principles.',
        flaggedPhrases: ['arbitration']
      },
      at_will_employment: {
        severity: 'info',
        lawReference: 'Maryland common law',
        message: 'Maryland follows the at-will employment doctrine, subject to statutory, contractual, and public policy exceptions.',
        flaggedPhrases: ['at will employment']
      },
      anti_discrimination_and_harassment: {
        severity: 'info',
        lawReference: 'Maryland Fair Employment Practices Act (Md. Code, State Gov’t § 20-601 et seq.)',
        message: 'Maryland law prohibits discrimination in employment on a broad range of protected characteristics, often broader than federal law.',
        flaggedPhrases: ['anti discrimination and harassment']
      },
    }
  },

  // ==================== MICHIGAN ====================
  MI: {
    state: 'Michigan',
    lastUpdated: '2026-01-19',
    sources: [{ url: "https://mi.gov/labor", title: "Michigan Department of Labor" }],
    rules: {
      non_compete: {
        severity: 'warning',
        message: 'Michigan enforces reasonable non-compete agreements under common law. The Michigan Antitrust Reform Act (MARA) prohibits certain non-competes for some healthcare professionals. Non-competes must be re',
        flaggedPhrases: ['non compete']
      },
      salary_history: {
        severity: 'info',
        message: 'Michigan has NO statewide salary history ban. Employers may ask about and consider applicant salary history. No state-level restrictions on salary history inquiries.',
        flaggedPhrases: ['salary history']
      },
      pay_transparency: {
        severity: 'info',
        message: 'Michigan has NO statewide pay transparency law requiring salary ranges in job postings. No requirement to disclose compensation ranges to applicants or employees.',
        flaggedPhrases: ['pay transparency']
      },
      background_checks: {
        severity: 'warning',
        message: 'Michigan has no statewide ban-the-box law for private employers. Employers may ask about criminal history on applications. Must comply with federal FCRA. Michigan courts have held that considering cri',
        flaggedPhrases: ['background checks']
      },
      paid_leave: {
        severity: 'info',
        message: 'Michigan\'s Earned Sick Time Act (ESTA) requires employers to provide paid sick leave. Amended in February 2025, ESTA requires employees accrue 1 hour of paid sick time for every 30 hours worked. Empl',
        flaggedPhrases: ['paid leave']
      },
      arbitration: {
        severity: 'warning',
        message: 'Michigan generally enforces arbitration agreements under federal and state law. Follows Federal Arbitration Act. Agreements must be clear, mutual, and not unconscionable.',
        flaggedPhrases: ['arbitration']
      },
      at_will_employment: {
        severity: 'info',
        message: 'Michigan follows at-will employment doctrine. Either party can terminate employment at any time for any legal reason or no reason. Exceptions exist for discrimination, retaliation, public policy viola',
        flaggedPhrases: ['at will employment']
      },
      drug_screening: {
        severity: 'info',
        message: 'Michigan has limited drug testing restrictions. Medical marijuana users have some protections under Michigan Medical Marihuana Act (MMMA), but employers can maintain drug-free workplace policies. Publ',
        flaggedPhrases: ['drug screening']
      },
    }
  },

  // ==================== MINNESOTA ====================
  MN: {
    state: 'Minnesota',
    lastUpdated: '2026-01-19',
    sources: [{ url: "https://mn.gov/labor", title: "Minnesota Department of Labor" }],
    rules: {
      non_compete: {
        severity: 'info',
        lawReference: 'Minnesota Statutes § 181.988 & case law',
        message: 'Non-competes SEVERELY RESTRICTED - disfavored by courts',
        flaggedPhrases: ['non compete']
      },
      salary_history: {
        severity: 'info',
        lawReference: 'Minnesota common law',
        message: 'Salary history inquiries PERMITTED (statewide)',
        flaggedPhrases: ['salary history']
      },
      pay_transparency: {
        severity: 'info',
        lawReference: 'Minnesota common law',
        message: 'NO statewide pay transparency requirement',
        flaggedPhrases: ['pay transparency']
      },
      background_checks_and_fcra: {
        severity: 'info',
        lawReference: 'Minnesota Statutes § 364.021',
        message: 'Cannot consider arrests without convictions',
        flaggedPhrases: ['background checks and fcra']
      },
      minimum_wage: {
        severity: 'info',
        lawReference: 'Minnesota Statutes § 177.24',
        message: 'Minnesota minimum wage: $10.85/hour large employers, $8.85 small employers (2024)',
        flaggedPhrases: ['minimum wage']
      },
      paid_leave_and_required_time_off: {
        severity: 'warning',
        lawReference: 'Minnesota Earned Sick and Safe Time (ESST) Law',
        message: 'EARNED SICK AND SAFE TIME REQUIRED (effective January 1, 2024)',
        flaggedPhrases: ['paid leave and required time off']
      },
      at_will_employment: {
        severity: 'info',
        lawReference: 'Minnesota common law',
        message: 'At-will employment applies',
        flaggedPhrases: ['at will employment']
      },
      arbitration: {
        severity: 'info',
        lawReference: 'Minnesota common law',
        message: 'Arbitration enforceable',
        flaggedPhrases: ['arbitration']
      },
      drug_screening: {
        severity: 'warning',
        lawReference: 'Minnesota Statutes § 181.950-957',
        message: 'Drug testing REGULATED - specific procedures required',
        flaggedPhrases: ['drug screening']
      },
      final_pay: {
        severity: 'info',
        lawReference: 'Minnesota Statutes § 181.14',
        message: 'Final wages due within 24 hours if terminated, next payday if quit',
        flaggedPhrases: ['final pay']
      },
      breaks: {
        severity: 'warning',
        lawReference: 'Minnesota Statutes § 177.253-254',
        message: 'Meal and rest breaks REQUIRED',
        flaggedPhrases: ['breaks']
      },
    }
  },

  // ==================== MISSISSIPPI ====================
  MS: {
    state: 'Mississippi',
    lastUpdated: '2026-01-19',
    sources: [{ url: "https://ms.gov/labor", title: "Mississippi Department of Labor" }],
    rules: {
      non_compete: {
        severity: 'info',
        lawReference: 'Mississippi common law',
        message: 'Non-competes ENFORCEABLE if reasonable',
        flaggedPhrases: ['non compete']
      },
      salary_history: {
        severity: 'info',
        lawReference: 'Mississippi common law',
        message: 'Salary history inquiries PERMITTED',
        flaggedPhrases: ['salary history']
      },
      pay_transparency: {
        severity: 'info',
        lawReference: 'Mississippi common law',
        message: 'NO pay transparency requirements',
        flaggedPhrases: ['pay transparency']
      },
      background_checks_and_fcra: {
        severity: 'info',
        lawReference: 'Mississippi common law',
        message: 'Background checks permitted any stage',
        flaggedPhrases: ['background checks and fcra']
      },
      minimum_wage: {
        severity: 'info',
        lawReference: 'Federal FLSA (no state minimum)',
        message: 'Mississippi has NO state minimum wage - federal $7.25 applies',
        flaggedPhrases: ['minimum wage']
      },
      paid_leave_and_required_time_off: {
        severity: 'info',
        lawReference: 'Mississippi common law',
        message: 'NO state-mandated paid leave',
        flaggedPhrases: ['paid leave and required time off']
      },
      drug_screening: {
        severity: 'info',
        lawReference: 'Mississippi common law',
        message: 'Drug testing PERMITTED',
        flaggedPhrases: ['drug screening']
      },
      at_will_employment: {
        severity: 'info',
        lawReference: 'Mississippi common law',
        message: 'At-will employment applies',
        flaggedPhrases: ['at will employment']
      },
      arbitration: {
        severity: 'info',
        lawReference: 'Mississippi common law',
        message: 'Arbitration enforceable',
        flaggedPhrases: ['arbitration']
      },
      final_pay: {
        severity: 'info',
        lawReference: 'Mississippi common law',
        message: 'Final wages due within reasonable time',
        flaggedPhrases: ['final pay']
      },
      right_to_work: {
        severity: 'info',
        lawReference: 'Mississippi Constitution § 258-A',
        message: 'Mississippi is RIGHT TO WORK state',
        flaggedPhrases: ['right to work']
      },
      breaks: {
        severity: 'warning',
        lawReference: 'Mississippi common law',
        message: 'NO required meal or rest breaks for adults',
        flaggedPhrases: ['breaks']
      },
    }
  },

  // ==================== MISSOURI ====================
  MO: {
    state: 'Missouri',
    lastUpdated: '2026-01-19',
    sources: [{ url: "https://mo.gov/labor", title: "Missouri Department of Labor" }],
    rules: {
      non_compete: {
        severity: 'info',
        lawReference: 'Missouri common law - House Springs v. Schneider',
        message: 'Non-competes VERY EMPLOYER-FRIENDLY - broadly enforceable',
        flaggedPhrases: ['non compete']
      },
      salary_history: {
        severity: 'info',
        lawReference: 'Missouri common law',
        message: 'Salary history inquiries PERMITTED',
        flaggedPhrases: ['salary history']
      },
      pay_transparency: {
        severity: 'info',
        lawReference: 'Missouri common law',
        message: 'NO pay transparency requirements',
        flaggedPhrases: ['pay transparency']
      },
      background_checks_and_fcra: {
        severity: 'info',
        lawReference: 'Missouri common law',
        message: 'Background checks permitted any stage',
        flaggedPhrases: ['background checks and fcra']
      },
      minimum_wage: {
        severity: 'info',
        lawReference: 'Missouri Revised Statutes § 290.502',
        message: 'Missouri minimum wage: $12.30/hour (2024), $13.75 (2025), $15.00 (2026)',
        flaggedPhrases: ['minimum wage']
      },
      paid_leave_and_required_time_off: {
        severity: 'warning',
        lawReference: 'Missouri Proposition A (approved November 2024)',
        message: 'EARNED PAID SICK TIME REQUIRED (effective May 1, 2025)',
        flaggedPhrases: ['paid leave and required time off']
      },
      at_will_employment: {
        severity: 'info',
        lawReference: 'Missouri common law',
        message: 'At-will employment applies',
        flaggedPhrases: ['at will employment']
      },
      arbitration: {
        severity: 'info',
        lawReference: 'Missouri common law',
        message: 'Arbitration enforceable',
        flaggedPhrases: ['arbitration']
      },
      drug_screening: {
        severity: 'info',
        lawReference: 'Missouri common law',
        message: 'Drug testing PERMITTED',
        flaggedPhrases: ['drug screening']
      },
      final_pay: {
        severity: 'info',
        lawReference: 'Missouri Revised Statutes § 290.110',
        message: 'Final wages due immediately if terminated, next payday if quit',
        flaggedPhrases: ['final pay']
      },
      right_to_work: {
        severity: 'info',
        lawReference: 'Missouri Constitution Article I § 29',
        message: 'Missouri is RIGHT TO WORK state',
        flaggedPhrases: ['right to work']
      },
    }
  },

  // ==================== MONTANA ====================
  MT: {
    state: 'Montana',
    lastUpdated: '2026-01-19',
    sources: [{ url: "https://mt.gov/labor", title: "Montana Department of Labor" }],
    rules: {
      non_compete: {
        severity: 'info',
        lawReference: 'Montana Code Annotated § 28-2-703 to 705',
        message: 'Non-competes HEAVILY RESTRICTED - very limited enforceability',
        flaggedPhrases: ['non compete']
      },
      salary_history: {
        severity: 'info',
        lawReference: 'Montana common law',
        message: 'Salary history inquiries PERMITTED',
        flaggedPhrases: ['salary history']
      },
      pay_transparency: {
        severity: 'info',
        lawReference: 'Montana common law',
        message: 'NO pay transparency requirements',
        flaggedPhrases: ['pay transparency']
      },
      background_checks_and_fcra: {
        severity: 'info',
        lawReference: 'Montana Code § 49-2-312',
        message: 'Criminal history restrictions apply',
        flaggedPhrases: ['background checks and fcra']
      },
      minimum_wage: {
        severity: 'info',
        lawReference: 'Montana Code § 39-3-404',
        message: 'Montana minimum wage: $10.30/hour (2024), adjusted annually',
        flaggedPhrases: ['minimum wage']
      },
      paid_leave_and_required_time_off: {
        severity: 'info',
        lawReference: 'Montana common law',
        message: 'NO state-mandated paid sick leave',
        flaggedPhrases: ['paid leave and required time off']
      },
      wrongful_discharge: {
        severity: 'warning',
        lawReference: 'Montana Wrongful Discharge from Employment Act (WDEA)',
        message: 'Montana is NOT at-will - good cause required after probation',
        flaggedPhrases: ['wrongful discharge']
      },
      at_will_employment: {
        severity: 'info',
        lawReference: 'Montana WDEA',
        message: 'At-will employment LIMITED to probationary period only',
        flaggedPhrases: ['at will employment']
      },
      arbitration: {
        severity: 'info',
        lawReference: 'Montana common law',
        message: 'Arbitration enforceable',
        flaggedPhrases: ['arbitration']
      },
      drug_screening: {
        severity: 'info',
        lawReference: 'Montana common law',
        message: 'Drug testing permitted with policy',
        flaggedPhrases: ['drug screening']
      },
      final_pay: {
        severity: 'info',
        lawReference: 'Montana Code § 39-3-205',
        message: 'Final wages due immediately upon discharge or within 4 business days',
        flaggedPhrases: ['final pay']
      },
    }
  },

  // ==================== NEBRASKA ====================
  NE: {
    state: 'Nebraska',
    lastUpdated: '2026-01-19',
    sources: [{ url: "https://ne.gov/labor", title: "Nebraska Department of Labor" }],
    rules: {
      salary_history: {
        severity: 'info',
        lawReference: 'No statewide prohibition; federal anti-discrimination laws apply',
        message: 'Nebraska does not have a statewide salary history ban. Employers may ask about wage history, but such practices can increase discrimination risk under federal law.',
        flaggedPhrases: ['salary history']
      },
      pay_transparency: {
        severity: 'info',
        lawReference: 'No current Nebraska statute mandating pay transparency',
        message: 'Nebraska does not currently require employers to disclose wage ranges in job postings or offer letters.',
        flaggedPhrases: ['pay transparency']
      },
      non_compete: {
        severity: 'info',
        lawReference: 'Nebraska common law (e.g., H & R Block Tax Services, Inc. v. Circle A Enterprises, Inc.)',
        message: 'Non-compete agreements are generally enforceable in Nebraska if reasonable in scope, geography, and duration, and if they protect legitimate business interests.',
        flaggedPhrases: ['non compete']
      },
      background_checks_and_fcra: {
        severity: 'warning',
        lawReference: 'Fair Credit Reporting Act (15 U.S.C. § 1681)',
        message: 'Nebraska does not have a statewide ban-the-box law for private employers, but employers must follow federal FCRA procedures when using background check vendors.',
        flaggedPhrases: ['background checks and fcra']
      },
      paid_leave_and_required_time_off: {
        severity: 'warning',
        lawReference: 'Neb. Rev. Stat. § 48-837 (jury duty); § 32-922 (voting leave)',
        message: 'Nebraska does not mandate paid sick leave statewide. However, employers must comply with required leave such as jury duty protections and voting leave.',
        flaggedPhrases: ['paid leave and required time off']
      },
      drug_screening: {
        severity: 'info',
        lawReference: 'Nebraska common law; Nebraska Revised Statutes Title 48',
        message: 'Nebraska permits workplace drug testing. Nebraska does not provide employment protections for recreational cannabis use.',
        flaggedPhrases: ['drug screening']
      },
      arbitration: {
        severity: 'info',
        lawReference: 'Federal Arbitration Act; Nebraska contract law',
        message: 'Arbitration agreements are generally enforceable in Nebraska if not unconscionable and consistent with federal arbitration law.',
        flaggedPhrases: ['arbitration']
      },
      at_will_employment: {
        severity: 'info',
        lawReference: 'Nebraska common law',
        message: 'Nebraska follows the at-will employment doctrine, subject to exceptions for contracts, discrimination, and public policy.',
        flaggedPhrases: ['at will employment']
      },
      anti_discrimination_and_harassment: {
        severity: 'info',
        lawReference: 'Nebraska Fair Employment Practice Act (Neb. Rev. Stat. § 48-1101 et seq.)',
        message: 'Nebraska law prohibits discrimination in employment based on protected characteristics and mirrors federal civil rights protections.',
        flaggedPhrases: ['anti discrimination and harassment']
      },
    }
  },

  // ==================== NEVADA ====================
  NV: {
    state: 'Nevada',
    lastUpdated: '2026-01-19',
    sources: [{ url: "https://nv.gov/labor", title: "Nevada Department of Labor" }],
    rules: {
      non_compete: {
        severity: 'info',
        lawReference: 'Nevada Revised Statutes § 613.195 et seq.',
        message: 'Non-competes RESTRICTED - statutory requirements apply',
        flaggedPhrases: ['non compete']
      },
      salary_history: {
        severity: 'info',
        lawReference: 'Nevada Revised Statutes § 613.510',
        message: 'CANNOT seek salary history before making compensation offer',
        flaggedPhrases: ['salary history']
      },
      pay_transparency: {
        severity: 'info',
        lawReference: 'Nevada common law',
        message: 'NO pay transparency requirement currently',
        flaggedPhrases: ['pay transparency']
      },
      background_checks_and_fcra: {
        severity: 'info',
        lawReference: 'Nevada Ban the Box Law',
        message: 'Cannot require disclosure of criminal history on initial application',
        flaggedPhrases: ['background checks and fcra']
      },
      minimum_wage: {
        severity: 'info',
        lawReference: 'Nevada Constitution & NRS § 608.250',
        message: 'Nevada minimum wage: $12.00/hour (July 1, 2024+)',
        flaggedPhrases: ['minimum wage']
      },
      paid_leave_and_required_time_off: {
        severity: 'info',
        lawReference: 'Nevada common law',
        message: 'NO state-mandated paid sick leave currently',
        flaggedPhrases: ['paid leave and required time off']
      },
      at_will_employment: {
        severity: 'info',
        lawReference: 'Nevada common law',
        message: 'At-will employment applies',
        flaggedPhrases: ['at will employment']
      },
      arbitration: {
        severity: 'info',
        lawReference: 'Nevada common law',
        message: 'Arbitration enforceable',
        flaggedPhrases: ['arbitration']
      },
      drug_screening: {
        severity: 'info',
        lawReference: 'Nevada AB 132 (marijuana protections)',
        message: 'Cannot refuse to hire based on positive marijuana test',
        flaggedPhrases: ['drug screening']
      },
      final_pay: {
        severity: 'info',
        lawReference: 'Nevada Revised Statutes § 608.020',
        message: 'Final wages due within 3 days (discharge) or next payday (resignation)',
        flaggedPhrases: ['final pay']
      },
      right_to_work: {
        severity: 'info',
        lawReference: 'Nevada Constitution Article 19 § 2',
        message: 'Nevada is RIGHT TO WORK state',
        flaggedPhrases: ['right to work']
      },
      daily_overtime: {
        severity: 'warning',
        lawReference: 'Nevada Revised Statutes § 608.018',
        message: 'Daily overtime required for 8+ hour shifts',
        flaggedPhrases: ['daily overtime']
      },
    }
  },

  // ==================== NEW HAMPSHIRE ====================
  NH: {
    state: 'New Hampshire',
    lastUpdated: '2026-01-19',
    sources: [{ url: "https://nh.gov/labor", title: "New Hampshire Department of Labor" }],
    rules: {
      non_compete: {
        severity: 'info',
        lawReference: 'New Hampshire RSA 275:70 et seq.',
        message: 'Non-competes RESTRICTED - statutory requirements (effective 2020)',
        flaggedPhrases: ['non compete']
      },
      salary_history: {
        severity: 'info',
        lawReference: 'New Hampshire common law',
        message: 'Salary history inquiries PERMITTED',
        flaggedPhrases: ['salary history']
      },
      pay_transparency: {
        severity: 'info',
        lawReference: 'New Hampshire common law',
        message: 'NO pay transparency requirements',
        flaggedPhrases: ['pay transparency']
      },
      background_checks_and_fcra: {
        severity: 'info',
        lawReference: 'New Hampshire common law',
        message: 'Background checks permitted any stage',
        flaggedPhrases: ['background checks and fcra']
      },
      minimum_wage: {
        severity: 'info',
        lawReference: 'New Hampshire RSA 279:21',
        message: 'New Hampshire follows federal minimum: $7.25/hour',
        flaggedPhrases: ['minimum wage']
      },
      paid_leave_and_required_time_off: {
        severity: 'info',
        lawReference: 'New Hampshire common law',
        message: 'NO state-mandated paid leave',
        flaggedPhrases: ['paid leave and required time off']
      },
      at_will_employment: {
        severity: 'info',
        lawReference: 'New Hampshire common law',
        message: 'At-will employment applies',
        flaggedPhrases: ['at will employment']
      },
      arbitration: {
        severity: 'info',
        lawReference: 'New Hampshire common law',
        message: 'Arbitration enforceable',
        flaggedPhrases: ['arbitration']
      },
      drug_screening: {
        severity: 'info',
        lawReference: 'New Hampshire common law',
        message: 'Drug testing permitted',
        flaggedPhrases: ['drug screening']
      },
      final_pay: {
        severity: 'info',
        lawReference: 'New Hampshire RSA 275:44',
        message: 'Final wages due within 72 hours or next payday',
        flaggedPhrases: ['final pay']
      },
      right_to_work: {
        severity: 'info',
        lawReference: 'New Hampshire RSA 275:1-a',
        message: 'New Hampshire is RIGHT TO WORK state',
        flaggedPhrases: ['right to work']
      },
      breaks: {
        severity: 'warning',
        lawReference: 'New Hampshire RSA 275:30-a',
        message: '30-minute meal break REQUIRED for 5+ hour shifts',
        flaggedPhrases: ['breaks']
      },
    }
  },

  // ==================== NEW JERSEY ====================
  NJ: {
    state: 'New Jersey',
    lastUpdated: '2026-01-19',
    sources: [{ url: "https://nj.gov/labor", title: "New Jersey Department of Labor" }],
    rules: {
      non_compete: {
        severity: 'warning',
        message: 'New Jersey restricts non-compete agreements through case law. Non-competes must protect legitimate business interests and be reasonable in scope, duration (typically 1 year), and geography. Courts car',
        flaggedPhrases: ['non compete']
      },
      salary_history: {
        severity: 'info',
        message: 'New Jersey prohibits employers from asking about salary history. Employers cannot screen applicants based on salary history, ask about prior compensation, or use salary history in setting compensation',
        flaggedPhrases: ['salary history']
      },
      pay_transparency: {
        severity: 'warning',
        message: 'New Jersey does NOT currently require salary ranges in job postings. However, under the Diane B. Allen Equal Pay Act, employers must provide pay range information to employees who are promoted or tran',
        flaggedPhrases: ['pay transparency']
      },
      background_checks: {
        severity: 'info',
        message: 'New Jersey has comprehensive \'ban the box\' law (Fair Chance in Housing Act and Opportunity to Compete Act). Employers cannot ask about criminal history on initial applications. Cannot inquire about ',
        flaggedPhrases: ['background checks']
      },
      paid_leave: {
        severity: 'info',
        message: 'New Jersey requires employers to provide earned sick leave. Employees accrue 1 hour of paid sick leave for every 30 hours worked, up to 40 hours per year. Applies to all employers regardless of size.',
        flaggedPhrases: ['paid leave']
      },
      arbitration: {
        severity: 'warning',
        message: 'New Jersey enforces arbitration agreements but with some restrictions. Follows Federal Arbitration Act generally. Courts scrutinize arbitration agreements for unconscionability more closely than many ',
        flaggedPhrases: ['arbitration']
      },
      at_will_employment: {
        severity: 'info',
        message: 'New Jersey follows at-will employment doctrine with significant exceptions. Either party can terminate employment, but New Jersey recognizes broader exceptions than many states including implied coven',
        flaggedPhrases: ['at will employment']
      },
      drug_screening: {
        severity: 'info',
        message: 'New Jersey prohibits employment discrimination against cannabis users under the Cannabis Regulatory, Enforcement Assistance, and Marketplace Modernization Act (CREAMMA). Employers cannot take adverse ',
        flaggedPhrases: ['drug screening']
      },
    }
  },

  // ==================== NEW MEXICO ====================
  NM: {
    state: 'New Mexico',
    lastUpdated: '2026-01-19',
    sources: [{ url: "https://nm.gov/labor", title: "New Mexico Department of Labor" }],
    rules: {
      non_compete: {
        severity: 'info',
        lawReference: 'New Mexico common law',
        message: 'Non-competes enforceable if reasonable',
        flaggedPhrases: ['non compete']
      },
      salary_history: {
        severity: 'info',
        lawReference: 'New Mexico common law',
        message: 'Salary history inquiries PERMITTED',
        flaggedPhrases: ['salary history']
      },
      pay_transparency: {
        severity: 'info',
        lawReference: 'New Mexico common law',
        message: 'NO pay transparency requirements',
        flaggedPhrases: ['pay transparency']
      },
      background_checks_and_fcra: {
        severity: 'info',
        lawReference: 'New Mexico common law',
        message: 'Background checks permitted any stage',
        flaggedPhrases: ['background checks and fcra']
      },
      minimum_wage: {
        severity: 'info',
        lawReference: 'New Mexico Minimum Wage Act',
        message: 'New Mexico minimum wage: $12.00/hour (2023+)',
        flaggedPhrases: ['minimum wage']
      },
      paid_leave_and_required_time_off: {
        severity: 'warning',
        lawReference: 'New Mexico Healthy Workplaces Act',
        message: 'PAID SICK LEAVE REQUIRED (effective July 1, 2022)',
        flaggedPhrases: ['paid leave and required time off']
      },
      at_will_employment: {
        severity: 'info',
        lawReference: 'New Mexico common law',
        message: 'At-will employment applies',
        flaggedPhrases: ['at will employment']
      },
      arbitration: {
        severity: 'info',
        lawReference: 'New Mexico common law',
        message: 'Arbitration enforceable',
        flaggedPhrases: ['arbitration']
      },
      drug_screening: {
        severity: 'info',
        lawReference: 'New Mexico Cannabis Regulation Act',
        message: 'Cannot discriminate against off-duty cannabis use',
        flaggedPhrases: ['drug screening']
      },
      final_pay: {
        severity: 'info',
        lawReference: 'New Mexico common law',
        message: 'Final wages due next regular payday',
        flaggedPhrases: ['final pay']
      },
    }
  },

  // ==================== NORTH CAROLINA ====================
  NC: {
    state: 'North Carolina',
    lastUpdated: '2026-01-19',
    sources: [{ url: "https://nc.gov/labor", title: "North Carolina Department of Labor" }],
    rules: {
      non_compete: {
        severity: 'info',
        message: 'North Carolina traditionally enforces reasonable non-compete agreements. However, House Bill 269 (Workforce Freedom and Protection Act) proposed in 2025 would ban non-competes for employees earning le',
        flaggedPhrases: ['non compete']
      },
      salary_history: {
        severity: 'info',
        message: 'North Carolina has NO statewide salary history ban. Employers may ask about and consider applicant salary history when setting compensation. Some local jurisdictions may have restrictions, but no stat',
        flaggedPhrases: ['salary history']
      },
      pay_transparency: {
        severity: 'info',
        message: 'North Carolina has NO statewide pay transparency law requiring salary ranges in job postings. No requirement to disclose compensation ranges to applicants or employees. No pay data reporting mandates.',
        flaggedPhrases: ['pay transparency']
      },
      background_checks: {
        severity: 'warning',
        message: 'North Carolina has limited background check restrictions. No statewide ban-the-box law for private employers. Employers may ask about criminal history on applications. Must comply with federal FCRA re',
        flaggedPhrases: ['background checks']
      },
      paid_leave: {
        severity: 'info',
        message: 'North Carolina has NO statewide paid sick leave or paid leave mandate for private employers. No state law requires employers to provide paid or unpaid sick leave beyond federal FMLA. Employers may vol',
        flaggedPhrases: ['paid leave']
      },
      arbitration: {
        severity: 'warning',
        message: 'North Carolina generally enforces arbitration agreements in employment contracts under federal law and common law. Follows Federal Arbitration Act. Agreements must be clear, mutual, and not unconscion',
        flaggedPhrases: ['arbitration']
      },
      at_will_employment: {
        severity: 'info',
        message: 'North Carolina follows at-will employment doctrine. Either party can terminate employment at any time for any legal reason or no reason. Exceptions exist for discrimination, retaliation, public policy',
        flaggedPhrases: ['at will employment']
      },
      drug_screening: {
        severity: 'info',
        message: 'North Carolina has NO state statute restricting private employer drug testing. Employers may conduct pre-employment, random, reasonable suspicion, and post-accident testing. Recommended to have writte',
        flaggedPhrases: ['drug screening']
      },
    }
  },

  // ==================== NORTH DAKOTA ====================
  ND: {
    state: 'North Dakota',
    lastUpdated: '2026-01-19',
    sources: [{ url: "https://nd.gov/labor", title: "North Dakota Department of Labor" }],
    rules: {
      salary_history: {
        severity: 'info',
        lawReference: 'No statewide statute',
        message: 'North Dakota does not have a statewide law prohibiting employers from asking about salary history.',
        flaggedPhrases: ['salary history']
      },
      pay_transparency: {
        severity: 'info',
        lawReference: 'No current statute mandating pay transparency',
        message: 'North Dakota does not require employers to disclose pay ranges in job postings or offer letters.',
        flaggedPhrases: ['pay transparency']
      },
      non_compete: {
        severity: 'error',
        lawReference: 'N.D. Cent. Code § 9-08-06',
        message: 'Non-compete agreements are largely prohibited in North Dakota, with limited statutory exceptions.',
        flaggedPhrases: ['non compete']
      },
      background_checks_and_fcra: {
        severity: 'info',
        lawReference: 'Fair Credit Reporting Act (15 U.S.C. § 1681)',
        message: 'North Dakota does not have a statewide ban-the-box law for private employers, but federal FCRA requirements apply when using background check vendors.',
        flaggedPhrases: ['background checks and fcra']
      },
      paid_leave_and_required_time_off: {
        severity: 'info',
        lawReference: 'N.D. Cent. Code § 27-09.1-17 (jury duty); § 16.1-01-02.1 (voting leave)',
        message: 'North Dakota does not mandate paid sick leave statewide but protects certain civic leave rights.',
        flaggedPhrases: ['paid leave and required time off']
      },
      drug_screening: {
        severity: 'info',
        lawReference: 'North Dakota Century Code Title 34',
        message: 'North Dakota allows workplace drug testing and does not provide employment protections for recreational cannabis use.',
        flaggedPhrases: ['drug screening']
      },
      arbitration: {
        severity: 'info',
        lawReference: 'Federal Arbitration Act; North Dakota contract law',
        message: 'Arbitration agreements are generally enforceable in North Dakota if they meet fairness and contract law requirements.',
        flaggedPhrases: ['arbitration']
      },
      at_will_employment: {
        severity: 'info',
        lawReference: 'North Dakota common law',
        message: 'North Dakota is an at-will employment state, subject to statutory and public policy exceptions.',
        flaggedPhrases: ['at will employment']
      },
      anti_discrimination_and_harassment: {
        severity: 'info',
        lawReference: 'North Dakota Human Rights Act (N.D. Cent. Code § 14-02.4-01 et seq.)',
        message: 'North Dakota law prohibits discrimination in employment based on protected characteristics.',
        flaggedPhrases: ['anti discrimination and harassment']
      },
    }
  },

  // ==================== OHIO ====================
  OH: {
    state: 'Ohio',
    lastUpdated: '2026-01-19',
    sources: [{ url: "https://oh.gov/labor", title: "Ohio Department of Labor" }],
    rules: {
      non_compete: {
        severity: 'error',
        lawReference: 'Ohio Revised Code § 1681.02 (Restrictive Covenants); Ohio Common Law',
        message: 'Ohio enforces non-compete agreements if reasonable in time, geographic area, and scope of prohibited conduct. Must protect legitimate business interest (trade secrets, confidential information, substa',
        flaggedPhrases: ['non compete']
      },
      salary_history: {
        severity: 'info',
        lawReference: 'Federal Equal Pay Act (29 U.S.C. § 206(d)); Cincinnati Ordinance 3.09 (Salary History Ban); Columbus Ordinance 3910.02 (Pay Transparency)',
        message: 'Ohio has NO statewide salary history ban. Employers may inquire about compensation history. However, Cincinnati and Columbus have LOCAL ordinances prohibiting salary history inquiries for private empl',
        flaggedPhrases: ['salary history']
      },
      pay_transparency: {
        severity: 'warning',
        lawReference: 'Columbus Ordinance 3910.02 (Pay Transparency); Federal Executive Order on Pay Equity; Federal Equal Pay Act',
        message: 'Ohio has NO statewide pay transparency requirement. However, Columbus (major city) requires employers to disclose salary ranges in job postings (effective 2023). Cincinnati requires pay ranges after i',
        flaggedPhrases: ['pay transparency']
      },
      background_checks: {
        severity: 'warning',
        lawReference: 'Fair Credit Reporting Act (15 U.S.C. § 1681); Ohio Revised Code § 4776.01 et seq. (Fair Hiring Practices - limited provisions); Federal ADA (42 U.S.C. § 12101)',
        message: 'Ohio follows federal FCRA requirements. No state-specific \'ban-the-box\' law statewide. Must have legitimate business reason. FCRA requires written consent, pre-adverse and final adverse action notic',
        flaggedPhrases: ['background checks']
      },
      paid_leave: {
        severity: 'info',
        lawReference: 'Federal Family and Medical Leave Act (29 U.S.C. § 2601 et seq.); Ohio Revised Code (limited state employee provisions); No comprehensive state paid leave mandate',
        message: 'Ohio does NOT mandate paid sick leave or paid family leave for private employers. State employees have accrued leave. Federal FMLA applies to eligible employers (50+ employees within 75 miles). No sta',
        flaggedPhrases: ['paid leave']
      },
      arbitration: {
        severity: 'warning',
        lawReference: 'Federal Arbitration Act (9 U.S.C. § 1 et seq.); Ohio Revised Code § 2711.01 et seq. (Ohio Uniform Arbitration Act)',
        message: 'Ohio enforces arbitration agreements under Federal Arbitration Act (FAA). Must be clear mutual agreement. Courts scrutinize for unconscionability but generally favor arbitration. Class action waivers ',
        flaggedPhrases: ['arbitration']
      },
      at_will_employment: {
        severity: 'info',
        lawReference: 'Ohio Common Law; Ohio Revised Code § 4101.17 (Whistleblower Protection); Ohio Revised Code § 1681.02 (Restrictive Covenants); Federal Laws',
        message: 'Ohio follows at-will employment doctrine. Either party can terminate for any reason without cause or notice (absent contract/policy). Strong exceptions: cannot terminate for illegal reason, cannot vio',
        flaggedPhrases: ['at will employment']
      },
      drug_screening: {
        severity: 'info',
        lawReference: 'Federal Drug-Free Workplace Act (41 U.S.C. § 8101 et seq.); Ohio Revised Code § 3796.01 et seq. (Medical Marijuana); Ohio law on drug testing (limited specific provisions); Federal ADA (42 U.S.C. § 12101)',
        message: 'Ohio allows drug testing under reasonable circumstances. No specific restrictions on pre-employment testing. Random testing and post-employment testing permitted. Marijuana (recreational and medical) ',
        flaggedPhrases: ['drug screening']
      },
    }
  },

  // ==================== OKLAHOMA ====================
  OK: {
    state: 'Oklahoma',
    lastUpdated: '2026-01-19',
    sources: [{ url: "https://ok.gov/labor", title: "Oklahoma Department of Labor" }],
    rules: {
      non_compete: {
        severity: 'error',
        lawReference: 'Oklahoma Statutes Title 15 § 219A',
        message: 'Non-competes VOID except in very limited circumstances',
        flaggedPhrases: ['non compete']
      },
      salary_history: {
        severity: 'info',
        lawReference: 'Oklahoma common law',
        message: 'Salary history inquiries PERMITTED',
        flaggedPhrases: ['salary history']
      },
      pay_transparency: {
        severity: 'info',
        lawReference: 'Oklahoma common law',
        message: 'NO pay transparency requirements',
        flaggedPhrases: ['pay transparency']
      },
      background_checks_and_fcra: {
        severity: 'info',
        lawReference: 'Oklahoma common law',
        message: 'Background checks permitted any stage',
        flaggedPhrases: ['background checks and fcra']
      },
      minimum_wage: {
        severity: 'info',
        lawReference: 'Oklahoma Statutes Title 40 § 197.5',
        message: 'Oklahoma follows federal minimum: $7.25/hour',
        flaggedPhrases: ['minimum wage']
      },
      paid_leave_and_required_time_off: {
        severity: 'info',
        lawReference: 'Oklahoma common law',
        message: 'NO state-mandated paid leave',
        flaggedPhrases: ['paid leave and required time off']
      },
      drug_screening: {
        severity: 'info',
        lawReference: 'Oklahoma common law',
        message: 'Drug testing PERMITTED and ENCOURAGED',
        flaggedPhrases: ['drug screening']
      },
      at_will_employment: {
        severity: 'info',
        lawReference: 'Oklahoma common law',
        message: 'At-will employment applies',
        flaggedPhrases: ['at will employment']
      },
      arbitration: {
        severity: 'info',
        lawReference: 'Oklahoma common law',
        message: 'Arbitration enforceable',
        flaggedPhrases: ['arbitration']
      },
      final_pay: {
        severity: 'info',
        lawReference: 'Oklahoma Statutes Title 40 § 165.3',
        message: 'Final wages due next regular payday',
        flaggedPhrases: ['final pay']
      },
      right_to_work: {
        severity: 'info',
        lawReference: 'Oklahoma Constitution Article 23 § 1A',
        message: 'Oklahoma is RIGHT TO WORK state',
        flaggedPhrases: ['right to work']
      },
      breaks: {
        severity: 'warning',
        lawReference: 'Oklahoma Statutes Title 40 § 165.1',
        message: 'Meal and rest breaks required for minors, recommended for adults',
        flaggedPhrases: ['breaks']
      },
    }
  },

  // ==================== OREGON ====================
  OR: {
    state: 'Oregon',
    lastUpdated: '2026-01-19',
    sources: [{ url: "https://or.gov/labor", title: "Oregon Department of Labor" }],
    rules: {
      non_compete: {
        severity: 'error',
        message: 'Oregon restricts non-compete agreements significantly. O.R.S. § 653.295 prohibits non-competes for employees earning less than $123,428/year (2026 threshold, adjusted biennially). For higher earners, ',
        flaggedPhrases: ['non compete']
      },
      salary_history: {
        severity: 'info',
        message: 'Oregon prohibits employers from asking about salary history. O.R.S. § 652.220 prevents employers from screening applicants based on salary history or requiring disclosure of current/past compensation.',
        flaggedPhrases: ['salary history']
      },
      pay_transparency: {
        severity: 'warning',
        message: 'Oregon requires pay transparency. O.R.S. § 652.210 requires employers with 15+ employees to include salary range or wage scale in job postings. Must also provide pay scale information to current emplo',
        flaggedPhrases: ['pay transparency']
      },
      background_checks: {
        severity: 'warning',
        message: 'Oregon has comprehensive ban-the-box law. O.R.S. § 659A.360 prohibits employers from asking about criminal history on initial applications or before initial interview. Must conduct individualized asse',
        flaggedPhrases: ['background checks']
      },
      paid_leave: {
        severity: 'info',
        message: 'Oregon has comprehensive paid sick leave law. O.R.S. § 653.601 et seq. requires all employers to provide earned sick time. Employees accrue minimum 1 hour per 30 hours worked (or 1 hour per 40 for emp',
        flaggedPhrases: ['paid leave']
      },
      arbitration: {
        severity: 'info',
        message: 'Oregon enforces arbitration agreements under federal and state law but with employee protections. Follows Federal Arbitration Act. Oregon Uniform Arbitration Act governs. Courts scrutinize for fairnes',
        flaggedPhrases: ['arbitration']
      },
      at_will_employment: {
        severity: 'info',
        message: 'Oregon follows at-will employment doctrine with significant exceptions. Either party can terminate employment for any legal reason. Strong anti-discrimination protections, whistleblower protections, a',
        flaggedPhrases: ['at will employment']
      },
      drug_screening: {
        severity: 'warning',
        message: 'Oregon restricts drug testing, particularly for marijuana. O.R.S. § 659A.300 prohibits employment discrimination for off-duty marijuana use. Employers must have reasonable suspicion of impairment. Pre',
        flaggedPhrases: ['drug screening']
      },
    }
  },

  // ==================== PENNSYLVANIA ====================
  PA: {
    state: 'Pennsylvania',
    lastUpdated: '2026-01-19',
    sources: [{ url: "https://pa.gov/labor", title: "Pennsylvania Department of Labor" }],
    rules: {
      non_compete: {
        severity: 'error',
        lawReference: 'Pennsylvania Common Law; Pennsylvania Uniform Trade Secrets Act (12 Pa.C.S. § 5302); Act 131 of 2024 (Low-Wage Non-Compete Restrictions effective 2025-01-01)',
        message: 'Pennsylvania has traditionally been non-compete friendly but recent changes significantly restrict them. As of January 1, 2025, PA banned non-competes that \'impede\' low-wage worker opportunities. Mu',
        flaggedPhrases: ['non compete']
      },
      salary_history: {
        severity: 'info',
        lawReference: 'Federal Equal Pay Act (29 U.S.C. § 206(d)); Title VII of Civil Rights Act (42 U.S.C. § 2000e et seq.)',
        message: 'Pennsylvania does NOT have statewide salary history ban. Employers may inquire about compensation history. However, federal Equal Pay Act principles apply. Federal pay equity enforcement is active. No',
        flaggedPhrases: ['salary history']
      },
      pay_transparency: {
        severity: 'warning',
        lawReference: 'Philadelphia Pay Transparency Ordinance (2021); Federal Equal Pay Act (29 U.S.C. § 206(d))',
        message: 'Pennsylvania does NOT require pay transparency in job postings or employee communications at state level. However, Philadelphia has local pay transparency ordinance requiring salary ranges in job post',
        flaggedPhrases: ['pay transparency']
      },
      background_checks: {
        severity: 'warning',
        lawReference: 'Fair Credit Reporting Act (15 U.S.C. § 1681); Pennsylvania law (limited specific statutes); Philadelphia Ordinance (for city employers)',
        message: 'Pennsylvania follows FCRA federal requirements plus state law. No specific \'ban-the-box\' law statewide. FCRA requires written consent, pre-adverse action notice, and final adverse action notice. Emp',
        flaggedPhrases: ['background checks']
      },
      paid_leave: {
        severity: 'info',
        lawReference: 'Federal Family and Medical Leave Act (29 U.S.C. § 2601 et seq.); Pennsylvania Public Employees Retirement System (but limited to state employees)',
        message: 'Pennsylvania does NOT mandate paid sick leave or paid family leave for private employers. State employees have accrued leave but no private sector requirement. Federal FMLA applies to eligible employe',
        flaggedPhrases: ['paid leave']
      },
      arbitration: {
        severity: 'warning',
        lawReference: 'Federal Arbitration Act (9 U.S.C. § 1 et seq.); Pennsylvania Uniform Arbitration Act (42 Pa.C.S. § 7301 et seq.)',
        message: 'Pennsylvania enforces arbitration agreements under Federal Arbitration Act (FAA). Courts scrutinize for unconscionability but generally favor arbitration. Must be clear, mutual agreement to arbitrate.',
        flaggedPhrases: ['arbitration']
      },
      at_will_employment: {
        severity: 'info',
        lawReference: 'Pennsylvania Common Law; Pennsylvania Uniform Discrimination Act (18 Pa.C.S. § 2702); Pennsylvania Whistleblower Law (43 P.S. § 1421 et seq.)',
        message: 'Pennsylvania follows at-will employment doctrine. Either party can terminate for any reason without cause or notice (absent contract/policy creating obligation). Strong exceptions: cannot terminate fo',
        flaggedPhrases: ['at will employment']
      },
      drug_screening: {
        severity: 'info',
        lawReference: 'Pennsylvania Medical Marijuana Act (35 P.S. § 10231.2101 et seq.); Federal ADA (42 U.S.C. § 12101); Federal Department of Transportation Testing (49 U.S.C.)',
        message: 'Pennsylvania allows employee drug testing under reasonable circumstances. No specific restrictions on pre-employment testing. Post-employment testing permitted with reasonable suspicion or random test',
        flaggedPhrases: ['drug screening']
      },
    }
  },

  // ==================== RHODE ISLAND ====================
  RI: {
    state: 'Rhode Island',
    lastUpdated: '2026-01-19',
    sources: [{ url: "https://ri.gov/labor", title: "Rhode Island Department of Labor" }],
    rules: {
      salary_history: {
        severity: 'info',
        lawReference: 'R.I. Gen. Laws § 28-6-17.2',
        message: 'Rhode Island prohibits employers from asking applicants about wage or salary history and from relying on such information to determine compensation.',
        flaggedPhrases: ['salary history']
      },
      pay_transparency: {
        severity: 'info',
        lawReference: 'R.I. Gen. Laws § 28-6-17.2',
        message: 'Rhode Island requires employers to provide wage ranges to applicants upon request and prior to discussing compensation, and to employees upon request.',
        flaggedPhrases: ['pay transparency']
      },
      non_compete: {
        severity: 'info',
        lawReference: 'R.I. Gen. Laws § 28-6-18',
        message: 'Rhode Island restricts non-compete agreements for certain categories of employees and applies reasonableness standards for others.',
        flaggedPhrases: ['non compete']
      },
      background_checks_and_fcra: {
        severity: 'info',
        lawReference: 'R.I. Gen. Laws § 28-5-7(7); Fair Credit Reporting Act (15 U.S.C. § 1681)',
        message: 'Rhode Island restricts criminal history inquiries under its ban-the-box law and requires compliance with FCRA when using third-party background check vendors.',
        flaggedPhrases: ['background checks and fcra']
      },
      paid_leave_and_required_time_off: {
        severity: 'info',
        lawReference: 'R.I. Gen. Laws § 28-57 et seq. (Healthy and Safe Families and Workplaces Act)',
        message: 'Rhode Island mandates paid sick and safe leave and protects certain statutory leave rights.',
        flaggedPhrases: ['paid leave and required time off']
      },
      drug_screening_and_cannabis_protections: {
        severity: 'info',
        lawReference: 'R.I. Gen. Laws § 21-28.11',
        message: 'Rhode Island legalizes recreational cannabis but does not provide broad statutory employment protections for off-duty use.',
        flaggedPhrases: ['drug screening and cannabis protections']
      },
      arbitration: {
        severity: 'info',
        lawReference: 'Federal Arbitration Act; Rhode Island contract law',
        message: 'Arbitration agreements are generally enforceable in Rhode Island if consistent with contract law and federal arbitration principles.',
        flaggedPhrases: ['arbitration']
      },
      at_will_employment: {
        severity: 'info',
        lawReference: 'Rhode Island common law',
        message: 'Rhode Island follows the at-will employment doctrine, subject to statutory, contractual, and public policy exceptions.',
        flaggedPhrases: ['at will employment']
      },
      anti_discrimination_and_harassment: {
        severity: 'info',
        lawReference: 'R.I. Gen. Laws § 28-5-1 et seq. (Fair Employment Practices Act)',
        message: 'Rhode Island law prohibits employment discrimination on a broad range of protected characteristics.',
        flaggedPhrases: ['anti discrimination and harassment']
      },
    }
  },

  // ==================== SOUTH CAROLINA ====================
  SC: {
    state: 'South Carolina',
    lastUpdated: '2026-01-19',
    sources: [{ url: "https://sc.gov/labor", title: "South Carolina Department of Labor" }],
    rules: {
      non_compete: {
        severity: 'info',
        lawReference: 'South Carolina common law',
        message: 'Non-competes ENFORCEABLE if reasonable',
        flaggedPhrases: ['non compete']
      },
      salary_history: {
        severity: 'info',
        lawReference: 'No statutory prohibition',
        message: 'Salary history inquiries are PERMITTED',
        flaggedPhrases: ['salary history']
      },
      pay_transparency: {
        severity: 'info',
        lawReference: 'No statutory requirement',
        message: 'NO pay transparency or salary disclosure requirements',
        flaggedPhrases: ['pay transparency']
      },
      background_checks_and_fcra: {
        severity: 'info',
        lawReference: 'Federal FCRA only',
        message: 'Background checks permitted at any stage - NO ban-the-box law',
        flaggedPhrases: ['background checks and fcra']
      },
      drug_screening: {
        severity: 'info',
        lawReference: 'South Carolina Drug-Free Workplace Program',
        message: 'Drug testing PERMITTED and ENCOURAGED',
        flaggedPhrases: ['drug screening']
      },
      arbitration: {
        severity: 'info',
        lawReference: 'Federal Arbitration Act',
        message: 'Arbitration agreements are ENFORCEABLE',
        flaggedPhrases: ['arbitration']
      },
      at_will_employment: {
        severity: 'info',
        lawReference: 'South Carolina common law',
        message: 'At-will employment STRONGLY PROTECTED',
        flaggedPhrases: ['at will employment']
      },
      minimum_wage: {
        severity: 'info',
        lawReference: 'Federal FLSA (no state minimum)',
        message: 'NO state minimum wage - federal $7.25/hour applies',
        flaggedPhrases: ['minimum wage']
      },
      paid_leave_and_required_time_off: {
        severity: 'info',
        lawReference: 'No state mandate',
        message: 'NO state-mandated paid sick leave or paid family leave',
        flaggedPhrases: ['paid leave and required time off']
      },
      final_pay: {
        severity: 'info',
        lawReference: 'South Carolina Payment of Wages Act',
        message: 'Final paycheck due within 48 hours or next payday',
        flaggedPhrases: ['final pay']
      },
      right_to_work: {
        severity: 'info',
        lawReference: 'South Carolina Code § 41-7-10 et seq.',
        message: 'South Carolina is a RIGHT TO WORK state',
        flaggedPhrases: ['right to work']
      },
      breaks: {
        severity: 'warning',
        lawReference: 'No state requirement',
        message: 'NO required meal or rest breaks for adults',
        flaggedPhrases: ['breaks']
      },
      payment_of_wages: {
        severity: 'warning',
        lawReference: 'South Carolina Payment of Wages Act',
        message: 'Must establish regular paydays and notify employees',
        flaggedPhrases: ['payment of wages']
      },
    }
  },

  // ==================== SOUTH DAKOTA ====================
  SD: {
    state: 'South Dakota',
    lastUpdated: '2026-01-19',
    sources: [{ url: "https://sd.gov/labor", title: "South Dakota Department of Labor" }],
    rules: {
      salary_history: {
        severity: 'info',
        lawReference: 'No statewide statute',
        message: 'South Dakota does not have a statewide law prohibiting employers from asking applicants about salary history.',
        flaggedPhrases: ['salary history']
      },
      pay_transparency: {
        severity: 'info',
        lawReference: 'No current statute mandating pay transparency',
        message: 'South Dakota does not require employers to disclose wage ranges in job postings or offer letters.',
        flaggedPhrases: ['pay transparency']
      },
      non_compete: {
        severity: 'info',
        lawReference: 'South Dakota common law',
        message: 'Non-compete agreements are generally enforceable in South Dakota if reasonable in duration, geography, and scope and if they protect legitimate business interests.',
        flaggedPhrases: ['non compete']
      },
      background_checks_and_fcra: {
        severity: 'info',
        lawReference: 'Fair Credit Reporting Act (15 U.S.C. § 1681)',
        message: 'South Dakota does not have a statewide ban-the-box law for private employers, but federal FCRA requirements apply when using background check vendors.',
        flaggedPhrases: ['background checks and fcra']
      },
      paid_leave_and_required_time_off: {
        severity: 'info',
        lawReference: 'S.D. Codified Laws § 16-13-10.6 (jury duty); § 12-3-5 (voting leave)',
        message: 'South Dakota does not mandate paid sick leave statewide but protects certain civic leave rights.',
        flaggedPhrases: ['paid leave and required time off']
      },
      drug_screening: {
        severity: 'info',
        lawReference: 'South Dakota Codified Laws Title 60; criminal law provisions on marijuana',
        message: 'South Dakota permits workplace drug testing. Recreational cannabis use is illegal and not protected in employment.',
        flaggedPhrases: ['drug screening']
      },
      arbitration: {
        severity: 'info',
        lawReference: 'Federal Arbitration Act; South Dakota contract law',
        message: 'Arbitration agreements are generally enforceable in South Dakota if consistent with contract law and federal arbitration principles.',
        flaggedPhrases: ['arbitration']
      },
      at_will_employment: {
        severity: 'info',
        lawReference: 'South Dakota common law',
        message: 'South Dakota follows the at-will employment doctrine, subject to contractual, statutory, and public policy exceptions.',
        flaggedPhrases: ['at will employment']
      },
      anti_discrimination_and_harassment: {
        severity: 'info',
        lawReference: 'South Dakota Human Relations Act (S.D. Codified Laws § 20-13-1 et seq.)',
        message: 'South Dakota law prohibits discrimination in employment based on protected characteristics and largely mirrors federal civil rights protections.',
        flaggedPhrases: ['anti discrimination and harassment']
      },
    }
  },

  // ==================== TENNESSEE ====================
  TN: {
    state: 'Tennessee',
    lastUpdated: '2026-01-19',
    sources: [{ url: "https://tn.gov/labor", title: "Tennessee Department of Labor" }],
    rules: {
      non_compete: {
        severity: 'warning',
        lawReference: 'T.C.A. § 47-25-101 (Restrictive Covenants); T.C.A. § 47-25-701 (Certain Restrictive Covenants Void)',
        message: 'Tennessee enforces non-compete agreements if reasonable. T.C.A. § 47-25-101 provides statutory framework. Non-compete must protect legitimate business interest (trade secrets, confidential information',
        flaggedPhrases: ['non compete']
      },
      salary_history: {
        severity: 'info',
        lawReference: 'Federal Equal Pay Act (29 U.S.C. § 206(d)); Tennessee law lacks specific ban',
        message: 'Tennessee does NOT have statewide salary history ban. Employers may inquire about compensation history. Federal equal pay principles apply (cannot use to justify discriminatory gaps). No local ordinan',
        flaggedPhrases: ['salary history']
      },
      pay_transparency: {
        severity: 'info',
        lawReference: 'Federal Equal Pay Act (29 U.S.C. § 206(d)); OFCCP regulations for federal contractors',
        message: 'Tennessee does NOT require pay transparency in job postings or employee communications at state level. No state-level pay range requirement. Federal contractors subject to OFCCP audit requirements. No',
        flaggedPhrases: ['pay transparency']
      },
      background_checks: {
        severity: 'info',
        lawReference: 'Fair Credit Reporting Act (15 U.S.C. § 1681); Federal ADA (42 U.S.C. § 12101)',
        message: 'Tennessee follows federal FCRA requirements. No state-specific ban-the-box law. Employers may conduct background checks at any time subject to FCRA compliance (written consent, pre-adverse and final a',
        flaggedPhrases: ['background checks']
      },
      paid_leave: {
        severity: 'info',
        lawReference: 'Federal Family and Medical Leave Act (29 U.S.C. § 2601 et seq.); Tennessee law lacks mandate',
        message: 'Tennessee does NOT mandate paid sick leave or paid family leave for private employers. Federal FMLA applies to employers with 50+ employees. No state-run paid leave program. Private employers free to ',
        flaggedPhrases: ['paid leave']
      },
      arbitration: {
        severity: 'warning',
        lawReference: 'Federal Arbitration Act (9 U.S.C. § 1 et seq.); T.C.A. § 29-5-101 et seq. (Uniform Arbitration Act)',
        message: 'Tennessee enforces arbitration agreements under Federal Arbitration Act (FAA). Courts apply federal standards with Tennessee law interpretation. Arbitration must be mutual agreement in writing. Class ',
        flaggedPhrases: ['arbitration']
      },
      at_will_employment: {
        severity: 'info',
        lawReference: 'Tennessee Common Law; T.C.A. § 49-5-101 (Whistleblower Protection); Federal Laws',
        message: 'Tennessee follows at-will employment doctrine. Either party can terminate for any reason without cause or notice (absent contract/policy). Exceptions: cannot terminate for illegal reason, cannot viola',
        flaggedPhrases: ['at will employment']
      },
      drug_screening: {
        severity: 'info',
        lawReference: 'Tennessee law lacks comprehensive drug testing statute; Federal Drug-Free Workplace Act (41 U.S.C. § 8101); Federal ADA (42 U.S.C. § 12101)',
        message: 'Tennessee allows drug testing under reasonable circumstances. No specific restrictions on pre-employment testing. Post-employment testing permitted with reasonable suspicion or random policy. Marijuan',
        flaggedPhrases: ['drug screening']
      },
    }
  },

  // ==================== UTAH ====================
  UT: {
    state: 'Utah',
    lastUpdated: '2026-01-19',
    sources: [{ url: "https://ut.gov/labor", title: "Utah Department of Labor" }],
    rules: {
      salary_history: {
        severity: 'info',
        lawReference: 'No statewide statute',
        message: 'Utah does not have a statewide law prohibiting employers from asking about salary history.',
        flaggedPhrases: ['salary history']
      },
      pay_transparency: {
        severity: 'info',
        lawReference: 'No current Utah statute mandating pay transparency',
        message: 'Utah does not require employers to disclose wage ranges in job postings or offer letters.',
        flaggedPhrases: ['pay transparency']
      },
      non_compete: {
        severity: 'info',
        lawReference: 'Utah Code § 34-51-101 et seq. (Post-Employment Restrictions Act)',
        message: 'Utah allows non-compete agreements but limits post-employment non-competes for employees to a maximum of one year.',
        flaggedPhrases: ['non compete']
      },
      background_checks_and_fcra: {
        severity: 'info',
        lawReference: 'Fair Credit Reporting Act (15 U.S.C. § 1681)',
        message: 'Utah does not have a statewide ban-the-box law for private employers, but federal FCRA requirements apply when using background check vendors.',
        flaggedPhrases: ['background checks and fcra']
      },
      paid_leave_and_required_time_off: {
        severity: 'info',
        lawReference: 'Utah Code § 78B-1-116 (jury duty); § 20A-3a-105 (voting leave)',
        message: 'Utah does not mandate paid sick leave statewide but protects certain civic leave rights.',
        flaggedPhrases: ['paid leave and required time off']
      },
      drug_screening: {
        severity: 'info',
        lawReference: 'Utah Medical Cannabis Act; Utah Code Title 34',
        message: 'Utah permits workplace drug testing and does not provide broad employment protections for recreational cannabis use.',
        flaggedPhrases: ['drug screening']
      },
      arbitration: {
        severity: 'info',
        lawReference: 'Federal Arbitration Act; Utah Uniform Arbitration Act',
        message: 'Arbitration agreements are generally enforceable in Utah if they meet fairness and contract law requirements.',
        flaggedPhrases: ['arbitration']
      },
      at_will_employment: {
        severity: 'info',
        lawReference: 'Utah common law',
        message: 'Utah follows the at-will employment doctrine, subject to statutory, contractual, and public policy exceptions.',
        flaggedPhrases: ['at will employment']
      },
      anti_discrimination_and_harassment: {
        severity: 'info',
        lawReference: 'Utah Antidiscrimination Act (Utah Code § 34A-5-101 et seq.)',
        message: 'Utah law prohibits discrimination in employment based on protected characteristics and largely mirrors federal protections.',
        flaggedPhrases: ['anti discrimination and harassment']
      },
    }
  },

  // ==================== VERMONT ====================
  VT: {
    state: 'Vermont',
    lastUpdated: '2026-01-19',
    sources: [{ url: "https://vt.gov/labor", title: "Vermont Department of Labor" }],
    rules: {
      salary_history: {
        severity: 'info',
        lawReference: '21 V.S.A. § 495m',
        message: 'Vermont prohibits employers from asking applicants about wage or salary history and from relying on such information to determine compensation.',
        flaggedPhrases: ['salary history']
      },
      pay_transparency: {
        severity: 'info',
        lawReference: '21 V.S.A. § 495n (Pay Transparency Law)',
        message: 'Vermont requires covered employers to include compensation or a compensation range in job advertisements.',
        flaggedPhrases: ['pay transparency']
      },
      non_compete: {
        severity: 'info',
        lawReference: '21 V.S.A. § 495h',
        message: 'Vermont restricts non-compete agreements for low-wage employees and applies reasonableness standards for others.',
        flaggedPhrases: ['non compete']
      },
      background_checks_and_fcra: {
        severity: 'info',
        lawReference: '21 V.S.A. § 495j; Fair Credit Reporting Act (15 U.S.C. § 1681)',
        message: 'Vermont restricts criminal history inquiries under its ban-the-box law and requires FCRA compliance for third-party background checks.',
        flaggedPhrases: ['background checks and fcra']
      },
      paid_leave_and_required_time_off: {
        severity: 'info',
        lawReference: '21 V.S.A. § 481 et seq. (Earned Sick Time)',
        message: 'Vermont mandates paid sick leave and protects various statutory leave rights.',
        flaggedPhrases: ['paid leave and required time off']
      },
      drug_screening_and_cannabis_protections: {
        severity: 'info',
        lawReference: '18 V.S.A. § 4230a; Vermont labor guidance',
        message: 'Vermont legalizes recreational cannabis, but employment protections for off-duty use are limited.',
        flaggedPhrases: ['drug screening and cannabis protections']
      },
      arbitration: {
        severity: 'info',
        lawReference: 'Federal Arbitration Act; Vermont contract law',
        message: 'Arbitration agreements are generally enforceable in Vermont if consistent with contract law and federal arbitration principles.',
        flaggedPhrases: ['arbitration']
      },
      at_will_employment: {
        severity: 'info',
        lawReference: 'Vermont common law',
        message: 'Vermont follows the at-will employment doctrine, subject to statutory, contractual, and public policy exceptions.',
        flaggedPhrases: ['at will employment']
      },
      anti_discrimination_and_harassment: {
        severity: 'info',
        lawReference: '21 V.S.A. § 495 et seq. (Vermont Fair Employment Practices Act)',
        message: 'Vermont law prohibits employment discrimination on a broad range of protected characteristics.',
        flaggedPhrases: ['anti discrimination and harassment']
      },
    }
  },

  // ==================== VIRGINIA ====================
  VA: {
    state: 'Virginia',
    lastUpdated: '2026-01-19',
    sources: [{ url: "https://va.gov/labor", title: "Virginia Department of Labor" }],
    rules: {
      non_compete: {
        severity: 'warning',
        message: 'Virginia enforces reasonable non-compete agreements under common law. Non-competes must protect legitimate business interests and be reasonable in scope, duration (typically 1-2 years), and geography.',
        flaggedPhrases: ['non compete']
      },
      salary_history: {
        severity: 'error',
        message: 'Virginia has NO statewide salary history ban. However, state agencies are prohibited from asking about salary history under executive directive. Private employers may ask about and consider salary his',
        flaggedPhrases: ['salary history']
      },
      pay_transparency: {
        severity: 'warning',
        message: 'Virginia PROPOSED pay transparency legislation (SB 1132 in 2024) but it was VETOED by the governor. As of January 2026, Virginia has NO pay transparency law requiring salary ranges in job postings. Em',
        flaggedPhrases: ['pay transparency']
      },
      background_checks: {
        severity: 'warning',
        message: 'Virginia has limited ban-the-box protections. State agencies cannot ask about criminal history on initial applications. Private employers generally can ask about criminal history at any stage but must',
        flaggedPhrases: ['background checks']
      },
      paid_leave: {
        severity: 'info',
        message: 'Virginia has NO statewide paid sick leave or paid leave mandate for private employers. No state law requires employers to provide paid or unpaid sick leave beyond federal FMLA. Employers may voluntari',
        flaggedPhrases: ['paid leave']
      },
      arbitration: {
        severity: 'warning',
        message: 'Virginia generally enforces arbitration agreements under federal and state law. Follows Federal Arbitration Act. Virginia has enacted Uniform Arbitration Act. Agreements must be clear, mutual, and not',
        flaggedPhrases: ['arbitration']
      },
      at_will_employment: {
        severity: 'info',
        message: 'Virginia follows at-will employment doctrine. Either party can terminate employment at any time for any legal reason or no reason. Exceptions exist for discrimination, retaliation, public policy viola',
        flaggedPhrases: ['at will employment']
      },
      drug_screening: {
        severity: 'info',
        message: 'Virginia has NO state statute restricting private employer drug testing. Employers may conduct pre-employment, random, reasonable suspicion, and post-accident testing. Recommended to have written poli',
        flaggedPhrases: ['drug screening']
      },
    }
  },

  // ==================== WEST VIRGINIA ====================
  WV: {
    state: 'West Virginia',
    lastUpdated: '2026-01-19',
    sources: [{ url: "https://wv.gov/labor", title: "West Virginia Department of Labor" }],
    rules: {
      non_compete: {
        severity: 'info',
        lawReference: 'West Virginia Code § 47-11E-1 et seq.',
        message: 'Non-competes ENFORCEABLE under statutory guidelines',
        flaggedPhrases: ['non compete']
      },
      salary_history: {
        severity: 'info',
        lawReference: 'No statutory prohibition',
        message: 'Salary history inquiries are PERMITTED',
        flaggedPhrases: ['salary history']
      },
      pay_transparency: {
        severity: 'info',
        lawReference: 'No statutory requirement',
        message: 'NO pay transparency requirements',
        flaggedPhrases: ['pay transparency']
      },
      background_checks_and_fcra: {
        severity: 'info',
        lawReference: 'Federal FCRA only',
        message: 'Background checks permitted at any stage',
        flaggedPhrases: ['background checks and fcra']
      },
      minimum_wage: {
        severity: 'info',
        lawReference: 'West Virginia Code § 21-5C-2',
        message: 'West Virginia minimum wage: $8.75/hour (2016-present)',
        flaggedPhrases: ['minimum wage']
      },
      paid_leave_and_required_time_off: {
        severity: 'info',
        lawReference: 'No state mandate',
        message: 'NO state-mandated paid leave',
        flaggedPhrases: ['paid leave and required time off']
      },
      drug_screening: {
        severity: 'info',
        lawReference: 'West Virginia Drug-Free Workplace Act',
        message: 'Drug testing PERMITTED and ENCOURAGED',
        flaggedPhrases: ['drug screening']
      },
      at_will_employment: {
        severity: 'info',
        lawReference: 'West Virginia common law',
        message: 'At-will employment applies',
        flaggedPhrases: ['at will employment']
      },
      arbitration: {
        severity: 'info',
        lawReference: 'Federal Arbitration Act',
        message: 'Arbitration agreements are ENFORCEABLE',
        flaggedPhrases: ['arbitration']
      },
      final_pay: {
        severity: 'info',
        lawReference: 'West Virginia Code § 21-5-4',
        message: 'Final wages due next regular payday or within 72 hours',
        flaggedPhrases: ['final pay']
      },
      right_to_work: {
        severity: 'info',
        lawReference: 'West Virginia Code § 21-1G-1 et seq.',
        message: 'West Virginia is a RIGHT TO WORK state (2016)',
        flaggedPhrases: ['right to work']
      },
      breaks: {
        severity: 'warning',
        lawReference: 'West Virginia Code § 21-3-10a',
        message: 'Meal breaks REQUIRED for 6+ hour shifts',
        flaggedPhrases: ['breaks']
      },
      pay_frequency: {
        severity: 'warning',
        lawReference: 'West Virginia Code § 21-5-3',
        message: 'Must pay employees at least semi-monthly',
        flaggedPhrases: ['pay frequency']
      },
    }
  },

  // ==================== WISCONSIN ====================
  WI: {
    state: 'Wisconsin',
    lastUpdated: '2026-01-19',
    sources: [{ url: "https://wi.gov/labor", title: "Wisconsin Department of Labor" }],
    rules: {
      salary_history: {
        severity: 'info',
        lawReference: 'No statewide statute',
        message: 'Wisconsin does not have a statewide law prohibiting employers from asking applicants about salary history.',
        flaggedPhrases: ['salary history']
      },
      pay_transparency: {
        severity: 'info',
        lawReference: 'No current Wisconsin statute mandating pay transparency',
        message: 'Wisconsin does not require employers to disclose wage ranges in job postings or offer letters.',
        flaggedPhrases: ['pay transparency']
      },
      non_compete: {
        severity: 'info',
        lawReference: 'Wis. Stat. § 103.465',
        message: 'Non-compete agreements are enforceable in Wisconsin only if they are reasonable and narrowly tailored under strict statutory standards.',
        flaggedPhrases: ['non compete']
      },
      background_checks_and_fcra: {
        severity: 'info',
        lawReference: 'Fair Credit Reporting Act (15 U.S.C. § 1681)',
        message: 'Wisconsin does not have a statewide ban-the-box law for private employers, but federal FCRA requirements apply when using third-party background check vendors.',
        flaggedPhrases: ['background checks and fcra']
      },
      paid_leave_and_required_time_off: {
        severity: 'info',
        lawReference: 'Wis. Stat. § 756.255 (jury duty); § 6.76 (voting leave); § 103.10 (Wisconsin Family and Medical Leave Act)',
        message: 'Wisconsin does not mandate paid sick leave statewide but protects certain civic and statutory leave rights.',
        flaggedPhrases: ['paid leave and required time off']
      },
      drug_screening: {
        severity: 'info',
        lawReference: 'Wisconsin Statutes Title 111; criminal statutes governing marijuana',
        message: 'Wisconsin permits workplace drug testing and does not provide employment protections for recreational cannabis use.',
        flaggedPhrases: ['drug screening']
      },
      arbitration: {
        severity: 'info',
        lawReference: 'Federal Arbitration Act; Wisconsin Uniform Arbitration Act (Wis. Stat. § 788.01 et seq.)',
        message: 'Arbitration agreements are generally enforceable in Wisconsin if consistent with contract law and federal arbitration principles.',
        flaggedPhrases: ['arbitration']
      },
      at_will_employment: {
        severity: 'info',
        lawReference: 'Wisconsin common law',
        message: 'Wisconsin follows the at-will employment doctrine, subject to statutory, contractual, and public policy exceptions.',
        flaggedPhrases: ['at will employment']
      },
      anti_discrimination_and_harassment: {
        severity: 'info',
        lawReference: 'Wisconsin Fair Employment Act (Wis. Stat. § 111.31 et seq.)',
        message: 'Wisconsin law prohibits discrimination in employment based on protected characteristics.',
        flaggedPhrases: ['anti discrimination and harassment']
      },
    }
  },

  // ==================== WYOMING ====================
  WY: {
    state: 'Wyoming',
    lastUpdated: '2026-01-19',
    sources: [{ url: "https://wy.gov/labor", title: "Wyoming Department of Labor" }],
    rules: {
      non_compete: {
        severity: 'info',
        lawReference: 'Wyoming Statutes § 1-23-104',
        message: 'Non-competes ENFORCEABLE if reasonable',
        flaggedPhrases: ['non compete']
      },
      salary_history: {
        severity: 'info',
        lawReference: 'No statutory prohibition',
        message: 'Salary history inquiries are PERMITTED',
        flaggedPhrases: ['salary history']
      },
      pay_transparency: {
        severity: 'info',
        lawReference: 'No statutory requirement',
        message: 'NO pay transparency requirements',
        flaggedPhrases: ['pay transparency']
      },
      background_checks_and_fcra: {
        severity: 'info',
        lawReference: 'Federal FCRA only',
        message: 'Background checks permitted at any stage',
        flaggedPhrases: ['background checks and fcra']
      },
      minimum_wage: {
        severity: 'info',
        lawReference: 'Wyoming Statutes § 27-4-202',
        message: 'Wyoming follows federal minimum wage: $7.25/hour',
        flaggedPhrases: ['minimum wage']
      },
      paid_leave_and_required_time_off: {
        severity: 'info',
        lawReference: 'No state mandate',
        message: 'NO state-mandated paid leave',
        flaggedPhrases: ['paid leave and required time off']
      },
      drug_screening: {
        severity: 'info',
        lawReference: 'No restrictions',
        message: 'Drug testing PERMITTED',
        flaggedPhrases: ['drug screening']
      },
      at_will_employment: {
        severity: 'info',
        lawReference: 'Wyoming Statutes § 27-9-105',
        message: 'At-will employment STRONGLY PROTECTED',
        flaggedPhrases: ['at will employment']
      },
      arbitration: {
        severity: 'info',
        lawReference: 'Federal Arbitration Act',
        message: 'Arbitration agreements are ENFORCEABLE',
        flaggedPhrases: ['arbitration']
      },
      final_pay: {
        severity: 'info',
        lawReference: 'Wyoming Statutes § 27-4-104',
        message: 'Final wages due within 5 working days or next regular payday',
        flaggedPhrases: ['final pay']
      },
      right_to_work: {
        severity: 'info',
        lawReference: 'Wyoming Constitution Article 1 § 22',
        message: 'Wyoming is a RIGHT TO WORK state',
        flaggedPhrases: ['right to work']
      },
      breaks: {
        severity: 'warning',
        lawReference: 'No state requirement',
        message: 'NO required meal or rest breaks for adults',
        flaggedPhrases: ['breaks']
      },
      pay_frequency: {
        severity: 'warning',
        lawReference: 'Wyoming Statutes § 27-4-301',
        message: 'Must pay employees at least semi-monthly',
        flaggedPhrases: ['pay frequency']
      },
    }
  },