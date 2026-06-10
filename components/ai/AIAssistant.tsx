"use client";

import React, { useEffect, useRef, useState } from "react";
import { MessageBubble } from "@/components/ai/MessageBubble";
import { useAIChat } from "@/hooks/useAIChat";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/lib/chatbot/knowledge-base";

// ─── Typing indicator ───────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex gap-2.5 items-start">
      <div className="shrink-0 h-7 w-7 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center shadow-sm mt-0.5">
        <span className="text-xs">🌾</span>
      </div>
      <div className="rounded-2xl rounded-tl-sm bg-card border border-border px-4 py-3 shadow-sm">
        <div className="flex gap-1 items-center">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main AI Assistant Component ───────────────────────────────────
export function AIAssistant() {
  const { profile } = useAuth();
  const userRole: UserRole = (profile?.role as UserRole) ?? "guest";
  const firstName = profile?.name?.split(" ")[0] ?? null;

  const { messages, sendMessage, isLoading, clearMessages, suggestions } =
    useAIChat(userRole);

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Keyboard shortcut: Ctrl+/ to toggle
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "/") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    setShowSuggestions(false);
    sendMessage(inputValue);
    setInputValue("");
  };

  const handleSuggestion = (q: string) => {
    setShowSuggestions(false);
    sendMessage(q);
  };

  const handleClear = () => {
    clearMessages();
    setShowSuggestions(true);
  };

  const roleLabel: Record<UserRole, string> = {
    farmer: "Farmer",
    buyer: "Buyer",
    lgu: "LGU Officer",
    expert: "Agricultural Expert",
    admin: "Administrator",
    guest: "Guest",
  };

  return (
    <>
      {/* ── Floating Trigger Button ─────────────────────────────── */}
      <button
        id="ai-assistant-toggle"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Close assistant" : "Open AI assistant"}
        className={`
          fixed bottom-6 right-6 z-50
          h-14 w-14 rounded-full shadow-xl
          flex items-center justify-center
          bg-gradient-to-br from-green-500 to-green-700
          text-white text-2xl
          transition-all duration-300
          hover:scale-110 hover:shadow-green-500/40 hover:shadow-2xl
          active:scale-95
          ${isOpen ? "rotate-90" : ""}
        `}
        style={{
          boxShadow: isOpen
            ? "0 0 0 4px rgba(34,197,94,0.2), 0 8px 24px rgba(34,197,94,0.4)"
            : "0 4px 20px rgba(0,0,0,0.25)",
        }}
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {/* ── Chat Panel ─────────────────────────────────────────────── */}
      <div
        id="ai-assistant-panel"
        className={`
          fixed bottom-24 right-6 z-50
          w-[360px] max-w-[calc(100vw-1.5rem)]
          rounded-2xl border border-border bg-background shadow-2xl
          flex flex-col overflow-hidden
          transition-all duration-300 origin-bottom-right
          ${isOpen ? "scale-100 opacity-100 pointer-events-auto" : "scale-90 opacity-0 pointer-events-none"}
        `}
        style={{ maxHeight: "560px" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-border bg-gradient-to-r from-green-600 to-green-700 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-base backdrop-blur-sm">
              🌾
            </div>
            <div>
              <p className="text-sm font-semibold text-white leading-tight">Farm Assistant</p>
              <p className="text-xs text-green-100 leading-tight">
                {firstName ? `Hi ${firstName}! · ` : ""}
                {roleLabel[userRole]}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                onClick={handleClear}
                title="Clear chat"
                className="h-7 w-7 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              title="Close"
              className="h-7 w-7 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0" style={{ maxHeight: "380px" }}>
          {/* Welcome message */}
          {messages.length === 0 && (
            <div className="flex gap-2.5 items-start">
              <div className="shrink-0 h-7 w-7 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center shadow-sm mt-0.5">
                <span className="text-xs">🌾</span>
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-card border border-border px-4 py-2.5 text-sm text-card-foreground shadow-sm">
                {firstName
                  ? `Hi ${firstName}! 👋 I'm your Farm System assistant. How can I help you today?`
                  : "Hi there! 👋 I'm your Farm System assistant. I can help you navigate the platform. What would you like to know?"}
              </div>
            </div>
          )}

          {/* Suggestion chips */}
          {showSuggestions && messages.length === 0 && (
            <div className="space-y-2 pt-1">
              <p className="text-xs text-muted-foreground px-1">Suggested questions:</p>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSuggestion(q)}
                    className="text-xs px-3 py-1.5 rounded-full border border-border bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-150 text-left leading-tight"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat messages */}
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {/* Typing indicator */}
          {isLoading && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <form
          onSubmit={handleSubmit}
          className="border-t border-border bg-background px-3 py-3 flex gap-2 items-center"
        >
          <input
            ref={inputRef}
            id="ai-chat-input"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask something about the app..."
            disabled={isLoading}
            className="flex-1 h-9 rounded-xl border border-input bg-muted/50 px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50 transition-all"
          />
          <button
            type="submit"
            id="ai-chat-send"
            disabled={!inputValue.trim() || isLoading}
            aria-label="Send message"
            className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 disabled:opacity-40 hover:bg-primary/90 active:scale-95 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </form>

        {/* Footer */}
        <div className="px-3 pb-2 text-center">
          <p className="text-[10px] text-muted-foreground">
            Press <kbd className="font-mono bg-muted px-1 py-0.5 rounded text-[9px]">Ctrl+/</kbd> to toggle · Answers are pre-written
          </p>
        </div>
      </div>
    </>
  );
}
