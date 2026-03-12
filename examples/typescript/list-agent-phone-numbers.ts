/**
 * List all phone numbers attached to your Inkbox account.
 *
 * Usage:
 *   INKBOX_API_KEY=ApiKey_... npx ts-node list-agent-phone-numbers.ts
 */

import { Inkbox } from "../../typescript/src/inkbox.js";

const inkbox = new Inkbox({ apiKey: process.env.INKBOX_API_KEY! });

const numbers = await inkbox.numbers.list();

for (const n of numbers) {
  console.log(`${n.number}  type=${n.type}  status=${n.status}`);
}
