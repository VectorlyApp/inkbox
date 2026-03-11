"""
Quick smoke test for the Inkbox Phone Python SDK.

Loads INKBOX_API_KEY from ../.env and exercises every endpoint.
"""

import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from inkbox.phone import InkboxPhone

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

API_KEY = os.environ.get("INKBOX_API_KEY")
if not API_KEY:
    print("ERROR: INKBOX_API_KEY not set in .env or environment")
    sys.exit(1)

def main():
    with InkboxPhone(api_key=API_KEY) as client:

        # --- Numbers ---
        print("=== Listing phone numbers ===")
        numbers = client.numbers.list()
        for n in numbers:
            print(f"  {n.number}  type={n.type}  status={n.status}  action={n.incoming_call_action}")

        if not numbers:
            print("ERROR: No phone numbers found. Attach a number to your account first.")
            sys.exit(1)

        number = numbers[0]
        print(f"\nUsing first number: {number.number} (id={number.id})")

        print("\n=== Get phone number ===")
        fetched = client.numbers.get(number.id)
        print(f"  {fetched.number}  pipeline_mode={fetched.default_pipeline_mode}")

        print("\n=== Update phone number ===")
        updated = client.numbers.update(
            number.id,
            incoming_call_action="auto_reject",
        )
        print(f"  incoming_call_action={updated.incoming_call_action}")

        # --- Calls ---
        print("\n=== Listing calls ===")
        calls = client.calls.list(number.id, limit=5)
        for c in calls:
            print(f"  {c.id}  {c.direction}  {c.remote_phone_number}  status={c.status}")

        if calls:
            call = calls[0]
            print(f"\n=== Get call {call.id} ===")
            detail = client.calls.get(number.id, call.id)
            print(f"  {detail.direction}  {detail.remote_phone_number}  pipeline={detail.pipeline_mode}")

            # --- Transcripts (first call) ---
            print(f"\n=== Listing transcripts for call {call.id} ===")
            transcripts = client.transcripts.list(number.id, call.id)
            for t in transcripts:
                print(f"  [{t.party}] seq={t.seq} ts={t.ts_ms}ms: {t.text[:80]}")

            # --- Outbound call transcripts ---
            outbound = [c for c in calls if c.direction == "outbound"]
            if outbound:
                ob = outbound[0]
                print(f"\n=== Get outbound call {ob.id} ===")
                ob_detail = client.calls.get(number.id, ob.id)
                print(f"  {ob_detail.direction}  {ob_detail.remote_phone_number}  status={ob_detail.status}")

                print(f"\n=== Listing transcripts for outbound call {ob.id} ===")
                ob_transcripts = client.transcripts.list(number.id, ob.id)
                if ob_transcripts:
                    for t in ob_transcripts:
                        print(f"  [{t.party}] seq={t.seq} ts={t.ts_ms}ms: {t.text[:80]}")
                else:
                    print("  (no transcripts)")
            else:
                # Try fetching more calls to find an outbound one
                all_calls = client.calls.list(number.id, limit=200)
                outbound = [c for c in all_calls if c.direction == "outbound"]
                if outbound:
                    ob = outbound[0]
                    print(f"\n=== Get outbound call {ob.id} ===")
                    ob_detail = client.calls.get(number.id, ob.id)
                    print(f"  {ob_detail.direction}  {ob_detail.remote_phone_number}  status={ob_detail.status}")

                    print(f"\n=== Listing transcripts for outbound call {ob.id} ===")
                    ob_transcripts = client.transcripts.list(number.id, ob.id)
                    if ob_transcripts:
                        for t in ob_transcripts:
                            print(f"  [{t.party}] seq={t.seq} ts={t.ts_ms}ms: {t.text[:80]}")
                    else:
                        print("  (no transcripts)")
                else:
                    print("\n  (no outbound calls found)")

        # --- Search ---
        print("\n=== Search transcripts ===")
        results = client.numbers.search_transcripts(number.id, q="hello")
        print(f"  Found {len(results)} results")
        for r in results[:3]:
            print(f"  [{r.party}] {r.text[:80]}")

        # --- Webhooks ---
        print("\n=== Listing webhooks ===")
        webhooks = client.webhooks.list(number.id)
        for wh in webhooks:
            print(f"  {wh.id}  url={wh.url}  events={wh.event_types}")

        print("\n=== Creating webhook ===")
        hook = client.webhooks.create(
            number.id,
            url="https://example.com/test-webhook",
            event_types=["incoming_call"],
        )
        print(f"  Created: {hook.id}")
        print(f"  Secret: {hook.secret}")

        print("\n=== Updating webhook ===")
        updated_hook = client.webhooks.update(
            number.id,
            hook.id,
            url="https://example.com/updated-webhook",
        )
        print(f"  Updated URL: {updated_hook.url}")

        print("\n=== Deleting webhook ===")
        client.webhooks.delete(number.id, hook.id)
        print("  Deleted.")

        print("\nAll tests passed!")


if __name__ == "__main__":
    main()
