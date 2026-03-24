"use client";

import { useEffect } from "react";
import { ticksBidSocket } from "@/lib/ticksBidSocket";

/**
 * Mounts once in the root layout to open (and keep open) the WebSocket connection.
 * Renders nothing — purely a side-effect component.
 */
export default function SocketProvider() {
  useEffect(() => {
    ticksBidSocket.connect();
    return () => ticksBidSocket.disconnect();
  }, []);

  return null;
}
