"""
Create and manage a mailbox via an agent identity.

Usage:
    INKBOX_API_KEY=ApiKey_... python create_agent_mailbox.py
"""

import os
from inkbox import Inkbox

with Inkbox(api_key=os.environ["INKBOX_API_KEY"]) as inkbox:
    # Create an identity and assign a mailbox in one call
    agent = inkbox.create_identity("sales-agent")
    mailbox = agent.assign_mailbox(display_name="Sales Agent")
    print(f"Mailbox created: {mailbox.email_address}  display_name={mailbox.display_name!r}")

    # Update display name
    updated = inkbox._mailboxes.update(mailbox.email_address, display_name="Sales Agent (updated)")
    print(f"\nUpdated display_name: {updated.display_name}")

    # Full-text search
    results = inkbox._mailboxes.search(mailbox.email_address, q="hello")
    print(f'\nSearch results for "hello": {len(results)} messages')

    # Unlink mailbox from identity, then delete it
    agent.unlink_mailbox()
    inkbox._mailboxes.delete(mailbox.email_address)
    print("Mailbox deleted.")

    agent.delete()
