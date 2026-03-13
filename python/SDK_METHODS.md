# Inkbox Python SDK Methods

## Unified Client — `Inkbox`

```python
from inkbox import Inkbox

inkbox = Inkbox(api_key="ApiKey_...", base_url="https://api.inkbox.ai", timeout=30.0)

# Context manager auto-closes all connections:
with Inkbox(api_key="ApiKey_...") as inkbox:
    ...

inkbox.close()  # -> None (closes all HTTP connection pools)
```

---

## Agent — `Agent`

Returned by `inkbox.identities.create()` and `inkbox.identities.get()`.
Wraps an identity with convenience methods scoped to its assigned channels.

### Properties

```python
agent = inkbox.identities.get("support-bot")

agent.agent_handle   # str
agent.id             # UUID
agent.status         # str
agent.mailbox        # IdentityMailbox | None
agent.phone_number   # IdentityPhoneNumber | None
```

### Channel Assignment

```python
# Create a new mailbox AND assign it to this agent -> IdentityMailbox
assigned_mailbox: IdentityMailbox = agent.assign_mailbox(display_name="Support Bot")
assigned_mailbox.id              # UUID
assigned_mailbox.email_address   # str
assigned_mailbox.display_name    # str | None
assigned_mailbox.status          # str
assigned_mailbox.created_at      # datetime
assigned_mailbox.updated_at      # datetime

# Provision a new phone number AND assign it to this agent -> IdentityPhoneNumber
assigned_phone: IdentityPhoneNumber = agent.assign_phone_number(type="toll_free", state="CA")
assigned_phone.id                    # UUID
assigned_phone.number                # str
assigned_phone.type                  # str
assigned_phone.status                # str
assigned_phone.incoming_call_action  # str
assigned_phone.client_websocket_url  # str | None
assigned_phone.created_at            # datetime
assigned_phone.updated_at            # datetime
```

### Mail Helpers

```python
# Send an email from this agent's mailbox -> Message
sent_message: Message = agent.send_email(
    to=["customer@example.com"],
    subject="Your order has shipped",
    body_text="Tracking number: 1Z999AA10123456784",
    body_html="<h1>Shipped!</h1>",
    cc=["team@example.com"],
    bcc=["logs@example.com"],
    in_reply_to_message_id="original-msg-id",
    attachments=[{"filename": "receipt.pdf", "content_type": "application/pdf", "content_base64": "..."}],
)

# Iterate over messages in this agent's inbox -> Iterator[Message]
for message in agent.messages(page_size=50, direction="inbound"):
    message.id              # UUID
    message.from_address    # str
    message.to_addresses    # list[str]
    message.subject         # str | None
    message.snippet         # str | None
    message.direction       # str
    message.status          # str
    message.is_read         # bool
    message.is_starred      # bool
    message.has_attachments # bool
    message.created_at      # datetime
```

### Phone Helpers

```python
# Place an outbound call from this agent's phone number -> PhoneCallWithRateLimit
placed_call: PhoneCallWithRateLimit = agent.place_call(
    to_number="+18005559999",
    stream_url="wss://my-app.com/voice",
    pipeline_mode="half_duplex",
    webhook_url="https://my-app.com/hooks",
)
placed_call.id                            # UUID
placed_call.local_phone_number            # str
placed_call.remote_phone_number           # str
placed_call.direction                     # str
placed_call.status                        # str
placed_call.rate_limit.calls_used         # int
placed_call.rate_limit.calls_remaining    # int
placed_call.rate_limit.calls_limit        # int
placed_call.rate_limit.minutes_used       # float
placed_call.rate_limit.minutes_remaining  # float
placed_call.rate_limit.minutes_limit      # int

# Search call transcripts for this agent's number -> list[PhoneTranscript]
matching_transcripts: list[PhoneTranscript] = agent.search_transcripts(q="refund", party="remote", limit=50)
matching_transcripts[0].id          # UUID
matching_transcripts[0].call_id     # UUID
matching_transcripts[0].seq         # int
matching_transcripts[0].ts_ms       # int
matching_transcripts[0].party       # str
matching_transcripts[0].text        # str
matching_transcripts[0].created_at  # datetime
```

### Lifecycle

```python
# Re-fetch identity from the API and update cached channels -> Agent (self)
agent.refresh()

# Soft-delete this identity (unlinks channels without deleting them) -> None
agent.delete()
```

---

## Identities — `inkbox.identities`

```python
# Create a new agent identity -> Agent
agent: Agent = inkbox.identities.create(agent_handle="support-bot")

# Get an agent identity by handle -> Agent
agent: Agent = inkbox.identities.get("support-bot")

# List all agent identities -> list[AgentIdentity]
all_agents: list[AgentIdentity] = inkbox.identities.list()
all_agents[0].id              # UUID
all_agents[0].organization_id # str
all_agents[0].agent_handle    # str
all_agents[0].status          # str
all_agents[0].created_at      # datetime
all_agents[0].updated_at      # datetime

# Update an identity's handle or status -> AgentIdentity
updated_agent: AgentIdentity = inkbox.identities.update("support-bot", new_handle="new-name", status="active")

# Delete an identity -> None
inkbox.identities.delete("support-bot")

# Assign an existing mailbox to an identity by ID -> AgentIdentityDetail
agent_with_mailbox: AgentIdentityDetail = inkbox.identities.assign_mailbox("support-bot", mailbox_id="mailbox-uuid")
agent_with_mailbox.mailbox             # IdentityMailbox | None
agent_with_mailbox.phone_number        # IdentityPhoneNumber | None

# Unlink a mailbox from an identity -> None
inkbox.identities.unlink_mailbox("support-bot")

# Assign an existing phone number to an identity by ID -> AgentIdentityDetail
agent_with_phone: AgentIdentityDetail = inkbox.identities.assign_phone_number("support-bot", phone_number_id="number-uuid")

# Unlink a phone number from an identity -> None
inkbox.identities.unlink_phone_number("support-bot")
```

---

## Mailboxes — `inkbox.mailboxes`

```python
# Create a new mailbox -> Mailbox
mailbox: Mailbox = inkbox.mailboxes.create(display_name="My Agent")
mailbox.id             # UUID
mailbox.email_address  # str
mailbox.display_name   # str | None
mailbox.webhook_url    # str | None
mailbox.status         # str
mailbox.created_at     # datetime
mailbox.updated_at     # datetime

# List all mailboxes -> list[Mailbox]
all_mailboxes: list[Mailbox] = inkbox.mailboxes.list()

# Get a mailbox -> Mailbox
mailbox: Mailbox = inkbox.mailboxes.get("agent@inkboxmail.com")

# Update a mailbox -> Mailbox
updated_mailbox: Mailbox = inkbox.mailboxes.update("agent@inkboxmail.com", display_name="New Name", webhook_url="https://...")

# Delete a mailbox -> None
inkbox.mailboxes.delete("agent@inkboxmail.com")

# Search messages in a mailbox -> list[Message]
matching_messages: list[Message] = inkbox.mailboxes.search("agent@inkboxmail.com", q="invoice", limit=50)
```

---

## Messages — `inkbox.messages`

```python
# List messages (auto-paginated iterator) -> Iterator[Message]
for message in inkbox.messages.list("agent@inkboxmail.com", page_size=50, direction="inbound"):
    message.id              # UUID
    message.mailbox_id      # UUID
    message.thread_id       # UUID | None
    message.message_id      # str
    message.from_address    # str
    message.to_addresses    # list[str]
    message.cc_addresses    # list[str] | None
    message.subject         # str | None
    message.snippet         # str | None
    message.direction       # str
    message.status          # str
    message.is_read         # bool
    message.is_starred      # bool
    message.has_attachments # bool
    message.created_at      # datetime

# Get a single message with full body -> MessageDetail (extends Message)
full_message: MessageDetail = inkbox.messages.get("agent@inkboxmail.com", "message-uuid")
full_message.body_text            # str | None
full_message.body_html            # str | None
full_message.bcc_addresses        # list[str] | None
full_message.in_reply_to          # str | None
full_message.references           # list[str] | None
full_message.attachment_metadata  # list[dict[str, Any]] | None
full_message.ses_message_id       # str | None
full_message.updated_at           # datetime | None

# Send an email -> Message
sent_message: Message = inkbox.messages.send(
    "agent@inkboxmail.com",
    to=["user@example.com"],
    subject="Hello",
    body_text="Plain text body",
    body_html="<h1>HTML body</h1>",
    cc=["cc@example.com"],
    bcc=["bcc@example.com"],
    in_reply_to_message_id="original-msg-id",
    attachments=[{"filename": "f.txt", "content_type": "text/plain", "content_base64": "..."}],
)

# Update flags -> Message
flagged_message: Message = inkbox.messages.update_flags("agent@inkboxmail.com", "msg-id", is_read=True, is_starred=False)

# Convenience shortcuts -> Message
read_message: Message = inkbox.messages.mark_read("agent@inkboxmail.com", "msg-id")
unread_message: Message = inkbox.messages.mark_unread("agent@inkboxmail.com", "msg-id")
starred_message: Message = inkbox.messages.star("agent@inkboxmail.com", "msg-id")
unstarred_message: Message = inkbox.messages.unstar("agent@inkboxmail.com", "msg-id")

# Delete a message -> None
inkbox.messages.delete("agent@inkboxmail.com", "msg-id")

# Get a presigned URL for an attachment -> dict[str, Any]
attachment_data: dict[str, Any] = inkbox.messages.get_attachment("agent@inkboxmail.com", "msg-id", "report.pdf", redirect=False)
# Returns: {"url": str, "filename": str, "expires_in": int}
```

---

## Threads — `inkbox.threads`

```python
# List threads (auto-paginated iterator) -> Iterator[Thread]
for thread in inkbox.threads.list("agent@inkboxmail.com", page_size=50):
    thread.id              # UUID
    thread.mailbox_id      # UUID
    thread.subject         # str | None
    thread.status          # str
    thread.message_count   # int
    thread.last_message_at # datetime
    thread.created_at      # datetime

# Get a thread with all its messages -> ThreadDetail (extends Thread)
full_thread: ThreadDetail = inkbox.threads.get("agent@inkboxmail.com", "thread-uuid")
full_thread.messages  # list[Message]

# Delete a thread -> None
inkbox.threads.delete("agent@inkboxmail.com", "thread-uuid")
```

---

## Mail Webhooks — `inkbox.mail_webhooks`

```python
# Create a webhook -> WebhookCreateResult (extends Webhook, includes secret)
new_webhook: WebhookCreateResult = inkbox.mail_webhooks.create("mailbox-uuid", url="https://...", event_types=["message.received"])
new_webhook.id           # UUID
new_webhook.mailbox_id   # UUID
new_webhook.url          # str
new_webhook.event_types  # list[str]
new_webhook.status       # str
new_webhook.created_at   # datetime
new_webhook.secret       # str  <-- only returned on create

# List webhooks -> list[Webhook]
all_webhooks: list[Webhook] = inkbox.mail_webhooks.list("mailbox-uuid")

# Delete a webhook -> None
inkbox.mail_webhooks.delete("mailbox-uuid", "webhook-id")
```

---

## Phone Numbers — `inkbox.numbers`

```python
# List all numbers -> list[PhoneNumber]
all_numbers: list[PhoneNumber] = inkbox.numbers.list()
all_numbers[0].id                     # UUID
all_numbers[0].number                 # str
all_numbers[0].type                   # str
all_numbers[0].status                 # str
all_numbers[0].incoming_call_action   # str
all_numbers[0].default_stream_url     # str | None
all_numbers[0].default_pipeline_mode  # str
all_numbers[0].created_at             # datetime
all_numbers[0].updated_at             # datetime

# Get a number -> PhoneNumber
phone_number: PhoneNumber = inkbox.numbers.get("number-uuid")

# Update a number -> PhoneNumber
updated_number: PhoneNumber = inkbox.numbers.update(
    "number-uuid",
    incoming_call_action="stream",
    default_stream_url="wss://...",
    default_pipeline_mode="half_duplex",
)

# Provision a new number -> PhoneNumber
new_number: PhoneNumber = inkbox.numbers.provision(type="toll_free", state="CA")

# Release a number -> None
inkbox.numbers.release(number="+18005551234")

# Search transcripts for a number -> list[PhoneTranscript]
matching_transcripts: list[PhoneTranscript] = inkbox.numbers.search_transcripts("number-uuid", q="refund", party="caller", limit=50)
```

---

## Calls — `inkbox.calls`

```python
# List calls for a number -> list[PhoneCall]
all_calls: list[PhoneCall] = inkbox.calls.list("number-uuid", limit=50, offset=0)
all_calls[0].id                    # UUID
all_calls[0].local_phone_number    # str
all_calls[0].remote_phone_number   # str
all_calls[0].direction             # str
all_calls[0].status                # str
all_calls[0].pipeline_mode         # str | None
all_calls[0].stream_url            # str | None
all_calls[0].hangup_reason         # str | None
all_calls[0].started_at            # datetime | None
all_calls[0].ended_at              # datetime | None
all_calls[0].created_at            # datetime
all_calls[0].updated_at            # datetime

# Get a single call -> PhoneCall
call: PhoneCall = inkbox.calls.get("number-uuid", "call-uuid")

# Place an outbound call -> PhoneCallWithRateLimit (extends PhoneCall)
placed_call: PhoneCallWithRateLimit = inkbox.calls.place(
    from_number="+18005551234",
    to_number="+18005559999",
    stream_url="wss://...",
    pipeline_mode="half_duplex",
    webhook_url="https://...",
)
placed_call.rate_limit                    # RateLimitInfo
placed_call.rate_limit.calls_used         # int
placed_call.rate_limit.calls_remaining    # int
placed_call.rate_limit.calls_limit        # int
placed_call.rate_limit.minutes_used       # float
placed_call.rate_limit.minutes_remaining  # float
placed_call.rate_limit.minutes_limit      # int
```

---

## Transcripts — `inkbox.transcripts`

```python
# List transcripts for a call -> list[PhoneTranscript]
call_transcripts: list[PhoneTranscript] = inkbox.transcripts.list("number-uuid", "call-uuid")
call_transcripts[0].id          # UUID
call_transcripts[0].call_id     # UUID
call_transcripts[0].seq         # int
call_transcripts[0].ts_ms       # int
call_transcripts[0].party       # str
call_transcripts[0].text        # str
call_transcripts[0].created_at  # datetime
```

---

## Phone Webhooks — `inkbox.phone_webhooks`

```python
# Create a webhook -> PhoneWebhookCreateResult (extends PhoneWebhook, includes secret)
new_phone_webhook: PhoneWebhookCreateResult = inkbox.phone_webhooks.create("number-uuid", url="https://...", event_types=["call.completed"])
new_phone_webhook.id           # UUID
new_phone_webhook.source_id    # UUID
new_phone_webhook.source_type  # str
new_phone_webhook.url          # str
new_phone_webhook.event_types  # list[str]
new_phone_webhook.status       # str
new_phone_webhook.created_at   # datetime
new_phone_webhook.secret       # str  <-- only returned on create

# List webhooks -> list[PhoneWebhook]
all_phone_webhooks: list[PhoneWebhook] = inkbox.phone_webhooks.list("number-uuid")

# Update a webhook -> PhoneWebhook
updated_phone_webhook: PhoneWebhook = inkbox.phone_webhooks.update("number-uuid", "webhook-uuid", url="https://new-url", event_types=["call.started"])

# Delete a webhook -> None
inkbox.phone_webhooks.delete("number-uuid", "webhook-uuid")
```

---

## Signing Keys — `inkbox.signing_keys`

```python
# Create or rotate the org-level webhook signing key -> SigningKey
signing_key: SigningKey = inkbox.signing_keys.create_or_rotate()
signing_key.signing_key  # str  <-- store securely, only returned once
signing_key.created_at   # datetime
```

---

## Webhook Verification — `verify_webhook`

Standalone function, not on a client.

```python
from inkbox.signing_keys import verify_webhook

is_valid: bool = verify_webhook(
    payload=request.body,                                # raw bytes, do not parse
    signature=request.headers["X-Inkbox-Signature"],     # "sha256=..."
    request_id=request.headers["X-Inkbox-Request-ID"],
    timestamp=request.headers["X-Inkbox-Timestamp"],
    secret="whsec_...",                                  # your signing key
)
```
