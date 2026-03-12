"""
inkbox/identities/client.py

Top-level InkboxIdentities client.
"""

from __future__ import annotations

from inkbox.identities._http import HttpTransport
from inkbox.identities.resources.identities import IdentitiesResource

_DEFAULT_BASE_URL = "https://api.inkbox.ai/api/v1/identities"


class InkboxIdentities:
    """Client for the Inkbox Identities API.

    Args:
        api_key: Your Inkbox API key (``X-Service-Token``).
        base_url: Override the API base URL (useful for self-hosting or testing).
        timeout: Request timeout in seconds (default 30).

    Example::

        from inkbox.identities import InkboxIdentities

        with InkboxIdentities(api_key="sk-...") as client:
            identity = client.identities.create(agent_handle="sales-agent")
            detail = client.identities.assign_mailbox(
                "sales-agent",
                mailbox_id="<mailbox-uuid>",
            )
            print(detail.mailbox.email_address)
    """

    def __init__(
        self,
        api_key: str,
        *,
        base_url: str = _DEFAULT_BASE_URL,
        timeout: float = 30.0,
    ) -> None:
        self._http = HttpTransport(api_key=api_key, base_url=base_url, timeout=timeout)
        self.identities = IdentitiesResource(self._http)

    def close(self) -> None:
        """Close the underlying HTTP connection pool."""
        self._http.close()

    def __enter__(self) -> InkboxIdentities:
        return self

    def __exit__(self, *_: object) -> None:
        self.close()
