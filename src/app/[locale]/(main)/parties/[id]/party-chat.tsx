"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { formatRelativeTime } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";

interface ChatMessage {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    username: string | null;
    image: string | null;
  };
}

interface Props {
  partyId: string;
  userId: string;
  userName: string;
}

export function PartyChat({ partyId, userId }: Props) {
  const t = useTranslations("partyDetail");
  const tCommon = useTranslations("common");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [connected, setConnected] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastIdRef = useRef<string | undefined>(undefined);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const fetchMessages = useCallback(async () => {
    try {
      const url = lastIdRef.current
        ? `/api/chat/${partyId}?lastId=${lastIdRef.current}`
        : `/api/chat/${partyId}`;
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      const newMessages: ChatMessage[] = data.messages ?? [];
      if (newMessages.length > 0) {
        lastIdRef.current = newMessages[newMessages.length - 1].id;
        if (lastIdRef.current === newMessages[newMessages.length - 1].id && messages.length === 0) {
          setMessages(newMessages);
        } else {
          setMessages((prev) => [...prev, ...newMessages]);
        }
        setTimeout(scrollToBottom, 50);
      }
      setConnected(true);
    } catch {
      setConnected(false);
    }
  }, [partyId, scrollToBottom, messages.length]);

  // Initial load + polling every 3 seconds
  useEffect(() => {
    let mounted = true;
    lastIdRef.current = undefined;

    const load = async () => {
      try {
        const res = await fetch(`/api/chat/${partyId}`);
        if (!res.ok || !mounted) return;
        const data = await res.json();
        const initial: ChatMessage[] = data.messages ?? [];
        if (initial.length > 0) {
          lastIdRef.current = initial[initial.length - 1].id;
        }
        setMessages(initial);
        setConnected(true);
        setTimeout(scrollToBottom, 50);
      } catch {
        if (mounted) setConnected(false);
      }
    };

    load();

    const interval = setInterval(async () => {
      if (!mounted) return;
      try {
        const url = lastIdRef.current
          ? `/api/chat/${partyId}?lastId=${lastIdRef.current}`
          : `/api/chat/${partyId}`;
        const res = await fetch(url);
        if (!res.ok || !mounted) return;
        const data = await res.json();
        const newMessages: ChatMessage[] = data.messages ?? [];
        if (newMessages.length > 0) {
          lastIdRef.current = newMessages[newMessages.length - 1].id;
          setMessages((prev) => [...prev, ...newMessages]);
          setTimeout(scrollToBottom, 50);
        }
        setConnected(true);
      } catch {
        if (mounted) setConnected(false);
      }
    }, 3000);

    return () => {
      mounted = false;
      clearInterval(interval);
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
      // Immediately poll for the new message
      await fetchMessages();
    } catch {
      setInput(trimmed);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="rounded-xl bg-[var(--card)] border border-[var(--card-border)] flex flex-col">
      <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--card-border)]">
        <h2 className="font-semibold text-white text-sm">{t("chatTitle")}</h2>
        <span
          className={`w-2 h-2 rounded-full ${connected ? "bg-green-400" : "bg-red-400"}`}
          title={connected ? t("chatConnected") : t("chatDisconnected")}
        />
      </div>

      <div className="flex-1 overflow-y-auto max-h-80 px-4 py-3 flex flex-col gap-2">
        {messages.length === 0 && (
          <p className="text-xs text-center text-[var(--muted-foreground)] py-6">
            {t("chatEmpty")}
          </p>
        )}
        {messages.map((msg) => {
          const isOwn = msg.user.id === userId;
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2 ${isOwn ? "flex-row-reverse" : ""}`}
            >
              <Avatar image={msg.user.image} name={msg.user.name} size="sm" />
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
          placeholder={t("chatPlaceholder")}
          maxLength={1000}
          className="flex-1 px-3 py-2 rounded-lg bg-[var(--muted)] border border-[var(--card-border)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <button
          onClick={sendMessage}
          disabled={sending || !input.trim()}
          className="px-4 py-2 rounded-lg bg-orange-600 text-white text-sm hover:bg-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? "..." : tCommon("send")}
        </button>
      </div>
    </div>
  );
}
