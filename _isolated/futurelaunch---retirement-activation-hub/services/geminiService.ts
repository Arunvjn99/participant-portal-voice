import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// Initialize the client
// Note: In a production app, you might want to handle the missing key more gracefully
const ai = new GoogleGenAI({ apiKey });

export const getFinancialGuidance = async (userPrompt: string): Promise<string> => {
  if (!apiKey) {
    return "I'm currently in demo mode. Please configure the API key to chat with me!";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userPrompt,
      config: {
        systemInstruction: `You are Aura, a warm, encouraging, and emotionally intelligent financial guide for a retirement enrollment portal. 
        The user has NOT enrolled yet. Your goal is to make them feel confident and curious.
        Keep answers short (under 3 sentences), simple, and jargon-free. 
        Use a conversational tone. Avoid strict financial advice; strictly educational.`,
        temperature: 0.7,
      }
    });

    return response.text || "I'm having a little trouble connecting to the future right now. Try again?";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm taking a brief moment to recalibrate. Please try asking again shortly.";
  }
};
