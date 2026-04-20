'use server';

import { ai, getAiWithKey } from '@/ai/genkit';
import { z } from 'genkit';
import { getRegionalContext } from '@/lib/localization';

const FarmAuditInputSchema = z.object({
  landSize: z.number().describe('Total land area in hectares.'),
  cropType: z.string().describe('Primary crop being audited.'),
  totalCosts: z.number().describe('Total operational expenses in local currency.'),
  actualHarvest: z.number().describe('Total weight of harvest produced.'),
  legalStatus: z.enum(['Individual', 'Cooperative', 'Registered Company']).describe('The legal entity type of the farm.'),
  countryCode: z.string().optional().describe('The user\'s ISO country code.'),
  apiKey: z.string().optional().describe("User's own Gemini API key.")
});
export type FarmAuditInput = z.infer<typeof FarmAuditInputSchema>;

const InvestorSchema = z.object({
  name: z.string().describe('Name of the investor, grant, or venture fund found.'),
  type: z.string().describe('Type (e.g., Venture Capital, Government Grant, Angel).'),
  description: z.string().describe('Brief summary of what they fund and why it matches this farm.'),
  link: z.string().url().describe('Direct link to their portal or website.')
});

const FarmAuditOutputSchema = z.object({
  readinessScore: z.number().describe('A score from 0-100 indicating preparedness for investment.'),
  efficiencyScore: z.number().describe('A score from 0-100 indicating yield vs cost performance.'),
  analysisMarkdown: z.string().describe('Detailed AI breakdown of the audit findings.'),
  benchmarks: z.string().describe('Brief comparison against national averages found in search.'),
  investorMatches: z.array(InvestorSchema).describe('List of REAL-WORLD investment opportunities found via search.')
});
export type FarmAuditOutput = z.infer<typeof FarmAuditOutputSchema>;

export async function runFarmAudit(input: FarmAuditInput): Promise<FarmAuditOutput> {
  const aiInstance = getAiWithKey(input.apiKey);
  const { countryName } = getRegionalContext(input.countryCode);

  const { output } = await aiInstance.generate({
    model: 'googleai/gemini-2.5-flash',
    prompt: `You are a senior agricultural auditor and investment scout for ${countryName}. 
    
FARM DATA:
- Crop: ${input.cropType}
- Size: ${input.landSize} Ha
- Costs: ${input.totalCosts}
- Harvest: ${input.actualHarvest}
- Legal Status: ${input.legalStatus}

ACTUAL TASK:
1. USE SEARCH to find the CURRENT national average yield per hectare for ${input.cropType} in ${countryName}.
2. USE SEARCH to find 3 REAL, active investment firms, agricultural venture funds, or government grants for farmers (specifically for ${input.legalStatus} entities) in ${countryName}, searching for things like 'agritech funding in ${countryName}'.
3. Calculate an investment readiness score (high efficiency and legal registration increase this).
4. Provide a detailed analysis based on real local market conditions.

Your results MUST be based on actual existing firms and current year data.`,
    config: {
      googleSearchRetrieval: {}
    } as any,
    output: { schema: FarmAuditOutputSchema }
  });

  if (!output) throw new Error('Failed to generate farm audit and investor intelligence.');
  return output;
}
