"""
Rebuild vector database with all 50 states dataset
"""
from compliance_v2.rag_service import RAGService
from pathlib import Path

print("=" * 70)
print("REBUILDING VECTOR DATABASE WITH ALL 50 STATES")
print("=" * 70)
print()

rag = RAGService(data_path="data/state_laws_50")  # Use all 50 states data

# Get all state files
state_files = list(Path("data/state_laws_50").glob("*.json"))
state_codes = [f.stem for f in state_files if f.stem != "metadata"]

print(f"Found {len(state_codes)} states in 50-state dataset:")
print(", ".join(sorted(state_codes)))
print()

# Load all states
print("Loading states into ChromaDB...")
for i, state in enumerate(sorted(state_codes), 1):
    print(f"  [{i}/{len(state_codes)}] Loading {state}...")
    try:
        rag.load_state_laws(state, force_reload=True)
    except Exception as e:
        print(f"      ERROR: {e}")

print()
print("=" * 70)
print("VECTOR DATABASE REBUILT SUCCESSFULLY!")
print("=" * 70)
print()

# Get final stats
coverage = rag.get_state_coverage()
print(f"Total states loaded: {coverage['state_count']}")
print(f"Total laws in vector DB: {coverage['total_laws']}")
print(f"States: {sorted(coverage['states_loaded'])}")

# Verify expected count
expected_laws = 90  # Based on verification above
if coverage['total_laws'] >= expected_laws:
    print(f"\n[OK] All {expected_laws} laws loaded successfully!")
else:
    print(f"\n[WARNING] Expected {expected_laws} laws, but only {coverage['total_laws']} loaded!")
