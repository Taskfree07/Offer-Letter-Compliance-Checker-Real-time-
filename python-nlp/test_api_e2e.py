"""
End-to-End API Testing
Tests the Flask API with real offer letter scenarios
"""

import requests
import json
import time
from typing import Dict, Any

# API base URL
BASE_URL = "http://localhost:5000/api/v2"

# Sample offer letters for testing
SAMPLE_OFFERS = {
    "california_violations": """
EMPLOYMENT OFFER LETTER

Dear Candidate,

We are pleased to offer you the position of Senior Software Engineer at TechCorp Inc.

COMPENSATION AND BENEFITS:
Based on your previous salary at your last employer of $120,000, we are offering you an annual salary of $130,000.

TERMS AND CONDITIONS:

1. NON-COMPETE AGREEMENT
You agree that for a period of 2 years after employment ends, you will not:
- Work for any competing business
- Engage in any competitive activities
- Solicit our clients or employees

2. BACKGROUND CHECK
We will conduct a criminal background check before your start date.

3. DRUG TESTING
All employees must pass a drug screening test including marijuana testing.

4. ARBITRATION
All disputes must be resolved through mandatory binding arbitration.

5. AT-WILL EMPLOYMENT
This is an at-will employment relationship.

Please sign and return by March 1, 2025.

Sincerely,
HR Department
    """,

    "colorado_violations": """
OFFER OF EMPLOYMENT

Position: Marketing Manager
Company: Denver Marketing Solutions

COMPENSATION:
Salary: $85,000 annually
Start Date: April 1, 2025

EMPLOYMENT TERMS:

1. Non-Competition Clause
Employee agrees not to work for competing businesses within Colorado for 18 months after leaving the company.

2. Drug Policy
Random drug testing will be conducted, including tests for marijuana use, even for off-duty consumption.

3. Confidentiality
All company information must remain confidential during and after employment.

4. Background Screening
Criminal history inquiry will be conducted before employment begins.

Please confirm your acceptance.
    """,

    "massachusetts_clean": """
EMPLOYMENT OFFER

Dear Jane Smith,

We are delighted to offer you the position of Product Manager at Boston Tech LLC.

POSITION DETAILS:
- Title: Senior Product Manager
- Department: Product Development
- Start Date: May 1, 2025

COMPENSATION:
- Base Salary: $140,000 per year
- Performance Bonus: Up to 15% of base salary
- Benefits: Health, dental, vision insurance
- 401(k) with 4% company match
- 4 weeks paid vacation

EMPLOYMENT TERMS:
- This is an at-will employment relationship
- You will receive our employee handbook on your first day
- All employees must maintain confidentiality of proprietary information

We look forward to you joining our team!

Sincerely,
Hiring Manager
    """,

    "new_york_mixed": """
OFFER LETTER

Position: Financial Analyst
Location: New York City
Salary: Competitive, based on experience

TERMS:
1. At-will employment
2. Standard benefits package
3. Non-disclosure agreement required
4. Background check will be conducted after conditional offer
5. You may not work for competitors for 6 months after leaving (executives only)

Start date: To be determined
    """
}


def print_section(title: str):
    """Print a formatted section header"""
    print("\n" + "="*70)
    print(f"  {title}")
    print("="*70)


def test_health_check():
    """Test health check endpoint"""
    print_section("TEST 1: Health Check")

    try:
        response = requests.get(f"{BASE_URL}/health", timeout=10)
        data = response.json()

        print(f"Status Code: {response.status_code}")
        print(f"API Status: {data.get('status')}")
        print(f"Version: {data.get('version')}")
        print(f"Total Laws: {data.get('database', {}).get('total_laws')}")
        print(f"States Loaded: {data.get('database', {}).get('states_loaded')}")

        assert response.status_code == 200, "Health check failed"
        assert data.get('status') == 'healthy', "API not healthy"

        print("\n[PASSED]")
        return True

    except Exception as e:
        print(f"\n[FAILED]: {e}")
        return False


def test_get_states():
    """Test states endpoint"""
    print_section("TEST 2: Get Supported States")

    try:
        response = requests.get(f"{BASE_URL}/states", timeout=10)
        data = response.json()

        print(f"Status Code: {response.status_code}")
        print(f"Total States: {data.get('total_states')}")
        print(f"States: {', '.join(data.get('states', []))}")
        print(f"Total Laws: {data.get('total_laws')}")

        # Show details for a few states
        state_details = data.get('state_details', {})
        print("\nSample State Details:")
        for state in list(state_details.keys())[:3]:
            details = state_details[state]
            print(f"  {state}: {details['total_laws']} laws")
            print(f"       Topics: {', '.join(details['topics_covered'][:5])}")

        assert response.status_code == 200, "Get states failed"
        assert data.get('total_states', 0) > 0, "No states loaded"

        print("\n[PASSED]")
        return True

    except Exception as e:
        print(f"\n[FAILED]: {e}")
        return False


def test_compliance_check(name: str, document: str, state: str, expected_violations: int = None):
    """Test compliance check endpoint"""
    print_section(f"TEST: Compliance Check - {name}")

    try:
        start_time = time.time()

        payload = {
            "document_text": document,
            "state": state,
            "options": {
                "use_rag": True,
                "use_llm": True,
                "min_confidence": 0.3
            }
        }

        response = requests.post(
            f"{BASE_URL}/compliance-check",
            json=payload,
            timeout=60
        )

        elapsed = time.time() - start_time
        data = response.json()

        print(f"Status Code: {response.status_code}")
        print(f"Processing Time: {elapsed:.2f}s")
        print(f"\nRESULTS:")
        print(f"  State: {data.get('state')}")
        print(f"  Total Violations: {data.get('total_violations')}")
        print(f"  Errors: {data.get('errors')}")
        print(f"  Warnings: {data.get('warnings')}")
        print(f"  Info: {data.get('info')}")
        print(f"  Confidence Avg: {data.get('confidence_avg', 0):.0%}")

        summary = data.get('summary', {})
        print(f"\nSUMMARY:")
        print(f"  Compliant: {summary.get('is_compliant')}")
        print(f"  Overall Risk: {summary.get('overall_risk')}")

        # Show violations
        violations = data.get('violations', [])
        if violations:
            print(f"\nVIOLATIONS FOUND:")
            for idx, v in enumerate(violations[:5], 1):  # Show first 5
                print(f"\n  {idx}. {v.get('topic', 'Unknown')}")
                print(f"     Severity: {v.get('severity')}")
                print(f"     Confidence: {v.get('confidence', 0):.0%}")
                print(f"     Method: {v.get('validation_method', 'unknown')}")
                message = v.get('message', v.get('explanation', 'No details'))
                print(f"     Message: {message[:100]}...")

        # Performance metrics
        perf = data.get('_performance', {})
        if perf:
            print(f"\nPERFORMANCE:")
            print(f"  Server Processing: {perf.get('processing_time_seconds')}s")

        assert response.status_code == 200, f"Request failed with {response.status_code}"

        print("\n[PASSED]")
        return True, data

    except Exception as e:
        print(f"\n[FAILED]: {e}")
        return False, None


def test_analyze_laws(state: str, query: str):
    """Test analyze-laws endpoint"""
    print_section(f"TEST: Analyze Laws - {state}")

    try:
        payload = {
            "document_text": query,
            "state": state,
            "top_k": 5,
            "min_similarity": 0.15
        }

        response = requests.post(
            f"{BASE_URL}/analyze-laws",
            json=payload,
            timeout=30
        )

        data = response.json()

        print(f"Status Code: {response.status_code}")
        print(f"Query: '{query}'")
        print(f"State: {data.get('state')}")
        print(f"Total Laws Found: {data.get('total_laws_found')}")

        laws = data.get('laws', [])
        if laws:
            print(f"\nRELEVANT LAWS:")
            for idx, law in enumerate(laws, 1):
                print(f"\n  {idx}. {law['topic']}")
                print(f"     Similarity: {law['similarity_score']:.1%}")
                print(f"     Citation: {law['law_citation']}")
                print(f"     Summary: {law['summary'][:80]}...")

        assert response.status_code == 200, "Analyze laws failed"

        print("\n[PASSED]")
        return True

    except Exception as e:
        print(f"\n[FAILED]: {e}")
        return False


def test_validate_document(document: str):
    """Test validate-document endpoint"""
    print_section("TEST: Validate Document")

    try:
        payload = {"document_text": document}

        response = requests.post(
            f"{BASE_URL}/validate-document",
            json=payload,
            timeout=10
        )

        data = response.json()

        print(f"Status Code: {response.status_code}")
        print(f"Is Valid: {data.get('is_valid')}")
        print(f"Document Length: {data.get('document_length')}")
        print(f"Word Count: {data.get('word_count')}")
        print(f"Completeness Score: {data.get('completeness_score')}/100")
        print(f"Found Sections: {', '.join(data.get('found_sections', []))}")

        if data.get('issues'):
            print(f"Issues: {', '.join(data['issues'])}")

        assert response.status_code == 200, "Validation failed"

        print("\n[PASSED]")
        return True

    except Exception as e:
        print(f"\n[FAILED]: {e}")
        return False


def main():
    """Run all end-to-end tests"""
    print("\n" + "="*70)
    print("  END-TO-END API TESTING")
    print("  Testing Flask API with Real Offer Letters")
    print("="*70)

    print("\n[WARNING] Make sure the API server is running:")
    print("   python api_v2.py")
    print("\nPress Enter to continue...")
    input()

    results = []

    # Basic endpoint tests
    results.append(("Health Check", test_health_check()))
    results.append(("Get States", test_get_states()))

    # Compliance check tests
    results.append(
        ("CA Violations", test_compliance_check(
            "California with Multiple Violations",
            SAMPLE_OFFERS["california_violations"],
            "CA"
        )[0])
    )

    results.append(
        ("CO Violations", test_compliance_check(
            "Colorado with Violations",
            SAMPLE_OFFERS["colorado_violations"],
            "CO"
        )[0])
    )

    results.append(
        ("MA Clean", test_compliance_check(
            "Massachusetts Clean Offer",
            SAMPLE_OFFERS["massachusetts_clean"],
            "MA"
        )[0])
    )

    # Law query tests
    results.append(
        ("Analyze Laws CA", test_analyze_laws(
            "CA",
            "non-compete clause for 2 years and salary history inquiry"
        ))
    )

    results.append(
        ("Analyze Laws CO", test_analyze_laws(
            "CO",
            "marijuana drug testing and paid family leave"
        ))
    )

    # Document validation test
    results.append(
        ("Validate Document", test_validate_document(
            SAMPLE_OFFERS["california_violations"]
        ))
    )

    # Summary
    print_section("TEST SUMMARY")

    passed = sum(1 for _, result in results if result)
    total = len(results)

    print(f"\nResults: {passed}/{total} tests passed\n")

    for name, result in results:
        status = "[PASSED]" if result else "[FAILED]"
        print(f"  {name}: {status}")

    if passed == total:
        print("\n[SUCCESS] All tests passed! API is working perfectly.")
        return 0
    else:
        print(f"\n[WARNING] {total - passed} test(s) failed. Review errors above.")
        return 1


if __name__ == "__main__":
    import sys
    sys.exit(main())
