/**
 * List messages and threads in a mailbox, and read a full thread.
 *
 * Usage:
 *   INKBOX_API_KEY=ApiKey_... MAILBOX_ADDRESS=agent@inkboxmail.com npx ts-node list-messages-and-threads.ts
 */

import { InkboxMail } from "../../typescript/src/client.js";

const client = new InkboxMail({ apiKey: process.env.INKBOX_API_KEY! });
const mailboxAddress = process.env.MAILBOX_ADDRESS!;

// List the 5 most recent messages
console.log("=== Recent messages ===");
let count = 0;
for await (const msg of client.messages.list(mailboxAddress)) {
  console.log(`${msg.id}  ${msg.subject}  from=${msg.fromAddress}  read=${msg.isRead}`);
  if (++count >= 5) break;
}

// List threads and fetch the first one in full
console.log("\n=== Threads ===");
let firstThreadId: string | undefined;
for await (const thread of client.threads.list(mailboxAddress)) {
  console.log(`${thread.id}  "${thread.subject}"  messages=${thread.messageCount}`);
  firstThreadId ??= thread.id;
}

if (firstThreadId) {
  const thread = await client.threads.get(mailboxAddress, firstThreadId);
  console.log(`\nFull thread: "${thread.subject}" (${thread.messages.length} messages)`);
  for (const msg of thread.messages) {
    console.log(`  [${msg.fromAddress}] ${msg.subject}`);
  }
}
