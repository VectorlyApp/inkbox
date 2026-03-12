/**
 * Create, update, and delete a webhook on a phone number.
 *
 * Usage:
 *   INKBOX_API_KEY=ApiKey_... PHONE_NUMBER_ID=<id> npx ts-node receive-agent-call-webhook.ts
 */

import { Inkbox } from "../../typescript/src/inkbox.js";

const inkbox = new Inkbox({ apiKey: process.env.INKBOX_API_KEY! });
const phoneNumberId = process.env.PHONE_NUMBER_ID!;

// Register webhook for agent phone number
const hook = await inkbox.phoneWebhooks.create(phoneNumberId, {
  url: "https://example.com/webhook",
  eventTypes: ["incoming_call"],
});
console.log(`Registered agent phone webhook ${hook.id}  secret=${hook.secret}`);

// Update agent phone webhook
const updated = await inkbox.phoneWebhooks.update(phoneNumberId, hook.id, {
  url: "https://example.com/webhook-v2",
});
console.log(`Updated URL: ${updated.url}`);

// Remove agent phone webhook
await inkbox.phoneWebhooks.delete(phoneNumberId, hook.id);
console.log("Agent phone webhook removed.");
