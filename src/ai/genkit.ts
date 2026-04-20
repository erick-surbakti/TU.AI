import { genkit } from 'genkit';
import { groq, llama33x70bVersatile } from 'genkitx-groq';

const platformApiKey = process.env.GROQ_API_KEY?.trim();

if (!platformApiKey) {
  throw new Error('GROQ_API_KEY env var is missing! Please check your .env file and RESTART the server.');
}

// 1. Initialize the shared Genkit instance with the official model constant
export const ai = genkit({
  plugins: [groq({ apiKey: platformApiKey })],
  model: llama33x70bVersatile,
});

/**
 * 2. Helper to get AI instance with a specific key.
 */
export function getAiWithKey(apiKey?: string) {
  if (!apiKey || apiKey === 'undefined' || apiKey === 'null') {
    return ai;
  }

  const trimmedKey = apiKey.trim();
  return genkit({
    plugins: [groq({ apiKey: trimmedKey })],
    model: llama33x70bVersatile,
  });
}