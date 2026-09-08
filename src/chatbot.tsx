import { useState } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";

const API_BASE = "http://localhost:5000";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatbotProps {
  destination?: string;
}

export default function Chatbot({
  destination = "",
}: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! 👋 I'm Yatra AI. I can help you with travel planning, tourist places, food, travel tips and itineraries.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendMessage = async () => {
    const message = input.trim();

    if (!message || loading) {
      return;
    }

    const userMessage: Message = {
      role: "user",
      content: message,
    };

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/ai/chat`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          message,
          destination,

          history: updatedMessages.slice(-10),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Unable to get a response from Gemini."
        );
      }

      const assistantMessage: Message = {
        role: "assistant",
        content:
          data?.reply ||
          "Sorry, I couldn't generate a response.",
      };

      setMessages((previousMessages) => [
        ...previousMessages,
        assistantMessage,
      ]);
    } catch (err) {
      console.error("Chatbot error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto rounded-2xl border border-gray-200 bg-white shadow-lg overflow-hidden">
      
      {/* Header */}
      <div className="bg-blue-600 px-5 py-4 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
            <Bot size={22} />
          </div>

          <div>
            <h2 className="text-lg font-semibold">
              Yatra AI Chatbot
            </h2>

            <p className="text-sm text-blue-100">
              Your AI travel assistant
            </p>
          </div>
        </div>
      </div>

      {/* Chat messages */}
      <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 ${
              message.role === "user"
                ? "justify-end"
                : "justify-start"
            }`}
          >
            {message.role === "assistant" && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Bot size={17} />
              </div>
            )}

            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
                message.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-800 border border-gray-200"
              }`}
            >
              {message.content}
            </div>

            {message.role === "user" && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-600">
                <User size={17} />
              </div>
            )}
          </div>
        ))}

        {/* Loading */}
        {loading && (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <Bot size={17} />
            </div>

            <div className="rounded-2xl bg-white border border-gray-200 px-4 py-3">
              <Loader2
                size={18}
                className="animate-spin text-blue-600"
              />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(event) =>
              setInput(event.target.value)
            }
            onKeyDown={handleKeyDown}
            placeholder={
              destination
                ? `Ask about ${destination}...`
                : "Ask me about your trip..."
            }
            disabled={loading}
            className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
          />

          <button
            type="button"
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="flex items-center justify-center rounded-xl bg-blue-600 px-4 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <Loader2
                size={20}
                className="animate-spin"
              />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}