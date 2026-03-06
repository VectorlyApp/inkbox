"""
inkbox_mail/resources/messages.py

Message operations: list (auto-paginated), get, send, flag updates, delete.
"""

from __future__ import annotations

from typing import TYPE_CHECKING, Any, AsyncIterator
from uuid import UUID

from inkbox_mail.types import Message, MessageDetail

if TYPE_CHECKING:
    from inkbox_mail._http import HttpTransport

_DEFAULT_PAGE_SIZE = 50


class MessagesResource:
    def __init__(self, http: HttpTransport) -> None:
        self._http = http

    async def list(
        self,
        mailbox_id: UUID | str,
        *,
        page_size: int = _DEFAULT_PAGE_SIZE,
    ) -> AsyncIterator[Message]:
        """Async iterator over all messages in a mailbox, newest first.

        Pagination is handled automatically — just iterate.

        Args:
            mailbox_id: UUID of the mailbox.
            page_size: Number of messages fetched per API call (1–100).

        Example::

            async for msg in client.messages.list(mailbox_id):
                print(msg.subject, msg.from_address)
        """
        return self._paginate(mailbox_id, page_size=page_size)

    async def _paginate(
        self,
        mailbox_id: UUID | str,
        *,
        page_size: int,
    ) -> AsyncIterator[Message]:
        cursor: str | None = None
        while True:
            page = await self._http.get(
                f"/mailboxes/{mailbox_id}/messages",
                params={"limit": page_size, "cursor": cursor},
            )
            for item in page["items"]:
                yield Message._from_dict(item)
            if not page["has_more"]:
                break
            cursor = page["next_cursor"]

    async def get(self, mailbox_id: UUID | str, message_id: UUID | str) -> MessageDetail:
        """Get a message with full body content.

        Args:
            mailbox_id: UUID of the owning mailbox.
            message_id: UUID of the message.

        Returns:
            Full message including ``body_text`` and ``body_html``.
        """
        data = await self._http.get(f"/mailboxes/{mailbox_id}/messages/{message_id}")
        return MessageDetail._from_dict(data)

    async def send(
        self,
        mailbox_id: UUID | str,
        *,
        to: list[str],
        subject: str,
        body_text: str | None = None,
        body_html: str | None = None,
        cc: list[str] | None = None,
        bcc: list[str] | None = None,
        in_reply_to_message_id: str | None = None,
    ) -> Message:
        """Send an email from a mailbox.

        Args:
            mailbox_id: UUID of the sending mailbox.
            to: Primary recipient addresses (at least one required).
            subject: Email subject line.
            body_text: Plain-text body.
            body_html: HTML body.
            cc: Carbon-copy recipients.
            bcc: Blind carbon-copy recipients.
            in_reply_to_message_id: RFC 5322 Message-ID of the message being
                replied to. Threads the reply automatically.

        Returns:
            The sent message metadata.
        """
        recipients: dict[str, Any] = {"to": to}
        if cc:
            recipients["cc"] = cc
        if bcc:
            recipients["bcc"] = bcc

        body: dict[str, Any] = {"recipients": recipients, "subject": subject}
        if body_text is not None:
            body["body_text"] = body_text
        if body_html is not None:
            body["body_html"] = body_html
        if in_reply_to_message_id is not None:
            body["in_reply_to_message_id"] = in_reply_to_message_id

        data = await self._http.post(f"/mailboxes/{mailbox_id}/messages", json=body)
        return Message._from_dict(data)

    async def update_flags(
        self,
        mailbox_id: UUID | str,
        message_id: UUID | str,
        *,
        is_read: bool | None = None,
        is_starred: bool | None = None,
    ) -> Message:
        """Update read/starred flags on a message.

        Pass only the flags you want to change; omitted flags are left as-is.
        """
        body: dict[str, Any] = {}
        if is_read is not None:
            body["is_read"] = is_read
        if is_starred is not None:
            body["is_starred"] = is_starred
        data = await self._http.patch(
            f"/mailboxes/{mailbox_id}/messages/{message_id}", json=body
        )
        return Message._from_dict(data)

    async def mark_read(self, mailbox_id: UUID | str, message_id: UUID | str) -> Message:
        """Mark a message as read."""
        return await self.update_flags(mailbox_id, message_id, is_read=True)

    async def mark_unread(self, mailbox_id: UUID | str, message_id: UUID | str) -> Message:
        """Mark a message as unread."""
        return await self.update_flags(mailbox_id, message_id, is_read=False)

    async def star(self, mailbox_id: UUID | str, message_id: UUID | str) -> Message:
        """Star a message."""
        return await self.update_flags(mailbox_id, message_id, is_starred=True)

    async def unstar(self, mailbox_id: UUID | str, message_id: UUID | str) -> Message:
        """Unstar a message."""
        return await self.update_flags(mailbox_id, message_id, is_starred=False)

    async def delete(self, mailbox_id: UUID | str, message_id: UUID | str) -> None:
        """Delete a message."""
        await self._http.delete(f"/mailboxes/{mailbox_id}/messages/{message_id}")
