#!/usr/bin/env python3
"""Deep logical analysis of RAG system."""

import json
from pathlib import Path
from app.rag.embeddings import EmbeddingService
from app.rag.vector_store import FaissStore
import numpy as np

def test_similarity_calculation():
    """Test if similarity calculations are logically correct."""
    print("\n=== TESTING SIMILARITY CALCULATION ===")
    
    service = EmbeddingService("all-MiniLM-L6-v2")
    
    # Create embeddings for related terms
    texts = [
        "Python programming",
        "Python programming",  # Same - should have similarity = 1.0
        "JavaScript programming",  # Different language - lower similarity
        "cooking recipe",  # Unrelated - very low similarity
    ]
    
    embeddings = service.embed_texts(texts)
    
    def cosine_similarity(a, b):
        """Calculate cosine similarity."""
        return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))
    
    # Test 1: Identical embeddings should have similarity ≈ 1.0
    sim_identical = cosine_similarity(embeddings[0], embeddings[1])
    print(f"✓ Identical texts similarity: {sim_identical:.4f} (expected ~1.0)")
    assert sim_identical > 0.99, f"Identical embeddings should have similarity ~1.0, got {sim_identical}"
    
    # Test 2: Related embeddings should have higher similarity
    sim_related = cosine_similarity(embeddings[0], embeddings[2])
    sim_unrelated = cosine_similarity(embeddings[0], embeddings[3])
    print(f"✓ Related texts similarity: {sim_related:.4f}")
    print(f"✓ Unrelated texts similarity: {sim_unrelated:.4f}")
    assert sim_related > sim_unrelated, "Related texts should have higher similarity than unrelated"
    
    # Test 3: Verify normalized embeddings (sentence-transformers with normalize_embeddings=True)
    norms = [np.linalg.norm(e) for e in embeddings]
    print(f"✓ Embedding norms (should be ~1.0): {[f'{n:.4f}' for n in norms]}")
    assert all(0.99 < n < 1.01 for n in norms), "Embeddings should be normalized"
    
    return True

def test_index_search_correctness():
    """Test if FAISS index search returns correct results."""
    print("\n=== TESTING INDEX SEARCH CORRECTNESS ===")
    
    service = EmbeddingService("all-MiniLM-L6-v2")
    
    # Create test documents
    docs = [
        {"text": "Python backend development with FastAPI", "id": 1},
        {"text": "Frontend React development with JavaScript", "id": 2},
        {"text": "Machine learning with Python and TensorFlow", "id": 3},
        {"text": "DevOps and Kubernetes infrastructure", "id": 4},
        {"text": "Database design with PostgreSQL", "id": 5},
    ]
    
    # Create and build index
    store = FaissStore(service, "/tmp/test_correctness.index", "/tmp/test_correctness.json")
    store.build(docs)
    
    print(f"✓ Created index with {len(docs)} documents")
    
    # Test 1: Query related to Python backend should rank #1 first
    results = store.search("Python FastAPI backend", top_k=5)
    print(f"\nQuery: 'Python FastAPI backend'")
    for i, doc in enumerate(results, 1):
        print(f"  {i}. Score: {doc.score:.4f}, Text: {doc.text[:50]}...")
    
    # Verify ranking
    assert "FastAPI" in results[0].text, "Python FastAPI doc should rank first"
    print("✓ Ranking order is correct")
    
    # Test 2: Query with all top_k=5 should return 5 results
    all_results = store.search("something random", top_k=5)
    assert len(all_results) == 5, f"Expected 5 results, got {len(all_results)}"
    print(f"✓ top_k=5 returns {len(all_results)} results")
    
    # Test 3: Query with top_k > documents should return all
    all_results = store.search("something", top_k=100)
    assert len(all_results) == len(docs), f"top_k > documents should return all docs"
    print(f"✓ top_k=100 returns {len(all_results)} results (all documents)")
    
    # Test 4: Verify score ordering (descending)
    scores = [doc.score for doc in all_results]
    assert scores == sorted(scores, reverse=True), "Scores should be in descending order"
    print(f"✓ Scores are in descending order: {[f'{s:.4f}' for s in scores]}")
    
    return True

def test_metadata_consistency():
    """Test if metadata is consistent with documents."""
    print("\n=== TESTING METADATA CONSISTENCY ===")
    
    service = EmbeddingService("all-MiniLM-L6-v2")
    
    docs = [
        {
            "text": "Backend development",
            "title": "Backend Role",
            "domain": "Backend",
            "skills": ["Python", "FastAPI"]
        },
        {
            "text": "Frontend development",
            "title": "Frontend Role",
            "domain": "Frontend",
        },
    ]
    
    store = FaissStore(service, "/tmp/test_meta.index", "/tmp/test_meta.json")
    store.build(docs)
    
    # Verify metadata matches original docs
    assert len(store.metadata) == len(docs), "Metadata count should match docs"
    print(f"✓ Metadata count matches: {len(store.metadata)} docs")
    
    # Check first document metadata
    first_meta = store.metadata[0]
    assert first_meta["text"] == docs[0]["text"], "Text should be preserved"
    assert first_meta["title"] == docs[0]["title"], "Title should be preserved"
    assert first_meta["skills"] == docs[0]["skills"], "Skills should be preserved"
    print(f"✓ Metadata fields preserved correctly")
    
    # Verify search results include metadata
    results = store.search("development", top_k=1)
    assert len(results[0].metadata) > 0, "Results should include metadata"
    assert results[0].metadata.get("title"), "Metadata should have title"
    print(f"✓ Search results include metadata: {list(results[0].metadata.keys())}")
    
    return True

def test_edge_cases():
    """Test edge cases and error handling."""
    print("\n=== TESTING EDGE CASES ===")
    
    service = EmbeddingService("all-MiniLM-L6-v2")
    store = FaissStore(service, "/tmp/test_edge.index", "/tmp/test_edge.json")
    
    # Test 1: Empty query
    results = store.search("", top_k=3)
    print(f"✓ Empty query returns: {len(results)} results")
    
    # Test 2: Empty document list
    store.build([])
    results = store.search("something", top_k=3)
    assert results == [], "Empty store should return empty results"
    print(f"✓ Empty store returns empty results")
    
    # Test 3: Single document
    store.build([{"text": "Only document"}])
    results = store.search("document", top_k=5)
    assert len(results) == 1, "Should return only 1 doc when only 1 exists"
    print(f"✓ Single document search returns 1 result")
    
    # Test 4: Very long text
    long_text = " ".join(["word"] * 1000)
    store.build([{"text": long_text}])
    results = store.search("word", top_k=1)
    assert len(results) == 1, "Should handle long text"
    print(f"✓ Long text (1000 words) handled correctly")
    
    return True

def test_duplicate_documents():
    """Test behavior with duplicate documents."""
    print("\n=== TESTING DUPLICATE DOCUMENTS ===")
    
    service = EmbeddingService("all-MiniLM-L6-v2")
    
    docs = [
        {"text": "Python programming", "id": 1},
        {"text": "Python programming", "id": 2},  # Duplicate
        {"text": "JavaScript programming", "id": 3},
    ]
    
    store = FaissStore(service, "/tmp/test_dup.index", "/tmp/test_dup.json")
    store.build(docs)
    
    # Search should return both duplicates with same score
    results = store.search("Python", top_k=3)
    
    # Should have at least 2 results with similar text
    python_results = [r for r in results if "Python" in r.text]
    assert len(python_results) >= 2, "Should include duplicate documents"
    
    # Verify they have similar scores
    if len(python_results) >= 2:
        score_diff = abs(python_results[0].score - python_results[1].score)
        assert score_diff < 0.001, f"Duplicate docs should have similar scores, diff: {score_diff}"
        print(f"✓ Duplicates have similar scores: {python_results[0].score:.4f} vs {python_results[1].score:.4f}")
    
    print(f"✓ Duplicate documents handled correctly")
    return True

def check_implementation_consistency():
    """Check consistency between different RAG implementations."""
    print("\n=== CHECKING IMPLEMENTATION CONSISTENCY ===")
    
    # There are two RAG implementations:
    # 1. ml-service/rag/retrieval.py - older/simpler
    # 2. ml-service/app/rag/ - newer
    
    # Check which one is being used
    try:
        from rag.retrieval import retrieve
        print("✓ Old RAG implementation (rag/retrieval.py) is available")
    except Exception as e:
        print(f"⚠ Old RAG implementation not available: {e}")
    
    try:
        from app.rag.retriever import retrieve_context_for_candidate
        print("✓ New RAG implementation (app/rag/) is available")
    except Exception as e:
        print(f"⚠ New RAG implementation not available: {e}")
    
    print("✓ Multiple implementations exist - ensure only one is used in production")
    return True

def main():
    print("=" * 70)
    print("RAG SYSTEM DEEP LOGICAL ANALYSIS")
    print("=" * 70)
    
    tests = [
        ("Similarity Calculation", test_similarity_calculation),
        ("Index Search Correctness", test_index_search_correctness),
        ("Metadata Consistency", test_metadata_consistency),
        ("Edge Cases Handling", test_edge_cases),
        ("Duplicate Documents", test_duplicate_documents),
        ("Implementation Consistency", check_implementation_consistency),
    ]
    
    results = {}
    for name, test_func in tests:
        try:
            results[name] = test_func()
        except AssertionError as e:
            print(f"\n✗ ASSERTION FAILED in {name}: {e}")
            results[name] = False
        except Exception as e:
            print(f"\n✗ ERROR in {name}: {e}")
            import traceback
            traceback.print_exc()
            results[name] = False
    
    # Summary
    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    for name, passed in results.items():
        status = "✓ PASS" if passed else "✗ FAIL"
        print(f"{status}: {name}")
    
    all_passed = all(results.values())
    print("\n" + ("✓ ALL TESTS PASSED!" if all_passed else "✗ SOME TESTS FAILED"))
    print("=" * 70)
    
    return all_passed

if __name__ == "__main__":
    import sys
    sys.exit(0 if main() else 1)
