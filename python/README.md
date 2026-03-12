# inkbox

Python SDK for the [Inkbox Mail API](https://inkbox.ai) — API-first email for AI agents.

## Install

```bash
pip install inkbox
```

## Usage

```python
from inkbox.mail import InkboxMail

client = InkboxMail(api_key="ApiKey_...")

# Create a mailbox
mailbox = client.mailboxes.create(display_name="Agent 01")

# Send an email
client.messages.send(
    mailbox.id,
    to=["user@example.com"],
    subject="Hello from Inkbox",
    body_text="Hi there!",
)

# Iterate over all messages (pagination handled automatically)
for msg in client.messages.list(mailbox.id):
    print(msg.subject, msg.from_address)

# Reply to a message
detail = client.messages.get(mailbox.id, msg.id)
client.messages.send(
    mailbox.id,
    to=detail.to_addresses,
    subject=f"Re: {detail.subject}",
    body_text="Got it, thanks!",
    in_reply_to_message_id=detail.message_id,
)

# Search
results = client.mailboxes.search(mailbox.id, q="invoice")

# Webhooks (secret is one-time — save it immediately)
hook = client.webhooks.create(
    mailbox.id,
    url="https://yourapp.com/hooks/mail",
    event_types=["message.received"],
)
print(hook.secret)  # save this
```

## Requirements

- Python ≥ 3.11

## License

MIT
