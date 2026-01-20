"""Debug similarity scores"""
import logging
logging.basicConfig(level=logging.INFO, format='%(message)s')

from compliance_v2.rag_service import get_rag_service

rag = get_rag_service()

# Test with very low threshold to see ALL similarities
query = "non-compete clause for 2 years"
state = "CA"

print(f"\nQuery: '{query}' for {state}")
print("="*60)

# Get all results with threshold=0 to see everything
results = rag.query_relevant_laws(state, query, top_k=10, min_similarity=0.0)

print(f"\nAll {len(results)} laws with their similarities:")
for idx, r in enumerate(results, 1):
    topic = r['metadata']['topic']
    sim = r['similarity']
    summary = r['metadata']['summary'][:80]
    print(f"\n{idx}. {topic} - Similarity: {sim:.3f} ({sim:.1%})")
    print(f"   Summary: {summary}...")
