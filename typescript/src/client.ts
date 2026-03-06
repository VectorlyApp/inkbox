/**
 * inkbox-mail/client.ts
 *
 * Top-level InkboxMail client.
 */

import { HttpTransport } from "./_http.js";
import { MailboxesResource } from "./resources/mailboxes.js";
import { MessagesResource } from "./resources/messages.js";
import { ThreadsResource } from "./resources/threads.js";
import { WebhooksResource } from "./resources/webhooks.js";

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
 * const client = new InkboxMail({ apiKey: "sk-..." });
 *
 * const mailbox = await client.mailboxes.create({ addressLocalPart: "agent-01" });
 *
 * await client.messages.send(mailbox.id, {
 *   to: ["user@example.com"],
 *   subject: "Hello from Inkbox",
 *   bodyText: "Hi there!",
 * });
 *
 * for await (const msg of client.messages.list(mailbox.id)) {
 *   console.log(msg.subject, msg.fromAddress);
 * }
 * ```
 */
export class InkboxMail {
  readonly mailboxes: MailboxesResource;
  readonly messages: MessagesResource;
  readonly threads: ThreadsResource;
  readonly webhooks: WebhooksResource;

  private readonly http: HttpTransport;

  constructor(options: InkboxMailOptions) {
    this.http = new HttpTransport(
      options.apiKey,
      options.baseUrl ?? DEFAULT_BASE_URL,
      options.timeoutMs ?? 30_000,
    );
    this.mailboxes = new MailboxesResource(this.http);
    this.messages = new MessagesResource(this.http);
    this.threads = new ThreadsResource(this.http);
    this.webhooks = new WebhooksResource(this.http);
  }
}
