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
        incoming_call_action: str | None = None,
        default_stream_url: str | None = None,
        default_pipeline_mode: str | None = None,
    ) -> PhoneNumber:
        """Update phone number settings.

        Pass only the fields you want to change; omitted fields are left as-is.

        Args:
            phone_number_id: UUID of the phone number.
            incoming_call_action: ``"auto_accept"``, ``"auto_reject"``, or ``"webhook"``.
            default_stream_url: WebSocket URL for audio bridging on ``auto_accept``.
            default_pipeline_mode: ``"client_llm_only"``, ``"client_llm_tts"``,
                or ``"client_llm_tts_stt"``.
        """
        body: dict[str, Any] = {}
        if incoming_call_action is not None:
            body["incoming_call_action"] = incoming_call_action
        if default_stream_url is not None:
            body["default_stream_url"] = default_stream_url
        if default_pipeline_mode is not None:
            body["default_pipeline_mode"] = default_pipeline_mode
        data = self._http.patch(f"{_BASE}/{phone_number_id}", json=body)
        return PhoneNumber._from_dict(data)

    def provision(
        self,
        *,
        type: str = "toll_free",
        state: str | None = None,
    ) -> PhoneNumber:
        """Provision a new phone number via Telnyx.

        Args:
            type: ``"toll_free"`` or ``"local"``.
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
        """Release (delete) a phone number.

        Args:
            number: E.164 formatted phone number to release (e.g. ``"+18555690147"``).
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
