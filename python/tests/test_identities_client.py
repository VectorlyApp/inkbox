"""Tests for InkboxIdentities client."""

from inkbox.identities.client import InkboxIdentities
from inkbox.identities.resources.identities import IdentitiesResource


class TestInkboxIdentitiesClient:
    def test_creates_resource_instances(self):
        client = InkboxIdentities(api_key="sk-test")

        assert isinstance(client.identities, IdentitiesResource)

    def test_context_manager(self):
        with InkboxIdentities(api_key="sk-test") as client:
            assert isinstance(client, InkboxIdentities)

    def test_custom_base_url(self):
        client = InkboxIdentities(api_key="sk-test", base_url="http://localhost:8000")
        assert client._http._client.base_url == "http://localhost:8000"
        client.close()
