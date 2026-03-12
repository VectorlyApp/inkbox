"""
Create an agent identity and assign communication channels to it.

Usage:
    INKBOX_API_KEY=sk-... MAILBOX_ID=<uuid> PHONE_NUMBER_ID=<uuid> python manage_identities.py
"""

import os
from inkbox.identities import InkboxIdentities

with InkboxIdentities(api_key=os.environ["INKBOX_API_KEY"]) as client:
    # Create
    identity = client.identities.create(agent_handle="sales-agent")
    print(f"Created identity: {identity.agent_handle}  (id={identity.id})")

    # Assign channels
    if mailbox_id := os.environ.get("MAILBOX_ID"):
        with_mailbox = client.identities.assign_mailbox("sales-agent", mailbox_id=mailbox_id)
        print(f"Assigned mailbox: {with_mailbox.mailbox.email_address}")

    if phone_number_id := os.environ.get("PHONE_NUMBER_ID"):
        with_phone = client.identities.assign_phone_number("sales-agent", phone_number_id=phone_number_id)
        print(f"Assigned phone: {with_phone.phone_number.number}")

    # List all identities
    all_identities = client.identities.list()
    print(f"\nAll identities ({len(all_identities)}):")
    for ident in all_identities:
        print(f"  {ident.agent_handle}  status={ident.status}")

    # Clean up
    client.identities.delete("sales-agent")
    print("\nDeleted sales-agent.")
