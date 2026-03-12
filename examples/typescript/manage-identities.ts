/**
 * Create an agent identity and assign communication channels to it.
 *
 * Usage:
 *   INKBOX_API_KEY=ApiKey_... MAILBOX_ID=<uuid> PHONE_NUMBER_ID=<uuid> npx ts-node manage-identities.ts
 */

import { InkboxIdentities } from "../../typescript/src/identities/index.js";

const client = new InkboxIdentities({ apiKey: process.env.INKBOX_API_KEY! });

// Create
const identity = await client.identities.create({ agentHandle: "sales-agent" });
console.log(`Created identity: ${identity.agentHandle}  (id=${identity.id})`);

// Assign channels
if (process.env.MAILBOX_ID) {
  const withMailbox = await client.identities.assignMailbox("sales-agent", {
    mailboxId: process.env.MAILBOX_ID,
  });
  console.log(`Assigned mailbox: ${withMailbox.mailbox?.emailAddress}`);
}

if (process.env.PHONE_NUMBER_ID) {
  const withPhone = await client.identities.assignPhoneNumber("sales-agent", {
    phoneNumberId: process.env.PHONE_NUMBER_ID,
  });
  console.log(`Assigned phone: ${withPhone.phoneNumber?.number}`);
}

// List all identities
const all = await client.identities.list();
console.log(`\nAll identities (${all.length}):`);
for (const id of all) {
  console.log(`  ${id.agentHandle}  status=${id.status}`);
}

// Clean up
await client.identities.delete("sales-agent");
console.log("\nDeleted sales-agent.");
