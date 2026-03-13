"""
List recent calls and their transcripts for an agent identity.

Usage:
    INKBOX_API_KEY=ApiKey_... AGENT_HANDLE=sales-agent python read_agent_calls.py
"""

import os
from inkbox import Inkbox

inkbox = Inkbox(api_key=os.environ["INKBOX_API_KEY"])
identity = inkbox.get_identity(os.environ["AGENT_HANDLE"])

calls = identity.list_calls(limit=10)

for call in calls:
    print(f"\n{call.id}  {call.direction}  {call.remote_phone_number}  status={call.status}")

    transcripts = identity.list_transcripts(call.id)
    for t in transcripts:
        print(f"  [{t.party}] {t.text}")
