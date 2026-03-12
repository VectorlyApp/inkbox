# inkbox

Python SDK for the [Inkbox API](https://inkbox.ai) — API-first communication infrastructure for AI agents (email, phone, identities).

## Install

```bash
pip install inkbox
```

Requires Python ≥ 3.11.

## Quick start

```python
import os
from inkbox import Inkbox

with Inkbox(api_key=os.environ["INKBOX_API_KEY"]) as inkbox:
    # Create an agent identity
    agent = inkbox.identities.create(agent_handle="support-bot")

    # Provision and link channels in one call each
    agent.assign_mailbox(display_name="Support Bot")
    agent.assign_phone_number(type="toll_free")

    # Send email directly from the agent
    agent.send_email(
        to=["customer@example.com"],
        subject="Your order has shipped",
        body_text="Tracking number: 1Z999AA10123456784",
    )

    # Place an outbound call
    agent.place_call(
        to_number="+18005559999",
        stream_url="wss://my-app.com/voice",
    )

    # Read inbox
    for message in agent.messages():
        print(message.subject)

    # Search transcripts
    transcripts = agent.search_transcripts(q="refund")
```

## Authentication

| Argument | Type | Default | Description |
|---|---|---|---|
| `api_key` | `str` | required | Your `ApiKey_...` token |
| `base_url` | `str` | API default | Override for self-hosting or testing |
| `timeout` | `float` | `30.0` | Request timeout in seconds |

Use `with Inkbox(...) as inkbox:` (recommended) or call `inkbox.close()` manually to clean up HTTP connections.

---

## Identities & Agent object

`inkbox.identities.create()` and `inkbox.identities.get()` return an `Agent` object that holds the agent's channels and exposes convenience methods scoped to those channels.

```python
# Create and fully provision an agent
agent = inkbox.identities.create(agent_handle="sales-bot")
mailbox = agent.assign_mailbox(display_name="Sales Bot")   # creates + links
phone   = agent.assign_phone_number(type="toll_free")      # provisions + links

print(mailbox.email_address)
print(phone.number)

# Get an existing agent
agent = inkbox.identities.get("sales-bot")
agent.refresh()  # re-fetch channels from API

# List / update / delete
all_identities = inkbox.identities.list()
inkbox.identities.update("sales-bot", status="paused")
agent.delete()
```

---

## Mail

### Sending email

```python
# Via agent (no email address needed)
agent.send_email(
    to=["user@example.com"],
    subject="Hello",
    body_text="Hi there!",
    body_html="<p>Hi there!</p>",
)

# Via flat namespace (useful when you have a mailbox address directly)
inkbox.messages.send(
    "agent@inkboxmail.com",
    to=["user@example.com"],
    subject="Hello",
    body_text="Hi there!",
)
```

### Reading messages and threads

```python
# Via agent — iterates inbox automatically (paginated)
for msg in agent.messages():
    print(msg.subject, msg.from_address)

# Full message body
detail = inkbox.messages.get(mailbox.email_address, msg.id)
print(detail.body_text)

# Threads
for thread in inkbox.threads.list(mailbox.email_address):
    print(thread.subject, thread.message_count)

thread_detail = inkbox.threads.get(mailbox.email_address, thread.id)
for msg in thread_detail.messages:
    print(f"[{msg.direction}] {msg.from_address}: {msg.snippet}")
```

### Mailboxes

```python
mailbox = inkbox.mailboxes.create(display_name="Sales Agent")
all_mailboxes = inkbox.mailboxes.list()
inkbox.mailboxes.update(mailbox.email_address, display_name="Sales Agent v2")
results = inkbox.mailboxes.search(mailbox.email_address, q="invoice")
inkbox.mailboxes.delete(mailbox.email_address)
```

### Webhooks

```python
# Secret is one-time — save it immediately
hook = inkbox.mail_webhooks.create(
    mailbox.email_address,
    url="https://yourapp.com/hooks/mail",
    event_types=["message.received", "message.sent"],
)
print(hook.secret)

hooks = inkbox.mail_webhooks.list(mailbox.email_address)
inkbox.mail_webhooks.delete(mailbox.email_address, hook.id)
```

---

## Phone

### Provisioning numbers

```python
number = inkbox.numbers.provision(type="toll_free")
number = inkbox.numbers.provision(type="local", state="NY")

all_numbers = inkbox.numbers.list()
inkbox.numbers.update(
    number.id,
    incoming_call_action="auto_accept",
    default_stream_url="wss://your-agent.example.com/ws",
)
inkbox.numbers.release(number=number.number)
```

### Placing calls

```python
# Via agent (from_number is automatic)
call = agent.place_call(
    to_number="+15167251294",
    stream_url="wss://your-agent.example.com/ws",
)

# Via flat namespace
call = inkbox.calls.place(
    from_number=number.number,
    to_number="+15167251294",
    stream_url="wss://your-agent.example.com/ws",
)
print(call.status, call.rate_limit.calls_remaining)
```

### Reading calls and transcripts

```python
calls = inkbox.calls.list(number.id, limit=10)
transcripts = inkbox.transcripts.list(number.id, calls[0].id)

# Full-text search via agent
results = agent.search_transcripts(q="appointment")

# Or flat namespace
results = inkbox.numbers.search_transcripts(number.id, q="appointment")
```

### Webhooks

```python
hook = inkbox.phone_webhooks.create(
    number.id,
    url="https://yourapp.com/hooks/phone",
    event_types=["call.completed"],
)
print(hook.secret)

hooks = inkbox.phone_webhooks.list(number.id)
inkbox.phone_webhooks.update(number.id, hook.id, url="https://yourapp.com/hooks/phone-v2")
inkbox.phone_webhooks.delete(number.id, hook.id)
```

---

## Examples

Runnable example scripts are available in the [examples/python](https://github.com/vectorlyapp/inkbox/tree/main/inkbox/examples/python) directory:

| Script | What it demonstrates |
|---|---|
| `register_agent_identity.py` | Create an identity, assign mailbox + phone number via Agent |
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
