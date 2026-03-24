/**
 * TicksBidSocket — core WebSocket service for AWS API Gateway WebSocket
 */

const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL ??
  "wss://vpp1pkncc6.execute-api.us-east-1.amazonaws.com/dev/";

const MAX_WATCHED = 20;
const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 30_000;

// ─── Inbound message types ────────────────────────────────────────────────────

export interface SessionInitializedMessage {
  type: "SessionInitialized";
  session_id: string;
  timestamp: string;
  expiration_timestamp: number;
}

export interface SessionWatchUpdatedMessage {
  type: "SessionWatchUpdated";
  session_id: string;
  timestamp: string;
}

export interface NewHighestBidMessage {
  type: "NewHighestBid";
  auction_item_id: string;
  bid_amount: string;
  bid_timestamp: string;
}

export interface AuctionParamsUpdatedMessage {
  type: "AuctionParamsUpdated";
  auction_item_id: string;
  [key: string]: unknown;
}

export interface AuctionEndingSoonMessage {
  type: "AuctionEndingSoon";
  auction_item_id: string;
  ends_at: string;
  [key: string]: unknown;
}

export interface UnknownMessage {
  type: string;
  [key: string]: unknown;
}

export type InboundMessage =
  | SessionInitializedMessage
  | SessionWatchUpdatedMessage
  | NewHighestBidMessage
  | AuctionParamsUpdatedMessage
  | AuctionEndingSoonMessage
  | UnknownMessage;

// ─── Handler registry ─────────────────────────────────────────────────────────

type MessageHandler<T extends InboundMessage = InboundMessage> = (msg: T) => void;

// ─── TicksBidSocket ───────────────────────────────────────────────────────────

export class TicksBidSocket {
  private ws: WebSocket | null = null;
  private sessionId: string | null = null;
  private watchedAuctionIds: Set<string> = new Set();
  private handlers: Map<string, Set<MessageHandler>> = new Map();
  private reconnectAttempt = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private destroyed = false;

  // ── Connection lifecycle ──────────────────────────────────────────────────

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return;
    this.destroyed = false;
    this._createSocket();
  }

  disconnect() {
    this.destroyed = true;
    this._clearReconnectTimer();
    this.ws?.close();
    this.ws = null;
    this.sessionId = null;
  }

  get isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  get currentSessionId() {
    return this.sessionId;
  }

  // ── Watch management ──────────────────────────────────────────────────────

  watch(auctionItemIds: string[]): number {
    const before = this.watchedAuctionIds.size;
    for (const id of auctionItemIds) {
      if (this.watchedAuctionIds.size >= MAX_WATCHED) {
        console.warn(`[TicksBidSocket] Max ${MAX_WATCHED} watched auctions reached.`);
        break;
      }
      this.watchedAuctionIds.add(id);
    }
    const added = this.watchedAuctionIds.size - before;
    if (added > 0) this._sendWatch();
    return added;
  }

  unwatch(auctionItemIds: string[]) {
    let changed = false;
    for (const id of auctionItemIds) {
      if (this.watchedAuctionIds.delete(id)) changed = true;
    }
    if (changed) this._sendWatch();
  }

  setWatchList(auctionItemIds: string[]) {
    this.watchedAuctionIds = new Set(auctionItemIds.slice(0, MAX_WATCHED));
    this._sendWatch();
  }

  get watchedIds(): string[] {
    return Array.from(this.watchedAuctionIds);
  }

  // ── Message handler registration ──────────────────────────────────────────

  on(type: string, handler: MessageHandler) {
    if (!this.handlers.has(type)) this.handlers.set(type, new Set());
    this.handlers.get(type)!.add(handler);
  }

  off(type: string, handler: MessageHandler) {
    this.handlers.get(type)?.delete(handler);
  }

  // ── Private ───────────────────────────────────────────────────────────────

  private _createSocket() {
    this.ws = new WebSocket(WS_URL);

    this.ws.onopen = () => {
      console.log("[TicksBidSocket] Connected");
      this.reconnectAttempt = 0;
      this._send({ action: "sessionInit" });
      if (this.watchedAuctionIds.size > 0) this._sendWatch();
    };

    this.ws.onmessage = (event: MessageEvent) => {
      let msg: InboundMessage;
      try {
        msg = JSON.parse(event.data as string) as InboundMessage;
      } catch {
        console.warn("[TicksBidSocket] Non-JSON message:", event.data);
        return;
      }

      if (msg.type === "SessionInitialized") {
        this.sessionId = (msg as SessionInitializedMessage).session_id;
      }

      this._dispatch(msg);
    };

    this.ws.onerror = (err) => {
      console.error("[TicksBidSocket] Error:", err);
    };

    this.ws.onclose = () => {
      console.log("[TicksBidSocket] Disconnected");
      this.sessionId = null;
      if (!this.destroyed) this._scheduleReconnect();
    };
  }

  private _dispatch(msg: InboundMessage) {
    this.handlers.get(msg.type)?.forEach((h) => h(msg));
    this.handlers.get("*")?.forEach((h) => h(msg));
  }

  private _send(payload: object) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    }
  }

  private _sendWatch() {
    if (!this.isConnected) return;
    this._send({
      action: "sessionWatch",
      auction_item_ids: Array.from(this.watchedAuctionIds),
    });
  }

  private _scheduleReconnect() {
    const delay = Math.min(
      RECONNECT_BASE_MS * 2 ** this.reconnectAttempt,
      RECONNECT_MAX_MS
    );
    console.log(`[TicksBidSocket] Reconnecting in ${delay}ms`);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempt++;
      this._createSocket();
    }, delay);
  }

  private _clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}

// Singleton — import this wherever you need it
export const ticksBidSocket = new TicksBidSocket();
