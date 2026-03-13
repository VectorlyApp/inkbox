/**
 * Create and manage a mailbox via an agent identity.
 *
 * Usage:
 *   INKBOX_API_KEY=ApiKey_... npx ts-node create-agent-mailbox.ts
 */

import { Inkbox } from "../../typescript/src/inkbox.js";

const inkbox = new Inkbox({ apiKey: process.env.INKBOX_API_KEY! });

// Create an identity and assign a mailbox in one call
const agent = await inkbox.createIdentity("sales-agent");
const mailbox = await agent.assignMailbox({ displayName: "Sales Agent" });
console.log(`Agent mailbox created: ${mailbox.emailAddress}  displayName="${mailbox.displayName}"`);

// Update display name
const updated = await inkbox._mailboxes.update(mailbox.emailAddress, {
  displayName: "Sales Agent (updated)",
});
console.log(`\nUpdated displayName: ${updated.displayName}`);

// Full-text search
const results = await inkbox._mailboxes.search(mailbox.emailAddress, { q: "hello" });
console.log(`\nSearch results for "hello": ${results.length} messages`);

// Unlink mailbox from identity, then delete it
await agent.unlinkMailbox();
await inkbox._mailboxes.delete(mailbox.emailAddress);
console.log("Agent mailbox deleted.");

await agent.delete();
