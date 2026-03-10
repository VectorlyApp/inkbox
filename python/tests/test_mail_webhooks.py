"""Tests for mail WebhooksResource."""

from unittest.mock import MagicMock
from uuid import UUID

from sample_data_mail import WEBHOOK_DICT, WEBHOOK_CREATE_DICT
from inkbox.mail.resources.webhooks import WebhooksResource


MBOX = "aaaa1111-0000-0000-0000-000000000001"
WH_ID = "dddd4444-0000-0000-0000-000000000001"


def _resource():
    http = MagicMock()
    return WebhooksResource(http), http


class TestWebhooksCreate:
    def test_creates_webhook_with_secret(self):
        res, http = _resource()
        http.post.return_value = WEBHOOK_CREATE_DICT

        hook = res.create(MBOX, url="https://example.com/hooks/mail", event_types=["message.received"])

        http.post.assert_called_once_with(
            f"/mailboxes/{MBOX}/webhooks",
            json={"url": "https://example.com/hooks/mail", "event_types": ["message.received"]},
        )
        assert hook.secret == "test-hmac-secret-mail-abc123"
        assert hook.url == "https://example.com/hooks/mail"


class TestWebhooksList:
    def test_returns_webhooks(self):
        res, http = _resource()
        http.get.return_value = [WEBHOOK_DICT]

        webhooks = res.list(MBOX)

        http.get.assert_called_once_with(f"/mailboxes/{MBOX}/webhooks")
        assert len(webhooks) == 1
        assert webhooks[0].id == UUID(WH_ID)

    def test_empty_list(self):
        res, http = _resource()
        http.get.return_value = []

        assert res.list(MBOX) == []


class TestWebhooksDelete:
    def test_deletes_webhook(self):
        res, http = _resource()

        res.delete(MBOX, WH_ID)

        http.delete.assert_called_once_with(f"/mailboxes/{MBOX}/webhooks/{WH_ID}")
