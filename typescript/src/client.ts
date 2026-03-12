/**
 * inkbox-mail/client.ts
 *
 * Top-level InkboxMail client.
 */

import { HttpTransport } from "./_http.js";
import { MailboxesResource } from "./resources/mailboxes.js";
import { MessagesResource } from "./resources/messages.js";
import { SigningKeysResource } from "./resources/signing-keys.js";
import { ThreadsResource } from "./resources/threads.js";

const DEFAULT_BASE_URL = "https://api.inkbox.ai/api/v1/mail";

export interface InkboxMailOptions {
  /** Your Inkbox API key (sent as `X-Service-Token`). */
  apiKey: string;
  /** Override the API base URL (useful for self-hosting or testing). */
  baseUrl?: string;
  /** Request timeout in milliseconds. Defaults to 30 000. */
  timeoutMs?: number;
}

/**
 * Async client for the Inkbox Mail API.
 *
 * @example
 * ```ts
 * import { InkboxMail } from "@inkbox/mail";
 *
 * const client = new InkboxMail({ apiKey: "ApiKey_..." });
 *
 * const mailbox = await client.mailboxes.create({ agentHandle: "sales-agent" });
 *
 * await client.messages.send(mailbox.emailAddress, {
 *   to: ["user@example.com"],
 *   subject: "Hello from Inkbox",
 *   bodyText: "Hi there!",
 * });
 *
 * for await (const msg of client.messages.list(mailbox.emailAddress)) {
 *   console.log(msg.subject, msg.fromAddress);
 * }
 * ```
 */
export class InkboxMail {
  readonly mailboxes: MailboxesResource;
  readonly messages: MessagesResource;
  readonly threads: ThreadsResource;
  readonly signingKeys: SigningKeysResource;

  private readonly http: HttpTransport;
  private readonly apiHttp: HttpTransport;

  constructor(options: InkboxMailOptions) {
    const baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
    this.http = new HttpTransport(options.apiKey, baseUrl, options.timeoutMs ?? 30_000);
    // Signing keys live at the API root (one level up from /mail)
    const apiRoot = baseUrl.replace(/\/mail\/?$/, "");
    this.apiHttp = new HttpTransport(options.apiKey, apiRoot, options.timeoutMs ?? 30_000);
    this.mailboxes = new MailboxesResource(this.http);
    this.messages = new MessagesResource(this.http);
    this.threads = new ThreadsResource(this.http);
    this.signingKeys = new SigningKeysResource(this.apiHttp);
  }
}
