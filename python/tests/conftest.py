"""Shared fixtures for Inkbox Phone SDK tests."""

from __future__ import annotations

from unittest.mock import MagicMock

import pytest

from inkbox.phone import InkboxPhone


class FakeHttpTransport:
    """Mock HTTP transport that returns pre-configured responses."""

    def __init__(self) -> None:
        self.get = MagicMock()
        self.post = MagicMock()
        self.patch = MagicMock()
        self.delete = MagicMock()
        self.close = MagicMock()


@pytest.fixture
def transport() -> FakeHttpTransport:
    return FakeHttpTransport()


@pytest.fixture
def client(transport: FakeHttpTransport) -> InkboxPhone:
    c = InkboxPhone(api_key="sk-test")
    c._http = transport  # type: ignore[attr-defined]
    c._api_http = transport  # type: ignore[attr-defined]
    c.numbers._http = transport
    c.calls._http = transport
    c.transcripts._http = transport
    c.signing_keys._http = transport
    return c
