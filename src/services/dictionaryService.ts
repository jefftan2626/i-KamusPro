import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface DictionaryEntry {
  word: string;
  pronunciation?: string;
  meanings: {
    malay: string[];
    chinese: string[];
    english: string[];
  };
  synonyms: string[];
  antonyms: string[];
  examples: {
    malay: string;
    chinese: string;
    english: string;
  }[];
  usage_notes?: string;
  imageUrl?: string;
}

export async function generateImage(word: string, description: string): Promise<string | undefined> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `A clean, professional educational illustration or high-quality photo representing the word "${word}". Context: ${description}. Style: Minimalist, clear, suitable for a trilingual dictionary. No text in the image.`,
          },
        ],
      },
    });
    
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (error) {
    console.error("Image generation failed:", error);
  }
  return undefined;
}

export async function searchDictionary(keyword: string): Promise<DictionaryEntry> {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `Search for the word or phrase: "${keyword}". 
    Provide a comprehensive dictionary entry following Malaysian linguistic standards (Dewan Bahasa dan Pustaka for Malay).
    The response must be in three languages: Bahasa Melayu, Chinese (Simplified, Malaysian context), and English.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          word: { type: Type.STRING },
          pronunciation: { type: Type.STRING },
          meanings: {
            type: Type.OBJECT,
            properties: {
              malay: { type: Type.ARRAY, items: { type: Type.STRING } },
              chinese: { type: Type.ARRAY, items: { type: Type.STRING } },
              english: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["malay", "chinese", "english"],
          },
          synonyms: { type: Type.ARRAY, items: { type: Type.STRING } },
          antonyms: { type: Type.ARRAY, items: { type: Type.STRING } },
          examples: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                malay: { type: Type.STRING },
                chinese: { type: Type.STRING },
                english: { type: Type.STRING },
              },
              required: ["malay", "chinese", "english"],
            },
          },
          usage_notes: { type: Type.STRING },
        },
        required: ["word", "meanings", "synonyms", "antonyms", "examples"],
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  const entry: DictionaryEntry = JSON.parse(text);
  
  // Generate image in background or as part of the flow
  const firstMeaning = entry.meanings.english[0] || entry.word;
  entry.imageUrl = await generateImage(entry.word, firstMeaning);
  
  return entry;
}
