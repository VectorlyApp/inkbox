"""
List all phone numbers attached to your Inkbox account.

Usage:
    INKBOX_API_KEY=ApiKey_... python list_agent_phone_numbers.py
"""

import os
from inkbox.phone import InkboxPhone

client = InkboxPhone(api_key=os.environ["INKBOX_API_KEY"])

numbers = client.numbers.list()

for n in numbers:
    print(f"{n.number}  type={n.type}  status={n.status}")
