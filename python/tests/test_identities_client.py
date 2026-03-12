"""Tests for Inkbox unified client — identities namespace."""

from inkbox import Inkbox
from inkbox.client import _IdentitiesNamespace
from inkbox.identities.resources.identities import IdentitiesResource


class TestInkboxIdentitiesResources:
    def test_creates_identities_namespace(self):
        client = Inkbox(api_key="sk-test")

        assert isinstance(client.identities, _IdentitiesNamespace)
        assert isinstance(client._ids_resource, IdentitiesResource)

        client.close()

    def test_ids_http_base_url(self):
        client = Inkbox(api_key="sk-test", base_url="http://localhost:8000")
        assert str(client._ids_http._client.base_url) == "http://localhost:8000/api/v1/identities/"
        client.close()
