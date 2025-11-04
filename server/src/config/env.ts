import { config } from 'dotenv';
import { z } from 'zod';

config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .default('info'),
  CORS_ORIGIN: z.string().optional(),
  AMADEUS_API_KEY: z.string().optional(),
  AMADEUS_API_SECRET: z.string().optional(),
  SABRE_CLIENT_ID: z.string().optional(),
  SABRE_CLIENT_SECRET: z.string().optional(),
  RAPIDAPI_KEY: z.string().optional(),
  CARD_OFFER_FEED_URL: z.string().optional(),
  LOYALTY_POINT_VALUATION_USD: z.coerce.number().optional()
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error('Invalid environment configuration', result.error.flatten());
  throw new Error('Environment validation failed. Check server/.env values.');
}

export const env = result.data;
export type Env = typeof env;
