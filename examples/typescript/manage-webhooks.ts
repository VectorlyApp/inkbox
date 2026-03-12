/**
 * Create, update, and delete a webhook on a phone number.
 *
 * Usage:
 *   INKBOX_API_KEY=ApiKey_... PHONE_NUMBER_ID=<id> npx ts-node manage-webhooks.ts
 */

import { InkboxPhone } from "../../typescript/src/phone/index.js";

const client = new InkboxPhone({ apiKey: process.env.INKBOX_API_KEY! });
const phoneNumberId = process.env.PHONE_NUMBER_ID!;

// Create
const hook = await client.webhooks.create(phoneNumberId, {
  url: "https://example.com/webhook",
  eventTypes: ["incoming_call"],
});
console.log(`Created webhook ${hook.id}  secret=${hook.secret}`);

// Update
const updated = await client.webhooks.update(phoneNumberId, hook.id, {
  url: "https://example.com/webhook-v2",
});
console.log(`Updated URL: ${updated.url}`);

// Delete
await client.webhooks.delete(phoneNumberId, hook.id);
console.log("Deleted.");
