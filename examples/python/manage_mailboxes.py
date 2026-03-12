"""
Create, update, search, and delete a mailbox.

Usage:
    INKBOX_API_KEY=ApiKey_... AGENT_HANDLE=sales-agent python manage_mailboxes.py
"""

import os
from inkbox.mail import InkboxMail

client = InkboxMail(api_key=os.environ["INKBOX_API_KEY"])
agent_handle = os.environ.get("AGENT_HANDLE", "sales-agent")

# Create
mailbox = client.mailboxes.create(agent_handle=agent_handle, display_name="Sales Agent")
print(f"Created mailbox: {mailbox.email_address}  display_name={mailbox.display_name!r}")

# List all mailboxes
all_mailboxes = client.mailboxes.list()
print(f"\nAll mailboxes ({len(all_mailboxes)}):")
for m in all_mailboxes:
    print(f"  {m.email_address}  status={m.status}")

# Update display name
updated = client.mailboxes.update(mailbox.email_address, display_name="Sales Agent (updated)")
print(f"\nUpdated display_name: {updated.display_name}")

# Full-text search
results = client.mailboxes.search(mailbox.email_address, q="hello")
print(f'\nSearch results for "hello": {len(results)} messages')

# Delete
client.mailboxes.delete(mailbox.email_address)
print("Deleted.")
