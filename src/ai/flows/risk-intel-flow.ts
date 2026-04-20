'use server';
/**
 * @fileOverview A Genkit flow for analyzing supply chain risks.
 */

import { getAiWithKey } from '@/ai/genkit';
import { getRegionalContext } from '@/lib/localization';

export type RiskIntelInput = {
  region: string;
  countryCode?: string;
  newsSummary: string;
  commodityPrices: Record<string, number>;
  exportImportBans: string[];
  policyUpdates: string;
  apiKey?: string;
};

export type RiskIntelOutput = {
  alertLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  potentialImpactSummary: string;
  recommendedActions: string[];
  groundingProof?: string;
};

export async function riskIntel(input: RiskIntelInput): Promise<RiskIntelOutput> {
  const aiInstance = getAiWithKey(input.apiKey);
  const { countryName, leaderTitle } = getRegionalContext(input.countryCode);

  const { text } = await aiInstance.generate({
    prompt: `You are an expert agricultural supply chain risk advisor for ${countryName}.

CONTEXT:
- News: ${input.newsSummary}
- Commodity Prices: ${JSON.stringify(input.commodityPrices)}
- Export/Import Bans: ${input.exportImportBans.join(', ') || 'None reported'}
- Policy Updates: ${input.policyUpdates}
- The ${leaderTitle} of ${countryName} is focused on food sovereignty.

TASK: Analyze the supply chain risk for farmers in ${countryName} and respond ONLY with a valid JSON object in this exact format:
{
  "alertLevel": "Low" | "Medium" | "High" | "Critical",
  "potentialImpactSummary": "string describing the risk impact",
  "recommendedActions": ["action1", "action2", "action3"],
  "groundingProof": "string mentioning key context that justifies the alert level"
}`,
  });

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found');
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      alertLevel: parsed.alertLevel || 'Medium',
      potentialImpactSummary: parsed.potentialImpactSummary || '',
      recommendedActions: parsed.recommendedActions || [],
      groundingProof: parsed.groundingProof,
    };
  } catch {
    return {
      alertLevel: 'Medium',
      potentialImpactSummary: text || 'Unable to assess risk at this time.',
      recommendedActions: ['Monitor commodity prices closely', 'Diversify suppliers', 'Review government subsidy programs'],
    };
  }
}
