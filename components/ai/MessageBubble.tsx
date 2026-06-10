"use client";

import React from "react";
import { type ChatMessage } from "@/hooks/useAIChat";

// ─── Minimal markdown renderer (bold, bullet lists, line breaks) ───
function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split("\n");

  return lines.map((line, i) => {
    const isBullet = line.startsWith("- ");
    const content = isBullet ? line.slice(2) : line;

    // Bold: **text**
    const parts = content.split(/\*\*(.*?)\*\*/g);
    const rendered = parts.map((part, j) =>
      j % 2 === 1 ? (
        <strong key={j} className="font-semibold">
          {part}
        </strong>
      ) : (
        <span key={j}>{part}</span>
      )
    );

    if (isBullet) {
      return (
        <li key={i} className="flex gap-2 items-start">
          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-current shrink-0 opacity-60" />
          <span>{rendered}</span>
        </li>
      );
    }

    return (
      <span key={i} className="block">
        {rendered}
      </span>
    );
  });
}

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground shadow-sm">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2.5 items-start">
      {/* Bot avatar */}
      <div className="shrink-0 h-7 w-7 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center shadow-sm mt-0.5">
        <span className="text-xs">🌾</span>
      </div>

      {/* Bot bubble */}
      <div className="max-w-[82%] rounded-2xl rounded-tl-sm bg-card border border-border px-4 py-2.5 text-sm text-card-foreground shadow-sm">
        <ul className="space-y-0.5 list-none p-0 m-0">
          {renderMarkdown(message.content)}
        </ul>
      </div>
    </div>
  );
}
