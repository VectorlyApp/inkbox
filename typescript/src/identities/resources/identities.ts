/**
 * inkbox-identities/resources/identities.ts
 *
 * Identity CRUD and channel assignment.
 */

import { HttpTransport } from "../../_http.js";
import {
  AgentIdentity,
  AgentIdentityDetail,
  RawAgentIdentity,
  RawAgentIdentityDetail,
  parseAgentIdentity,
  parseAgentIdentityDetail,
} from "../types.js";

export class IdentitiesResource {
  constructor(private readonly http: HttpTransport) {}

  /**
   * Create a new agent identity.
   *
   * @param options.agentHandle - Unique handle for this identity within your organisation
   *   (e.g. `"sales-agent"` or `"@sales-agent"`).
   */
  async create(options: { agentHandle: string }): Promise<AgentIdentity> {
    const data = await this.http.post<RawAgentIdentity>("/", {
      agent_handle: options.agentHandle,
    });
    return parseAgentIdentity(data);
  }

  /** List all identities for your organisation. */
  async list(): Promise<AgentIdentity[]> {
    const data = await this.http.get<RawAgentIdentity[]>("/");
    return data.map(parseAgentIdentity);
  }

  /**
   * Get an identity with its linked channels (mailbox, phone number).
   *
   * @param agentHandle - Handle of the identity to fetch.
   */
  async get(agentHandle: string): Promise<AgentIdentityDetail> {
    const data = await this.http.get<RawAgentIdentityDetail>(`/${agentHandle}`);
    return parseAgentIdentityDetail(data);
  }

  /**
   * Update an identity's handle or status.
   *
   * Only provided fields are applied; omitted fields are left unchanged.
   *
   * @param agentHandle - Current handle of the identity to update.
   * @param options.newHandle - New handle value.
   * @param options.status - New lifecycle status: `"active"` or `"paused"`.
   */
  async update(
    agentHandle: string,
    options: { newHandle?: string; status?: string },
  ): Promise<AgentIdentity> {
    const body: Record<string, unknown> = {};
    if (options.newHandle !== undefined) body["agent_handle"] = options.newHandle;
    if (options.status !== undefined) body["status"] = options.status;
    const data = await this.http.patch<RawAgentIdentity>(`/${agentHandle}`, body);
    return parseAgentIdentity(data);
  }

  /**
   * Soft-delete an identity.
   *
   * Unlinks any assigned channels without deleting them.
   *
   * @param agentHandle - Handle of the identity to delete.
   */
  async delete(agentHandle: string): Promise<void> {
    await this.http.delete(`/${agentHandle}`);
  }

  /**
   * Assign a mailbox to an identity.
   *
   * @param agentHandle - Handle of the identity.
   * @param options.mailboxId - UUID of the mailbox to assign.
   */
  async assignMailbox(
    agentHandle: string,
    options: { mailboxId: string },
  ): Promise<AgentIdentityDetail> {
    const data = await this.http.post<RawAgentIdentityDetail>(
      `/${agentHandle}/mailbox`,
      { mailbox_id: options.mailboxId },
    );
    return parseAgentIdentityDetail(data);
  }

  /**
   * Unlink the mailbox from an identity (does not delete the mailbox).
   *
   * @param agentHandle - Handle of the identity.
   */
  async unlinkMailbox(agentHandle: string): Promise<void> {
    await this.http.delete(`/${agentHandle}/mailbox`);
  }

  /**
   * Assign a phone number to an identity.
   *
   * @param agentHandle - Handle of the identity.
   * @param options.phoneNumberId - UUID of the phone number to assign.
   */
  async assignPhoneNumber(
    agentHandle: string,
    options: { phoneNumberId: string },
  ): Promise<AgentIdentityDetail> {
    const data = await this.http.post<RawAgentIdentityDetail>(
      `/${agentHandle}/phone_number`,
      { phone_number_id: options.phoneNumberId },
    );
    return parseAgentIdentityDetail(data);
  }

  /**
   * Unlink the phone number from an identity (does not delete the number).
   *
   * @param agentHandle - Handle of the identity.
   */
  async unlinkPhoneNumber(agentHandle: string): Promise<void> {
    await this.http.delete(`/${agentHandle}/phone_number`);
  }
}
