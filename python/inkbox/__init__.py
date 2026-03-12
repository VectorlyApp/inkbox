"""
inkbox — Python SDK for the Inkbox APIs.
"""

from inkbox.client import Inkbox
from inkbox.agent import Agent

# Exceptions (canonical source: mail; identical in all submodules)
from inkbox.mail.exceptions import InkboxAPIError, InkboxError

# Mail types
from inkbox.mail.types import (
    Mailbox,
    Message,
    MessageDetail,
    Thread,
    ThreadDetail,
    Webhook as MailWebhook,
    WebhookCreateResult as MailWebhookCreateResult,
)

# Phone types
from inkbox.phone.types import (
    PhoneCall,
    PhoneCallWithRateLimit,
    PhoneNumber,
    PhoneTranscript,
    PhoneWebhook,
    PhoneWebhookCreateResult,
    RateLimitInfo,
)

# Identity types
from inkbox.identities.types import (
    AgentIdentity,
    AgentIdentityDetail,
    IdentityMailbox,
    IdentityPhoneNumber,
)

# Signing key
from inkbox.signing_keys import SigningKey

__all__ = [
    # Entry points
    "Inkbox",
    "Agent",
    # Exceptions
    "InkboxError",
    "InkboxAPIError",
    # Mail types
    "Mailbox",
    "Message",
    "MessageDetail",
    "Thread",
    "ThreadDetail",
    "MailWebhook",
    "MailWebhookCreateResult",
    # Phone types
    "PhoneCall",
    "PhoneCallWithRateLimit",
    "PhoneNumber",
    "PhoneTranscript",
    "PhoneWebhook",
    "PhoneWebhookCreateResult",
    "RateLimitInfo",
    # Identity types
    "AgentIdentity",
    "AgentIdentityDetail",
    "IdentityMailbox",
    "IdentityPhoneNumber",
    # Signing key
    "SigningKey",
]
