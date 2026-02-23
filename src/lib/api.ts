const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://p1xy94s1ni.execute-api.us-east-1.amazonaws.com/dev";

export interface Venue {
  id: string;
  name: string;
  address: string;
  venue_type: string;
  max_capacity: number;
}

export interface Ticket {
  id: string;
  event_id: string;
  seat_section: string;
  seat_row: string;
  seat_number: string;
  ticket_type?: string;
}

export interface Event {
  id: string;
  name: string;
  event_type: string;
  venue_id: string;
  start_time: string;
  thumbnail_url?: string;
  event_url?: string;
  tickets: Ticket[];
  venue: Venue;
}

export interface EventSummary {
  id: string;
  name: string;
  event_type: string;
  venue_id: string;
  start_time: string;
  thumbnail_url?: string;
}

export interface Bid {
  auction_item_id: string;
  bid_timestamp: string;
  bid_amount: number;
}

export interface Auction {
  id: string;
  end_time: string;
  reserve_price: number;
  buy_it_now_price: number;
  bids: Bid[];
}

export interface AuctionState {
  auction_item_id: string;
  auction_status: string;
  end_time: string;
  reserve_price: number;
  buy_it_now_price: number;
}

async function apiFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${API_BASE}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v) url.searchParams.set(k, v);
    });
  }
  const res = await fetch(url.toString(), { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function searchEvents(q?: string, eventType?: string, limit = 20): Promise<EventSummary[]> {
  const params: Record<string, string> = { limit: String(limit) };
  if (q) params.q = q;
  if (eventType) params.event_type = eventType;
  return apiFetch<EventSummary[]>("/events", params);
}

export async function getEvent(id: string): Promise<Event> {
  return apiFetch<Event>(`/events/${id}`);
}

export async function getEventNames(q?: string, eventType?: string): Promise<string[]> {
  const params: Record<string, string> = {};
  if (q) params.q = q;
  if (eventType) params.event_type = eventType;
  return apiFetch<string[]>("/event_names", params);
}

export async function listTickets(ticketType?: string, limit = 20): Promise<Ticket[]> {
  const params: Record<string, string> = { limit: String(limit) };
  if (ticketType) params.ticket_type = ticketType;
  return apiFetch<Ticket[]>("/tickets/", params);
}

export async function getTicket(id: string): Promise<Ticket> {
  return apiFetch<Ticket>(`/tickets/${id}`);
}

export async function listAuctions(): Promise<Auction[]> {
  return apiFetch<Auction[]>("/auctions");
}

export async function getAuction(id: string): Promise<Auction> {
  return apiFetch<Auction>(`/auctions/${id}`);
}

export async function getAuctionState(id: string): Promise<AuctionState> {
  return apiFetch<AuctionState>(`/auction_states/${id}`);
}
