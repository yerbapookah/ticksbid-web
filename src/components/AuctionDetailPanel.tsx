"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ComposedChart,
} from "recharts";

interface Bid {
  auction_item_id: string;
  bid_timestamp: string;
  bid_amount: number;
  bidder_name?: string;
}

interface FlashBid {
  id: string;
  ticket_id: string;
  offer_amount: number;
  bidder_name: string;
  status: string;
  expires_at: string;
  created_at: string;
}

interface AuctionDetail {
  id: string;
  end_time: string;
  reserve_price: number;
  buy_it_now_price: number;
  bids: Bid[];
}

interface AuctionDetailPanelProps {
  ticketId: string;
  reservePrice?: number;
  buyItNowPrice?: number;
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
    " " +
    d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function estimateFairValue(bids: Bid[], reservePrice: number, buyItNowPrice: number): number {
  if (bids.length === 0) return reservePrice;
  if (bids.length === 1) return bids[0].bid_amount * 1.15;

  // Sort by time
  const sorted = [...bids].sort(
    (a, b) => new Date(a.bid_timestamp).getTime() - new Date(b.bid_timestamp).getTime()
  );

  // Weight recent bids more heavily
  const recentBids = sorted.slice(-5);
  const weightedSum = recentBids.reduce((sum, bid, i) => {
    const weight = i + 1; // More recent = higher weight
    return sum + bid.bid_amount * weight;
  }, 0);
  const totalWeight = recentBids.reduce((sum, _, i) => sum + (i + 1), 0);
  const weightedAvg = weightedSum / totalWeight;

  // Factor in bid velocity
  if (sorted.length >= 2) {
    const firstBid = sorted[0].bid_amount;
    const lastBid = sorted[sorted.length - 1].bid_amount;
    const growth = lastBid / firstBid;
    const projected = weightedAvg * (1 + (growth - 1) * 0.3);
    return Math.min(projected, buyItNowPrice * 0.95);
  }

  return Math.min(weightedAvg * 1.1, buyItNowPrice * 0.95);
}

// Custom tooltip
function ChartTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  const amount = data.flash_line ?? data.bid_amount;
  if (amount == null) return null;
  const isFlash = data.isFlash;
  return (
    <div style={{ backgroundColor: 'var(--bg-card)', border: `1px solid ${isFlash ? 'var(--amber)' : 'var(--border)'}`, borderRadius: '8px', padding: '10px 14px' }}>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
        {data.timeLabel}
      </p>
      {isFlash && (
        <p style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>
          ⚡ Flash Bid
        </p>
      )}
      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: isFlash ? 'var(--amber)' : 'var(--text-primary)' }}>
        ${amount.toFixed(2)}
      </p>
      {data.bidder && (
        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          by {data.bidder}
        </p>
      )}
    </div>
  );
}

export default function AuctionDetailPanel({ ticketId, reservePrice, buyItNowPrice }: AuctionDetailPanelProps) {
  const [auction, setAuction] = useState<AuctionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [flashBids, setFlashBids] = useState<FlashBid[]>([]);

  useEffect(() => {
    async function fetchAuction() {
      try {
        const [auctionRes, flashRes] = await Promise.all([
          fetch(`/api/auctions?ticket_id=${ticketId}`),
          fetch(`/api/offers?ticket_id=${ticketId}`),
        ]);
        if (!auctionRes.ok) throw new Error("Failed to fetch");
        const data = await auctionRes.json();
        if (data.length > 0) {
          setAuction(data[0]);
        }
        if (flashRes.ok) {
          const offers = await flashRes.json();
          // Only show pending flash bids that haven't expired
          const pending = (offers || []).filter((o: FlashBid) => o.status === "pending" && new Date(o.expires_at) > new Date());
          setFlashBids(pending);
        }
      } catch {
        setError("Failed to load auction data");
      } finally {
        setLoading(false);
      }
    }
    fetchAuction();
  }, [ticketId]);

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <div className="skeleton" style={{ height: '200px', borderRadius: '8px' }} />
      </div>
    );
  }

  if (error || !auction) {
    return (
      <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        {error || "No auction data available"}
      </div>
    );
  }

  const bids = auction.bids || [];
  const sortedBids = [...bids].sort(
    (a, b) => new Date(a.bid_timestamp).getTime() - new Date(b.bid_timestamp).getTime()
  );

  // Chart data — merge regular bids + pending flash bids with connecting orange lines
  const highestRegularBid = sortedBids.length > 0 ? sortedBids[sortedBids.length - 1].bid_amount : 0;

  interface ChartPoint {
    time: number;
    timeLabel: string;
    bid_amount: number | null;
    flash_line: number | null;
    bidder: string;
    isFlash: boolean;
  }

  const regularChartData: ChartPoint[] = sortedBids.map((bid) => ({
    time: new Date(bid.bid_timestamp).getTime(),
    timeLabel: formatTime(bid.bid_timestamp),
    bid_amount: bid.bid_amount,
    flash_line: null,
    bidder: bid.bidder_name || "Anonymous",
    isFlash: false,
  }));

  // Anchor flash line on the last regular bid point, then draw up to flash bid
  if (flashBids.length > 0 && regularChartData.length > 0) {
    // Set flash_line on the last regular bid so the orange line starts there
    regularChartData[regularChartData.length - 1].flash_line = highestRegularBid;
  }

  const flashPoints: ChartPoint[] = [];
  for (const fb of flashBids) {
    const fbTime = new Date(fb.created_at).getTime();
    const fbAmount = parseFloat(String(fb.offer_amount));
    flashPoints.push({
      time: fbTime,
      timeLabel: formatTime(fb.created_at),
      bid_amount: null,
      flash_line: fbAmount,
      bidder: fb.bidder_name || "Anonymous",
      isFlash: true,
    });
  }

  const chartData = [...regularChartData, ...flashPoints].sort((a, b) => a.time - b.time);

  // Stats
  const totalBids = bids.length + flashBids.length;
  const uniqueBidders = new Set([
    ...bids.map((b) => b.bidder_name || b.auction_item_id),
    ...flashBids.map((fb) => fb.bidder_name),
  ]).size;
  const highestBid = bids.length > 0 ? Math.max(...bids.map((b) => b.bid_amount)) : 0;
  const reserve = reservePrice ?? auction.reserve_price;
  const bin = buyItNowPrice ?? auction.buy_it_now_price;
  const fairValue = estimateFairValue(bids, reserve, bin);

  // Y-axis domain — include flash bid amounts
  const allAmounts = [
    ...bids.map(b => b.bid_amount),
    ...flashBids.map(fb => parseFloat(String(fb.offer_amount))),
  ];
  const yMin = allAmounts.length > 0 ? Math.floor(Math.min(...allAmounts) * 0.9) : 0;
  const yMax = Math.ceil(bin * 1.05);

  return (
    <div style={{ padding: '16px 0 0' }}>
      {/* Chart */}
      {(bids.length > 0 || flashBids.length > 0) ? (
        <div style={{ width: '100%', height: '200px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id={`bidGradient-${ticketId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                vertical={false}
              />
              <XAxis
                dataKey="time"
                type="number"
                scale="time"
                domain={['dataMin', 'dataMax']}
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                axisLine={{ stroke: 'var(--border)' }}
                tickLine={false}
                tickFormatter={(ts) => {
                  const d = new Date(ts);
                  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                }}
              />
              <YAxis
                domain={[yMin, yMax]}
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                axisLine={{ stroke: 'var(--border)' }}
                tickLine={false}
                tickFormatter={(v) => `$${v}`}
                width={55}
              />
              <Tooltip content={<ChartTooltip />} />
              <ReferenceLine
                y={reserve}
                stroke="var(--amber)"
                strokeDasharray="4 4"
                strokeWidth={1}
                label={{
                  value: "Reserve $" + reserve,
                  position: "insideBottomRight",
                  fill: "var(--amber)",
                  fontSize: 10,
                }}
              />
              <ReferenceLine
                y={bin}
                stroke="var(--green)"
                strokeDasharray="4 4"
                strokeWidth={1}
                label={{
                  value: `Buy Now $${bin}`,
                  position: "insideBottomRight",
                  fill: "var(--green)",
                  fontSize: 10,
                }}
              />
              <Area
                type="stepAfter"
                dataKey="bid_amount"
                stroke="#6366f1"
                strokeWidth={2}
                fill={`url(#bidGradient-${ticketId})`}
                dot={{
                  r: 4,
                  fill: '#6366f1',
                  stroke: 'var(--bg-secondary)',
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 6,
                  fill: '#818cf8',
                  stroke: '#fff',
                  strokeWidth: 2,
                }}
                connectNulls={false}
              />
              <Area
                type="stepAfter"
                dataKey="flash_line"
                stroke="var(--amber)"
                strokeWidth={2}
                fill="none"
                dot={(props: any) => {
                  const { cx, cy, payload } = props;
                  if (cx == null || cy == null || payload.flash_line == null) return <g />;
                  // Only show dot on the actual flash bid point, not the connection point
                  if (payload.flash_line === highestRegularBid && !payload.isFlash) return <g />;
                  const isConnectionPoint = Math.abs(payload.flash_line - highestRegularBid) < 0.01;
                  if (isConnectionPoint) return <g />;
                  return (
                    <g key={`flash-${cx}-${cy}`}>
                      <circle cx={cx} cy={cy} r={7} fill="var(--amber)" opacity={0.2} />
                      <circle cx={cx} cy={cy} r={4} fill="var(--amber)" stroke="var(--bg-secondary)" strokeWidth={2} />
                    </g>
                  );
                }}
                activeDot={{
                  r: 6,
                  fill: 'var(--amber)',
                  stroke: '#fff',
                  strokeWidth: 2,
                }}
                connectNulls={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div style={{
          height: '160px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px dashed var(--border)',
          borderRadius: '8px',
          color: 'var(--text-muted)',
          fontSize: '0.875rem',
        }}>
          No bids yet — be the first to bid!
        </div>
      )}

      {/* Stats row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '12px',
        marginTop: '16px',
      }}>
        <div style={{
          padding: '12px',
          borderRadius: '8px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column' as const,
          justifyContent: 'space-between',
        }}>
          <p style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '4px' }}>
            Total Bids
          </p>
          <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 'auto' }}>
            {totalBids}
          </p>
        </div>

        <div style={{
          padding: '12px',
          borderRadius: '8px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column' as const,
          justifyContent: 'space-between',
        }}>
          <p style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '4px' }}>
            Unique Bidders
          </p>
          <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 'auto' }}>
            {uniqueBidders}
          </p>
        </div>

        <div style={{
          padding: '12px',
          borderRadius: '8px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column' as const,
          justifyContent: 'space-between',
        }}>
          <p style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '4px' }}>
            Est. Fair Value
          </p>
          <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent)', marginTop: 'auto' }}>
            ${fairValue.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Bid history table */}
      {(bids.length > 0 || flashBids.length > 0) && (
        <div style={{ marginTop: '16px' }}>
          <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>
            Bid History
          </p>
          <div style={{ maxHeight: '140px', overflowY: 'auto', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }}>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 600 }}>Bidder</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 600 }}>Amount</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 600 }}>Time</th>
                </tr>
              </thead>
              <tbody>
                {/* Flash bids first */}
                {flashBids.map((fb) => (
                  <tr key={`flash-${fb.id}`} style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'rgba(245, 158, 11, 0.05)' }}>
                    <td style={{ padding: '8px 12px', fontSize: '0.8rem', color: 'var(--amber)' }}>
                      ⚡ {fb.bidder_name || "Anonymous"}
                    </td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', fontSize: '0.8rem', fontWeight: 600, color: 'var(--amber)', fontVariantNumeric: 'tabular-nums' }}>
                      ${parseFloat(String(fb.offer_amount)).toFixed(2)}
                    </td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {formatTime(fb.created_at)}
                    </td>
                  </tr>
                ))}
                {/* Regular bids */}
                {[...sortedBids].reverse().map((bid, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '8px 12px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {bid.bidder_name || "Anonymous"}
                    </td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                      ${bid.bid_amount.toFixed(2)}
                    </td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {formatTime(bid.bid_timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
