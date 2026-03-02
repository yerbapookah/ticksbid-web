"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  checkoutUrl?: string;
}

const SUGGESTIONS = [
  "Find me 2 tickets to a Lakers game under $200 each",
  "What concerts are coming up? I like rock and pop",
  "I want floor seats to a big show in LA, budget $500",
  "Show me the cheapest tickets available for any event",
  "Find comedy shows in the next 3 months",
];

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      <div className="flex items-center gap-1">
        <span className="h-2 w-2 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="h-2 w-2 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="h-2 w-2 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
      <span className="text-xs text-[var(--text-muted)] ml-2">TicksBid AI is thinking...</span>
    </div>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div className={`flex items-start gap-3 max-w-[80%] ${isUser ? "flex-row-reverse" : ""}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-lg ${
          isUser
            ? "bg-[var(--accent)]/20 text-[var(--accent)]"
            : "bg-purple-500/20 text-purple-400"
        }`}>
          {isUser ? (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
          )}
        </div>

        {/* Message */}
        <div className={`rounded-xl px-4 py-3 ${
          isUser
            ? "bg-[var(--accent)]/15 border border-[var(--accent)]/20"
            : "bg-[var(--bg-card)] border border-[var(--border)]"
        }`}>
          <div className="text-sm text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed">
            {msg.content}
          </div>
          {msg.checkoutUrl && (
            <a
              href={msg.checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[var(--green)] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Complete Purchase
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function ChatInput({
  input,
  setInput,
  loading,
  onSend,
  inputRef,
}: {
  input: string;
  setInput: (v: string) => void;
  loading: boolean;
  onSend: () => void;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
}) {
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + "px";
    }
  }, [input, inputRef]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-end gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-2 focus-within:border-[var(--accent)]/40 transition-colors">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe the tickets you want..."
          rows={1}
          className="flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none"
          style={{ maxHeight: "120px" }}
        />
        <button
          onClick={onSend}
          disabled={!input.trim() || loading}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--accent)] text-white transition-all hover:bg-[var(--accent-hover)] disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </div>
      <p className="mt-2 text-center text-[0.6rem] text-[var(--text-muted)]">
        TicksBid AI can search events, compare prices, and complete transactions on your behalf. Always confirm before purchasing.
      </p>
    </div>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const apiMessages = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessages([...newMessages, {
          role: "assistant",
          content: `Something went wrong: ${data.error || "Unknown error"}. Please try again.`,
        }]);
      } else {
        setMessages([...newMessages, {
          role: "assistant",
          content: data.response,
          checkoutUrl: data.checkoutUrl,
        }]);
      }
    } catch {
      setMessages([...newMessages, {
        role: "assistant",
        content: "Connection error. Please check your internet and try again.",
      }]);
    } finally {
      setLoading(false);
    }
  }

  const isEmpty = messages.length === 0;

  return (
    <div className="mx-auto max-w-3xl px-6 py-6" style={{ minHeight: "calc(100vh - 57px)" }}>
      {isEmpty ? (
        /* Welcome state — icon, title, suggestions, then input */
        <div className="flex flex-col items-center pt-16">
          {/* AI icon */}
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/15 border border-purple-500/20">
            <svg className="h-8 w-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
            TicksBid AI
          </h1>
          <p className="text-sm text-[var(--text-muted)] text-center max-w-md mb-8">
            Tell me what tickets you're looking for. I'll search events, compare prices, place bids, and buy tickets on your behalf.
          </p>

          {/* Input box — right below the description */}
          <div className="w-full max-w-lg mb-6">
            <ChatInput
              input={input}
              setInput={setInput}
              loading={loading}
              onSend={() => sendMessage(input)}
              inputRef={inputRef}
            />
          </div>

          {/* Suggestion chips */}
          <div className="flex flex-col gap-2 w-full max-w-lg">
            <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">Try asking</p>
            {SUGGESTIONS.map((s, i) => (
              <button
                key={i}
                onClick={() => sendMessage(s)}
                className="group flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 text-left text-sm text-[var(--text-secondary)] transition-all hover:border-[var(--accent)]/40 hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]"
              >
                <svg className="h-4 w-4 flex-shrink-0 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Active conversation */
        <div>
          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} />
          ))}
          {loading && <TypingIndicator />}
          <div ref={messagesEndRef} />

          {/* Input below messages */}
          <div className="mt-4 mb-8">
            <ChatInput
              input={input}
              setInput={setInput}
              loading={loading}
              onSend={() => sendMessage(input)}
              inputRef={inputRef}
            />
          </div>
        </div>
      )}
    </div>
  );
}
