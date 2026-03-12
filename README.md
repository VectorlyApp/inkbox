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
from inkbox import Inkbox

with Inkbox(api_key="ApiKey_...") as inkbox:
    # Create an identity — returns an Agent object
    agent = inkbox.identities.create(agent_handle="sales-agent")

    # Provision and link channels in one call each
    mailbox = agent.assign_mailbox(display_name="Sales Agent")
    phone   = agent.assign_phone_number(type="toll_free")

    print(mailbox.email_address)
    print(phone.number)

    # List, get, update, delete
    identities = inkbox.identities.list()
    agent = inkbox.identities.get("sales-agent")
    inkbox.identities.update("sales-agent", status="paused")
    agent.delete()
```

### TypeScript

```ts
import { Inkbox } from "@inkbox/sdk";

const inkbox = new Inkbox({ apiKey: "ApiKey_..." });

// Create an identity — returns an Agent object
const agent = await inkbox.identities.create({ agentHandle: "sales-agent" });

// Provision and link channels in one call each
const mailbox = await agent.assignMailbox({ displayName: "Sales Agent" });
const phone   = await agent.assignPhoneNumber({ type: "toll_free" });

console.log(mailbox.emailAddress);
console.log(phone.number);

// List, get, update, delete
const identities = await inkbox.identities.list();
const a = await inkbox.identities.get("sales-agent");
await inkbox.identities.update("sales-agent", { status: "paused" });
await a.delete();
```

---

## Mail

### Python

```python
from inkbox import Inkbox

with Inkbox(api_key="ApiKey_...") as inkbox:
    # Create a mailbox
    mailbox = inkbox.mailboxes.create(display_name="Sales Agent")

    # Send an email
    inkbox.messages.send(
        mailbox.email_address,
        to=["user@example.com"],
        subject="Hello from Inkbox",
        body_text="Hi there!",
    )

    # Iterate over all messages (pagination handled automatically)
    for msg in inkbox.messages.list(mailbox.email_address):
        print(msg.subject, msg.from_address)

    # Reply to a message
    detail = inkbox.messages.get(mailbox.email_address, msg.id)
    inkbox.messages.send(
        mailbox.email_address,
        to=detail.to_addresses,
        subject=f"Re: {detail.subject}",
        body_text="Got it, thanks!",
        in_reply_to_message_id=detail.message_id,
    )

    # Update mailbox display name
    inkbox.mailboxes.update(mailbox.email_address, display_name="Support Agent")

    # Search
    results = inkbox.mailboxes.search(mailbox.email_address, q="invoice")

    # Webhooks (secret is one-time — save it immediately)
    hook = inkbox.mail_webhooks.create(
        mailbox.email_address,
        url="https://yourapp.com/hooks/mail",
        event_types=["message.received"],
    )
    print(hook.secret)  # save this
```

### TypeScript

```ts
import { Inkbox } from "@inkbox/sdk";

const inkbox = new Inkbox({ apiKey: "ApiKey_..." });

// Create a mailbox
const mailbox = await inkbox.mailboxes.create({ displayName: "Sales Agent" });

// Send an email
await inkbox.messages.send(mailbox.emailAddress, {
  to: ["user@example.com"],
  subject: "Hello from Inkbox",
  bodyText: "Hi there!",
});

// Iterate over all messages (pagination handled automatically)
for await (const msg of inkbox.messages.list(mailbox.emailAddress)) {
  console.log(msg.subject, msg.fromAddress);
}

// Reply to a message
const detail = await inkbox.messages.get(mailbox.emailAddress, msg.id);
await inkbox.messages.send(mailbox.emailAddress, {
  to: detail.toAddresses,
  subject: `Re: ${detail.subject}`,
  bodyText: "Got it, thanks!",
  inReplyToMessageId: detail.messageId,
});

// Update mailbox display name
await inkbox.mailboxes.update(mailbox.emailAddress, { displayName: "Support Agent" });

// Search
const results = await inkbox.mailboxes.search(mailbox.emailAddress, { q: "invoice" });

// Webhooks (secret is one-time — save it immediately)
const hook = await inkbox.mailWebhooks.create(mailbox.emailAddress, {
  url: "https://yourapp.com/hooks/mail",
  eventTypes: ["message.received"],
});
console.log(hook.secret); // save this
```

---

## Phone

### Python

```python
from inkbox import Inkbox

with Inkbox(api_key="ApiKey_...") as inkbox:
    # Provision a phone number
    number = inkbox.numbers.provision(type="toll_free")

    # Update settings
    inkbox.numbers.update(
        number.id,
        incoming_call_action="auto_accept",
        default_stream_url="wss://your-agent.example.com/ws",
    )

    # Place an outbound call
    call = inkbox.calls.place(
        from_number=number.number,
        to_number="+15167251294",
        stream_url="wss://your-agent.example.com/ws",
    )
    print(call.status)
    print(call.rate_limit.calls_remaining)

    # List calls and transcripts
    calls = inkbox.calls.list(number.id)
    transcripts = inkbox.transcripts.list(number.id, calls[0].id)

    # Search transcripts
    results = inkbox.numbers.search_transcripts(number.id, q="appointment")

    # Webhooks
    hook = inkbox.phone_webhooks.create(
        number.id,
        url="https://yourapp.com/hooks/phone",
        event_types=["call.completed"],
    )
    print(hook.secret)  # save this

    # Release a number
    inkbox.numbers.release(number=number.number)
```

### TypeScript

```ts
import { Inkbox } from "@inkbox/sdk";

const inkbox = new Inkbox({ apiKey: "ApiKey_..." });

// Provision a phone number
const number = await inkbox.numbers.provision({ type: "toll_free" });

// Update settings
await inkbox.numbers.update(number.id, {
  incomingCallAction: "auto_accept",
  defaultStreamUrl: "wss://your-agent.example.com/ws",
});

// Place an outbound call
const call = await inkbox.calls.place({
  fromNumber: number.number,
  toNumber: "+15167251294",
  streamUrl: "wss://your-agent.example.com/ws",
});
console.log(call.status);
console.log(call.rateLimit.callsRemaining);

// List calls and transcripts
const calls = await inkbox.calls.list(number.id);
const transcripts = await inkbox.transcripts.list(number.id, calls[0].id);

// Search transcripts
const results = await inkbox.numbers.searchTranscripts(number.id, { q: "appointment" });

// Webhooks
const hook = await inkbox.phoneWebhooks.create(number.id, {
  url: "https://yourapp.com/hooks/phone",
  eventTypes: ["call.completed"],
});
console.log(hook.secret); // save this

// Release a number
await inkbox.numbers.release({ number: number.number });
```

---

## Verifying Webhook Signatures

Use `verify_webhook` / `verifyWebhook` to confirm that an incoming request was sent by Inkbox. The function checks the HMAC-SHA256 signature over `{request_id}.{timestamp}.{body}`.

### Python

```python
from inkbox import verify_webhook

is_valid = verify_webhook(
    payload=raw_body,                                        # bytes
    signature=request.headers["X-Inkbox-Signature"],
    request_id=request.headers["X-Inkbox-Request-ID"],
    timestamp=request.headers["X-Inkbox-Timestamp"],
    secret="whsec_...",                                      # from POST /signing-keys
)
```

### TypeScript

```ts
import { verifyWebhook } from "@inkbox/sdk";

const valid = verifyWebhook({
  payload: req.body,                                         // Buffer or string
  signature: req.headers["x-inkbox-signature"] as string,
  requestId: req.headers["x-inkbox-request-id"] as string,
  timestamp: req.headers["x-inkbox-timestamp"] as string,
  secret: "whsec_...",                                       // from POST /signing-keys
});
```

---

## License

MIT
