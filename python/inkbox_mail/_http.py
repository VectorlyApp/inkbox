"""
inkbox_mail/_http.py

Async HTTP transport (internal).
"""

from __future__ import annotations

from typing import Any

import httpx

from inkbox_mail.exceptions import InkboxAPIError

_DEFAULT_TIMEOUT = 30.0


class HttpTransport:
    def __init__(self, api_key: str, base_url: str, timeout: float = _DEFAULT_TIMEOUT) -> None:
        self._client = httpx.AsyncClient(
            base_url=base_url,
            headers={
                "X-Service-Token": api_key,
                "Accept": "application/json",
            },
            timeout=timeout,
        )

    async def get(self, path: str, *, params: dict[str, Any] | None = None) -> Any:
        cleaned = {k: v for k, v in (params or {}).items() if v is not None}
        resp = await self._client.get(path, params=cleaned)
        _raise_for_status(resp)
        return resp.json()

    async def post(self, path: str, *, json: dict[str, Any] | None = None) -> Any:
        resp = await self._client.post(path, json=json)
        _raise_for_status(resp)
        return resp.json()

    async def patch(self, path: str, *, json: dict[str, Any]) -> Any:
        resp = await self._client.patch(path, json=json)
        _raise_for_status(resp)
        return resp.json()

    async def delete(self, path: str) -> None:
        resp = await self._client.delete(path)
        _raise_for_status(resp)

    async def aclose(self) -> None:
        await self._client.aclose()

    async def __aenter__(self) -> HttpTransport:
        return self

    async def __aexit__(self, *_: object) -> None:
        await self.aclose()


def _raise_for_status(resp: httpx.Response) -> None:
    if resp.status_code < 400:
        return
    try:
        detail = resp.json().get("detail", resp.text)
    except Exception:
        detail = resp.text
    raise InkboxAPIError(status_code=resp.status_code, detail=str(detail))
