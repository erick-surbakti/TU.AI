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
import { getRegionalContext } from '@/lib/localization';

const NewsAnalysisInputSchema = z.object({
  topic: z.string().describe('The global event or topic to analyze (e.g., "Iran-US Tensions").'),
  region: z.string().default('Malaysia').describe('The focus region for impact analysis.'),
  countryCode: z.string().optional().describe('The user\'s ISO country code.'),
  apiKey: z.string().optional().describe("User's own Gemini API key.")
});
export type NewsAnalysisInput = z.infer<typeof NewsAnalysisInputSchema>;

const NewsAnalysisOutputSchema = z.object({
  title: z.string().describe('A catchy, professional headline for the article.'),
  summary: z.string().describe('A brief 2-sentence summary of the situation.'),
  articleBody: z.string().describe('The full AI-written article in Markdown format.'),
  riskLevel: z.enum(['Low', 'Moderate', 'High', 'Critical']).describe('The severity of the impact on local food stages.'),
  actions: z.array(z.string()).describe('Actionable steps for regional farmers.'),
  sourceUrl: z.string().optional().describe('The direct URL to the source news article.'),
  sourceName: z.string().optional().describe('The name of the news organization (e.g., Reuters, Tempo).'),
});
export type NewsAnalysisOutput = z.infer<typeof NewsAnalysisOutputSchema>;

const NewsAnalysisBatchInputSchema = z.object({
  category: z.enum(['local', 'global']).default('local'),
  countryCode: z.string().optional(),
  count: z.number().default(5),
  apiKey: z.string().optional()
});
export type NewsAnalysisBatchInput = z.infer<typeof NewsAnalysisBatchInputSchema>;

export async function generateNewsArticle(input: NewsAnalysisInput): Promise<NewsAnalysisOutput> {
  const aiInstance = getAiWithKey(input.apiKey);
  const { countryName } = getRegionalContext(input.countryCode);
  
  const { output } = await aiInstance.generate({
    model: 'googleai/gemini-2.5-flash',
    prompt: `You are a senior agricultural analyst specializing in ${countryName}'s food security.
Search for a REAL, recent news event about agriculture that impacts ${countryName}. 
Summarize it and provide actionable advice. Include the source name and URL.`,
    config: {
      googleSearchRetrieval: {}
    } as any,
    output: { schema: NewsAnalysisOutputSchema }
  });

  if (!output) throw new Error('Failed to generate AI news article.');
  return output;
}

export async function generateNewsBatch(input: NewsAnalysisBatchInput): Promise<NewsAnalysisOutput[]> {
  const aiInstance = getAiWithKey(input.apiKey);
  const { countryName, leaderTitle } = getRegionalContext(input.countryCode);
  const today = new Date().toLocaleDateString();

  const batchPrompt = `You are a world-class agricultural intelligence engine. Generating date: ${today}.

ACTUAL REAL-WORLD TASK:
1. USE YOUR SEARCH TOOL to find 5 distinct, REAL and EXISTING news articles from within the last 48-72 hours.
2. Focus on: ${input.category === 'local' ? countryName + "'s regional agriculture and food policy" : "Global agricultural trade, nitrogen supply, and climate trends affecting ASEAN"}.
3. For each REAL news story found, scalp the key details and provide a professional summary.

REQUIRED FIELDS FOR EACH ARTICLE:
- title: The actual headline found or a close summary.
- summary: 2-sentence summary of the REAL event.
- articleBody: Full markdown report based on the found news facts.
- riskLevel: Low, Moderate, High, or Critical.
- actions: 3 specific steps for farmers based on this news.
- sourceUrl: The REAL URL of the news article.
- sourceName: The name of the publisher (e.g. "The Jakarta Post", "Reuters", "Bloomberg").

DO NOT hallucinate news. If you cannot find a link, search specifically for regional agricultural news portals like 'AgriCensus' or local government news.`;

  const { output } = await aiInstance.generate({
    model: 'googleai/gemini-2.5-flash',
    prompt: batchPrompt,
    config: {
      googleSearchRetrieval: {}
    } as any,
    output: { schema: z.array(NewsAnalysisOutputSchema) }
  });

  if (!output) throw new Error('Failed to generate AI news batch.');
  return output;
}
