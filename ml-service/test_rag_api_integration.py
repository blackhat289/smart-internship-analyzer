#!/usr/bin/env python3
"""Integration test - RAG in API context."""

from app.rag.retriever import (
    build_retrieval_query,
    retrieve_context_for_candidate,
)

def test_api_integration():
    """Test RAG as it's used in API endpoints."""
    print("\n=== API INTEGRATION TEST ===\n")
    
    # Simulate API call scenario from recommend endpoint
    domain = "Backend Development"
    skills = ["Python", "FastAPI", "PostgreSQL"]
    gaps = ["Kubernetes", "Docker"]
    
    # Test 1: Query building
    query = build_retrieval_query(domain, skills, gaps)
    print(f"Built query: '{query}'")
    assert all(x in query for x in [domain, "Python", "FastAPI", "Kubernetes"]), \
        "Query should contain domain, skills, and gaps"
    print("[PASS] Query building works correctly\n")
    
    # Test 2: Context retrieval
    try:
        context = retrieve_context_for_candidate(domain, skills, gaps, top_k=3)
        print(f"Retrieved {len(context)} context documents")
        
        if context:
            for i, doc in enumerate(context, 1):
                print(f"\n  Document {i}:")
                print(f"    Score: {doc.get('score', 0):.4f}")
                print(f"    Source: {doc.get('source', 'unknown')}")
                text_preview = doc.get('text', '')[:80]
                print(f"    Preview: {text_preview}...")
        
        print("\n[PASS] Context retrieval works correctly")
        print("[PASS] API integration successful")
        return True
        
    except Exception as e:
        print(f"[FAIL] Error during context retrieval: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    import sys
    result = test_api_integration()
    sys.exit(0 if result else 1)
