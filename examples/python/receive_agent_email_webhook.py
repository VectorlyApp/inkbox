"""
Register and delete a webhook on a mailbox.

Usage:
    INKBOX_API_KEY=ApiKey_... MAILBOX_ADDRESS=agent@inkboxmail.com python receive_agent_email_webhook.py
"""

import os
from inkbox.mail import InkboxMail

client = InkboxMail(api_key=os.environ["INKBOX_API_KEY"])
mailbox_address = os.environ["MAILBOX_ADDRESS"]

# Register webhook for agent mailbox
hook = client.webhooks.create(
    mailbox_address,
    url="https://example.com/webhook",
    event_types=["message.received", "message.sent"],
)
print(f"Registered agent mailbox webhook {hook.id}  secret={hook.secret}")

# List
all_hooks = client.webhooks.list(mailbox_address)
print(f"Active agent mailbox webhooks: {len(all_hooks)}")
for w in all_hooks:
    print(f"  {w.id}  url={w.url}  events={', '.join(w.event_types)}")

# Remove agent mailbox webhook
client.webhooks.delete(mailbox_address, hook.id)
print("Agent mailbox webhook removed.")
