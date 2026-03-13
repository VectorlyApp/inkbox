# Inkbox SDK

Official SDKs for the [Inkbox API](https://inkbox.ai) — API-first communication infrastructure for AI agents (email, phone, identities).

| Package | Language | Install |
|---|---|---|
| [`inkbox`](./python/) | Python ≥ 3.11 | `pip install inkbox` |
| [`@inkbox/sdk`](./typescript/) | TypeScript / Node ≥ 18 | `npm install @inkbox/sdk` |

---

## Identities

Agent identities are the central concept — a named identity (e.g. `"sales-agent"`) that owns a mailbox and/or phone number. Use `Inkbox` as the org-level entry point to create and retrieve identities.

### Python

```python
from inkbox import Inkbox

with Inkbox(api_key="ApiKey_...") as inkbox:
    # Create an identity — returns an AgentIdentity object
    identity = inkbox.create_identity("sales-agent")

    # Create and link new channels
    mailbox = identity.create_mailbox(display_name="Sales Agent")
    phone   = identity.provision_phone_number(type="toll_free")

    print(mailbox.email_address)
    print(phone.number)

    # List, get, update, delete
    identities = inkbox.list_identities()
    identity = inkbox.get_identity("sales-agent")
    identity.update(status="paused")
    identity.delete()
```

### TypeScript

```ts
import { Inkbox } from "@inkbox/sdk";

const inkbox = new Inkbox({ apiKey: "ApiKey_..." });

// Create an identity — returns an AgentIdentity object
const identity = await inkbox.createIdentity("sales-agent");

// Create and link new channels
const mailbox = await identity.createMailbox({ displayName: "Sales Agent" });
const phone   = await identity.provisionPhoneNumber({ type: "toll_free" });

console.log(mailbox.emailAddress);
console.log(phone.number);

// List, get, update, delete
const identities = await inkbox.listIdentities();
const i = await inkbox.getIdentity("sales-agent");
await i.update({ status: "paused" });
await i.delete();
```

---

## Mail

### Python

```python
from inkbox import Inkbox

with Inkbox(api_key="ApiKey_...") as inkbox:
    identity = inkbox.create_identity("sales-agent")
    identity.create_mailbox(display_name="Sales Agent")

    # Send an email
    identity.send_email(
        to=["user@example.com"],
        subject="Hello from Inkbox",
        body_text="Hi there!",
    )

    # Iterate over all messages (pagination handled automatically)
    for msg in identity.messages():
        print(msg.subject, msg.from_address)
```

### TypeScript

```ts
import { Inkbox } from "@inkbox/sdk";

const inkbox = new Inkbox({ apiKey: "ApiKey_..." });
const identity = await inkbox.createIdentity("sales-agent");
await identity.createMailbox({ displayName: "Sales Agent" });

// Send an email
await identity.sendEmail({
  to: ["user@example.com"],
  subject: "Hello from Inkbox",
  bodyText: "Hi there!",
});

// Iterate over all messages (pagination handled automatically)
for await (const msg of identity.messages()) {
  console.log(msg.subject, msg.fromAddress);
}
```

---

## Phone

### Python

```python
from inkbox import Inkbox

with Inkbox(api_key="ApiKey_...") as inkbox:
    identity = inkbox.create_identity("sales-agent")
    identity.provision_phone_number(type="toll_free")

    # Place an outbound call
    call = identity.place_call(
        to_number="+15167251294",
        stream_url="wss://your-agent.example.com/ws",
    )
    print(call.status)
    print(call.rate_limit.calls_remaining)

    # Search transcripts
    results = identity.search_transcripts(q="appointment")

    # List calls
    calls = identity.calls()

    # Fetch transcript segments for a call
    segments = identity.transcripts(calls[0].id)
```

### TypeScript

```ts
import { Inkbox } from "@inkbox/sdk";

const inkbox = new Inkbox({ apiKey: "ApiKey_..." });
const identity = await inkbox.createIdentity("sales-agent");
await identity.provisionPhoneNumber({ type: "toll_free" });

// Place an outbound call
const call = await identity.placeCall({
  toNumber: "+15167251294",
  streamUrl: "wss://your-agent.example.com/ws",
});
console.log(call.status);
console.log(call.rateLimit.callsRemaining);

// Search transcripts
const results = await identity.searchTranscripts({ q: "appointment" });

// List calls
const calls = await identity.calls();

// Fetch transcript segments for a call
const segments = await identity.transcripts(calls[0].id);
```

---

## Signing Keys

Org-level webhook signing keys are managed through the `Inkbox` client.

### Python

```python
from inkbox import Inkbox

with Inkbox(api_key="ApiKey_...") as inkbox:
    # Create or rotate the org-level signing key (plaintext returned once)
    key = inkbox.create_signing_key()
    print(key.signing_key)  # save this
```

### TypeScript

```ts
import { Inkbox } from "@inkbox/sdk";

const inkbox = new Inkbox({ apiKey: "ApiKey_..." });

// Create or rotate the org-level signing key (plaintext returned once)
const key = await inkbox.createSigningKey();
console.log(key.signingKey); // save this
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
    secret="whsec_...",                                      # from create_signing_key()
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
  secret: "whsec_...",                                       // from createSigningKey()
});
```

---

## License

MIT
