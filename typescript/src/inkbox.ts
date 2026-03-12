/**
 * inkbox/src/inkbox.ts
 *
 * Unified Inkbox client — single entry point for all Inkbox APIs.
 */

import { HttpTransport } from "./_http.js";
import { MailboxesResource } from "./resources/mailboxes.js";
import { MessagesResource } from "./resources/messages.js";
import { ThreadsResource } from "./resources/threads.js";
import { WebhooksResource } from "./resources/webhooks.js";
import { SigningKeysResource } from "./resources/signing-keys.js";
import { PhoneNumbersResource } from "./phone/resources/numbers.js";
import { CallsResource } from "./phone/resources/calls.js";
import { TranscriptsResource } from "./phone/resources/transcripts.js";
import { PhoneWebhooksResource } from "./phone/resources/webhooks.js";
import { IdentitiesResource } from "./identities/resources/identities.js";
import { Agent } from "./agent.js";
import type { AgentIdentity, AgentIdentityDetail } from "./identities/types.js";

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
 * Unified client for all Inkbox APIs.
 *
 * @example
 * ```ts
 * import { Inkbox } from "@inkbox/sdk";
 *
 * const inkbox = new Inkbox({ apiKey: process.env.INKBOX_API_KEY! });
 *
 * // Create an agent identity — returns an Agent object
 * const agent = await inkbox.identities.create({ agentHandle: "support-bot" });
 *
 * // Provision and link channels in one call each
 * const mailbox = await agent.assignMailbox({ displayName: "Support Bot" });
 * const phone   = await agent.assignPhoneNumber({ type: "toll_free" });
 *
 * // Send email directly from the agent
 * await agent.sendEmail({
 *   to: ["customer@example.com"],
 *   subject: "Your order has shipped",
 *   bodyText: "Tracking number: 1Z999AA10123456784",
 * });
 * ```
 */
export class Inkbox {
  // Mail
  readonly mailboxes: MailboxesResource;
  readonly messages: MessagesResource;
  readonly threads: ThreadsResource;
  readonly mailWebhooks: WebhooksResource;
  readonly signingKeys: SigningKeysResource;

  // Phone
  readonly numbers: PhoneNumbersResource;
  readonly calls: CallsResource;
  readonly transcripts: TranscriptsResource;
  readonly phoneWebhooks: PhoneWebhooksResource;

  // Identities — returns Agent objects from create/get
  readonly identities: IdentitiesNamespace;

  /** @internal — used by Agent to link channels without going through the namespace */
  readonly _idsResource: IdentitiesResource;

  constructor(options: InkboxOptions) {
    const apiRoot = `${(options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "")}/api/v1`;
    const ms = options.timeoutMs ?? 30_000;

    const mailHttp  = new HttpTransport(options.apiKey, `${apiRoot}/mail`, ms);
    const phoneHttp = new HttpTransport(options.apiKey, `${apiRoot}/phone`, ms);
    const idsHttp   = new HttpTransport(options.apiKey, `${apiRoot}/identities`, ms);
    const apiHttp   = new HttpTransport(options.apiKey, apiRoot, ms);

    this.mailboxes    = new MailboxesResource(mailHttp);
    this.messages     = new MessagesResource(mailHttp);
    this.threads      = new ThreadsResource(mailHttp);
    this.mailWebhooks = new WebhooksResource(mailHttp);
    this.signingKeys  = new SigningKeysResource(apiHttp);

    this.numbers      = new PhoneNumbersResource(phoneHttp);
    this.calls        = new CallsResource(phoneHttp);
    this.transcripts  = new TranscriptsResource(phoneHttp);
    this.phoneWebhooks = new PhoneWebhooksResource(phoneHttp);

    this._idsResource = new IdentitiesResource(idsHttp);
    this.identities   = new IdentitiesNamespace(this._idsResource, this);
  }
}

/**
 * Thin wrapper around IdentitiesResource that returns Agent objects from
 * create() and get(), while delegating everything else directly.
 */
class IdentitiesNamespace {
  constructor(
    private readonly _r: IdentitiesResource,
    private readonly _inkbox: Inkbox,
  ) {}

  /** Create a new agent identity and return it as an {@link Agent} object. */
  async create(options: { agentHandle: string }): Promise<Agent> {
    await this._r.create(options);
    // POST /identities returns AgentIdentity (no channel fields);
    // fetch the detail so the Agent has a fully-populated AgentIdentityDetail.
    const detail = await this._r.get(options.agentHandle);
    return new Agent(detail, this._inkbox);
  }

  /** Get an existing agent identity by handle, returned as an {@link Agent} object. */
  async get(agentHandle: string): Promise<Agent> {
    return new Agent(await this._r.get(agentHandle), this._inkbox);
  }

  /** List all agent identities for your organisation. */
  list(): Promise<AgentIdentity[]> {
    return this._r.list();
  }

  /** Update an identity's handle or status. */
  update(...args: Parameters<IdentitiesResource["update"]>) {
    return this._r.update(...args);
  }

  /** Soft-delete an identity (unlinks channels without deleting them). */
  delete(...args: Parameters<IdentitiesResource["delete"]>) {
    return this._r.delete(...args);
  }

  /** Assign an existing mailbox to an identity by mailbox UUID. */
  assignMailbox(...args: Parameters<IdentitiesResource["assignMailbox"]>): Promise<AgentIdentityDetail> {
    return this._r.assignMailbox(...args);
  }

  /** Unlink a mailbox from an identity. */
  unlinkMailbox(...args: Parameters<IdentitiesResource["unlinkMailbox"]>) {
    return this._r.unlinkMailbox(...args);
  }

  /** Assign an existing phone number to an identity by phone number UUID. */
  assignPhoneNumber(...args: Parameters<IdentitiesResource["assignPhoneNumber"]>): Promise<AgentIdentityDetail> {
    return this._r.assignPhoneNumber(...args);
  }

  /** Unlink a phone number from an identity. */
  unlinkPhoneNumber(...args: Parameters<IdentitiesResource["unlinkPhoneNumber"]>) {
    return this._r.unlinkPhoneNumber(...args);
  }
}
