"use client";

import { useState, useCallback } from "react";
import Fuse from "fuse.js";
import {
  knowledgeBase,
  suggestedQuestions,
  type QAPair,
  type UserRole,
} from "@/lib/chatbot/knowledge-base";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const FALLBACK_ANSWER =
  "I'm sorry, I couldn't find a specific answer to that. Could you rephrase your question? You can also browse the **Community Forum** or **Knowledge Hub** for more help. If it's urgent, contact the platform administrator.";

function searchKnowledgeBase(query: string, userRole: UserRole): string {
  // Filter Q&A pairs relevant to this role
  const relevant = knowledgeBase.filter(
    (qa) => qa.roles.includes(userRole) || qa.roles.includes("guest" as UserRole)
  );

  const fuse = new Fuse<QAPair>(relevant, {
    keys: [
      { name: "question", weight: 0.5 },
      { name: "keywords", weight: 0.35 },
      { name: "answer", weight: 0.15 },
    ],
    threshold: 0.45, // 0 = exact, 1 = match anything
    includeScore: true,
    minMatchCharLength: 2,
  });

  const results = fuse.search(query);

  if (results.length === 0) return FALLBACK_ANSWER;

  const best = results[0];
  // Only return if score is good enough (lower is better in Fuse)
  if (best.score !== undefined && best.score > 0.45) return FALLBACK_ANSWER;

  return best.item.answer;
}

export function useAIChat(userRole: UserRole = "guest") {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(
    (userText: string) => {
      if (!userText.trim()) return;

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: userText.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      // Simulate a brief "thinking" delay for natural feel
      setTimeout(() => {
        const answer = searchKnowledgeBase(userText, userRole);

        const assistantMessage: ChatMessage = {
          id: `bot-${Date.now()}`,
          role: "assistant",
          content: answer,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setIsLoading(false);
      }, 600);
    },
    [userRole]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const suggestions = suggestedQuestions[userRole] ?? suggestedQuestions["guest"];

  return { messages, sendMessage, isLoading, clearMessages, suggestions };
}
