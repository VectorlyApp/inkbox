/**
 * Org-level webhook signing key management.
 *
 * Shared across all Inkbox clients (mail, phone, etc.).
 */

import { HttpTransport } from "../_http.js";

const PATH = "/signing-keys";

export interface SigningKey {
  /** Plaintext signing key — returned once on creation/rotation. Store securely. */
  signingKey: string;
  createdAt: Date;
}

interface RawSigningKey {
  signing_key: string;
  created_at: string;
}

function parseSigningKey(r: RawSigningKey): SigningKey {
  return {
    signingKey: r.signing_key,
    createdAt: new Date(r.created_at),
  };
}

export class SigningKeysResource {
  constructor(private readonly http: HttpTransport) {}

  /**
   * Create or rotate the webhook signing key for your organisation.
   *
   * The first call creates a new key; subsequent calls rotate (replace) the
   * existing key. The plaintext `signingKey` is returned **once** —
   * store it securely as it cannot be retrieved again.
   *
   * Use the returned key to verify `X-Inkbox-Signature` headers on
   * incoming webhook requests.
   */
  async createOrRotate(): Promise<SigningKey> {
    const data = await this.http.post<RawSigningKey>(PATH, {});
    return parseSigningKey(data);
  }
}
