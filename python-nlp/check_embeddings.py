"""Check what text is actually embedded"""
from compliance_v2.rag_service import get_rag_service

rag = get_rag_service()

# Get the actual documents from the collection
results = rag.collection.get(
    where={"state": "CA"},
    limit=10
)

print("="*60)
print("EMBEDDED DOCUMENTS FOR CA")
print("="*60)

if results and results.get('documents'):
    for idx, doc in enumerate(results['documents'][:3], 1):  # Show first 3
        meta = results['metadatas'][idx-1]
        print(f"\n{idx}. Topic: {meta['topic']}")
        print(f"   ID: {results['ids'][idx-1]}")
        print(f"   Embedded Text:")
        print("-"*60)
        print(doc[:400])  # Show first 400 chars
        print("-"*60)
