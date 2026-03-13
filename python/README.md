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
    identity = inkbox.create_identity("support-bot")

    # Provision and link channels in one call each
    identity.assign_mailbox(display_name="Support Bot")
    identity.assign_phone_number(type="toll_free")

    # Send email directly from the identity
    identity.send_email(
        to=["customer@example.com"],
        subject="Your order has shipped",
        body_text="Tracking number: 1Z999AA10123456784",
    )

    # Place an outbound call
    identity.place_call(
        to_number="+18005559999",
        stream_url="wss://my-app.com/voice",
    )

    # Read inbox
    for message in identity.messages():
        print(message.subject)

    # Search transcripts
    results = identity.search_transcripts(q="refund")
```

## Authentication

| Argument | Type | Default | Description |
|---|---|---|---|
| `api_key` | `str` | required | Your `ApiKey_...` token |
| `base_url` | `str` | API default | Override for self-hosting or testing |
| `timeout` | `float` | `30.0` | Request timeout in seconds |

Use `with Inkbox(...) as inkbox:` (recommended) or call `inkbox.close()` manually to clean up HTTP connections.

---

## Identities

`inkbox.create_identity()` and `inkbox.get_identity()` return an `AgentIdentity` object that holds the identity's channels and exposes convenience methods scoped to those channels.

```python
# Create and fully provision an identity
identity = inkbox.create_identity("sales-bot")
mailbox  = identity.assign_mailbox(display_name="Sales Bot")  # creates + links
phone    = identity.assign_phone_number(type="toll_free")     # provisions + links

print(mailbox.email_address)
print(phone.number)

# Get an existing identity
identity = inkbox.get_identity("sales-bot")
identity.refresh()  # re-fetch channels from API

# List all identities for your org
all_identities = inkbox.list_identities()

# Update status or handle
identity.update(status="paused")
identity.update(new_handle="sales-bot-v2")

# Unlink channels (without deleting them)
identity.unlink_mailbox()
identity.unlink_phone_number()

# Delete
identity.delete()
```

---

## Mail

```python
# Send an email
identity.send_email(
    to=["user@example.com"],
    subject="Hello",
    body_text="Hi there!",
    body_html="<p>Hi there!</p>",
)

# Iterate inbox (paginated automatically)
for msg in identity.messages():
    print(msg.subject, msg.from_address)

# Filter by direction
for msg in identity.messages(direction="inbound"):
    print(msg.subject)
```

---

## Phone

```python
# Place an outbound call
call = identity.place_call(
    to_number="+15167251294",
    stream_url="wss://your-agent.example.com/ws",
)
print(call.status, call.rate_limit.calls_remaining)

# Full-text search across transcripts
results = identity.search_transcripts(q="appointment")
results = identity.search_transcripts(q="refund", party="remote", limit=10)

# List calls
calls = identity.calls()
calls = identity.calls(limit=10, offset=0)

# Fetch transcript segments for a call
segments = identity.transcripts(calls[0].id)
```

---

## Signing Keys

```python
# Create or rotate the org-level webhook signing key (plaintext returned once)
key = inkbox.create_signing_key()
print(key.signing_key)  # save this immediately
```

---

## Verifying Webhook Signatures

Use `verify_webhook` to confirm that an incoming request was sent by Inkbox.

```python
from inkbox import verify_webhook

# FastAPI
@app.post("/hooks/mail")
async def mail_hook(request: Request):
    raw_body = await request.body()
    if not verify_webhook(
        payload=raw_body,
        signature=request.headers["X-Inkbox-Signature"],
        request_id=request.headers["X-Inkbox-Request-ID"],
        timestamp=request.headers["X-Inkbox-Timestamp"],
        secret="whsec_...",
    ):
        raise HTTPException(status_code=403)
    ...

# Flask
@app.post("/hooks/mail")
def mail_hook():
    raw_body = request.get_data()
    if not verify_webhook(
        payload=raw_body,
        signature=request.headers["X-Inkbox-Signature"],
        request_id=request.headers["X-Inkbox-Request-ID"],
        timestamp=request.headers["X-Inkbox-Timestamp"],
        secret="whsec_...",
    ):
        abort(403)
    ...
```

---

## Examples

Runnable example scripts are available in the [examples/python](https://github.com/vectorlyapp/inkbox/tree/main/inkbox/examples/python) directory:

| Script | What it demonstrates |
|---|---|
| `register_agent_identity.py` | Create an identity, assign mailbox + phone number |
| `agent_send_email.py` | Send an email and a threaded reply |
| `read_agent_messages.py` | List messages |
| `create_agent_phone_number.py` | Provision and update a number |
| `read_agent_calls.py` | List calls and print transcripts |

## License

MIT
