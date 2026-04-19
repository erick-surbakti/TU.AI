'use server';
/**
 * @fileOverview A comprehensive Genkit flow for farm planning, auditing, and optimization.
 * 
 * - farmSetupGuide - Provides a detailed roadmap for new farmers or a deep health audit for existing ones.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ProductionDataSchema = z.object({
  cropType: z.string().optional(),
  lastPlantingDate: z.string().optional(),
  averageYield: z.string().optional(),
  fertilizerUsage: z.string().optional(),
  livestockType: z.string().optional(),
  livestockCount: z.number().optional(),
  feedUsage: z.string().optional(),
});

const FarmSetupInputSchema = z.object({
  status: z.enum(['beginner', 'existing']).describe('User status.'),
  basicInfo: z.object({
    farmName: z.string(),
    ownerName: z.string(),
    country: z.string(),
    region: z.string(),
    address: z.string(),
  }),
  farmType: z.string().describe('Major plant or livestock type.'),
  sizeValue: z.number(),
  sizeUnit: z.string(),
  problems: z.array(z.string()).describe('Selected pain points.'),
  operations: z.object({
    trackingMethod: z.string(),
    useSensors: z.boolean(),
    useMachinery: z.boolean(),
  }),
  productionData: ProductionDataSchema,
  goals: z.array(z.string()),
  budget: z.string(),
  helpType: z.string(),
});

export type FarmSetupInput = z.infer<typeof FarmSetupInputSchema>;

const FarmSetupOutputSchema = z.object({
  healthReport: z.object({
    productivityScore: z.number().describe('0-100 score.'),
    costEfficiency: z.number().describe('0-100 score.'),
    diseaseRisk: z.enum(['Low', 'Medium', 'High', 'Critical']),
    waterRisk: z.enum(['Low', 'Medium', 'High']),
    profitPotential: z.enum(['Low', 'Medium', 'High', 'Very High']),
  }).optional(),
  recommendations: z.array(z.string()).describe('Actionable items.'),
  roadmap: z.array(z.string()).describe('Step-by-step path.'),
  motivation: z.string().describe('Inspirational AI reasoning.'),
  landOptions: z.array(z.object({
    location: z.string(),
    size: z.string(),
    priceEstimate: z.string(),
    suitabilityReason: z.string(),
  })).optional(),
});

export type FarmSetupOutput = z.infer<typeof FarmSetupOutputSchema>;

export async function farmSetupGuide(input: FarmSetupInput): Promise<FarmSetupOutput> {
  return farmSetupFlow(input);
}

const farmSetupPrompt = ai.definePrompt({
  name: 'farmSetupPrompt',
  input: { schema: FarmSetupInputSchema },
  output: { schema: FarmSetupOutputSchema },
  prompt: `You are a professional agricultural consultant for ASEAN. Analyze this farm profile and provide a deep intelligence report.

  User Status: {{{status}}}
  Farm Name: {{{basicInfo.farmName}}}
  Region: {{{basicInfo.region}}}, {{{basicInfo.country}}}
  Farm Type: {{{farmType}}}
  Size: {{{sizeValue}}} {{{sizeUnit}}}
  Current Problems: {{#each problems}}- {{{this}}} {{/each}}
  Goals: {{#each goals}}- {{{this}}} {{/each}}
  Budget Segment: {{{budget}}}

  If user is EXISTING:
  1. Generate a "Farm Health Report" with scores based on their operational data.
  2. Provide 3-5 specific recommendations to solve their "Current Problems" and meet their "Goals".
  3. Suggest localized technology or robot integration if they are interested in "Improve automation".

  If user is BEGINNER:
  1. Provide a step-by-step roadmap from 0 to hero in {{{basicInfo.region}}}.
  2. Suggest 3 specific sub-regions for land purchase if they don't have land.
  3. Provide estimated seed/material costs based on their crop interest.

  Always include a "Motivation" section explaining why local farming is critical for food security and reducing national export dependency.`,
});

const farmSetupFlow = ai.defineFlow(
  {
    name: 'farmSetupFlow',
    inputSchema: FarmSetupInputSchema,
    outputSchema: FarmSetupOutputSchema,
  },
  async (input) => {
    const { output } = await farmSetupPrompt(input);
    if (!output) throw new Error('AI failed to generate farm plan.');
    return output;
  }
);
