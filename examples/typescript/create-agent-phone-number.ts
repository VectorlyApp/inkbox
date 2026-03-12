/**
 * Provision, update, and release a phone number.
 *
 * Usage:
 *   INKBOX_API_KEY=ApiKey_... npx ts-node create-agent-phone-number.ts
 *   INKBOX_API_KEY=ApiKey_... NUMBER_TYPE=local STATE=NY npx ts-node create-agent-phone-number.ts
 */

import { Inkbox } from "../../typescript/src/inkbox.js";

const inkbox = new Inkbox({ apiKey: process.env.INKBOX_API_KEY! });
const numberType = process.env.NUMBER_TYPE ?? "toll_free";
const state = process.env.STATE;

// Provision agent phone number
const number = await inkbox.numbers.provision({
  type: numberType,
  ...(state ? { state } : {}),
});
console.log(`Agent phone number provisioned: ${number.number}  type=${number.type}  status=${number.status}`);

// List all numbers
const all = await inkbox.numbers.list();
console.log(`\nAll agent phone numbers (${all.length}):`);
for (const n of all) {
  console.log(`  ${n.number}  type=${n.type}  status=${n.status}`);
}

// Update incoming call action
const updated = await inkbox.numbers.update(number.id, {
  incomingCallAction: "auto_accept",
});
console.log(`\nUpdated incomingCallAction: ${updated.incomingCallAction}`);

// Release agent phone number
await inkbox.numbers.release({ number: number.number });
console.log("Agent phone number released.");
