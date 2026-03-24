import { useEffect, useRef, useState } from "react";
import { ticksBidSocket, type InboundMessage, type NewHighestBidMessage } from "@/lib/ticksBidSocket";

// ─── useAuctionSocket ─────────────────────────────────────────────────────────

interface UseAuctionSocketOptions {
  auctionItemIds: string[];
  handlers: Partial<Record<string, (msg: InboundMessage) => void>>;
  enabled?: boolean;
}

/**
 * Low-level hook. Watches the given auction IDs and registers message handlers.
 * Add a key to `handlers` for each message type you care about.
 * Use "*" as a key to receive all messages.
 */
export function useAuctionSocket({ auctionItemIds, handlers, enabled = true }: UseAuctionSocketOptions) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  const idsKey = auctionItemIds.join(",");

  useEffect(() => {
    if (!enabled || auctionItemIds.length === 0) return;

    ticksBidSocket.connect();
    ticksBidSocket.watch(auctionItemIds);

    const wrappedHandlers = new Map<string, (msg: InboundMessage) => void>();

    for (const type of Object.keys(handlersRef.current)) {
      const wrapper = (msg: InboundMessage) => handlersRef.current[type]?.(msg);
      wrappedHandlers.set(type, wrapper);
      ticksBidSocket.on(type, wrapper);
    }

    return () => {
      ticksBidSocket.unwatch(auctionItemIds);
      for (const [type, wrapper] of wrappedHandlers) {
        ticksBidSocket.off(type, wrapper);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, idsKey]);
}

// ─── useHighestBid ────────────────────────────────────────────────────────────

interface HighestBidState {
  bidAmount: number | null;
  bidTimestamp: string | null;
  isLive: boolean;
}

/**
 * Convenience hook: tracks the live highest bid for a single auction.
 * `initialBid` is shown until the first WebSocket update arrives.
 */
export function useHighestBid(auctionItemId: string | undefined, initialBid?: number | null): HighestBidState {
  const [state, setState] = useState<HighestBidState>({
    bidAmount: initialBid ?? null,
    bidTimestamp: null,
    isLive: false,
  });

  const ids = useRef<string[]>([]);
  ids.current = auctionItemId ? [auctionItemId] : [];

  useAuctionSocket({
    auctionItemIds: ids.current,
    enabled: !!auctionItemId,
    handlers: {
      NewHighestBid: (msg) => {
        const bid = msg as NewHighestBidMessage;
        if (bid.auction_item_id !== auctionItemId) return;
        setState({
          bidAmount: parseFloat(bid.bid_amount),
          bidTimestamp: bid.bid_timestamp,
          isLive: true,
        });
      },
    },
  });

  return state;
}
