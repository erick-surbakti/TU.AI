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
import { getRegionalContext } from '@/lib/localization';

const RiskIntelInputSchema = z.object({
  region: z.string().describe('The specific geographic region for which the risk analysis is performed (e.g., "Malaysia").'),
  countryCode: z.string().optional().describe('The user\'s ISO country code.'),
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
  groundingProof: z.string().optional().describe('A brief mention of the real-world event found via search that justifies this risk level.'),
});
export type RiskIntelOutput = z.infer<typeof RiskIntelOutputSchema>;

export async function riskIntel(input: RiskIntelInput): Promise<RiskIntelOutput> {
  const aiInstance = getAiWithKey(input.apiKey);
  const { countryName, leaderTitle } = getRegionalContext(input.countryCode);

  const { output } = await aiInstance.generate({
    model: 'googleai/gemini-2.5-flash',
    prompt: `You are an expert agricultural supply chain risk advisor for ${countryName}.
    
ACTUAL TASK:
1. USE YOUR SEARCH TOOL to find any REAL and RECENT geopolitical or trade news (last 7 days) that impacts agricultural costs (fuel, fertilizer, shipping, chemicals) in ${countryName} or the ASEAN region.
2. Search for the current price trends of urea and diesel in ${countryName}.
3. Based on REAL FACTS found, determine the alert level.

If you find a specific event (e.g. a new export ban or a specific shipping delay), describe it in 'potentialImpactSummary' and record the specific source/event in 'groundingProof'.

Context: The ${leaderTitle} of ${countryName} is focused on food sovereignty.`,
    config: {
      googleSearchRetrieval: {}
    } as any,
    output: { schema: RiskIntelOutputSchema },
  });

  if (!output) {
    throw new Error('Failed to generate supply chain risk intelligence.');
  }
  return output;
}
