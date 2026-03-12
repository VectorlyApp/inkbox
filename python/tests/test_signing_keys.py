"""Tests for SigningKeysResource."""

from datetime import datetime, timezone
from unittest.mock import MagicMock

from inkbox.signing_keys import SigningKey, SigningKeysResource


SIGNING_KEY_DICT = {
    "signing_key": "sk-test-hmac-secret-abc123",
    "created_at": "2026-03-09T00:00:00Z",
}


def _resource():
    http = MagicMock()
    return SigningKeysResource(http), http


class TestSigningKeysCreateOrRotate:
    def test_calls_correct_endpoint(self):
        res, http = _resource()
        http.post.return_value = SIGNING_KEY_DICT

        res.create_or_rotate()

        http.post.assert_called_once_with("/signing-keys", json={})

    def test_returns_signing_key(self):
        res, http = _resource()
        http.post.return_value = SIGNING_KEY_DICT

        key = res.create_or_rotate()

        assert isinstance(key, SigningKey)
        assert key.signing_key == "sk-test-hmac-secret-abc123"
        assert key.created_at == datetime(2026, 3, 9, 0, 0, 0, tzinfo=timezone.utc)
