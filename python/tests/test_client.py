"""Tests for InkboxPhone client."""

from inkbox.phone import InkboxPhone
from inkbox.phone.resources.numbers import PhoneNumbersResource
from inkbox.phone.resources.calls import CallsResource
from inkbox.phone.resources.transcripts import TranscriptsResource
from inkbox.phone.resources.webhooks import PhoneWebhooksResource


class TestInkboxPhoneClient:
    def test_creates_resource_instances(self):
        client = InkboxPhone(api_key="sk-test")

        assert isinstance(client.numbers, PhoneNumbersResource)
        assert isinstance(client.calls, CallsResource)
        assert isinstance(client.transcripts, TranscriptsResource)
        assert isinstance(client.webhooks, PhoneWebhooksResource)

    def test_context_manager(self):
        with InkboxPhone(api_key="sk-test") as client:
            assert isinstance(client, InkboxPhone)

    def test_custom_base_url(self):
        client = InkboxPhone(api_key="sk-test", base_url="http://localhost:8000")
        assert client._http._client.base_url == "http://localhost:8000"
        client.close()
