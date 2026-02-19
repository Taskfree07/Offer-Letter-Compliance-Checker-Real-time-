"""
Threshold Tuning Script for Compliance System
Tests different similarity and confidence thresholds to optimize precision/recall
"""
import json
from compliance_v2.rag_service import RAGService
from compliance_v2.compliance_analyzer import ComplianceAnalyzer

# Sample test documents with known violations
TEST_DOCUMENTS = {
    "CA_non_compete": {
        "state": "CA",
        "document": """Dear Candidate,
We are pleased to offer you the position of Software Engineer at TechCorp in California.
Your annual salary will be $120,000. This offer is contingent on you agreeing to a
2-year non-compete agreement that restricts you from working for competitors.
We also require you to disclose your salary history from your previous employer.
This is an at-will employment agreement.""",
        "expected_violations": ["non_compete", "salary_history"]
    },
    "NY_background_check": {
        "state": "NY",
        "document": """Employment Offer Letter
Position: Marketing Manager at ABC Corp, New York
Salary: $95,000 per year
Before we can finalize this offer, you must complete a criminal background check.
We will also conduct a credit check as part of our standard hiring process.
Please provide your salary history from the past 3 years.""",
        "expected_violations": ["background_check", "salary_history"]
    },
    "TX_clean": {
        "state": "TX",
        "document": """Dear Applicant,
We are excited to offer you the position of Data Analyst at DataCo in Austin, Texas.
Annual Salary: $85,000
Start Date: March 1, 2025
This is an at-will employment position. Please sign and return within 5 business days.""",
        "expected_violations": []
    }
}

# Thresholds to test
SIMILARITY_THRESHOLDS = [0.05, 0.10, 0.15, 0.20, 0.30]
CONFIDENCE_THRESHOLDS = [0.50, 0.60, 0.70, 0.80]

def test_similarity_thresholds():
    """Test different similarity thresholds for law retrieval"""
    print("=" * 80)
    print("TESTING SIMILARITY THRESHOLDS")
    print("=" * 80)
    print()

    rag = RAGService()

    for test_name, test_data in TEST_DOCUMENTS.items():
        state = test_data["state"]
        document = test_data["document"]

        print(f"Test Case: {test_name}")
        print(f"State: {state}")
        print(f"Document length: {len(document)} chars")
        print(f"Expected violations: {test_data['expected_violations']}")
        print()

        print("Threshold | Laws Retrieved | Top Similarity | Keywords")
        print("-" * 80)

        for threshold in SIMILARITY_THRESHOLDS:
            laws = rag.query_relevant_laws(
                state=state,
                document_text=document,
                top_k=10,
                min_similarity=threshold,
                use_keyword_boost=True
            )

            if laws:
                top_sim = max(law['similarity'] for law in laws)
                keyword_count = sum(1 for law in laws if 'keywords_matched' in law)
            else:
                top_sim = 0.0
                keyword_count = 0

            print(f" {threshold:0.2f}     |      {len(laws):2d}       |    {top_sim:0.3f}      |    {keyword_count}")

        print()

    print("=" * 80)
    print()

def test_full_analysis_with_thresholds():
    """Test full compliance analysis with different threshold combinations"""
    print("=" * 80)
    print("TESTING FULL COMPLIANCE ANALYSIS")
    print("=" * 80)
    print()

    analyzer = ComplianceAnalyzer()

    # Test each document with current threshold settings
    for test_name, test_data in TEST_DOCUMENTS.items():
        state = test_data["state"]
        document = test_data["document"]
        expected = test_data['expected_violations']

        print(f"\\nTest: {test_name} ({state})")
        print(f"Expected violations: {len(expected)}")

        result = analyzer.analyze(document, state)

        print(f"Found violations: {len(result['violations'])}")
        print(f"  - Pattern matches: {result.get('pattern_matches', 0)}")
        print(f"  - LLM findings: {result.get('llm_findings', 0)}")
        print(f"  - Avg confidence: {result.get('confidence_avg', 0):.0%}")

        if result['violations']:
            print(f"\\nViolations detected:")
            for v in result['violations']:
                topic = v.get('topic', v.get('type', 'Unknown'))
                method = v.get('validation', v.get('method', 'N/A'))
                conf = v.get('confidence', 0)
                print(f"  - {topic}: {method} ({conf:.0%})")

        # Check if we found expected violations
        found_topics = [v.get('topic', v.get('type', '')).lower() for v in result['violations']]
        for exp_violation in expected:
            if any(exp_violation in topic for topic in found_topics):
                print(f"  [OK] Found expected: {exp_violation}")
            else:
                print(f"  [MISS] Did not find: {exp_violation}")

        print()

    print("=" * 80)

def get_recommendations():
    """Provide threshold recommendations based on use case"""
    print()
    print("=" * 80)
    print("THRESHOLD RECOMMENDATIONS")
    print("=" * 80)
    print()

    recommendations = {
        "High Precision (Fewer False Positives)": {
            "min_similarity": 0.20,
            "min_confidence": 0.80,
            "use_case": "Legal review where false positives are costly",
            "trade_off": "May miss some violations"
        },
        "Balanced (Production Default)": {
            "min_similarity": 0.15,
            "min_confidence": 0.70,
            "use_case": "General compliance checking",
            "trade_off": "Good balance of precision and recall"
        },
        "High Recall (Catch Everything)": {
            "min_similarity": 0.05,
            "min_confidence": 0.50,
            "use_case": "Initial screening or training",
            "trade_off": "More false positives, needs manual review"
        },
        "Custom Quality States Only": {
            "min_similarity": 0.10,
            "min_confidence": 0.60,
            "use_case": "For states with verified, quality data (CA, NY, TX, etc.)",
            "trade_off": "Best for well-documented states"
        }
    }

    for scenario, settings in recommendations.items():
        print(f"{scenario}:")
        print(f"  Similarity Threshold: {settings['min_similarity']}")
        print(f"  Confidence Threshold: {settings['min_confidence']}")
        print(f"  Use Case: {settings['use_case']}")
        print(f"  Trade-off: {settings['trade_off']}")
        print()

    print("=" * 80)
    print()
    print("CURRENT SETTINGS:")
    print("  Location: compliance_v2/compliance_analyzer.py (line ~156)")
    print("  Current min_similarity: 0.05 (very permissive)")
    print("  Current min_confidence: 0.70 (moderate)")
    print()
    print("RECOMMENDATION FOR PRODUCTION:")
    print("  Set min_similarity to 0.15 for balanced performance")
    print("  Keep min_confidence at 0.70 for quality violations")
    print()
    print("=" * 80)

def main():
    """Run all threshold tuning tests"""
    print()
    print("*" * 80)
    print("COMPLIANCE SYSTEM THRESHOLD TUNING")
    print("*" * 80)
    print()
    print("This script tests different threshold settings to optimize the compliance")
    print("checking system for the best balance of precision and recall.")
    print()

    # Test 1: Similarity thresholds
    test_similarity_thresholds()

    # Test 2: Full analysis
    test_full_analysis_with_thresholds()

    # Test 3: Recommendations
    get_recommendations()

    print()
    print("*" * 80)
    print("TESTING COMPLETE")
    print("*" * 80)
    print()

if __name__ == "__main__":
    main()
