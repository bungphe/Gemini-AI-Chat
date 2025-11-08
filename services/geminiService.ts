
import { GoogleGenAI, GenerateContentResponse, Part, GenerateContentRequest } from "@google/genai";
import { GEMINI_TEXT_MODEL } from "../constants";
import { ChatMessage } from "../types";

// Ensure API_KEY is available. In a real app, this would be handled securely.
// The instructions explicitly state: "The API key must be obtained exclusively from the environment variable process.env.API_KEY."
// "Use this process.env.API_KEY string directly when initializing the @google/genai client instance"
// "The application must not ask the user for it under any circumstances."
const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error("API_KEY environment variable is not set. Gemini service will not function.");
  // Potentially throw an error or have a fallback, but per instructions, we assume it's configured.
}

const ai = new GoogleGenAI({ apiKey: apiKey || "MISSING_API_KEY_SAFEGUARD" }); // Safeguard for type-checking if API key is truly missing at runtime.

interface GeminiChatOptions {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  topP?: number;
  topK?: number;
  maxOutputTokens?: number;
  onStreamUpdate?: (chunk: string) => void;
  onStreamFinish?: (fullText: string) => void;
  onError?: (error: Error) => void;
}

function prepareMessagesForGemini(messages: ChatMessage[]): GenerateContentRequest['contents'] {
    const contents: GenerateContentRequest['contents'] = [];
    let currentRole: 'user' | 'model' | undefined = undefined;
    let currentParts: Part[] = [];

    for (const msg of messages) {
        // Gemini expects alternating user/model roles. System messages can be prepended to user messages or handled via systemInstruction.
        // For simplicity here, we'll treat system messages as a prefix to the next user message or a standalone user message if it's the first.
        let roleForGemini: 'user' | 'model' = msg.role === 'assistant' ? 'model' : 'user';

        if (msg.role === 'system') {
            // Option 1: Prepend system message to next user message (if any) or treat as user
            // This is a simplified approach. For proper system instructions, use `systemInstruction` in `generateContent` config.
            roleForGemini = 'user'; 
        }
        
        const parts: Part[] = [];
        if (typeof msg.content === 'string') {
            parts.push({ text: msg.content });
        } else { // MultimodalContent[]
            msg.content.forEach(p => {
                if (p.type === 'text' && p.text) {
                    parts.push({ text: p.text });
                } else if (p.type === 'image_url' && p.image_url?.url) {
                    // Assuming base64 data URI: data:[<mediatype>];base64,[<data>]
                    const [meta, base64Data] = p.image_url.url.split(',');
                    if (base64Data && meta) {
                        const mimeTypeMatch = meta.match(/data:(image\/\w+);base64/);
                        if (mimeTypeMatch && mimeTypeMatch[1]) {
                             parts.push({ inlineData: { mimeType: mimeTypeMatch[1], data: base64Data } });
                        }
                    }
                }
            });
        }

        if (roleForGemini === currentRole) {
            currentParts.push(...parts);
        } else {
            if (currentParts.length > 0 && currentRole) {
                 contents.push({ role: currentRole, parts: currentParts });
            }
            currentParts = parts;
            currentRole = roleForGemini;
        }
    }
    if (currentParts.length > 0 && currentRole) {
        contents.push({ role: currentRole, parts: currentParts });
    }
    return contents;
}


export const geminiService = {
  async generateText(options: GeminiChatOptions): Promise<string | undefined> {
    const {
      messages,
      model = GEMINI_TEXT_MODEL,
      temperature,
      topP,
      topK,
      maxOutputTokens,
      onStreamUpdate,
      onStreamFinish,
      onError,
    } = options;

    if (!apiKey) {
      onError?.(new Error("Gemini API Key is not configured."));
      return;
    }
    
    const contents = prepareMessagesForGemini(messages);

    try {
      if (onStreamUpdate && onStreamFinish) {
        // Streaming
        const streamResp = await ai.models.generateContentStream({
          model,
          contents,
          generationConfig: { temperature, topP, topK, maxOutputTokens, candidateCount: 1 },
        });

        let fullText = "";
        for await (const chunk of streamResp) {
          const chunkText = chunk.text;
          fullText += chunkText;
          onStreamUpdate(chunkText);
        }
        onStreamFinish(fullText);
        return fullText; // Though the primary update is via stream callbacks
      } else {
        // Non-streaming
        const response: GenerateContentResponse = await ai.models.generateContent({
          model,
          contents,
          generationConfig: { temperature, topP, topK, maxOutputTokens, candidateCount: 1 },
        });
        return response.text;
      }
    } catch (error) {
      console.error("Gemini API error:", error);
      onError?.(error as Error);
      return undefined;
    }
  },
};
