# @inkbox/sdk

TypeScript SDK for the [Inkbox API](https://inkbox.ai) — API-first communication infrastructure for AI agents (email, phone, identities).

## Install

```bash
npm install @inkbox/sdk
```

Requires Node.js ≥ 18.

## Quick start

```ts
import { Inkbox } from "@inkbox/sdk";

const inkbox = new Inkbox({ apiKey: process.env.INKBOX_API_KEY! });

// Create an agent identity
const agent = await inkbox.identities.create({ agentHandle: "support-bot" });

// Provision and link channels in one call each
const mailbox = await agent.assignMailbox({ displayName: "Support Bot" });
const phone   = await agent.assignPhoneNumber({ type: "toll_free" });

// Send email directly from the agent
await agent.sendEmail({
  to: ["customer@example.com"],
  subject: "Your order has shipped",
  bodyText: "Tracking number: 1Z999AA10123456784",
});

// Place an outbound call
await agent.placeCall({
  toNumber: "+18005559999",
  streamUrl: "wss://my-app.com/voice",
});

// Read inbox
for await (const message of agent.messages()) {
  console.log(message.subject);
}

// Search transcripts
const transcripts = await agent.searchTranscripts({ q: "refund" });
```

## Authentication

| Option | Type | Default | Description |
|---|---|---|---|
| `apiKey` | `string` | required | Your `ApiKey_...` token |
| `baseUrl` | `string` | API default | Override for self-hosting or testing |
| `timeoutMs` | `number` | `30000` | Request timeout in milliseconds |

---

## Identities & Agent object

`inkbox.identities.create()` and `inkbox.identities.get()` return an `Agent` object that holds the agent's channels and exposes convenience methods scoped to those channels.

```ts
// Create and fully provision an agent
const agent   = await inkbox.identities.create({ agentHandle: "sales-bot" });
const mailbox = await agent.assignMailbox({ displayName: "Sales Bot" });  // creates + links
const phone   = await agent.assignPhoneNumber({ type: "toll_free" });     // provisions + links

console.log(mailbox.emailAddress);
console.log(phone.number);

// Get an existing agent
const agent2 = await inkbox.identities.get("sales-bot");
await agent2.refresh();  // re-fetch channels from API

// List / update / delete
const allIdentities = await inkbox.identities.list();
await inkbox.identities.update("sales-bot", { status: "paused" });
await agent.delete();
```

---

## Mail

### Sending email

```ts
// Via agent (no email address needed)
await agent.sendEmail({
  to: ["user@example.com"],
  subject: "Hello",
  bodyText: "Hi there!",
  bodyHtml: "<p>Hi there!</p>",
});

// Via flat namespace (useful when you have a mailbox address directly)
await inkbox.messages.send("agent@inkboxmail.com", {
  to: ["user@example.com"],
  subject: "Hello",
  bodyText: "Hi there!",
});
```

### Reading messages and threads

```ts
// Via agent — iterates inbox automatically (paginated)
for await (const msg of agent.messages()) {
  console.log(msg.subject, msg.fromAddress);
}

// Full message body
const detail = await inkbox.messages.get(mailbox.emailAddress, msg.id);
console.log(detail.bodyText);

// Threads
for await (const thread of inkbox.threads.list(mailbox.emailAddress)) {
  console.log(thread.subject, thread.messageCount);
}

const threadDetail = await inkbox.threads.get(mailbox.emailAddress, thread.id);
for (const msg of threadDetail.messages) {
  console.log(`[${msg.direction}] ${msg.fromAddress}: ${msg.snippet}`);
}
```

### Mailboxes

```ts
const mailbox = await inkbox.mailboxes.create({ displayName: "Sales Agent" });
const allMailboxes = await inkbox.mailboxes.list();
await inkbox.mailboxes.update(mailbox.emailAddress, { displayName: "Sales Agent v2" });
const results = await inkbox.mailboxes.search(mailbox.emailAddress, { q: "invoice" });
await inkbox.mailboxes.delete(mailbox.emailAddress);
```

### Webhooks

```ts
// Secret is one-time — save it immediately
const hook = await inkbox.mailWebhooks.create(mailbox.emailAddress, {
  url: "https://yourapp.com/hooks/mail",
  eventTypes: ["message.received", "message.sent"],
});
console.log(hook.secret);

const hooks = await inkbox.mailWebhooks.list(mailbox.emailAddress);
await inkbox.mailWebhooks.delete(mailbox.emailAddress, hook.id);
```

---

## Phone

### Provisioning numbers

```ts
const number = await inkbox.numbers.provision({ type: "toll_free" });
const local  = await inkbox.numbers.provision({ type: "local", state: "NY" });

const allNumbers = await inkbox.numbers.list();
await inkbox.numbers.update(number.id, {
  incomingCallAction: "auto_accept",
  defaultStreamUrl: "wss://your-agent.example.com/ws",
});
await inkbox.numbers.release({ number: number.number });
```

### Placing calls

```ts
// Via agent (fromNumber is automatic)
const call = await agent.placeCall({
  toNumber: "+15167251294",
  streamUrl: "wss://your-agent.example.com/ws",
});

// Via flat namespace
const call2 = await inkbox.calls.place({
  fromNumber: number.number,
  toNumber: "+15167251294",
  streamUrl: "wss://your-agent.example.com/ws",
});
console.log(call2.status, call2.rateLimit.callsRemaining);
```

### Reading calls and transcripts

```ts
const calls = await inkbox.calls.list(number.id, { limit: 10 });
const transcripts = await inkbox.transcripts.list(number.id, calls[0].id);

// Full-text search via agent
const results = await agent.searchTranscripts({ q: "appointment" });

// Or flat namespace
const results2 = await inkbox.numbers.searchTranscripts(number.id, { q: "appointment" });
```

### Webhooks

```ts
const hook = await inkbox.phoneWebhooks.create(number.id, {
  url: "https://yourapp.com/hooks/phone",
  eventTypes: ["call.completed"],
});
console.log(hook.secret);

const hooks = await inkbox.phoneWebhooks.list(number.id);
await inkbox.phoneWebhooks.update(number.id, hook.id, { url: "https://yourapp.com/hooks/phone-v2" });
await inkbox.phoneWebhooks.delete(number.id, hook.id);
```

---

## Examples

Runnable example scripts are available in the [examples/typescript](https://github.com/vectorlyapp/inkbox/tree/main/inkbox/examples/typescript) directory:

| Script | What it demonstrates |
|---|---|
| `register-agent-identity.ts` | Create an identity, assign mailbox + phone number via Agent |
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
