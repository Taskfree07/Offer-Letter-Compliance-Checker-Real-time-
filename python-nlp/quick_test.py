"""Quick RAG test"""
import logging
logging.basicConfig(level=logging.WARNING)

from compliance_v2.rag_service import get_rag_service

rag = get_rag_service()

tests = [
    ("CA", "non-compete clause for 2 years"),
    ("CO", "drug testing for marijuana"),
    ("MA", "non-compete agreement restrictions")
]

print("="*60)
print("RAG QUICK TEST")
print("="*60)

for state, query in tests:
    print(f"\nQuery: '{query}' [{state}]")
    results = rag.query_relevant_laws(state, query, top_k=3)
    print(f"Found: {len(results)} laws")
    for r in results:
        print(f"  - {r['metadata']['topic']}: {r['similarity']:.1%}")

print("\n" + "="*60)
print("TEST COMPLETE")
print("="*60)
