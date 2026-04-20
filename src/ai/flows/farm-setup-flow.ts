'use server';
/**
 * @fileOverview A comprehensive Genkit flow for farm planning, auditing, and optimization.
 * 
 * - farmSetupGuide - Provides a detailed roadmap for new farmers or a deep health audit for existing ones.
 */

import { ai, getAiWithKey } from '@/ai/genkit';
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
  apiKey: z.string().optional(),
  countryCode: z.string().optional().describe('The user\'s ISO country code.'),
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
  const aiInstance = getAiWithKey(input.apiKey);
  const { countryName, leaderTitle } = getRegionalContext(input.countryCode);
  
  const { output } = await aiInstance.generate({
    model: 'googleai/gemini-2.5-flash',
    prompt: `You are a professional agricultural consultant for ${countryName}.
    
ACTUAL REAL-WORLD TASK:
1. USE YOUR SEARCH TOOL to find real land price ranges in ${input.basicInfo.region}, ${countryName} for agricultural land.
2. Search for the names of 2-3 REAL government grants or subsidies currently offered for ${input.targetCrop || input.farmType || 'farmers'} in ${countryName}.
3. Provide a step-by-step roadmap tailored to the local climate of ${input.basicInfo.region}.

   USER PROFILE:
   - Status: ${input.status}
   - Region: ${input.basicInfo.region}
   - Target/Current: ${input.targetCrop || ''}${input.farmType || ''}
   - Budget: ${input.budget}

Always include a "MotivationAI" section mentioning how ${countryName}'s food security is a priority for the ${leaderTitle}.`,
    config: {
      googleSearchRetrieval: {}
    } as any,
    output: { schema: FarmSetupOutputSchema },
  });

  if (!output) throw new Error('AI failed to generate farm plan.');
  return output;
}
