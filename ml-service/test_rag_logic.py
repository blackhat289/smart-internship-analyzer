#!/usr/bin/env python3
"""Test RAG system for functional and logical issues."""

import json
from pathlib import Path
from app.rag.knowledge_base_loader import load_knowledge_base
from app.rag.embeddings import EmbeddingService
from app.rag.vector_store import FaissStore
from app.rag.retriever import build_retrieval_query, get_rag_store

def test_knowledge_base():
    """Test knowledge base loading."""
    print("\n=== TESTING KNOWLEDGE BASE LOADING ===")
    docs = load_knowledge_base('knowledge_base')
    print(f"✓ Loaded {len(docs)} documents from knowledge base")
    
    if len(docs) == 0:
        print("⚠ WARNING: No documents loaded from knowledge base!")
        return False
    
    # Check first document structure
    doc = docs[0]
    required_fields = ['text', 'source']
    for field in required_fields:
        if field not in doc:
            print(f"✗ ERROR: Document missing required field '{field}'")
            return False
    
    print(f"✓ Document structure valid with {len(doc)} fields")
    print(f"  - Sample text length: {len(doc['text'])} chars")
    print(f"  - Sample source: {doc['source']}")
    return True

def test_embeddings():
    """Test embedding service."""
    print("\n=== TESTING EMBEDDINGS ===")
    try:
        service = EmbeddingService("all-MiniLM-L6-v2")
        
        # Test single embedding
        embedding = service.embed_query("Python developer")
        print(f"✓ Single query embedding: {len(embedding)} dimensions")
        
        # Test batch embedding
        embeddings = service.embed_texts(["Python", "JavaScript", "Go"])
        print(f"✓ Batch embeddings: {len(embeddings)} texts embedded")
        
        # Verify embedding dimensions match
        if embedding.shape != (embeddings[0].shape):
            print(f"⚠ WARNING: Embedding dimension mismatch!")
            return False
            
        return True
    except Exception as e:
        print(f"✗ ERROR: {e}")
        return False

def test_vector_store():
    """Test vector store."""
    print("\n=== TESTING VECTOR STORE ===")
    try:
        # Load knowledge base
        docs = load_knowledge_base('knowledge_base')
        if not docs:
            print("✗ ERROR: No documents to build vector store")
            return False
        
        # Create store
        service = EmbeddingService("all-MiniLM-L6-v2")
        store = FaissStore(service, "/tmp/test_faiss.index", "/tmp/test_meta.json")
        
        print(f"✓ Vector store created")
        print(f"✓ Building index with {len(docs)} documents...")
        store.build(docs)
        print(f"✓ Index built successfully")
        
        # Test search
        results = store.search("Python developer", top_k=3)
        print(f"✓ Search returned {len(results)} results")
        
        if len(results) > 0:
            top = results[0]
            print(f"  - Top result score: {top.score:.4f}")
            print(f"  - Top result text preview: {top.text[:80]}...")
        
        return True
    except Exception as e:
        print(f"✗ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_retrieval_query():
    """Test retrieval query building."""
    print("\n=== TESTING RETRIEVAL QUERY ===")
    try:
        query = build_retrieval_query("Backend", ["Python", "FastAPI"], ["Kubernetes"])
        print(f"✓ Query built: '{query}'")
        
        # Verify all components are present
        checks = [
            ("Backend" in query, "Domain present"),
            ("Python" in query, "Skill present"),
            ("FastAPI" in query, "Skill present"),
            ("Kubernetes" in query, "Gap present"),
        ]
        
        all_passed = True
        for check, desc in checks:
            status = "✓" if check else "✗"
            print(f"  {status} {desc}")
            if not check:
                all_passed = False
        
        return all_passed
    except Exception as e:
        print(f"✗ ERROR: {e}")
        return False

def test_rag_store():
    """Test integrated RAG store."""
    print("\n=== TESTING INTEGRATED RAG STORE ===")
    try:
        store = get_rag_store()
        print(f"✓ RAG store initialized")
        
        # Check if it has index
        if store.index is None:
            print("⚠ WARNING: Store index is None (expected on first run)")
        else:
            print(f"✓ Index loaded with {store.index.ntotal} vectors")
        
        # Check metadata
        if not store.metadata:
            print("⚠ WARNING: Store has no metadata")
            return False
        
        print(f"✓ Metadata loaded: {len(store.metadata)} documents")
        
        # Test search
        results = store.search("Machine Learning", top_k=3)
        print(f"✓ Search test returned {len(results)} results")
        
        return True
    except Exception as e:
        print(f"✗ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    print("=" * 60)
    print("RAG SYSTEM LOGICAL AND FUNCTIONAL TEST")
    print("=" * 60)
    
    tests = [
        ("Knowledge Base Loading", test_knowledge_base),
        ("Embeddings", test_embeddings),
        ("Vector Store", test_vector_store),
        ("Retrieval Query Building", test_retrieval_query),
        ("Integrated RAG Store", test_rag_store),
    ]
    
    results = {}
    for name, test_func in tests:
        try:
            results[name] = test_func()
        except Exception as e:
            print(f"\n✗ ERROR in {name}: {e}")
            import traceback
            traceback.print_exc()
            results[name] = False
    
    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    for name, passed in results.items():
        status = "✓ PASS" if passed else "✗ FAIL"
        print(f"{status}: {name}")
    
    all_passed = all(results.values())
    print("\n" + ("✓ ALL TESTS PASSED!" if all_passed else "✗ SOME TESTS FAILED"))
    print("=" * 60)
    
    return all_passed

if __name__ == "__main__":
    import sys
    sys.exit(0 if main() else 1)
