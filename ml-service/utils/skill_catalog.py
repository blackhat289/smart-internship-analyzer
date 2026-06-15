"""Starter skill catalog used by the extraction layer.

The catalog is intentionally simple and dependency-free so that the
skill extractor can use deterministic matching without any model call.
"""

SKILL_CATALOG = {
    "programming": [
        "Python",
        "Java",
        "JavaScript",
        "TypeScript",
        "C",
        "C++",
        "Go",
        "Rust",
    ],
    "frontend": [
        "HTML",
        "CSS",
        "React",
        "Next.js",
        "Vue",
        "Angular",
        "Tailwind CSS",
    ],
    "backend": [
        "FastAPI",
        "Flask",
        "Django",
        "Node.js",
        "Express.js",
        "REST API",
        "GraphQL",
    ],
    "database": [
        "SQL",
        "PostgreSQL",
        "MySQL",
        "MongoDB",
        "Redis",
    ],
    "cloud": [
        "AWS",
        "Azure",
        "Google Cloud",
        "Docker",
        "Kubernetes",
        "CI/CD",
    ],
    "machine_learning": [
        "Machine Learning",
        "Deep Learning",
        "TensorFlow",
        "PyTorch",
        "scikit-learn",
        "NLP",
        "Computer Vision",
    ],
    "tools": [
        "Git",
        "GitHub",
        "Linux",
        "Postman",
        "Jupyter",
        "VS Code",
    ],
}
