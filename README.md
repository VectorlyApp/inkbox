# Inkbox SDK

Official SDKs for the [Inkbox API](https://inkbox.ai) — API-first communication infrastructure for AI agents (email, phone, identities).

| Package | Language | Install |
|---|---|---|
| [`inkbox`](./python/) | Python ≥ 3.11 | `pip install inkbox` |
| [`@inkbox/sdk`](./typescript/) | TypeScript / Node ≥ 18 | `npm install @inkbox/sdk` |

---

## Identities

Agent identities are the central concept — a named agent (e.g. `"sales-agent"`) that owns a mailbox and/or phone number.

### Python

```python
from inkbox.identities import InkboxIdentities

with InkboxIdentities(api_key="ApiKey_...") as client:

    # Create an identity
    identity = client.identities.create(agent_handle="sales-agent")

    # Assign channels (mailbox / phone number must already exist)
    detail = client.identities.assign_mailbox(
        "sales-agent", mailbox_id="<mailbox-uuid>"
    )
    detail = client.identities.assign_phone_number(
        "sales-agent", phone_number_id="<phone-number-uuid>"
    )

    print(detail.mailbox.email_address)
    print(detail.phone_number.number)

    # List, get, update, delete
    identities = client.identities.list()
    detail = client.identities.get("sales-agent")
    client.identities.update("sales-agent", status="paused")
    client.identities.delete("sales-agent")
```

### TypeScript

```ts
import { InkboxIdentities } from "@inkbox/sdk/identities";

const client = new InkboxIdentities({ apiKey: "ApiKey_..." });

// Create an identity
const identity = await client.identities.create({ agentHandle: "sales-agent" });

// Assign channels
const detail = await client.identities.assignMailbox("sales-agent", {
  mailboxId: "<mailbox-uuid>",
});
console.log(detail.mailbox?.emailAddress);

// List, get, update, delete
const identities = await client.identities.list();
const d = await client.identities.get("sales-agent");
await client.identities.update("sales-agent", { status: "paused" });
await client.identities.delete("sales-agent");
```

---

## Mail

### Python

```python
from inkbox.mail import InkboxMail

with InkboxMail(api_key="ApiKey_...") as client:

    # Create a mailbox (agent identity must already exist)
    mailbox = client.mailboxes.create(
        agent_handle="sales-agent",
        display_name="Sales Agent",
    )

    # Send an email
    client.messages.send(
        mailbox.email_address,
        to=["user@example.com"],
        subject="Hello from Inkbox",
        body_text="Hi there!",
    )

    # Iterate over all messages (pagination handled automatically)
    for msg in client.messages.list(mailbox.email_address):
        print(msg.subject, msg.from_address)

    # Reply to a message
    detail = client.messages.get(mailbox.email_address, msg.id)
    client.messages.send(
        mailbox.email_address,
        to=detail.to_addresses,
        subject=f"Re: {detail.subject}",
        body_text="Got it, thanks!",
        in_reply_to_message_id=detail.message_id,
    )

    # Update mailbox display name
    client.mailboxes.update(mailbox.email_address, display_name="Support Agent")

    # Search
    results = client.mailboxes.search(mailbox.email_address, q="invoice")

    # Webhooks (secret is one-time — save it immediately)
    hook = client.webhooks.create(
        mailbox.email_address,
        url="https://yourapp.com/hooks/mail",
        event_types=["message.received"],
    )
    print(hook.secret)  # save this
```

### TypeScript

```ts
import { InkboxMail } from "@inkbox/sdk";

const client = new InkboxMail({ apiKey: "ApiKey_..." });

// Create a mailbox (agent identity must already exist)
const mailbox = await client.mailboxes.create({
  agentHandle: "sales-agent",
  displayName: "Sales Agent",
});

// Send an email
await client.messages.send(mailbox.emailAddress, {
  to: ["user@example.com"],
  subject: "Hello from Inkbox",
  bodyText: "Hi there!",
});

// Iterate over all messages (pagination handled automatically)
for await (const msg of client.messages.list(mailbox.emailAddress)) {
  console.log(msg.subject, msg.fromAddress);
}

// Update mailbox display name
await client.mailboxes.update(mailbox.emailAddress, { displayName: "Support Agent" });

// Search
const results = await client.mailboxes.search(mailbox.emailAddress, { q: "invoice" });

// Webhooks (secret is one-time — save it immediately)
const hook = await client.webhooks.create(mailbox.emailAddress, {
  url: "https://yourapp.com/hooks/mail",
  eventTypes: ["message.received"],
});
console.log(hook.secret); // save this
```

---

## Phone

### Python

```python
from inkbox.phone import InkboxPhone

with InkboxPhone(api_key="ApiKey_...") as client:

    # Provision a phone number (agent identity must already exist)
    number = client.numbers.provision(
        agent_handle="sales-agent",
        type="toll_free",
    )

    # Update settings
    client.numbers.update(
        number.id,
        incoming_call_action="auto_accept",
        client_websocket_url="wss://your-agent.example.com/ws",
    )

    # Place an outbound call
    call = client.calls.place(
        from_number=number.number,
        to_number="+15167251294",
        client_websocket_url="wss://your-agent.example.com/ws",
    )
    print(call.status)
    print(call.rate_limit.calls_remaining)

    # List calls and transcripts
    calls = client.calls.list(number.id)
    transcripts = client.transcripts.list(number.id, calls[0].id)

    # Search transcripts
    results = client.numbers.search_transcripts(number.id, q="appointment")

    # Webhooks
    hook = client.webhooks.create(
        number.id,
        url="https://yourapp.com/hooks/phone",
        event_types=["call.completed"],
    )
    print(hook.secret)  # save this

    # Release a number
    client.numbers.release(number.id)
```

### TypeScript

```ts
import { InkboxPhone } from "@inkbox/sdk/phone";

const client = new InkboxPhone({ apiKey: "ApiKey_..." });

// Provision a phone number (agent identity must already exist)
const number = await client.numbers.provision({
  agentHandle: "sales-agent",
  type: "toll_free",
});

// Update settings
await client.numbers.update(number.id, {
  incomingCallAction: "auto_accept",
  clientWebsocketUrl: "wss://your-agent.example.com/ws",
});

// Place an outbound call
const call = await client.calls.place({
  fromNumber: number.number,
  toNumber: "+15167251294",
  clientWebsocketUrl: "wss://your-agent.example.com/ws",
});
console.log(call.status);
console.log(call.rateLimit.callsRemaining);

// List calls and transcripts
const calls = await client.calls.list(number.id);
const transcripts = await client.transcripts.list(number.id, calls[0].id);

// Search transcripts
const results = await client.numbers.searchTranscripts(number.id, { q: "appointment" });

// Webhooks
const hook = await client.webhooks.create(number.id, {
  url: "https://yourapp.com/hooks/phone",
  eventTypes: ["call.completed"],
});
console.log(hook.secret); // save this

// Release a number
await client.numbers.release(number.id);
```

---

## License

MIT
