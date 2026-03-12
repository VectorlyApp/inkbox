"""
Create, update, and delete a webhook on a phone number.

Usage:
    INKBOX_API_KEY=ApiKey_... PHONE_NUMBER_ID=<id> python receive_agent_call_webhook.py
"""

import os
from inkbox import Inkbox

inkbox = Inkbox(api_key=os.environ["INKBOX_API_KEY"])
phone_number_id = os.environ["PHONE_NUMBER_ID"]

# Register webhook for agent phone number
hook = inkbox.phone_webhooks.create(
    phone_number_id,
    url="https://example.com/webhook",
    event_types=["incoming_call"],
)
print(f"Registered agent phone webhook {hook.id}  secret={hook.secret}")

# Update agent phone webhook
updated = inkbox.phone_webhooks.update(
    phone_number_id,
    hook.id,
    url="https://example.com/webhook-v2",
)
print(f"Updated URL: {updated.url}")

# Remove agent phone webhook
inkbox.phone_webhooks.delete(phone_number_id, hook.id)
print("Agent phone webhook removed.")
