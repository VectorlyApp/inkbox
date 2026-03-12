import { describe, it, expect, vi } from "vitest";
import { WebhooksResource } from "../../src/resources/webhooks.js";
import type { HttpTransport } from "../../src/_http.js";
import { RAW_WEBHOOK, RAW_WEBHOOK_CREATE } from "../sampleData.js";

function mockHttp() {
  return {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  } as unknown as HttpTransport;
}

const ADDR = "agent01@inkbox.ai";
const WEBHOOK_ID = "dddd4444-0000-0000-0000-000000000001";

describe("WebhooksResource.create", () => {
  it("posts and returns WebhookCreateResult with secret", async () => {
    const http = mockHttp();
    vi.mocked(http.post).mockResolvedValue(RAW_WEBHOOK_CREATE);
    const res = new WebhooksResource(http);

    const result = await res.create(ADDR, {
      url: "https://example.com/hooks/mail",
      eventTypes: ["message.received"],
    });

    expect(http.post).toHaveBeenCalledWith(`/mailboxes/${ADDR}/webhooks`, {
      url: "https://example.com/hooks/mail",
      event_types: ["message.received"],
    });
    expect(result.secret).toBe("test-hmac-secret-mail-abc123");
    expect(result.url).toBe("https://example.com/hooks/mail");
  });
});

describe("WebhooksResource.list", () => {
  it("returns list of webhooks", async () => {
    const http = mockHttp();
    vi.mocked(http.get).mockResolvedValue([RAW_WEBHOOK]);
    const res = new WebhooksResource(http);

    const webhooks = await res.list(ADDR);

    expect(http.get).toHaveBeenCalledWith(`/mailboxes/${ADDR}/webhooks`);
    expect(webhooks).toHaveLength(1);
    expect(webhooks[0].eventTypes).toEqual(["message.received"]);
  });
});

describe("WebhooksResource.delete", () => {
  it("calls delete on the correct path", async () => {
    const http = mockHttp();
    vi.mocked(http.delete).mockResolvedValue(undefined);
    const res = new WebhooksResource(http);

    await res.delete(ADDR, WEBHOOK_ID);

    expect(http.delete).toHaveBeenCalledWith(`/mailboxes/${ADDR}/webhooks/${WEBHOOK_ID}`);
  });
});
