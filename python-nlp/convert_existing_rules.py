"""
Convert existing complianceRules.js to new JSON format
Extracts data from the 6 existing states: CA, NY, TX, FL, IL, WA
"""

import json
import re
from pathlib import Path


# Map of state codes to full JSON data
STATES_DATA = {
    "NY": {
        "state": "New York",
        "state_code": "NY",
        "last_updated": "2025-10-01",
        "data_sources": [
            {
                "url": "https://dol.ny.gov/system/files/documents/2021/03/ls59.pdf",
                "title": "NY Department of Labor - Wage Theft Prevention Act"
            },
            {
                "url": "https://labor.ny.gov",
                "title": "New York State Department of Labor"
            }
        ],
        "laws": [
            {
                "topic": "non_compete",
                "summary": "Non-compete agreements are heavily restricted and scrutinized in New York. Courts require them to be reasonable in scope, time, and geography.",
                "law_citation": "New York common law - reasonableness standard",
                "full_text": "NY courts require non-competes to be reasonable in scope, time, and geography. They must protect legitimate business interest and cannot be oppressive. Courts frequently invalidate overly broad restrictions. Use narrow restrictions, limit to 1 year maximum, reasonable geography only. Consider confidentiality agreements instead.",
                "severity": "warning",
                "flagged_phrases": ["restrictions on certain competitive and solicitation activities", "competitive activities", "restraint of trade", "covenant not to compete", "competing business", "non-compete", "noncompete", "solicit customers"],
                "suggestion": "Use narrow restrictions, limit to 1 year maximum, reasonable geography only. Consider confidentiality agreements instead.",
                "source_url": "https://labor.ny.gov",
                "effective_date": "2025-01-01"
            },
            {
                "topic": "salary_history",
                "summary": "Employers CANNOT ask about salary history. New York State and NYC prohibit employers from asking job applicants about their salary history.",
                "law_citation": "New York Labor Law Section 194-a",
                "full_text": "New York State and NYC prohibit employers from asking job applicants about their salary history, including compensation and benefits. Cannot rely on salary history in determining compensation.",
                "severity": "error",
                "flagged_phrases": ["previous salary", "current compensation", "salary history", "what did you earn", "compensation at previous job", "prior wages", "past earnings", "previous pay"],
                "suggestion": "Remove all salary history questions immediately. Ask 'What are your salary expectations for this role?' instead.",
                "source_url": "https://labor.ny.gov",
                "effective_date": "2025-01-01"
            },
            {
                "topic": "pay_transparency",
                "summary": "Must include salary range in job postings for employers with 4+ employees.",
                "law_citation": "NY State Pay Transparency Law (Sept 2023) & NYC Local Law 32 (Nov 2022)",
                "full_text": "Employers with 4+ employees must disclose salary range (minimum to maximum) in all job postings, both external and internal, including promotions and transfers.",
                "severity": "error",
                "flagged_phrases": ["salary to be determined", "competitive salary", "compensation TBD", "salary commensurate with experience", "DOE", "salary negotiable"],
                "suggestion": "Include specific salary range: 'Salary Range: $XX,XXX - $XX,XXX per year'",
                "source_url": "https://labor.ny.gov",
                "effective_date": "2023-09-01"
            },
            {
                "topic": "exempt_threshold",
                "summary": "Exempt employees must meet NY salary threshold (higher than federal).",
                "law_citation": "New York Labor Law",
                "full_text": "NY minimum for exempt status: NYC/LI/Westchester: $64,350/year ($1,237.50/week), Rest of NY: $60,405.80/year ($1,161.65/week). Increases to $66,300 and $62,353.20 on Jan 1, 2026.",
                "severity": "error",
                "flagged_phrases": ["exempt", "salaried exempt", "exempt from overtime"],
                "suggestion": "Verify salary meets NY threshold or classify as non-exempt",
                "source_url": "https://labor.ny.gov",
                "effective_date": "2025-01-01"
            },
            {
                "topic": "background_checks",
                "summary": "Criminal background check restrictions under Clean Slate Act and NYC Fair Chance Act.",
                "law_citation": "NY Clean Slate Act (Effective Nov 16, 2024) & NYC Fair Chance Act",
                "full_text": "Automatically sealed convictions cannot be accessed or used. NYC Fair Chance Act (4+ employees): Cannot inquire about criminal history until after conditional offer. Must conduct individualized assessment if issues found.",
                "severity": "error",
                "flagged_phrases": ["background check", "criminal history", "criminal record", "prior to employment offer"],
                "suggestion": "Ensure background check occurs after conditional offer made",
                "source_url": "https://labor.ny.gov",
                "effective_date": "2024-11-16"
            },
            {
                "topic": "paid_leave",
                "summary": "Must provide paid prenatal leave (20 hours), paid sick leave, and paid family leave.",
                "law_citation": "NY Paid Prenatal Leave (Effective Jan 1, 2025) & Paid Sick Leave",
                "full_text": "Paid Prenatal Leave: 20 hours per 52 weeks (effective 1/1/25). Paid Sick Leave: 56 hours (100+ employees), 40 hours (5-99 employees), 40 hours unpaid (0-4 employees). Paid Family Leave: up to 12 weeks.",
                "severity": "warning",
                "flagged_phrases": ["sick leave", "family leave", "prenatal leave"],
                "suggestion": "Include paid leave benefits information in offer",
                "source_url": "https://labor.ny.gov",
                "effective_date": "2025-01-01"
            }
        ]
    },

    "TX": {
        "state": "Texas",
        "state_code": "TX",
        "last_updated": "2025-01-01",
        "data_sources": [
            {
                "url": "https://www.twc.texas.gov/businesses/employee-rights-laws",
                "title": "Texas Workforce Commission"
            }
        ],
        "laws": [
            {
                "topic": "non_compete",
                "summary": "Non-compete agreements are enforceable in Texas if reasonable in time, geography, and scope.",
                "law_citation": "Texas Business & Commerce Code Section 15.50",
                "full_text": "Texas allows non-competes if they: (1) are ancillary to an otherwise enforceable agreement, (2) contain reasonable time/geographic/scope limits, and (3) do not impose greater restraint than necessary. Typically 2 years maximum.",
                "severity": "info",
                "flagged_phrases": ["non-compete", "competitive activities", "restraint of trade"],
                "suggestion": "Non-compete is acceptable but ensure reasonableness standards are met (2 years max, limited geography)",
                "source_url": "https://www.twc.texas.gov",
                "effective_date": "2025-01-01"
            },
            {
                "topic": "salary_history",
                "summary": "Texas does not prohibit salary history inquiries.",
                "law_citation": "No state law prohibition",
                "full_text": "Texas has no state law prohibiting employers from asking about salary history. However, best practice is to avoid to promote pay equity.",
                "severity": "info",
                "flagged_phrases": [],
                "suggestion": "While legal, consider avoiding salary history questions to promote pay equity",
                "source_url": "https://www.twc.texas.gov",
                "effective_date": "2025-01-01"
            },
            {
                "topic": "pay_schedule",
                "summary": "Texas requires at least monthly paydays.",
                "law_citation": "Texas Labor Code Section 61.011",
                "full_text": "Employers must pay employees at least once per month. Exempt employees can be paid less frequently if agreed. Semi-monthly or bi-weekly is common and acceptable.",
                "severity": "info",
                "flagged_phrases": ["pay frequency", "payroll schedule"],
                "suggestion": "Ensure pay frequency is stated and at least monthly",
                "source_url": "https://www.twc.texas.gov",
                "effective_date": "2025-01-01"
            },
            {
                "topic": "arbitration",
                "summary": "Arbitration agreements are generally enforceable in Texas.",
                "law_citation": "Texas Civil Practice & Remedies Code",
                "full_text": "Texas follows Federal Arbitration Act. Mandatory arbitration is acceptable if agreement is not unconscionable. Ensure arbitration clause provides fair procedures and reasonable costs.",
                "severity": "info",
                "flagged_phrases": ["mandatory arbitration", "disputes arising out of"],
                "suggestion": "Arbitration clause is acceptable but ensure fairness standards",
                "source_url": "https://www.twc.texas.gov",
                "effective_date": "2025-01-01"
            }
        ]
    },

    "FL": {
        "state": "Florida",
        "state_code": "FL",
        "last_updated": "2025-10-01",
        "data_sources": [
            {
                "url": "http://www.leg.state.fl.us/statutes/",
                "title": "Florida Statutes"
            },
            {
                "url": "https://floridajobs.org",
                "title": "Florida Department of Economic Opportunity"
            }
        ],
        "laws": [
            {
                "topic": "non_compete",
                "summary": "Non-compete agreements are ENFORCEABLE in Florida with reasonable restrictions.",
                "law_citation": "Florida Statute 542.335",
                "full_text": "Florida statute presumes non-competes reasonable if 6 months or less. Up to 2 years acceptable with legitimate business interest. Must be reasonable in time, geography, and scope. Keep time restriction to 2 years or less, reasonable geographic scope, protect legitimate business interest.",
                "severity": "info",
                "flagged_phrases": ["non-compete", "competitive activities", "restraint of trade"],
                "suggestion": "Non-compete is ENFORCEABLE in Florida - ensure time/geography limits are reasonable (6 months to 2 years)",
                "source_url": "http://www.leg.state.fl.us/statutes/",
                "effective_date": "2025-01-01"
            },
            {
                "topic": "salary_history",
                "summary": "Florida does NOT prohibit salary history inquiries.",
                "law_citation": "No state law restriction",
                "full_text": "Florida has no state law restricting salary history questions. Employers may ask about previous compensation. While legal, consider avoiding salary history questions to promote pay equity.",
                "severity": "info",
                "flagged_phrases": [],
                "suggestion": "While legal, consider avoiding salary history questions to promote pay equity",
                "source_url": "https://floridajobs.org",
                "effective_date": "2025-01-01"
            },
            {
                "topic": "medical_freedom",
                "summary": "CANNOT require COVID-19 vaccination, testing, or mask-wearing.",
                "law_citation": "Florida Medical Freedom Act",
                "full_text": "Florida law prohibits requiring COVID-19 vaccination, COVID-19 testing, mandating mask-wearing, or discriminating based on vaccination/immunity status.",
                "severity": "error",
                "flagged_phrases": ["COVID-19 vaccination", "COVID vaccination required", "proof of vaccination", "COVID test", "mask requirement", "vaccination status"],
                "suggestion": "Remove all COVID-19 related requirements",
                "source_url": "https://floridajobs.org",
                "effective_date": "2025-01-01"
            },
            {
                "topic": "drug_screening",
                "summary": "Drug testing is PERMITTED in Florida.",
                "law_citation": "Florida Statute 440.102",
                "full_text": "Florida allows pre-employment, reasonable suspicion, and random drug testing when properly implemented. Drug-free workplace policies encouraged.",
                "severity": "info",
                "flagged_phrases": ["drug test", "drug screening", "substance test"],
                "suggestion": "Drug testing is legal and acceptable in Florida. Ensure drug-free workplace policy is documented.",
                "source_url": "https://floridajobs.org",
                "effective_date": "2025-01-01"
            },
            {
                "topic": "minimum_wage",
                "summary": "Florida minimum wage increases throughout 2025.",
                "law_citation": "Florida Minimum Wage Act (Fla. Stat. § 448.110)",
                "full_text": "Through 9/29/25: $13.00/hour. 9/30/25-9/29/26: $14.00/hour. 9/30/26: $15.00/hour. Tipped employees: Cash wage $9.98 (through 9/29/25), $10.98 (9/30/25-9/29/26), $11.98 (9/30/26).",
                "severity": "info",
                "flagged_phrases": ["minimum wage", "hourly rate"],
                "suggestion": "Ensure compensation meets current minimum wage based on effective date",
                "source_url": "https://floridajobs.org",
                "effective_date": "2025-01-01"
            },
            {
                "topic": "background_checks",
                "summary": "Florida has NO statewide ban-the-box law. Can inquire about criminal history on application.",
                "law_citation": "Federal FCRA",
                "full_text": "Can inquire about criminal history on application. Must follow federal FCRA requirements: disclosure, authorization, pre-adverse action, adverse action notices.",
                "severity": "info",
                "flagged_phrases": ["background check", "criminal history"],
                "suggestion": "Background checks are permitted. Ensure FCRA compliance: standalone disclosure, written authorization, proper notices.",
                "source_url": "https://floridajobs.org",
                "effective_date": "2025-01-01"
            }
        ]
    },

    "IL": {
        "state": "Illinois",
        "state_code": "IL",
        "last_updated": "2025-10-01",
        "data_sources": [
            {
                "url": "https://www2.illinois.gov/idol/",
                "title": "Illinois Department of Labor"
            }
        ],
        "laws": [
            {
                "topic": "non_compete",
                "summary": "Non-compete agreements restricted - $75,000 salary threshold required.",
                "law_citation": "820 ILCS 90 - Illinois Freedom to Work Act",
                "full_text": "Illinois prohibits non-competes for employees earning less than $75,000/year ($45,000 for non-solicitation). Must be reasonable in time, geography, scope and provide adequate consideration.",
                "severity": "error",
                "flagged_phrases": ["restrictions on certain competitive and solicitation activities", "competitive activities", "non-compete", "covenant not to compete", "noncompete", "restraint of trade", "competing business"],
                "suggestion": "Verify salary exceeds $75,000 threshold or use confidentiality agreement instead",
                "source_url": "https://www2.illinois.gov/idol/",
                "effective_date": "2025-01-01"
            },
            {
                "topic": "salary_history",
                "summary": "Employers CANNOT ask about salary history.",
                "law_citation": "820 ILCS 112/10 - Illinois Equal Pay Act",
                "full_text": "Illinois prohibits employers from screening applicants based on wage/salary history or seeking such information from applicants or current/former employers.",
                "severity": "error",
                "flagged_phrases": ["previous salary", "current compensation", "salary history", "prior wages", "what did you earn", "compensation at previous job", "past earnings"],
                "suggestion": "Remove all salary history questions immediately. Ask 'What are your salary expectations for this role?' instead.",
                "source_url": "https://www2.illinois.gov/idol/",
                "effective_date": "2025-01-01"
            },
            {
                "topic": "pay_transparency",
                "summary": "Must include salary range and benefits in ALL job postings (15+ employees).",
                "law_citation": "820 ILCS 112/10 - Illinois Equal Pay Act (Effective Jan 1, 2025)",
                "full_text": "Employers with 15+ employees (nationwide count) must include: wage/salary OR wage/salary range ('good faith' expected compensation), plus general description of benefits and other compensation (bonuses, stock, incentives). Applies to jobs performed at least in part in Illinois.",
                "severity": "error",
                "flagged_phrases": ["salary to be determined", "competitive salary", "compensation TBD", "DOE", "salary commensurate with experience", "salary negotiable"],
                "suggestion": "Include specific salary range and benefits: 'Salary Range: $XX,XXX - $XX,XXX per year. Benefits: [health insurance, 401(k), PTO, bonuses, etc.]'",
                "source_url": "https://www2.illinois.gov/idol/",
                "effective_date": "2025-01-01"
            },
            {
                "topic": "paid_leave",
                "summary": "Illinois requires paid leave for all employees.",
                "law_citation": "820 ILCS 192 - Paid Leave for All Workers Act (Effective Jan 1, 2024)",
                "full_text": "Accrual: 1 hour per 40 hours worked (up to 40 hours per year). Use: own illness, family care, safety reasons (domestic violence, sexual violence). Applies to ALL employees.",
                "severity": "warning",
                "flagged_phrases": ["paid leave", "sick leave", "time off"],
                "suggestion": "State: 'You will accrue 1 hour of paid leave per 40 hours worked (up to 40 hours annually)'",
                "source_url": "https://www2.illinois.gov/idol/",
                "effective_date": "2024-01-01"
            },
            {
                "topic": "background_checks",
                "summary": "Criminal background checks have restrictions under ban-the-box law.",
                "law_citation": "775 ILCS 5/2-103",
                "full_text": "Illinois prohibits asking about criminal history until after conditional offer or interview ('ban the box'). Must conduct individualized assessment. Chicago has additional ban-the-box requirements.",
                "severity": "warning",
                "flagged_phrases": ["background check", "criminal history", "before offer", "prior to interview"],
                "suggestion": "Ensure background check occurs after conditional offer",
                "source_url": "https://www2.illinois.gov/idol/",
                "effective_date": "2025-01-01"
            }
        ]
    },

    "WA": {
        "state": "Washington",
        "state_code": "WA",
        "last_updated": "2025-10-01",
        "data_sources": [
            {
                "url": "https://www.lni.wa.gov/workers-rights/",
                "title": "Washington State Department of Labor & Industries"
            }
        ],
        "laws": [
            {
                "topic": "non_compete",
                "summary": "Non-compete agreements heavily restricted - salary threshold $123,394.17+ required.",
                "law_citation": "RCW 49.62 - Washington Non-Compete Law",
                "full_text": "Non-competes ONLY enforceable for employees earning $123,394.17+/year (2025 threshold). For independent contractors: $308,485.43+/year. Must be disclosed before job acceptance. Reasonable in scope, time, geography.",
                "severity": "error",
                "flagged_phrases": ["restrictions on certain competitive and solicitation activities", "competitive activities", "restraint of trade", "covenant not to compete", "non-compete", "noncompete", "competing business", "solicit customers"],
                "suggestion": "Remove non-compete OR ensure salary exceeds $123,394.17 AND disclose before acceptance. Use confidentiality agreements instead.",
                "source_url": "https://www.lni.wa.gov",
                "effective_date": "2025-01-01"
            },
            {
                "topic": "salary_history",
                "summary": "Employers CANNOT seek salary history information.",
                "law_citation": "RCW 49.58.110 - Equal Pay and Opportunities Act",
                "full_text": "Washington prohibits employers from seeking wage or salary history from applicants. Employers may discuss expectations after making an offer.",
                "severity": "error",
                "flagged_phrases": ["previous salary", "current compensation", "salary history", "what did you earn", "prior wages", "past earnings", "compensation at previous job"],
                "suggestion": "Remove all salary history questions. Ask 'What are your salary expectations for this role?' instead.",
                "source_url": "https://www.lni.wa.gov",
                "effective_date": "2025-01-01"
            },
            {
                "topic": "pay_transparency",
                "summary": "Must disclose wage scale or salary range in ALL job postings (15+ employees).",
                "law_citation": "RCW 49.58.110 - Equal Pay and Opportunities Act (Effective Jan 1, 2023)",
                "full_text": "Employers with 15+ employees must include: wage scale/salary range (minimum to maximum) OR fixed wage/salary, plus general description of benefits and other compensation. Applies to Washington-based positions and remote positions.",
                "severity": "error",
                "flagged_phrases": ["salary to be determined", "competitive salary", "compensation TBD", "DOE", "salary commensurate with experience", "starting at $", "up to $"],
                "suggestion": "Include specific salary range and benefits: 'Salary Range: $XX,XXX - $XX,XXX per year. Benefits: [list benefits]'",
                "source_url": "https://www.lni.wa.gov",
                "effective_date": "2023-01-01"
            },
            {
                "topic": "exempt_threshold",
                "summary": "Exempt employees must meet WA salary threshold.",
                "law_citation": "Washington Administrative Code",
                "full_text": "WA minimum for exempt status (2025): Small employers (1-50): $69,305.60/year ($1,332.80/week), Large employers (51+): $77,968.80/year ($1,499.40/week). 2028: increases to 2.5x minimum wage for ALL. Computer professionals: $58.31/hour minimum.",
                "severity": "error",
                "flagged_phrases": ["exempt", "salaried exempt", "exempt from overtime"],
                "suggestion": "Verify salary meets WA threshold or classify as non-exempt",
                "source_url": "https://www.lni.wa.gov",
                "effective_date": "2025-01-01"
            },
            {
                "topic": "paid_sick_leave",
                "summary": "Washington requires paid sick leave for ALL employees.",
                "law_citation": "RCW 49.46.210 - Washington Paid Sick Leave Law",
                "full_text": "All employees must accrue at least 1 hour of paid sick leave for every 40 hours worked. Can use for own illness, family care, public health emergencies, domestic violence situations.",
                "severity": "warning",
                "flagged_phrases": ["sick leave", "paid time off", "PTO"],
                "suggestion": "State: 'You will accrue 1 hour of paid sick leave per 40 hours worked'",
                "source_url": "https://www.lni.wa.gov",
                "effective_date": "2025-01-01"
            },
            {
                "topic": "background_checks",
                "summary": "Cannot inquire about criminal history until after determining applicant is otherwise qualified.",
                "law_citation": "RCW 49.94 - Fair Chance Act",
                "full_text": "Fair Chance Act: Cannot inquire about criminal history until after determining applicant is otherwise qualified for position. Some exceptions for certain positions. Must follow FCRA for background checks.",
                "severity": "warning",
                "flagged_phrases": ["background check", "criminal history", "before offer", "prior to employment"],
                "suggestion": "Background check contingency acceptable if done after qualification determination",
                "source_url": "https://www.lni.wa.gov",
                "effective_date": "2025-01-01"
            }
        ]
    }
}


def save_state_json(state_code, data, output_dir="data/state_laws_20"):
    """Save state data to JSON file"""
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    file_path = output_path / f"{state_code}.json"

    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"[OK] Created: {file_path}")
    print(f"     Laws: {len(data['laws'])}")


def main():
    """Convert all states"""
    print("=" * 60)
    print("CONVERTING EXISTING COMPLIANCE RULES TO JSON FORMAT")
    print("=" * 60)
    print()

    # Get absolute path
    script_dir = Path(__file__).parent
    output_dir = script_dir / "data" / "state_laws_20"

    for state_code, data in STATES_DATA.items():
        save_state_json(state_code, data, output_dir)
        print()

    print("=" * 60)
    print(f"[SUCCESS] Converted {len(STATES_DATA)} states")
    print("=" * 60)
    print()
    print("Files created in:", output_dir.absolute())
    print()
    print("Next steps:")
    print("1. Run: python test_compliance_v2.py")
    print("2. Load states into vector DB")
    print("3. Test multi-layer analysis")


if __name__ == "__main__":
    main()
