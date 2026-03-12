"""
inkbox/phone/resources/numbers.py

Phone number CRUD, provisioning, release, and transcript search.
"""

from __future__ import annotations

from typing import TYPE_CHECKING, Any
from uuid import UUID

from inkbox.phone.types import PhoneNumber, PhoneTranscript

if TYPE_CHECKING:
    from inkbox.phone._http import HttpTransport

_BASE = "/numbers"
_UNSET = object()


class PhoneNumbersResource:
    def __init__(self, http: HttpTransport) -> None:
        self._http = http

    def list(self) -> list[PhoneNumber]:
        """List all phone numbers for your organisation."""
        data = self._http.get(_BASE)
        return [PhoneNumber._from_dict(n) for n in data]

    def get(self, phone_number_id: UUID | str) -> PhoneNumber:
        """Get a phone number by ID."""
        data = self._http.get(f"{_BASE}/{phone_number_id}")
        return PhoneNumber._from_dict(data)

    def update(
        self,
        phone_number_id: UUID | str,
        *,
        incoming_call_action: str | None = _UNSET,  # type: ignore[assignment]
        default_stream_url: str | None = _UNSET,  # type: ignore[assignment]
        default_pipeline_mode: str | None = _UNSET,  # type: ignore[assignment]
    ) -> PhoneNumber:
        """Update phone number settings.

        Pass only the fields you want to change; omitted fields are left as-is.
        Pass a field as ``None`` to clear it.

        Args:
            phone_number_id: UUID of the phone number.
            incoming_call_action: ``"auto_accept"``, ``"auto_reject"``, or ``"webhook"``.
            default_stream_url: WebSocket URL (wss://) for audio bridging.
            default_pipeline_mode: Default pipeline mode for incoming calls.
        """
        body: dict[str, Any] = {}
        if incoming_call_action is not _UNSET:
            body["incoming_call_action"] = incoming_call_action
        if default_stream_url is not _UNSET:
            body["default_stream_url"] = default_stream_url
        if default_pipeline_mode is not _UNSET:
            body["default_pipeline_mode"] = default_pipeline_mode
        data = self._http.patch(f"{_BASE}/{phone_number_id}", json=body)
        return PhoneNumber._from_dict(data)

    def provision(
        self,
        *,
        type: str = "toll_free",
        state: str | None = None,
    ) -> PhoneNumber:
        """Provision a new phone number.

        Args:
            type: ``"toll_free"`` or ``"local"``. Defaults to ``"toll_free"``.
            state: US state abbreviation (e.g. ``"NY"``). Only valid for ``local`` numbers.

        Returns:
            The provisioned phone number.
        """
        body: dict[str, Any] = {"type": type}
        if state is not None:
            body["state"] = state
        data = self._http.post(f"{_BASE}/provision", json=body)
        return PhoneNumber._from_dict(data)

    def release(self, *, number: str) -> None:
        """Release a phone number.

        Args:
            number: E.164 phone number to release.
        """
        self._http.post(f"{_BASE}/release", json={"number": number})

    def search_transcripts(
        self,
        phone_number_id: UUID | str,
        *,
        q: str,
        party: str | None = None,
        limit: int = 50,
    ) -> list[PhoneTranscript]:
        """Full-text search across transcripts for a phone number.

        Args:
            phone_number_id: UUID of the phone number.
            q: Search query string.
            party: Filter by speaker: ``"local"`` or ``"remote"``.
            limit: Maximum number of results (1–200).
        """
        data = self._http.get(
            f"{_BASE}/{phone_number_id}/search",
            params={"q": q, "party": party, "limit": limit},
        )
        return [PhoneTranscript._from_dict(t) for t in data]
