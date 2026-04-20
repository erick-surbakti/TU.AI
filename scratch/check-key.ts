import { config } from 'dotenv';
import path from 'path';

// Load .env from the root
config({ path: path.join(process.cwd(), '.env') });

const key = process.env.GROQ_API_KEY;
console.log('--- DIAGNOSTIC ---');
console.log('KEY EXISTS:', !!key);
if (key) {
  console.log('KEY LENGTH:', key.length);
  console.log('KEY START:', key.substring(0, 4));
  console.log('KEY END:', key.substring(key.length - 4));
  console.log('CONTAINS WHITESPACE:', /\s/.test(key));
} else {
  console.log('ERROR: GROQ_API_KEY is not in process.env');
}
console.log('------------------');
