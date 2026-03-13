/**
 * Provision, update, and release a phone number via an agent identity.
 *
 * Usage:
 *   INKBOX_API_KEY=ApiKey_... npx ts-node create-agent-phone-number.ts
 *   INKBOX_API_KEY=ApiKey_... NUMBER_TYPE=local STATE=NY npx ts-node create-agent-phone-number.ts
 */

import { Inkbox } from "../../typescript/src/inkbox.js";

const inkbox = new Inkbox({ apiKey: process.env.INKBOX_API_KEY! });
const numberType = process.env.NUMBER_TYPE ?? "toll_free";
const state = process.env.STATE;

// Create an identity and provision + assign a phone number in one call
const agent = await inkbox.createIdentity("sales-agent");
const phone = await agent.assignPhoneNumber({
  type: numberType,
  ...(state ? { state } : {}),
});
console.log(`Agent phone number provisioned: ${phone.number}  type=${phone.type}  status=${phone.status}`);

// Update incoming call action
const updated = await inkbox._numbers.update(phone.id, {
  incomingCallAction: "auto_accept",
});
console.log(`\nUpdated incomingCallAction: ${updated.incomingCallAction}`);

// Unlink phone number from identity, then release it
await agent.unlinkPhoneNumber();
await inkbox._numbers.release({ number: phone.number });
console.log("Agent phone number released.");

await agent.delete();
