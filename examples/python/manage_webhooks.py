"""
Create, update, and delete a webhook on a phone number.

Usage:
    INKBOX_API_KEY=sk-... PHONE_NUMBER_ID=<id> python manage_webhooks.py
"""

import os
from inkbox.phone import InkboxPhone

client = InkboxPhone(api_key=os.environ["INKBOX_API_KEY"])
phone_number_id = os.environ["PHONE_NUMBER_ID"]

# Create
hook = client.webhooks.create(
    phone_number_id,
    url="https://example.com/webhook",
    event_types=["incoming_call"],
)
print(f"Created webhook {hook.id}  secret={hook.secret}")

# Update
updated = client.webhooks.update(
    phone_number_id,
    hook.id,
    url="https://example.com/webhook-v2",
)
print(f"Updated URL: {updated.url}")

# Delete
client.webhooks.delete(phone_number_id, hook.id)
print("Deleted.")
