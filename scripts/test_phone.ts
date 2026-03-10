/**
 * Quick smoke test for the Inkbox Phone TypeScript SDK.
 *
 * Loads INKBOX_API_KEY from ../.env and exercises every endpoint.
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { InkboxPhone } from "../typescript/src/phone/index.js";

// Load .env from repo root
const __dirname = dirname(fileURLToPath(import.meta.url));
const envFile = resolve(__dirname, "../.env");
try {
  const contents = readFileSync(envFile, "utf-8");
  for (const line of contents.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const idx = trimmed.indexOf("=");
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
} catch {}

const API_KEY = process.env.INKBOX_API_KEY;
if (!API_KEY) {
  console.error("ERROR: INKBOX_API_KEY not set in .env or environment");
  process.exit(1);
}

const client = new InkboxPhone({ apiKey: API_KEY });

async function main() {
  // --- Numbers ---
  console.log("=== Listing phone numbers ===");
  const numbers = await client.numbers.list();
  for (const n of numbers) {
    console.log(`  ${n.number}  type=${n.type}  status=${n.status}  action=${n.incomingCallAction}`);
  }

  let number;
  if (numbers.length === 0) {
    console.log("\nNo numbers found. Provisioning a toll-free number...");
    number = await client.numbers.provision({ type: "toll_free" });
    console.log(`  Provisioned: ${number.number} (id=${number.id})`);
  } else {
    number = numbers[0];
    console.log(`\nUsing first number: ${number.number} (id=${number.id})`);
  }

  console.log("\n=== Get phone number ===");
  const fetched = await client.numbers.get(number.id);
  console.log(`  ${fetched.number}  pipeline_mode=${fetched.defaultPipelineMode}`);

  console.log("\n=== Update phone number ===");
  const updated = await client.numbers.update(number.id, {
    incomingCallAction: "auto_reject",
  });
  console.log(`  incomingCallAction=${updated.incomingCallAction}`);

  // --- Calls ---
  console.log("\n=== Listing calls ===");
  const calls = await client.calls.list(number.id, { limit: 5 });
  for (const c of calls) {
    console.log(`  ${c.id}  ${c.direction}  ${c.remotePhoneNumber}  status=${c.status}`);
  }

  if (calls.length > 0) {
    const call = calls[0];
    console.log(`\n=== Get call ${call.id} ===`);
    const detail = await client.calls.get(number.id, call.id);
    console.log(`  ${detail.direction}  ${detail.remotePhoneNumber}  pipeline=${detail.pipelineMode}`);

    // --- Transcripts (first call) ---
    console.log(`\n=== Listing transcripts for call ${call.id} ===`);
    const transcripts = await client.transcripts.list(number.id, call.id);
    for (const t of transcripts) {
      console.log(`  [${t.party}] seq=${t.seq} ts=${t.tsMs}ms: ${t.text.slice(0, 80)}`);
    }

    // --- Outbound call transcripts ---
    let outbound = calls.filter((c) => c.direction === "outbound");
    if (outbound.length === 0) {
      // Try fetching more calls to find an outbound one
      const allCalls = await client.calls.list(number.id, { limit: 200 });
      outbound = allCalls.filter((c) => c.direction === "outbound");
    }

    if (outbound.length > 0) {
      const ob = outbound[0];
      console.log(`\n=== Get outbound call ${ob.id} ===`);
      const obDetail = await client.calls.get(number.id, ob.id);
      console.log(`  ${obDetail.direction}  ${obDetail.remotePhoneNumber}  status=${obDetail.status}`);

      console.log(`\n=== Listing transcripts for outbound call ${ob.id} ===`);
      const obTranscripts = await client.transcripts.list(number.id, ob.id);
      if (obTranscripts.length > 0) {
        for (const t of obTranscripts) {
          console.log(`  [${t.party}] seq=${t.seq} ts=${t.tsMs}ms: ${t.text.slice(0, 80)}`);
        }
      } else {
        console.log("  (no transcripts)");
      }
    } else {
      console.log("\n  (no outbound calls found)");
    }
  }

  // --- Search ---
  console.log("\n=== Search transcripts ===");
  const results = await client.numbers.searchTranscripts(number.id, { q: "hello" });
  console.log(`  Found ${results.length} results`);
  for (const r of results.slice(0, 3)) {
    console.log(`  [${r.party}] ${r.text.slice(0, 80)}`);
  }

  // --- Webhooks ---
  console.log("\n=== Listing webhooks ===");
  const webhooks = await client.webhooks.list(number.id);
  for (const wh of webhooks) {
    console.log(`  ${wh.id}  url=${wh.url}  events=${wh.eventTypes}`);
  }

  console.log("\n=== Creating webhook ===");
  const hook = await client.webhooks.create(number.id, {
    url: "https://example.com/test-webhook",
    eventTypes: ["incoming_call"],
  });
  console.log(`  Created: ${hook.id}`);
  console.log(`  Secret: ${hook.secret}`);

  console.log("\n=== Updating webhook ===");
  const updatedHook = await client.webhooks.update(number.id, hook.id, {
    url: "https://example.com/updated-webhook",
  });
  console.log(`  Updated URL: ${updatedHook.url}`);

  console.log("\n=== Deleting webhook ===");
  await client.webhooks.delete(number.id, hook.id);
  console.log("  Deleted.");

  console.log("\nAll tests passed!");
}

main().catch((err) => {
  console.error("FAILED:", err);
  process.exit(1);
});
