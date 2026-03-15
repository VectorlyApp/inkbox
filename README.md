# Inkbox SDK

Official SDKs for the [Inkbox API](https://www.inkbox.ai/docs) — API-first communication infrastructure for AI agents (identities, email, phone).

| Package | Language | Install |
|---|---|---|
| [`inkbox`](./python/) | Python ≥ 3.11 | `pip install inkbox` |
| [`@inkbox/sdk`](./typescript/) | TypeScript / Node ≥ 18 | `npm install @inkbox/sdk` |

---

## Authentication

All SDK calls require an API key. You can obtain one from the [Inkbox Console](https://console.inkbox.ai/).

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

    # Link an existing mailbox or phone number instead of creating new ones
    identity.assign_mailbox("mailbox-uuid-here")
    identity.assign_phone_number("phone-number-uuid-here")

    # Unlink channels without deleting them
    identity.unlink_mailbox()
    identity.unlink_phone_number()

    # List, get, update, delete, refresh
    identities = inkbox.list_identities()
    identity   = inkbox.get_identity("sales-agent")
    identity.update(status="paused")   # or new_handle="new-name"
    identity.refresh()                 # re-fetch from API, updates cached channels
    identity.delete()                  # soft-delete; unlinks channels
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

// Link an existing mailbox or phone number instead of creating new ones
await identity.assignMailbox("mailbox-uuid-here");
await identity.assignPhoneNumber("phone-number-uuid-here");

// Unlink channels without deleting them
await identity.unlinkMailbox();
await identity.unlinkPhoneNumber();

// List, get, update, delete, refresh
const identities = await inkbox.listIdentities();
const i = await inkbox.getIdentity("sales-agent");
await i.update({ status: "paused" });   // or newHandle: "new-name"
await i.refresh();                       // re-fetch from API, updates cached channels
await i.delete();                        // soft-delete; unlinks channels
```

---

## Mail

### Python

```python
from inkbox import Inkbox

with Inkbox(api_key="ApiKey_...") as inkbox:
    identity = inkbox.get_identity("sales-agent")

    # Send an email (plain text and/or HTML)
    sent = identity.send_email(
        to=["user@example.com"],
        subject="Hello from Inkbox",
        body_text="Hi there!",
        body_html="<p>Hi there!</p>",
        cc=["manager@example.com"],
        bcc=["archive@example.com"],
    )

    # Send a threaded reply
    identity.send_email(
        to=["user@example.com"],
        subject=f"Re: {sent.subject}",
        body_text="Following up!",
        in_reply_to_message_id=sent.id,
    )

    # Send with attachments
    identity.send_email(
        to=["user@example.com"],
        subject="See attached",
        body_text="Please find the file attached.",
        attachments=[{
            "filename": "report.pdf",
            "content_type": "application/pdf",
            "content_base64": "<base64-encoded-content>",
        }],
    )

    # Iterate over all messages (pagination handled automatically)
    for msg in identity.iter_emails():
        print(msg.subject, msg.from_address, msg.is_read)

    # Filter by direction: "inbound" or "outbound"
    for msg in identity.iter_emails(direction="inbound"):
        print(msg.subject)

    # Iterate only unread messages
    for msg in identity.iter_unread_emails():
        print(msg.subject)

    # Mark messages as read
    unread_ids = [msg.id for msg in identity.iter_unread_emails()]
    identity.mark_emails_read(unread_ids)

    # Get a full thread (all messages, oldest-first)
    for msg in identity.iter_emails():
        thread = identity.get_thread(msg.thread_id)
        for m in thread.messages:
            print(f"[{m.from_address}] {m.subject}")
        break
```

### TypeScript

```ts
import { Inkbox } from "@inkbox/sdk";

const inkbox = new Inkbox({ apiKey: "ApiKey_..." });
const identity = await inkbox.getIdentity("sales-agent");

// Send an email (plain text and/or HTML)
const sent = await identity.sendEmail({
  to: ["user@example.com"],
  subject: "Hello from Inkbox",
  bodyText: "Hi there!",
  bodyHtml: "<p>Hi there!</p>",
  cc: ["manager@example.com"],
  bcc: ["archive@example.com"],
});

// Send a threaded reply
await identity.sendEmail({
  to: ["user@example.com"],
  subject: `Re: ${sent.subject}`,
  bodyText: "Following up!",
  inReplyToMessageId: sent.id,
});

// Send with attachments
await identity.sendEmail({
  to: ["user@example.com"],
  subject: "See attached",
  bodyText: "Please find the file attached.",
  attachments: [{
    filename: "report.pdf",
    contentType: "application/pdf",
    contentBase64: "<base64-encoded-content>",
  }],
});

// Iterate over all messages (pagination handled automatically)
for await (const msg of identity.iterEmails()) {
  console.log(msg.subject, msg.fromAddress, msg.isRead);
}

// Filter by direction: "inbound" or "outbound"
for await (const msg of identity.iterEmails({ direction: "inbound" })) {
  console.log(msg.subject);
}

// Iterate only unread messages
for await (const msg of identity.iterUnreadEmails()) {
  console.log(msg.subject);
}

// Mark messages as read
const unreadIds: string[] = [];
for await (const msg of identity.iterUnreadEmails()) unreadIds.push(msg.id);
await identity.markEmailsRead(unreadIds);

// Get a full thread (all messages, oldest-first)
for await (const msg of identity.iterEmails()) {
  const thread = await identity.getThread(msg.threadId);
  for (const m of thread.messages) {
    console.log(`[${m.fromAddress}] ${m.subject}`);
  }
  break;
}
```

---

## Phone

### Python

```python
from inkbox import Inkbox

with Inkbox(api_key="ApiKey_...") as inkbox:
    identity = inkbox.get_identity("sales-agent")

    # Place an outbound call — stream audio over WebSocket
    call = identity.place_call(
        to_number="+15167251294",
        client_websocket_url="wss://your-agent.example.com/ws",
    )
    print(call.status)
    print(call.rate_limit.calls_remaining)

    # Or receive call events via webhook instead
    call = identity.place_call(
        to_number="+15167251294",
        webhook_url="https://your-agent.example.com/call-events",
    )

    # List calls (paginated)
    calls = identity.list_calls(limit=10, offset=0)
    for call in calls:
        print(call.id, call.direction, call.remote_phone_number, call.status)

    # Fetch transcript segments for a call
    segments = identity.list_transcripts(calls[0].id)
    for t in segments:
        print(f"[{t.party}] {t.text}")  # party: "local" or "remote"
```

### TypeScript

```ts
import { Inkbox } from "@inkbox/sdk";

const inkbox = new Inkbox({ apiKey: "ApiKey_..." });
const identity = await inkbox.getIdentity("sales-agent");

// Place an outbound call — stream audio over WebSocket
const call = await identity.placeCall({
  toNumber: "+15167251294",
  clientWebsocketUrl: "wss://your-agent.example.com/ws",
});
console.log(call.status);
console.log(call.rateLimit.callsRemaining);

// Or receive call events via webhook instead
const call2 = await identity.placeCall({
  toNumber: "+15167251294",
  webhookUrl: "https://your-agent.example.com/call-events",
});

// List calls (paginated)
const calls = await identity.listCalls({ limit: 10, offset: 0 });
for (const c of calls) {
  console.log(c.id, c.direction, c.remotePhoneNumber, c.status);
}

// Fetch transcript segments for a call
const segments = await identity.listTranscripts(calls[0].id);
for (const t of segments) {
  console.log(`[${t.party}] ${t.text}`);  // party: "local" or "remote"
}
```

---

## Org-level mailboxes

Manage mailboxes directly without going through an identity. Access via `inkbox.mailboxes`.

### Python

```python
from inkbox import Inkbox

with Inkbox(api_key="ApiKey_...") as inkbox:
    # List all mailboxes in the organisation
    mailboxes = inkbox.mailboxes.list()

    # Get a specific mailbox
    mailbox = inkbox.mailboxes.get("abc-xyz@inkboxmail.com")

    # Create a mailbox linked to an agent identity
    mailbox = inkbox.mailboxes.create(agent_handle="support-agent", display_name="Support Inbox")
    print(mailbox.email_address)

    # Update display name or webhook URL
    inkbox.mailboxes.update(mailbox.email_address, display_name="New Name")
    inkbox.mailboxes.update(mailbox.email_address, webhook_url="https://example.com/hook")
    inkbox.mailboxes.update(mailbox.email_address, webhook_url=None)  # remove webhook

    # Full-text search across messages in a mailbox
    results = inkbox.mailboxes.search(mailbox.email_address, q="invoice", limit=20)
    for msg in results:
        print(msg.subject, msg.from_address)

    # Delete a mailbox
    inkbox.mailboxes.delete(mailbox.email_address)
```

### TypeScript

```ts
import { Inkbox } from "@inkbox/sdk";

const inkbox = new Inkbox({ apiKey: "ApiKey_..." });

// List all mailboxes in the organisation
const mailboxes = await inkbox.mailboxes.list();

// Get a specific mailbox
const mailbox = await inkbox.mailboxes.get("abc-xyz@inkboxmail.com");

// Create a mailbox linked to an agent identity
const mb = await inkbox.mailboxes.create({ agentHandle: "support-agent", displayName: "Support Inbox" });
console.log(mb.emailAddress);

// Update display name or webhook URL
await inkbox.mailboxes.update(mb.emailAddress, { displayName: "New Name" });
await inkbox.mailboxes.update(mb.emailAddress, { webhookUrl: "https://example.com/hook" });
await inkbox.mailboxes.update(mb.emailAddress, { webhookUrl: null }); // remove webhook

// Full-text search across messages in a mailbox
const results = await inkbox.mailboxes.search(mb.emailAddress, { q: "invoice", limit: 20 });
for (const msg of results) {
  console.log(msg.subject, msg.fromAddress);
}

// Delete a mailbox
await inkbox.mailboxes.delete(mb.emailAddress);
```

---

## Org-level phone numbers

Manage phone numbers directly without going through an identity. Access via `inkbox.phone_numbers` (Python) / `inkbox.phoneNumbers` (TypeScript).

### Python

```python
from inkbox import Inkbox

with Inkbox(api_key="ApiKey_...") as inkbox:
    # List all phone numbers in the organisation
    numbers = inkbox.phone_numbers.list()

    # Get a specific phone number by ID
    number = inkbox.phone_numbers.get("phone-number-uuid")

    # Provision a new number
    number = inkbox.phone_numbers.provision(type="toll_free")
    local  = inkbox.phone_numbers.provision(type="local", state="NY")

    # Update incoming call behaviour
    inkbox.phone_numbers.update(
        number.id,
        incoming_call_action="webhook",
        incoming_call_webhook_url="https://example.com/calls",
    )
    inkbox.phone_numbers.update(
        number.id,
        incoming_call_action="auto_accept",
        client_websocket_url="wss://example.com/ws",
    )

    # Full-text search across transcripts
    hits = inkbox.phone_numbers.search_transcripts(number.id, q="refund", party="remote")
    for t in hits:
        print(f"[{t.party}] {t.text}")

    # Release a number
    inkbox.phone_numbers.release(number=number.number)
```

### TypeScript

```ts
import { Inkbox } from "@inkbox/sdk";

const inkbox = new Inkbox({ apiKey: "ApiKey_..." });

// List all phone numbers in the organisation
const numbers = await inkbox.phoneNumbers.list();

// Get a specific phone number by ID
const number = await inkbox.phoneNumbers.get("phone-number-uuid");

// Provision a new number
const num   = await inkbox.phoneNumbers.provision({ type: "toll_free" });
const local = await inkbox.phoneNumbers.provision({ type: "local", state: "NY" });

// Update incoming call behaviour
await inkbox.phoneNumbers.update(num.id, {
  incomingCallAction: "webhook",
  incomingCallWebhookUrl: "https://example.com/calls",
});
await inkbox.phoneNumbers.update(num.id, {
  incomingCallAction: "auto_accept",
  clientWebsocketUrl: "wss://example.com/ws",
});

// Full-text search across transcripts
const hits = await inkbox.phoneNumbers.searchTranscripts(num.id, { q: "refund", party: "remote" });
for (const t of hits) {
  console.log(`[${t.party}] ${t.text}`);
}

// Release a number
await inkbox.phoneNumbers.release({ number: num.number });
```

---

## Webhooks

Webhooks are configured on the mailbox or phone number resource — no separate registration step.

### Mailbox webhooks

Set a URL on a mailbox to receive `message.received` and `message.sent` events.

```python
# Python
inkbox.mailboxes.update("abc@inkboxmail.com", webhook_url="https://example.com/hook")
# Remove:
inkbox.mailboxes.update("abc@inkboxmail.com", webhook_url=None)
```

```ts
// TypeScript
await inkbox.mailboxes.update("abc@inkboxmail.com", { webhookUrl: "https://example.com/hook" });
// Remove:
await inkbox.mailboxes.update("abc@inkboxmail.com", { webhookUrl: null });
```

### Phone webhooks

Set an incoming call webhook URL and action on a phone number.

```python
# Python — route incoming calls to a webhook
inkbox.phone_numbers.update(
    number.id,
    incoming_call_action="webhook",
    incoming_call_webhook_url="https://example.com/calls",
)
```

```ts
// TypeScript — route incoming calls to a webhook
await inkbox.phoneNumbers.update(number.id, {
  incomingCallAction: "webhook",
  incomingCallWebhookUrl: "https://example.com/calls",
});
```

You can also supply a per-call webhook URL when placing a call:

```python
# Python
identity.place_call(to_number="+15005550006", webhook_url="https://example.com/call-events")
```

```ts
// TypeScript
await identity.placeCall({ toNumber: "+15005550006", webhookUrl: "https://example.com/call-events" });
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
