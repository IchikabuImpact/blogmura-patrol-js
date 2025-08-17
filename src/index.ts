import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs/promises';
import { loadConfig } from './lib/config.js';
import { loginBlogMura } from './lib/blogmura.js';
import { sleep } from './utils/sleep.js';

async function main() {
  const cfg = loadConfig();
  const browser: Browser = await chromium.launch({ headless: cfg.HEADLESS });
  const ctx = await browser.newContext();
  const page: Page = await ctx.newPage();

  try {
    await loginBlogMura(page, cfg);

    const raw = await fs.readFile(cfg.URLS_FILE, 'utf-8');
    const urls = raw
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('#'));

    console.log(`巡回開始: ${urls.length} URLs, 待機 ${cfg.WAIT_MS}ms`);
    for (const [i, url] of urls.entries()) {
      console.log(`[${i + 1}/${urls.length}] ${url}`);
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
      await sleep(cfg.WAIT_MS);
    }

    console.log('巡回完了');
  } finally {
    await page.close();
    await ctx.close();
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
