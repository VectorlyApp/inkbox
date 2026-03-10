"""Tests for PhoneWebhooksResource."""

from uuid import UUID

from sample_data import PHONE_WEBHOOK_DICT, PHONE_WEBHOOK_CREATE_DICT


NUM_ID = "aaaa1111-0000-0000-0000-000000000001"
WH_ID = "dddd4444-0000-0000-0000-000000000001"


class TestWebhooksCreate:
    def test_creates_webhook_with_secret(self, client, transport):
        transport.post.return_value = PHONE_WEBHOOK_CREATE_DICT

        hook = client.webhooks.create(
            NUM_ID,
            url="https://example.com/webhooks/phone",
            event_types=["incoming_call"],
        )

        transport.post.assert_called_once_with(
            f"/numbers/{NUM_ID}/webhooks",
            json={
                "url": "https://example.com/webhooks/phone",
                "event_types": ["incoming_call"],
            },
        )
        assert hook.secret == "test-hmac-secret-abc123"
        assert hook.url == "https://example.com/webhooks/phone"
        assert hook.source_type == "phone_number"
        assert hook.event_types == ["incoming_call"]


class TestWebhooksList:
    def test_returns_webhooks(self, client, transport):
        transport.get.return_value = [PHONE_WEBHOOK_DICT]

        webhooks = client.webhooks.list(NUM_ID)

        transport.get.assert_called_once_with(f"/numbers/{NUM_ID}/webhooks")
        assert len(webhooks) == 1
        assert webhooks[0].id == UUID(WH_ID)
        assert webhooks[0].status == "active"

    def test_empty_list(self, client, transport):
        transport.get.return_value = []

        webhooks = client.webhooks.list(NUM_ID)

        assert webhooks == []


class TestWebhooksUpdate:
    def test_update_url(self, client, transport):
        updated = {**PHONE_WEBHOOK_DICT, "url": "https://new.example.com/hook"}
        transport.patch.return_value = updated

        result = client.webhooks.update(
            NUM_ID, WH_ID, url="https://new.example.com/hook"
        )

        transport.patch.assert_called_once_with(
            f"/numbers/{NUM_ID}/webhooks/{WH_ID}",
            json={"url": "https://new.example.com/hook"},
        )
        assert result.url == "https://new.example.com/hook"

    def test_update_event_types(self, client, transport):
        updated = {**PHONE_WEBHOOK_DICT, "event_types": ["incoming_call", "message.received"]}
        transport.patch.return_value = updated

        result = client.webhooks.update(
            NUM_ID, WH_ID, event_types=["incoming_call", "message.received"]
        )

        _, kwargs = transport.patch.call_args
        assert kwargs["json"] == {"event_types": ["incoming_call", "message.received"]}
        assert result.event_types == ["incoming_call", "message.received"]

    def test_omitted_fields_not_sent(self, client, transport):
        transport.patch.return_value = PHONE_WEBHOOK_DICT

        client.webhooks.update(NUM_ID, WH_ID, url="https://example.com/hook")

        _, kwargs = transport.patch.call_args
        assert "event_types" not in kwargs["json"]


class TestWebhooksDelete:
    def test_deletes_webhook(self, client, transport):
        client.webhooks.delete(NUM_ID, WH_ID)

        transport.delete.assert_called_once_with(
            f"/numbers/{NUM_ID}/webhooks/{WH_ID}"
        )
