"""
inkbox-mail — Python SDK for the Inkbox Mail API.
"""

from inkbox_mail.client import InkboxMail
from inkbox_mail.exceptions import InkboxAPIError, InkboxError
from inkbox_mail.types import (
    Mailbox,
    Message,
    MessageDetail,
    Thread,
    ThreadDetail,
    Webhook,
    WebhookCreateResult,
)

__all__ = [
    "InkboxMail",
    "InkboxError",
    "InkboxAPIError",
    "Mailbox",
    "Message",
    "MessageDetail",
    "Thread",
    "ThreadDetail",
    "Webhook",
    "WebhookCreateResult",
]
