/**
 * List all phone numbers attached to your Inkbox account.
 *
 * Usage:
 *   INKBOX_API_KEY=sk-... npx ts-node list-phone-numbers.ts
 */

import { InkboxPhone } from "../../typescript/src/phone/index.js";

const client = new InkboxPhone({ apiKey: process.env.INKBOX_API_KEY! });

const numbers = await client.numbers.list();

for (const n of numbers) {
  console.log(`${n.number}  type=${n.type}  status=${n.status}`);
}
