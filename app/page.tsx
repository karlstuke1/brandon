"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Role = "user" | "assistant";
type Message = {
  role: Role;
  content: string;
};

export default function Page() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const send = useCallback(async () => {
    if (!input.trim() || loading) return;
    const next = [...messages, { role: "user", content: input.trim() } as Message];
    setMessages(next);
    setInput("");
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed with ${res.status}`);
      }
      const data = (await res.json()) as { message: Message };
      setMessages((m) => [...m, data.message]);
    } catch (e: any) {
      setError(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [input, messages, loading]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  };

  return (
    <div className="chat">
      <div ref={listRef} className="messages" aria-live="polite">
        {/* No initial message */}
        {messages.map((m, i) => (
          <div key={i} className={`bubble ${m.role}`}>
            <div className="role">{m.role === "assistant" ? "Brandon" : "Leo"}</div>
            <div>{m.content}</div>
          </div>
        ))}
        {loading ? (
          <div className="bubble assistant">
            <div className="role">Brandon</div>
            <div>Typing…</div>
          </div>
        ) : null}
      </div>
      <div className="composer">
        <input
          className="input"
          placeholder="Type a message and press Enter"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={loading}
          aria-label="Message input"
        />
        <button className="button" onClick={() => void send()} disabled={loading || !input.trim()}>
          Send
        </button>
      </div>
      {error ? <div className="error">{error}</div> : null}
    </div>
  );
}

