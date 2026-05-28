"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { getInitials, formatRelativeTime } from "@/lib/utils";

interface ChatMessage {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    username: string | null;
  };
}

interface Props {
  partyId: string;
  userId: string;
  userName: string;
}

export function PartyChat({ partyId, userId }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [connected, setConnected] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    const es = new EventSource(`/api/chat/${partyId}`);
    eventSourceRef.current = es;

    es.onopen = () => setConnected(true);
    es.onerror = () => setConnected(false);

    es.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "history") {
        setMessages(data.messages);
        setTimeout(scrollToBottom, 50);
      } else if (data.type === "message") {
        setMessages((prev) => [...prev, data.message]);
        setTimeout(scrollToBottom, 50);
      }
    };

    return () => {
      es.close();
      eventSourceRef.current = null;
    };
  }, [partyId, scrollToBottom]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    setSending(true);
    setInput("");

    try {
      await fetch(`/api/chat/${partyId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed }),
      });
    } catch {
      setInput(trimmed);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="rounded-xl bg-[var(--card)] border border-[var(--card-border)] flex flex-col">
      <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--card-border)]">
        <h2 className="font-semibold text-white text-sm">Chat de grupo</h2>
        <span
          className={`w-2 h-2 rounded-full ${connected ? "bg-green-400" : "bg-red-400"}`}
          title={connected ? "Conectado" : "Desconectado"}
        />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto max-h-80 px-4 py-3 flex flex-col gap-2">
        {messages.length === 0 && (
          <p className="text-xs text-center text-[var(--muted-foreground)] py-6">
            Nadie ha escrito nada aún. ¡Di hola! 👋
          </p>
        )}
        {messages.map((msg) => {
          const isOwn = msg.user.id === userId;
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2 ${isOwn ? "flex-row-reverse" : ""}`}
            >
              <div className="w-7 h-7 rounded-full bg-orange-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {getInitials(msg.user.name)}
              </div>
              <div className={`flex flex-col ${isOwn ? "items-end" : ""}`}>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-xs font-medium text-[var(--foreground)]">
                    {isOwn ? "Tú" : msg.user.name ?? "Anónimo"}
                  </span>
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {formatRelativeTime(msg.createdAt)}
                  </span>
                </div>
                <div
                  className={`rounded-lg px-3 py-1.5 text-sm max-w-xs break-words ${
                    isOwn
                      ? "bg-orange-600 text-white"
                      : "bg-[var(--muted)] text-[var(--foreground)]"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-[var(--card-border)] flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Escribe un mensaje..."
          maxLength={1000}
          className="flex-1 px-3 py-2 rounded-lg bg-[var(--muted)] border border-[var(--card-border)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <button
          onClick={sendMessage}
          disabled={sending || !input.trim()}
          className="px-4 py-2 rounded-lg bg-orange-600 text-white text-sm hover:bg-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? "..." : "Enviar"}
        </button>
      </div>
    </div>
  );
}
