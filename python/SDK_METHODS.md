# Inkbox Python SDK Methods

## Identities — `InkboxIdentities`

```python
from inkbox.identities import InkboxIdentities

client = InkboxIdentities(api_key="ApiKey_...")
```

### Identities (`client.identities`)

```python
# Create an identity -> AgentIdentity
agent: AgentIdentity = client.identities.create(agent_handle="my-agent")
agent.id              # UUID
agent.organization_id # str
agent.agent_handle    # str
agent.status          # str
agent.created_at      # datetime
agent.updated_at      # datetime

# List all identities -> list[AgentIdentity]
agents: list[AgentIdentity] = client.identities.list()

# Get an identity with linked channels -> AgentIdentityDetail
agent_with_channels: AgentIdentityDetail = client.identities.get("my-agent")
agent_with_channels.mailbox       # IdentityMailbox | None
agent_with_channels.phone_number  # IdentityPhoneNumber | None

# Update an identity -> AgentIdentity
updated_agent: AgentIdentity = client.identities.update("my-agent", new_handle="new-name", status="active")

# Delete an identity -> None
client.identities.delete("my-agent")

# Assign a mailbox -> AgentIdentityDetail
agent_with_mailbox: AgentIdentityDetail = client.identities.assign_mailbox("my-agent", mailbox_id="mailbox-uuid")
agent_with_mailbox.mailbox.email_address  # str
agent_with_mailbox.mailbox.display_name   # str | None
agent_with_mailbox.mailbox.status         # str

# Unlink a mailbox -> None
client.identities.unlink_mailbox("my-agent")

# Assign a phone number -> AgentIdentityDetail
agent_with_phone: AgentIdentityDetail = client.identities.assign_phone_number("my-agent", phone_number_id="number-uuid")
agent_with_phone.phone_number.number                # str
agent_with_phone.phone_number.type                  # str
agent_with_phone.phone_number.status                # str
agent_with_phone.phone_number.incoming_call_action  # str
agent_with_phone.phone_number.client_websocket_url  # str | None

# Unlink a phone number -> None
client.identities.unlink_phone_number("my-agent")
```

### Cleanup

```python
client.close()
```

---

## Mail — `InkboxMail`

```python
from inkbox.mail import InkboxMail

mail = InkboxMail(api_key="ApiKey_...")
```

### Mailboxes (`mail.mailboxes`)

```python
# Create a mailbox -> Mailbox
mailbox: Mailbox = mail.mailboxes.create(display_name="My Agent")
mailbox.id             # UUID
mailbox.email_address  # str
mailbox.display_name   # str | None
mailbox.webhook_url    # str | None
mailbox.status         # str
mailbox.created_at     # datetime
mailbox.updated_at     # datetime

# List all mailboxes -> list[Mailbox]
all_mailboxes: list[Mailbox] = mail.mailboxes.list()

# Get a mailbox -> Mailbox
mailbox: Mailbox = mail.mailboxes.get("agent@inkboxmail.com")

# Update a mailbox -> Mailbox
updated_mailbox: Mailbox = mail.mailboxes.update("agent@inkboxmail.com", display_name="New Name", webhook_url="https://...")

# Delete a mailbox -> None
mail.mailboxes.delete("agent@inkboxmail.com")

# Search messages in a mailbox -> list[Message]
matching_messages: list[Message] = mail.mailboxes.search("agent@inkboxmail.com", q="invoice", limit=50)
```

### Messages (`mail.messages`)

```python
# List messages (paginated iterator) -> Iterator[Message]
for message in mail.messages.list("agent@inkboxmail.com", page_size=50, direction="inbound"):
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

# Get a single message -> MessageDetail (extends Message)
full_message: MessageDetail = mail.messages.get("agent@inkboxmail.com", "message-uuid")
full_message.body_text            # str | None
full_message.body_html            # str | None
full_message.bcc_addresses        # list[str] | None
full_message.in_reply_to          # str | None
full_message.references           # list[str] | None
full_message.attachment_metadata  # list[dict[str, Any]] | None
full_message.ses_message_id       # str | None
full_message.updated_at           # datetime | None

# Send an email -> Message
sent_message: Message = mail.messages.send(
    "agent@inkboxmail.com",
    to=["user@example.com"],
    subject="Hello",
    body_text="Plain text body",
    body_html="<h1>HTML body</h1>",
    cc=["cc@example.com"],
    bcc=["bcc@example.com"],
    in_reply_to_message_id="original-msg-id",
    attachments=[{"filename": "f.txt", "content": "base64..."}],
)

# Update flags -> Message
flagged_message: Message = mail.messages.update_flags("agent@inkboxmail.com", "msg-id", is_read=True, is_starred=False)

# Convenience shortcuts -> Message
read_message: Message = mail.messages.mark_read("agent@inkboxmail.com", "msg-id")
unread_message: Message = mail.messages.mark_unread("agent@inkboxmail.com", "msg-id")
starred_message: Message = mail.messages.star("agent@inkboxmail.com", "msg-id")
unstarred_message: Message = mail.messages.unstar("agent@inkboxmail.com", "msg-id")

# Delete a message -> None
mail.messages.delete("agent@inkboxmail.com", "msg-id")

# Get an attachment -> dict[str, Any]
attachment_data: dict[str, Any] = mail.messages.get_attachment("agent@inkboxmail.com", "msg-id", "report.pdf", redirect=False)
```

### Threads (`mail.threads`)

```python
# List threads (paginated iterator) -> Iterator[Thread]
for thread in mail.threads.list("agent@inkboxmail.com", page_size=50):
    thread.id              # UUID
    thread.mailbox_id      # UUID
    thread.subject         # str | None
    thread.status          # str
    thread.message_count   # int
    thread.last_message_at # datetime
    thread.created_at      # datetime

# Get a thread -> ThreadDetail (extends Thread)
full_thread: ThreadDetail = mail.threads.get("agent@inkboxmail.com", "thread-uuid")
full_thread.messages  # list[Message]

# Delete a thread -> None
mail.threads.delete("agent@inkboxmail.com", "thread-uuid")
```

### Webhooks (`mail.webhooks`)

```python
# Create a webhook -> WebhookCreateResult (extends Webhook, includes secret)
new_webhook: WebhookCreateResult = mail.webhooks.create("agent@inkboxmail.com", url="https://...", event_types=["message.received"])
new_webhook.id           # UUID
new_webhook.mailbox_id   # UUID
new_webhook.url          # str
new_webhook.event_types  # list[str]
new_webhook.status       # str
new_webhook.created_at   # datetime
new_webhook.secret       # str  <-- only returned on create

# List webhooks -> list[Webhook]
all_webhooks: list[Webhook] = mail.webhooks.list("agent@inkboxmail.com")

# Delete a webhook -> None
mail.webhooks.delete("agent@inkboxmail.com", "webhook-id")
```

### Cleanup

```python
mail.close()
```

---

## Phone — `InkboxPhone`

```python
from inkbox.phone import InkboxPhone

phone = InkboxPhone(api_key="ApiKey_...")
```

### Phone Numbers (`phone.numbers`)

```python
# List all numbers -> list[PhoneNumber]
all_numbers: list[PhoneNumber] = phone.numbers.list()
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
phone_number: PhoneNumber = phone.numbers.get("number-uuid")

# Update a number -> PhoneNumber
updated_number: PhoneNumber = phone.numbers.update(
    "number-uuid",
    incoming_call_action="stream",
    default_stream_url="wss://...",
    default_pipeline_mode="half_duplex",
)

# Provision a new number -> PhoneNumber
new_number: PhoneNumber = phone.numbers.provision(type="toll_free", state="CA")

# Release a number -> None
phone.numbers.release(number="+18005551234")

# Search transcripts for a number -> list[PhoneTranscript]
matching_transcripts: list[PhoneTranscript] = phone.numbers.search_transcripts("number-uuid", q="refund", party="caller", limit=50)
matching_transcripts[0].id          # UUID
matching_transcripts[0].call_id     # UUID
matching_transcripts[0].seq         # int
matching_transcripts[0].ts_ms       # int
matching_transcripts[0].party       # str
matching_transcripts[0].text        # str
matching_transcripts[0].created_at  # datetime
```

### Calls (`phone.calls`)

```python
# List calls for a number -> list[PhoneCall]
all_calls: list[PhoneCall] = phone.calls.list("number-uuid", limit=50, offset=0)
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
call: PhoneCall = phone.calls.get("number-uuid", "call-uuid")

# Place an outbound call -> PhoneCallWithRateLimit (extends PhoneCall)
placed_call: PhoneCallWithRateLimit = phone.calls.place(
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

### Transcripts (`phone.transcripts`)

```python
# List transcripts for a call -> list[PhoneTranscript]
call_transcripts: list[PhoneTranscript] = phone.transcripts.list("number-uuid", "call-uuid")
```

### Webhooks (`phone.webhooks`)

```python
# Create a webhook -> PhoneWebhookCreateResult (extends PhoneWebhook, includes secret)
new_phone_webhook: PhoneWebhookCreateResult = phone.webhooks.create("number-uuid", url="https://...", event_types=["call.completed"])
new_phone_webhook.id           # UUID
new_phone_webhook.source_id    # UUID
new_phone_webhook.source_type  # str
new_phone_webhook.url          # str
new_phone_webhook.event_types  # list[str]
new_phone_webhook.status       # str
new_phone_webhook.created_at   # datetime
new_phone_webhook.secret       # str  <-- only returned on create

# List webhooks -> list[PhoneWebhook]
all_phone_webhooks: list[PhoneWebhook] = phone.webhooks.list("number-uuid")

# Update a webhook -> PhoneWebhook
updated_phone_webhook: PhoneWebhook = phone.webhooks.update("number-uuid", "webhook-uuid", url="https://new-url", event_types=["call.started"])

# Delete a webhook -> None
phone.webhooks.delete("number-uuid", "webhook-uuid")
```

### Cleanup

```python
phone.close()
```
