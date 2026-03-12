"""
inkbox/mail/client.py

Top-level InkboxMail client.
"""

from __future__ import annotations

from inkbox.mail._http import HttpTransport
from inkbox.mail.resources.mailboxes import MailboxesResource
from inkbox.mail.resources.messages import MessagesResource
from inkbox.mail.resources.threads import ThreadsResource
from inkbox.mail.resources.webhooks import WebhooksResource

_DEFAULT_BASE_URL = "https://api.inkbox.ai/api/v1/mail"


class InkboxMail:
    """Client for the Inkbox Mail API.

    Args:
        api_key: Your Inkbox API key (``X-Service-Token``).
        base_url: Override the API base URL (useful for self-hosting or testing).
        timeout: Request timeout in seconds (default 30).

    Example::

        from inkbox.mail import InkboxMail

        client = InkboxMail(api_key="ApiKey_...")

        mailbox = client.mailboxes.create(display_name="Agent 01")

        client.messages.send(
            mailbox.id,
            to=["user@example.com"],
            subject="Hello from Inkbox",
            body_text="Hi there!",
        )

        for msg in client.messages.list(mailbox.id):
            print(msg.subject, msg.from_address)

        client.close()

    The client can also be used as a context manager::

        with InkboxMail(api_key="ApiKey_...") as client:
            mailboxes = client.mailboxes.list()
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

    def close(self) -> None:
        """Close the underlying HTTP connection pool."""
        self._http.close()

    def __enter__(self) -> InkboxMail:
        return self

    def __exit__(self, *_: object) -> None:
        self.close()
