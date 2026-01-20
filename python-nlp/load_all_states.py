"""
Load All 50 States into RAG Database
=====================================
Quick script to load all state law files into the RAG system.
"""

import sys
from pathlib import Path

# Add parent directory to path so we can import compliance_v2
sys.path.insert(0, str(Path(__file__).parent))

from compliance_v2.rag_service import RAGService

def main():
    import argparse

    parser = argparse.ArgumentParser(description='Load state laws into RAG database')
    parser.add_argument('--data-dir', '-d',
                       default='data/state_laws_final',
                       help='Directory containing state JSON files')

    args = parser.parse_args()

    print("\n" + "="*60)
    print("LOADING STATES INTO RAG DATABASE")
    print("="*60)
    print(f"Data directory: {args.data_dir}\n")

    # Initialize RAG service with custom data path
    print("[INFO] Initializing RAG service...")
    rag = RAGService(data_path=args.data_dir)

    # All 50 state codes
    states = [
        "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
        "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
        "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
        "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
        "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
    ]

    successful = []
    failed = []

    # Check which states exist
    from pathlib import Path
    data_path = Path(args.data_dir)
    available_states = [f.stem for f in data_path.glob("*.json")]

    print(f"[INFO] Found {len(available_states)} state files in {args.data_dir}\n")

    # Load each available state
    for i, state_code in enumerate(available_states, 1):
        try:
            print(f"[{i}/{len(available_states)}] Loading {state_code}...", end=" ")
            rag.load_state_laws(state_code.upper())
            successful.append(state_code.upper())
            print("[OK]")
        except Exception as e:
            print(f"[ERROR] ({e})")
            failed.append(state_code.upper())

    # Summary
    print("\n" + "="*60)
    print("LOADING COMPLETE")
    print("="*60)
    print(f"\nSuccessful: {len(successful)}/50")
    print(f"Failed: {len(failed)}/50")

    if failed:
        print(f"\nFailed states: {', '.join(failed)}")

    # Check total count
    try:
        total_laws = rag.collection.count()
        print(f"\nTotal laws in database: {total_laws}")
        print(f"Average per state: {total_laws / len(successful):.1f}")
    except:
        print("\n[WARNING] Could not get law count")

    print("\n" + "="*60)
    print("NEXT STEPS:")
    print("="*60)
    print("1. Test the compliance analyzer:")
    print("   python test_compliance_v2.py")
    print("2. Or test interactively:")
    print("   python")
    print("   >>> from compliance_v2.compliance_analyzer import ComplianceAnalyzer")
    print("   >>> analyzer = ComplianceAnalyzer()")
    print("   >>> result = analyzer.analyze(offer_letter_text, 'CA')")
    print("="*60 + "\n")


if __name__ == "__main__":
    main()
