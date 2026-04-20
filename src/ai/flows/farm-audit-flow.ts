'use server';

import { ai, getAiWithKey } from '@/ai/genkit';
import { getRegionalContext } from '@/lib/localization';

export type FarmAuditInput = {
  landSize: number;
  cropType: string;
  totalCosts: number;
  actualHarvest: number;
  legalStatus: 'Individual' | 'Cooperative' | 'Registered Company';
  countryCode?: string;
  apiKey?: string;
  marketPrice?: number;
};

export type InvestorMatch = {
  name: string;
  type: string;
  description: string;
  link: string;
};

export type FarmAuditOutput = {
  readinessScore: number;
  efficiencyScore: number;
  analysisMarkdown: string;
  benchmarks: string;
  investorMatches: InvestorMatch[];
};

export async function runFarmAudit(input: FarmAuditInput): Promise<FarmAuditOutput> {
  const aiInstance = getAiWithKey(input.apiKey);
  const { countryName } = getRegionalContext(input.countryCode);

  const yieldPerHa = (input.actualHarvest / input.landSize).toFixed(0);
  const costPerHa = (input.totalCosts / input.landSize).toFixed(0);

  const { text } = await aiInstance.generate({
    prompt: `You are a senior agricultural auditor and investment scout for ${countryName}.

FARM DATA:
- Crop: ${input.cropType}
- Land: ${input.landSize} Ha
- Total Costs: ${input.totalCosts} (local currency)
- Harvest: ${input.actualHarvest} kg
- Yield/Ha: ${yieldPerHa} kg/Ha
- Cost/Ha: ${costPerHa}
- Legal Status: ${input.legalStatus}

TASK: Audit this farm and respond ONLY with a valid JSON object in this exact format:
{
  "readinessScore": 75,
  "efficiencyScore": 68,
  "analysisMarkdown": "## Farm Audit Report\\n\\nDetailed markdown analysis here...",
  "benchmarks": "Brief comparison against national averages for ${input.cropType} in ${countryName}",
  "investorMatches": [
    {
      "name": "Fund or grant name",
      "type": "Government Grant | Venture Capital | Angel | Cooperative",
      "description": "What they fund and why it matches this farm",
      "link": "https://realistic-url.gov.my or similar"
    }
  ]
}

Provide 3 investor matches. Use realistic fund names from ${countryName} (e.g. Agrobank, relevant ministries, agritech VCs).`,
  });

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found');
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      readinessScore: Number(parsed.readinessScore) || 60,
      efficiencyScore: Number(parsed.efficiencyScore) || 60,
      analysisMarkdown: parsed.analysisMarkdown || text,
      benchmarks: parsed.benchmarks || `Analysis for ${input.cropType} in ${countryName}`,
      investorMatches: parsed.investorMatches || [],
    };
  } catch {
    return {
      readinessScore: 60,
      efficiencyScore: 60,
      analysisMarkdown: text,
      benchmarks: `Farm audit for ${input.cropType} in ${countryName}`,
      investorMatches: [],
    };
  }
}
