/**
 * inkbox-phone/resources/calls.ts
 *
 * Call operations: list, get, place.
 */

import { HttpTransport } from "../../_http.js";
import {
  PhoneCall,
  RawPhoneCall,
  parsePhoneCall,
} from "../types.js";

export class CallsResource {
  constructor(private readonly http: HttpTransport) {}

  /**
   * List calls for a phone number, newest first.
   *
   * @param phoneNumberId - UUID of the phone number.
   * @param options.limit - Max results (1–200). Defaults to 50.
   * @param options.offset - Pagination offset. Defaults to 0.
   */
  async list(
    phoneNumberId: string,
    options?: { limit?: number; offset?: number },
  ): Promise<PhoneCall[]> {
    const data = await this.http.get<RawPhoneCall[]>(
      `/numbers/${phoneNumberId}/calls`,
      { limit: options?.limit ?? 50, offset: options?.offset ?? 0 },
    );
    return data.map(parsePhoneCall);
  }

  /**
   * Get a single call by ID.
   *
   * @param phoneNumberId - UUID of the phone number.
   * @param callId - UUID of the call.
   */
  async get(phoneNumberId: string, callId: string): Promise<PhoneCall> {
    const data = await this.http.get<RawPhoneCall>(
      `/numbers/${phoneNumberId}/calls/${callId}`,
    );
    return parsePhoneCall(data);
  }

  /**
   * Place an outbound call.
   *
   * @param options.fromNumber - E.164 number to call from. Must belong to your org and be active.
   * @param options.toNumber - E.164 number to call.
   * @param options.streamUrl - WebSocket URL for audio bridging.
   * @param options.callMode - Pipeline ownership: `"client_llm_only"`, `"client_llm_tts"`, or `"client_llm_tts_stt"`.
   * @param options.webhookUrl - Custom webhook URL for call lifecycle events.
   */
  async place(options: {
    fromNumber: string;
    toNumber: string;
    streamUrl: string;
    callMode?: string;
    webhookUrl?: string;
  }): Promise<PhoneCall> {
    const body: Record<string, unknown> = {
      from_number: options.fromNumber,
      to_number: options.toNumber,
      stream_url: options.streamUrl,
    };
    if (options.callMode !== undefined) {
      body["call_mode"] = options.callMode;
    }
    if (options.webhookUrl !== undefined) {
      body["webhook_url"] = options.webhookUrl;
    }
    const data = await this.http.post<RawPhoneCall>("/place-call", body);
    return parsePhoneCall(data);
  }
}
