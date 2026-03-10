/**
 * inkbox-phone TypeScript SDK — public types.
 */

export interface PhoneNumber {
  id: string;
  number: string;
  /** "toll_free" | "local" */
  type: string;
  /** "active" | "paused" | "released" */
  status: string;
  /** "auto_accept" | "auto_reject" | "webhook" */
  incomingCallAction: string;
  defaultStreamUrl: string | null;
  /** "client_llm_only" | "client_llm_tts" | "client_llm_tts_stt" */
  defaultPipelineMode: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PhoneCall {
  id: string;
  localPhoneNumber: string;
  remotePhoneNumber: string;
  /** "outbound" | "inbound" */
  direction: string;
  /** "initiated" | "ringing" | "answered" | "completed" | "failed" | "canceled" */
  status: string;
  /** "client_llm_only" | "client_llm_tts" | "client_llm_tts_stt" */
  pipelineMode: string;
  streamUrl: string | null;
  startedAt: Date | null;
  endedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PhoneTranscript {
  id: string;
  callId: string;
  seq: number;
  tsMs: number;
  /** "local" | "remote" | "system" */
  party: string;
  text: string;
  createdAt: Date;
}

export interface PhoneWebhook {
  id: string;
  sourceId: string;
  sourceType: string;
  url: string;
  eventTypes: string[];
  /** "active" | "paused" | "deleted" */
  status: string;
  createdAt: Date;
}

export interface PhoneWebhookCreateResult extends PhoneWebhook {
  /** One-time HMAC-SHA256 signing secret. Save immediately — not returned again. */
  secret: string;
}

// ---- internal raw API shapes (snake_case from JSON) ----

export interface RawPhoneNumber {
  id: string;
  number: string;
  type: string;
  status: string;
  incoming_call_action: string;
  default_stream_url: string | null;
  default_pipeline_mode: string;
  created_at: string;
  updated_at: string;
}

export interface RawPhoneCall {
  id: string;
  local_phone_number: string;
  remote_phone_number: string;
  direction: string;
  status: string;
  pipeline_mode: string;
  stream_url: string | null;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface RawPhoneTranscript {
  id: string;
  call_id: string;
  seq: number;
  ts_ms: number;
  party: string;
  text: string;
  created_at: string;
}

export interface RawPhoneWebhook {
  id: string;
  source_id: string;
  source_type: string;
  url: string;
  event_types: string[];
  status: string;
  created_at: string;
}

export interface RawPhoneWebhookCreateResult extends RawPhoneWebhook {
  secret: string;
}

// ---- parsers ----

export function parsePhoneNumber(r: RawPhoneNumber): PhoneNumber {
  return {
    id: r.id,
    number: r.number,
    type: r.type,
    status: r.status,
    incomingCallAction: r.incoming_call_action,
    defaultStreamUrl: r.default_stream_url,
    defaultPipelineMode: r.default_pipeline_mode ?? "client_llm_only",
    createdAt: new Date(r.created_at),
    updatedAt: new Date(r.updated_at),
  };
}

export function parsePhoneCall(r: RawPhoneCall): PhoneCall {
  return {
    id: r.id,
    localPhoneNumber: r.local_phone_number,
    remotePhoneNumber: r.remote_phone_number,
    direction: r.direction,
    status: r.status,
    pipelineMode: r.pipeline_mode ?? "client_llm_only",
    streamUrl: r.stream_url,
    startedAt: r.started_at ? new Date(r.started_at) : null,
    endedAt: r.ended_at ? new Date(r.ended_at) : null,
    createdAt: new Date(r.created_at),
    updatedAt: new Date(r.updated_at),
  };
}

export function parsePhoneTranscript(r: RawPhoneTranscript): PhoneTranscript {
  return {
    id: r.id,
    callId: r.call_id,
    seq: r.seq,
    tsMs: r.ts_ms,
    party: r.party,
    text: r.text,
    createdAt: new Date(r.created_at),
  };
}

export function parsePhoneWebhook(r: RawPhoneWebhook): PhoneWebhook {
  return {
    id: r.id,
    sourceId: r.source_id,
    sourceType: r.source_type,
    url: r.url,
    eventTypes: r.event_types,
    status: r.status,
    createdAt: new Date(r.created_at),
  };
}

export function parsePhoneWebhookCreateResult(
  r: RawPhoneWebhookCreateResult,
): PhoneWebhookCreateResult {
  return { ...parsePhoneWebhook(r), secret: r.secret };
}
