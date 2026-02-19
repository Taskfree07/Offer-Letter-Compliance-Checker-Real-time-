"""
Load All 50 US States into ChromaDB Vector Database
Uses quality data (state_laws_20) where available, falls back to state_laws_50
"""
import json
from pathlib import Path
from compliance_v2.rag_service import RAGService
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def load_all_states():
    """Load all 50 US states into the vector database"""

    print("=" * 80)
    print("LOADING ALL 50 US STATES INTO VECTOR DATABASE")
    print("=" * 80)
    print()

    # Initialize RAG service (uses state_laws_20 by default)
    rag = RAGService()

    # Quality states (use state_laws_20)
    quality_states = ['CA', 'CO', 'FL', 'IL', 'MA', 'NY', 'OR', 'PA', 'TX', 'WA']

    # All 50 US states
    all_states = [
        'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
        'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
        'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
        'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
        'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
    ]

    print(f"Total states to load: {len(all_states)}")
    print(f"Quality data available for: {len(quality_states)} states")
    print()

    # Track loading statistics
    loaded_quality = []
    loaded_fallback = []
    failed = []

    # Load states
    for i, state in enumerate(all_states, 1):
        print(f"[{i}/{len(all_states)}] Loading {state}...", end=" ")

        try:
            # Check if quality data exists
            quality_file = Path(f"data/state_laws_20/{state}.json")
            fallback_file = Path(f"data/state_laws_50/{state}.json")

            if quality_file.exists():
                # Load from quality dataset
                rag.load_state_laws(state, force_reload=False)
                loaded_quality.append(state)
                print("[OK] Quality")
            elif fallback_file.exists():
                # Load from 50-state dataset
                # Temporarily change data path
                original_path = rag.data_path
                rag.data_path = Path("data/state_laws_50")
                rag.load_state_laws(state, force_reload=False)
                rag.data_path = original_path
                loaded_fallback.append(state)
                print("[OK] Standard")
            else:
                failed.append(state)
                print("[FAIL] No data")

        except Exception as e:
            failed.append(state)
            print(f"[ERROR] {str(e)[:40]}")

    print()
    print("=" * 80)
    print("LOADING COMPLETE")
    print("=" * 80)
    print()
    print(f"Successfully loaded: {len(loaded_quality) + len(loaded_fallback)} states")
    print(f"  - Quality data: {len(loaded_quality)} states")
    print(f"  - Standard data: {len(loaded_fallback)} states")
    print(f"  - Failed: {len(failed)} states")
    print()

    if loaded_quality:
        print(f"Quality states ({len(loaded_quality)}): {', '.join(sorted(loaded_quality))}")
    if loaded_fallback:
        print(f"Standard states ({len(loaded_fallback)}): {', '.join(sorted(loaded_fallback))}")
    if failed:
        print(f"Failed states ({len(failed)}): {', '.join(sorted(failed))}")

    print()
    print(f"Total states in vector DB: {len(rag.loaded_states)}")
    print(f"States: {sorted(rag.loaded_states)}")
    print()

    # Get total law count
    try:
        results = rag.collection.get()
        total_laws = len(results.get('ids', []))
        print(f"Total laws in database: {total_laws}")
    except Exception as e:
        print(f"Could not count laws: {e}")

    print()
    print("=" * 80)

    return {
        'loaded_quality': loaded_quality,
        'loaded_fallback': loaded_fallback,
        'failed': failed,
        'total_loaded': len(loaded_quality) + len(loaded_fallback)
    }

if __name__ == "__main__":
    result = load_all_states()

    print()
    print("[SUCCESS] All 50 states loaded into vector database!")
    print()
    print("Next steps:")
    print("  1. Restart backend server: cd python-nlp && python app.py")
    print("  2. Test compliance: curl http://localhost:5000/api/v2/health")
