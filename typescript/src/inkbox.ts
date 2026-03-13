/**
 * inkbox/src/inkbox.ts
 *
 * Inkbox — org-level entry point for all Inkbox APIs.
 */

import { HttpTransport } from "./_http.js";
import { MailboxesResource } from "./resources/mailboxes.js";
import { MessagesResource } from "./resources/messages.js";
import { ThreadsResource } from "./resources/threads.js";
import { WebhooksResource } from "./resources/webhooks.js";
import { SigningKeysResource } from "./resources/signing-keys.js";
import type { SigningKey } from "./resources/signing-keys.js";
import { PhoneNumbersResource } from "./phone/resources/numbers.js";
import { CallsResource } from "./phone/resources/calls.js";
import { TranscriptsResource } from "./phone/resources/transcripts.js";
import { PhoneWebhooksResource } from "./phone/resources/webhooks.js";
import { IdentitiesResource } from "./identities/resources/identities.js";
import { AgentIdentity } from "./agent.js";
import type { AgentIdentitySummary } from "./identities/types.js";

const DEFAULT_BASE_URL = "https://api.inkbox.ai";

export interface InkboxOptions {
  /** Your Inkbox API key (sent as `X-Service-Token`). */
  apiKey: string;
  /** Override the API base URL (useful for self-hosting or testing). */
  baseUrl?: string;
  /** Request timeout in milliseconds. Defaults to 30 000. */
  timeoutMs?: number;
}

/**
 * Org-level entry point for all Inkbox APIs.
 *
 * @example
 * ```ts
 * import { Inkbox } from "@inkbox/sdk";
 *
 * const inkbox = new Inkbox({ apiKey: process.env.INKBOX_API_KEY! });
 *
 * // Create an agent identity
 * const identity = await inkbox.createIdentity("support-bot");
 *
 * // Provision and link channels in one call each
 * const mailbox = await identity.assignMailbox({ displayName: "Support Bot" });
 * const phone   = await identity.assignPhoneNumber({ type: "toll_free" });
 *
 * // Send email directly from the identity
 * await identity.sendEmail({
 *   to: ["customer@example.com"],
 *   subject: "Your order has shipped",
 *   bodyText: "Tracking number: 1Z999AA10123456784",
 * });
 * ```
 */
export class Inkbox {
  /** @internal — used by AgentIdentity */
  readonly _mailboxes: MailboxesResource;
  /** @internal — used by AgentIdentity */
  readonly _messages: MessagesResource;
  /** @internal */
  readonly _threads: ThreadsResource;
  /** @internal */
  readonly _mailWebhooks: WebhooksResource;
  /** @internal */
  readonly _signingKeys: SigningKeysResource;

  /** @internal — used by AgentIdentity */
  readonly _numbers: PhoneNumbersResource;
  /** @internal — used by AgentIdentity */
  readonly _calls: CallsResource;
  /** @internal */
  readonly _transcripts: TranscriptsResource;
  /** @internal */
  readonly _phoneWebhooks: PhoneWebhooksResource;

  /** @internal — used by AgentIdentity to link channels */
  readonly _idsResource: IdentitiesResource;

  constructor(options: InkboxOptions) {
    const apiRoot = `${(options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "")}/api/v1`;
    const ms = options.timeoutMs ?? 30_000;

    const mailHttp  = new HttpTransport(options.apiKey, `${apiRoot}/mail`, ms);
    const phoneHttp = new HttpTransport(options.apiKey, `${apiRoot}/phone`, ms);
    const idsHttp   = new HttpTransport(options.apiKey, `${apiRoot}/identities`, ms);
    const apiHttp   = new HttpTransport(options.apiKey, apiRoot, ms);

    this._mailboxes    = new MailboxesResource(mailHttp);
    this._messages     = new MessagesResource(mailHttp);
    this._threads      = new ThreadsResource(mailHttp);
    this._mailWebhooks = new WebhooksResource(mailHttp);
    this._signingKeys  = new SigningKeysResource(apiHttp);

    this._numbers       = new PhoneNumbersResource(phoneHttp);
    this._calls         = new CallsResource(phoneHttp);
    this._transcripts   = new TranscriptsResource(phoneHttp);
    this._phoneWebhooks = new PhoneWebhooksResource(phoneHttp);

    this._idsResource = new IdentitiesResource(idsHttp);
  }

  // ------------------------------------------------------------------
  // Org-level operations
  // ------------------------------------------------------------------

  /**
   * Create a new agent identity.
   *
   * @param agentHandle - Unique handle for this identity (e.g. `"sales-bot"`).
   * @returns The created {@link AgentIdentity}.
   */
  async createIdentity(agentHandle: string): Promise<AgentIdentity> {
    await this._idsResource.create({ agentHandle });
    // POST /identities returns summary (no channel fields); fetch detail so
    // AgentIdentity has a fully-populated _AgentIdentityData.
    const data = await this._idsResource.get(agentHandle);
    return new AgentIdentity(data, this);
  }

  /**
   * Get an existing agent identity by handle.
   *
   * @param agentHandle - Handle of the identity to fetch.
   * @returns The {@link AgentIdentity}.
   */
  async getIdentity(agentHandle: string): Promise<AgentIdentity> {
    return new AgentIdentity(await this._idsResource.get(agentHandle), this);
  }

  /**
   * List all agent identities for your organisation.
   *
   * @returns Array of {@link AgentIdentitySummary}.
   */
  async listIdentities(): Promise<AgentIdentitySummary[]> {
    return this._idsResource.list();
  }

  /**
   * Create or rotate the org-level webhook signing key.
   *
   * The plaintext key is returned once — save it immediately.
   *
   * @returns The new {@link SigningKey}.
   */
  async createSigningKey(): Promise<SigningKey> {
    return this._signingKeys.createOrRotate();
  }
}
