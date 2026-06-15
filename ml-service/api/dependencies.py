"""Shared FastAPI dependencies for the API layer."""


def get_service_name() -> str:
    """Return a simple service identifier for dependency wiring."""

    return "ml-service"
