/**
 * inkbox-mail/resources/messages.ts
 *
 * Message operations: list (auto-paginated), get, send, flag updates, delete.
 */

import { HttpTransport } from "../_http.js";
import {
  Message,
  MessageDetail,
  RawCursorPage,
  RawMessage,
  parseMessage,
  parseMessageDetail,
} from "../types.js";

const DEFAULT_PAGE_SIZE = 50;

export class MessagesResource {
  constructor(private readonly http: HttpTransport) {}

  /**
   * Async iterator over all messages in a mailbox, newest first.
   *
   * Pagination is handled automatically — just iterate.
   *
   * @example
   * ```ts
   * for await (const msg of client.messages.list(mailboxId)) {
   *   console.log(msg.subject, msg.fromAddress);
   * }
   * ```
   */
  async *list(
    mailboxId: string,
    options?: { pageSize?: number },
  ): AsyncGenerator<Message> {
    const limit = options?.pageSize ?? DEFAULT_PAGE_SIZE;
    let cursor: string | undefined;

    while (true) {
      const page = await this.http.get<RawCursorPage<RawMessage>>(
        `/mailboxes/${mailboxId}/messages`,
        { limit, cursor },
      );
      for (const item of page.items) {
        yield parseMessage(item);
      }
      if (!page.has_more) break;
      cursor = page.next_cursor ?? undefined;
    }
  }

  /**
   * Get a message with full body content.
   *
   * @param mailboxId - UUID of the owning mailbox.
   * @param messageId - UUID of the message.
   */
  async get(mailboxId: string, messageId: string): Promise<MessageDetail> {
    const data = await this.http.get<RawMessage>(
      `/mailboxes/${mailboxId}/messages/${messageId}`,
    );
    return parseMessageDetail(data);
  }

  /**
   * Send an email from a mailbox.
   *
   * @param mailboxId - UUID of the sending mailbox.
   * @param options.to - Primary recipient addresses (at least one required).
   * @param options.subject - Email subject line.
   * @param options.bodyText - Plain-text body.
   * @param options.bodyHtml - HTML body.
   * @param options.cc - Carbon-copy recipients.
   * @param options.bcc - Blind carbon-copy recipients.
   * @param options.inReplyToMessageId - RFC 5322 Message-ID of the message being
   *   replied to. Threads the reply automatically.
   * @param options.attachments - Optional file attachments. Each entry must have
   *   `filename`, `contentType` (MIME type), and `contentBase64` (base64-encoded
   *   file content). Max total size: 25 MB. Blocked: `.exe`, `.bat`, `.scr`.
   */
  async send(
    mailboxId: string,
    options: {
      to: string[];
      subject: string;
      bodyText?: string;
      bodyHtml?: string;
      cc?: string[];
      bcc?: string[];
      inReplyToMessageId?: string;
      attachments?: Array<{
        filename: string;
        contentType: string;
        contentBase64: string;
      }>;
    },
  ): Promise<Message> {
    const recipients: Record<string, unknown> = { to: options.to };
    if (options.cc) recipients["cc"] = options.cc;
    if (options.bcc) recipients["bcc"] = options.bcc;

    const body: Record<string, unknown> = {
      recipients,
      subject: options.subject,
    };
    if (options.bodyText !== undefined) body["body_text"] = options.bodyText;
    if (options.bodyHtml !== undefined) body["body_html"] = options.bodyHtml;
    if (options.inReplyToMessageId !== undefined) {
      body["in_reply_to_message_id"] = options.inReplyToMessageId;
    }
    if (options.attachments !== undefined) {
      body["attachments"] = options.attachments.map((a) => ({
        filename: a.filename,
        content_type: a.contentType,
        content_base64: a.contentBase64,
      }));
    }

    const data = await this.http.post<RawMessage>(
      `/mailboxes/${mailboxId}/messages`,
      body,
    );
    return parseMessage(data);
  }

  /**
   * Update read/starred flags on a message.
   *
   * Pass only the flags you want to change; omitted flags are left as-is.
   */
  async updateFlags(
    mailboxId: string,
    messageId: string,
    flags: { isRead?: boolean; isStarred?: boolean },
  ): Promise<Message> {
    const body: Record<string, boolean> = {};
    if (flags.isRead !== undefined) body["is_read"] = flags.isRead;
    if (flags.isStarred !== undefined) body["is_starred"] = flags.isStarred;

    const data = await this.http.patch<RawMessage>(
      `/mailboxes/${mailboxId}/messages/${messageId}`,
      body,
    );
    return parseMessage(data);
  }

  /** Mark a message as read. */
  async markRead(mailboxId: string, messageId: string): Promise<Message> {
    return this.updateFlags(mailboxId, messageId, { isRead: true });
  }

  /** Mark a message as unread. */
  async markUnread(mailboxId: string, messageId: string): Promise<Message> {
    return this.updateFlags(mailboxId, messageId, { isRead: false });
  }

  /** Star a message. */
  async star(mailboxId: string, messageId: string): Promise<Message> {
    return this.updateFlags(mailboxId, messageId, { isStarred: true });
  }

  /** Unstar a message. */
  async unstar(mailboxId: string, messageId: string): Promise<Message> {
    return this.updateFlags(mailboxId, messageId, { isStarred: false });
  }

  /** Delete a message. */
  async delete(mailboxId: string, messageId: string): Promise<void> {
    await this.http.delete(`/mailboxes/${mailboxId}/messages/${messageId}`);
  }
}
