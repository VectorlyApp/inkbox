"""
inkbox_mail/client.py

Top-level InkboxMail client.
"""

from __future__ import annotations

from inkbox_mail._http import HttpTransport
from inkbox_mail.resources.mailboxes import MailboxesResource
from inkbox_mail.resources.messages import MessagesResource
from inkbox_mail.resources.threads import ThreadsResource
from inkbox_mail.resources.webhooks import WebhooksResource

_DEFAULT_BASE_URL = "https://api.inkbox.ai/api/v1/mail"


class InkboxMail:
    """Async client for the Inkbox Mail API.

    Args:
        api_key: Your Inkbox API key (``X-Service-Token``).
        base_url: Override the API base URL (useful for self-hosting or testing).
        timeout: Request timeout in seconds (default 30).

    Example::

        import asyncio
        from inkbox_mail import InkboxMail

        async def main():
            client = InkboxMail(api_key="sk-...")

            mailbox = await client.mailboxes.create(address_local_part="agent-01")

            await client.messages.send(
                mailbox.id,
                to=["user@example.com"],
                subject="Hello from Inkbox",
                body_text="Hi there!",
            )

            async for msg in client.messages.list(mailbox.id):
                print(msg.subject, msg.from_address)

            await client.aclose()

        asyncio.run(main())

    The client can also be used as an async context manager::

        async with InkboxMail(api_key="sk-...") as client:
            mailboxes = await client.mailboxes.list()
    """

    def __init__(
        self,
        api_key: str,
        *,
        base_url: str = _DEFAULT_BASE_URL,
        timeout: float = 30.0,
    ) -> None:
        self._http = HttpTransport(api_key=api_key, base_url=base_url, timeout=timeout)
        self.mailboxes = MailboxesResource(self._http)
        self.messages = MessagesResource(self._http)
        self.threads = ThreadsResource(self._http)
        self.webhooks = WebhooksResource(self._http)

    async def aclose(self) -> None:
        """Close the underlying HTTP connection pool."""
        await self._http.aclose()

    async def __aenter__(self) -> InkboxMail:
        return self

    async def __aexit__(self, *_: object) -> None:
        await self.aclose()
