"""
inkbox/phone/resources/webhooks.py

Webhook CRUD for phone numbers.
"""

from __future__ import annotations

from typing import TYPE_CHECKING, Any
from uuid import UUID

from inkbox.phone.types import PhoneWebhook, PhoneWebhookCreateResult

if TYPE_CHECKING:
    from inkbox.phone._http import HttpTransport

_UNSET = object()


class PhoneWebhooksResource:
    def __init__(self, http: HttpTransport) -> None:
        self._http = http

    def create(
        self,
        phone_number_id: UUID | str,
        *,
        url: str,
        event_types: list[str],
    ) -> PhoneWebhookCreateResult:
        """Create a webhook for a phone number.

        Args:
            phone_number_id: UUID of the phone number.
            url: HTTPS URL to receive webhook events.
            event_types: List of event types to subscribe to.

        Returns:
            The created webhook including the signing secret.
        """
        data = self._http.post(
            f"/numbers/{phone_number_id}/webhooks",
            json={"url": url, "event_types": event_types},
        )
        return PhoneWebhookCreateResult._from_dict(data)

    def list(self, phone_number_id: UUID | str) -> list[PhoneWebhook]:
        """List webhooks for a phone number."""
        data = self._http.get(f"/numbers/{phone_number_id}/webhooks")
        return [PhoneWebhook._from_dict(w) for w in data]

    def update(
        self,
        phone_number_id: UUID | str,
        webhook_id: UUID | str,
        *,
        url: str | None = _UNSET,  # type: ignore[assignment]
        event_types: list[str] | None = _UNSET,  # type: ignore[assignment]
    ) -> PhoneWebhook:
        """Update a webhook.

        Pass only the fields you want to change; omitted fields are left as-is.

        Args:
            phone_number_id: UUID of the phone number.
            webhook_id: UUID of the webhook.
            url: New HTTPS URL for the webhook.
            event_types: New list of event types.
        """
        body: dict[str, Any] = {}
        if url is not _UNSET:
            body["url"] = url
        if event_types is not _UNSET:
            body["event_types"] = event_types
        data = self._http.patch(
            f"/numbers/{phone_number_id}/webhooks/{webhook_id}",
            json=body,
        )
        return PhoneWebhook._from_dict(data)

    def delete(self, phone_number_id: UUID | str, webhook_id: UUID | str) -> None:
        """Delete a webhook.

        Args:
            phone_number_id: UUID of the phone number.
            webhook_id: UUID of the webhook to delete.
        """
        self._http.delete(f"/numbers/{phone_number_id}/webhooks/{webhook_id}")
