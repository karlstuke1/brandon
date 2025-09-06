"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Role = "user" | "assistant";
type Message = {
  role: Role;
  content: string;
};

// Emoji splash component
function EmojiSplash() {
  const emojis = Array.from({ length: 20 }, (_, i) => {
    const side = Math.random() > 0.5 ? 'left' : 'right';
    const delay = Math.random() * 2;
    const duration = 3 + Math.random() * 2;
    const size = 1 + Math.random() * 1.5;
    const startY = Math.random() * 100;
    
    return (
      <div
        key={i}
        className="emoji-splash"
        style={{
          [side]: '-50px',
          top: `${startY}vh`,
          animationDelay: `${delay}s`,
          animationDuration: `${duration}s`,
          fontSize: `${size}rem`,
          animationName: side === 'left' ? 'floatFromLeft' : 'floatFromRight'
        }}
      >
        💦
      </div>
    );
  });
  
  return <div className="emoji-container">{emojis}</div>;
}

export default function Page() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEmojis, setShowEmojis] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  // Keep input focused
  useEffect(() => {
    if (!loading) {
      inputRef.current?.focus();
    }
  }, [loading]);

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const send = useCallback(async () => {
    if (!input.trim() || loading) return;
    let next = [...messages, { role: "user", content: input.trim() } as Message];
    
    // If we're about to exceed 10 messages, remove the oldest 2
    if (next.length >= 10) {
      next = next.slice(2);
    }
    
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
      
      setMessages((m) => {
        let updated = [...m, data.message];
        // Check again after adding the response
        if (updated.length > 10) {
          updated = updated.slice(2);
        }
        return updated;
      });
      
      // Track message count and trigger emojis every 3-5 messages
      setMessageCount((count) => {
        const newCount = count + 2; // user + assistant message
        const trigger = 3 + Math.floor(Math.random() * 3); // 3-5
        if (newCount >= trigger) {
          setShowEmojis(true);
          setTimeout(() => setShowEmojis(false), 5000);
          return 0;
        }
        return newCount;
      });
    } catch (e: any) {
      setError(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
      // Keep focus on input
      setTimeout(() => inputRef.current?.focus(), 0);
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
      {showEmojis && <EmojiSplash />}
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
          ref={inputRef}
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

