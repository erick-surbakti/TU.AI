'use server';
/**
 * @fileOverview A Genkit flow for generating AI articles about ASEAN agriculture news.
 */

import { getAiWithKey } from '@/ai/genkit';
import { getRegionalContext } from '@/lib/localization';

export type NewsAnalysisInput = {
  topic: string;
  region?: string;
  countryCode?: string;
  apiKey?: string;
};

export type NewsAnalysisOutput = {
  title: string;
  summary: string;
  articleBody: string;
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  actions: string[];
  sourceUrl?: string;
  sourceName?: string;
};

export type NewsAnalysisBatchInput = {
  category?: 'local' | 'global';
  countryCode?: string;
  count?: number;
  apiKey?: string;
};

export async function generateNewsArticle(input: NewsAnalysisInput): Promise<NewsAnalysisOutput> {
  const aiInstance = getAiWithKey(input.apiKey);
  const { countryName } = getRegionalContext(input.countryCode);

  const { text } = await aiInstance.generate({
    prompt: `You are a senior agricultural analyst for ${countryName}.

Analyze this topic and its impact on ${countryName}'s agriculture: "${input.topic}"

Respond ONLY with a valid JSON object in this exact format:
{
  "title": "Professional headline",
  "summary": "2-sentence summary",
  "articleBody": "Full analysis in Markdown format",
  "riskLevel": "Low" | "Moderate" | "High" | "Critical",
  "actions": ["action1", "action2", "action3"],
  "sourceUrl": "https://example.com (optional, a plausible URL)",
  "sourceName": "Publisher name (e.g. Reuters)"
}`,
  });

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found');
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      title: parsed.title || input.topic,
      summary: parsed.summary || '',
      articleBody: parsed.articleBody || text,
      riskLevel: parsed.riskLevel || 'Moderate',
      actions: parsed.actions || [],
      sourceUrl: parsed.sourceUrl,
      sourceName: parsed.sourceName,
    };
  } catch {
    return {
      title: input.topic,
      summary: 'AI analysis generated.',
      articleBody: text,
      riskLevel: 'Moderate',
      actions: ['Stay informed', 'Monitor local prices', 'Consult your agricultural extension office'],
    };
  }
}

export async function generateNewsBatch(input: NewsAnalysisBatchInput): Promise<NewsAnalysisOutput[]> {
  const aiInstance = getAiWithKey(input.apiKey);
  const { countryName } = getRegionalContext(input.countryCode);
  const today = new Date().toLocaleDateString();
  const focus = input.category === 'global'
    ? 'global agricultural trade, climate, and ASEAN food supply'
    : `${countryName}'s agriculture, food policy, and farming`;

  const { text } = await aiInstance.generate({
    prompt: `You are an agricultural intelligence engine. Today: ${today}.

Generate 5 distinct realistic agricultural news articles about ${focus}.

Respond ONLY with a valid JSON array of 5 objects, each with:
{
  "title": "Headline",
  "summary": "2-sentence summary",
  "articleBody": "Full Markdown analysis",
  "riskLevel": "Low" | "Moderate" | "High" | "Critical",
  "actions": ["action1", "action2", "action3"],
  "sourceUrl": "https://plausible-url.com",
  "sourceName": "Publisher name"
}

Return only the JSON array, no other text.`,
  });

  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('No JSON array found');
    const parsed = JSON.parse(jsonMatch[0]);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [{
      title: `Agricultural Update for ${countryName}`,
      summary: 'Latest agricultural intelligence report.',
      articleBody: text,
      riskLevel: 'Moderate',
      actions: ['Monitor market conditions', 'Review government subsidies', 'Consult local agricultural offices'],
    }];
  }
}
