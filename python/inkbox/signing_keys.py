"""
inkbox/signing_keys.py

Org-level webhook signing key management — shared across all Inkbox clients.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Any


@dataclass
class SigningKey:
    """Org-level webhook signing key.

    Returned once on creation/rotation — store ``signing_key`` securely.
    """

    signing_key: str
    created_at: datetime

    @classmethod
    def _from_dict(cls, d: dict[str, Any]) -> SigningKey:
        return cls(
            signing_key=d["signing_key"],
            created_at=datetime.fromisoformat(d["created_at"]),
        )


class SigningKeysResource:
    def __init__(self, http: Any) -> None:
        self._http = http

    def create_or_rotate(self) -> SigningKey:
        """Create or rotate the webhook signing key for your organisation.

        The first call creates a new key; subsequent calls rotate (replace) the
        existing key. The plaintext ``signing_key`` is returned **once** —
        store it securely as it cannot be retrieved again.

        Use the returned key to verify ``X-Inkbox-Signature`` headers on
        incoming webhook requests.

        Returns:
            The newly created/rotated signing key with its creation timestamp.
        """
        data = self._http.post("/signing-keys", json={})
        return SigningKey._from_dict(data)
