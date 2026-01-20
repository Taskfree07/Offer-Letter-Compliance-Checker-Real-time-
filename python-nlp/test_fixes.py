"""
Quick test of RAG threshold fix and LLM loading
"""

import logging
logging.basicConfig(level=logging.INFO)

print("="*60)
print("TESTING SYSTEM FIXES")
print("="*60)

# Test 1: RAG with new threshold
print("\n[TEST 1] RAG Service with lowered threshold (0.15)")
print("-"*60)

from compliance_v2.rag_service import get_rag_service

rag = get_rag_service()

test_queries = [
    ("CA", "non-compete agreement for 2 years"),
    ("CA", "asking about salary history"),
    ("CO", "marijuana drug testing policy"),
    ("MA", "non-compete restrictions")
]

for state, query in test_queries:
    print(f"\n  Query: '{query}' for {state}")
    results = rag.query_relevant_laws(state, query, top_k=5)
    print(f"  Results: {len(results)} laws found")
    if results:
        for idx, law in enumerate(results[:2], 1):  # Show top 2
            topic = law['metadata']['topic']
            similarity = law['similarity']
            print(f"    {idx}. {topic} (similarity: {similarity:.2%})")

# Test 2: LLM with smaller models
print("\n\n[TEST 2] LLM Service with memory optimization")
print("-"*60)

from compliance_v2.llm_service import get_llm_service

llm = get_llm_service()
print("\nAttempting to load LLM (will try Phi-3, Phi-2, TinyLlama)...")
llm.load_model()

if llm.model != "mock":
    print(f"\n[SUCCESS] Model loaded: {llm.model_name}")

    # Test generation
    test_prompt = "Analyze: Non-compete clause for 2 years in California."
    print(f"\nTest generation with prompt: '{test_prompt}'")
    response = llm.generate(test_prompt, max_new_tokens=100)
    print(f"\nResponse preview: {response[:200]}...")
else:
    print("\n[INFO] Using mock mode (no model loaded)")
    print("This is OK for development, but real LLM needed for production")

print("\n" + "="*60)
print("FIXES TEST COMPLETE")
print("="*60)
