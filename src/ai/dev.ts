import { config } from 'dotenv';
config();

import '@/ai/flows/scan-crop-flow.ts';
import '@/ai/flows/supplier-finder-flow.ts';
import '@/ai/flows/risk-intel-flow.ts';
import '@/ai/flows/chat-advisor-flow.ts';
import '@/ai/flows/news-analysis-flow.ts';