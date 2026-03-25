"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
  useState,
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface CoachPanelHandle {
  sendContext: (message: string) => void;
}

interface CoachPanelProps {
  systemPrompt: string;
}

export const CoachPanel = forwardRef<CoachPanelHandle, CoachPanelProps>(
  function CoachPanel({ systemPrompt }, ref) {
    const { messages, sendMessage, status } = useChat({
      transport: new DefaultChatTransport({
        api: "/api/chat",
        body: { system: systemPrompt },
      }),
    });
    const [input, setInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, [messages]);

    useImperativeHandle(ref, () => ({
      sendContext: (contextMessage: string) => {
        sendMessage({ text: contextMessage });
      },
    }));

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || (status !== "ready" && status !== "error")) return;
      sendMessage({ text: input });
      setInput("");
    };

    const isStreaming = status === "streaming" || status === "submitted";

    return (
      <div className="flex flex-col h-full min-h-0 bg-card rounded-xl border border-border shadow-sm">
        <div className="px-5 py-3.5 border-b border-border flex items-center gap-2">
          <span className="text-base">🎓</span>
          <h3 className="font-heading font-bold text-sm text-foreground">Coach</h3>
        </div>

        <ScrollArea className="flex-1 min-h-0 px-4 py-3" ref={scrollRef}>
          <div className="space-y-4">
            {messages.length === 0 && (
              <p className="text-sm text-muted-foreground italic">
                Your coach is ready. Make a move or ask a question!
              </p>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`text-sm ${
                  message.role === "user"
                    ? "text-muted-foreground"
                    : "text-foreground"
                }`}
              >
                {message.role === "user" ? (
                  <div className="bg-muted rounded-lg px-3 py-2">
                    {message.parts
                      .filter((part) => part.type === "text")
                      .map((part, i) => {
                        if (part.type !== "text") return null;
                        const visibleText = part.text
                          .split("\n")
                          .filter((line) => !line.startsWith("["))
                          .join("\n")
                          .trim();
                        return visibleText ? (
                          <span key={i}>{visibleText}</span>
                        ) : (
                          <span
                            key={i}
                            className="italic text-muted-foreground"
                          >
                            (move played)
                          </span>
                        );
                      })}
                  </div>
                ) : (
                  <div className="leading-relaxed whitespace-pre-wrap">
                    {message.parts
                      .filter((part) => part.type === "text")
                      .map((part, i) =>
                        part.type === "text" ? (
                          <span key={i}>{part.text}</span>
                        ) : null
                      )}
                  </div>
                )}
              </div>
            ))}
            {isStreaming && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <span className="animate-pulse text-xs">
                  Coach is thinking...
                </span>
              </div>
            )}
          </div>
        </ScrollArea>

        <form onSubmit={handleSubmit} className="p-3 border-t border-border">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your coach..."
              disabled={isStreaming}
              className="text-sm"
            />
            <Button
              type="submit"
              size="sm"
              disabled={isStreaming || !input.trim()}
            >
              Send
            </Button>
          </div>
        </form>
      </div>
    );
  }
);
