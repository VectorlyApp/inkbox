"""
List messages and threads in an agent's mailbox, and read a full thread.

Usage:
    INKBOX_API_KEY=ApiKey_... AGENT_HANDLE=sales-agent python read_agent_messages.py
"""

import os
from inkbox import Inkbox

inkbox = Inkbox(api_key=os.environ["INKBOX_API_KEY"])
identity = inkbox.get_identity(os.environ["AGENT_HANDLE"])

# List the 5 most recent messages
print("=== Agent inbox ===")
for i, msg in enumerate(identity.iter_emails()):
    print(f"{msg.id}  {msg.subject}  from={msg.from_address}  read={msg.is_read}")
    if i >= 4:
        break

# List threads and fetch the first one in full
print("\n=== Agent threads ===")
first_thread_id = None
for thread in inkbox._threads.list(identity.mailbox.email_address):
    print(f"{thread.id}  {thread.subject!r}  messages={thread.message_count}")
    if first_thread_id is None:
        first_thread_id = thread.id

if first_thread_id:
    thread = inkbox._threads.get(identity.mailbox.email_address, first_thread_id)
    print(f"\nAgent conversation: {thread.subject!r} ({len(thread.messages)} messages)")
    for msg in thread.messages:
        print(f"  [{msg.from_address}] {msg.subject}")
