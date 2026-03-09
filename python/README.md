# inkbox

Python SDK for the [Inkbox Mail API](https://inkbox.ai) — API-first email for AI agents.

## Install

```bash
pip install inkbox
```

## Usage

```python
import asyncio
from inkbox.mail import InkboxMail

async def main():
    async with InkboxMail(api_key="sk-...") as client:

        # Create a mailbox
        mailbox = await client.mailboxes.create(display_name="Agent 01")

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

        # Webhooks (secret is one-time — save it immediately)
        hook = await client.webhooks.create(
            mailbox.id,
            url="https://yourapp.com/hooks/mail",
            event_types=["message.received"],
        )
        print(hook.secret)  # save this

asyncio.run(main())
```

## Requirements

- Python ≥ 3.11

## License

MIT
