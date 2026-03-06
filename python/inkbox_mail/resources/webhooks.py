"""
inkbox_mail/resources/webhooks.py

Webhook CRUD.
"""

from __future__ import annotations

from typing import TYPE_CHECKING
from uuid import UUID

from inkbox_mail.types import Webhook

if TYPE_CHECKING:
    from inkbox_mail._http import HttpTransport


class WebhooksResource:
    def __init__(self, http: HttpTransport) -> None:
        self._http = http

    async def create(
        self,
        mailbox_id: UUID | str,
        *,
        url: str,
        event_types: list[str],
    ) -> Webhook:
        """Register a webhook subscription for a mailbox.

        Args:
            mailbox_id: UUID of the mailbox to subscribe to.
            url: HTTPS endpoint that will receive webhook POST requests.
            event_types: Events to subscribe to.
                Valid values: ``"message.received"``, ``"message.sent"``.

        Returns:
            The created webhook, including the signing secret.
        """
        data = await self._http.post(
            f"/mailboxes/{mailbox_id}/webhooks",
            json={"url": url, "event_types": event_types},
        )
        return Webhook._from_dict(data)

    async def list(self, mailbox_id: UUID | str) -> list[Webhook]:
        """List all active webhooks for a mailbox."""
        data = await self._http.get(f"/mailboxes/{mailbox_id}/webhooks")
        return [Webhook._from_dict(w) for w in data]

    async def delete(self, mailbox_id: UUID | str, webhook_id: UUID | str) -> None:
        """Delete a webhook subscription."""
        await self._http.delete(f"/mailboxes/{mailbox_id}/webhooks/{webhook_id}")
