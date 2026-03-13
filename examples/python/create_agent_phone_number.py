"""
Provision, update, and release a phone number via an agent identity.

Usage:
    INKBOX_API_KEY=ApiKey_... python create_agent_phone_number.py
    INKBOX_API_KEY=ApiKey_... NUMBER_TYPE=local STATE=NY python create_agent_phone_number.py
"""

import os
from inkbox import Inkbox

inkbox = Inkbox(api_key=os.environ["INKBOX_API_KEY"])
number_type = os.environ.get("NUMBER_TYPE", "toll_free")
state = os.environ.get("STATE")

# Create an identity and provision + assign a phone number in one call
agent = inkbox.create_identity("sales-agent")
phone = agent.assign_phone_number(type=number_type, state=state)
print(f"Agent phone number provisioned: {phone.number}  type={phone.type}  status={phone.status}")

# Update incoming call action
updated = inkbox._numbers.update(phone.id, incoming_call_action="auto_accept")
print(f"\nUpdated incoming_call_action: {updated.incoming_call_action}")

# Unlink phone number from identity, then release it
agent.unlink_phone_number()
inkbox._numbers.release(number=phone.number)
print("Agent phone number released.")

agent.delete()
