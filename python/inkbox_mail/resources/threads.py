"""
inkbox_mail/resources/threads.py

Thread operations: list (auto-paginated), get with messages, delete.
"""

from __future__ import annotations

from typing import TYPE_CHECKING, AsyncIterator
from uuid import UUID

from inkbox_mail.types import Thread, ThreadDetail

if TYPE_CHECKING:
    from inkbox_mail._http import HttpTransport

_DEFAULT_PAGE_SIZE = 50


class ThreadsResource:
    def __init__(self, http: HttpTransport) -> None:
        self._http = http

    async def list(
        self,
        mailbox_id: UUID | str,
        *,
        page_size: int = _DEFAULT_PAGE_SIZE,
    ) -> AsyncIterator[Thread]:
        """Async iterator over all threads in a mailbox, most recent activity first.

        Pagination is handled automatically — just iterate.

        Args:
            mailbox_id: UUID of the mailbox.
            page_size: Number of threads fetched per API call (1–100).

        Example::

            async for thread in client.threads.list(mailbox_id):
                print(thread.subject, thread.message_count)
        """
        return self._paginate(mailbox_id, page_size=page_size)

    async def _paginate(
        self,
        mailbox_id: UUID | str,
        *,
        page_size: int,
    ) -> AsyncIterator[Thread]:
        cursor: str | None = None
        while True:
            page = await self._http.get(
                f"/mailboxes/{mailbox_id}/threads",
                params={"limit": page_size, "cursor": cursor},
            )
            for item in page["items"]:
                yield Thread._from_dict(item)
            if not page["has_more"]:
                break
            cursor = page["next_cursor"]

    async def get(self, mailbox_id: UUID | str, thread_id: UUID | str) -> ThreadDetail:
        """Get a thread with all its messages inlined.

        Args:
            mailbox_id: UUID of the owning mailbox.
            thread_id: UUID of the thread.

        Returns:
            Thread detail with all messages (oldest-first).
        """
        data = await self._http.get(f"/mailboxes/{mailbox_id}/threads/{thread_id}")
        return ThreadDetail._from_dict(data)

    async def delete(self, mailbox_id: UUID | str, thread_id: UUID | str) -> None:
        """Delete a thread."""
        await self._http.delete(f"/mailboxes/{mailbox_id}/threads/{thread_id}")
