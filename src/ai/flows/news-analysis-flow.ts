'use server';
/**
 * @fileOverview A Genkit flow for generating AI articles about global news and its impact on Malaysian agriculture.
 *
 * - generateNewsArticle - A function that writes a detailed impact article for farmers.
 * - NewsAnalysisInput - The input type for the news analysis.
 * - NewsAnalysisOutput - The generated article content.
 */

import { ai, getAiWithKey } from '@/ai/genkit';
import { z } from 'genkit';

const NewsAnalysisInputSchema = z.object({
  topic: z.string().describe('The global event or topic to analyze (e.g., "Iran-US Tensions").'),
  region: z.string().default('Malaysia').describe('The focus region for impact analysis.'),
  apiKey: z.string().optional().describe("User's own Gemini API key.")
});
export type NewsAnalysisInput = z.infer<typeof NewsAnalysisInputSchema>;

const NewsAnalysisOutputSchema = z.object({
  title: z.string().describe('A catchy, professional headline for the article.'),
  summary: z.string().describe('A brief 2-sentence summary of the situation.'),
  articleBody: z.string().describe('The full AI-written article in Markdown format.'),
  riskLevel: z.enum(['Low', 'Moderate', 'High', 'Critical']).describe('The severity of the impact on local food stages.'),
  actions: z.array(z.string()).describe('Actionable steps for Malaysian farmers.'),
});
export type NewsAnalysisOutput = z.infer<typeof NewsAnalysisOutputSchema>;

export async function generateNewsArticle(input: NewsAnalysisInput): Promise<NewsAnalysisOutput> {
  const aiInstance = getAiWithKey(input.apiKey);
  const newsPrompt = aiInstance.definePrompt({
    name: 'newsAnalysisPrompt',
    input: { schema: NewsAnalysisInputSchema },
    output: { schema: NewsAnalysisOutputSchema },
    model: 'googleai/gemini-2.5-flash',
    prompt: `You are a senior agricultural analyst for the Malaysian government. 

Write a professional, grounded, and insightful article for local farmers about how "{{{topic}}}" will impact the food stages and agricultural supply chains in {{{region}}}.

Consider:
1. Fuel and fertilizer price fluctuations.
2. Shipping route disruptions in the region.
3. Impact on local commodity exports (like Padi, Rubber, or Palm Oil).
4. Long-term food security implications for Malaysian citizens.

The article should be empathetic to the farmer's hard work and provide clear guidance. Use Markdown for the article body.`,
  });

  const { output } = await newsPrompt(input);
  if (!output) throw new Error('Failed to generate AI news article.');
  return output;
}
