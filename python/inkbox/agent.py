"""
inkbox/agent.py

Agent — a domain object representing one agent identity.
Returned by inkbox.identities.create() and inkbox.identities.get().

Convenience methods (send_email, place_call, etc.) are scoped to this
agent's assigned channels so callers never need to pass an email address
or phone number ID explicitly.
"""

from __future__ import annotations

from typing import TYPE_CHECKING, Iterator

from inkbox.identities.types import AgentIdentityDetail, IdentityMailbox, IdentityPhoneNumber
from inkbox.mail.exceptions import InkboxError
from inkbox.mail.types import Message
from inkbox.phone.types import PhoneCallWithRateLimit, PhoneTranscript

if TYPE_CHECKING:
    from inkbox.client import Inkbox


class Agent:
    """An agent identity with convenience methods for its assigned channels.

    Obtain an instance via::

        agent = inkbox.identities.create(agent_handle="support-bot")
        # or
        agent = inkbox.identities.get("support-bot")

    After assigning channels you can communicate directly::

        agent.assign_mailbox(display_name="Support Bot")
        agent.assign_phone_number(type="toll_free")

        agent.send_email(to=["user@example.com"], subject="Hi", body_text="Hello")
        agent.place_call(to_number="+15555550100", stream_url="wss://my-app.com/ws")

        for msg in agent.messages():
            print(msg.subject)
    """

    def __init__(self, identity: AgentIdentityDetail, inkbox: Inkbox) -> None:
        self._identity = identity
        self._inkbox = inkbox
        self._mailbox: IdentityMailbox | None = identity.mailbox
        self._phone_number: IdentityPhoneNumber | None = identity.phone_number

    # ------------------------------------------------------------------
    # Identity properties
    # ------------------------------------------------------------------

    @property
    def agent_handle(self) -> str:
        return self._identity.agent_handle

    @property
    def id(self):
        return self._identity.id

    @property
    def status(self) -> str:
        return self._identity.status

    @property
    def mailbox(self) -> IdentityMailbox | None:
        return self._mailbox

    @property
    def phone_number(self) -> IdentityPhoneNumber | None:
        return self._phone_number

    # ------------------------------------------------------------------
    # Channel assignment
    # Combines resource creation/provisioning + identity linking in one call.
    # ------------------------------------------------------------------

    def assign_mailbox(self, *, display_name: str | None = None) -> IdentityMailbox:
        """Create a new mailbox and assign it to this agent.

        Args:
            display_name: Optional human-readable sender name.

        Returns:
            The assigned mailbox.
        """
        mailbox = self._inkbox.mailboxes.create(display_name=display_name)
        detail = self._inkbox._ids_resource.assign_mailbox(
            self.agent_handle, mailbox_id=mailbox.id
        )
        self._mailbox = detail.mailbox
        self._identity = detail
        return self._mailbox  # type: ignore[return-value]

    def assign_phone_number(
        self, *, type: str = "toll_free", state: str | None = None
    ) -> IdentityPhoneNumber:
        """Provision a new phone number and assign it to this agent.

        Args:
            type: ``"toll_free"`` (default) or ``"local"``.
            state: US state abbreviation (e.g. ``"NY"``), valid for local numbers only.

        Returns:
            The assigned phone number.
        """
        number = self._inkbox.numbers.provision(type=type, state=state)
        detail = self._inkbox._ids_resource.assign_phone_number(
            self.agent_handle, phone_number_id=number.id
        )
        self._phone_number = detail.phone_number
        self._identity = detail
        return self._phone_number  # type: ignore[return-value]

    # ------------------------------------------------------------------
    # Mail helpers
    # ------------------------------------------------------------------

    def send_email(
        self,
        *,
        to: list[str],
        subject: str,
        body_text: str | None = None,
        body_html: str | None = None,
        cc: list[str] | None = None,
        bcc: list[str] | None = None,
        in_reply_to_message_id: str | None = None,
        attachments: list[dict] | None = None,
    ) -> Message:
        """Send an email from this agent's mailbox.

        Args:
            to: Primary recipient addresses (at least one required).
            subject: Email subject line.
            body_text: Plain-text body.
            body_html: HTML body.
            cc: Carbon-copy recipients.
            bcc: Blind carbon-copy recipients.
            in_reply_to_message_id: RFC 5322 Message-ID to thread a reply.
            attachments: List of file attachment dicts with ``filename``,
                ``content_type``, and ``content_base64`` keys.
        """
        self._require_mailbox()
        return self._inkbox.messages.send(
            self._mailbox.email_address,  # type: ignore[union-attr]
            to=to,
            subject=subject,
            body_text=body_text,
            body_html=body_html,
            cc=cc,
            bcc=bcc,
            in_reply_to_message_id=in_reply_to_message_id,
            attachments=attachments,
        )

    def messages(
        self,
        *,
        page_size: int = 50,
        direction: str | None = None,
    ) -> Iterator[Message]:
        """Iterate over messages in this agent's inbox, newest first.

        Pagination is handled automatically.

        Args:
            page_size: Messages fetched per API call (1–100).
            direction: Filter by ``"inbound"`` or ``"outbound"``.
        """
        self._require_mailbox()
        return self._inkbox.messages.list(
            self._mailbox.email_address,  # type: ignore[union-attr]
            page_size=page_size,
            direction=direction,
        )

    # ------------------------------------------------------------------
    # Phone helpers
    # ------------------------------------------------------------------

    def place_call(
        self,
        *,
        to_number: str,
        stream_url: str | None = None,
        pipeline_mode: str | None = None,
        webhook_url: str | None = None,
    ) -> PhoneCallWithRateLimit:
        """Place an outbound call from this agent's phone number.

        Args:
            to_number: E.164 destination number.
            stream_url: WebSocket URL (wss://) for audio bridging.
            pipeline_mode: Pipeline mode override for this call.
            webhook_url: Custom webhook URL for call lifecycle events.
        """
        self._require_phone()
        return self._inkbox.calls.place(
            from_number=self._phone_number.number,  # type: ignore[union-attr]
            to_number=to_number,
            stream_url=stream_url,
            pipeline_mode=pipeline_mode,
            webhook_url=webhook_url,
        )

    def search_transcripts(
        self,
        *,
        q: str,
        party: str | None = None,
        limit: int = 50,
    ) -> list[PhoneTranscript]:
        """Full-text search across call transcripts for this agent's number.

        Args:
            q: Search query string.
            party: Filter by speaker: ``"local"`` or ``"remote"``.
            limit: Maximum number of results (1–200).
        """
        self._require_phone()
        return self._inkbox.numbers.search_transcripts(
            self._phone_number.id,  # type: ignore[union-attr]
            q=q,
            party=party,
            limit=limit,
        )

    # ------------------------------------------------------------------
    # Misc
    # ------------------------------------------------------------------

    def refresh(self) -> Agent:
        """Re-fetch this agent's identity from the API and update cached channels.

        Returns:
            ``self`` for chaining.
        """
        detail = self._inkbox._ids_resource.get(self.agent_handle)
        self._identity = detail
        self._mailbox = detail.mailbox
        self._phone_number = detail.phone_number
        return self

    def delete(self) -> None:
        """Soft-delete this identity (unlinks channels without deleting them)."""
        self._inkbox._ids_resource.delete(self.agent_handle)

    # ------------------------------------------------------------------
    # Internal guards
    # ------------------------------------------------------------------

    def _require_mailbox(self) -> None:
        if not self._mailbox:
            raise InkboxError(
                f"Agent '{self.agent_handle}' has no mailbox assigned. "
                "Call agent.assign_mailbox() first."
            )

    def _require_phone(self) -> None:
        if not self._phone_number:
            raise InkboxError(
                f"Agent '{self.agent_handle}' has no phone number assigned. "
                "Call agent.assign_phone_number() first."
            )

    def __repr__(self) -> str:
        return (
            f"Agent(agent_handle={self.agent_handle!r}, "
            f"mailbox={self._mailbox.email_address if self._mailbox else None!r}, "
            f"phone={self._phone_number.number if self._phone_number else None!r})"
        )
