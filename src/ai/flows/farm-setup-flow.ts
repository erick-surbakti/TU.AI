'use server';
/**
 * @fileOverview A Genkit flow for farm planning and setup guidance.
 */

import { getAiWithKey } from '@/ai/genkit';
import { getRegionalContext } from '@/lib/localization';

export type FarmSetupInput = {
  status: 'beginner' | 'existing';
  basicInfo: {
    farmName: string;
    ownerName: string;
    country: string;
    region: string;
    address: string;
  };
  farmType?: string;
  sizeValue?: number;
  sizeUnit?: string;
  hasLivestock?: boolean;
  livestockDetails?: string;
  techInterest?: boolean;
  problems?: string[];
  operations?: {
    trackingMethod: string;
    useSensors: boolean;
    useMachinery: boolean;
  };
  productionData?: {
    cropType?: string;
    lastPlantingDate?: string;
    averageYield?: string;
    fertilizerUsage?: string;
    livestockType?: string;
    livestockCount?: number;
    feedUsage?: string;
    mortalityRate?: string;
  };
  targetCrop?: string;
  hasLand?: boolean;
  budget: string;
  motivation?: string;
  goals: string[];
  helpType: string;
  apiKey?: string;
  countryCode?: string;
};

export type FarmSetupOutput = {
  healthReport?: {
    productivityScore: number;
    costEfficiency: number;
    diseaseRisk: 'Low' | 'Medium' | 'High' | 'Critical';
    waterRisk: 'Low' | 'Medium' | 'High';
    profitPotential: 'Low' | 'Medium' | 'High' | 'Very High';
  };
  recommendations: string[];
  roadmap: string[];
  motivationAI: string;
  landOptions?: Array<{
    location: string;
    size: string;
    priceEstimate: string;
    suitabilityReason: string;
  }>;
  financialEstimate?: {
    initialCapital: string;
    operatingExpense: string;
    expectedRoiTime: string;
  };
};

export async function farmSetupGuide(input: FarmSetupInput): Promise<FarmSetupOutput> {
  const aiInstance = getAiWithKey(input.apiKey);
  const { countryName, leaderTitle } = getRegionalContext(input.countryCode);

  const { text } = await aiInstance.generate({
    prompt: `You are a professional agricultural consultant for ${countryName}.

USER PROFILE:
- Status: ${input.status === 'beginner' ? 'New/Beginner Farmer' : 'Existing Farmer'}
- Farm Name: ${input.basicInfo.farmName}
- Owner: ${input.basicInfo.ownerName}
- Region: ${input.basicInfo.region}, ${countryName}
- Target/Current Crop: ${input.targetCrop || input.farmType || 'General farming'}
- Budget: ${input.budget}
- Goals: ${input.goals.join(', ')}
- Help Needed: ${input.helpType}
${input.problems?.length ? `- Challenges: ${input.problems.join(', ')}` : ''}

TASK: Create a comprehensive farm plan and respond ONLY with a valid JSON object:
{
  ${input.status === 'existing' ? `"healthReport": {
    "productivityScore": 70,
    "costEfficiency": 65,
    "diseaseRisk": "Low",
    "waterRisk": "Medium",
    "profitPotential": "High"
  },` : ''}
  "recommendations": ["actionable recommendation 1", "recommendation 2", "recommendation 3"],
  "roadmap": ["Step 1: ...", "Step 2: ...", "Step 3: ...", "Step 4: ...", "Step 5: ..."],
  "motivationAI": "Inspiring message about farming in ${countryName} under the ${leaderTitle}'s food security vision",
  "landOptions": [
    {
      "location": "District/area name in ${input.basicInfo.region}",
      "size": "2-5 hectares",
      "priceEstimate": "Realistic price in local currency",
      "suitabilityReason": "Why this location suits ${input.targetCrop || input.farmType || 'farming'}"
    }
  ],
  "financialEstimate": {
    "initialCapital": "Realistic estimate in local currency",
    "operatingExpense": "Monthly/yearly operating cost",
    "expectedRoiTime": "e.g., 18-24 months"
  }
}`,
  });

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found');
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      healthReport: parsed.healthReport,
      recommendations: parsed.recommendations || [],
      roadmap: parsed.roadmap || [],
      motivationAI: parsed.motivationAI || `Farming in ${countryName} is a noble and impactful calling.`,
      landOptions: parsed.landOptions,
      financialEstimate: parsed.financialEstimate,
    };
  } catch {
    return {
      recommendations: ['Start with soil testing', 'Apply for government subsidies', 'Join a local farmers cooperative'],
      roadmap: ['Step 1: Register with the Ministry of Agriculture', 'Step 2: Get soil analysis', 'Step 3: Plan crop calendar', 'Step 4: Source quality seeds', 'Step 5: Set up irrigation'],
      motivationAI: text || `Farming in ${countryName} is a vital contribution to the nation's food security goals.`,
    };
  }
}
