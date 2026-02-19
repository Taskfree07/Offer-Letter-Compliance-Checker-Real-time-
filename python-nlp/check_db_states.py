"""Check which states are in the database"""
from compliance_v2.rag_service import get_rag_service

rag = get_rag_service()

total_laws = rag.collection.count()

print("=" * 60)
print("VECTOR DATABASE STATUS")
print("=" * 60)
print(f"Total laws in database: {total_laws}")
print(f"States tracked by RAG service: {len(rag.loaded_states)}")
print()

# Get ALL documents to check unique states (increase limit to cover all laws)
results = rag.collection.get(limit=total_laws + 100)  # Get all documents
if results and results.get('metadatas'):
    states_in_db = set(meta.get('state') for meta in results['metadatas'] if meta.get('state'))
    print(f"Unique states in database: {len(states_in_db)}")
    print(f"States: {sorted(states_in_db)}")

    # Count laws per state
    state_counts = {}
    for meta in results['metadatas']:
        state = meta.get('state')
        if state:
            state_counts[state] = state_counts.get(state, 0) + 1

    print()
    print("Laws per state:")
    for state in sorted(state_counts.keys()):
        print(f"  {state}: {state_counts[state]} laws")
print("=" * 60)
