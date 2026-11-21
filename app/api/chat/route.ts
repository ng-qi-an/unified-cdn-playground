import {
  streamText,
  UIMessage,
  convertToModelMessages,
  createUIMessageStreamResponse,
  toUIMessageStream,
} from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

const hackclub = createOpenRouter({
  apiKey: process.env.HACKCLUB_AI_API_KEY,
  baseUrl: 'https://ai.hackclub.com/proxy/v1',
});


export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: hackclub("z-ai/glm-5.3-flash"),
    messages: await convertToModelMessages(messages),
    providerOptions: {
        openrouter: {
            reasoning: {
                effort: "low"
            }
        }
    }
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
