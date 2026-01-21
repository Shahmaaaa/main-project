import { GoogleGenAI } from "@google/genai";

export interface VerificationSource {
  title: string;
  uri: string;
}

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});

/**
 * Gemini-powered web verification (Admin only)
 */
export const verifyImageWithSearch = async (
  base64Image: string,
  details: string,
  onStatusUpdate?: (status: string) => void
): Promise<VerificationSource[]> => {

  if (onStatusUpdate) onStatusUpdate("Analyzing image context...");

  // STEP 1: Extract short search query from image + context
  const contextResponse = await ai.models.generateContent({
    model: "gemini-1.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image.split(",")[1],
            },
          },
          {
            text: `Create a 3–4 word search query for this disaster: ${details}`,
          },
        ],
      },
    ],
  });

  const query =
    contextResponse.text?.trim() || "recent flood damage";

  if (onStatusUpdate) onStatusUpdate("Searching verified sources...");

  // STEP 2: Google Search grounding
  const searchResponse = await ai.models.generateContent(
    {
      model: "gemini-1.5-flash",
      contents: `Search news articles for: "${query}"`,
      tools: [{ googleSearch: {} }],
    } as any // 👈 IMPORTANT: bypass SDK typing
  );

  const chunks =
    searchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

  return chunks
    .filter((c: any) => c.web?.uri)
    .map((c: any) => ({
      title: c.web.title || "Verified News Source",
      uri: c.web.uri,
    }));
};
