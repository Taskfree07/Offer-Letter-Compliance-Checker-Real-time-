"""
Test script for Compliance V2 system
Tests RAG, LLM, and multi-layer analysis
"""

import logging
import sys
from pathlib import Path

# Add compliance_v2 to path
sys.path.insert(0, str(Path(__file__).parent))

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)


def test_rag_service():
    """Test RAG service initialization and data loading"""
    print("\n" + "=" * 60)
    print("TEST 1: RAG Service")
    print("=" * 60)

    try:
        from compliance_v2.rag_service import get_rag_service

        # Initialize RAG service
        rag = get_rag_service()

        # Load California data
        print("\n[INFO] Loading California state laws...")
        rag.load_state_laws("CA")

        # Check coverage
        coverage = rag.get_state_coverage()
        print(f"\n[OK] Coverage:")
        print(f"   States loaded: {coverage['states_loaded']}")
        print(f"   Total laws: {coverage['total_laws']}")

        # Test query
        test_text = "This offer letter includes a non-compete clause for 2 years"
        print(f"\n[INFO] Test query: '{test_text}'")

        results = rag.query_relevant_laws("CA", test_text, top_k=3)
        print(f"\n[INFO] Found {len(results)} relevant laws:")

        for idx, law in enumerate(results, 1):
            meta = law['metadata']
            print(f"\n   {idx}. {meta['topic']} (similarity: {law['similarity']:.0%})")
            print(f"      Citation: {meta['law_citation']}")
            print(f"      Severity: {meta['severity']}")
            print(f"      Summary: {meta['summary'][:80]}...")

        print("\n[OK] RAG Service: PASSED")
        return True

    except Exception as e:
        print(f"\n[ERROR] RAG Service: FAILED - {e}")
        import traceback
        traceback.print_exc()
        return False


def test_llm_service():
    """Test LLM service (mock mode if no GPU)"""
    print("\n" + "=" * 60)
    print("TEST 2: LLM Service")
    print("=" * 60)

    try:
        from compliance_v2.llm_service import get_llm_service

        # Initialize LLM (will use mock mode if no GPU)
        llm = get_llm_service()
        print("\n[INFO] Initializing LLM service...")
        llm.load_model()

        # Test generation
        test_prompt = """Analyze this California offer letter for violations:

The employment agreement includes a non-compete clause restricting competitive employment for 2 years.

What violations exist? Respond in JSON format."""

        print(f"\n[INFO] Test prompt: {test_prompt[:100]}...")
        response = llm.generate(test_prompt, max_new_tokens=256)

        print(f"\n[INFO] LLM Response:")
        print(response[:500])

        print("\n[OK] LLM Service: PASSED (mock mode if no GPU)")
        return True

    except Exception as e:
        print(f"\n[ERROR] LLM Service: FAILED - {e}")
        import traceback
        traceback.print_exc()
        return False


def test_multi_layer_analyzer():
    """Test full multi-layer compliance analyzer"""
    print("\n" + "=" * 60)
    print("TEST 3: Multi-Layer Compliance Analyzer")
    print("=" * 60)

    try:
        from compliance_v2.compliance_analyzer import get_compliance_analyzer

        # Initialize analyzer
        print("\n[INFO] Initializing multi-layer analyzer...")
        analyzer = get_compliance_analyzer(use_rag=True, use_llm=True)

        # Test document with multiple violations
        test_document = """
EMPLOYMENT OFFER LETTER

Dear Candidate,

We are pleased to offer you employment with the following terms:

1. Position: Senior Software Engineer
2. Compensation: Based on your previous salary at your last employer
3. Start Date: February 1, 2025

TERMS AND CONDITIONS:

1. Non-Compete: You agree not to engage in any competitive activities or
   work for competing businesses for a period of 2 years after employment ends.

2. Arbitration: All disputes arising out of this agreement will be resolved
   using mandatory arbitration procedures.

3. Background Check: We will conduct a criminal history inquiry before
   extending this offer.

4. At-Will Employment: This employment is at-will and may be terminated
   at any time by either party.

Please confirm your acceptance by signing below.
        """

        # Run analysis
        print("\n[INFO] Analyzing test document for California...")
        print(f"   Document length: {len(test_document)} characters")

        results = analyzer.analyze(test_document, "CA")

        # Display results
        print(f"\n[RESULTS] ANALYSIS RESULTS:")
        print(f"   State: {results['state']}")
        print(f"   Layers used: {', '.join(results['layers_used'])}")
        print(f"   Total violations: {results['total_violations']}")
        print(f"   - Errors: {results['errors']}")
        print(f"   - Warnings: {results['warnings']}")
        print(f"   - Info: {results['info']}")
        print(f"   Average confidence: {results['confidence_avg']:.0%}")

        print(f"\n[VIOLATIONS] Violations Found:")

        for idx, v in enumerate(results['violations'], 1):
            topic = v.get('topic', v.get('type', 'Unknown'))
            severity = v.get('severity', 'unknown')
            confidence = v.get('confidence', 0.0)
            method = v.get('validation_method', v.get('method', 'unknown'))

            print(f"\n   {idx}. {topic}")
            print(f"      Severity: {severity}")
            print(f"      Confidence: {confidence:.0%}")
            print(f"      Method: {method}")

            if 'law_citation' in v:
                print(f"      Law: {v['law_citation']}")

            message = v.get('message', v.get('explanation', 'No details'))
            print(f"      Message: {message[:100]}...")

            if 'suggestion' in v:
                print(f"      Fix: {v['suggestion'][:100]}...")

        print("\n[OK] Multi-Layer Analyzer: PASSED")
        return True

    except Exception as e:
        print(f"\n[ERROR] Multi-Layer Analyzer: FAILED - {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Run all tests"""
    print("\n" + "=" * 60)
    print("COMPLIANCE V2 SYSTEM TESTS")
    print("=" * 60)

    results = {
        "RAG Service": test_rag_service(),
        "LLM Service": test_llm_service(),
        "Multi-Layer Analyzer": test_multi_layer_analyzer()
    }

    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)

    passed = sum(1 for v in results.values() if v)
    total = len(results)

    for test_name, result in results.items():
        status = "[OK] PASSED" if result else "[ERROR] FAILED"
        print(f"{test_name}: {status}")

    print(f"\nOverall: {passed}/{total} tests passed")

    if passed == total:
        print("\n[SUCCESS] All tests passed! System is ready.")
        return 0
    else:
        print(f"\n[WARNING] {total - passed} test(s) failed. Review errors above.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
