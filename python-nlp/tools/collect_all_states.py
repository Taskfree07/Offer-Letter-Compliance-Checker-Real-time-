"""
Batch State Law Collector
==========================
Collect all 4 priority states at once: MA, CO, OR, PA

Usage:
    python collect_all_states.py                    # FREE Phi-3 (recommended)
    python collect_all_states.py --provider basic   # FREE keyword-only
    python collect_all_states.py --provider claude  # Paid Claude API
    python collect_all_states.py --states MA CO     # Specific states only
"""

import argparse
import sys
from pathlib import Path
from automated_state_collector import OFFICIAL_STATE_SOURCES


def collect_multiple_states(states: list, provider: str = "phi3", api_key: str = None):
    """Collect data for multiple states"""

    print(f"\n{'='*70}")
    print(f"BATCH STATE LAW COLLECTION")
    print(f"{'='*70}")
    print(f"States to collect: {', '.join(states)}")
    print(f"LLM provider: {provider}")
    print(f"{'='*70}\n")

    # Create collector based on provider
    if provider == "phi3":
        from phi3_collector import Phi3Collector
        collector = Phi3Collector()
        print("Using: Phi-3 Local (FREE, no API costs)")
    elif provider == "basic":
        from automated_state_collector import StateDataCollector
        collector = StateDataCollector()
        print("Using: Basic keyword extraction (FREE)")
    elif provider in ["claude", "openai"]:
        from llm_enhanced_collector import LLMEnhancedCollector
        collector = LLMEnhancedCollector(
            llm_api_key=api_key,
            llm_provider=provider
        )
        print(f"Using: {provider.upper()} API (PAID - uses credits)")
    else:
        raise ValueError(f"Unknown provider: {provider}")

    results = []

    for i, state_code in enumerate(states, 1):
        print(f"\n{'='*70}")
        print(f"STATE {i}/{len(states)}: {state_code}")
        print(f"{'='*70}")

        try:
            # Collect data
            state_data = collector.collect_state_data(state_code)

            # Save to file
            output_file = collector.save_state_data(state_data)

            # Generate review report
            collector.generate_review_report(state_data)

            results.append({
                "state": state_code,
                "success": True,
                "output_file": str(output_file),
                "laws_found": len(state_data["laws"]),
                "needs_review": len([l for l in state_data["laws"] if l.get("needs_human_review", False)]),
                "avg_confidence": state_data["review_notes"]["average_confidence"]
            })

        except Exception as e:
            print(f"\n[ERROR] Failed to collect {state_code}: {e}")
            results.append({
                "state": state_code,
                "success": False,
                "error": str(e)
            })

        # Pause between states
        if i < len(states):
            print(f"\nPausing 5 seconds before next state...")
            import time
            time.sleep(5)

    # Print summary
    print(f"\n{'='*70}")
    print(f"BATCH COLLECTION COMPLETE")
    print(f"{'='*70}\n")

    successful = [r for r in results if r["success"]]
    failed = [r for r in results if not r["success"]]

    print(f"Successful: {len(successful)}/{len(states)}")
    print(f"Failed: {len(failed)}/{len(states)}\n")

    if successful:
        print("SUCCESSFUL STATES:")
        print("-" * 70)
        for result in successful:
            print(f"  {result['state']}: {result['laws_found']} laws found, "
                  f"{result['needs_review']} need review, "
                  f"avg confidence {result['avg_confidence']}")

    if failed:
        print("\nFAILED STATES:")
        print("-" * 70)
        for result in failed:
            print(f"  {result['state']}: {result['error']}")

    # Review summary
    total_needs_review = sum(r.get("needs_review", 0) for r in successful)
    print(f"\n{'='*70}")
    print("NEXT STEPS:")
    print(f"{'='*70}")
    print(f"1. Review {total_needs_review} low-confidence laws across all states")
    print(f"2. Estimated review time: {total_needs_review * 5}-{total_needs_review * 10} minutes")
    print(f"3. Update law_citation and effective_date fields")
    print(f"4. Set confidence=1.0 and needs_human_review=false after verification")
    print(f"5. Load into RAG system: python -c \"from compliance_v2.rag_service import get_rag_service; rag = get_rag_service(); [rag.load_state_laws(s) for s in {[r['state'] for r in successful]}]\"")
    print(f"{'='*70}\n")

    return results


def main():
    parser = argparse.ArgumentParser(description='Batch collect multiple states')
    parser.add_argument('--states', '-s', nargs='+',
                       default=['MA', 'CO', 'OR', 'PA'],
                       help='State codes to collect (default: MA CO OR PA)')
    parser.add_argument('--provider', '-p', default='phi3',
                       choices=['phi3', 'basic', 'claude', 'openai'],
                       help='Collection method (default: phi3 - FREE local LLM)')
    parser.add_argument('--api-key', '-k',
                       help='API key for claude/openai (or set ANTHROPIC_API_KEY/OPENAI_API_KEY env var)')

    args = parser.parse_args()

    # Validate states
    invalid_states = [s for s in args.states if s.upper() not in OFFICIAL_STATE_SOURCES]
    if invalid_states:
        print(f"ERROR: Invalid states: {', '.join(invalid_states)}")
        print(f"Available states: {', '.join(OFFICIAL_STATE_SOURCES.keys())}")
        return 1

    states = [s.upper() for s in args.states]

    # Collect all states
    results = collect_multiple_states(
        states=states,
        provider=args.provider,
        api_key=args.api_key
    )

    # Return exit code
    failed_count = len([r for r in results if not r["success"]])
    return 1 if failed_count > 0 else 0


if __name__ == "__main__":
    sys.exit(main())
