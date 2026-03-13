"""
Register and delete a webhook on an agent's mailbox.

Usage:
    INKBOX_API_KEY=ApiKey_... AGENT_HANDLE=sales-agent python receive_agent_email_webhook.py
"""

import os
from inkbox import Inkbox

inkbox = Inkbox(api_key=os.environ["INKBOX_API_KEY"])
identity = inkbox.get_identity(os.environ["AGENT_HANDLE"])

# Register webhook for agent mailbox
hook = inkbox._mail_webhooks.create(
    identity.mailbox.id,
    url="https://example.com/webhook",
    event_types=["message.received", "message.sent"],
)
print(f"Registered agent mailbox webhook {hook.id}  secret={hook.secret}")

# List
all_hooks = inkbox._mail_webhooks.list(identity.mailbox.id)
print(f"Active agent mailbox webhooks: {len(all_hooks)}")
for w in all_hooks:
    print(f"  {w.id}  url={w.url}  events={', '.join(w.event_types)}")

# Remove agent mailbox webhook
inkbox._mail_webhooks.delete(identity.mailbox.id, hook.id)
print("Agent mailbox webhook removed.")
