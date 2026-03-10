"""Sample API response dicts for tests."""

PHONE_NUMBER_DICT = {
    "id": "aaaa1111-0000-0000-0000-000000000001",
    "number": "+18335794607",
    "type": "toll_free",
    "status": "active",
    "incoming_call_action": "auto_reject",
    "default_stream_url": None,
    "default_pipeline_mode": "client_llm_only",
    "created_at": "2026-03-09T00:00:00Z",
    "updated_at": "2026-03-09T00:00:00Z",
}

PHONE_CALL_DICT = {
    "id": "bbbb2222-0000-0000-0000-000000000001",
    "local_phone_number": "+18335794607",
    "remote_phone_number": "+15167251294",
    "direction": "outbound",
    "status": "completed",
    "pipeline_mode": "client_llm_only",
    "stream_url": "wss://agent.example.com/ws",
    "started_at": "2026-03-09T00:01:00Z",
    "ended_at": "2026-03-09T00:05:00Z",
    "created_at": "2026-03-09T00:00:00Z",
    "updated_at": "2026-03-09T00:05:00Z",
}

PHONE_TRANSCRIPT_DICT = {
    "id": "cccc3333-0000-0000-0000-000000000001",
    "call_id": "bbbb2222-0000-0000-0000-000000000001",
    "seq": 0,
    "ts_ms": 1500,
    "party": "local",
    "text": "Hello, how can I help you?",
    "created_at": "2026-03-09T00:01:01Z",
}

PHONE_WEBHOOK_DICT = {
    "id": "dddd4444-0000-0000-0000-000000000001",
    "source_id": "aaaa1111-0000-0000-0000-000000000001",
    "source_type": "phone_number",
    "url": "https://example.com/webhooks/phone",
    "event_types": ["incoming_call"],
    "status": "active",
    "created_at": "2026-03-09T00:00:00Z",
}

PHONE_WEBHOOK_CREATE_DICT = {
    **PHONE_WEBHOOK_DICT,
    "secret": "test-hmac-secret-abc123",
}
