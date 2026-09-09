import "dotenv/config";

/*
 * Gemini configuration
 * Read environment variables when the request is made
 * to avoid stale values during module loading.
 */
const DEFAULT_GEMINI_MODEL = "gemini-3.6-flash";

/*
 * Common function to communicate with Gemini API
 */
async function callGemini(prompt, systemInstruction = "") {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const model =
    process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is missing. Please add it to the .env file."
    );
  }

  const geminiUrl =
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const response = await fetch(geminiUrl, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },

    body: JSON.stringify({
      system_instruction: {
        parts: [
          {
            text: systemInstruction,
          },
        ],
      },

      contents: [
        {
          role: "user",
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],

      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 2500,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Gemini API error (${response.status}): ${errorText}`
    );
  }

  const data = await response.json();

  const text =
    data?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("")
      .trim();

  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  return text;
}


/*
 * Rules to prevent Gemini from inventing tourism information
 */
const TRAVEL_SYSTEM_INSTRUCTION = `
You are Yatra AI, a helpful tourism assistant.

Your job is to help users plan trips and answer tourism-related questions.

IMPORTANT ACCURACY RULES:

1. Never invent real tourist places, hotels, restaurants, cafes,
   phone numbers, addresses, websites, opening hours, ticket prices,
   availability, or exact travel times.

2. If real tourism data is provided in the context, use only the
   places and information present in that data.

3. Do not create fake names that look like real businesses.

4. If the supplied data does not contain enough information, clearly
   say that the available tourism data is insufficient.

5. General travel advice is allowed, but clearly present it as
   general advice rather than verified information.

6. Do not claim that information is live or verified unless it was
   supplied by the application.

7. Keep answers useful, friendly and easy to understand.

8. When creating an itinerary, organize it clearly by day.

9. Budget values should be treated as approximate planning estimates,
   not guaranteed prices.

10. Never reveal the Gemini API key or any server-side environment
    variables.
`;


/*
 * Generate a response for the Yatra AI chatbot
 */
export async function generateChatResponse({
  message,
  destination = "",
  context = "",
  history = [],
}) {
  if (!message || !message.trim()) {
    throw new Error("Chat message is required.");
  }

  const conversationHistory = Array.isArray(history)
    ? history
        .slice(-10)
        .map((item) => {
          const role =
            item.role === "assistant"
              ? "Assistant"
              : "User";

          return `${role}: ${item.content || ""}`;
        })
        .join("\n")
    : "";

  const prompt = `
User's destination:
${destination || "Not specified"}

Verified tourism data supplied by the application:
${context || "No verified tourism data was supplied."}

Previous conversation:
${conversationHistory || "No previous conversation."}

Current user message:
${message}

Answer the user's question using the verified tourism data when relevant.

If the requested information is not present in the verified data,
do not invent it.

Give a clear, friendly and useful response.
`;

  return await callGemini(
    prompt,
    TRAVEL_SYSTEM_INSTRUCTION
  );
}


/*
 * Generate an AI travel itinerary
 */
export async function generateItinerary({
  destination,
  days = 3,
  budget = "moderate",
  travelType = "general",
  interests = "",
  context = "",
}) {
  if (!destination || !destination.trim()) {
    throw new Error("Destination is required.");
  }

  const numberOfDays = Math.min(
    Math.max(Number(days) || 3, 1),
    14
  );

  const prompt = `
Create a ${numberOfDays}-day travel itinerary for:

Destination:
${destination}

Travel style:
${travelType}

Budget preference:
${budget}

User interests:
${interests || "General sightseeing"}

Verified tourism data supplied by the application:
${context || "No verified tourism data was supplied."}

IMPORTANT:

Use tourist places, restaurants and other businesses ONLY when
they appear in the verified tourism data above.

Do not invent places, restaurants, hotels, addresses, phone numbers,
ticket prices or opening hours.

If there is not enough verified information for a particular part
of the itinerary, say that more information is needed instead of
creating a fake place.

Return the itinerary in this structure:

Day 1
- Morning:
- Afternoon:
- Evening:
- Food suggestion:
- Travel guidance:

Day 2
- Morning:
- Afternoon:
- Evening:
- Food suggestion:
- Travel guidance:

Continue for all requested days.

At the end include:

Practical Tips
- General travel tips
- What to carry
- Safety suggestions
- Budget guidance

Keep the itinerary practical, readable and easy to follow.

Budget values must be treated as approximate planning estimates,
not guaranteed prices.
`;

  return await callGemini(
    prompt,
    TRAVEL_SYSTEM_INSTRUCTION
  );
}


/*
 * Export the currently configured Gemini model.
 */
export const GEMINI_MODEL =
  process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;