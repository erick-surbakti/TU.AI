'use server';
/**
 * @fileOverview A Genkit flow for an AI farmer copilot assistant.
 */

import { getAiWithKey } from '@/ai/genkit';
import { getRegionalContext } from '@/lib/localization';

export type ChatAdvisorInput = {
  userQuestion: string;
  countryCode?: string;
  apiKey?: string;
};

export type ChatAdvisorOutput = {
  advice: string;
};

export async function chatAdvisor(input: ChatAdvisorInput): Promise<ChatAdvisorOutput> {
  const aiInstance = getAiWithKey(input.apiKey);
  const { countryName, leaderTitle } = getRegionalContext(input.countryCode);

  try {
    const { text } = await aiInstance.generate({
      prompt: `You are TUAI Copilot, an expert AI agricultural advisor for ${countryName}.
      
STRICT SCOPE & RULES:
1. TOPIC: Only answer questions related to agriculture, farming, crops, livestock, pests, soil, and ${countryName}'s agricultural policies. 
2. OFF-TOPIC: If the user asks about anything else (movies, sports, general tech, etc.), politely refuse and say: "I am specialized only in helping you with your farm and crops. How can I help you today?"
3. FORMATTING: Use only plain, clean text. DO NOT use markdown bolding (**), italics (_), or headers (#). 
4. TONE: Helpful and practical for a farmer.

User Question: ${input.userQuestion}`,
    });

    const cleanText = (text || 'I could not generate a response.').replace(/\*\*/g, '').replace(/###/g, '').replace(/##/g, '');

    return { advice: cleanText };
  } catch (error) {
    console.error("GENKIT CHAT FLOW ERROR:", error);
    throw error;
  }
}
