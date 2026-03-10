# Inkbox Mail SDK

Official SDKs for the [Inkbox Mail API](https://inkbox.ai) — API-first email for AI agents.

| Package | Language | Install |
|---|---|---|
| [`inkbox`](./python/) | Python ≥ 3.11 | `pip install inkbox` |
| [`@inkbox/sdk`](./typescript/) | TypeScript / Node ≥ 18 | `npm install @inkbox/sdk` |

---

## Python

```python
from inkbox.mail import InkboxMail

with InkboxMail(api_key="sk-...") as client:

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

## TypeScript

```ts
import { InkboxMail } from "@inkbox/sdk";

const client = new InkboxMail({ apiKey: "sk-..." });

// Create a mailbox
const mailbox = await client.mailboxes.create({ displayName: "Agent 01" });

// Send an email
await client.messages.send(mailbox.id, {
  to: ["user@example.com"],
  subject: "Hello from Inkbox",
  bodyText: "Hi there!",
});

// Iterate over all messages (pagination handled automatically)
for await (const msg of client.messages.list(mailbox.id)) {
  console.log(msg.subject, msg.fromAddress);
}

// Search
const results = await client.mailboxes.search(mailbox.id, { q: "invoice" });

// Webhooks (secret is one-time — save it immediately)
const hook = await client.webhooks.create(mailbox.id, {
  url: "https://yourapp.com/hooks/mail",
  eventTypes: ["message.received"],
});
console.log(hook.secret); // save this
```

---

## License

MIT
