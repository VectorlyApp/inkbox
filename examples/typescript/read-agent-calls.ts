/**
 * List recent calls and their transcripts for a phone number.
 *
 * Usage:
 *   INKBOX_API_KEY=ApiKey_... PHONE_NUMBER_ID=<id> npx ts-node read-agent-calls.ts
 */

import { Inkbox } from "../../typescript/src/inkbox.js";

const inkbox = new Inkbox({ apiKey: process.env.INKBOX_API_KEY! });
const phoneNumberId = process.env.PHONE_NUMBER_ID!;

const calls = await inkbox.calls.list(phoneNumberId, { limit: 10 });

for (const call of calls) {
  console.log(`\n${call.id}  ${call.direction}  ${call.remotePhoneNumber}  status=${call.status}`);

  const transcripts = await inkbox.transcripts.list(phoneNumberId, call.id);
  for (const t of transcripts) {
    console.log(`  [${t.party}] ${t.text}`);
  }
}
