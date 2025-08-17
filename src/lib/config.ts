import * as dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const EnvSchema = z.object({
  EMAIL: z.string().min(3),
  PASSWORD: z.string().min(1),
  LOGIN_URL: z.string().url().default('https://blogmura.com/'),
  URLS_FILE: z.string().default('urls.txt'),
  HEADLESS: z
    .string()
    .default('true')
    .transform((v) => ['1', 'true', 'yes'].includes(v.toLowerCase())),
  WAIT_MS: z
    .string()
    .default('5000')
    .transform((v) => Number.parseInt(v, 10)),
  SELECTOR_EMAIL: z.string().default('input[name="email"]'),
  SELECTOR_PASSWORD: z.string().default('input[name="password"]'),
  SELECTOR_LOGIN: z.string().default('.re-button-submit-small'),
});

export type AppConfig = z.infer<typeof EnvSchema>;

export function loadConfig(): AppConfig {
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('環境変数エラー', parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment variables');
  }
  return parsed.data;
}
