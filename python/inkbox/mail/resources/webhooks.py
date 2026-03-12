"""
inkbox/mail/resources/webhooks.py

Webhook CRUD.
"""

from __future__ import annotations

from typing import TYPE_CHECKING
from uuid import UUID

from inkbox.mail.types import Webhook, WebhookCreateResult

if TYPE_CHECKING:
    from inkbox.mail._http import HttpTransport


class WebhooksResource:
    def __init__(self, http: HttpTransport) -> None:
        self._http = http

    def create(
        self,
        email_address: str,
        *,
        url: str,
        event_types: list[str],
    ) -> WebhookCreateResult:
        """Register a webhook subscription for a mailbox.

        Args:
            email_address: Full email address of the mailbox to subscribe to.
            url: HTTPS endpoint that will receive webhook POST requests.
            event_types: Events to subscribe to.
                Valid values: ``"message.received"``, ``"message.sent"``.

        Returns:
            The created webhook. ``secret`` is the HMAC-SHA256 signing key —
            save it immediately, as it will not be returned again.
        """
        data = self._http.post(
            f"/mailboxes/{email_address}/webhooks",
            json={"url": url, "event_types": event_types},
        )
        return WebhookCreateResult._from_dict(data)

    def list(self, email_address: str) -> list[Webhook]:
        """List all active webhooks for a mailbox."""
        data = self._http.get(f"/mailboxes/{email_address}/webhooks")
        return [Webhook._from_dict(w) for w in data]

    def delete(self, email_address: str, webhook_id: UUID | str) -> None:
        """Delete a webhook subscription."""
        self._http.delete(f"/mailboxes/{email_address}/webhooks/{webhook_id}")
