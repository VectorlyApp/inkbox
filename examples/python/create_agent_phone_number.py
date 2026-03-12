"""
Provision, update, and release a phone number.

Usage:
    INKBOX_API_KEY=ApiKey_... python create_agent_phone_number.py
    INKBOX_API_KEY=ApiKey_... NUMBER_TYPE=local STATE=NY python create_agent_phone_number.py
"""

import os
from inkbox.phone import InkboxPhone

client = InkboxPhone(api_key=os.environ["INKBOX_API_KEY"])
number_type = os.environ.get("NUMBER_TYPE", "toll_free")
state = os.environ.get("STATE")

# Provision agent phone number
kwargs = {"type": number_type}
if state:
    kwargs["state"] = state
number = client.numbers.provision(**kwargs)
print(f"Agent phone number provisioned: {number.number}  type={number.type}  status={number.status}")

# List all numbers
all_numbers = client.numbers.list()
print(f"\nAll agent phone numbers ({len(all_numbers)}):")
for n in all_numbers:
    print(f"  {n.number}  type={n.type}  status={n.status}")

# Update incoming call action
updated = client.numbers.update(number.id, incoming_call_action="auto_accept")
print(f"\nUpdated incoming_call_action: {updated.incoming_call_action}")

# Release agent phone number
client.numbers.release(number=number.number)
print("Agent phone number released.")
