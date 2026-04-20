'use server';
/**
 * @fileOverview A Genkit flow for an AI farmer copilot assistant.
 */

import {ai, getAiWithKey} from '@/ai/genkit';
import {z} from 'genkit';
import { getRegionalContext } from '@/lib/localization';

const ChatAdvisorInputSchema = z.object({
  userQuestion: z.string().describe("The farmer's question about farming practices."),
  countryCode: z.string().optional().describe('The user\'s ISO country code.'),
  apiKey: z.string().optional().describe("User's own Gemini API key.")
});
export type ChatAdvisorInput = z.infer<typeof ChatAdvisorInputSchema>;

const ChatAdvisorOutputSchema = z.object({
  advice: z.string().describe("Actionable advice provided by the AI assistant.")
});
export type ChatAdvisorOutput = z.infer<typeof ChatAdvisorOutputSchema>;

export async function chatAdvisor(input: ChatAdvisorInput): Promise<ChatAdvisorOutput> {
  const aiInstance = getAiWithKey(input.apiKey);
  const { countryName, leaderTitle } = getRegionalContext(input.countryCode);
  
  const {output} = await aiInstance.generate({
    model: 'googleai/gemini-2.5-flash',
    prompt: `You are an intelligent AI agricultural expert specializing in ${countryName}. 
    
The user is a farmer in ${countryName}. 
ACTUAL TASK:
1. Provide specific, grounded, and helpful advice. 
2. If the question is about regulations, subsidies, or government focus, USE YOUR SEARCH TOOL to find the latest announcements in ${countryName}.
3. Mention how the ${leaderTitle} of ${countryName}'s focus on food security affects this issue.

Question: ${input.userQuestion}`,
    config: {
      googleSearchRetrieval: {}
    } as any,
    output: {schema: ChatAdvisorOutputSchema}
  });
  return output!;
}
