/**
 * inkbox-phone/client.ts
 *
 * Top-level InkboxPhone client.
 */

import { HttpTransport } from "../_http.js";
import { PhoneNumbersResource } from "./resources/numbers.js";
import { CallsResource } from "./resources/calls.js";
import { TranscriptsResource } from "./resources/transcripts.js";
import { PhoneWebhooksResource } from "./resources/webhooks.js";
import { SigningKeysResource } from "../resources/signing-keys.js";

const DEFAULT_BASE_URL = "https://api.inkbox.ai/api/v1/phone";

export interface InkboxPhoneOptions {
  /** Your Inkbox API key (sent as `X-Service-Token`). */
  apiKey: string;
  /** Override the API base URL (useful for self-hosting or testing). */
  baseUrl?: string;
  /** Request timeout in milliseconds. Defaults to 30 000. */
  timeoutMs?: number;
}

/**
 * Client for the Inkbox Phone API.
 *
 * @example
 * ```ts
 * import { InkboxPhone } from "@inkbox/sdk/phone";
 *
 * const client = new InkboxPhone({ apiKey: "ApiKey_..." });
 *
 * const number = await client.numbers.provision({ agentHandle: "sales-agent" });
 *
 * const call = await client.calls.place({
 *   fromNumber: number.number,
 *   toNumber: "+15167251294",
 *   clientWebsocketUrl: "wss://your-agent.example.com/ws",
 * });
 *
 * console.log(call.status);
 * ```
 */
export class InkboxPhone {
  readonly numbers: PhoneNumbersResource;
  readonly calls: CallsResource;
  readonly transcripts: TranscriptsResource;
  readonly webhooks: PhoneWebhooksResource;
  readonly signingKeys: SigningKeysResource;

  private readonly http: HttpTransport;
  private readonly apiHttp: HttpTransport;

  constructor(options: InkboxPhoneOptions) {
    const baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
    this.http = new HttpTransport(options.apiKey, baseUrl, options.timeoutMs ?? 30_000);
    // Signing keys live at the API root (one level up from /phone)
    const apiRoot = baseUrl.replace(/\/phone\/?$/, "");
    this.apiHttp = new HttpTransport(options.apiKey, apiRoot, options.timeoutMs ?? 30_000);
    this.numbers = new PhoneNumbersResource(this.http);
    this.calls = new CallsResource(this.http);
    this.transcripts = new TranscriptsResource(this.http);
    this.webhooks = new PhoneWebhooksResource(this.http);
    this.signingKeys = new SigningKeysResource(this.apiHttp);
  }
}
