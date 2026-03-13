/**
 * List messages and threads in an agent's mailbox, and read a full thread.
 *
 * Usage:
 *   INKBOX_API_KEY=ApiKey_... AGENT_HANDLE=sales-agent npx ts-node read-agent-messages.ts
 */

import { Inkbox } from "../../typescript/src/inkbox.js";

const inkbox = new Inkbox({ apiKey: process.env.INKBOX_API_KEY! });
const identity = await inkbox.getIdentity(process.env.AGENT_HANDLE!);

// List the 5 most recent messages
console.log("=== Agent inbox ===");
let count = 0;
for await (const msg of identity.iterEmails()) {
  console.log(`${msg.id}  ${msg.subject}  from=${msg.fromAddress}  read=${msg.isRead}`);
  if (++count >= 5) break;
}

// List threads and fetch the first one in full
console.log("\n=== Agent threads ===");
let firstThreadId: string | undefined;
for await (const thread of inkbox._threads.list(identity.mailbox!.emailAddress)) {
  console.log(`${thread.id}  "${thread.subject}"  messages=${thread.messageCount}`);
  firstThreadId ??= thread.id;
}

if (firstThreadId) {
  const thread = await inkbox._threads.get(identity.mailbox!.emailAddress, firstThreadId);
  console.log(`\nAgent conversation: "${thread.subject}" (${thread.messages.length} messages)`);
  for (const msg of thread.messages) {
    console.log(`  [${msg.fromAddress}] ${msg.subject}`);
  }
}
