"""
Create, update, search, and delete a mailbox.

Usage:
    INKBOX_API_KEY=ApiKey_... python create_agent_mailbox.py
"""

import os
from inkbox import Inkbox

with Inkbox(api_key=os.environ["INKBOX_API_KEY"]) as inkbox:
    # Create a mailbox
    mailbox = inkbox.mailboxes.create(display_name="Sales Agent")
    print(f"Mailbox created: {mailbox.email_address}  display_name={mailbox.display_name!r}")

    # List all mailboxes
    all_mailboxes = inkbox.mailboxes.list()
    print(f"\nAll mailboxes ({len(all_mailboxes)}):")
    for m in all_mailboxes:
        print(f"  {m.email_address}  status={m.status}")

    # Update display name
    updated = inkbox.mailboxes.update(mailbox.email_address, display_name="Sales Agent (updated)")
    print(f"\nUpdated display_name: {updated.display_name}")

    # Full-text search
    results = inkbox.mailboxes.search(mailbox.email_address, q="hello")
    print(f'\nSearch results for "hello": {len(results)} messages')

    # Delete
    inkbox.mailboxes.delete(mailbox.email_address)
    print("Mailbox deleted.")
