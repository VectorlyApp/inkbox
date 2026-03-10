/**
 * inkbox-phone/resources/numbers.ts
 *
 * Phone number CRUD, provisioning, release, and transcript search.
 */

import { HttpTransport } from "../../_http.js";
import {
  PhoneNumber,
  PhoneTranscript,
  RawPhoneNumber,
  RawPhoneTranscript,
  parsePhoneNumber,
  parsePhoneTranscript,
} from "../types.js";

const BASE = "/numbers";

export class PhoneNumbersResource {
  constructor(private readonly http: HttpTransport) {}

  /** List all phone numbers for your organisation. */
  async list(): Promise<PhoneNumber[]> {
    const data = await this.http.get<RawPhoneNumber[]>(BASE);
    return data.map(parsePhoneNumber);
  }

  /** Get a phone number by ID. */
  async get(phoneNumberId: string): Promise<PhoneNumber> {
    const data = await this.http.get<RawPhoneNumber>(
      `${BASE}/${phoneNumberId}`,
    );
    return parsePhoneNumber(data);
  }

  /**
   * Update phone number settings. Only provided fields are updated.
   *
   * @param phoneNumberId - UUID of the phone number.
   * @param options.incomingCallAction - `"auto_accept"`, `"auto_reject"`, or `"webhook"`.
   * @param options.defaultStreamUrl - WebSocket URL for audio bridging on `auto_accept`.
   * @param options.defaultPipelineMode - `"client_llm_only"`, `"client_llm_tts"`, or `"client_llm_tts_stt"`.
   */
  async update(
    phoneNumberId: string,
    options: {
      incomingCallAction?: string;
      defaultStreamUrl?: string;
      defaultPipelineMode?: string;
    },
  ): Promise<PhoneNumber> {
    const body: Record<string, unknown> = {};
    if (options.incomingCallAction !== undefined) {
      body["incoming_call_action"] = options.incomingCallAction;
    }
    if (options.defaultStreamUrl !== undefined) {
      body["default_stream_url"] = options.defaultStreamUrl;
    }
    if (options.defaultPipelineMode !== undefined) {
      body["default_pipeline_mode"] = options.defaultPipelineMode;
    }
    const data = await this.http.patch<RawPhoneNumber>(
      `${BASE}/${phoneNumberId}`,
      body,
    );
    return parsePhoneNumber(data);
  }

  /**
   * Provision a new phone number via Telnyx.
   *
   * @param options.type - `"toll_free"` or `"local"`. Defaults to `"toll_free"`.
   * @param options.state - US state abbreviation (e.g. `"NY"`). Only valid for `local` numbers.
   */
  async provision(
    options?: { type?: string; state?: string },
  ): Promise<PhoneNumber> {
    const body: Record<string, unknown> = {
      type: options?.type ?? "toll_free",
    };
    if (options?.state !== undefined) {
      body["state"] = options.state;
    }
    const data = await this.http.post<RawPhoneNumber>(
      `${BASE}/provision`,
      body,
    );
    return parsePhoneNumber(data);
  }

  /**
   * Release (delete) a phone number.
   *
   * @param number - E.164 formatted phone number to release.
   */
  async release(number: string): Promise<void> {
    await this.http.post(`${BASE}/release`, { number });
  }

  /**
   * Full-text search across transcripts for a phone number.
   *
   * @param phoneNumberId - UUID of the phone number.
   * @param options.q - Search query string.
   * @param options.party - Filter by speaker: `"local"` or `"remote"`.
   * @param options.limit - Maximum number of results (1–200). Defaults to 50.
   */
  async searchTranscripts(
    phoneNumberId: string,
    options: { q: string; party?: string; limit?: number },
  ): Promise<PhoneTranscript[]> {
    const data = await this.http.get<RawPhoneTranscript[]>(
      `${BASE}/${phoneNumberId}/search`,
      { q: options.q, party: options.party, limit: options.limit ?? 50 },
    );
    return data.map(parsePhoneTranscript);
  }
}
