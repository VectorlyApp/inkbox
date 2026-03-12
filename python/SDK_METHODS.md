# Inkbox Python SDK Methods

## Identities — `InkboxIdentities`

```python
from inkbox.identities import InkboxIdentities

identities = InkboxIdentities(api_key="ApiKey_...")
```

### Identities (`identities.identities`)

```python
# Create an identity
identity = identities.identities.create(agent_handle="my-agent")

# List all identities
all_ids = identities.identities.list()

# Get an identity (returns detail with linked mailbox/phone)
detail = identities.identities.get("my-agent")

# Update an identity
identity = identities.identities.update("my-agent", new_handle="new-name", status="active")

# Delete an identity
identities.identities.delete("my-agent")

# Assign a mailbox
detail = identities.identities.assign_mailbox("my-agent", mailbox_id="mailbox-uuid")

# Unlink a mailbox
identities.identities.unlink_mailbox("my-agent")

# Assign a phone number
detail = identities.identities.assign_phone_number("my-agent", phone_number_id="number-uuid")

# Unlink a phone number
identities.identities.unlink_phone_number("my-agent")
```

### Cleanup

```python
identities.close()
```

---

## Mail — `InkboxMail`

```python
from inkbox.mail import InkboxMail

mail = InkboxMail(api_key="ApiKey_...")
```

### Mailboxes (`mail.mailboxes`)

```python
# Create a mailbox
mailbox = mail.mailboxes.create(display_name="My Agent")

# List all mailboxes
mailboxes = mail.mailboxes.list()

# Get a mailbox
mailbox = mail.mailboxes.get("agent@inkboxmail.com")

# Update a mailbox
mailbox = mail.mailboxes.update("agent@inkboxmail.com", display_name="New Name", webhook_url="https://...")

# Delete a mailbox
mail.mailboxes.delete("agent@inkboxmail.com")

# Search messages in a mailbox
results = mail.mailboxes.search("agent@inkboxmail.com", q="invoice", limit=50)
```

### Messages (`mail.messages`)

```python
# List messages (paginated iterator)
for msg in mail.messages.list("agent@inkboxmail.com", page_size=50, direction="inbound"):
    print(msg)

# Get a single message
msg = mail.messages.get("agent@inkboxmail.com", "message-uuid")

# Send an email
msg = mail.messages.send(
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

# Update flags
msg = mail.messages.update_flags("agent@inkboxmail.com", "msg-id", is_read=True, is_starred=False)

# Convenience shortcuts
mail.messages.mark_read("agent@inkboxmail.com", "msg-id")
mail.messages.mark_unread("agent@inkboxmail.com", "msg-id")
mail.messages.star("agent@inkboxmail.com", "msg-id")
mail.messages.unstar("agent@inkboxmail.com", "msg-id")

# Delete a message
mail.messages.delete("agent@inkboxmail.com", "msg-id")

# Get an attachment
attachment = mail.messages.get_attachment("agent@inkboxmail.com", "msg-id", "report.pdf", redirect=False)
```

### Threads (`mail.threads`)

```python
# List threads (paginated iterator)
for thread in mail.threads.list("agent@inkboxmail.com", page_size=50):
    print(thread)

# Get a thread
thread = mail.threads.get("agent@inkboxmail.com", "thread-uuid")

# Delete a thread
mail.threads.delete("agent@inkboxmail.com", "thread-uuid")
```

### Webhooks (`mail.webhooks`)

```python
# Create a webhook
result = mail.webhooks.create("agent@inkboxmail.com", url="https://...", event_types=["message.received"])

# List webhooks
webhooks = mail.webhooks.list("agent@inkboxmail.com")

# Delete a webhook
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
# List all numbers
numbers = phone.numbers.list()

# Get a number
number = phone.numbers.get("number-uuid")

# Update a number
number = phone.numbers.update(
    "number-uuid",
    incoming_call_action="stream",
    default_stream_url="wss://...",
    default_pipeline_mode="half_duplex",
)

# Provision a new number
number = phone.numbers.provision(type="toll_free", state="CA")

# Release a number
phone.numbers.release(number="+18005551234")

# Search transcripts for a number
transcripts = phone.numbers.search_transcripts("number-uuid", q="refund", party="caller", limit=50)
```

### Calls (`phone.calls`)

```python
# List calls for a number
calls = phone.calls.list("number-uuid", limit=50, offset=0)

# Get a single call
call = phone.calls.get("number-uuid", "call-uuid")

# Place an outbound call
result = phone.calls.place(
    from_number="+18005551234",
    to_number="+18005559999",
    stream_url="wss://...",
    pipeline_mode="half_duplex",
    webhook_url="https://...",
)
# result.rate_limit has rate limit info
```

### Transcripts (`phone.transcripts`)

```python
# List transcripts for a call
transcripts = phone.transcripts.list("number-uuid", "call-uuid")
```

### Webhooks (`phone.webhooks`)

```python
# Create a webhook
result = phone.webhooks.create("number-uuid", url="https://...", event_types=["call.completed"])

# List webhooks
webhooks = phone.webhooks.list("number-uuid")

# Update a webhook
webhook = phone.webhooks.update("number-uuid", "webhook-uuid", url="https://new-url", event_types=["call.started"])

# Delete a webhook
phone.webhooks.delete("number-uuid", "webhook-uuid")
```

### Cleanup

```python
phone.close()
```
