import 'dotenv/config';
import { analyzeFeedback } from './services/aiService';

const samples = [
  'The app is incredibly fast and the UI is beautiful. Love using it every day!',
  'I was charged twice for the same subscription and nobody from support has responded in 3 days.',
  'It would be great if you could add dark mode and keyboard shortcuts.',
];

async function main() {
  console.log('GROQ_API_KEY loaded:', process.env.GROQ_API_KEY ? '✅ Yes' : '❌ No — check your .env file');
  console.log('');

  for (const text of samples) {
    console.log(`Feedback: "${text}"`);
    const result = await analyzeFeedback(text);
    console.log('Result:  ', JSON.stringify(result, null, 2));
    console.log('---');
  }
}

main();
