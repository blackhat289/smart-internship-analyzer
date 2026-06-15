from app.rag.retriever import build_retrieval_query


def test_retrieval_query_joins_components():
    query = build_retrieval_query("AI/ML", ["python", "pytorch"], ["tensorflow"])
    assert "AI/ML" in query
    assert "python" in query
    assert "tensorflow" in query

