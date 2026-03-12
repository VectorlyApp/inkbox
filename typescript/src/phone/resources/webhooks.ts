/**
 * inkbox-phone/resources/webhooks.ts
 *
 * Webhook CRUD for phone numbers.
 */

import { HttpTransport } from "../../_http.js";
import {
  PhoneWebhook,
  PhoneWebhookCreateResult,
  RawPhoneWebhook,
  RawPhoneWebhookCreateResult,
  parsePhoneWebhook,
  parsePhoneWebhookCreateResult,
} from "../types.js";

const BASE = "/numbers";

export class PhoneWebhooksResource {
  constructor(private readonly http: HttpTransport) {}

  /**
   * Create a webhook subscription for a phone number.
   *
   * @param phoneNumberId - UUID of the phone number.
   * @param options.url - HTTPS URL to receive webhook events.
   * @param options.eventTypes - List of event types to subscribe to.
   */
  async create(
    phoneNumberId: string,
    options: { url: string; eventTypes: string[] },
  ): Promise<PhoneWebhookCreateResult> {
    const data = await this.http.post<RawPhoneWebhookCreateResult>(
      `${BASE}/${phoneNumberId}/webhooks`,
      { url: options.url, event_types: options.eventTypes },
    );
    return parsePhoneWebhookCreateResult(data);
  }

  /** List all webhooks for a phone number. */
  async list(phoneNumberId: string): Promise<PhoneWebhook[]> {
    const data = await this.http.get<RawPhoneWebhook[]>(
      `${BASE}/${phoneNumberId}/webhooks`,
    );
    return data.map(parsePhoneWebhook);
  }

  /**
   * Update a webhook subscription. Only provided fields are updated.
   *
   * @param phoneNumberId - UUID of the phone number.
   * @param webhookId - UUID of the webhook.
   * @param options.url - New HTTPS URL.
   * @param options.eventTypes - New list of event types.
   */
  async update(
    phoneNumberId: string,
    webhookId: string,
    options: { url?: string; eventTypes?: string[] },
  ): Promise<PhoneWebhook> {
    const body: Record<string, unknown> = {};
    if (options.url !== undefined) {
      body["url"] = options.url;
    }
    if (options.eventTypes !== undefined) {
      body["event_types"] = options.eventTypes;
    }
    const data = await this.http.patch<RawPhoneWebhook>(
      `${BASE}/${phoneNumberId}/webhooks/${webhookId}`,
      body,
    );
    return parsePhoneWebhook(data);
  }

  /** Delete a webhook subscription. */
  async delete(phoneNumberId: string, webhookId: string): Promise<void> {
    await this.http.delete(
      `${BASE}/${phoneNumberId}/webhooks/${webhookId}`,
    );
  }
}
