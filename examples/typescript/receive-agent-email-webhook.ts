/**
 * Register and delete a webhook on a mailbox.
 *
 * Usage:
 *   INKBOX_API_KEY=ApiKey_... MAILBOX_ADDRESS=agent@inkboxmail.com npx ts-node receive-agent-email-webhook.ts
 */

import { Inkbox } from "../../typescript/src/inkbox.js";

const inkbox = new Inkbox({ apiKey: process.env.INKBOX_API_KEY! });
const mailboxAddress = process.env.MAILBOX_ADDRESS!;

// Register webhook for agent mailbox
const hook = await inkbox.mailWebhooks.create(mailboxAddress, {
  url: "https://example.com/webhook",
  eventTypes: ["message.received", "message.sent"],
});
console.log(`Registered agent mailbox webhook ${hook.id}  secret=${hook.secret}`);

// List
const all = await inkbox.mailWebhooks.list(mailboxAddress);
console.log(`Active agent mailbox webhooks: ${all.length}`);
for (const w of all) {
  console.log(`  ${w.id}  url=${w.url}  events=${w.eventTypes.join(", ")}`);
}

// Remove agent mailbox webhook
await inkbox.mailWebhooks.delete(mailboxAddress, hook.id);
console.log("Agent mailbox webhook removed.");
