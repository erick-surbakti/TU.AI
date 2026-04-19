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
  mortalityRate: z.string().optional(),
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
  // Fields for Existing
  farmType: z.string().optional(),
  sizeValue: z.number().optional(),
  sizeUnit: z.string().optional(),
  hasLivestock: z.boolean().optional(),
  livestockDetails: z.string().optional(),
  techInterest: z.boolean().optional(),
  problems: z.array(z.string()).optional(),
  operations: z.object({
    trackingMethod: z.string(),
    useSensors: z.boolean(),
    useMachinery: z.boolean(),
  }).optional(),
  productionData: ProductionDataSchema.optional(),
  
  // Fields for Beginners
  targetCrop: z.string().optional(),
  hasLand: z.boolean().optional(),
  budget: z.string().describe('Capital/Modal readiness.'),
  motivation: z.string().optional(),
  
  // Shared
  goals: z.array(z.string()),
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
  motivationAI: z.string().describe('Inspirational AI reasoning.'),
  landOptions: z.array(z.object({
    location: z.string(),
    size: z.string(),
    priceEstimate: z.string(),
    suitabilityReason: z.string(),
  })).optional(),
  financialEstimate: z.object({
    initialCapital: z.string(),
    operatingExpense: z.string(),
    expectedRoiTime: z.string(),
  }).optional(),
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

  USER STATUS: {{{status}}}
  
  {{#if (eq status "existing")}}
  ### EXISTING FARM AUDIT
  Farm Name: {{{basicInfo.farmName}}}
  Region: {{{basicInfo.region}}}, {{{basicInfo.country}}}
  Farm Type: {{{farmType}}}
  Size: {{{sizeValue}}} {{{sizeUnit}}}
  Livestock: {{#if hasLivestock}}{{{livestockDetails}}}{{else}}None{{/if}}
  Tech Interest: {{#if techInterest}}High (Interested in Robots/AI){{else}}Low{{/if}}
  Current Problems: {{#each problems}}- {{{this}}} {{/each}}
  Production Stats: Yield: {{{productionData.averageYield}}}, Feed: {{{productionData.feedUsage}}}
  
  Tasks:
  1. Generate a "Farm Health Report" with scores based on their operational data.
  2. Provide 3-5 specific recommendations to solve their "Current Problems" (especially yield and cost).
  3. Suggest specific localized robotics or AI tools (like TUAI Scanners) if they are tech-interested.
  {{/if}}

  {{#if (eq status "beginner")}}
  ### BEGINNER ROADMAP
  Interest: {{{targetCrop}}}
  Capital (Modal): {{{budget}}}
  Land Status: {{#if hasLand}}Owns land{{else}}Needs land scouting{{/if}}
  Motivation: {{{motivation}}}
  
  Tasks:
  1. Provide a step-by-step roadmap from 0 to first harvest in {{{basicInfo.region}}}.
  2. If they need land, suggest 3 specific sub-regions in {{{basicInfo.region}}} for land purchase with estimated prices.
  3. Breakdown the "Initial Capital" needed for seeds, tools, and labor based on their {{{budget}}}.
  4. Explain why choosing {{{targetCrop}}} is a smart move for reducing national export dependency.
  {{/if}}

  Always include a "MotivationAI" section explaining why local farming is critical for food security.`,
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
