/**
 * Create, update, search, and delete a mailbox.
 *
 * Usage:
 *   INKBOX_API_KEY=ApiKey_... npx ts-node create-agent-mailbox.ts
 */

import { Inkbox } from "../../typescript/src/inkbox.js";

const inkbox = new Inkbox({ apiKey: process.env.INKBOX_API_KEY! });

// Create agent mailbox
const mailbox = await inkbox.mailboxes.create({
  displayName: "Sales Agent",
});
console.log(`Agent mailbox created: ${mailbox.emailAddress}  displayName="${mailbox.displayName}"`);

// List all mailboxes
const all = await inkbox.mailboxes.list();
console.log(`\nAll agent mailboxes (${all.length}):`);
for (const m of all) {
  console.log(`  ${m.emailAddress}  status=${m.status}`);
}

// Update display name
const updated = await inkbox.mailboxes.update(mailbox.emailAddress, {
  displayName: "Sales Agent (updated)",
});
console.log(`\nUpdated displayName: ${updated.displayName}`);

// Full-text search
const results = await inkbox.mailboxes.search(mailbox.emailAddress, { q: "hello" });
console.log(`\nSearch results for "hello": ${results.length} messages`);

// Delete agent mailbox
await inkbox.mailboxes.delete(mailbox.emailAddress);
console.log("Agent mailbox deleted.");
