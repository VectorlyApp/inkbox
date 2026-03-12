"""
inkbox/phone/types.py

Dataclasses mirroring the Inkbox Phone API response models.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Any
from uuid import UUID


def _dt(value: str | None) -> datetime | None:
    return datetime.fromisoformat(value) if value else None


@dataclass
class PhoneNumber:
    """A phone number owned by your organisation."""

    id: UUID
    number: str
    type: str
    status: str
    incoming_call_action: str
    default_stream_url: str | None
    default_pipeline_mode: str
    created_at: datetime
    updated_at: datetime

    @classmethod
    def _from_dict(cls, d: dict[str, Any]) -> PhoneNumber:
        return cls(
            id=UUID(d["id"]),
            number=d["number"],
            type=d["type"],
            status=d["status"],
            incoming_call_action=d["incoming_call_action"],
            default_stream_url=d.get("default_stream_url"),
            default_pipeline_mode=d.get("default_pipeline_mode", "client_llm_only"),
            created_at=datetime.fromisoformat(d["created_at"]),
            updated_at=datetime.fromisoformat(d["updated_at"]),
        )


@dataclass
class PhoneCall:
    """A phone call record."""

    id: UUID
    local_phone_number: str
    remote_phone_number: str
    direction: str
    status: str
    pipeline_mode: str | None
    stream_url: str | None
    started_at: datetime | None
    ended_at: datetime | None
    created_at: datetime
    updated_at: datetime

    @classmethod
    def _from_dict(cls, d: dict[str, Any]) -> PhoneCall:
        return cls(
            id=UUID(d["id"]),
            local_phone_number=d["local_phone_number"],
            remote_phone_number=d["remote_phone_number"],
            direction=d["direction"],
            status=d["status"],
            pipeline_mode=d.get("pipeline_mode"),
            stream_url=d.get("stream_url"),
            started_at=_dt(d.get("started_at")),
            ended_at=_dt(d.get("ended_at")),
            created_at=datetime.fromisoformat(d["created_at"]),
            updated_at=datetime.fromisoformat(d["updated_at"]),
        )


@dataclass
class RateLimitInfo:
    """Rolling 24-hour rate limit snapshot for an organisation."""

    calls_used: int
    calls_remaining: int
    calls_limit: int
    minutes_used: float
    minutes_remaining: float
    minutes_limit: int

    @classmethod
    def _from_dict(cls, d: dict[str, Any]) -> RateLimitInfo:
        return cls(
            calls_used=d["calls_used"],
            calls_remaining=d["calls_remaining"],
            calls_limit=d["calls_limit"],
            minutes_used=d["minutes_used"],
            minutes_remaining=d["minutes_remaining"],
            minutes_limit=d["minutes_limit"],
        )


@dataclass
class PhoneCallWithRateLimit(PhoneCall):
    """PhoneCall extended with the caller's current rate limit snapshot.

    Returned by the place-call endpoint.
    """

    rate_limit: RateLimitInfo = None  # type: ignore[assignment]

    @classmethod
    def _from_dict(cls, d: dict[str, Any]) -> PhoneCallWithRateLimit:  # type: ignore[override]
        base = PhoneCall._from_dict(d)
        return cls(
            **base.__dict__,
            rate_limit=RateLimitInfo._from_dict(d["rate_limit"]) if d.get("rate_limit") else None,
        )


@dataclass
class PhoneTranscript:
    """A transcript segment from a phone call."""

    id: UUID
    call_id: UUID
    seq: int
    ts_ms: int
    party: str
    text: str
    created_at: datetime

    @classmethod
    def _from_dict(cls, d: dict[str, Any]) -> PhoneTranscript:
        return cls(
            id=UUID(d["id"]),
            call_id=UUID(d["call_id"]),
            seq=d["seq"],
            ts_ms=d["ts_ms"],
            party=d["party"],
            text=d["text"],
            created_at=datetime.fromisoformat(d["created_at"]),
        )


@dataclass
class PhoneWebhook:
    """A webhook subscription for a phone number."""

    id: UUID
    source_id: UUID
    source_type: str
    url: str
    event_types: list[str]
    status: str
    created_at: datetime

    @classmethod
    def _from_dict(cls, d: dict[str, Any]) -> PhoneWebhook:
        return cls(
            id=UUID(d["id"]),
            source_id=UUID(d["source_id"]),
            source_type=d["source_type"],
            url=d["url"],
            event_types=d["event_types"],
            status=d["status"],
            created_at=datetime.fromisoformat(d["created_at"]),
        )


@dataclass
class PhoneWebhookCreateResult(PhoneWebhook):
    """Returned only on webhook creation. Includes the one-time HMAC signing secret."""

    secret: str = ""

    @classmethod
    def _from_dict(cls, d: dict[str, Any]) -> PhoneWebhookCreateResult:  # type: ignore[override]
        base = PhoneWebhook._from_dict(d)
        return cls(**base.__dict__, secret=d["secret"])
