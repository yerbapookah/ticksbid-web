import { NextRequest, NextResponse } from "next/server";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const MCP_SERVER_URL = process.env.TICKSBID_MCP_URL || "http://localhost:8099/sse";

const SYSTEM_PROMPT = `You are TicksBid AI, a helpful ticket buying assistant for the TicksBid secondary ticket marketplace. You help users find and purchase event tickets.

IMPORTANT SEARCH BEHAVIOR:
- The list_events tool matches against event NAMES only (artist names, team names, show titles). It does NOT understand genres like "rock", "pop", "hip hop", etc.
- When a user asks for a genre or category (e.g. "rock concerts", "comedy shows", "sports"), use the event_type filter (concert, sports, theater, comedy, festival) with an EMPTY query to list all events of that type.
- When a user asks for a specific artist/team (e.g. "Coldplay", "Lakers"), search by that name.
- If one search returns no results, try alternative searches: broader terms, just event_type filter, or list all events.
- Always try at least 2 search strategies before telling the user nothing was found.

When presenting events, include: event name, date, venue, and a link to the event page in the format: /events/{event_id}

When a user wants to buy or bid:
1. First use list_tickets to show available options with prices
2. Confirm the specific ticket, price, and event before proceeding
3. Ask for explicit confirmation before completing any transaction
4. Never auto-complete a purchase without user approval

Format prices as USD. Keep responses concise but informative.`;

// Connect to MCP server and get available tools
async function getMcpClient(): Promise<Client> {
  const transport = new SSEClientTransport(new URL(MCP_SERVER_URL));
  const client = new Client({ name: "ticksbid-chat", version: "1.0.0" });
  await client.connect(transport);
  return client;
}

// Convert MCP tool schema to Anthropic tool format
function mcpToolToAnthropic(tool: { name: string; description?: string; inputSchema?: Record<string, unknown> }) {
  return {
    name: tool.name,
    description: tool.description || "",
    input_schema: tool.inputSchema || { type: "object" as const, properties: {} },
  };
}

export async function POST(req: NextRequest) {
  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
  }

  const { messages } = await req.json();
  let mcpClient: Client | null = null;

  try {
    // 1. Connect to MCP server
    mcpClient = await getMcpClient();

    // 2. List available tools from MCP server
    const toolsResult = await mcpClient.listTools();
    const mcpTools = toolsResult.tools || [];

    // Convert to Anthropic format
    const anthropicTools = mcpTools.map(mcpToolToAnthropic);

    console.log(`MCP: Loaded ${anthropicTools.length} tools: ${anthropicTools.map(t => t.name).join(", ")}`);

    // 3. Send to Anthropic API with tool definitions
    let response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        tools: anthropicTools,
        messages,
      }),
    });

    let data = await response.json();

    if (!response.ok) {
      console.error("Anthropic API error:", JSON.stringify(data, null, 2));
      return NextResponse.json(
        { error: data.error?.message || "API request failed" },
        { status: response.status }
      );
    }

    // 4. Tool use loop — execute tools via MCP server
    const allMessages = [...messages];
    let iterations = 0;
    const MAX_ITERATIONS = 8;

    while (data.stop_reason === "tool_use" && iterations < MAX_ITERATIONS) {
      iterations++;

      // Add assistant message with tool use blocks
      allMessages.push({ role: "assistant", content: data.content });

      // Execute each tool call via MCP
      const toolResults = [];
      for (const block of data.content) {
        if (block.type === "tool_use") {
          console.log(`MCP: Calling tool "${block.name}" with:`, JSON.stringify(block.input));

          try {
            const result = await mcpClient.callTool({
              name: block.name,
              arguments: block.input,
            });

            // Extract text from MCP result
            const resultText = (result.content as Array<{ type: string; text?: string }>)
              ?.map((c) => c.text || "")
              .join("\n") || "No result";

            console.log(`MCP: Tool "${block.name}" returned ${resultText.length} chars`);

            toolResults.push({
              type: "tool_result",
              tool_use_id: block.id,
              content: resultText,
            });
          } catch (err) {
            console.error(`MCP: Tool "${block.name}" error:`, err);
            toolResults.push({
              type: "tool_result",
              tool_use_id: block.id,
              content: `Tool error: ${err instanceof Error ? err.message : "Unknown error"}`,
            });
          }
        }
      }

      // Add tool results and call Anthropic again
      allMessages.push({ role: "user", content: toolResults });

      response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4096,
          system: SYSTEM_PROMPT,
          tools: anthropicTools,
          messages: allMessages,
        }),
      });

      data = await response.json();
    }

    // 5. Extract final text response
    const textContent = (data.content || [])
      .filter((b: { type: string }) => b.type === "text")
      .map((b: { text: string }) => b.text)
      .join("\n") || "I couldn't generate a response.";

    return NextResponse.json({ response: textContent });

  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Chat failed" },
      { status: 500 }
    );
  } finally {
    // Clean up MCP connection
    if (mcpClient) {
      try { await mcpClient.close(); } catch {}
    }
  }
}
