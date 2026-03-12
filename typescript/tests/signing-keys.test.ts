import { describe, it, expect, vi } from "vitest";
import { SigningKeysResource } from "../src/resources/signing-keys.js";
import { HttpTransport } from "../src/_http.js";
import { RAW_SIGNING_KEY } from "./sampleData.js";

function makeResource() {
  const http = { post: vi.fn() } as unknown as HttpTransport;
  const resource = new SigningKeysResource(http);
  return { resource, http: http as { post: ReturnType<typeof vi.fn> } };
}

describe("SigningKeysResource", () => {
  describe("createOrRotate", () => {
    it("calls POST /signing-keys with empty body", async () => {
      const { resource, http } = makeResource();
      http.post.mockResolvedValue(RAW_SIGNING_KEY);

      await resource.createOrRotate();

      expect(http.post).toHaveBeenCalledOnce();
      expect(http.post).toHaveBeenCalledWith("/signing-keys", {});
    });

    it("parses signingKey and createdAt from response", async () => {
      const { resource, http } = makeResource();
      http.post.mockResolvedValue(RAW_SIGNING_KEY);

      const key = await resource.createOrRotate();

      expect(key.signingKey).toBe("sk-test-hmac-secret-abc123");
      expect(key.createdAt).toBeInstanceOf(Date);
      expect(key.createdAt.toISOString()).toBe("2026-03-09T00:00:00.000Z");
    });
  });
});
