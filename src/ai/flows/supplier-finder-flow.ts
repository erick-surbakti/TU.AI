'use server';
/**
 * @fileOverview A Genkit flow for finding and summarizing nearby agricultural suppliers.
 *
 * - findSuppliers - A function that handles the process of finding and summarizing nearby suppliers.
 * - SupplierFinderInput - The input type for the findSuppliers function.
 * - SupplierFinderOutput - The return type for the findSuppliers function.
 */

import {ai, getAiWithKey} from '@/ai/genkit';
import {z} from 'genkit';
import { getRegionalContext } from '@/lib/localization';

const SupplierFinderInputSchema = z.object({
  latitude: z.number().describe("The user's current latitude."),
  longitude: z.number().describe("The user's current longitude."),
  productType: z.string().describe('The type of agricultural input needed (e.g., "fertilizer", "seeds").'),
  countryCode: z.string().optional().describe('The user\'s ISO country code.'),
  apiKey: z.string().optional().describe("User's own Gemini API key."),
});
export type SupplierFinderInput = z.infer<typeof SupplierFinderInputSchema>;

const SupplierInfoSchema = z.object({
  name: z.string().describe('The name of the supplier.'),
  address: z.string().describe('The address of the supplier.'),
  contact: z.string().describe('Contact information for the supplier (e.g., phone number, email, website).'),
  distanceKm: z.number().describe('The distance to the supplier in kilometers.'),
  mapLink: z.string().url().describe('A URL to a map showing the supplier location and directions.'),
});

const SupplierFinderOutputSchema = z.object({
  summary: z.string().describe('A natural language summary of the best supplier options.'),
  suppliers: z.array(SupplierInfoSchema).describe('A list of detailed supplier information.'),
});
export type SupplierFinderOutput = z.infer<typeof SupplierFinderOutputSchema>;

/**
 * Simulates fetching nearby agricultural suppliers based on location and product type.
 * In a real application, this would interact with a Maps API or a supplier database.
 */
async function getNearbySuppliers(latitude: number, longitude: number, productType: string) {
    // Simulate API call to a supplier database or Maps API
    // For the hackathon, returning mock data.
    console.log(`Searching for ${productType} suppliers near ${latitude}, ${longitude}`);

    // Mock data for demonstration purposes
    const mockSuppliers = [
      {
        name: 'AgriSupply Central',
        address: '123 Farm Road, Agroville',
        contact: '+60123456789',
        distanceKm: 5.2,
        mapLink: `https://maps.google.com/?q=${encodeURIComponent('AgriSupply Central')}&ll=${latitude},${longitude}`,
      },
      {
        name: 'Green Harvest Depot',
        address: '456 Cultivation Lane, Rural Heights',
        contact: 'info@greenharvest.com',
        distanceKm: 12.8,
        mapLink: `https://maps.google.com/?q=${encodeURIComponent('Green Harvest Depot')}&ll=${latitude},${longitude}`,
      },
      {
        name: 'Fertile Fields Store',
        address: '789 Growth Boulevard, Planterville',
        contact: 'www.fertilefields.my',
        distanceKm: 8.1,
        mapLink: `https://maps.google.com/?q=${encodeURIComponent('Fertile Fields Store')}&ll=${latitude},${longitude}`,
      },
    ];

    return mockSuppliers;
}

export async function findSuppliers(input: SupplierFinderInput): Promise<SupplierFinderOutput> {
  const aiInstance = getAiWithKey(input.apiKey);
  const { countryName } = getRegionalContext(input.countryCode);

  // Use the tool to find nearby suppliers (Mock still used for coordinates, but AI will ground it now)
  const suppliers = await getNearbySuppliers(
    input.latitude,
    input.longitude,
    input.productType,
  );

  const result = await aiInstance.generate({
    model: 'googleai/gemini-2.5-flash',
    prompt: `You are an AI assistant helping a farmer find agricultural suppliers in ${countryName}.
    
ACTUAL TASK:
1. USE YOUR SEARCH TOOL to find the names of REAL major agricultural trade centers, wholesale markets, or large cooperatives for ${input.productType} in ${countryName}, specifically near any major hubs in the user's country.
2. If the user's coordinates are provided, mention those, but PRIORITIZE providing real-world market names that exist in ${countryName}.

Search for: "${input.productType} markets in ${countryName}" or "agricultural input stores in ${countryName}".

Your output MUST be a JSON object matching the SupplierFinderOutputSchema.`,
    config: {
      googleSearchRetrieval: {}
    } as any,
    output: { schema: SupplierFinderOutputSchema }
  });

  if (!result.output) throw new Error('Failed to generate supplier summary.');
  return result.output;
}
