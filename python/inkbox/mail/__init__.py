"""
inkbox.mail — Python SDK for the Inkbox Mail API.
"""

from inkbox.mail.client import InkboxMail
from inkbox.mail.exceptions import InkboxAPIError, InkboxError
from inkbox.mail.types import (
    Mailbox,
    Message,
    MessageDetail,
    Thread,
    ThreadDetail,
)
from inkbox.signing_keys import SigningKey

__all__ = [
    "InkboxMail",
    "InkboxError",
    "InkboxAPIError",
    "Mailbox",
    "Message",
    "MessageDetail",
    "SigningKey",
    "Thread",
    "ThreadDetail",
]
