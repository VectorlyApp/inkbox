# @inkbox/sdk

TypeScript SDK for the [Inkbox API](https://inkbox.ai) — API-first communication infrastructure for AI agents (email, phone, identities).

## Install

```bash
npm install @inkbox/sdk
```

Requires Node.js ≥ 18.

## Authentication

Pass your API key when constructing a client, or load it from an environment variable:

```ts
import { InkboxMail } from "@inkbox/sdk";

const client = new InkboxMail({ apiKey: process.env.INKBOX_API_KEY! });
```

All three clients accept the same options:

| Option | Type | Default | Description |
|---|---|---|---|
| `apiKey` | `string` | required | Your `ApiKey_...` token |
| `baseUrl` | `string` | API default | Override for self-hosting or testing |
| `timeoutMs` | `number` | `30000` | Request timeout in milliseconds |

---

## Identities

Agent identities are the central concept — a named agent (e.g. `"sales-agent"`) that owns a mailbox and/or phone number.

```ts
import { InkboxIdentities } from "@inkbox/sdk/identities";

const client = new InkboxIdentities({ apiKey: "ApiKey_..." });

// Create an identity
const identity = await client.identities.create({ agentHandle: "sales-agent" });
console.log(identity.agentHandle, identity.id);

// Assign communication channels (mailbox / phone number must already exist)
const withMailbox = await client.identities.assignMailbox("sales-agent", {
  mailboxId: "<mailbox-uuid>",
});
console.log(withMailbox.mailbox?.emailAddress);

const withPhone = await client.identities.assignPhoneNumber("sales-agent", {
  phoneNumberId: "<phone-number-uuid>",
});
console.log(withPhone.phoneNumber?.number);

// List all identities
const all = await client.identities.list();
for (const ident of all) {
  console.log(ident.agentHandle, ident.status);
}

// Get, update, delete
const detail = await client.identities.get("sales-agent");
await client.identities.update("sales-agent", { status: "paused" });
await client.identities.delete("sales-agent");
```

---

## Mail

```ts
import { InkboxMail } from "@inkbox/sdk";
```

### Mailboxes

```ts
// Create a mailbox (agent identity must already exist)
const mailbox = await client.mailboxes.create({
  agentHandle: "sales-agent",
  displayName: "Sales Agent",
});
console.log(mailbox.emailAddress);

// List all mailboxes
const all = await client.mailboxes.list();
for (const m of all) {
  console.log(m.emailAddress, m.status);
}

// Update display name
await client.mailboxes.update(mailbox.emailAddress, { displayName: "Sales Agent (updated)" });

// Full-text search across messages
const results = await client.mailboxes.search(mailbox.emailAddress, { q: "invoice" });

// Delete
await client.mailboxes.delete(mailbox.emailAddress);
```

### Sending email

```ts
// Send an outbound email
const sent = await client.messages.send(mailbox.emailAddress, {
  to: ["recipient@example.com"],
  subject: "Hello from your AI agent",
  bodyText: "Hi there!",
  bodyHtml: "<p>Hi there!</p>",
});

// Reply in a thread (pass the original message's RFC Message-ID)
const reply = await client.messages.send(mailbox.emailAddress, {
  to: ["recipient@example.com"],
  subject: `Re: ${sent.subject}`,
  bodyText: "Following up.",
  inReplyToMessageId: sent.messageId,
});
```

### Reading messages and threads

```ts
// Iterate over all messages (pagination handled automatically)
for await (const msg of client.messages.list(mailbox.emailAddress)) {
  console.log(msg.subject, msg.fromAddress, msg.direction);
}

// Fetch full message body
const detail = await client.messages.get(mailbox.emailAddress, msg.id);
console.log(detail.bodyText);

// List threads
for await (const thread of client.threads.list(mailbox.emailAddress)) {
  console.log(thread.subject, thread.messageCount);
}

// Fetch full thread with all messages
const threadDetail = await client.threads.get(mailbox.emailAddress, thread.id);
for (const msg of threadDetail.messages) {
  console.log(`[${msg.direction}] ${msg.fromAddress}: ${msg.snippet}`);
}
```

### Webhooks

```ts
// Register a webhook (secret is one-time — save it immediately)
const hook = await client.webhooks.create(mailbox.emailAddress, {
  url: "https://yourapp.com/hooks/mail",
  eventTypes: ["message.received", "message.sent"],
});
console.log(hook.secret); // save this — it will not be shown again

// List and delete
const hooks = await client.webhooks.list(mailbox.emailAddress);
await client.webhooks.delete(mailbox.emailAddress, hook.id);
```

---

## Phone

```ts
import { InkboxPhone } from "@inkbox/sdk/phone";
```

### Provisioning numbers

```ts
// Provision a toll-free number
const number = await client.numbers.provision({
  agentHandle: "sales-agent",
  type: "toll_free",
});
console.log(number.number, number.status);

// Provision a local number in a specific state
const local = await client.numbers.provision({
  agentHandle: "sales-agent",
  type: "local",
  state: "NY",
});

// List all numbers
const all = await client.numbers.list();
for (const n of all) {
  console.log(n.number, n.type, n.status);
}

// Update settings
await client.numbers.update(number.id, {
  incomingCallAction: "auto_accept",
  clientWebsocketUrl: "wss://your-agent.example.com/ws",
});

// Release a number
await client.numbers.release(number.id);
```

### Placing calls

```ts
// Place an outbound call
const call = await client.calls.place({
  fromNumber: number.number,
  toNumber: "+15167251294",
  clientWebsocketUrl: "wss://your-agent.example.com/ws",
});
console.log(call.status);
console.log(call.rateLimit.callsRemaining);
```

### Reading calls and transcripts

```ts
// List recent calls for a number
const calls = await client.calls.list(number.id, { limit: 10 });
for (const call of calls) {
  console.log(call.id, call.direction, call.remotePhoneNumber, call.status);
}

// Read transcript for a call
const transcripts = await client.transcripts.list(number.id, call.id);
for (const t of transcripts) {
  console.log(`[${t.party}] ${t.text}`);
}

// Full-text search across all transcripts for a number
const results = await client.numbers.searchTranscripts(number.id, { q: "appointment" });
```

### Webhooks

```ts
// Register a webhook (secret is one-time — save it immediately)
const hook = await client.webhooks.create(number.id, {
  url: "https://yourapp.com/hooks/phone",
  eventTypes: ["call.completed"],
});
console.log(hook.secret); // save this — it will not be shown again

// List and delete
const hooks = await client.webhooks.list(number.id);
await client.webhooks.delete(number.id, hook.id);
```

---

## Examples

Runnable example scripts are available in the [examples/typescript](https://github.com/vectorlyapp/inkbox/tree/main/inkbox/examples/typescript) directory:

| Script | What it demonstrates |
|---|---|
| `register-agent-identity.ts` | Create an identity and assign mailbox / phone number |
| `create-agent-mailbox.ts` | Create, update, search, and delete a mailbox |
| `agent-send-email.ts` | Send an email and a threaded reply |
| `read-agent-messages.ts` | List messages and read full threads |
| `create-agent-phone-number.ts` | Provision, update, and release a number |
| `list-agent-phone-numbers.ts` | List all provisioned numbers |
| `read-agent-calls.ts` | List calls and print transcripts |
| `receive-agent-email-webhook.ts` | Register, list, and delete email webhooks |
| `receive-agent-call-webhook.ts` | Register, list, and delete phone webhooks |

## License

MIT
