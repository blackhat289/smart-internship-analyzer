from app.analyzers.domain_classifier import classify_domains


def test_classify_domains_prefers_frontend_for_react_stack():
    domains = classify_domains(["HTML", "CSS", "JavaScript", "React"])
    assert domains
    assert domains[0]["domain"] in {"Web Development", "Frontend Development"}

