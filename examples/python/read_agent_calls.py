"""
List recent calls and their transcripts for a phone number.

Usage:
    INKBOX_API_KEY=ApiKey_... PHONE_NUMBER_ID=<id> python read_agent_calls.py
"""

import os
from inkbox import Inkbox

inkbox = Inkbox(api_key=os.environ["INKBOX_API_KEY"])
phone_number_id = os.environ["PHONE_NUMBER_ID"]

calls = inkbox.calls.list(phone_number_id, limit=10)

for call in calls:
    print(f"\n{call.id}  {call.direction}  {call.remote_phone_number}  status={call.status}")

    transcripts = inkbox.transcripts.list(phone_number_id, call.id)
    for t in transcripts:
        print(f"  [{t.party}] {t.text}")
