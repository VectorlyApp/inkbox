"""
inkbox/client.py

Unified Inkbox client — single entry point for all Inkbox APIs.
"""

from __future__ import annotations

from typing import TYPE_CHECKING

from inkbox.mail._http import HttpTransport as MailHttpTransport
from inkbox.mail.resources.mailboxes import MailboxesResource
from inkbox.mail.resources.messages import MessagesResource
from inkbox.mail.resources.threads import ThreadsResource
from inkbox.mail.resources.webhooks import WebhooksResource as MailWebhooksResource
from inkbox.phone._http import HttpTransport as PhoneHttpTransport
from inkbox.phone.resources.calls import CallsResource
from inkbox.phone.resources.numbers import PhoneNumbersResource
from inkbox.phone.resources.transcripts import TranscriptsResource
from inkbox.phone.resources.webhooks import PhoneWebhooksResource
from inkbox.identities._http import HttpTransport as IdsHttpTransport
from inkbox.identities.resources.identities import IdentitiesResource
from inkbox.signing_keys import SigningKeysResource

if TYPE_CHECKING:
    from inkbox.agent import Agent

_DEFAULT_BASE_URL = "https://api.inkbox.ai"


class Inkbox:
    """Unified client for all Inkbox APIs.

    Args:
        api_key: Your Inkbox API key (``X-Service-Token``).
        base_url: Override the API base URL (useful for self-hosting or testing).
        timeout: Request timeout in seconds (default 30).

    Example::

        from inkbox import Inkbox

        with Inkbox(api_key="ApiKey_...") as inkbox:
            agent = inkbox.identities.create(agent_handle="support-bot")
            agent.assign_mailbox(display_name="Support Bot")
            agent.send_email(
                to=["customer@example.com"],
                subject="Hello!",
                body_text="Hi there",
            )
    """

    def __init__(
        self,
        api_key: str,
        *,
        base_url: str = _DEFAULT_BASE_URL,
        timeout: float = 30.0,
    ) -> None:
        _api_root = f"{base_url.rstrip('/')}/api/v1"

        self._mail_http = MailHttpTransport(
            api_key=api_key, base_url=f"{_api_root}/mail", timeout=timeout
        )
        self._phone_http = PhoneHttpTransport(
            api_key=api_key, base_url=f"{_api_root}/phone", timeout=timeout
        )
        self._ids_http = IdsHttpTransport(
            api_key=api_key, base_url=f"{_api_root}/identities", timeout=timeout
        )
        # Signing keys live at the API root
        self._api_http = MailHttpTransport(
            api_key=api_key, base_url=_api_root, timeout=timeout
        )

        # Mail resources
        self.mailboxes = MailboxesResource(self._mail_http)
        self.messages = MessagesResource(self._mail_http)
        self.threads = ThreadsResource(self._mail_http)
        self.mail_webhooks = MailWebhooksResource(self._mail_http)

        # Phone resources
        self.calls = CallsResource(self._phone_http)
        self.numbers = PhoneNumbersResource(self._phone_http)
        self.transcripts = TranscriptsResource(self._phone_http)
        self.phone_webhooks = PhoneWebhooksResource(self._phone_http)

        # Shared
        self.signing_keys = SigningKeysResource(self._api_http)

        # Identities — internal resource used by Agent, wrapped namespace for users
        self._ids_resource = IdentitiesResource(self._ids_http)
        self.identities = _IdentitiesNamespace(self._ids_resource, self)

    def close(self) -> None:
        """Close all underlying HTTP connection pools."""
        self._mail_http.close()
        self._phone_http.close()
        self._ids_http.close()
        self._api_http.close()

    def __enter__(self) -> Inkbox:
        return self

    def __exit__(self, *_: object) -> None:
        self.close()


class _IdentitiesNamespace:
    """Thin wrapper around IdentitiesResource that returns Agent objects."""

    def __init__(self, resource: IdentitiesResource, inkbox: Inkbox) -> None:
        self._r = resource
        self._inkbox = inkbox

    def create(self, *, agent_handle: str) -> Agent:
        """Create a new agent identity and return it as an Agent object.

        Args:
            agent_handle: Unique handle for this agent (e.g. ``"support-bot"``).
        """
        from inkbox.agent import Agent

        self._r.create(agent_handle=agent_handle)
        # POST /identities returns AgentIdentity (no channel fields);
        # fetch the detail to get a fully-populated AgentIdentityDetail.
        detail = self._r.get(agent_handle)
        return Agent(detail, self._inkbox)

    def get(self, agent_handle: str) -> Agent:
        """Get an agent identity by handle.

        Args:
            agent_handle: Handle of the identity to fetch.
        """
        from inkbox.agent import Agent

        return Agent(self._r.get(agent_handle), self._inkbox)

    def list(self):
        """List all agent identities for your organisation."""
        return self._r.list()

    def update(self, *args, **kwargs):
        """Update an identity's handle or status."""
        return self._r.update(*args, **kwargs)

    def delete(self, *args, **kwargs):
        """Delete an identity."""
        return self._r.delete(*args, **kwargs)

    def assign_mailbox(self, *args, **kwargs):
        """Assign an existing mailbox to an identity by ID."""
        return self._r.assign_mailbox(*args, **kwargs)

    def unlink_mailbox(self, *args, **kwargs):
        """Unlink a mailbox from an identity."""
        return self._r.unlink_mailbox(*args, **kwargs)

    def assign_phone_number(self, *args, **kwargs):
        """Assign an existing phone number to an identity by ID."""
        return self._r.assign_phone_number(*args, **kwargs)

    def unlink_phone_number(self, *args, **kwargs):
        """Unlink a phone number from an identity."""
        return self._r.unlink_phone_number(*args, **kwargs)
