'use server';
/**
 * @fileOverview A Genkit flow for identifying crop diseases.
 */

import { getAiWithKey } from '@/ai/genkit';

export type ScanCropInput = {
  photoDataUri: string;
  description: string;
  apiKey?: string;
};

export type ScanCropOutput = {
  diseaseIdentified: boolean;
  diseaseName?: string;
  treatmentRecommendation: string;
  confidenceScore: number;
};

export async function scanCrop(input: ScanCropInput): Promise<ScanCropOutput> {
  const aiInstance = getAiWithKey(input.apiKey);

  const { text } = await aiInstance.generate({
    prompt: [
      {
        text: `You are a professional plant pathologist and agricultural expert. 
Analyze the provided image and description: "${input.description}"

TASK:
1. CONDITION: Assess if the plant is in Good, Stressed, or Diseased condition.
2. PROBLEM ID: If not in "Good" condition, identify the exact problem (Disease name, Pest type, or Nutrient Deficiency). If "Good", say "Plant appears healthy".
3. SOLUTION: Provide exactly 3 clear, actionable steps the farmer can take to solve the issue or maintain health.
4. FORMAT: Do NOT use markdown bolding (**) or headers.

Respond ONLY with a valid JSON object in this exact format:
{
  "diseaseIdentified": true/false,
  "diseaseName": "Condition/Disease Name",
  "treatmentRecommendation": "Step 1: ... Step 2: ... Step 3: ...",
  "confidenceScore": 0.85
}` },
      { media: { url: input.photoDataUri, contentType: 'image/jpeg' } }
    ],
  });

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found');
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      diseaseIdentified: Boolean(parsed.diseaseIdentified),
      diseaseName: parsed.diseaseName,
      treatmentRecommendation: parsed.treatmentRecommendation || 'No recommendation provided.',
      confidenceScore: typeof parsed.confidenceScore === 'number' ? parsed.confidenceScore : 0.7,
    };
  } catch {
    return {
      diseaseIdentified: false,
      diseaseName: 'Unknown',
      treatmentRecommendation: text || 'Unable to diagnose crop health.',
      confidenceScore: 0.5,
    };
  }
}
