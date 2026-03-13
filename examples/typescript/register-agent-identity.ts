/**
 * Create an agent identity and provision communication channels for it.
 *
 * Usage:
 *   INKBOX_API_KEY=ApiKey_... npx ts-node register-agent-identity.ts
 */

import { Inkbox } from "../../typescript/src/inkbox.js";

const inkbox = new Inkbox({ apiKey: process.env.INKBOX_API_KEY! });

// Register agent identity — returns an AgentIdentity object
const agent = await inkbox.createIdentity("sales-agent");
console.log(`Registered agent: ${agent.agentHandle}  (id=${agent.id})`);

// Provision and link a mailbox
const mailbox = await agent.assignMailbox({ displayName: "Sales Agent" });
console.log(`Assigned mailbox: ${mailbox.emailAddress}`);

// Provision and link a phone number
const phone = await agent.assignPhoneNumber({ type: "toll_free" });
console.log(`Assigned phone: ${phone.number}`);

// List all identities
const all = await inkbox.listIdentities();
console.log(`\nAll identities (${all.length}):`);
for (const id of all) {
  console.log(`  ${id.agentHandle}  status=${id.status}`);
}

// Unregister agent
await agent.delete();
console.log("\nUnregistered agent sales-agent.");
