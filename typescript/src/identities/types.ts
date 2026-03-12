/**
 * inkbox-identities TypeScript SDK — public types.
 */

export interface IdentityMailbox {
  id: string;
  emailAddress: string;
  displayName: string | null;
  /** "active" | "paused" | "deleted" */
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IdentityPhoneNumber {
  id: string;
  number: string;
  /** "toll_free" | "local" */
  type: string;
  /** "active" | "paused" | "released" */
  status: string;
  /** "auto_accept" | "auto_reject" | "webhook" */
  incomingCallAction: string;
  clientWebsocketUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentIdentity {
  id: string;
  organizationId: string;
  agentHandle: string;
  /** "active" | "paused" | "deleted" */
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentIdentityDetail extends AgentIdentity {
  /** Mailbox assigned to this identity, or null if unlinked. */
  mailbox: IdentityMailbox | null;
  /** Phone number assigned to this identity, or null if unlinked. */
  phoneNumber: IdentityPhoneNumber | null;
}

// ---- internal raw API shapes (snake_case from JSON) ----

export interface RawIdentityMailbox {
  id: string;
  email_address: string;
  display_name: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface RawIdentityPhoneNumber {
  id: string;
  number: string;
  type: string;
  status: string;
  incoming_call_action: string;
  client_websocket_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface RawAgentIdentity {
  id: string;
  organization_id: string;
  agent_handle: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface RawAgentIdentityDetail extends RawAgentIdentity {
  mailbox: RawIdentityMailbox | null;
  phone_number: RawIdentityPhoneNumber | null;
}

// ---- parsers ----

export function parseIdentityMailbox(r: RawIdentityMailbox): IdentityMailbox {
  return {
    id: r.id,
    emailAddress: r.email_address,
    displayName: r.display_name,
    status: r.status,
    createdAt: new Date(r.created_at),
    updatedAt: new Date(r.updated_at),
  };
}

export function parseIdentityPhoneNumber(r: RawIdentityPhoneNumber): IdentityPhoneNumber {
  return {
    id: r.id,
    number: r.number,
    type: r.type,
    status: r.status,
    incomingCallAction: r.incoming_call_action,
    clientWebsocketUrl: r.client_websocket_url,
    createdAt: new Date(r.created_at),
    updatedAt: new Date(r.updated_at),
  };
}

export function parseAgentIdentity(r: RawAgentIdentity): AgentIdentity {
  return {
    id: r.id,
    organizationId: r.organization_id,
    agentHandle: r.agent_handle,
    status: r.status,
    createdAt: new Date(r.created_at),
    updatedAt: new Date(r.updated_at),
  };
}

export function parseAgentIdentityDetail(r: RawAgentIdentityDetail): AgentIdentityDetail {
  return {
    ...parseAgentIdentity(r),
    mailbox: r.mailbox ? parseIdentityMailbox(r.mailbox) : null,
    phoneNumber: r.phone_number ? parseIdentityPhoneNumber(r.phone_number) : null,
  };
}
