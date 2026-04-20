'use server';
/**
 * @fileOverview A Genkit flow for finding agricultural suppliers.
 */

import { getAiWithKey } from '@/ai/genkit';
import { getRegionalContext } from '@/lib/localization';

export type SupplierFinderInput = {
  latitude: number;
  longitude: number;
  productType: string;
  countryCode?: string;
  apiKey?: string;
};

export type SupplierInfo = {
  name: string;
  address: string;
  contact: string;
  distanceKm: number;
  mapLink: string;
};

export type SupplierFinderOutput = {
  summary: string;
  suppliers: SupplierInfo[];
};

export async function findSuppliers(input: SupplierFinderInput): Promise<SupplierFinderOutput> {
  const aiInstance = getAiWithKey(input.apiKey);
  const { countryName } = getRegionalContext(input.countryCode);

  const { text } = await aiInstance.generate({
    prompt: `You are an AI assistant helping a farmer find agricultural suppliers in ${countryName}.

The farmer needs: ${input.productType}
Their location: Latitude ${input.latitude}, Longitude ${input.longitude} (in ${countryName})

Respond ONLY with a valid JSON object in this exact format:
{
  "summary": "A helpful 2-3 sentence summary of supplier options",
  "suppliers": [
    {
      "name": "Supplier name",
      "address": "Realistic address in ${countryName}",
      "contact": "+60123456789 or website",
      "distanceKm": 5.2,
      "mapLink": "https://maps.google.com/?q=Supplier+Name"
    }
  ]
}

Provide 3 realistic suppliers. Use real city names in ${countryName}. Estimate reasonable distances.`,
  });

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found');
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      summary: parsed.summary || 'Suppliers found near your location.',
      suppliers: parsed.suppliers || [],
    };
  } catch {
    return {
      summary: `Here are some agricultural suppliers for ${input.productType} in ${countryName}.`,
      suppliers: [
        {
          name: 'Local Agricultural Supply Store',
          address: `Near your location in ${countryName}`,
          contact: 'Contact local agricultural office',
          distanceKm: 10,
          mapLink: `https://maps.google.com/?q=agricultural+supply+${countryName}`,
        }
      ],
    };
  }
}
