"""
Register and delete a webhook on a mailbox.

Usage:
    INKBOX_API_KEY=ApiKey_... MAILBOX_ADDRESS=agent@inkboxmail.com python manage_mail_webhooks.py
"""

import os
from inkbox.mail import InkboxMail

client = InkboxMail(api_key=os.environ["INKBOX_API_KEY"])
mailbox_address = os.environ["MAILBOX_ADDRESS"]

# Create
hook = client.webhooks.create(
    mailbox_address,
    url="https://example.com/webhook",
    event_types=["message.received", "message.sent"],
)
print(f"Created webhook {hook.id}  secret={hook.secret}")

# List
all_hooks = client.webhooks.list(mailbox_address)
print(f"Active webhooks: {len(all_hooks)}")
for w in all_hooks:
    print(f"  {w.id}  url={w.url}  events={', '.join(w.event_types)}")

# Delete
client.webhooks.delete(mailbox_address, hook.id)
print("Deleted.")
