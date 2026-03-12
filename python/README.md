# inkbox

Python SDK for the [Inkbox API](https://inkbox.ai) — API-first communication infrastructure for AI agents (email, phone, identities).

## Install

```bash
pip install inkbox
```

Requires Python ≥ 3.11.

## Authentication

Pass your API key when constructing a client, or load it from an environment variable:

```python
import os
from inkbox.mail import InkboxMail

client = InkboxMail(api_key=os.environ["INKBOX_API_KEY"])
```

All three clients (`InkboxMail`, `InkboxPhone`, `InkboxIdentities`) accept the same constructor arguments:

| Argument | Type | Default | Description |
|---|---|---|---|
| `api_key` | `str` | required | Your `ApiKey_...` token |
| `base_url` | `str` | API default | Override for self-hosting or testing |
| `timeout` | `float` | `30.0` | Request timeout in seconds |

## Context manager

Using clients as context managers is recommended — it ensures HTTP connections are closed cleanly:

```python
from inkbox.mail import InkboxMail

with InkboxMail(api_key="ApiKey_...") as client:
    mailboxes = client.mailboxes.list()
```

You can also call `client.close()` manually when not using `with`.

---

## Identities

Agent identities are the central concept — a named agent (e.g. `"sales-agent"`) that owns a mailbox and/or phone number.

```python
from inkbox.identities import InkboxIdentities

with InkboxIdentities(api_key="ApiKey_...") as client:

    # Create an identity
    identity = client.identities.create(agent_handle="sales-agent")
    print(f"Registered: {identity.agent_handle}  id={identity.id}")

    # Assign communication channels (mailbox / phone number must already exist)
    with_mailbox = client.identities.assign_mailbox(
        "sales-agent", mailbox_id="<mailbox-uuid>"
    )
    print(with_mailbox.mailbox.email_address)

    with_phone = client.identities.assign_phone_number(
        "sales-agent", phone_number_id="<phone-number-uuid>"
    )
    print(with_phone.phone_number.number)

    # List all identities
    all_identities = client.identities.list()
    for ident in all_identities:
        print(ident.agent_handle, ident.status)

    # Get, update, delete
    detail = client.identities.get("sales-agent")
    client.identities.update("sales-agent", status="paused")
    client.identities.delete("sales-agent")
```

---

## Mail

### Mailboxes

```python
from inkbox.mail import InkboxMail

with InkboxMail(api_key="ApiKey_...") as client:

    # Create a mailbox (agent identity must already exist)
    mailbox = client.mailboxes.create(agent_handle="sales-agent", display_name="Sales Agent")
    print(mailbox.email_address)

    # List all mailboxes
    all_mailboxes = client.mailboxes.list()
    for m in all_mailboxes:
        print(m.email_address, m.status)

    # Update display name
    updated = client.mailboxes.update(mailbox.email_address, display_name="Sales Agent (updated)")

    # Full-text search across messages
    results = client.mailboxes.search(mailbox.email_address, q="invoice")

    # Delete
    client.mailboxes.delete(mailbox.email_address)
```

### Sending email

```python
    # Send an outbound email
    sent = client.messages.send(
        mailbox.email_address,
        to=["recipient@example.com"],
        subject="Hello from your AI agent",
        body_text="Hi there!",
        body_html="<p>Hi there!</p>",
    )

    # Reply in a thread (pass the original message's RFC Message-ID)
    reply = client.messages.send(
        mailbox.email_address,
        to=["recipient@example.com"],
        subject=f"Re: {sent.subject}",
        body_text="Following up.",
        in_reply_to_message_id=str(sent.id),
    )
```

### Reading messages and threads

```python
    # Paginate through all messages (pagination handled automatically)
    for msg in client.messages.list(mailbox.email_address):
        print(msg.subject, msg.from_address, msg.direction)

    # Fetch full message body
    detail = client.messages.get(mailbox.email_address, msg.id)
    print(detail.body_text)

    # List threads
    for thread in client.threads.list(mailbox.email_address):
        print(thread.subject, thread.message_count)

    # Fetch full thread with all messages
    thread_detail = client.threads.get(mailbox.email_address, thread.id)
    for msg in thread_detail.messages:
        print(f"[{msg.direction}] {msg.from_address}: {msg.snippet}")
```

### Webhooks

```python
    # Register a webhook (secret is one-time — save it immediately)
    hook = client.webhooks.create(
        mailbox.email_address,
        url="https://yourapp.com/hooks/mail",
        event_types=["message.received", "message.sent"],
    )
    print(hook.secret)  # save this — it will not be shown again

    # List active webhooks
    hooks = client.webhooks.list(mailbox.email_address)

    # Delete a webhook
    client.webhooks.delete(mailbox.email_address, hook.id)
```

---

## Phone

### Provisioning numbers

```python
from inkbox.phone import InkboxPhone

with InkboxPhone(api_key="ApiKey_...") as client:

    # Provision a toll-free number
    number = client.numbers.provision(type="toll_free")
    print(number.number, number.status)

    # Provision a local number in a specific state
    number = client.numbers.provision(type="local", state="NY")

    # List all numbers
    all_numbers = client.numbers.list()
    for n in all_numbers:
        print(n.number, n.type, n.status)

    # Update settings
    updated = client.numbers.update(
        number.id,
        incoming_call_action="auto_accept",
        default_stream_url="wss://your-agent.example.com/ws",
    )

    # Release a number
    client.numbers.release(number=number.number)
```

### Placing calls

```python
    # Place an outbound call
    call = client.calls.place(
        from_number=number.number,
        to_number="+15167251294",
        stream_url="wss://your-agent.example.com/ws",
    )
    print(call.status)
    print(call.rate_limit.calls_remaining)
```

### Reading calls and transcripts

```python
    # List recent calls for a number
    calls = client.calls.list(number.id, limit=10)
    for call in calls:
        print(call.id, call.direction, call.remote_phone_number, call.status)

    # Read transcript for a call
    transcripts = client.transcripts.list(number.id, call.id)
    for t in transcripts:
        print(f"[{t.party}] {t.text}")

    # Full-text search across all transcripts for a number
    results = client.numbers.search_transcripts(number.id, q="appointment")
```

### Webhooks

```python
    # Register a webhook (secret is one-time — save it immediately)
    hook = client.webhooks.create(
        number.id,
        url="https://yourapp.com/hooks/phone",
        event_types=["call.completed"],
    )
    print(hook.secret)  # save this — it will not be shown again

    # List and delete
    hooks = client.webhooks.list(number.id)
    client.webhooks.delete(number.id, hook.id)
```

---

## Examples

Runnable example scripts are available in the [examples/python](https://github.com/vectorlyapp/inkbox/tree/main/inkbox/examples/python) directory:

| Script | What it demonstrates |
|---|---|
| `register_agent_identity.py` | Create an identity and assign mailbox / phone number |
| `create_agent_mailbox.py` | Create, update, search, and delete a mailbox |
| `agent_send_email.py` | Send an email and a threaded reply |
| `read_agent_messages.py` | List messages and read full threads |
| `create_agent_phone_number.py` | Provision, update, and release a number |
| `list_agent_phone_numbers.py` | List all provisioned numbers |
| `read_agent_calls.py` | List calls and print transcripts |
| `receive_agent_email_webhook.py` | Register, list, and delete email webhooks |
| `receive_agent_call_webhook.py` | Register, list, and delete phone webhooks |

## License

MIT
