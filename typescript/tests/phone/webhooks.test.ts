import { describe, it, expect, vi } from "vitest";
import { PhoneWebhooksResource } from "../../src/phone/resources/webhooks.js";
import type { HttpTransport } from "../../src/_http.js";
import { RAW_PHONE_WEBHOOK, RAW_PHONE_WEBHOOK_CREATE } from "../sampleData.js";

function mockHttp() {
  return {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  } as unknown as HttpTransport;
}

const NUM_ID = "aaaa1111-0000-0000-0000-000000000001";
const WEBHOOK_ID = "dddd4444-0000-0000-0000-000000000001";

describe("PhoneWebhooksResource.create", () => {
  it("posts and returns WebhookCreateResult with secret", async () => {
    const http = mockHttp();
    vi.mocked(http.post).mockResolvedValue(RAW_PHONE_WEBHOOK_CREATE);
    const res = new PhoneWebhooksResource(http);

    const result = await res.create(NUM_ID, {
      url: "https://example.com/webhooks/phone",
      eventTypes: ["incoming_call"],
    });

    expect(http.post).toHaveBeenCalledWith(`/numbers/${NUM_ID}/webhooks`, {
      url: "https://example.com/webhooks/phone",
      event_types: ["incoming_call"],
    });
    expect(result.secret).toBe("test-hmac-secret-abc123");
  });
});

describe("PhoneWebhooksResource.list", () => {
  it("returns list of webhooks", async () => {
    const http = mockHttp();
    vi.mocked(http.get).mockResolvedValue([RAW_PHONE_WEBHOOK]);
    const res = new PhoneWebhooksResource(http);

    const webhooks = await res.list(NUM_ID);

    expect(http.get).toHaveBeenCalledWith(`/numbers/${NUM_ID}/webhooks`);
    expect(webhooks).toHaveLength(1);
    expect(webhooks[0].eventTypes).toEqual(["incoming_call"]);
  });
});

describe("PhoneWebhooksResource.update", () => {
  it("sends url", async () => {
    const http = mockHttp();
    vi.mocked(http.patch).mockResolvedValue(RAW_PHONE_WEBHOOK);
    const res = new PhoneWebhooksResource(http);

    await res.update(NUM_ID, WEBHOOK_ID, { url: "https://new.example.com/hook" });

    expect(http.patch).toHaveBeenCalledWith(`/numbers/${NUM_ID}/webhooks/${WEBHOOK_ID}`, {
      url: "https://new.example.com/hook",
    });
  });

  it("sends eventTypes", async () => {
    const http = mockHttp();
    vi.mocked(http.patch).mockResolvedValue(RAW_PHONE_WEBHOOK);
    const res = new PhoneWebhooksResource(http);

    await res.update(NUM_ID, WEBHOOK_ID, { eventTypes: ["call.completed"] });

    const [, body] = vi.mocked(http.patch).mock.calls[0] as [string, Record<string, unknown>];
    expect(body["event_types"]).toEqual(["call.completed"]);
  });

  it("omits undefined fields", async () => {
    const http = mockHttp();
    vi.mocked(http.patch).mockResolvedValue(RAW_PHONE_WEBHOOK);
    const res = new PhoneWebhooksResource(http);

    await res.update(NUM_ID, WEBHOOK_ID, {});

    expect(http.patch).toHaveBeenCalledWith(`/numbers/${NUM_ID}/webhooks/${WEBHOOK_ID}`, {});
  });
});

describe("PhoneWebhooksResource.delete", () => {
  it("calls delete on the correct path", async () => {
    const http = mockHttp();
    vi.mocked(http.delete).mockResolvedValue(undefined);
    const res = new PhoneWebhooksResource(http);

    await res.delete(NUM_ID, WEBHOOK_ID);

    expect(http.delete).toHaveBeenCalledWith(`/numbers/${NUM_ID}/webhooks/${WEBHOOK_ID}`);
  });
});
