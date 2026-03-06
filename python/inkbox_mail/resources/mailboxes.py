"""
inkbox_mail/resources/mailboxes.py

Mailbox CRUD and full-text search.
"""

from __future__ import annotations

from typing import TYPE_CHECKING, Any
from uuid import UUID

from inkbox_mail.types import Mailbox, Message

if TYPE_CHECKING:
    from inkbox_mail._http import HttpTransport

_BASE = "/mailboxes"


class MailboxesResource:
    def __init__(self, http: HttpTransport) -> None:
        self._http = http

    async def create(
        self,
        *,
        address_local_part: str,
        display_name: str | None = None,
    ) -> Mailbox:
        """Create a new mailbox.

        Args:
            address_local_part: Local part of the email address (before @).
                Allowed characters: letters, digits, ``.``, ``_``, ``+``, ``-``.
            display_name: Optional human-readable name shown as the sender.

        Returns:
            The created mailbox.
        """
        body: dict[str, Any] = {"address_local_part": address_local_part}
        if display_name is not None:
            body["display_name"] = display_name
        data = await self._http.post(_BASE, json=body)
        return Mailbox._from_dict(data)

    async def list(self) -> list[Mailbox]:
        """List all mailboxes for your organisation."""
        data = await self._http.get(_BASE)
        return [Mailbox._from_dict(m) for m in data]

    async def get(self, mailbox_id: UUID | str) -> Mailbox:
        """Get a mailbox by ID."""
        data = await self._http.get(f"{_BASE}/{mailbox_id}")
        return Mailbox._from_dict(data)

    async def delete(self, mailbox_id: UUID | str) -> None:
        """Delete a mailbox."""
        await self._http.delete(f"{_BASE}/{mailbox_id}")

    async def search(
        self,
        mailbox_id: UUID | str,
        *,
        q: str,
        limit: int = 50,
    ) -> list[Message]:
        """Full-text search across messages in a mailbox.

        Args:
            mailbox_id: UUID of the mailbox to search.
            q: Search query string.
            limit: Maximum number of results (1–100).

        Returns:
            Matching messages ranked by relevance.
        """
        data = await self._http.get(
            f"{_BASE}/{mailbox_id}/search",
            params={"q": q, "limit": limit},
        )
        return [Message._from_dict(m) for m in data["items"]]
