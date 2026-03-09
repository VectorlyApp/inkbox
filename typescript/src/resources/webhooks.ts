/**
 * inkbox-mail/resources/webhooks.ts
 *
 * Webhook CRUD.
 */

import { HttpTransport } from "../_http.js";
import {
  RawWebhook,
  RawWebhookCreateResult,
  Webhook,
  WebhookCreateResult,
  parseWebhook,
  parseWebhookCreateResult,
} from "../types.js";

export class WebhooksResource {
  constructor(private readonly http: HttpTransport) {}

  /**
   * Register a webhook subscription for a mailbox.
   *
   * @param mailboxId - UUID of the mailbox to subscribe to.
   * @param options.url - HTTPS endpoint that will receive webhook POST requests.
   * @param options.eventTypes - Events to subscribe to.
   *   Valid values: `"message.received"`, `"message.sent"`.
   * @returns The created webhook. `secret` is the one-time HMAC-SHA256 signing
   *   key — save it immediately, as it will not be returned again.
   */
  async create(
    mailboxId: string,
    options: { url: string; eventTypes: string[] },
  ): Promise<WebhookCreateResult> {
    const data = await this.http.post<RawWebhookCreateResult>(
      `/mailboxes/${mailboxId}/webhooks`,
      { url: options.url, event_types: options.eventTypes },
    );
    return parseWebhookCreateResult(data);
  }

  /** List all active webhooks for a mailbox. */
  async list(mailboxId: string): Promise<Webhook[]> {
    const data = await this.http.get<RawWebhook[]>(
      `/mailboxes/${mailboxId}/webhooks`,
    );
    return data.map(parseWebhook);
  }

  /** Delete a webhook subscription. */
  async delete(mailboxId: string, webhookId: string): Promise<void> {
    await this.http.delete(`/mailboxes/${mailboxId}/webhooks/${webhookId}`);
  }
}
