"""
Create, update, and delete a webhook on an agent's phone number.

Usage:
    INKBOX_API_KEY=ApiKey_... AGENT_HANDLE=sales-agent python receive_agent_call_webhook.py
"""

import os
from inkbox import Inkbox

inkbox = Inkbox(api_key=os.environ["INKBOX_API_KEY"])
identity = inkbox.get_identity(os.environ["AGENT_HANDLE"])

# Register webhook for agent phone number
hook = inkbox._phone_webhooks.create(
    identity.phone_number.id,
    url="https://example.com/webhook",
    event_types=["incoming_call"],
)
print(f"Registered agent phone webhook {hook.id}  secret={hook.secret}")

# Update agent phone webhook
updated = inkbox._phone_webhooks.update(
    identity.phone_number.id,
    hook.id,
    url="https://example.com/webhook-v2",
)
print(f"Updated URL: {updated.url}")

# Remove agent phone webhook
inkbox._phone_webhooks.delete(identity.phone_number.id, hook.id)
print("Agent phone webhook removed.")
