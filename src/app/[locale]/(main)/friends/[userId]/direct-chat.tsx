"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { sendDirectMessageAction } from "@/actions/friends";

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
}

interface Props {
  friendId: string;
  currentUserId: string;
  initialMessages: Message[];
}

export function DirectChat({ friendId, currentUserId, initialMessages }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastIdRef = useRef<string | undefined>(initialMessages.at(-1)?.id);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const params = new URLSearchParams({ friendId });
      if (lastIdRef.current) params.set("lastId", lastIdRef.current);
      const res = await fetch(`/api/dm?${params}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.messages?.length > 0) {
        setMessages((prev) => [...prev, ...data.messages]);
        lastIdRef.current = data.messages.at(-1)?.id;
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [friendId]);

  const handleSend = () => {
    if (!input.trim()) return;
    const content = input.trim();
    setInput("");
    setError(null);

    const optimistic: Message = {
      id: crypto.randomUUID(),
      senderId: currentUserId,
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    startTransition(async () => {
      const result = await sendDirectMessageAction(friendId, content);
      if (result.error) {
        setError(result.error);
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      }
    });
  };

  return (
    <div className="flex flex-col flex-1 rounded-xl bg-[var(--card)] border border-[var(--card-border)] overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
        {messages.length === 0 && (
          <p className="text-sm text-[var(--muted-foreground)] text-center mt-8">
            Sois amigos. ¡Envía el primer mensaje!
          </p>
        )}
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] px-3 py-2 rounded-xl text-sm ${
                  isMe
                    ? "bg-orange-600 text-white rounded-br-sm"
                    : "bg-[var(--muted)] text-[var(--foreground)] rounded-bl-sm"
                }`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[var(--card-border)] p-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="Escribe un mensaje..."
          maxLength={1000}
          className="flex-1 bg-[var(--muted)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-orange-500"
        />
        <button
          onClick={handleSend}
          disabled={isPending || !input.trim()}
          className="px-4 py-2 rounded-lg bg-orange-600 text-white text-sm font-medium hover:bg-orange-500 transition-colors disabled:opacity-50"
        >
          Enviar
        </button>
      </div>
      {error && <p className="text-xs text-red-400 px-3 pb-2">{error}</p>}
    </div>
  );
}
