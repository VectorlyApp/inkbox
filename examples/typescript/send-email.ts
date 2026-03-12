/**
 * Send an email (and reply) from an Inkbox mailbox.
 *
 * Usage:
 *   INKBOX_API_KEY=ApiKey_... MAILBOX_ADDRESS=agent@inkboxmail.com npx ts-node send-email.ts
 */

import { InkboxMail } from "../../typescript/src/client.js";

const client = new InkboxMail({ apiKey: process.env.INKBOX_API_KEY! });
const mailboxAddress = process.env.MAILBOX_ADDRESS!;

// Send a new email
const sent = await client.messages.send(mailboxAddress, {
  to: ["recipient@example.com"],
  subject: "Hello from Inkbox",
  bodyText: "Hi there! This message was sent via the Inkbox SDK.",
  bodyHtml: "<p>Hi there! This message was sent via the <strong>Inkbox SDK</strong>.</p>",
});
console.log(`Sent message ${sent.id}  subject="${sent.subject}"`);

// Reply to that message (threads it automatically)
const reply = await client.messages.send(mailboxAddress, {
  to: ["recipient@example.com"],
  subject: `Re: ${sent.subject}`,
  bodyText: "Following up on my previous message.",
  inReplyToMessageId: sent.id,
});
console.log(`Sent reply ${reply.id}`);
