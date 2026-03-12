/**
 * inkbox-mail/resources/webhooks.ts
 *
 * Webhook CRUD for mailboxes.
 */

import { HttpTransport } from "../_http.js";
import {
  Webhook,
  WebhookCreateResult,
  RawWebhook,
  RawWebhookCreateResult,
  parseWebhook,
  parseWebhookCreateResult,
} from "../types.js";

export class WebhooksResource {
  constructor(private readonly http: HttpTransport) {}

  /**
   * Create a webhook subscription for a mailbox.
   *
   * @param mailboxId - Email address or UUID of the mailbox.
   * @param options.url - HTTPS URL to receive webhook events.
   * @param options.eventTypes - List of event types to subscribe to.
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

  /** List all webhooks for a mailbox. */
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
