/**
 * Send an email (and reply) from an Inkbox mailbox.
 *
 * Usage:
 *   INKBOX_API_KEY=ApiKey_... MAILBOX_ADDRESS=agent@inkboxmail.com npx ts-node agent-send-email.ts
 */

import { Inkbox } from "../../typescript/src/inkbox.js";

const inkbox = new Inkbox({ apiKey: process.env.INKBOX_API_KEY! });
const mailboxAddress = process.env.MAILBOX_ADDRESS!;

// Agent sends outbound email
const sent = await inkbox.messages.send(mailboxAddress, {
  to: ["recipient@example.com"],
  subject: "Hello from your AI sales agent",
  bodyText: "Hi there! I'm your AI sales agent reaching out via Inkbox.",
  bodyHtml: "<p>Hi there! I'm your AI sales agent reaching out via <strong>Inkbox</strong>.</p>",
});
console.log(`Sent message ${sent.id}  subject="${sent.subject}"`);

// Agent sends threaded reply
const reply = await inkbox.messages.send(mailboxAddress, {
  to: ["recipient@example.com"],
  subject: `Re: ${sent.subject}`,
  bodyText: "Following up as your AI sales agent.",
  inReplyToMessageId: sent.id,
});
console.log(`Sent reply ${reply.id}`);
