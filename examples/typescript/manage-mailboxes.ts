/**
 * Create, update, search, and delete a mailbox.
 *
 * Usage:
 *   INKBOX_API_KEY=ApiKey_... AGENT_HANDLE=sales-agent npx ts-node manage-mailboxes.ts
 */

import { InkboxMail } from "../../typescript/src/client.js";

const client = new InkboxMail({ apiKey: process.env.INKBOX_API_KEY! });
const agentHandle = process.env.AGENT_HANDLE ?? "sales-agent";

// Create
const mailbox = await client.mailboxes.create({
  agentHandle,
  displayName: "Sales Agent",
});
console.log(`Created mailbox: ${mailbox.emailAddress}  displayName="${mailbox.displayName}"`);

// List all mailboxes
const all = await client.mailboxes.list();
console.log(`\nAll mailboxes (${all.length}):`);
for (const m of all) {
  console.log(`  ${m.emailAddress}  status=${m.status}`);
}

// Update display name
const updated = await client.mailboxes.update(mailbox.emailAddress, {
  displayName: "Sales Agent (updated)",
});
console.log(`\nUpdated displayName: ${updated.displayName}`);

// Full-text search
const results = await client.mailboxes.search(mailbox.emailAddress, { q: "hello" });
console.log(`\nSearch results for "hello": ${results.length} messages`);

// Delete
await client.mailboxes.delete(mailbox.emailAddress);
console.log("Deleted.");
