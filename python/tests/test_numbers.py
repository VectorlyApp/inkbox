"""Tests for PhoneNumbersResource."""

from uuid import UUID

from sample_data import PHONE_NUMBER_DICT, PHONE_TRANSCRIPT_DICT


class TestNumbersList:
    def test_returns_list_of_phone_numbers(self, client, transport):
        transport.get.return_value = [PHONE_NUMBER_DICT]

        numbers = client.numbers.list()

        transport.get.assert_called_once_with("/numbers")
        assert len(numbers) == 1
        assert numbers[0].number == "+18335794607"
        assert numbers[0].type == "toll_free"
        assert numbers[0].status == "active"
        assert numbers[0].default_pipeline_mode == "client_llm_only"

    def test_empty_list(self, client, transport):
        transport.get.return_value = []

        numbers = client.numbers.list()

        assert numbers == []


class TestNumbersGet:
    def test_returns_phone_number(self, client, transport):
        transport.get.return_value = PHONE_NUMBER_DICT
        uid = "aaaa1111-0000-0000-0000-000000000001"

        number = client.numbers.get(uid)

        transport.get.assert_called_once_with(f"/numbers/{uid}")
        assert number.id == UUID(uid)
        assert number.number == "+18335794607"
        assert number.incoming_call_action == "auto_reject"


class TestNumbersUpdate:
    def test_update_incoming_call_action(self, client, transport):
        updated = {**PHONE_NUMBER_DICT, "incoming_call_action": "webhook"}
        transport.patch.return_value = updated
        uid = "aaaa1111-0000-0000-0000-000000000001"

        result = client.numbers.update(uid, incoming_call_action="webhook")

        transport.patch.assert_called_once_with(
            f"/numbers/{uid}",
            json={"incoming_call_action": "webhook"},
        )
        assert result.incoming_call_action == "webhook"

    def test_update_multiple_fields(self, client, transport):
        updated = {
            **PHONE_NUMBER_DICT,
            "incoming_call_action": "auto_accept",
            "default_stream_url": "wss://agent.example.com/ws",
            "default_pipeline_mode": "client_llm_tts_stt",
        }
        transport.patch.return_value = updated
        uid = "aaaa1111-0000-0000-0000-000000000001"

        result = client.numbers.update(
            uid,
            incoming_call_action="auto_accept",
            default_stream_url="wss://agent.example.com/ws",
            default_pipeline_mode="client_llm_tts_stt",
        )

        transport.patch.assert_called_once_with(
            f"/numbers/{uid}",
            json={
                "incoming_call_action": "auto_accept",
                "default_stream_url": "wss://agent.example.com/ws",
                "default_pipeline_mode": "client_llm_tts_stt",
            },
        )
        assert result.default_stream_url == "wss://agent.example.com/ws"
        assert result.default_pipeline_mode == "client_llm_tts_stt"

    def test_omitted_fields_not_sent(self, client, transport):
        transport.patch.return_value = PHONE_NUMBER_DICT
        uid = "aaaa1111-0000-0000-0000-000000000001"

        client.numbers.update(uid, incoming_call_action="auto_reject")

        _, kwargs = transport.patch.call_args
        assert "default_stream_url" not in kwargs["json"]
        assert "default_pipeline_mode" not in kwargs["json"]


class TestNumbersProvision:
    def test_provision_toll_free(self, client, transport):
        transport.post.return_value = PHONE_NUMBER_DICT

        number = client.numbers.provision(type="toll_free")

        transport.post.assert_called_once_with(
            "/numbers/provision",
            json={"type": "toll_free"},
        )
        assert number.type == "toll_free"

    def test_provision_local_with_state(self, client, transport):
        local = {**PHONE_NUMBER_DICT, "type": "local", "number": "+12125551234"}
        transport.post.return_value = local

        number = client.numbers.provision(type="local", state="NY")

        transport.post.assert_called_once_with(
            "/numbers/provision",
            json={"type": "local", "state": "NY"},
        )
        assert number.type == "local"

    def test_provision_defaults_to_toll_free(self, client, transport):
        transport.post.return_value = PHONE_NUMBER_DICT

        client.numbers.provision()

        _, kwargs = transport.post.call_args
        assert kwargs["json"]["type"] == "toll_free"


class TestNumbersRelease:
    def test_release_posts_number(self, client, transport):
        transport.post.return_value = None

        client.numbers.release(number="+18335794607")

        transport.post.assert_called_once_with(
            "/numbers/release",
            json={"number": "+18335794607"},
        )


class TestNumbersSearchTranscripts:
    def test_search_with_query(self, client, transport):
        transport.get.return_value = [PHONE_TRANSCRIPT_DICT]
        uid = "aaaa1111-0000-0000-0000-000000000001"

        results = client.numbers.search_transcripts(uid, q="hello")

        transport.get.assert_called_once_with(
            f"/numbers/{uid}/search",
            params={"q": "hello", "party": None, "limit": 50},
        )
        assert len(results) == 1
        assert results[0].text == "Hello, how can I help you?"

    def test_search_with_party_and_limit(self, client, transport):
        transport.get.return_value = []
        uid = "aaaa1111-0000-0000-0000-000000000001"

        results = client.numbers.search_transcripts(
            uid, q="test", party="remote", limit=10
        )

        transport.get.assert_called_once_with(
            f"/numbers/{uid}/search",
            params={"q": "test", "party": "remote", "limit": 10},
        )
        assert results == []
