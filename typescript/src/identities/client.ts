/**
 * inkbox-identities/client.ts
 *
 * Top-level InkboxIdentities client.
 */

import { HttpTransport } from "../_http.js";
import { IdentitiesResource } from "./resources/identities.js";

const DEFAULT_BASE_URL = "https://api.inkbox.ai/api/v1/identities";

export interface InkboxIdentitiesOptions {
  /** Your Inkbox API key (sent as `X-Service-Token`). */
  apiKey: string;
  /** Override the API base URL (useful for self-hosting or testing). */
  baseUrl?: string;
  /** Request timeout in milliseconds. Defaults to 30 000. */
  timeoutMs?: number;
}

/**
 * Client for the Inkbox Identities API.
 *
 * @example
 * ```ts
 * import { InkboxIdentities } from "@inkbox/sdk/identities";
 *
 * const client = new InkboxIdentities({ apiKey: "ApiKey_..." });
 *
 * const identity = await client.identities.create({ agentHandle: "sales-agent" });
 *
 * const detail = await client.identities.assignMailbox("sales-agent", {
 *   mailboxId: "<mailbox-uuid>",
 * });
 *
 * console.log(detail.mailbox?.emailAddress);
 * ```
 */
export class InkboxIdentities {
  readonly identities: IdentitiesResource;

  private readonly http: HttpTransport;

  constructor(options: InkboxIdentitiesOptions) {
    this.http = new HttpTransport(
      options.apiKey,
      options.baseUrl ?? DEFAULT_BASE_URL,
      options.timeoutMs ?? 30_000,
    );
    this.identities = new IdentitiesResource(this.http);
  }
}
