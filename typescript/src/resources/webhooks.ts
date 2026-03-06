/**
 * inkbox-mail/resources/webhooks.ts
 *
 * Webhook CRUD.
 */

import { HttpTransport } from "../_http.js";
import { RawWebhook, Webhook, parseWebhook } from "../types.js";

export class WebhooksResource {
  constructor(private readonly http: HttpTransport) {}

  /**
   * Register a webhook subscription for a mailbox.
   *
   * @param mailboxId - UUID of the mailbox to subscribe to.
   * @param options.url - HTTPS endpoint that will receive webhook POST requests.
   * @param options.eventTypes - Events to subscribe to.
   *   Valid values: `"message.received"`, `"message.sent"`.
   */
  async create(
    mailboxId: string,
    options: { url: string; eventTypes: string[] },
  ): Promise<Webhook> {
    const data = await this.http.post<RawWebhook>(
      `/mailboxes/${mailboxId}/webhooks`,
      { url: options.url, event_types: options.eventTypes },
    );
    return parseWebhook(data);
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
