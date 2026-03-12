"""
Send an email (and reply) from an Inkbox mailbox.

Usage:
    INKBOX_API_KEY=ApiKey_... MAILBOX_ADDRESS=agent@inkboxmail.com python send_email.py
"""

import os
from inkbox.mail import InkboxMail

client = InkboxMail(api_key=os.environ["INKBOX_API_KEY"])
mailbox_address = os.environ["MAILBOX_ADDRESS"]

# Send a new email
sent = client.messages.send(
    mailbox_address,
    to=["recipient@example.com"],
    subject="Hello from Inkbox",
    body_text="Hi there! This message was sent via the Inkbox SDK.",
    body_html="<p>Hi there! This message was sent via the <strong>Inkbox SDK</strong>.</p>",
)
print(f"Sent message {sent.id}  subject={sent.subject!r}")

# Reply to that message (threads it automatically)
reply = client.messages.send(
    mailbox_address,
    to=["recipient@example.com"],
    subject=f"Re: {sent.subject}",
    body_text="Following up on my previous message.",
    in_reply_to_message_id=str(sent.id),
)
print(f"Sent reply {reply.id}")
