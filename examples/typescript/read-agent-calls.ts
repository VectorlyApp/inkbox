/**
 * List recent calls and their transcripts for an agent identity.
 *
 * Usage:
 *   INKBOX_API_KEY=ApiKey_... AGENT_HANDLE=sales-agent npx ts-node read-agent-calls.ts
 */

import { Inkbox } from "../../typescript/src/inkbox.js";

const inkbox = new Inkbox({ apiKey: process.env.INKBOX_API_KEY! });
const identity = await inkbox.getIdentity(process.env.AGENT_HANDLE!);

const calls = await identity.calls({ limit: 10 });

for (const call of calls) {
  console.log(`\n${call.id}  ${call.direction}  ${call.remotePhoneNumber}  status=${call.status}`);

  const transcripts = await identity.transcripts(call.id);
  for (const t of transcripts) {
    console.log(`  [${t.party}] ${t.text}`);
  }
}
