"""
Send an email (and reply) from an Inkbox agent identity.

Usage:
    INKBOX_API_KEY=ApiKey_... AGENT_HANDLE=sales-agent python agent_send_email.py
"""

import os
from inkbox import Inkbox

inkbox = Inkbox(api_key=os.environ["INKBOX_API_KEY"])
identity = inkbox.get_identity(os.environ["AGENT_HANDLE"])

# Agent sends outbound email
sent = identity.send_email(
    to=["recipient@example.com"],
    subject="Hello from your AI sales agent",
    body_text="Hi there! I'm your AI sales agent reaching out via Inkbox.",
    body_html="<p>Hi there! I'm your AI sales agent reaching out via <strong>Inkbox</strong>.</p>",
)
print(f"Sent message {sent.id}  subject={sent.subject!r}")

# Agent sends threaded reply
reply = identity.send_email(
    to=["recipient@example.com"],
    subject=f"Re: {sent.subject}",
    body_text="Following up as your AI sales agent.",
    in_reply_to_message_id=str(sent.id),
)
print(f"Sent reply {reply.id}")
