'use server';
/**
 * @fileOverview A Genkit flow for analyzing supply chain risks and providing preventative actions to farmers.
 *
 * - riskIntel - A function that handles the supply chain risk analysis process.
 * - RiskIntelInput - The input type for the riskIntel function.
 * - RiskIntelOutput - The return type for the riskIntel function.
 */

import { ai, getAiWithKey } from '@/ai/genkit';
import { z } from 'genkit';

const RiskIntelInputSchema = z.object({
  region: z.string().describe('The specific geographic region for which the risk analysis is performed (e.g., "Malaysia").'),
  newsSummary: z.string().describe('A summary of recent global news, including geopolitical events, conflicts, and trade policy changes relevant to agricultural supply chains.'),
  commodityPrices: z.record(z.string(), z.number()).describe('A dictionary of current commodity prices relevant to farming (e.g., {"fertilizer": 750, "diesel": 1.20}).'),
  exportImportBans: z.array(z.string()).describe('A list of reported export or import bans on agricultural goods or inputs.'),
  policyUpdates: z.string().describe('Summarized updates on relevant government agricultural policies, subsidies, or regulations.'),
  apiKey: z.string().optional().describe("User's own Gemini API key.")
});
export type RiskIntelInput = z.infer<typeof RiskIntelInputSchema>;

const RiskIntelOutputSchema = z.object({
  alertLevel: z.enum(['Low', 'Medium', 'High', 'Critical']).describe('The overall alert level indicating the severity of the supply chain risk.'),
  potentialImpactSummary: z.string().describe('A summary of how the identified risks could potentially impact farming operations in the specified region.'),
  recommendedActions: z.array(z.string()).describe('A list of specific, actionable steps farmers can take to mitigate the identified risks.'),
});
export type RiskIntelOutput = z.infer<typeof RiskIntelOutputSchema>;

export async function riskIntel(input: RiskIntelInput): Promise<RiskIntelOutput> {
  const aiInstance = getAiWithKey(input.apiKey);
  const prompt = aiInstance.definePrompt({
    name: 'riskIntelPrompt',
    input: { schema: RiskIntelInputSchema },
    output: { schema: RiskIntelOutputSchema },
    model: 'googleai/gemini-2.5-flash', 
    config: {
      safetySettings: [
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      ],
    },
    prompt: `You are an expert agricultural supply chain risk advisor specializing in farming operations in {{region}}.

Analyze the following information to identify potential supply chain disruptions, assess their impact on local farming, and provide clear, actionable preventative measures.

### Recent Global News Summary:
{{{newsSummary}}}

### Current Commodity Prices:
{{{commodityPrices}}}

### Export/Import Bans Reported:
{{#each exportImportBans}}- {{{this}}}{{/each}}

### Relevant Policy Updates:
{{{policyUpdates}}}

Based on this data, determine the overall alert level, summarize the potential impact on farming in {{region}}, and provide specific recommended actions for farmers to mitigate these risks.

Focus on practical advice that farmers can implement.`,
  });

  const { output } = await prompt(input);
  if (!output) {
    throw new Error('Failed to generate supply chain risk intelligence.');
  }
  return output;
}
