/**
 * Create, update, and delete a webhook on an agent's phone number.
 *
 * Usage:
 *   INKBOX_API_KEY=ApiKey_... AGENT_HANDLE=sales-agent npx ts-node receive-agent-call-webhook.ts
 */

import { Inkbox } from "../../typescript/src/inkbox.js";

const inkbox = new Inkbox({ apiKey: process.env.INKBOX_API_KEY! });
const identity = await inkbox.getIdentity(process.env.AGENT_HANDLE!);

// Register webhook for agent phone number
const hook = await inkbox._phoneWebhooks.create(identity.phoneNumber!.id, {
  url: "https://example.com/webhook",
  eventTypes: ["incoming_call"],
});
console.log(`Registered agent phone webhook ${hook.id}  secret=${hook.secret}`);

// Update agent phone webhook
const updated = await inkbox._phoneWebhooks.update(identity.phoneNumber!.id, hook.id, {
  url: "https://example.com/webhook-v2",
});
console.log(`Updated URL: ${updated.url}`);

// Remove agent phone webhook
await inkbox._phoneWebhooks.delete(identity.phoneNumber!.id, hook.id);
console.log("Agent phone webhook removed.");
