"""
Create an agent identity and assign communication channels to it.

Usage:
    INKBOX_API_KEY=ApiKey_... python register_agent_identity.py
"""

import os
from inkbox import Inkbox

with Inkbox(api_key=os.environ["INKBOX_API_KEY"]) as inkbox:
    # Create agent identity — returns an Agent object
    agent = inkbox.identities.create(agent_handle="sales-agent")
    print(f"Registered agent: {agent.agent_handle}  (id={agent.id})")

    # Provision and assign channels in one call each
    mailbox = agent.assign_mailbox(display_name="Sales Agent")
    print(f"Assigned mailbox: {mailbox.email_address}")

    phone = agent.assign_phone_number(type="toll_free")
    print(f"Assigned phone: {phone.number}")

    # List all identities
    all_identities = inkbox.identities.list()
    print(f"\nAll identities ({len(all_identities)}):")
    for ident in all_identities:
        print(f"  {ident.agent_handle}  status={ident.status}")

    # Unregister agent (unlinks channels without deleting them)
    agent.delete()
    print("\nUnregistered agent sales-agent.")
