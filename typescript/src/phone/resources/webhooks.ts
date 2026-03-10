/**
 * inkbox-phone/resources/webhooks.ts
 *
 * Phone webhook CRUD.
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

export class PhoneWebhooksResource {
  constructor(private readonly http: HttpTransport) {}

  /**
   * Register a webhook subscription for a phone number.
   *
   * @param phoneNumberId - UUID of the phone number.
   * @param options.url - HTTPS endpoint that will receive webhook POST requests.
   * @param options.eventTypes - Events to subscribe to (e.g. `["incoming_call"]`).
   * @returns The created webhook. `secret` is the one-time HMAC-SHA256 signing
   *   key — save it immediately, as it will not be returned again.
   */
  async create(
    phoneNumberId: string,
    options: { url: string; eventTypes: string[] },
  ): Promise<PhoneWebhookCreateResult> {
    const data = await this.http.post<RawPhoneWebhookCreateResult>(
      `/numbers/${phoneNumberId}/webhooks`,
      { url: options.url, event_types: options.eventTypes },
    );
    return parsePhoneWebhookCreateResult(data);
  }

  /** List all active webhooks for a phone number. */
  async list(phoneNumberId: string): Promise<PhoneWebhook[]> {
    const data = await this.http.get<RawPhoneWebhook[]>(
      `/numbers/${phoneNumberId}/webhooks`,
    );
    return data.map(parsePhoneWebhook);
  }

  /**
   * Update a webhook subscription. Only provided fields are updated.
   *
   * @param phoneNumberId - UUID of the phone number.
   * @param webhookId - UUID of the webhook.
   * @param options.url - New destination URL.
   * @param options.eventTypes - New event subscriptions.
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
      `/numbers/${phoneNumberId}/webhooks/${webhookId}`,
      body,
    );
    return parsePhoneWebhook(data);
  }

  /** Delete a webhook subscription. */
  async delete(phoneNumberId: string, webhookId: string): Promise<void> {
    await this.http.delete(
      `/numbers/${phoneNumberId}/webhooks/${webhookId}`,
    );
  }
}
