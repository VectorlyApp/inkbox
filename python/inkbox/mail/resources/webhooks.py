"""
inkbox/mail/resources/webhooks.py

Webhook CRUD for mailboxes.
"""

from __future__ import annotations

from typing import TYPE_CHECKING

from inkbox.mail.types import Webhook, WebhookCreateResult

if TYPE_CHECKING:
    from inkbox.mail._http import HttpTransport


class WebhooksResource:
    def __init__(self, http: HttpTransport) -> None:
        self._http = http

    def create(
        self,
        mailbox_id: str,
        *,
        url: str,
        event_types: list[str],
    ) -> WebhookCreateResult:
        """Create a webhook subscription for a mailbox.

        Args:
            mailbox_id: UUID of the mailbox.
            url: HTTPS URL to receive webhook events.
            event_types: List of event types to subscribe to.

        Returns:
            The created webhook, including the signing secret.
        """
        data = self._http.post(
            f"/mailboxes/{mailbox_id}/webhooks",
            json={"url": url, "event_types": event_types},
        )
        return WebhookCreateResult._from_dict(data)

    def list(self, mailbox_id: str) -> list[Webhook]:
        """List all webhooks for a mailbox.

        Args:
            mailbox_id: UUID of the mailbox.
        """
        data = self._http.get(f"/mailboxes/{mailbox_id}/webhooks")
        return [Webhook._from_dict(w) for w in data]

    def delete(self, mailbox_id: str, webhook_id: str) -> None:
        """Delete a webhook subscription.

        Args:
            mailbox_id: UUID of the mailbox.
            webhook_id: UUID of the webhook to delete.
        """
        self._http.delete(f"/mailboxes/{mailbox_id}/webhooks/{webhook_id}")
