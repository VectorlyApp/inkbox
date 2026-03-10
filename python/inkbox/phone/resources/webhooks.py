"""
inkbox/phone/resources/webhooks.py

Phone webhook CRUD.
"""

from __future__ import annotations

from typing import TYPE_CHECKING, Any
from uuid import UUID

from inkbox.phone.types import PhoneWebhook, PhoneWebhookCreateResult

if TYPE_CHECKING:
    from inkbox.phone._http import HttpTransport


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
        """Register a webhook subscription for a phone number.

        Args:
            phone_number_id: UUID of the phone number.
            url: HTTPS endpoint that will receive webhook POST requests.
            event_types: Events to subscribe to (e.g. ``["incoming_call"]``).

        Returns:
            The created webhook. ``secret`` is the HMAC-SHA256 signing key —
            save it immediately, as it will not be returned again.
        """
        data = self._http.post(
            f"/numbers/{phone_number_id}/webhooks",
            json={"url": url, "event_types": event_types},
        )
        return PhoneWebhookCreateResult._from_dict(data)

    def list(self, phone_number_id: UUID | str) -> list[PhoneWebhook]:
        """List all active webhooks for a phone number."""
        data = self._http.get(f"/numbers/{phone_number_id}/webhooks")
        return [PhoneWebhook._from_dict(w) for w in data]

    def update(
        self,
        phone_number_id: UUID | str,
        webhook_id: UUID | str,
        *,
        url: str | None = None,
        event_types: list[str] | None = None,
    ) -> PhoneWebhook:
        """Update a webhook subscription.

        Pass only the fields you want to change; omitted fields are left as-is.
        """
        body: dict[str, Any] = {}
        if url is not None:
            body["url"] = url
        if event_types is not None:
            body["event_types"] = event_types
        data = self._http.patch(
            f"/numbers/{phone_number_id}/webhooks/{webhook_id}",
            json=body,
        )
        return PhoneWebhook._from_dict(data)

    def delete(
        self,
        phone_number_id: UUID | str,
        webhook_id: UUID | str,
    ) -> None:
        """Delete a webhook subscription."""
        self._http.delete(f"/numbers/{phone_number_id}/webhooks/{webhook_id}")
