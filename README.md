# Inkbox Mail SDK

Official SDKs for the [Inkbox Mail API](https://inkbox.ai) — API-first email for AI agents.

| Package | Language | Install |
|---|---|---|
| [`inkbox-mail`](./python/) | Python ≥ 3.11 | `pip install inkbox-mail` |
| [`@inkbox/mail`](./typescript/) | TypeScript / Node ≥ 18 | `npm install @inkbox/mail` |

---

## Python

```python
import asyncio
from inkbox_mail import InkboxMail

async def main():
    async with InkboxMail(api_key="sk-...") as client:

        # Create a mailbox
        mailbox = await client.mailboxes.create(address_local_part="agent-01")

        # Send an email
        await client.messages.send(
            mailbox.id,
            to=["user@example.com"],
            subject="Hello from Inkbox",
            body_text="Hi there!",
        )

        # Iterate over all messages (pagination handled automatically)
        async for msg in client.messages.list(mailbox.id):
            print(msg.subject, msg.from_address)

        # Reply to a message
        detail = await client.messages.get(mailbox.id, msg.id)
        await client.messages.send(
            mailbox.id,
            to=detail.to_addresses,
            subject=f"Re: {detail.subject}",
            body_text="Got it, thanks!",
            in_reply_to_message_id=detail.message_id,
        )

        # Search
        results = await client.mailboxes.search(mailbox.id, q="invoice")

        # Webhooks
        hook = await client.webhooks.create(
            mailbox.id,
            url="https://yourapp.com/hooks/mail",
            event_types=["message.received"],
        )

asyncio.run(main())
```

## TypeScript

```ts
import { InkboxMail } from "@inkbox/mail";

const client = new InkboxMail({ apiKey: "sk-..." });

// Create a mailbox
const mailbox = await client.mailboxes.create({ addressLocalPart: "agent-01" });

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

// Webhooks
const hook = await client.webhooks.create(mailbox.id, {
  url: "https://yourapp.com/hooks/mail",
  eventTypes: ["message.received"],
});
```

---

## License

MIT
