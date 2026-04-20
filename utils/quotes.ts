const API_KEY = process.env.EXPO_PUBLIC_QUOTES_API_KEY ?? '';
const ENDPOINT = 'https://api.api-ninjas.com/v1/quotes';

export type Quote = { quote: string; author: string };

export async function fetchMotivationalQuote(): Promise<Quote> {
  if (!API_KEY) throw new Error('API key not set — restart the Expo server after adding .env');

  const response = await fetch(ENDPOINT, {
    headers: { 'X-Api-Key': API_KEY },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = (await response.json()) as { quote: string; author: string }[];
  if (!data.length) throw new Error('No quote returned');

  return { quote: data[0].quote, author: data[0].author };
}
