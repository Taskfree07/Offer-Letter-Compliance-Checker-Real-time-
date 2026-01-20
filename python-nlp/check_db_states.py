"""Check which states are in the database"""
from compliance_v2.rag_service import get_rag_service

rag = get_rag_service()

print("States loaded:", rag.loaded_states)
print("Total laws:", rag.collection.count())

# Get all unique state codes in the collection
results = rag.collection.get(limit=200)
if results and results.get('metadatas'):
    states_in_db = set(meta.get('state') for meta in results['metadatas'] if meta.get('state'))
    print(f"\nUnique states in database: {sorted(states_in_db)}")
    print(f"Count: {len(states_in_db)} states")
