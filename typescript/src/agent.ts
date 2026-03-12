/**
 * inkbox/src/agent.ts
 *
 * Agent — a domain object representing one agent identity.
 * Returned by inkbox.identities.create() and inkbox.identities.get().
 *
 * Convenience methods (sendEmail, placeCall, etc.) are scoped to this
 * agent's assigned channels so callers never need to pass an email address
 * or phone number ID explicitly.
 */

import { InkboxAPIError } from "./_http.js";
import type { Message } from "./types.js";
import type { PhoneCallWithRateLimit, PhoneTranscript } from "./phone/types.js";
import type {
  AgentIdentityDetail,
  IdentityMailbox,
  IdentityPhoneNumber,
} from "./identities/types.js";
import type { Inkbox } from "./inkbox.js";

export class Agent {
  private _identity: AgentIdentityDetail;
  private readonly _inkbox: Inkbox;
  private _mailbox: IdentityMailbox | null;
  private _phoneNumber: IdentityPhoneNumber | null;

  constructor(identity: AgentIdentityDetail, inkbox: Inkbox) {
    this._identity    = identity;
    this._inkbox      = inkbox;
    this._mailbox     = identity.mailbox;
    this._phoneNumber = identity.phoneNumber;
  }

  // ------------------------------------------------------------------
  // Identity properties
  // ------------------------------------------------------------------

  get agentHandle(): string { return this._identity.agentHandle; }
  get id(): string           { return this._identity.id; }
  get status(): string       { return this._identity.status; }

  /** The mailbox currently assigned to this agent, or `null` if none. */
  get mailbox(): IdentityMailbox | null { return this._mailbox; }

  /** The phone number currently assigned to this agent, or `null` if none. */
  get phoneNumber(): IdentityPhoneNumber | null { return this._phoneNumber; }

  // ------------------------------------------------------------------
  // Channel assignment
  // Combines resource creation/provisioning + identity linking in one call.
  // ------------------------------------------------------------------

  /**
   * Create a new mailbox and assign it to this agent.
   *
   * @param options.displayName - Optional human-readable sender name.
   * @returns The assigned {@link IdentityMailbox}.
   */
  async assignMailbox(options: { displayName?: string } = {}): Promise<IdentityMailbox> {
    const mailbox = await this._inkbox.mailboxes.create(options);
    const detail  = await this._inkbox._idsResource.assignMailbox(this.agentHandle, {
      mailboxId: mailbox.id,
    });
    this._mailbox   = detail.mailbox;
    this._identity  = detail;
    return this._mailbox!;
  }

  /**
   * Provision a new phone number and assign it to this agent.
   *
   * @param options.type - `"toll_free"` (default) or `"local"`.
   * @param options.state - US state abbreviation (e.g. `"NY"`), valid for local numbers only.
   * @returns The assigned {@link IdentityPhoneNumber}.
   */
  async assignPhoneNumber(
    options: { type?: string; state?: string } = {},
  ): Promise<IdentityPhoneNumber> {
    const number = await this._inkbox.numbers.provision(options);
    const detail = await this._inkbox._idsResource.assignPhoneNumber(this.agentHandle, {
      phoneNumberId: number.id,
    });
    this._phoneNumber = detail.phoneNumber;
    this._identity    = detail;
    return this._phoneNumber!;
  }

  // ------------------------------------------------------------------
  // Mail helpers
  // ------------------------------------------------------------------

  /**
   * Send an email from this agent's mailbox.
   *
   * @param options.to - Primary recipient addresses (at least one required).
   * @param options.subject - Email subject line.
   * @param options.bodyText - Plain-text body.
   * @param options.bodyHtml - HTML body.
   * @param options.cc - Carbon-copy recipients.
   * @param options.bcc - Blind carbon-copy recipients.
   * @param options.inReplyToMessageId - RFC 5322 Message-ID to thread a reply.
   * @param options.attachments - File attachments.
   */
  async sendEmail(options: {
    to: string[];
    subject: string;
    bodyText?: string;
    bodyHtml?: string;
    cc?: string[];
    bcc?: string[];
    inReplyToMessageId?: string;
    attachments?: Array<{ filename: string; contentType: string; contentBase64: string }>;
  }): Promise<Message> {
    this._requireMailbox();
    return this._inkbox.messages.send(this._mailbox!.emailAddress, options);
  }

  /**
   * Iterate over messages in this agent's inbox, newest first.
   *
   * Pagination is handled automatically.
   *
   * @param options.pageSize - Messages fetched per API call (1–100). Defaults to 50.
   * @param options.direction - Filter by `"inbound"` or `"outbound"`.
   */
  messages(options: { pageSize?: number; direction?: "inbound" | "outbound" } = {}): AsyncGenerator<Message> {
    this._requireMailbox();
    return this._inkbox.messages.list(this._mailbox!.emailAddress, options);
  }

  // ------------------------------------------------------------------
  // Phone helpers
  // ------------------------------------------------------------------

  /**
   * Place an outbound call from this agent's phone number.
   *
   * @param options.toNumber - E.164 destination number.
   * @param options.streamUrl - WebSocket URL (wss://) for audio bridging.
   * @param options.pipelineMode - Pipeline mode override for this call.
   * @param options.webhookUrl - Custom webhook URL for call lifecycle events.
   */
  async placeCall(options: {
    toNumber: string;
    streamUrl?: string;
    pipelineMode?: string;
    webhookUrl?: string;
  }): Promise<PhoneCallWithRateLimit> {
    this._requirePhone();
    return this._inkbox.calls.place({
      fromNumber: this._phoneNumber!.number,
      toNumber:   options.toNumber,
      streamUrl:  options.streamUrl,
      pipelineMode: options.pipelineMode,
      webhookUrl: options.webhookUrl,
    });
  }

  /**
   * Full-text search across call transcripts for this agent's number.
   *
   * @param options.q - Search query string.
   * @param options.party - Filter by speaker: `"local"` or `"remote"`.
   * @param options.limit - Maximum number of results (1–200). Defaults to 50.
   */
  async searchTranscripts(options: {
    q: string;
    party?: string;
    limit?: number;
  }): Promise<PhoneTranscript[]> {
    this._requirePhone();
    return this._inkbox.numbers.searchTranscripts(this._phoneNumber!.id, options);
  }

  // ------------------------------------------------------------------
  // Misc
  // ------------------------------------------------------------------

  /**
   * Re-fetch this agent's identity from the API and update cached channels.
   *
   * @returns `this` for chaining.
   */
  async refresh(): Promise<Agent> {
    const detail      = await this._inkbox._idsResource.get(this.agentHandle);
    this._identity    = detail;
    this._mailbox     = detail.mailbox;
    this._phoneNumber = detail.phoneNumber;
    return this;
  }

  /** Soft-delete this identity (unlinks channels without deleting them). */
  async delete(): Promise<void> {
    await this._inkbox._idsResource.delete(this.agentHandle);
  }

  // ------------------------------------------------------------------
  // Internal guards
  // ------------------------------------------------------------------

  private _requireMailbox(): void {
    if (!this._mailbox) {
      throw new InkboxAPIError(
        0,
        `Agent '${this.agentHandle}' has no mailbox assigned. Call agent.assignMailbox() first.`,
      );
    }
  }

  private _requirePhone(): void {
    if (!this._phoneNumber) {
      throw new InkboxAPIError(
        0,
        `Agent '${this.agentHandle}' has no phone number assigned. Call agent.assignPhoneNumber() first.`,
      );
    }
  }
}
