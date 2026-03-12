"""
inkbox/phone/client.py

Top-level InkboxPhone client.
"""

from __future__ import annotations

from inkbox.phone._http import HttpTransport
from inkbox.phone.resources.numbers import PhoneNumbersResource
from inkbox.phone.resources.calls import CallsResource
from inkbox.phone.resources.transcripts import TranscriptsResource
from inkbox.phone.resources.webhooks import PhoneWebhooksResource

_DEFAULT_BASE_URL = "https://api.inkbox.ai/api/v1/phone"


class InkboxPhone:
    """Client for the Inkbox Phone API.

    Args:
        api_key: Your Inkbox API key (``X-Service-Token``).
        base_url: Override the API base URL (useful for self-hosting or testing).
        timeout: Request timeout in seconds (default 30).

    Example::

        from inkbox.phone import InkboxPhone

        with InkboxPhone(api_key="ApiKey_...") as client:
            number = client.numbers.provision(type="toll_free")
            call = client.calls.place(
                from_number=number.number,
                to_number="+15167251294",
                stream_url="wss://your-agent.example.com/ws",
            )
            print(call.status)
    """

    def __init__(
        self,
        api_key: str,
        *,
        base_url: str = _DEFAULT_BASE_URL,
        timeout: float = 30.0,
    ) -> None:
        self._http = HttpTransport(api_key=api_key, base_url=base_url, timeout=timeout)
        self.numbers = PhoneNumbersResource(self._http)
        self.calls = CallsResource(self._http)
        self.transcripts = TranscriptsResource(self._http)
        self.webhooks = PhoneWebhooksResource(self._http)

    def close(self) -> None:
        """Close the underlying HTTP connection pool."""
        self._http.close()

    def __enter__(self) -> InkboxPhone:
        return self

    def __exit__(self, *_: object) -> None:
        self.close()
