
export const APP_TITLE = "Gemini AI Chat";
export const DEFAULT_CHAT_TITLE = "New Chat";
export const GEMINI_API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/"; // Base, actual model will be appended
export const GEMINI_TEXT_MODEL = "gemini-2.5-flash-preview-04-17";
// Add other models as needed, e.g., for image generation if implemented
// export const GEMINI_IMAGE_MODEL = "imagen-3.0-generate-002"; 

export enum StoreKey {
  Chat = "gemini-chat-store",
  Access = "gemini-access-store",
  Config = "gemini-app-config",
  Mask = "gemini-mask-store",
}

export const BOT_HELLO: { role: "assistant"; content: string } = {
  role: "assistant",
  content: "Hello! How can I assist you today?",
};
