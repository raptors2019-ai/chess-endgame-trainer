import { convertToModelMessages, streamText, UIMessage } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

export const maxDuration = 30;

export async function POST(req: Request) {
  const {
    messages,
    system,
  }: { messages: UIMessage[]; system?: string } = await req.json();

  const result = streamText({
    model: anthropic("claude-sonnet-4-5-20250929"),
    system: system || "You are a helpful chess coach.",
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
