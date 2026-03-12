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
   * @param emailAddress - Full email address of the mailbox to subscribe to.
   * @param options.url - HTTPS endpoint that will receive webhook POST requests.
   * @param options.eventTypes - Events to subscribe to.
   *   Valid values: `"message.received"`, `"message.sent"`.
   * @returns The created webhook. `secret` is the one-time HMAC-SHA256 signing
   *   key — save it immediately, as it will not be returned again.
   */
  async create(
    emailAddress: string,
    options: { url: string; eventTypes: string[] },
  ): Promise<WebhookCreateResult> {
    const data = await this.http.post<RawWebhookCreateResult>(
      `/mailboxes/${emailAddress}/webhooks`,
      { url: options.url, event_types: options.eventTypes },
    );
    return parseWebhookCreateResult(data);
  }

  /** List all active webhooks for a mailbox. */
  async list(emailAddress: string): Promise<Webhook[]> {
    const data = await this.http.get<RawWebhook[]>(
      `/mailboxes/${emailAddress}/webhooks`,
    );
    return data.map(parseWebhook);
  }

  /** Delete a webhook subscription. */
  async delete(emailAddress: string, webhookId: string): Promise<void> {
    await this.http.delete(`/mailboxes/${emailAddress}/webhooks/${webhookId}`);
  }
}
