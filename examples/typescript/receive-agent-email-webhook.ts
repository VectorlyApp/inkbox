/**
 * Register and delete a webhook on an agent's mailbox.
 *
 * Usage:
 *   INKBOX_API_KEY=ApiKey_... AGENT_HANDLE=sales-agent npx ts-node receive-agent-email-webhook.ts
 */

import { Inkbox } from "../../typescript/src/inkbox.js";

const inkbox = new Inkbox({ apiKey: process.env.INKBOX_API_KEY! });
const identity = await inkbox.getIdentity(process.env.AGENT_HANDLE!);

// Register webhook for agent mailbox
const hook = await inkbox._mailWebhooks.create(identity.mailbox!.id, {
  url: "https://example.com/webhook",
  eventTypes: ["message.received", "message.sent"],
});
console.log(`Registered agent mailbox webhook ${hook.id}  secret=${hook.secret}`);

// List
const all = await inkbox._mailWebhooks.list(identity.mailbox!.id);
console.log(`Active agent mailbox webhooks: ${all.length}`);
for (const w of all) {
  console.log(`  ${w.id}  url=${w.url}  events=${w.eventTypes.join(", ")}`);
}

// Remove agent mailbox webhook
await inkbox._mailWebhooks.delete(identity.mailbox!.id, hook.id);
console.log("Agent mailbox webhook removed.");
