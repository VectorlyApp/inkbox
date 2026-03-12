"""Tests for InkboxMail client."""

from inkbox.mail import InkboxMail
from inkbox.mail.resources.mailboxes import MailboxesResource
from inkbox.mail.resources.messages import MessagesResource
from inkbox.mail.resources.threads import ThreadsResource
from inkbox.signing_keys import SigningKeysResource


class TestInkboxMailClient:
    def test_creates_resource_instances(self):
        client = InkboxMail(api_key="sk-test")

        assert isinstance(client.mailboxes, MailboxesResource)
        assert isinstance(client.messages, MessagesResource)
        assert isinstance(client.threads, ThreadsResource)
        assert isinstance(client.signing_keys, SigningKeysResource)
        client.close()

    def test_context_manager(self):
        with InkboxMail(api_key="sk-test") as client:
            assert isinstance(client, InkboxMail)

    def test_custom_base_url(self):
        client = InkboxMail(api_key="sk-test", base_url="http://localhost:8000")
        assert client._http._client.base_url == "http://localhost:8000"
        client.close()
